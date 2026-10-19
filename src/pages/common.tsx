import { Fragment, useMemo, useRef, useState } from 'react'
import { Bar as RBar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronRight, Download, FileSpreadsheet, Play, RefreshCw, Save, Upload } from 'lucide-react'
import { DB, INTEGRATIONS, ROLES, TODAY, findRec, type Rec } from '../lib/data'
import { compute } from '../lib/fin'
import { useApp } from '../lib/store'
import { C, FormModal, TablePage } from '../components/engine'
import { Badge, Btn, Callout, Card, Empty, Field, Modal, PageHead, RecLink, Tabs, baht, cx, exportCsv, fmtDate, inputCls } from '../components/ui'

export const RUBY = '#E6005C'
export const INK = '#18181B'
export const GRAY = '#A1A1AA'

/* ───────── Records modal (KPI drill-down) ───────── */
export function RecordsModal({ title, rows, onClose }: { title: string; rows: Rec[]; onClose: () => void }) {
  const { openRec } = useApp()
  return (
    <Modal wide title={title} onClose={onClose} footer={<><Btn onClick={() => exportCsv('drilldown', rows, ['id', 'company', 'date', 'status'])}><Download size={14} />ส่งออก</Btn><Btn onClick={onClose}>ปิด</Btn></>}>
      {rows.length === 0 ? <Empty /> : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-3 py-2">รหัส</th><th className="px-3 py-2">รายการ</th><th className="px-3 py-2">บริษัท</th><th className="px-3 py-2 text-right">จำนวนเงิน</th><th className="px-3 py-2">สถานะ</th></tr></thead>
            <tbody>{rows.map((r) => { const f = findRec(r.id); return (
              <tr key={r.id} onClick={() => { onClose(); openRec(r.id) }} className="cursor-pointer border-t border-line hover:bg-ruby-soft/60">
                <td className="px-3 py-2"><span className="mono text-ruby">{r.id}</span></td><td className="px-3 py-2">{f?.ds.title(r)}</td><td className="px-3 py-2">{r.company}</td>
                <td className="tnum px-3 py-2 text-right">{baht(r.amount ?? r.net ?? r.revenue ?? r.total)}</td><td className="px-3 py-2">{r.status && <Badge s={r.status} />}</td></tr>) })}</tbody></table>
        </div>
      )}
    </Modal>
  )
}

