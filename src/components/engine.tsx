import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, ExternalLink, Pencil, Plus, Search, ShieldCheck, X } from 'lucide-react'
import { DB, ROLES, checksFor, findRec, isRecId, type Action, type Rec } from '../lib/data'
import { FORMS } from '../lib/forms'
import { useApp } from '../lib/store'
import { Badge, Btn, Callout, Card, DocPreview, Empty, Field, Kpi, Loading, Modal, PageHead, RecLink, Tabs, Timeline, ValidationList, baht, cell, cx, exportCsv, fmtDate, inputCls, useBusy } from './ui'

/* ───────── helpers ───────── */
const LABELS: Record<string, string> = {
  company: 'บริษัท', date: 'วันที่', status: 'สถานะ', route: 'เส้นทาง', routeId: 'รหัสเส้นทาง', customer: 'ลูกค้า', customerName: 'ชื่อลูกค้า', vehicle: 'ยานพาหนะ', driver: 'คนขับ', barcode: 'บาร์โค้ด', type: 'ประเภท', km: 'ระยะทาง (กม.)', hours: 'ใช้เวลา (ชม.)', stdHr: 'เวลามาตรฐาน (ชม.)', revenue: 'รายได้', cost: 'ต้นทุน', docs: 'เอกสาร', note: 'หมายเหตุ', plate: 'ทะเบียน', ownership: 'ความเป็นเจ้าของ', owner: 'เจ้าของ', odo: 'เลขไมล์', util: 'การใช้งาน (%)', docExp: 'เอกสารหมดอายุ', name: 'ชื่อ', license: 'ใบขับขี่', licExp: 'ใบขับขี่หมดอายุ', phone: 'โทรศัพท์', liters: 'ลิตร', advance: 'เงินเบิกล่วงหน้า', actual: 'ค่าใช้จ่ายจริง', settled: 'การสรุปยอด', requester: 'ผู้ขอ', trip: 'เที่ยววิ่ง', beneficiary: 'ผู้รับเงิน', bank: 'บัญชี/อ้างอิงธนาคาร', amount: 'จำนวนเงิน', budget: 'งบประมาณ', avg: 'ค่าเฉลี่ยย้อนหลัง', validation: 'ผลตรวจสอบ', doc: 'เอกสารแนบ', level: 'ระดับอนุมัติ', batch: 'ชุดการจ่าย', payment: 'การจ่ายเงิน', purpose: 'วัตถุประสงค์', trips: 'เที่ยววิ่งที่ครอบคลุม', alloc: 'ยอดที่จัดสรร (บาท)', kind: 'ชนิด', count: 'จำนวนรายการ', total: 'ยอดรวม', approver: 'ผู้อนุมัติ', desc: 'รายละเอียด', ref: 'อ้างอิง', pay: 'การจ่ายที่จับคู่', period: 'งวด', due: 'ครบกำหนด', paid: 'ชำระแล้ว', ours: 'ยอดของเรา', theirs: 'ยอดลูกค้า', diff: 'ผลต่าง', result: 'ผลการตรวจ', reason: 'เหตุผล', margin: 'อัตรากำไร (%)', profit: 'กำไร', hub: 'คลัง/ฮับ', headcount: 'จำนวนพนักงาน', sla: 'SLA (%)', role: 'ตำแหน่ง', custId: 'รหัสพนักงานฝั่งลูกค้า', wage: 'ค่าแรง/วัน', startDate: 'วันเริ่มงาน', employee: 'พนักงาน', exp: 'หมดอายุ', start: 'เริ่มสัญญา', end: 'สิ้นสุดสัญญา', requested: 'ขอ (คน)', filled: 'จัดได้ (คน)', shiftDate: 'วันที่ต้องการ', planned: 'แผน', current: 'ปัจจุบัน', gap: 'ส่วนต่าง', month: 'เดือน', shift: 'กะ', in: 'เวลาเข้า', out: 'เวลาออก', source: 'ช่องทาง', att: 'เวลาทำงาน', custEmp: 'รหัสฝั่งลูกค้า', oursHr: 'ชม. ของเรา', theirsHr: 'ชม. ลูกค้า', claim: 'ข้อเรียกร้อง', ourEvidence: 'หลักฐานของเรา', days: 'วัน', minutes: 'นาที', rate: 'อัตรา/ชม.', daily: 'ค่าแรงรายวัน', ot: 'OT/ชม.', effective: 'มีผลวันที่', gross: 'ค่าแรงรวม', deduction: 'หัก', net: 'สุทธิ', payroll: 'เงินเดือน', week: 'สัปดาห์', target: 'เป้าหมาย', shortage: 'ขาดคน', headcountDays: 'คน-วัน', invoice: 'ใบวางบิล', severity: 'ความรุนแรง', rule: 'กฎตรวจสอบ', impact: 'ผลกระทบทางการเงิน', stage: 'ขั้นตอน', div: 'ฝ่าย', time: 'เวลา', msg: 'ข้อความ', line: 'LINE', rejectReason: 'เหตุผลที่ปฏิเสธ', dupOf: 'ซ้ำกับ', fuel: 'คำขอน้ำมัน', station: 'สถานี', card: 'บัตร', expense: 'ค่าใช้จ่ายที่เกี่ยวข้อง', pref: 'กะที่ต้องการ', progress: 'ความคืบหน้า (%)', step: 'ขั้นตอนปัจจุบัน', position: 'ตำแหน่งที่สมัคร', scans: 'จำนวนสแกน', lastScan: 'สแกนล่าสุด', terms: 'เครดิต (วัน)', hubs: 'จำนวนฮับ', idPrefix: 'Prefix รหัสลูกค้า', from: 'ต้นทาง', to: 'ปลายทาง', stdFuel: 'น้ำมันมาตรฐาน (ลิตร)', approved: 'การอนุมัติเส้นทาง', rate_: 'อัตรา',
}
const MONEY = ['revenue', 'cost', 'amount', 'budget', 'avg', 'advance', 'actual', 'total', 'ours', 'theirs', 'diff', 'profit', 'gross', 'net', 'deduction', 'paid', 'impact', 'wage', 'daily', 'rate', 'ot']
const DATES = ['date', 'shiftDate', 'docExp', 'licExp', 'exp', 'start', 'end', 'effective', 'due', 'startDate']
const BADGE = ['status', 'validation', 'result', 'severity', 'stage', 'approved', 'docs']
const fmtVal = (k: string, v: any): ReactNode => {
  if (v === null || v === undefined || v === '') return <span className="text-mute">-</span>
  if (Array.isArray(v)) return <span className="flex flex-wrap gap-2">{v.map((x) => (isRecId(x) ? <RecLink key={x} id={x} /> : <span key={x}>{x}</span>))}</span>
  if (BADGE.includes(k) && typeof v === 'string') return <Badge s={v} />
  if (isRecId(v)) return <RecLink id={v} />
  if (typeof v === 'number' && MONEY.includes(k) && !(k === 'ot' && v < 5 && false)) return baht(v)
  if (DATES.includes(k)) return fmtDate(v)
  return String(v)
}

