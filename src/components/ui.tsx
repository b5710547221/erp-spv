import { useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle, Check, CheckCircle2, FileText, Inbox, Info, Loader2, X, XCircle } from 'lucide-react'
import { isRecId, type Rec } from '../lib/data'
import { useApp } from '../lib/store'

export const baht = (n: number | undefined, sign = false) =>
  n === undefined || n === null ? '-' : (sign && n > 0 ? '+' : '') + '฿' + Math.round(n).toLocaleString('en-US')
const TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
export const fmtDate = (d?: string) => {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return d ?? '-'
  return `${+d.slice(8)} ${TH_M[+d.slice(5, 7) - 1]} ${String(+d.slice(0, 4) + 543).slice(2)}`
}
export const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(' ')

const GOOD = ['ผ่าน', 'อนุมัติแล้ว', 'อนุมัติ', 'จ่ายแล้ว', 'กระทบยอดแล้ว', 'ปิดแล้ว', 'ปกติ', 'ตรงกัน', 'ใช้งาน', 'ครบถ้วน', 'ชำระแล้ว', 'ตรวจสอบแล้ว', 'เสร็จสิ้น', 'ถูกต้อง', 'ยืนยันแล้ว', 'ทำงาน', 'พร้อม', 'ปิดยอดแล้ว', 'คำนวณแล้ว', 'พร้อมใช้งาน', 'แก้ไขแล้ว', 'ผ่านแล้ว', 'ครบ', 'ส่งแล้ว']
const WARN = ['เตือน', 'รออนุมัติ', 'รอตรวจสอบ', 'ส่งกลับแก้ไข', 'รอชำระ', 'ใกล้หมดอายุ', 'ไม่ครบ', 'สาย', 'ต้องตรวจสอบ', 'ซ่อมบำรุง', 'ลาพัก', 'ต่ำกว่าเป้า', 'กำลังคนไม่พอ', 'ซ้อนทับกะ', 'รอส่ง', 'ไม่ว่าง', 'ตรวจซ้ำ', 'มอบหมายตรวจสอบ', 'ไม่ได้แจ้ง', 'สูง', 'ผ่านการตรวจสอบอัตโนมัติ']
const BAD = ['ถูกบล็อก', 'ปฏิเสธ', 'ผิดปกติ', 'ซ้ำ', 'เกินกำหนด', 'ขาด OUT', 'หมดอายุ', 'ไม่ตรงกัน', 'ล้มเหลว', 'ข้อพิพาท', 'ขาดเอกสาร', 'ขาดทุน', 'ไม่ถูกต้อง', 'ไม่ได้รับอนุมัติ', 'ไม่อนุมัติ', 'ลาออก']
const INFO = ['กำลังดำเนินการ', 'ใหม่', 'ร่าง', 'สมัครใหม่', 'คัดกรอง', 'สัมภาษณ์', 'ทดลองงาน', 'ส่งแล้ว']
export const toneOf = (s: string): 'ok' | 'warn' | 'bad' | 'info' | 'mute' => {
  if (BAD.some((x) => s === x || s.startsWith('ขาด '))) return 'bad'
  if (s.startsWith('รอคืน') || s.startsWith('ขาด (')) return 'warn'
  if (WARN.includes(s)) return s === 'สูง' ? 'bad' : 'warn'
  if (GOOD.includes(s)) return 'ok'
  if (INFO.includes(s) || s.startsWith('Demo')) return 'info'
  return 'mute'
}
const TONE = {
  ok: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warn: 'bg-amber-50 text-amber-800 ring-amber-200',
  bad: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
  mute: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
}
const DOT = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', info: 'bg-sky-500', mute: 'bg-zinc-400' }
export function Badge({ s, tone }: { s: string; tone?: keyof typeof TONE }) {
  const t = tone ?? toneOf(s)
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium ring-1 ring-inset', TONE[t])}>
      <span className={cx('size-1.5 rounded-full', DOT[t])} />
      {s}
    </span>
  )
}

export function Logo({ size = 'sm' }: { size?: 'sm' | 'lg' | 'full' }) {
  const ratio = 1254 / 900
  return (
    <div className="overflow-hidden bg-black" style={{ aspectRatio: String(ratio) }}>
      <img src="/ptnex-brand.png" alt="P.T.NEX — People Trust Next" className="size-full object-cover object-top" style={size === 'sm' ? { objectPosition: '50% 0%' } : {}} />
    </div>
  )
}