/* ───────── Validation center ───────── */
const VAL_FLOW = ['ใหม่', 'ผ่านการตรวจสอบอัตโนมัติ', 'เตือน', 'ถูกบล็อก', 'มอบหมายตรวจสอบ', 'แก้ไขแล้ว', 'ตรวจซ้ำ', 'อนุมัติแล้ว', 'ปิดแล้ว']
DB.VAL.rows.forEach((r) => { if (r.stage) { r.status = r.stage; delete r.stage } })
DB.VAL.actions = [
  { label: 'มอบหมายให้ตรวจสอบ', to: 'มอบหมายตรวจสอบ', tone: 'pri', when: (r) => ['ใหม่', 'เตือน', 'ถูกบล็อก', 'ผ่านการตรวจสอบอัตโนมัติ'].includes(r.status) },
  { label: 'บันทึกว่าแก้ไขแล้ว', to: 'แก้ไขแล้ว', tone: 'ok', when: (r) => r.status === 'มอบหมายตรวจสอบ' },
  { label: 'ปฏิเสธรายการ', to: 'ปฏิเสธ', tone: 'bad', reason: true, when: (r) => r.status === 'มอบหมายตรวจสอบ' },
  { label: 'ตรวจสอบซ้ำ (Revalidate)', to: 'ตรวจซ้ำ', tone: 'pri', when: (r) => r.status === 'แก้ไขแล้ว' },
  { label: 'อนุมัติ', to: 'อนุมัติแล้ว', tone: 'ok', when: (r) => r.status === 'ตรวจซ้ำ', guard: (r, role) => {
    const f = findRec(r.ref)
    if (f && (f.rec.validation === 'ถูกบล็อก' || ['ถูกบล็อก', 'ซ้ำ'].includes(f.rec.status))) return `รายการต้นทาง ${r.ref} ยังถูกบล็อก — ผลการตรวจซ้ำยังไม่ผ่าน`
    return role.perms.includes('*') || role.perms.includes('approve') || role.perms.includes('audit') ? null : 'ไม่มีสิทธิ์อนุมัติ'
  } },
  { label: 'ปิดงาน', to: 'ปิดแล้ว', tone: 'ok', when: (r) => ['อนุมัติแล้ว', 'ปฏิเสธ'].includes(r.status) },
]
export function ValidationPage({ division }: { division?: 'Transport' | 'Workforce' }) {
  const [open, setOpen] = useState(false)
  return (
    <TablePage prefix="VAL" title="Data Validation & Reconciliation Center" noAdd
      desc="ศูนย์รวมข้อยกเว้นจากกฎตรวจสอบอัตโนมัติ — ดูเหตุผลที่ไม่ผ่าน มอบหมาย แก้ไข ตรวจซ้ำ อนุมัติ และปิดงานพร้อม Audit History"
      where={(r) => !division || r.div === division}
      filters={['severity', 'company', 'status', 'source']}
      tabs={[{ id: 'all', label: 'ทั้งหมด', where: () => true }, { id: 'open', label: 'ยังไม่ปิด', where: (r) => r.status !== 'ปิดแล้ว' }, { id: 'block', label: 'ถูกบล็อก', where: (r) => r.status === 'ถูกบล็อก' }, { id: 'mine', label: 'มอบหมายแล้ว', where: (r) => r.status === 'มอบหมายตรวจสอบ' }]}
      kpis={(rows) => [
        { label: 'ข้อยกเว้นทั้งหมด', value: rows.length },
        { label: 'ถูกบล็อก', value: rows.filter((r) => r.status === 'ถูกบล็อก').length, tone: 'bad', pick: (r) => r.status === 'ถูกบล็อก' },
        { label: 'ความรุนแรงสูง', value: rows.filter((r) => r.severity === 'สูง').length, tone: 'warn', pick: (r) => r.severity === 'สูง' },
        { label: 'ผลกระทบทางการเงิน', value: baht(rows.filter((r) => r.status !== 'ปิดแล้ว').reduce((s, r) => s + r.impact, 0)), sub: 'ยังไม่ปิด' },
        { label: 'ปิดแล้ว', value: rows.filter((r) => r.status === 'ปิดแล้ว').length, tone: 'ok' },
      ]}
      top={(rows) => (
        <Card className="mb-4" title="Workflow การตรวจสอบ" right={<Btn sm onClick={() => setOpen(true)}>ดูขั้นตอน</Btn>}>
          <div className="scroll flex gap-1.5 overflow-x-auto">
            {VAL_FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5"><div className="min-w-[110px] rounded-lg bg-paper px-3 py-2"><div className="tnum text-lg font-semibold">{rows.filter((r) => r.status === s).length}</div><div className="whitespace-nowrap text-[11px] text-mute">{s}</div></div>{i < VAL_FLOW.length - 1 && <ChevronRight size={14} className="text-zinc-300" />}</div>
            ))}
          </div>
        </Card>
      )}
      cols={[C('rule', 'กฎตรวจสอบ'), C('source', 'ระบบต้นทาง'), C('ref', 'รายการอ้างอิง'), C('company', 'บริษัท'), C('owner', 'ผู้รับผิดชอบ'), C('severity', 'ความรุนแรง', 'badge'), C('reason', 'เหตุผลที่ไม่ผ่าน', undefined, { render: (r) => <span className="line-clamp-2 max-w-[280px]">{r.reason}</span> }), C('impact', 'ผลกระทบ', 'money'), C('status', 'สถานะ', 'badge')]} />
  )
}

