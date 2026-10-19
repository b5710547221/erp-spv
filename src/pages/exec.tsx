import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle } from 'lucide-react'
import { DB, TREND, type Rec } from '../lib/data'
import { compact, compute, useFin } from '../lib/fin'
import { useApp } from '../lib/store'
import { TablePage } from '../components/engine'
import { Badge, Btn, Callout, Card, Kpi, PageHead, RecLink, baht, cx } from '../components/ui'
import { IntegrationsPage, NotificationsPage, RecordsModal, ReportsPage, ValidationPage, GRAY, RUBY } from './common'
import { TABLES } from './tables'

const PAL = [RUBY, '#18181B', '#F59E0B', '#059669', '#6366F1', GRAY]

function Overview() {
  const f = useFin()
  const { go, role, inRange, tick, company } = useApp()
  const [m, setM] = useState<{ title: string; rows: Rec[] } | null>(null)
  const cos = role.companies
  const per = useMemo(() => cos.map((c) => ({ c, f: compute((r) => r.company === c && inRange(r.date)) })), [cos.join(), inRange, tick])
  const pie = per.map((p) => ({ name: p.c, value: Math.max(0, Math.round(p.f.revenue / 1000)) })).filter((x) => x.value)
  const margin = f.revenue ? Math.round((f.net / f.revenue) * 100) : 0
  const open = (title: string, rows: Rec[]) => setM({ title, rows })
  return (
    <div>
      <PageHead title="ภาพรวมผู้บริหาร" desc="ผลประกอบการรวม 6 บริษัท — คลิกตัวเลขทุกใบเพื่อเจาะดูรายการต้นทาง (ข้อมูลสาธิต)" right={<><Btn onClick={() => go('/exec/reports')}>รายงาน</Btn><Btn v="pri" onClick={() => go('/exec/expense-approval')}>รออนุมัติ {f.pendList.length}</Btn></>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="รายได้" value={'฿' + compact(f.revenue)} delta="+8.2%" sub="เทียบงวดก่อน" onClick={() => open('รายได้ — ใบวางบิล', [...f.inv, ...f.wbl])} />
        <Kpi label="ต้นทุนตรง" value={'฿' + compact(f.direct)} sub="เที่ยววิ่ง + เงินเดือน" onClick={() => open('ต้นทุนตรง', [...f.trips, ...f.prl])} />
        <Kpi label="ค่าใช้จ่ายดำเนินงาน" value={'฿' + compact(f.opex)} sub="ไม่รวมที่ถูกบล็อก/ปฏิเสธ" onClick={() => open('ค่าใช้จ่ายดำเนินงาน', f.exp)} />
        <Kpi label="กำไรสุทธิ" value={'฿' + compact(f.net)} tone={f.net < 0 ? 'bad' : 'ok'} sub={`มาร์จิ้น ${margin}%`} onClick={() => open('องค์ประกอบกำไรสุทธิ', [...f.inv, ...f.wbl, ...f.exp])} />
        <Kpi label="ลูกหนี้ค้างชำระ" value={'฿' + compact(f.ar)} tone="warn" sub={`เกินกำหนด ฿${compact(f.overdue)}`} onClick={() => open('ลูกหนี้ค้างชำระ', [...f.inv, ...f.wbl].filter((r) => r.paid < r.amount))} />
        <Kpi label="เจ้าหนี้รอจ่าย" value={'฿' + compact(f.ap)} sub="อนุมัติแล้วยังไม่จ่าย" onClick={() => open('เจ้าหนี้รอจ่าย', [...f.exp.filter((r) => r.status === 'อนุมัติแล้ว'), ...f.prl.filter((r) => r.status === 'อนุมัติแล้ว')])} />
        <Kpi label="รออนุมัติ" value={f.pendList.length} tone="warn" sub="ค่าใช้จ่าย น้ำมัน เงินเดือน คำขอคน" onClick={() => open('รายการรออนุมัติ', f.pendList)} />
        <Kpi label="รายการผิดปกติ" value={f.alerts.length} tone="bad" sub="ถูกบล็อก ซ้ำ ข้อพิพาท" onClick={() => open('รายการผิดปกติ', f.alerts)} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="แนวโน้มรายได้เทียบค่าใช้จ่าย (ล้านบาท)" className="xl:col-span-2">
          <div className="h-64"><ResponsiveContainer><AreaChart data={TREND}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="m" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={32} /><Tooltip /><Legend />
            <Area dataKey="rev" name="รายได้" stroke={RUBY} fill="#FFF0F5" strokeWidth={2} /><Area dataKey="exp" name="ค่าใช้จ่าย" stroke="#18181B" fill="#F5F6F8" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
        </Card>
        <Card title="สัดส่วนรายได้รายบริษัท">
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2}>{pie.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}</Pie><Tooltip formatter={(v) => `฿${Number(v).toLocaleString()}K`} /><Legend /></PieChart></ResponsiveContainer></div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="กำไรสุทธิรายบริษัท (พันบาท)" className="xl:col-span-2">
          <div className="h-60"><ResponsiveContainer><BarChart data={per.map((p) => ({ n: p.c, net: Math.round(p.f.net / 1000) }))}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={40} /><Tooltip /><Bar dataKey="net" name="กำไรสุทธิ" radius={[4, 4, 0, 0]}>{per.map((p, i) => <Cell key={i} fill={p.f.net < 0 ? '#DC2626' : RUBY} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Card>
        <Card title="การแจ้งเตือนสำคัญ" pad={false}>
          <ul className="divide-y divide-line">
            {f.alerts.slice(0, 6).map((a) => { const t = DB[a.id.split('-')[0]]; return (
              <li key={a.id} className="flex items-start gap-2.5 px-4 py-2.5 text-[13px]"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-bad" /><div className="min-w-0 flex-1"><div className="truncate font-medium">{t?.title(a)}</div><div className="text-[12px] text-mute">{a.company} · <RecLink id={a.id} /></div></div><Badge s={a.validation === 'ถูกบล็อก' ? 'ถูกบล็อก' : a.status} /></li>) })}
            {f.alerts.length === 0 && <li className="p-4 text-[13px] text-mute">ไม่มีรายการผิดปกติ</li>}
          </ul>
        </Card>
      </div>
      <Card title="ภาพรวมรายบริษัท" className="mt-4" pad={false}>
        <div className="overflow-x-auto"><table className="w-full text-[13px]"><thead><tr className="bg-paper text-left text-[12px] text-mute"><th className="px-4 py-2">บริษัท</th><th className="px-4 py-2 text-right">รายได้</th><th className="px-4 py-2 text-right">ต้นทุนตรง</th><th className="px-4 py-2 text-right">กำไรสุทธิ</th><th className="px-4 py-2 text-right">ลูกหนี้</th><th className="px-4 py-2 text-right">รออนุมัติ</th><th className="px-4 py-2 text-right">ผิดปกติ</th></tr></thead>
          <tbody>{per.map(({ c, f: x }) => (
            <tr key={c} onClick={() => open(`${c} — รายการผิดปกติและรออนุมัติ`, [...x.alerts, ...x.pendList])} className={cx('cursor-pointer border-t border-line hover:bg-ruby-soft/50', company !== 'ALL' && company !== c && 'opacity-40')}><td className="px-4 py-2.5 font-semibold">{c}</td><td className="tnum px-4 py-2.5 text-right">{baht(x.revenue)}</td><td className="tnum px-4 py-2.5 text-right">{baht(x.direct)}</td><td className={cx('tnum px-4 py-2.5 text-right font-medium', x.net < 0 && 'text-bad')}>{baht(x.net)}</td><td className="tnum px-4 py-2.5 text-right">{baht(x.ar)}</td><td className="tnum px-4 py-2.5 text-right">{x.pendList.length}</td><td className="tnum px-4 py-2.5 text-right">{x.alerts.length}</td></tr>))}</tbody></table></div>
      </Card>
      {m && <RecordsModal title={m.title} rows={m.rows} onClose={() => setM(null)} />}
    </div>
  )
}

function Monitor() {
  const { company, role, inRange, tick } = useApp()
  const rows = useMemo(() => DB.TRP.rows.filter((r) => role.companies.includes(r.company) && (company === 'ALL' || r.company === company) && inRange(r.date)), [company, role, inRange, tick])
  const by = (s: (r: Rec) => boolean) => rows.filter(s).length
  return (
    <div>
      <PageHead title="ติดตามงานขนส่ง" desc="มุมมองอ่านอย่างเดียวสำหรับผู้บริหาร — เที่ยววิ่งทั้งหมดและความผิดปกติ" />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Kpi label="เที่ยววิ่งทั้งหมด" value={rows.length} />
        <Kpi label="กำลังดำเนินการ" value={by((r) => r.status === 'กำลังดำเนินการ')} />
        <Kpi label="ผิดปกติ" value={by((r) => ['ผิดปกติ', 'ซ้ำ', 'ขาดเอกสาร'].includes(r.status))} tone="bad" />
        <Kpi label="อัตราผ่านอัตโนมัติ" value={rows.length ? Math.round((by((r) => r.status === 'ตรวจสอบแล้ว') / rows.length) * 100) + '%' : '-'} tone="ok" />
      </div>
      <Callout tone="info">ผู้บริหารดูได้อย่างเดียว — การแก้ไขเที่ยววิ่งทำได้ใน Transport ERP โดยฝ่ายปฏิบัติการ</Callout>
      <div className="mt-4"><TablePage {...TABLES.trips} title="เที่ยววิ่งทั้งหมด" noAdd kpis={undefined} desc="คลิกแถวเพื่อดูเอกสาร ค่าใช้จ่าย น้ำมัน และกำไรของเที่ยวนั้น" /></div>
    </div>
  )
}

function Recon() {
  const { company, role, inRange, tick, go } = useApp()
  const rows = useMemo(() => {
    const ok = (r: Rec) => role.companies.includes(r.company) && (company === 'ALL' || r.company === company) && inRange(r.date)
    const items = [
      ['กระทบยอดน้ำมัน', 'FTX', (r: Rec) => r.status !== 'ตรงกัน', '/transport/fuel-recon'], ['กระทบยอดธนาคาร', 'BNK', (r: Rec) => r.status !== 'ตรงกัน', '/transport/bank-recon'],
      ['กระทบยอดลูกค้าขนส่ง', 'RCN', (r: Rec) => r.status !== 'ตรงกัน', '/transport/cus-recon'], ['กระทบยอดเวลาลูกค้า', 'ARC', (r: Rec) => r.status !== 'ตรงกัน', '/workforce/att-recon'],
      ['กระทบยอดจ่ายเงินเดือน', 'PPR', (r: Rec) => r.status !== 'กระทบยอดแล้ว', '/workforce/pay-recon'], ['กระทบยอดบิล Workforce', 'WCR', (r: Rec) => r.status !== 'ตรงกัน', '/workforce/wbill-recon'],
    ] as const
    return items.map(([n, p, bad, to]) => { const all = DB[p].rows.filter((r) => !r.company || ok(r) || p === 'BNK'); const open = all.filter(bad); return { n, p, to, all, open } })
  }, [company, role, inRange, tick])
  return (
    <div>
      <PageHead title="กระทบยอดการเงินรวม" desc="สถานะการกระทบยอดทุกด้านทั้งกลุ่ม — คลิกเพื่อไปยังหน้างานที่ต้องแก้" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => {
          const pct = r.all.length ? Math.round(((r.all.length - r.open.length) / r.all.length) * 100) : 100
          return (
            <Card key={r.p}><div className="flex items-start justify-between"><div className="font-semibold">{r.n}</div><Badge s={r.open.length ? `ค้าง ${r.open.length}` : 'ตรงทั้งหมด'} tone={r.open.length ? 'warn' : 'ok'} /></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper"><div className="h-full rounded-full bg-ok" style={{ width: pct + '%' }} /></div>
              <div className="mt-1.5 flex justify-between text-[12px] text-mute"><span>{r.all.length - r.open.length}/{r.all.length} รายการตรงกัน</span><span>{pct}%</span></div>
              <div className="mt-3 flex flex-wrap gap-1.5">{r.open.slice(0, 3).map((o) => <RecLink key={o.id} id={o.id} />)}</div>
              <Btn sm className="mt-3" onClick={() => go(r.to)}>ไปที่หน้างาน</Btn></Card>
          )
        })}
      </div>
    </div>
  )
}

export default function ExecPage({ page }: { page: string }) {
  switch (page) {
    case 'overview': return <Overview />
    case 'transport-monitor': return <Monitor />
    case 'expense-approval': return <TablePage {...TABLES['expense-approval']} />
    case 'payroll-approve': return <TablePage {...TABLES['payroll-approve']} />
    case 'reconciliation': return <Recon />
    case 'reports': return <ReportsPage app="exec" />
    case 'validation': return <ValidationPage />
    case 'notifications': return <NotificationsPage />
    case 'integrations': return <IntegrationsPage />
    default: return <Overview />
  }
}