/* ───────── Column spec ───────── */
export type Col = { key: string; label: string; kind?: 'badge' | 'money' | 'date' | 'mono' | 'num' | 'pct' | 'bar'; render?: (r: Rec) => ReactNode; align?: 'right'; sort?: (r: Rec) => any }
export const C = (key: string, label: string, kind?: Col['kind'], extra: Partial<Col> = {}): Col => ({ key, label, kind, ...extra })

/* ───────── Record drawer ───────── */
export function RecordDrawer() {
  const { openId, openRec, go, role, user, setPending, audit, tick } = useApp()
  const [tab, setTab] = useState('detail')
  const [edit, setEdit] = useState(false)
  useEffect(() => { setTab('detail') }, [openId])
  useEffect(() => {
    if (!openId) return
    const f = (e: KeyboardEvent) => e.key === 'Escape' && !edit && openRec(null)
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  }, [openId, edit, openRec])
  const f = openId ? findRec(openId) : null
  const rec = f?.rec
  const ds = f?.ds
  const forward = useMemo(() => {
    if (!rec) return []
    const out: { id: string; via: string }[] = []
    Object.entries(rec).forEach(([k, v]) => {
      if (k === 'id') return
      ;(Array.isArray(v) ? v : [v]).forEach((x) => { if (isRecId(x) && findRec(x) && x !== rec.id) out.push({ id: x, via: LABELS[k] ?? k }) })
    })
    return out
  }, [rec, tick])
  const reverse = useMemo(() => {
    if (!rec) return []
    const out: { id: string }[] = []
    Object.values(DB).forEach((d) => d.rows.forEach((r) => {
      if (r.id === rec.id) return
      if (Object.entries(r).some(([k, v]) => k !== 'id' && (v === rec.id || (Array.isArray(v) && v.includes(rec.id))))) out.push({ id: r.id })
    }))
    return out.filter((o) => !forward.some((x) => x.id === o.id))
  }, [rec, forward, tick])
  if (!openId) return null
  if (!rec || !ds) return (
    <Drawer onClose={() => openRec(null)} title={openId}><Empty title="ไม่พบรายการ" desc="รายการนี้อาจถูกลบหรือยังไม่มีในข้อมูลสาธิต" /></Drawer>
  )
  const acts = (ds.actions ?? []).filter((a) => !a.when || a.when(rec))
  const hist = audit.filter((a) => a.id === rec.id)
  const rel = forward.length + reverse.length
  const valRows = DB.VAL.rows.filter((v) => v.ref === rec.id)
  const checks = rec.id.startsWith('EXP') ? checksFor(rec) : null
  const hasFlow = (ds.actions ?? []).some((a) => a.tone === 'ok' && a.label.includes('อนุมัติ'))
  const amount = rec.amount ?? rec.net ?? rec.total
  const levelRole = (n: number) => (n >= 3 ? 'ผู้บริหาร (Executive)' : n === 2 ? 'ผู้จัดการ' : 'หัวหน้างาน')
  const st = rec.status as string
  const done = ['อนุมัติแล้ว', 'จ่ายแล้ว', 'กระทบยอดแล้ว', 'ปิดแล้ว']
  const flow = [
    { title: 'ผู้ขอ', sub: rec.requester ? `${rec.requester} · ${fmtDate(rec.date)}` : fmtDate(rec.date), state: 'done' as const },
    { title: 'ตรวจสอบอัตโนมัติ', sub: rec.validation ?? 'ผ่านกฎตรวจสอบ', state: (rec.validation === 'ถูกบล็อก' || st === 'ถูกบล็อก' ? 'bad' : 'done') as 'bad' | 'done' },
    ...Array.from({ length: rec.level ?? 1 }, (_, i) => ({
      title: `อนุมัติระดับ ${i + 1} — ${levelRole(i + 1)}`,
      sub: st === 'ปฏิเสธ' ? `ปฏิเสธ: ${rec.rejectReason ?? ''}` : st === 'ส่งกลับแก้ไข' ? 'ส่งกลับแก้ไข' : done.includes(st) ? rec.approver ?? 'อนุมัติแล้ว' : 'รอดำเนินการ',
      state: (st === 'ปฏิเสธ' && i === 0 ? 'bad' : done.includes(st) ? 'done' : i === 0 && ['รออนุมัติ', 'รอตรวจสอบ'].includes(st) ? 'now' : 'todo') as 'bad' | 'done' | 'now' | 'todo',
    })),
    { title: 'จ่ายเงิน', sub: rec.batch ?? rec.payment ?? undefined, state: ['จ่ายแล้ว', 'กระทบยอดแล้ว', 'ปิดแล้ว'].includes(st) ? ('done' as const) : ('todo' as const) },
    { title: 'กระทบยอดธนาคาร', state: ['กระทบยอดแล้ว', 'ปิดแล้ว'].includes(st) ? ('done' as const) : ('todo' as const) },
  ]
  const tabs = [
    { id: 'detail', label: 'รายละเอียด' },
    { id: 'valid', label: 'การตรวจสอบ' },
    ...(hasFlow || rec.requester ? [{ id: 'flow', label: 'อนุมัติ' }] : []),
    { id: 'rel', label: 'เชื่อมโยง', n: rel },
    { id: 'hist', label: 'ประวัติ', n: hist.length },
  ]
  const guards = acts.map((a) => ({ a, g: a.guard?.(rec, role, user!) ?? null }))
  const form = FORMS[ds.prefix]
  return (
    <>
      <Drawer onClose={() => openRec(null)} title={ds.title(rec)} sub={<span className="flex items-center gap-2"><span className="mono">{rec.id}</span><span className="text-mute">· {ds.label}</span>{rec.status && <Badge s={rec.status} />}</span>}
        actions={<>
          {form && <Btn sm onClick={() => setEdit(true)}><Pencil size={14} />แก้ไข</Btn>}
          {ds.app !== 'shared' && <Btn sm onClick={() => { openRec(null); go(`/${ds.app}/${ds.page}`) }}><ExternalLink size={14} />ไปหน้าต้นทาง</Btn>}
        </>}
        footer={acts.length > 0 && (
          <div className="space-y-2">
            {guards.filter((x) => x.g).map((x, i) => <Callout key={i} tone="warn">{x.a.label}ไม่ได้: {x.g}</Callout>)}
            <div className="flex flex-wrap justify-end gap-2">
              {guards.map(({ a, g }) => (
                <Btn key={a.label} v={a.tone === 'ok' ? 'ok' : a.tone === 'bad' ? 'danger' : a.tone === 'warn' ? 'warn' : 'pri'} disabled={!!g} title={g ?? a.note} onClick={() => setPending({ rec, action: a })}>{a.label}</Btn>
              ))}
            </div>
          </div>
        )}>
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <div className="pt-4">
          {tab === 'detail' && (
            <div className="space-y-4">
              {rec.note && <Callout tone={rec.status === 'ถูกบล็อก' || rec.validation === 'ถูกบล็อก' ? 'bad' : 'warn'}>{rec.note}</Callout>}
              {rec.doc && <DocPreview name={rec.doc} amount={rec.amount} who={rec.beneficiary} />}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {Object.entries(rec).filter(([k]) => !['id', 'note', 'doc', 'dupOf'].includes(k) && typeof rec[k] !== 'object' || Array.isArray(rec[k])).map(([k, v]) => (
                  <div key={k} className={cx('min-w-0', Array.isArray(v) && 'col-span-2')}>
                    <dt className="text-[12px] text-mute">{LABELS[k] ?? k}</dt>
                    <dd className="mt-0.5 break-words text-[13px]">{fmtVal(k, v)}</dd>
                  </div>
                ))}
              </dl>
              {Array.isArray(rec.alloc) && (
                <Card title="การจัดสรรยอดโอนหนึ่งครั้งไปหลายเที่ยววิ่ง" pad={false}>
                  <table className="w-full text-[13px]"><tbody>
                    {rec.trips.map((t: string, i: number) => <tr key={t} className="border-t border-line first:border-0"><td className="px-4 py-2"><RecLink id={t} /></td><td className="tnum px-4 py-2 text-right">{baht(rec.alloc[i])}</td></tr>)}
                    <tr className="border-t border-line bg-paper font-semibold"><td className="px-4 py-2">รวม</td><td className="tnum px-4 py-2 text-right">{baht(rec.alloc.reduce((a: number, b: number) => a + b, 0))} {rec.alloc.reduce((a: number, b: number) => a + b, 0) === rec.amount ? '✓' : '≠'}</td></tr>
                  </tbody></table>
                </Card>
              )}
            </div>
          )}
          {tab === 'valid' && (
            <div className="space-y-4">
              {checks && (
                <>
                  <Card title="ผลกระทบทางการเงิน">
                    <div className="grid grid-cols-3 gap-3 text-[13px]">
                      <div><div className="text-mute">ยอดคำขอ</div><div className="tnum text-lg font-semibold">{baht(rec.amount)}</div></div>
                      <div><div className="text-mute">งบประมาณ</div><div className={cx('tnum text-lg font-semibold', rec.amount > rec.budget && 'text-bad')}>{baht(rec.budget)}</div><div className="text-[12px] text-mute">ใช้ {Math.round((rec.amount / rec.budget) * 100)}%</div></div>
                      <div><div className="text-mute">เฉลี่ยย้อนหลัง</div><div className="tnum text-lg font-semibold">{baht(rec.avg)}</div><div className={cx('text-[12px]', rec.amount > rec.avg * 1.5 ? 'text-bad' : 'text-mute')}>{(rec.amount / rec.avg).toFixed(1)}×</div></div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper"><div className={cx('h-full', rec.amount > rec.budget ? 'bg-bad' : 'bg-ruby')} style={{ width: `${Math.min(100, (rec.amount / rec.budget) * 100)}%` }} /></div>
                  </Card>
                  {rec.dupOf && <Callout tone="bad" title="คำเตือนจ่ายซ้ำ">ซ้ำกับ <RecLink id={rec.dupOf} /> — ระบบบล็อกไม่ให้ส่งเข้าอนุมัติจ่าย</Callout>}
                  <ValidationList checks={checks} />
                </>
              )}
              {!checks && (rec.validation || rec.status) && (
                <Callout tone={['ถูกบล็อก', 'ผิดปกติ', 'ซ้ำ', 'ไม่ตรงกัน', 'ข้อพิพาท'].includes(rec.validation ?? rec.status) ? 'bad' : 'ok'} title={`สถานะการตรวจสอบ: ${rec.validation ?? rec.status}`}>{rec.note ?? 'ไม่พบข้อผิดพลาดจากกฎตรวจสอบอัตโนมัติ'}</Callout>
              )}
              {valRows.length > 0 && (
                <Card title="รายการใน Validation Center" pad={false}>
                  {valRows.map((v) => <div key={v.id} className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5 first:border-0"><div><RecLink id={v.id} /><div className="text-[12px] text-mute">{v.rule} — {v.reason}</div></div><Badge s={v.status} /></div>)}
                </Card>
              )}
              {!checks && valRows.length === 0 && !rec.validation && <Empty title="ไม่พบข้อผิดพลาด" desc="รายการนี้ผ่านกฎตรวจสอบทั้งหมด" />}
            </div>
          )}
          {tab === 'flow' && <Timeline items={flow} />}
          {tab === 'rel' && (
            rel === 0 ? <Empty title="ไม่มีรายการที่เชื่อมโยง" /> : (
              <div className="space-y-4">
                {forward.length > 0 && <RelGroup title="อ้างอิงถึง" items={forward} />}
                {reverse.length > 0 && <RelGroup title="ถูกอ้างอิงโดย" items={reverse.map((r) => ({ id: r.id, via: '' }))} />}
              </div>
            )
          )}
          {tab === 'hist' && (
            <Timeline items={[...hist.map((h) => ({ title: h.text, sub: `${h.by} · ${h.at}`, state: 'done' as const })), { title: 'สร้างรายการ', sub: `${fmtDate(rec.date)} · ข้อมูลสาธิต`, state: 'done' as const }]} />
          )}
        </div>
      </Drawer>
      {edit && form && <FormModal prefix={ds.prefix} editing={rec} onClose={() => setEdit(false)} />}
    </>
  )
}
function RelGroup({ title, items }: { title: string; items: { id: string; via: string }[] }) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-mute">{title}</div>
      <ul className="divide-y divide-line rounded-lg border border-line">
        {items.map((it) => {
          const f = findRec(it.id)
          return (
            <li key={it.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0"><RecLink id={it.id} /><div className="truncate text-[12px] text-mute">{f?.ds.label} · {f ? f.ds.title(f.rec) : ''}{it.via && ` (${it.via})`}</div></div>
              {f?.rec.status && <Badge s={f.rec.status} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
function Drawer({ title, sub, children, onClose, footer, actions }: { title: string; sub?: ReactNode; children: ReactNode; onClose: () => void; footer?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30" />
      <aside className="anim-slide absolute right-0 top-0 flex h-full w-full max-w-[540px] flex-col bg-white shadow-2xl" role="dialog" aria-label={title}>
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0"><h2 className="truncate text-[17px] font-semibold">{title}</h2><div className="mt-1 text-[13px]">{sub}</div></div>
          <div className="flex shrink-0 items-center gap-1.5">{actions}<button onClick={onClose} aria-label="ปิด" className="rounded p-1.5 text-mute hover:bg-paper"><X size={18} /></button></div>
        </header>
        <div className="scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-line bg-white px-5 py-3">{footer}</footer>}
      </aside>
    </div>
  )
}

/* ───────── Action confirm dialog ───────── */
export function ActionDialog() {
  const { pending, setPending, runAction } = useApp()
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => { setReason(''); setErr('') }, [pending])
  if (!pending) return null
  const { rec, action: a } = pending
  const amount = rec.amount ?? rec.net ?? rec.advance
  const submit = () => {
    if (a.reason && reason.trim().length < 5) return setErr('กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร')
    runAction(rec, a, reason.trim())
    setPending(null)
  }
  return (
    <Modal title={`ยืนยัน: ${a.label}`} onClose={() => setPending(null)}
      footer={<><Btn onClick={() => setPending(null)}>ยกเลิก</Btn><Btn v={a.tone === 'bad' ? 'danger' : a.tone === 'ok' ? 'ok' : 'pri'} onClick={submit}>{a.label}</Btn></>}>
      <div className="space-y-3 text-[13px]">
        <div className="rounded-lg bg-paper p-3">
          <div className="mono font-medium">{rec.id}</div>
          {amount !== undefined && <div className="mt-1">ผลกระทบทางการเงิน: <b className="tnum">{baht(amount)}</b></div>}
          <div className="mt-1 flex items-center gap-2 text-mute">สถานะ: <Badge s={rec.status} /> → <Badge s={a.to} /></div>
        </div>
        {a.note && <Callout tone="warn">{a.note}</Callout>}
        {a.reason && (
          <Field label="เหตุผล" required error={err}>
            <textarea value={reason} onChange={(e) => { setReason(e.target.value); setErr('') }} rows={3} className={cx(inputCls(!!err), 'h-auto py-2')} placeholder="ระบุเหตุผลเพื่อบันทึกใน Audit History" autoFocus />
          </Field>
        )}
        <p className="text-[12px] text-mute">การดำเนินการนี้จะถูกบันทึกใน Audit History พร้อมชื่อผู้ใช้และเวลา</p>
      </div>
    </Modal>
  )
}

/* ───────── Form modal ───────── */
export function FormModal({ prefix, editing, onClose, inline }: { prefix: string; editing?: Rec; onClose: () => void; inline?: boolean }) {
  const { addRecord, updateRecord, toast, openRec, role, company } = useApp()
  const cfg = FORMS[prefix]
  const [v, setV] = useState<Record<string, any>>(() => {
    const d = { ...cfg.defaults, ...(editing ?? {}) }
    if (!editing && company !== 'ALL') {
      const o = cfg.fields.find((f) => f.key === 'company')?.options
      if (o?.some((x) => x.v === company)) d.company = company
    }
    return d
  })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState(false)
  const validateOne = (f: (typeof cfg.fields)[number], all = v) => {
    const val = all[f.key]
    if (f.required && (val === undefined || val === '' || val === null)) return `กรุณากรอก${f.label}`
    if (f.type === 'number' && val !== '' && val !== undefined) {
      if (isNaN(Number(val))) return 'ต้องเป็นตัวเลข'
      if (f.min !== undefined && Number(val) < f.min) return `ต้องไม่น้อยกว่า ${f.min.toLocaleString()}`
    }
    return f.validate ? f.validate(val, all, editing?.id) : null
  }
  const opts = (f: (typeof cfg.fields)[number]) => (f.key === 'company' ? f.options!.filter((o) => role.companies.includes(o.v)) : f.options)
  const submit = () => {
    setTouched(true)
    const e: Record<string, string> = {}
    cfg.fields.forEach((f) => { const m = validateOne(f); if (m) e[f.key] = m })
    setErrs(e)
    if (Object.keys(e).length) { toast(`กรุณาแก้ไข ${Object.keys(e).length} ช่องที่มีข้อผิดพลาด`, 'bad'); return }
    const data = { ...v }
    cfg.fields.forEach((f) => { if (f.type === 'number' && data[f.key] !== '') data[f.key] = Number(data[f.key]) })
    const out = cfg.transform ? cfg.transform(data) : data
    if (editing) { const { id, ...rest } = out; updateRecord(editing.id, rest); toast('บันทึกการแก้ไขแล้ว') }
    else { const rec = addRecord(prefix, out); toast(`สร้าง ${rec.id} สำเร็จ`); setTimeout(() => openRec(rec.id), 100) }
    onClose()
  }
  const wrap = (children: ReactNode) => inline ? (
    <Card title={`${editing ? 'แก้ไข' : 'เพิ่ม'}${cfg.title}`}>{children}<div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Btn onClick={onClose}>ยกเลิก</Btn><Btn v="pri" onClick={submit}>{editing ? 'บันทึก' : 'สร้างรายการ'}</Btn></div></Card>
  ) : (
    <Modal title={`${editing ? 'แก้ไข' : 'เพิ่ม'}${cfg.title}`} onClose={onClose} footer={<><Btn onClick={onClose}>ยกเลิก</Btn><Btn v="pri" onClick={submit}>{editing ? 'บันทึก' : 'สร้างรายการ'}</Btn></>}>{children}</Modal>
  )
  return wrap(
      <form className="grid gap-3.5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit() }} noValidate>
        {cfg.fields.map((f) => {
          const err = touched ? errs[f.key] : undefined
          const set = (x: any) => { const nv = { ...v, [f.key]: x }; setV(nv); if (touched) setErrs((p) => ({ ...p, [f.key]: validateOne(f, nv) ?? '' })) }
          const dis = editing && f.key === 'id'
          return (
            <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <Field label={f.label} required={f.required} error={err || undefined} hint={f.hint}>
                {f.type === 'select' ? (
                  <select value={v[f.key] ?? ''} onChange={(e) => set(e.target.value)} className={inputCls(!!err)}><option value="">— เลือก —</option>{opts(f)!.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                ) : f.type === 'textarea' ? (
                  <textarea value={v[f.key] ?? ''} onChange={(e) => set(e.target.value)} rows={3} className={cx(inputCls(!!err), 'h-auto py-2')} />
                ) : (
                  <input value={v[f.key] ?? ''} disabled={!!dis} type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} onChange={(e) => set(e.target.value)} className={cx(inputCls(!!err), dis && 'bg-paper')} />
                )}
              </Field>
            </div>
          )
        })}
      </form>
  )
}

/* ───────── Table page ───────── */
export type KpiDef = { label: string; value: ReactNode; sub?: ReactNode; tone?: 'bad' | 'ok' | 'warn'; pick?: (r: Rec) => boolean }
export type TableCfg = {
  prefix: string
  title: string
  desc?: string
  where?: (r: Rec) => boolean
  cols: Col[]
  filters?: string[]
  tabs?: { id: string; label: string; where: (r: Rec) => boolean }[]
  kpis?: (rows: Rec[]) => KpiDef[]
  noAdd?: boolean
  addLabel?: string
  top?: (rows: Rec[]) => ReactNode
  extraActions?: ReactNode
  pageSize?: number
  rowTone?: (r: Rec) => string | undefined
}
export function useScoped(prefix: string, where?: (r: Rec) => boolean) {
  const { company, inRange, role, tick } = useApp()
  return useMemo(() => DB[prefix].rows.filter((r) => (!where || where(r)) && (!r.company || (role.companies.includes(r.company) && (company === 'ALL' || r.company === company))) && inRange(r.date)), [prefix, where, company, inRange, role, tick])
}
export function TablePage(cfg: TableCfg) {
  const { toast, openRec } = useApp()
  const base = useScoped(cfg.prefix, cfg.where)
  const [q, setQ] = useState('')
  const [fv, setFv] = useState<Record<string, string>>({})
  const [tab, setTab] = useState(cfg.tabs?.[0]?.id ?? '')
  const [chip, setChip] = useState<{ label: string; fn: (r: Rec) => boolean } | null>(null)
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const [page, setPage] = useState(1)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [busy, run] = useBusy(280)
  const [first, setFirst] = useState(true)
  useEffect(() => { setFirst(true); const t = setTimeout(() => setFirst(false), 260); return () => clearTimeout(t) }, [cfg.prefix, cfg.title])
  useEffect(() => { setPage(1) }, [q, fv, tab, chip, base.length])
  const kpis = cfg.kpis?.(base)
  const tabRows = cfg.tabs ? base.filter(cfg.tabs.find((t) => t.id === tab)!.where) : base
  const rows = useMemo(() => {
    let r = tabRows
    if (chip) r = r.filter(chip.fn)
    Object.entries(fv).forEach(([k, val]) => { if (val) r = r.filter((x) => String(x[k]) === val) })
    if (q.trim()) { const t = q.trim().toLowerCase(); r = r.filter((x) => Object.values(x).some((v) => String(v).toLowerCase().includes(t))) }
    if (sort) {
      const col = cfg.cols.find((c) => c.key === sort.key)
      const g = (x: Rec) => (col?.sort ? col.sort(x) : x[sort.key])
      r = [...r].sort((a, b) => { const A = g(a), B = g(b); return (typeof A === 'number' && typeof B === 'number' ? A - B : String(A ?? '').localeCompare(String(B ?? ''), 'th', { numeric: true })) * sort.dir })
    }
    return r
  }, [tabRows, chip, fv, q, sort])
  const ps = cfg.pageSize ?? 10
  const pages = Math.max(1, Math.ceil(rows.length / ps))
  const view = rows.slice((page - 1) * ps, page * ps)
  const opts = (k: string) => [...new Set(base.map((r) => r[k]).filter((x) => x !== undefined && x !== null && x !== ''))].map(String).sort()
  const hasForm = !!FORMS[cfg.prefix] && !cfg.noAdd
  const allSel = view.length > 0 && view.every((r) => sel.has(r.id))
  const bulkValidate = () => {
    const chosen = rows.filter((r) => sel.has(r.id))
    const bad = chosen.filter((r) => ['ถูกบล็อก', 'ผิดปกติ', 'ซ้ำ', 'ไม่ตรงกัน', 'ข้อพิพาท'].includes(r.status) || r.validation === 'ถูกบล็อก').length
    const warn = chosen.filter((r) => ['เตือน', 'ต้องตรวจสอบ', 'ขาด OUT', 'ขาดเอกสาร'].includes(r.status) || ['เตือน', 'ต้องตรวจสอบ'].includes(r.validation)).length
    run(() => toast(`ตรวจสอบ ${chosen.length} รายการ: ผ่าน ${chosen.length - bad - warn} · เตือน ${warn} · ถูกบล็อก ${bad}`, bad ? 'warn' : 'ok'))
  }
  const doExport = () => { exportCsv(cfg.prefix.toLowerCase() + '-export', rows, Object.keys(rows[0] ?? { id: 1 }).filter((k) => typeof rows[0]?.[k] !== 'object')); toast(`ส่งออก ${rows.length} รายการเป็น CSV`) }
  return (
    <div>
      <PageHead title={cfg.title} desc={cfg.desc} right={<>
        {cfg.extraActions}
        <Btn onClick={doExport}><Download size={15} />ส่งออก</Btn>
        {hasForm && <Btn v="pri" onClick={() => setAdding(true)}><Plus size={15} />{cfg.addLabel ?? `เพิ่ม${FORMS[cfg.prefix].title}`}</Btn>}
      </>} />
      {kpis && (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {kpis.map((k) => <Kpi key={k.label} label={k.label} value={k.value} sub={k.sub} tone={k.tone} onClick={k.pick ? () => setChip({ label: k.label, fn: k.pick! }) : undefined} />)}
        </div>
      )}
      {cfg.top?.(base)}
      <div className="rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(16,16,20,.04)]">
        {cfg.tabs && <div className="px-3 pt-1"><Tabs tabs={cfg.tabs.map((t) => ({ id: t.id, label: t.label, n: base.filter(t.where).length }))} value={tab} onChange={setTab} /></div>}
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาในตาราง…" aria-label="ค้นหา" className={cx(inputCls(), 'pl-9')} />
          </div>
          {cfg.filters?.map((k) => (
            <select key={k} value={fv[k] ?? ''} onChange={(e) => setFv({ ...fv, [k]: e.target.value })} aria-label={LABELS[k] ?? k} className={cx(inputCls(), 'w-auto min-w-[120px]')}>
              <option value="">{LABELS[k] ?? k}: ทั้งหมด</option>
              {opts(k).map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          {(chip || Object.values(fv).some(Boolean) || q) && <Btn sm onClick={() => { setChip(null); setFv({}); setQ('') }}><X size={13} />ล้างตัวกรอง</Btn>}
          {chip && <span className="rounded-full bg-ruby-soft px-2.5 py-1 text-[12px] font-medium text-ruby-dark">กรอง: {chip.label}</span>}
          <span className="ml-auto text-[12px] text-mute">{rows.length.toLocaleString()} รายการ</span>
        </div>
        {sel.size > 0 && (
          <div className="flex items-center gap-2 border-b border-line bg-ruby-soft px-3 py-2 text-[13px]">
            <b>เลือก {sel.size} รายการ</b>
            <Btn sm onClick={bulkValidate} disabled={busy}><ShieldCheck size={14} />ตรวจสอบที่เลือก</Btn>
            <Btn sm onClick={() => { exportCsv('selected', rows.filter((r) => sel.has(r.id)), ['id', 'status']); toast('ส่งออกรายการที่เลือกแล้ว') }}><Download size={14} />ส่งออก</Btn>
            <Btn sm onClick={() => setSel(new Set())}>ยกเลิกเลือก</Btn>
          </div>
        )}
        {first ? <Loading /> : rows.length === 0 ? <Empty /> : (
          <div className="scroll max-h-[620px] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-[13px]">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="w-9 border-b border-line bg-paper px-3 py-2"><input type="checkbox" aria-label="เลือกทั้งหมด" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(view.map((r) => r.id)))} className="accent-[#E6005C]" /></th>
                  <th className="border-b border-line bg-paper px-3 py-2 text-left text-[12px] font-medium text-mute"><button onClick={() => setSort(sort?.key === 'id' ? { key: 'id', dir: (sort.dir * -1) as 1 | -1 } : { key: 'id', dir: 1 })} className="inline-flex items-center gap-1">รหัส<ArrowUpDown size={11} /></button></th>
                  {cfg.cols.map((c) => (
                    <th key={c.key} aria-sort={sort?.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className={cx('whitespace-nowrap border-b border-line bg-paper px-3 py-2 text-[12px] font-medium text-mute', c.align === 'right' || ['money', 'num', 'pct'].includes(c.kind ?? '') ? 'text-right' : 'text-left')}>
                      <button onClick={() => setSort(sort?.key === c.key ? { key: c.key, dir: (sort.dir * -1) as 1 | -1 } : { key: c.key, dir: 1 })} className={cx('inline-flex items-center gap-1 hover:text-ink', sort?.key === c.key && 'text-ruby')}>{c.label}<ArrowUpDown size={11} /></button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.map((r) => (
                  <tr key={r.id} onClick={() => openRec(r.id)} className={cx('cursor-pointer transition hover:bg-ruby-soft/60', sel.has(r.id) && 'bg-ruby-soft/40', cfg.rowTone?.(r))}>
                    <td className="border-b border-line px-3 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`เลือก ${r.id}`} checked={sel.has(r.id)} onChange={() => { const n = new Set(sel); n.has(r.id) ? n.delete(r.id) : n.add(r.id); setSel(n) }} className="accent-[#E6005C]" /></td>
                    <td className="whitespace-nowrap border-b border-line px-3 py-2"><span className="mono font-medium text-ruby">{r.id}</span></td>
                    {cfg.cols.map((c) => (
                      <td key={c.key} className={cx('border-b border-line px-3 py-2', c.align === 'right' || ['money', 'num', 'pct'].includes(c.kind ?? '') ? 'tnum whitespace-nowrap text-right' : '', c.kind === 'mono' && 'mono')}>
                        {c.render ? c.render(r) : c.kind === 'badge' ? (r[c.key] ? <Badge s={String(r[c.key])} /> : '-') : c.kind === 'money' ? baht(r[c.key]) : c.kind === 'date' ? fmtDate(r[c.key]) : c.kind === 'pct' ? `${r[c.key]}%` : c.kind === 'num' ? Number(r[c.key]).toLocaleString() : c.kind === 'bar' ? <Bar v={r[c.key]} /> : cell(r[c.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5 text-[12px] text-mute">
          <span>แสดง {rows.length ? (page - 1) * ps + 1 : 0}–{Math.min(page * ps, rows.length)} จาก {rows.length}</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="ก่อนหน้า" className="rounded p-1.5 ring-1 ring-line hover:bg-paper disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map((n) => <button key={n} onClick={() => setPage(n)} className={cx('size-7 rounded text-[12px]', n === page ? 'bg-ruby font-semibold text-white' : 'hover:bg-paper')}>{n}</button>)}
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="ถัดไป" className="rounded p-1.5 ring-1 ring-line hover:bg-paper disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
      {adding && <FormModal prefix={cfg.prefix} onClose={() => setAdding(false)} />}
    </div>
  )
}
export function Bar({ v, max = 100, tone }: { v: number; max?: number; tone?: string }) {
  return (
    <div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-paper"><div className={cx('h-full rounded-full', tone ?? 'bg-ruby')} style={{ width: `${Math.max(0, Math.min(100, (v / max) * 100))}%` }} /></div><span className="tnum text-[12px] text-mute">{v}</span></div>
  )
}
export { ROLES }