type BtnProps = { children: ReactNode; onClick?: () => void; v?: 'pri' | 'ghost' | 'dark' | 'danger' | 'ok' | 'warn'; sm?: boolean; disabled?: boolean; title?: string; type?: 'button' | 'submit'; className?: string }
export function Btn({ children, onClick, v = 'ghost', sm, disabled, title, type = 'button', className }: BtnProps) {
  const s = {
    pri: 'bg-ruby text-white hover:bg-ruby-dark',
    dark: 'bg-ink text-white hover:bg-black',
    ghost: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-paper',
    danger: 'bg-white text-bad ring-1 ring-inset ring-red-200 hover:bg-red-50',
    ok: 'bg-ok text-white hover:bg-emerald-700',
    warn: 'bg-white text-amber-700 ring-1 ring-inset ring-amber-300 hover:bg-amber-50',
  }[v]
  return (
    <button type={type} title={title} disabled={disabled} onClick={onClick}
      className={cx('inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:opacity-40', sm ? 'h-8 px-2.5 text-[13px]' : 'h-9 px-3.5 text-sm', s, className)}>
      {children}
    </button>
  )
}

export function Card({ title, right, children, className, pad = true }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cx('rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(16,16,20,.04)]', className)}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h3 className="text-[14px] font-semibold">{title}</h3>
          {right}
        </header>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  )
}

export function PageHead({ title, desc, right, crumbs }: { title: string; desc?: string; right?: ReactNode; crumbs?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {crumbs && <div className="mb-1 text-[12px] uppercase tracking-wider text-mute">{crumbs}</div>}
        <h1 className="text-[22px] font-semibold leading-tight">{title}</h1>
        {desc && <p className="mt-1 max-w-3xl text-[13px] text-mute">{desc}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  )
}

export function Kpi({ label, value, sub, tone, onClick, delta }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'bad' | 'ok' | 'warn'; onClick?: () => void; delta?: string }) {
  const Tag: any = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={cx('group rounded-xl border border-line bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,16,20,.04)]', onClick && 'transition hover:border-ruby hover:shadow-md')}>
      <div className="flex items-center justify-between text-[12px] text-mute">
        <span>{label}</span>
        {onClick && <span className="text-ruby opacity-0 transition group-hover:opacity-100">ดูรายการ →</span>}
      </div>
      <div className={cx('tnum mt-1.5 text-[24px] font-semibold leading-none', tone === 'bad' && 'text-bad', tone === 'ok' && 'text-ok', tone === 'warn' && 'text-amber-600')}>{value}</div>
      {(sub || delta) && <div className="mt-2 text-[12px] text-mute">{delta && <b className={cx('mr-1', delta.startsWith('-') ? 'text-bad' : 'text-ok')}>{delta}</b>}{sub}</div>}
    </Tag>
  )
}

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; n?: number }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="scroll flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cx('-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition', value === t.id ? 'border-ruby text-ruby' : 'border-transparent text-mute hover:text-ink')}>
          {t.label}{t.n !== undefined && <span className="ml-1.5 rounded bg-paper px-1.5 text-[11px] text-mute">{t.n}</span>}
        </button>
      ))}
    </div>
  )
}

export function Modal({ title, children, onClose, footer, wide }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  }, [onClose])
  return (
    <div className="anim-fade fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal className={cx('flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-2xl', wide ? 'max-w-4xl' : 'max-w-lg')}>
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="ปิด" className="rounded p-1 text-mute hover:bg-paper"><X size={18} /></button>
        </header>
        <div className="scroll overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
      </div>
    </div>
  )
}

export function Field({ label, error, required, children, hint }: { label: string; error?: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium">{label}{required && <span className="text-bad"> *</span>}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[12px] text-mute">{hint}</span>}
      {error && <span role="alert" className="mt-1 flex items-center gap-1 text-[12px] text-bad"><AlertTriangle size={12} />{error}</span>}
    </label>
  )
}
export const inputCls = (err?: boolean) => cx('h-9 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-ruby focus:ring-2 focus:ring-ruby/20', err ? 'border-bad' : 'border-line')

