import { useMemo, useState } from 'react'
import { Bar as RBar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Check, QrCode } from 'lucide-react'
import { DB, TODAY, type Rec } from '../lib/data'
import { compact } from '../lib/fin'
import { useApp } from '../lib/store'
import { Bar, TablePage, useScoped } from '../components/engine'
import { Badge, Btn, Callout, Card, Empty, Kpi, PageHead, RecLink, Tabs, baht, cx } from '../components/ui'
import { FormPage, IntegrationsPage, NotificationsPage, RecordsModal, ReportsPage, SettingsPage, ValidationPage, GRAY, RUBY } from './common'
import { TABLES } from './tables'

const sum = (a: Rec[], k: string) => a.reduce((s, r) => s + (r[k] || 0), 0)

function Dashboard() {
  const { go } = useApp()
  const att = useScoped('ATT')
  const mpr = useScoped('MPR')
  const prl = useScoped('PRL')
  const sla = useScoped('SLA')
  const val = useScoped('VAL', (r) => r.div === 'Workforce' && r.status !== 'ปิดแล้ว')
  const [m, setM] = useState<{ title: string; rows: Rec[] } | null>(null)
  const open = (title: string, rows: Rec[]) => setM({ title, rows })
  const bad = att.filter((r) => ['ขาด OUT', 'ซ้ำ', 'ข้อพิพาท'].includes(r.status))
  const short = mpr.filter((r) => r.filled < r.requested)
  const dupPay = prl.filter((r) => r.status === 'ถูกบล็อก')
  const hubs = DB.HUB.rows.map((h) => ({ n: h.name.replace('ฮับ', ''), sla: h.sla }))
  return (
    <div>
      <PageHead title="แดชบอร์ด Workforce" desc="SPT · TPL — กำลังคน เวลาทำงาน เงินเดือน และ SLA ของวันนี้ (ข้อมูลสาธิต)" right={<Btn v="pri" onClick={() => go('/workforce/mpr')}>คำขอกำลังคน</Btn>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="พนักงานที่ใช้งาน" value={DB.EMP.rows.filter((e) => e.status === 'ทำงาน').length} onClick={() => open('พนักงาน', DB.EMP.rows)} />
        <Kpi label="เวลาทำงานผิดปกติ" value={bad.length} tone="bad" sub="ขาด OUT · ซ้ำ · ข้อพิพาท" onClick={() => open('เวลาผิดปกติ', bad)} />
        <Kpi label="คำขอที่จัดคนไม่ครบ" value={short.length} tone="warn" sub={`ขาด ${sum(short, 'requested') - sum(short, 'filled')} คน`} onClick={() => open('กำลังคนไม่พอ', short)} />
        <Kpi label="เงินเดือนถูกบล็อก (ซ้ำ)" value={dupPay.length} tone="bad" onClick={() => open('เงินเดือนซ้ำ', dupPay)} />
        <Kpi label="เงินเดือนรออนุมัติ" value={prl.filter((r) => r.status === 'รออนุมัติ').length} tone="warn" sub={baht(prl.filter((r) => r.status === 'รออนุมัติ').reduce((s, r) => s + r.net, 0))} onClick={() => open('เงินเดือนรออนุมัติ', prl.filter((r) => r.status === 'รออนุมัติ'))} />
        <Kpi label="SLA เฉลี่ย" value={(sla.length ? sla.reduce((s, r) => s + r.actual, 0) / sla.length : 0).toFixed(1) + '%'} tone="ok" onClick={() => open('SLA', sla)} />
        <Kpi label="ผู้สมัครในไปป์ไลน์" value={DB.RCT.rows.length} onClick={() => go('/workforce/recruit')} />
        <Kpi label="ข้อยกเว้นที่ยังไม่ปิด" value={val.length} tone="warn" onClick={() => go('/workforce/validation')} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="SLA รายฮับ (%)" className="xl:col-span-2"><div className="h-60"><ResponsiveContainer><BarChart data={hubs}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={11} /><YAxis domain={[80, 100]} tickLine={false} axisLine={false} width={32} /><Tooltip /><ReferenceLine y={95} stroke="#18181B" strokeDasharray="4 4" label={{ value: 'เป้า 95%', fontSize: 11, position: 'insideTopRight' }} /><RBar dataKey="sla" name="SLA" radius={[4, 4, 0, 0]}>{hubs.map((h, i) => <Cell key={i} fill={h.sla < 95 ? '#F59E0B' : RUBY} />)}</RBar></BarChart></ResponsiveContainer></div></Card>
        <Card title="ต้องดำเนินการ" pad={false}><ul className="divide-y divide-line text-[13px]">
          {val.slice(0, 6).map((v) => <li key={v.id} className="flex items-start justify-between gap-2 px-4 py-2.5"><div className="min-w-0"><div className="truncate font-medium">{v.rule}</div><div className="text-[12px] text-mute"><RecLink id={v.ref} /> · {v.company}</div></div><Badge s={v.severity} /></li>)}
          {!val.length && <li className="p-4 text-mute">ไม่มีรายการค้าง</li>}</ul></Card>
      </div>
      <p className="mt-3 text-[12px] text-mute">วันที่ในระบบสาธิต: {TODAY} · รายได้วางบิลรวม ฿{compact(sum(DB.WBL.rows, 'amount'))}</p>
      {m && <RecordsModal title={m.title} rows={m.rows} onClose={() => setM(null)} />}
    </div>
  )
}

const STAGES = ['สมัคร', 'คัดกรอง', 'สัมภาษณ์', 'เสนอจ้าง', 'รับเข้าทำงาน']
function Recruit() {
  const { updateRecord, toast, tick } = useApp()
  void tick
  const rows = useScoped('RCT')
  const [view, setView] = useState('board')
  const stages = [...new Set([...STAGES, ...rows.map((r) => r.status)])]
  return (
    <div>
      <PageHead title="Recruitment Pipeline" desc="ผู้สมัครตามขั้นตอนการสรรหา — ย้ายขั้นเพื่ออัปเดตสถานะ" />
      <Tabs tabs={[{ id: 'board', label: 'บอร์ด' }, { id: 'table', label: 'ตาราง' }]} value={view} onChange={setView} />
      <div className="pt-4">
        {view === 'table' ? <TablePage prefix="RCT" title="ผู้สมัครทั้งหมด" addLabel="เพิ่มผู้สมัคร" filters={['company', 'hub', 'source', 'status']} cols={[{ key: 'date', label: 'วันที่', kind: 'date' }, { key: 'name', label: 'ชื่อ' }, { key: 'company', label: 'บริษัท' }, { key: 'position', label: 'ตำแหน่ง' }, { key: 'hub', label: 'ฮับ' }, { key: 'source', label: 'ช่องทาง' }, { key: 'status', label: 'สถานะ', kind: 'badge' }]} /> : (
          <div className="scroll flex gap-3 overflow-x-auto pb-2">
            {stages.map((s, si) => (
              <div key={s} className="w-64 shrink-0 rounded-xl bg-paper p-2.5"><div className="mb-2 flex items-center justify-between px-1 text-[13px] font-semibold">{s}<span className="rounded-full bg-white px-2 text-[12px] text-mute">{rows.filter((r) => r.status === s).length}</span></div>
                <div className="space-y-2">{rows.filter((r) => r.status === s).map((r) => (
                  <div key={r.id} className="rounded-lg border border-line bg-white p-3 text-[13px]"><RecLink id={r.id} /><div className="mt-1 font-medium">{r.name}</div><div className="text-[12px] text-mute">{r.position} · {r.company} · {r.source}</div>
                    {si < stages.length - 1 && <Btn sm className="mt-2" onClick={() => { updateRecord(r.id, { status: stages[si + 1] }); toast(`ย้าย ${r.name} ไป “${stages[si + 1]}”`) }}>ย้ายไป {stages[si + 1]}</Btn>}</div>))}
                  {!rows.some((r) => r.status === s) && <div className="px-1 py-3 text-[12px] text-mute">ไม่มีผู้สมัคร</div>}</div></div>))}
          </div>
        )}
      </div>
    </div>
  )
}

function Shifts() {
  return <TablePage prefix="SHF" title="แผนกะรายวัน" desc="เทียบกำลังคนตามแผนกับที่มาจริงต่อกะ — ขาดคนจะเตือน" noAdd filters={['company', 'hub', 'status']}
    kpis={(r) => [{ label: 'กะทั้งหมด', value: r.length }, { label: 'แผน', value: sum(r, 'planned') }, { label: 'จริง', value: sum(r, 'actual') }, { label: 'ขาดคน', value: Math.max(0, sum(r, 'planned') - sum(r, 'actual')), tone: 'bad', pick: (x) => x.actual < x.planned }]}
    cols={[{ key: 'date', label: 'วันที่', kind: 'date' }, { key: 'company', label: 'บริษัท' }, { key: 'hub', label: 'ฮับ' }, { key: 'shift', label: 'กะ' }, { key: 'planned', label: 'แผน', kind: 'num' }, { key: 'actual', label: 'จริง', render: (r) => <Bar v={r.actual} max={r.planned} tone={r.actual < r.planned ? 'bg-warn' : 'bg-ok'} /> }, { key: 'gap', label: 'ขาด', render: (r) => <span className={cx('tnum', r.actual < r.planned && 'font-semibold text-bad')}>{Math.max(0, r.planned - r.actual)}</span> }, { key: 'status', label: 'สถานะ', kind: 'badge' }]} />
}

function QrPage() {
  const { addRecord, toast } = useApp()
  const hub = DB.HUB.rows
  const [h, setH] = useState(hub[0]?.id ?? '')
  const gen = () => { const hh = hub.find((x) => x.id === h)!; addRecord('QRC', { company: hh.company, hub: hh.id, name: `QR ${hh.name} (ใหม่)`, scans: 0, lastScan: '-', status: 'ใช้งาน' }); toast(`สร้าง QR สำหรับ ${hh.name} แล้ว`) }
  return <TablePage {...TABLES.qr} extraActions={<span className="flex items-center gap-2"><select value={h} onChange={(e) => setH(e.target.value)} className="h-9 rounded-lg border border-line bg-white px-2 text-sm" aria-label="เลือกฮับ">{hub.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><Btn v="pri" onClick={gen}><QrCode size={14} />สร้าง QR</Btn></span>} />
}

const STEPS = ['เตรียมข้อมูล', 'ตรวจสอบ', 'อนุมัติ', 'จ่ายเงิน']
function Payroll({ step }: { step: 0 | 1 | 2 }) {
  const { go } = useApp()
  const rows = useScoped('PRL')
  const dup = rows.filter((r) => r.status === 'ถูกบล็อก')
  const base = step === 2 ? TABLES['payroll-approve'] : {
    ...TABLES['payroll-approve'], title: step === 0 ? 'เตรียมเงินเดือน' : 'ตรวจสอบเงินเดือน',
    desc: step === 0 ? 'รวมค่าแรงรายวัน OT และรายการหัก ก่อนส่งตรวจสอบ' : 'ตรวจเงินเดือนซ้ำ ค่าแรงต่ำกว่าขั้นต่ำ และผลต่างจากบันทึกเวลา',
    tabs: [{ id: 'all', label: 'ทั้งหมด', where: () => true }, { id: 'b', label: 'ถูกบล็อก', where: (r: Rec) => r.status === 'ถูกบล็อก' }],
  }
  return (
    <div>
      <div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-line bg-white p-2">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => i < 3 && go(['/workforce/payroll-prep', '/workforce/payroll-validate', '/workforce/payroll-approve'][i])} className={cx('flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px]', i === step ? 'bg-ruby text-white' : i < step ? 'text-ok' : 'text-mute')}>
            <span className={cx('grid size-5 place-items-center rounded-full text-[11px]', i === step ? 'bg-white/25' : 'bg-paper')}>{i < step ? <Check size={12} /> : i + 1}</span>{s}</button>
        ))}
      </div>
      {dup.length > 0 && <div className="mb-4"><Callout tone="bad" title="พบเงินเดือนซ้ำ — ถูกบล็อกอัตโนมัติ">{dup.map((d) => <span key={d.id} className="mr-2"><RecLink id={d.id} /></span>)} ต้องแก้ไขหรือปฏิเสธก่อนเข้าสู่ขั้นตอนอนุมัติ</Callout></div>}
      <TablePage {...base} />
    </div>
  )
}