/* ───────── Notifications ───────── */
const EVENTS = ['เที่ยววิ่งผิดปกติ', 'ขอน้ำมันเกินมาตรฐาน', 'เสี่ยงจ่ายซ้ำ', 'เอกสารเที่ยววิ่งไม่ครบ', 'กำลังคนไม่พอ', 'ไม่มีเวลาเข้า-ออกงาน', 'ข้อมูลลูกค้าไม่ตรง', 'เงินเดือนซ้ำ', 'รออนุมัติ', 'คำขอถูกปฏิเสธ', 'กระทบยอดล้มเหลว']
export function NotificationsPage() {
  const { toast, tick } = useApp()
  const [tab, setTab] = useState('inbox')
  const [set, setSet] = useState(() => Object.fromEntries(EVENTS.map((e, i) => [e, { app: true, line: i % 3 !== 2, min: i % 2 ? 'กลาง' : 'สูง' }])))
  const [map, setMap] = useState(() => Object.fromEntries(EVENTS.map((e, i) => [e, ['ผู้จัดการขนส่ง', 'ควบคุมต้นทุน', 'การเงิน', 'ผู้จัดการ Workforce'][i % 4]])))
  return (
    <div>
      <PageHead title="ศูนย์การแจ้งเตือน" desc="แจ้งเตือนภายในแอป พร้อมอินเทอร์เฟซพร้อมใช้งานสำหรับ LINE (ยังไม่เชื่อมต่อ — โหมดสาธิต)" />
      <Tabs tabs={[{ id: 'inbox', label: 'กล่องแจ้งเตือน' }, { id: 'settings', label: 'ตั้งค่าเหตุการณ์' }, { id: 'map', label: 'ผู้รับ (Recipient mapping)' }]} value={tab} onChange={setTab} />
      <div className="pt-4">
        {tab === 'inbox' && <Inbox key={tick} />}
        {tab === 'settings' && (
          <Card title="เหตุการณ์ × ช่องทาง" right={<Btn v="pri" sm onClick={() => toast('บันทึกการตั้งค่าแจ้งเตือนแล้ว')}><Save size={14} />บันทึก</Btn>} pad={false}>
            <Callout tone="warn"><span>LINE Messaging API ยังไม่ได้เชื่อมต่อ — การตั้งค่าจะมีผลเมื่อเชื่อมต่อแล้ว</span></Callout>
            <table className="mt-3 w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">เหตุการณ์</th><th className="px-4 py-2">ในแอป</th><th className="px-4 py-2">LINE</th><th className="px-4 py-2">ความรุนแรงขั้นต่ำ</th></tr></thead>
              <tbody>{EVENTS.map((e) => (
                <tr key={e} className="border-t border-line"><td className="px-4 py-2 font-medium">{e}</td>
                  <td className="px-4 py-2"><input type="checkbox" className="accent-[#E6005C]" checked={set[e].app} onChange={(x) => setSet({ ...set, [e]: { ...set[e], app: x.target.checked } })} aria-label={`${e} ในแอป`} /></td>
                  <td className="px-4 py-2"><input type="checkbox" className="accent-[#E6005C]" checked={set[e].line} onChange={(x) => setSet({ ...set, [e]: { ...set[e], line: x.target.checked } })} aria-label={`${e} LINE`} /></td>
                  <td className="px-4 py-2"><select className={cx(inputCls(), 'w-28')} value={set[e].min} onChange={(x) => setSet({ ...set, [e]: { ...set[e], min: x.target.value } })}><option>ต่ำ</option><option>กลาง</option><option>สูง</option></select></td></tr>))}</tbody></table>
          </Card>
        )}
        {tab === 'map' && (
          <Card title="ผู้รับตามเหตุการณ์" right={<Btn v="pri" sm onClick={() => toast('บันทึกผู้รับแล้ว')}><Save size={14} />บันทึก</Btn>} pad={false}>
            <table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">เหตุการณ์</th><th className="px-4 py-2">ผู้รับ (บทบาท)</th><th className="px-4 py-2">LINE Group ID</th></tr></thead>
              <tbody>{EVENTS.map((e) => (
                <tr key={e} className="border-t border-line"><td className="px-4 py-2 font-medium">{e}</td>
                  <td className="px-4 py-2"><select className={cx(inputCls(), 'w-52')} value={map[e]} onChange={(x) => setMap({ ...map, [e]: x.target.value })}>{ROLES.map((r) => <option key={r.id}>{r.th}</option>)}</select></td>
                  <td className="px-4 py-2"><input className={cx(inputCls(), 'mono w-56')} placeholder="ยังไม่ได้ตั้งค่า (สาธิต)" /></td></tr>))}</tbody></table>
          </Card>
        )}
      </div>
    </div>
  )
}
function Inbox() {
  return (
    <TablePage prefix="NTF" title="กล่องแจ้งเตือน" noAdd filters={['severity', 'type', 'company', 'line']}
      cols={[C('severity', 'ความรุนแรง', 'badge'), C('type', 'เหตุการณ์'), C('company', 'บริษัท'), C('ref', 'รายการอ้างอิง'), C('owner', 'ผู้รับผิดชอบ'), C('time', 'เวลา'), C('line', 'LINE', 'badge'), C('msg', 'ข้อความ'), C('act', 'การดำเนินการ', undefined, { render: (r) => <RecLink id={r.ref} /> })]} />
  )
}