export function Empty({ title = 'ไม่พบข้อมูล', desc = 'ลองปรับตัวกรองหรือคำค้นหา' }: { title?: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-paper text-mute"><Inbox size={22} /></div>
      <div className="font-medium">{title}</div>
      <div className="text-[13px] text-mute">{desc}</div>
    </div>
  )
}
export function Loading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4" aria-busy>
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-paper" style={{ opacity: 1 - i * 0.15 }} />)}
    </div>
  )
}
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <XCircle className="text-bad" size={28} />
      <div className="font-medium">โหลดข้อมูลไม่สำเร็จ</div>
      <Btn onClick={onRetry} sm>ลองอีกครั้ง</Btn>
    </div>
  )
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'bad' | 'ok'; title?: string; children?: ReactNode }) {
  const s = { info: 'border-sky-200 bg-sky-50 text-sky-900', warn: 'border-amber-200 bg-amber-50 text-amber-900', bad: 'border-red-200 bg-red-50 text-red-900', ok: 'border-emerald-200 bg-emerald-50 text-emerald-900' }[tone]
  const I = { info: Info, warn: AlertTriangle, bad: XCircle, ok: CheckCircle2 }[tone]
  return (
    <div className={cx('flex gap-2.5 rounded-lg border p-3 text-[13px]', s)}>
      <I size={16} className="mt-0.5 shrink-0" />
      <div>{title && <div className="font-semibold">{title}</div>}{children}</div>
    </div>
  )
}

export function RecLink({ id }: { id: string }) {
  const { openRec } = useApp()
  return (
    <button onClick={(e) => { e.stopPropagation(); openRec(id) }} className="mono text-ruby underline-offset-2 hover:underline">{id}</button>
  )
}
export const cell = (v: any) => (isRecId(v) ? <RecLink id={v} /> : v === null || v === undefined || v === '' ? <span className="text-mute">-</span> : String(v))

export function Timeline({ items }: { items: { title: string; sub?: string; state: 'done' | 'now' | 'todo' | 'bad' }[] }) {
  return (
    <ol className="space-y-0">
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
          {i < items.length - 1 && <span className="absolute left-[11px] top-6 h-full w-px bg-line" />}
          <span className={cx('z-10 grid size-6 shrink-0 place-items-center rounded-full text-white', it.state === 'done' && 'bg-ok', it.state === 'now' && 'bg-ruby', it.state === 'todo' && 'bg-zinc-300', it.state === 'bad' && 'bg-bad')}>
            {it.state === 'done' ? <Check size={13} /> : it.state === 'bad' ? <X size={13} /> : <span className="size-1.5 rounded-full bg-white" />}
          </span>
          <div className="pt-0.5"><div className={cx('text-[13px] font-medium', it.state === 'todo' && 'text-mute')}>{it.title}</div>{it.sub && <div className="text-[12px] text-mute">{it.sub}</div>}</div>
        </li>
      ))}
    </ol>
  )
}

export function DocPreview({ name, amount, who }: { name: string; amount?: number; who?: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-line bg-paper p-3">
      <div className="grid h-24 w-[72px] shrink-0 place-items-center rounded border border-line bg-white shadow-sm">
        <div className="w-12 space-y-1">{[8, 6, 7, 5, 8, 4, 6].map((w, i) => <div key={i} className="h-[3px] rounded bg-zinc-300" style={{ width: `${w * 12}%` }} />)}</div>
      </div>
      <div className="min-w-0 text-[13px]">
        <div className="flex items-center gap-1.5 font-medium"><FileText size={14} className="text-ruby" /><span className="mono truncate">{name}</span></div>
        {who && <div className="mt-1 text-mute">ผู้รับเงิน: {who}</div>}
        {amount !== undefined && <div className="text-mute">ยอดในเอกสาร: {baht(amount)}</div>}
        <div className="mt-1 text-[12px] text-mute">ตัวอย่างเอกสาร (ข้อมูลสาธิต)</div>
      </div>
    </div>
  )
}

export function ValidationList({ checks }: { checks: { rule: string; result: string; detail: string }[] }) {
  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      {checks.map((c, i) => (
        <li key={i} className="flex items-start justify-between gap-3 px-3 py-2">
          <div className="min-w-0"><div className="text-[13px] font-medium">{c.rule}</div><div className="text-[12px] text-mute">{c.detail}</div></div>
          <Badge s={c.result} />
        </li>
      ))}
    </ul>
  )
}

export function Spinner() { return <Loader2 className="spin" size={16} /> }
export const Section = ({ children }: { children: ReactNode }) => <div className="space-y-4">{children}</div>

export function useBusy(ms = 700) {
  const [busy, set] = useState(false)
  return [busy, (fn?: () => void) => { set(true); setTimeout(() => { set(false); fn?.() }, ms) }] as const
}
export const exportCsv = (name: string, rows: Rec[], cols: string[]) => {
  const csv = '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = name + '.csv'
  a.click()
}