function SlaPage() {
  const rows = useScoped('SLA')
  const data = useMemo(() => {
    const m = new Map<string, { n: string; t: number; a: number; c: number }>()
    rows.forEach((r) => { const x = m.get(r.hub) ?? { n: r.hub, t: r.target, a: 0, c: 0 }; x.a += r.actual; x.c++; m.set(r.hub, x) })
    return [...m.values()].map((x) => ({ n: x.n, ผลจริง: +(x.a / x.c).toFixed(1), เป้า: x.t }))
  }, [rows])
  return (
    <TablePage {...TABLES.sla} top={() => (
      <Card title="SLA เฉลี่ยเทียบเป้า รายฮับ" className="mb-4">{data.length === 0 ? <Empty /> : <div className="h-56"><ResponsiveContainer><LineChart data={data}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} /><YAxis domain={[85, 100]} tickLine={false} axisLine={false} width={32} /><Tooltip /><Legend /><Line dataKey="เป้า" stroke={GRAY} strokeDasharray="4 4" dot={false} /><Line dataKey="ผลจริง" stroke={RUBY} strokeWidth={2} /></LineChart></ResponsiveContainer></div>}</Card>
    )} />
  )
}

export default function WorkforcePage({ page }: { page: string }) {
  switch (page) {
    case 'dashboard': return <Dashboard />
    case 'emp-form': return <FormPage prefix="EMP" back="/workforce/employees" title="เพิ่ม / แก้ไขพนักงาน" desc="บันทึกข้อมูลพนักงาน — ระบบตรวจรหัสพนักงานซ้ำ ค่าแรงขั้นต่ำ และรูปแบบเบอร์โทร" />
    case 'recruit': return <Recruit />
    case 'shifts': return <Shifts />
    case 'qr': return <QrPage />
    case 'payroll-prep': return <Payroll step={0} />
    case 'payroll-validate': return <Payroll step={1} />
    case 'payroll-approve': return <Payroll step={2} />
    case 'sla': return <SlaPage />
    case 'reports': return <ReportsPage app="workforce" />
    case 'settings': return <SettingsPage app="workforce" />
    case 'validation': return <ValidationPage division="Workforce" />
    case 'notifications': return <NotificationsPage />
    case 'integrations': return <IntegrationsPage />
    default: {
      const cfg = TABLES[page]
      return cfg ? <TablePage {...cfg} /> : <Callout tone="warn">ไม่พบหน้า {page}</Callout>
    }
  }
}
