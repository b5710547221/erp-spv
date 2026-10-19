import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Bell, Building2, CalendarDays, ChevronDown, LogOut, Menu, Repeat, Search, UserCircle2, X } from 'lucide-react'
import { DB, ROLES, findRec, isRecId } from '../lib/data'
import { APP_META, NAV, canSee } from '../lib/nav'
import { RANGES, useApp } from '../lib/store'
import { ActionDialog, RecordDrawer } from './engine'
import { Badge, Logo, cx, fmtDate } from './ui'

function Pop({ open, onClose, children, align = 'right', w = 'w-72' }: { open: boolean; onClose: () => void; children: ReactNode; align?: 'left' | 'right'; w?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const f = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    setTimeout(() => addEventListener('mousedown', f))
    return () => removeEventListener('mousedown', f)
  }, [open, onClose])
  if (!open) return null
  return <div ref={ref} className={cx('anim-fade absolute top-full z-50 mt-2 rounded-xl border border-line bg-white p-1.5 shadow-xl', w, align === 'right' ? 'right-0' : 'left-0')}>{children}</div>
}
const PopItem = ({ children, onClick, active }: { children: ReactNode; onClick: () => void; active?: boolean }) => (
  <button onClick={onClick} className={cx('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-paper', active && 'bg-ruby-soft font-medium text-ruby-dark')}>{children}</button>
)