/* ───────── Integrations ───────── */
export function IntegrationsPage() {
  const { toast } = useApp()
  const [sel, setSel] = useState<Rec | null>(null)
  const [tab, setTab] = useState('list')
  const [key, setKey] = useState('')
  const [err, setErr] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const [testing, setTesting] = useState(false)
  const rows = INTEGRATIONS
  const test = () => {
    if (!key.trim()) return setErr('กรุณากรอก API Key / Token')
    setErr(''); setTesting(true)
    setTimeout(() => { setTesting(false); toast('เชื่อมต่อไม่สำเร็จ: โหมดสาธิตไม่มีการเชื่อมต่อภายนอกจริง', 'bad') }, 900)
  }
  const onFile = (f?: File) => {
    if (!f) return
    f.text().then((t) => { const n = Math.max(0, t.split(/\r?\n/).filter(Boolean).length - 1); toast(`อ่านไฟล์ ${f.name}: พบ ${n} แถว (สาธิต — ยังไม่บันทึกลงระบบ)`, 'info') })
  }
  return (
    <div>
      <PageHead title="การเชื่อมต่อข้อมูล" desc="จัดการ Integration — ทุกรายการแสดงเป็น Demo / ยังไม่เชื่อมต่อ จนกว่าจะตั้งค่าและทดสอบสำเร็จ" right={<><input ref={file} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /><Btn v="pri" onClick={() => file.current?.click()}><Upload size={15} />นำเข้า CSV</Btn></>} />
      <Tabs tabs={[{ id: 'list', label: 'การเชื่อมต่อ' }, { id: 'map', label: 'Field Mapping' }, { id: 'log', label: 'Error Logs' }]} value={tab} onChange={setTab} />
      <div className="pt-4">
        {tab === 'list' && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((i) => (
              <Card key={i.id}>
                <div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{i.name}</div><div className="text-[12px] text-mute">{i.purpose}</div></div><Badge s={i.status} /></div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]"><div><dt className="text-mute">ซิงก์ล่าสุด</dt><dd className="font-medium">{i.last}</dd></div><div><dt className="text-mute">นำเข้า</dt><dd className="tnum font-medium">{i.imported}</dd></div><div><dt className="text-mute">ล้มเหลว</dt><dd className="tnum font-medium">{i.failed}</dd></div></dl>
                <div className="mt-3 flex gap-2">
                  <Btn sm onClick={() => { setSel(i); setKey(''); setErr('') }}>{i.name === 'Excel / CSV' ? 'ตั้งค่า' : 'เชื่อมต่อ'}</Btn>
                  <Btn sm onClick={() => toast(i.status.startsWith('Demo') ? `${i.name}: ยังไม่เชื่อมต่อ — ไม่มีงานให้ลองใหม่` : 'ไม่มีรายการล้มเหลว', 'info')}><RefreshCw size={13} />ลองใหม่</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
        {tab === 'map' && (
          <Card title="Field Mapping — Flash OSM → P.T.NEX (ตัวอย่าง)" pad={false}>
            <table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">ฟิลด์ต้นทาง</th><th className="px-4 py-2">ฟิลด์ปลายทาง</th><th className="px-4 py-2">การแปลงค่า</th></tr></thead>
              <tbody>{[['tracking_no', 'barcode', 'ตัดช่องว่าง + ตัวพิมพ์ใหญ่'], ['plate_no', 'vehicle.plate', 'ตรงตัว'], ['driver_phone', 'driver.phone', 'จัดรูปแบบ 0xx-xxx-xxxx'], ['staff_id', 'employee.custId', 'Map ตาม Customer Employee ID'], ['check_in', 'attendance.in', 'UTC+7 → HH:mm']].map((m) => (
                <tr key={m[0]} className="border-t border-line"><td className="mono px-4 py-2">{m[0]}</td><td className="mono px-4 py-2 text-ruby">{m[1]}</td><td className="px-4 py-2 text-mute">{m[2]}</td></tr>))}</tbody></table>
          </Card>
        )}
        {tab === 'log' && <Card><Empty title="ยังไม่มี Error Log" desc="ยังไม่มีการเชื่อมต่อจริง จึงไม่มีบันทึกการซิงก์ที่ล้มเหลว" /></Card>}
      </div>
      {sel && (
        <Modal title={`เชื่อมต่อ ${sel.name}`} onClose={() => setSel(null)} footer={<><Btn onClick={() => setSel(null)}>ปิด</Btn><Btn v="pri" onClick={test} disabled={testing}>{testing ? 'กำลังทดสอบ…' : 'ทดสอบการเชื่อมต่อ'}</Btn></>}>
          <div className="space-y-3">
            <Callout tone="info">โหมดสาธิต: ระบบจะไม่เชื่อมต่อบริการภายนอกจริง และจะไม่แสดงสถานะ “เชื่อมต่อแล้ว” ที่ไม่เป็นความจริง</Callout>
            <Field label="Endpoint / Workspace URL"><input className={inputCls()} placeholder="https://" /></Field>
            <Field label="API Key / Token" required error={err}><input type="password" value={key} onChange={(e) => { setKey(e.target.value); setErr('') }} className={inputCls(!!err)} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ───────── Profile ───────── */
export function Profile() {
  const { user, role, go } = useApp()
  const perms: Record<string, string> = { '*': 'ทุกสิทธิ์', exec: 'ผู้บริหาร', approve: 'อนุมัติ', ops: 'ปฏิบัติการขนส่ง', cost: 'ควบคุมต้นทุน', finance: 'การเงิน', billing: 'วางบิล', hr: 'ทรัพยากรบุคคล', attend: 'เวลาทำงาน', payroll: 'เงินเดือน', audit: 'ตรวจสอบ', view: 'ดูทุกหน้า (อ่านอย่างเดียว)', admin: 'ผู้ดูแลระบบ' }
  return (
    <div>
      <PageHead title="โปรไฟล์ผู้ใช้" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><div className="flex items-center gap-3"><div className="grid size-14 place-items-center rounded-full bg-ink text-xl font-semibold text-white">{user!.name[0]}</div><div><div className="text-lg font-semibold">{user!.name}</div><div className="text-[13px] text-mute">{user!.email}</div></div></div>
          <dl className="mt-4 space-y-2 text-[13px]"><div className="flex justify-between"><dt className="text-mute">บทบาท</dt><dd>{role.th} ({role.en})</dd></div><div className="flex justify-between"><dt className="text-mute">รหัสผู้ใช้</dt><dd className="mono">{user!.id}</dd></div><div className="flex justify-between"><dt className="text-mute">วงเงินอนุมัติ</dt><dd>{role.limit >= 1e9 ? 'ไม่จำกัด' : role.limit ? baht(role.limit) : 'ไม่มีสิทธิ์อนุมัติ'}</dd></div></dl>
          <Btn className="mt-4" onClick={() => go('/select-company')}>เปลี่ยนบริษัท / แอป</Btn></Card>
        <Card title="บริษัทและแอปที่เข้าถึงได้"><div className="flex flex-wrap gap-1.5">{role.companies.map((c) => <Badge key={c} s={c} tone="mute" />)}</div><div className="mt-3 flex flex-wrap gap-1.5">{role.apps.map((a) => <Badge key={a} s={a === 'exec' ? 'Executive Center' : a === 'transport' ? 'Transport ERP' : 'Workforce ERP'} tone="info" />)}</div></Card>
        <Card title="สิทธิ์การใช้งาน"><ul className="space-y-1.5 text-[13px]">{role.perms.map((p) => <li key={p} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-ruby" />{perms[p] ?? p}</li>)}</ul>
          <Callout tone="info"><span className="text-[12px]">ผู้ใช้ไม่สามารถอนุมัติคำขอของตนเองได้ ตามนโยบายบริษัท</span></Callout></Card>
      </div>
    </div>
  )
}

/* ───────── Reports ───────── */
export function ReportsPage({ app }: { app: 'exec' | 'transport' | 'workforce' }) {
  const { role, range, inRange, toast, tick } = useApp()
  const [open, setOpen] = useState<string | null>(null)
  const [modal, setModal] = useState<{ title: string; rows: Rec[] } | null>(null)
  const cos = (app === 'exec' ? ['SPV', 'TKQ', 'THRS', 'T&A', 'SPT', 'TPL'] : app === 'transport' ? ['SPV', 'TKQ', 'THRS', 'T&A'] : ['SPT', 'TPL']).filter((c) => role.companies.includes(c))
  const data = useMemo(() => cos.map((c) => ({ c, f: compute((r) => r.company === c && inRange(r.date)) })), [cos.join(), range, tick])
  const tot = useMemo(() => compute((r) => (!r.company || cos.includes(r.company)) && inRange(r.date)), [cos.join(), range, tick])
  const catalog = app === 'transport'
    ? ['สรุปเที่ยววิ่งและรายได้', 'กำไรต่อเที่ยว/ต่อคัน', 'การใช้น้ำมันเทียบมาตรฐาน', 'ค่าใช้จ่ายและงบประมาณ', 'การจ่ายเงินและกระทบยอดธนาคาร', 'ลูกหนี้ค้างชำระ']
    : app === 'workforce'
      ? ['สรุปกำลังคนตามคลัง', 'เวลาทำงานและข้อพิพาท', 'OT และค่าแรง', 'เงินเดือนและการจ่าย', 'SLA และค่าปรับ', 'กำไรตามลูกค้า']
      : ['งบรวมทั้งกลุ่ม', 'เปรียบเทียบรายบริษัท', 'ความเสี่ยงและข้อยกเว้น', 'ลูกหนี้/เจ้าหนี้', 'ประวัติการอนุมัติ', 'Audit Trail']
  const lines = (f: ReturnType<typeof compute>) => [
    { k: 'รายได้จากการวางบิล', v: f.revenue, rows: [...f.inv, ...f.wbl] },
    { k: 'ต้นทุนตรง (เที่ยววิ่ง + เงินเดือน)', v: -f.direct, rows: [...f.trips, ...f.prl] },
    { k: 'ค่าใช้จ่ายดำเนินงาน', v: -f.opex, rows: f.exp },
  ]
  return (
    <div>
      <PageHead title={app === 'exec' ? 'รายงานผู้บริหาร' : app === 'transport' ? 'รายงานขนส่ง' : 'รายงาน Workforce'} desc="รายงานรายบริษัทและรวมกลุ่ม คลิกบริษัทเพื่อเจาะดูรายการ และคลิกบรรทัดเพื่อดูเอกสารต้นทาง" right={<Btn onClick={() => { exportCsv('report-summary', data.map((d) => ({ id: d.c, revenue: d.f.revenue, direct: d.f.direct, opex: d.f.opex, net: d.f.net })), ['id', 'revenue', 'direct', 'opex', 'net']); toast('ส่งออกรายงานสรุปแล้ว') }}><Download size={15} />ส่งออกสรุป</Btn>} />
      <Card title="งบรวมรายบริษัท (Drill-down)" pad={false}>
        <table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">บริษัท</th><th className="px-4 py-2 text-right">รายได้</th><th className="px-4 py-2 text-right">ต้นทุนตรง</th><th className="px-4 py-2 text-right">ค่าใช้จ่าย</th><th className="px-4 py-2 text-right">กำไรสุทธิ</th><th className="px-4 py-2 text-right">อัตรากำไร</th></tr></thead>
          <tbody>
            {data.map(({ c, f }) => (
              <Fragment key={c}>
                <tr onClick={() => setOpen(open === c ? null : c)} className="cursor-pointer border-t border-line hover:bg-ruby-soft/50"><td className="px-4 py-2.5 font-semibold"><ChevronRight size={13} className={cx('mr-1 inline transition', open === c && 'rotate-90')} />{c}</td><td className="tnum px-4 py-2.5 text-right">{baht(f.revenue)}</td><td className="tnum px-4 py-2.5 text-right">{baht(f.direct)}</td><td className="tnum px-4 py-2.5 text-right">{baht(f.opex)}</td><td className={cx('tnum px-4 py-2.5 text-right font-medium', f.net < 0 && 'text-bad')}>{baht(f.net)}</td><td className="tnum px-4 py-2.5 text-right">{f.revenue ? Math.round((f.net / f.revenue) * 100) : 0}%</td></tr>
                {open === c && lines(f).map((l) => (
                  <tr key={c + l.k} onClick={() => setModal({ title: `${c} — ${l.k}`, rows: l.rows })} className="cursor-pointer border-t border-line bg-paper/60 text-mute hover:text-ruby"><td className="py-2 pl-10 pr-4">{l.k} <span className="text-[11px]">({l.rows.length} รายการ)</span></td><td colSpan={3} /><td className="tnum px-4 py-2 text-right">{baht(l.v)}</td><td /></tr>
                ))}
              </Fragment>
            ))}
            <tr className="border-t-2 border-ink bg-paper font-semibold"><td className="px-4 py-2.5">รวม{app === 'exec' ? 'ทั้งกลุ่ม' : 'ฝ่าย'}</td><td className="tnum px-4 py-2.5 text-right">{baht(tot.revenue)}</td><td className="tnum px-4 py-2.5 text-right">{baht(tot.direct)}</td><td className="tnum px-4 py-2.5 text-right">{baht(tot.opex)}</td><td className="tnum px-4 py-2.5 text-right">{baht(tot.net)}</td><td className="tnum px-4 py-2.5 text-right">{tot.revenue ? Math.round((tot.net / tot.revenue) * 100) : 0}%</td></tr>
          </tbody></table>
      </Card>
      <Card title="กำไรสุทธิรายบริษัท" className="mt-4">
        <div className="h-60"><ResponsiveContainer><BarChart data={data.map((d) => ({ n: d.c, net: Math.round(d.f.net / 1000) }))}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} unit="K" width={48} /><Tooltip formatter={(v) => [`฿${Number(v).toLocaleString()}K`, 'กำไรสุทธิ']} /><RBar dataKey="net" fill={RUBY} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>
      <h2 className="mb-2 mt-6 text-[15px] font-semibold">แคตตาล็อกรายงาน</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {catalog.map((r) => (
          <Card key={r}><div className="flex items-start gap-3"><FileSpreadsheet className="mt-0.5 text-ruby" size={20} /><div className="min-w-0 flex-1"><div className="font-medium">{r}</div><div className="text-[12px] text-mute">ข้อมูล ณ {fmtDate(TODAY)} · ข้อมูลสาธิต</div><div className="mt-3 flex gap-2"><Btn sm onClick={() => { exportCsv(r, data.map((d) => ({ id: d.c, revenue: d.f.revenue, net: d.f.net })), ['id', 'revenue', 'net']); toast(`ส่งออก “${r}” แล้ว`) }}><Download size={13} />CSV</Btn><Btn sm onClick={() => toast(`เตรียมไฟล์ PDF “${r}” (จำลอง)`, 'info')}>PDF</Btn></div></div></div></Card>
        ))}
      </div>
      {modal && <RecordsModal title={modal.title} rows={modal.rows} onClose={() => setModal(null)} />}
    </div>
  )
}

/* ───────── Settings ───────── */
export function SettingsPage({ app }: { app: 'transport' | 'workforce' }) {
  const { toast } = useApp()
  const [tab, setTab] = useState('rules')
  const [lim, setLim] = useState(() => Object.fromEntries(ROLES.map((r) => [r.id, r.limit >= 1e9 ? 1e9 : r.limit])))
  const [th, setTh] = useState(app === 'transport'
    ? { 'ขอน้ำมันเกินมาตรฐานได้ (%)': 15, 'ระยะเวลาเที่ยวผิดปกติ (เท่าของมาตรฐาน)': 2, 'ยอดค่าใช้จ่ายสูงผิดปกติ (เท่าของค่าเฉลี่ย)': 2.5, 'ยอดที่ต้องอนุมัติระดับ 2 (บาท)': 5000, 'ยอดที่ต้องอนุมัติระดับ 3 (บาท)': 20000 }
    : { 'ค่าแรงขั้นต่ำรายวัน (บาท)': 450, 'OT สูงสุดต่อวัน (ชม.)': 4, 'มาสายเกิน (นาที) นับเป็นสาย': 15, 'แจ้งคำขอกำลังคนล่วงหน้า (ชม.)': 24, 'ส่วนต่างยอมรับได้กับข้อมูลลูกค้า (นาที)': 10 })
  const [tg, setTg] = useState<Record<string, boolean>>(app === 'transport'
    ? { 'บล็อกการจ่ายซ้ำอัตโนมัติ': true, 'ตรวจบาร์โค้ดซ้ำข้ามบริษัท': true, 'ห้ามอนุมัติคำขอของตนเอง': true, 'บังคับแนบเอกสารก่อนส่งอนุมัติ': true }
    : { 'บล็อกเงินเดือนซ้ำอัตโนมัติ': true, 'ห้ามอนุมัติข้อพิพาทเวลาอัตโนมัติ': true, 'ห้ามอนุมัติคำขอของตนเอง': true, 'ตรวจกะซ้อนทับ': true })
  return (
    <div>
      <PageHead title={app === 'transport' ? 'ตั้งค่าระบบขนส่ง' : 'ตั้งค่าระบบ Workforce'} right={<Btn v="pri" onClick={() => toast('บันทึกการตั้งค่าแล้ว')}><Save size={15} />บันทึกการตั้งค่า</Btn>} />
      <Tabs tabs={[{ id: 'rules', label: 'เกณฑ์การตรวจสอบ' }, { id: 'appr', label: 'วงเงินอนุมัติตามบทบาท' }, { id: 'roles', label: 'บทบาทและสิทธิ์' }]} value={tab} onChange={setTab} />
      <div className="grid gap-4 pt-4 lg:grid-cols-2">
        {tab === 'rules' && (
          <>
            <Card title="ค่าเกณฑ์">{Object.entries(th).map(([k, v]) => <div key={k} className="mb-3"><Field label={k}><input type="number" value={v} onChange={(e) => setTh({ ...th, [k]: Number(e.target.value) })} className={inputCls()} /></Field></div>)}</Card>
            <Card title="นโยบายอัตโนมัติ">{Object.entries(tg).map(([k, v]) => <label key={k} className="flex items-center justify-between border-b border-line py-3 text-[13px] last:border-0">{k}<input type="checkbox" checked={v} onChange={(e) => setTg({ ...tg, [k]: e.target.checked })} className="size-4 accent-[#E6005C]" /></label>)}</Card>
          </>
        )}
        {tab === 'appr' && (
          <Card title="วงเงินอนุมัติสูงสุดต่อรายการ" className="lg:col-span-2" pad={false}>
            <table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">บทบาท</th><th className="px-4 py-2">สิทธิ์อนุมัติ</th><th className="px-4 py-2">วงเงิน (บาท)</th></tr></thead>
              <tbody>{ROLES.filter((r) => r.perms.includes('approve') || r.perms.includes('*')).map((r) => (
                <tr key={r.id} className="border-t border-line"><td className="px-4 py-2">{r.th}</td><td className="px-4 py-2 text-mute">ตามบริษัท: {r.companies.join(', ')}</td><td className="px-4 py-2"><input type="number" disabled={r.id === 'super' || r.id === 'group'} value={lim[r.id] >= 1e9 ? '' : lim[r.id]} placeholder="ไม่จำกัด" onChange={(e) => setLim({ ...lim, [r.id]: Number(e.target.value) })} className={cx(inputCls(), 'w-40')} /></td></tr>))}</tbody></table>
          </Card>
        )}
        {tab === 'roles' && (
          <Card title="บทบาททั้งหมด" className="lg:col-span-2" pad={false}>
            <table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">บทบาท</th><th className="px-4 py-2">แอป</th><th className="px-4 py-2">บริษัท</th><th className="px-4 py-2">สิทธิ์</th></tr></thead>
              <tbody>{ROLES.map((r) => <tr key={r.id} className="border-t border-line"><td className="px-4 py-2 font-medium">{r.th}<div className="text-[12px] font-normal text-mute">{r.en}</div></td><td className="px-4 py-2">{r.apps.join(', ')}</td><td className="px-4 py-2">{r.companies.join(', ')}</td><td className="px-4 py-2 text-mute">{r.perms.join(', ')}</td></tr>)}</tbody></table>
          </Card>
        )}
      </div>
    </div>
  )
}

/* ───────── Inline form page ───────── */
export function FormPage({ prefix, back, title, desc }: { prefix: string; back: string; title: string; desc: string }) {
  const { go, tick } = useApp()
  const [editId, setEditId] = useState('')
  const recs = DB[prefix].rows
  const editing = recs.find((r) => r.id === editId)
  return (
    <div>
      <PageHead title={title} desc={desc} right={<select value={editId} onChange={(e) => setEditId(e.target.value)} className={cx(inputCls(), 'w-64')} aria-label="เลือกรายการที่จะแก้ไข"><option value="">+ สร้างรายการใหม่</option>{recs.slice(0, 40).map((r) => <option key={r.id} value={r.id}>แก้ไข {r.id} — {DB[prefix].title(r)}</option>)}</select>} />
      <div className="max-w-3xl"><FormModal key={editId + tick * 0} prefix={prefix} editing={editing} inline onClose={() => go(back)} /></div>
    </div>
  )
}
export { Play }
