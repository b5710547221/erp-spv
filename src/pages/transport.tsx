import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link2, Play, Wand2 } from 'lucide-react'
import { DB, TODAY, TR_CO, type Rec } from '../lib/data'
import { compact } from '../lib/fin'
import { useApp } from '../lib/store'
import { TablePage, useScoped } from '../components/engine'
import { Badge, Btn, Callout, Card, Empty, Kpi, PageHead, RecLink, baht, cx, inputCls } from '../components/ui'
import { FormPage, IntegrationsPage, NotificationsPage, RecordsModal, ReportsPage, SettingsPage, ValidationPage, GRAY, RUBY } from './common'
import { TABLES } from './tables'

const sum = (a: Rec[], k: string) => a.reduce((s, r) => s + (r[k] || 0), 0)

function Dashboard() {
  const { go } = useApp()
  const trips = useScoped('TRP')
  const exp = useScoped('EXP')
  const fuel = useScoped('FUL')
  const val = useScoped('VAL', (r) => r.div === 'Transport' && r.status !== 'ปิดแล้ว')
  const [m, setM] = useState<{ title: string; rows: Rec[] } | null>(null)
  const bad = trips.filter((r) => ['ผิดปกติ', 'ซ้ำ', 'ขาดเอกสาร'].includes(r.status))
  const pend = [...exp, ...fuel].filter((r) => r.status === 'รออนุมัติ')
  const advance = fuel.filter((r) => String(r.settled).startsWith('รอคืน'))
  const co = TR_CO.map((c) => { const t = trips.filter((r) => r.company === c); return { c, rev: Math.round(sum(t, 'revenue') / 1000), cost: Math.round(sum(t, 'cost') / 1000) } })
  const open = (title: string, rows: Rec[]) => setM({ title, rows })
  return (
    <div>
      <PageHead title="แดชบอร์ดขนส่ง" desc="SPV · TKQ · THRS · T&A — ภาพรวมเที่ยววิ่ง ต้นทุน และรายการที่ต้องดำเนินการวันนี้ (ข้อมูลสาธิต)" right={<Btn v="pri" onClick={() => go('/transport/trip-form')}>+ เพิ่มเที่ยววิ่ง</Btn>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="เที่ยววิ่ง" value={trips.length} sub="ในช่วงเวลาที่เลือก" onClick={() => open('เที่ยววิ่งทั้งหมด', trips)} />
        <Kpi label="เที่ยวผิดปกติ" value={bad.length} tone="bad" sub="ต้องตรวจสอบ" onClick={() => open('เที่ยววิ่งผิดปกติ', bad)} />
        <Kpi label="รออนุมัติ" value={pend.length} tone="warn" sub={baht(sum(pend, 'amount') + sum(pend, 'advance'))} onClick={() => open('รออนุมัติ', pend)} />
        <Kpi label="น้ำมันเบิกล่วงหน้ารอคืน" value={advance.length} tone="warn" sub={baht(advance.reduce((s, r) => s + r.advance - r.actual, 0))} onClick={() => open('น้ำมันรอสรุปยอด', advance)} />
        <Kpi label="รายได้" value={'฿' + compact(sum(trips, 'revenue'))} onClick={() => open('เที่ยววิ่ง — รายได้', trips)} />
        <Kpi label="ต้นทุนเที่ยววิ่ง" value={'฿' + compact(sum(trips, 'cost'))} onClick={() => open('เที่ยววิ่ง — ต้นทุน', trips)} />
        <Kpi label="ถูกบล็อก (จ่ายซ้ำ)" value={exp.filter((r) => r.validation === 'ถูกบล็อก').length} tone="bad" onClick={() => open('ค่าใช้จ่ายถูกบล็อก', exp.filter((r) => r.validation === 'ถูกบล็อก'))} />
        <Kpi label="ข้อยกเว้นที่ยังไม่ปิด" value={val.length} tone="warn" onClick={() => go('/transport/validation')} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="รายได้เทียบต้นทุนรายบริษัท (พันบาท)" className="xl:col-span-2">
          <div className="h-64"><ResponsiveContainer><BarChart data={co}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="c" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={40} /><Tooltip /><Legend /><Bar dataKey="rev" name="รายได้" fill={RUBY} radius={[4, 4, 0, 0]} /><Bar dataKey="cost" name="ต้นทุน" fill={GRAY} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card title="ต้องดำเนินการวันนี้" pad={false}>
          <ul className="divide-y divide-line text-[13px]">
            {val.slice(0, 6).map((v) => <li key={v.id} className="flex items-start justify-between gap-2 px-4 py-2.5"><div className="min-w-0"><div className="truncate font-medium">{v.rule}</div><div className="text-[12px] text-mute"><RecLink id={v.ref} /> · {v.company}</div></div><Badge s={v.severity} /></li>)}
            {!val.length && <li className="p-4 text-mute">ไม่มีรายการค้าง</li>}
          </ul>
        </Card>
      </div>
      <p className="mt-3 text-[12px] text-mute">วันที่ในระบบสาธิต: {TODAY}</p>
      {m && <RecordsModal title={m.title} rows={m.rows} onClose={() => setM(null)} />}
    </div>
  )
}

function Dispatch() {
  const { updateRecord, toast, tick } = useApp()
  const trips = useScoped('TRP', (r) => r.status === 'กำลังดำเนินการ' || r.status === 'ผิดปกติ' || r.status === 'ขาดเอกสาร')
  const vehs = DB.VEH.rows, drvs = DB.DRV.rows
  const [pick, setPick] = useState<Record<string, { v: string; d: string }>>({})
  const [busy, setBusy] = useState('')
  void tick
  return (
    <div>
      <PageHead title="มอบหมายงาน (Dispatch)" desc="เลือกรถและคนขับต่อเที่ยววิ่ง — ระบบตรวจเส้นทางที่อนุมัติและเอกสารรถก่อนมอบหมาย" />
      <Card pad={false}>
        {trips.length === 0 ? <Empty title="ไม่มีเที่ยวที่รอมอบหมาย" /> : (
          <div className="overflow-x-auto"><table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">เที่ยววิ่ง</th><th className="px-4 py-2">เส้นทาง</th><th className="px-4 py-2">รถ</th><th className="px-4 py-2">คนขับ</th><th className="px-4 py-2" /></tr></thead>
            <tbody>{trips.slice(0, 12).map((t) => {
              const p = pick[t.id] ?? { v: t.vehicle, d: t.driver }
              const rt = DB.RTE.rows.find((r) => r.id === t.routeId)
              const veh = vehs.find((v) => v.id === p.v)
              return (
                <tr key={t.id} className="border-t border-line align-top">
                  <td className="px-4 py-2.5"><RecLink id={t.id} /><div className="text-[12px] text-mute">{t.company} · {t.customerName}</div></td>
                  <td className="px-4 py-2.5">{t.route}{rt?.approved !== 'อนุมัติ' && <div className="mt-1"><Badge s="เส้นทางไม่ได้อนุมัติ" tone="bad" /></div>}</td>
                  <td className="px-4 py-2.5"><select className={cx(inputCls(), 'w-48')} value={p.v} onChange={(e) => setPick({ ...pick, [t.id]: { ...p, v: e.target.value } })} aria-label="รถ">{vehs.filter((v) => v.company === t.company || v.ownership !== 'รถบริษัท').map((v) => <option key={v.id} value={v.id}>{v.plate} · {v.type}</option>)}</select>{veh && veh.status !== 'ใช้งาน' && <div className="mt-1"><Badge s={`รถ${veh.status}`} tone="warn" /></div>}</td>
                  <td className="px-4 py-2.5"><select className={cx(inputCls(), 'w-44')} value={p.d} onChange={(e) => setPick({ ...pick, [t.id]: { ...p, d: e.target.value } })} aria-label="คนขับ">{drvs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></td>
                  <td className="px-4 py-2.5"><Btn sm v="pri" disabled={busy === t.id} onClick={() => { setBusy(t.id); setTimeout(() => { updateRecord(t.id, { vehicle: p.v, driver: p.d }); setBusy(''); toast(`มอบหมาย ${t.id} เรียบร้อย`) }, 400) }}>มอบหมาย</Btn></td>
                </tr>)
            })}</tbody></table></div>
        )}
      </Card>
    </div>
  )
}

function Dup() {
  const { addRecord, toast } = useApp()
  const [running, setRunning] = useState(false)
  const rows = useScoped('DUP')
  const exps = DB.EXP.rows
  const groups = useMemo(() => {
    const m = new Map<string, Rec[]>()
    exps.forEach((e) => { if (e.status === 'ปฏิเสธ') return; const k = `${e.beneficiary}|${e.amount}`; m.set(k, [...(m.get(k) ?? []), e]) })
    return [...m.values()].filter((g) => g.length > 1)
  }, [exps.length, rows.length])
  const run = () => {
    setRunning(true)
    setTimeout(() => {
      let added = 0
      groups.forEach((g) => g.slice(1).forEach((e) => { if (!DB.DUP.rows.some((d) => d.ref === e.id && d.result !== 'ผ่าน')) { addRecord('DUP', { company: e.company, ref: e.id, kind: 'ค่าใช้จ่าย', beneficiary: e.beneficiary, amount: e.amount, result: 'ซ้ำ', reason: `ผู้รับเงินและยอดตรงกับ ${g[0].id}` }); added++ } }))
      setRunning(false)
      toast(added ? `ตรวจพบรายการเสี่ยงซ้ำใหม่ ${added} รายการ` : 'ตรวจสอบเสร็จสิ้น — ไม่พบรายการซ้ำใหม่', added ? 'warn' : 'ok')
    }, 900)
  }
  return (
    <div>
      <TablePage {...TABLES.dup!} extraActions={<Btn v="pri" onClick={run} disabled={running}><Play size={14} />{running ? 'กำลังตรวจสอบ…' : 'รันการตรวจสอบ'}</Btn>}
        top={() => (
          <Card title="กลุ่มรายการที่ผู้รับเงิน + ยอดตรงกัน" className="mb-4">
            {groups.length === 0 ? <div className="text-[13px] text-mute">ไม่พบกลุ่มรายการซ้ำ</div> : groups.map((g) => (
              <div key={g[0].id} className="mb-2 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px]"><Link2 size={14} className="text-bad" /><b>{g[0].beneficiary}</b><span>{baht(g[0].amount)}</span>{g.map((e) => <RecLink key={e.id} id={e.id} />)}</div>
            ))}
          </Card>
        )} />
    </div>
  )
}
TABLES.dup = {
  prefix: 'DUP', title: 'ตรวจจับการจ่ายซ้ำ', desc: 'เมทริกซ์ตรวจสอบการจ่ายซ้ำ — บาร์โค้ด ผู้รับเงิน ยอด เที่ยววิ่ง และเอกสาร', noAdd: true, filters: ['company', 'kind', 'result'],
  tabs: [{ id: 'all', label: 'ทั้งหมด', where: () => true }, { id: 'dup', label: 'ซ้ำ/เสี่ยง', where: (r) => r.result !== 'ผ่าน' }, { id: 'ok', label: 'ผ่าน', where: (r) => r.result === 'ผ่าน' }],
  cols: [{ key: 'ref', label: 'รายการอ้างอิง' }, { key: 'company', label: 'บริษัท' }, { key: 'kind', label: 'ประเภท' }, { key: 'beneficiary', label: 'ผู้รับเงิน' }, { key: 'amount', label: 'จำนวนเงิน', kind: 'money' }, { key: 'result', label: 'ผลตรวจ', kind: 'badge' }, { key: 'reason', label: 'เหตุผล' }],
}

function Batches() {
  const { addRecord, updateRecord, toast, user, tick } = useApp()
  void tick
  const ready = DB.EXP.rows.filter((e) => e.status === 'อนุมัติแล้ว' && !e.batch)
  const create = () => {
    const by: Record<string, Rec[]> = {}
    ready.forEach((e) => (by[e.company] = [...(by[e.company] ?? []), e]))
    Object.entries(by).forEach(([c, list]) => { const b = addRecord('BAT', { company: c, date: TODAY, count: list.length, total: sum(list, 'amount'), approver: user?.name ?? '-', status: 'รออนุมัติ' }); list.forEach((e) => updateRecord(e.id, { batch: b.id })) })
    toast(`สร้าง Batch ${Object.keys(by).length} ชุด จาก ${ready.length} รายการ`)
  }
  return <TablePage {...TABLES.batches} extraActions={<Btn v="pri" disabled={!ready.length} onClick={create}>สร้าง Batch จากรายการอนุมัติ ({ready.length})</Btn>} />
}

function BankRecon() {
  const { updateRecord, toast } = useApp()
  const auto = () => {
    let n = 0
    DB.BNK.rows.filter((b) => b.status !== 'ตรงกัน').forEach((b) => { const p = DB.PAY.rows.find((x) => x.amount === b.amount && !DB.BNK.rows.some((o) => o.pay === x.id)); if (p) { updateRecord(b.id, { pay: p.id, status: 'ตรงกัน' }); n++ } })
    toast(n ? `จับคู่อัตโนมัติ ${n} รายการ` : 'ไม่พบรายการที่จับคู่ได้ — ต้องตรวจสอบด้วยมือ', n ? 'ok' : 'warn')
  }
  return <TablePage {...TABLES['bank-recon']} extraActions={<Btn v="pri" onClick={auto}><Wand2 size={14} />จับคู่อัตโนมัติ</Btn>} />
}

function VehicleProfit() {
  const { openRec } = useApp()
  const p = useScoped('PFT')
  const rows = useMemo(() => {
    const m = new Map<string, { v: string; n: number; rev: number; cost: number }>()
    p.forEach((r) => { const x = m.get(r.vehicle) ?? { v: r.vehicle, n: 0, rev: 0, cost: 0 }; x.n++; x.rev += r.revenue; x.cost += r.cost; m.set(r.vehicle, x) })
    return [...m.values()].map((x) => ({ ...x, profit: x.rev - x.cost, margin: x.rev ? Math.round(((x.rev - x.cost) / x.rev) * 100) : 0 })).sort((a, b) => b.profit - a.profit)
  }, [p])
  return (
    <div>
      <PageHead title="กำไรต่อคัน" desc="สรุปจากกำไรต่อเที่ยววิ่งของแต่ละคัน — คลิกแถวเพื่อดูข้อมูลรถ" />
      <Card title="กำไรรายคัน (พันบาท)" className="mb-4"><div className="h-56"><ResponsiveContainer><BarChart data={rows.map((r) => ({ n: DB.VEH.rows.find((v) => v.id === r.v)?.plate ?? r.v, p: Math.round(r.profit / 1000) }))}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={11} /><YAxis tickLine={false} axisLine={false} width={36} /><Tooltip /><Bar dataKey="p" name="กำไร" radius={[4, 4, 0, 0]}>{rows.map((r, i) => <Cell key={i} fill={r.profit < 0 ? '#DC2626' : RUBY} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
      <Card pad={false}>
        {rows.length === 0 ? <Empty /> : <div className="overflow-x-auto"><table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">รถ</th><th className="px-4 py-2 text-right">เที่ยว</th><th className="px-4 py-2 text-right">รายได้</th><th className="px-4 py-2 text-right">ต้นทุน</th><th className="px-4 py-2 text-right">กำไร</th><th className="px-4 py-2 text-right">มาร์จิ้น</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.v} onClick={() => openRec(r.v)} className="cursor-pointer border-t border-line hover:bg-ruby-soft/50"><td className="px-4 py-2.5"><span className="mono text-ruby">{r.v}</span> {DB.VEH.rows.find((v) => v.id === r.v)?.plate}</td><td className="tnum px-4 py-2.5 text-right">{r.n}</td><td className="tnum px-4 py-2.5 text-right">{baht(r.rev)}</td><td className="tnum px-4 py-2.5 text-right">{baht(r.cost)}</td><td className={cx('tnum px-4 py-2.5 text-right font-medium', r.profit < 0 && 'text-bad')}>{baht(r.profit)}</td><td className="tnum px-4 py-2.5 text-right">{r.margin}%</td></tr>)}</tbody></table></div>}
      </Card>
    </div>
  )
}

export default function TransportPage({ page }: { page: string }) {
  switch (page) {
    case 'dashboard': return <Dashboard />
    case 'trip-form': return <FormPage prefix="TRP" back="/transport/trips" title="เพิ่ม / แก้ไขเที่ยววิ่ง" desc="บันทึกเที่ยววิ่ง — ระบบตรวจบาร์โค้ดซ้ำ เส้นทางที่อนุมัติ และเอกสารก่อนบันทึก" />
    case 'dispatch': return <Dispatch />
    case 'dup': return <Dup />
    case 'batches': return <Batches />
    case 'bank-recon': return <BankRecon />
    case 'vehicle-profit': return <VehicleProfit />
    case 'reports': return <ReportsPage app="transport" />
    case 'settings': return <SettingsPage app="transport" />
    case 'validation': return <ValidationPage division="Transport" />
    case 'notifications': return <NotificationsPage />
    case 'integrations': return <IntegrationsPage />
    default: {
      const cfg = TABLES[page]
      return cfg ? <TablePage {...cfg} /> : <Callout tone="warn">ไม่พบหน้า {page}</Callout>
    }
  }
}