export default function Shell({ app, page, children }: { app: 'exec' | 'transport' | 'workforce'; page: string; children: ReactNode }) {
  const { user, role, go, company, setCompany, range, setRange, logout, toasts, openRec, readIds, markRead, tick } = useApp()
  const [menu, setMenu] = useState(false)
  const [pop, setPop] = useState<'co' | 'date' | 'ntf' | 'user' | 'app' | null>(null)
  const [q, setQ] = useState('')
  const close = () => setPop(null)
  const groups = NAV[app].map((g) => ({ ...g, items: g.items.filter((i) => canSee(role, i)) })).filter((g) => g.items.length)
  const cos = (app === 'exec' ? ['SPV', 'TKQ', 'THRS', 'T&A', 'SPT', 'TPL'] : app === 'transport' ? ['SPV', 'TKQ', 'THRS', 'T&A'] : ['SPT', 'TPL']).filter((c) => role.companies.includes(c))
  const curCo = company !== 'ALL' && cos.includes(company) ? company : 'ALL'
  const meta = APP_META[app]
  const cur = NAV[app].flatMap((g) => g.items.map((i) => ({ ...i, group: g.group }))).find((i) => i.id === page)
  const ntfs = DB.NTF.rows.filter((n) => role.companies.includes(n.company) && (curCo === 'ALL' || n.company === curCo))
  const unread = ntfs.filter((n) => !readIds.has(n.id)).length
  const results = q.trim().length >= 2 ? Object.values(DB).flatMap((d) => d.rows.filter((r) => r.id.toLowerCase().includes(q.toLowerCase()) || String(d.title(r)).toLowerCase().includes(q.toLowerCase())).slice(0, 3).map((r) => ({ d, r }))).slice(0, 8) : []
  const nav = (id: string) => { go(`/${app}/${id}`); setMenu(false) }
  return (
    <div className="flex h-full bg-paper">
      {menu && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenu(false)} />}
      <aside className={cx('fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col bg-side text-zinc-300 transition-transform lg:static lg:translate-x-0', menu ? 'translate-x-0' : '-translate-x-full')}>
        <div className="relative px-4 pt-4">
          <div className="mx-auto w-[150px]"><Logo /></div>
          <button className="absolute right-3 top-3 rounded p-1 text-zinc-400 hover:text-white lg:hidden" onClick={() => setMenu(false)} aria-label="ปิดเมนู"><X size={18} /></button>
          <div className="relative mt-3">
            <button onClick={() => setPop(pop === 'app' ? null : 'app')} className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10">
              <span><span className="block text-[11px] uppercase tracking-wider text-zinc-500">แอปพลิเคชัน</span><span className="block text-[13px] font-semibold text-white">{meta.name}</span></span>
              {role.apps.length > 1 && <ChevronDown size={15} />}
            </button>
            {role.apps.length > 1 && <Pop open={pop === 'app'} onClose={close} align="left" w="w-full">
              {role.apps.map((a) => <PopItem key={a} active={a === app} onClick={() => { close(); go(a === 'exec' ? '/exec/overview' : `/${a}/dashboard`) }}>{APP_META[a].name}</PopItem>)}
            </Pop>}
          </div>
        </div>
        <nav className="scroll mt-3 flex-1 overflow-y-auto px-3 pb-4" aria-label="เมนูหลัก">
          {groups.map((g) => (
            <div key={g.group} className="mb-3">
              <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">{g.group}</div>
              {g.items.map((i) => (
                <button key={i.id} onClick={() => nav(i.id)} aria-current={page === i.id ? 'page' : undefined}
                  className={cx('mb-px flex w-full items-center gap-2 rounded-lg px-3 py-[7px] text-left text-[13px] transition', page === i.id ? 'bg-ruby font-medium text-white' : 'hover:bg-white/8 hover:text-white')}>
                  {i.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 text-[11px] leading-relaxed text-zinc-500">P.T.NEX — PEOPLE • TRUST • NEXT<br />ต้นแบบเชิงโต้ตอบ · ข้อมูลสาธิต</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:px-5">
          <button className="rounded p-2 hover:bg-paper lg:hidden" onClick={() => setMenu(true)} aria-label="เปิดเมนู"><Menu size={18} /></button>
          <div className="relative w-full max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหารหัสรายการ เช่น TRP-2610-0014, EMP-0007" aria-label="ค้นหาทั้งระบบ" className="h-9 w-full rounded-lg border border-line bg-paper pl-9 pr-3 text-[13px] outline-none focus:border-ruby focus:bg-white" />
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-line bg-white p-1.5 shadow-xl">
                {results.map(({ d, r }) => <PopItem key={r.id} onClick={() => { setQ(''); openRec(r.id) }}><span className="mono text-ruby">{r.id}</span><span className="truncate text-mute">{d.label} · {d.title(r)}</span></PopItem>)}
              </div>
            )}
            {q.trim().length >= 2 && results.length === 0 && <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-line bg-white p-4 text-center text-[13px] text-mute shadow-xl">ไม่พบรายการที่ตรงกับ “{q}”</div>}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative hidden sm:block">
              <button onClick={() => setPop(pop === 'co' ? null : 'co')} className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-[13px] hover:bg-paper"><Building2 size={15} />{curCo === 'ALL' ? 'ทุกบริษัท' : curCo}<ChevronDown size={13} /></button>
              <Pop open={pop === 'co'} onClose={close} w="w-56">
                <PopItem active={curCo === 'ALL'} onClick={() => { setCompany('ALL'); close() }}>ทุกบริษัท ({cos.length})</PopItem>
                {cos.map((c) => <PopItem key={c} active={curCo === c} onClick={() => { setCompany(c); close() }}>{c}</PopItem>)}
              </Pop>
            </div>
            <div className="relative hidden md:block">
              <button onClick={() => setPop(pop === 'date' ? null : 'date')} className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-[13px] hover:bg-paper"><CalendarDays size={15} />{RANGES.find((r) => r.id === range)!.label}<ChevronDown size={13} /></button>
              <Pop open={pop === 'date'} onClose={close} w="w-48">{RANGES.map((r) => <PopItem key={r.id} active={range === r.id} onClick={() => { setRange(r.id); close() }}>{r.label}</PopItem>)}</Pop>
            </div>
            <div className="relative">
              <button onClick={() => setPop(pop === 'ntf' ? null : 'ntf')} className="relative grid size-9 place-items-center rounded-lg border border-line hover:bg-paper" aria-label="การแจ้งเตือน">
                <Bell size={16} />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-ruby px-1 text-[10px] font-semibold text-white">{unread}</span>}
              </button>
              <Pop open={pop === 'ntf'} onClose={close} w="w-[min(380px,calc(100vw-24px))]">
                <div className="flex items-center justify-between px-3 py-2"><b className="text-[13px]">การแจ้งเตือน</b><button className="text-[12px] text-ruby" onClick={() => ntfs.forEach((n) => markRead(n.id))}>อ่านทั้งหมด</button></div>
                <div className="scroll max-h-[380px] overflow-y-auto">
                  {ntfs.slice(0, 6).map((n) => (
                    <button key={n.id} onClick={() => { markRead(n.id); close(); openRec(n.ref) }} className="flex w-full gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-paper">
                      <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', readIds.has(n.id) ? 'bg-zinc-300' : n.severity === 'สูง' ? 'bg-bad' : 'bg-warn')} />
                      <span className="min-w-0"><span className="block text-[13px] font-medium">{n.type} <span className="mono text-[12px] text-ruby">{n.ref}</span></span><span className="block truncate text-[12px] text-mute">{n.company} · {n.msg}</span><span className="text-[11px] text-mute">{n.time}</span></span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { close(); go(`/${app}/notifications`) }} className="mt-1 w-full rounded-lg border-t border-line px-3 py-2 text-center text-[13px] font-medium text-ruby hover:bg-paper">ดูทั้งหมด</button>
              </Pop>
            </div>
            <div className="relative">
              <button onClick={() => setPop(pop === 'user' ? null : 'user')} className="flex h-9 items-center gap-2 rounded-lg pl-1 pr-2 hover:bg-paper">
                <span className="grid size-8 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">{user!.name.slice(0, 1)}</span>
                <span className="hidden text-left leading-tight xl:block"><span className="block text-[13px] font-medium">{user!.name}</span><span className="block text-[11px] text-mute">{role.th}</span></span>
              </button>
              <Pop open={pop === 'user'} onClose={close} w="w-60">
                <div className="border-b border-line px-3 py-2"><div className="text-[13px] font-medium">{user!.name}</div><div className="text-[12px] text-mute">{user!.email}</div><div className="mt-1"><Badge s={role.en} tone="mute" /></div></div>
                <PopItem onClick={() => { close(); go('/profile') }}><UserCircle2 size={15} />โปรไฟล์ผู้ใช้</PopItem>
                <PopItem onClick={() => { close(); go('/select-company') }}><Repeat size={15} />เปลี่ยนบริษัท / แอป</PopItem>
                <PopItem onClick={() => { close(); logout('/expired') }}><LogOut size={15} />จำลอง: เซสชันหมดอายุ</PopItem>
                <PopItem onClick={() => logout()}><LogOut size={15} />ออกจากระบบ</PopItem>
              </Pop>
            </div>
          </div>
        </header>
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-1 text-[12px] text-amber-900"><span className="size-1.5 rounded-full bg-warn" />โหมดสาธิต — ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่าง ไม่ใช่ข้อมูลจริง · การเชื่อมต่อภายนอกยังไม่ได้เปิดใช้งาน</div>
        <main className="scroll flex-1 overflow-y-auto p-4 sm:p-6" key={app + page}>
          <div className="mb-3 text-[12px] text-mute">{meta.name} / {cur?.group} / <span className="text-ink">{cur?.label}</span>{curCo !== 'ALL' && <> · <b className="text-ruby">{curCo}</b></>}</div>
          <div className="anim-fade mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
      <RecordDrawer />
      <ActionDialog />
      <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={cx('anim-slide pointer-events-auto max-w-sm rounded-lg px-4 py-2.5 text-[13px] font-medium text-white shadow-lg', t.tone === 'ok' ? 'bg-ink' : t.tone === 'bad' ? 'bg-bad' : t.tone === 'warn' ? 'bg-amber-600' : 'bg-sky-700')}>{t.text}</div>
        ))}
      </div>
    </div>
  )
}
export { ROLES, findRec, isRecId, fmtDate }
