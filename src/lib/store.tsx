import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AUDIT_SEED, DB, ROLES, TODAY, USERS, findRec, prefixOf, type Action, type Rec, type Role, type User } from './data'

export const RANGES = [
  { id: 'today', label: 'วันนี้', from: TODAY },
  { id: '7d', label: '7 วันล่าสุด', from: '2026-10-12' },
  { id: 'month', label: 'ต.ค. 2569', from: '2026-10-01' },
  { id: 'quarter', label: 'ไตรมาส 4/2569', from: '2026-07-01' },
  { id: 'all', label: 'ทั้งหมด', from: '0000-00-00' },
]
export type Toast = { id: number; text: string; tone: 'ok' | 'bad' | 'warn' | 'info' }
export type Pending = { rec: Rec; action: Action } | null

type Ctx = {
  user: User | null
  role: Role
  login: (u: User) => void
  logout: (to?: string) => void
  company: string
  setCompany: (c: string) => void
  range: string
  setRange: (r: string) => void
  inRange: (d?: string) => boolean
  path: string
  go: (p: string) => void
  openId: string | null
  openRec: (id: string | null) => void
  tick: number
  bump: () => void
  toast: (text: string, tone?: Toast['tone']) => void
  toasts: Toast[]
  pending: Pending
  setPending: (p: Pending) => void
  runAction: (rec: Rec, a: Action, reason?: string) => void
  audit: { id: string; at: string; by: string; text: string }[]
  addAudit: (id: string, text: string) => void
  addRecord: (prefix: string, data: Record<string, any>) => Rec
  updateRecord: (id: string, data: Record<string, any>) => void
  readIds: Set<string>
  markRead: (id: string) => void
}
const C = createContext<Ctx>(null as any)
export const useApp = () => useContext(C)

const getPath = () => (location.hash.replace(/^#/, '') || '/login').split('?')[0]
const stamp = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

export function Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('ptnex-user') || 'null') } catch { return null }
  })
  const [company, setCompany] = useState(() => sessionStorage.getItem('ptnex-co') || 'ALL')
  const [range, setRange] = useState('all')
  const [path, setPath] = useState(getPath())
  const [openId, openRec] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<Pending>(null)
  const [audit, setAudit] = useState(AUDIT_SEED)
  const [readIds, setRead] = useState<Set<string>>(new Set())

  useEffect(() => {
    const f = () => { setPath(getPath()); openRec(null) }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  const role = ROLES.find((r) => r.id === user?.role) ?? ROLES[0]
  const go = useCallback((p: string) => { location.hash = p }, [])
  const bump = useCallback(() => setTick((t) => t + 1), [])
  const toast = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])
  const addAudit = useCallback((id: string, text: string) => {
    setAudit((a) => [{ id, at: stamp(), by: user?.name ?? 'ระบบ', text }, ...a])
  }, [user])
  const login = (u: User) => { setUser(u); sessionStorage.setItem('ptnex-user', JSON.stringify(u)) }
  const logout = (to = '/login') => { setUser(null); sessionStorage.removeItem('ptnex-user'); sessionStorage.removeItem('ptnex-co'); setCompany('ALL'); go(to) }
  const setCo = (c: string) => { setCompany(c); sessionStorage.setItem('ptnex-co', c) }
  const inRange = useCallback((d?: string) => !d || d >= (RANGES.find((r) => r.id === range)?.from ?? ''), [range])

  const runAction = useCallback((rec: Rec, a: Action, reason?: string) => {
    const from = rec.status
    rec.status = a.to
    if (a.to === 'อนุมัติแล้ว') rec.approver = user?.name
    if (a.reason && reason) rec.rejectReason = reason
    if (a.to === 'ปิดยอดแล้ว') rec.settled = 'ปิดยอดแล้ว'
    if (rec.id.startsWith('EXP') && a.to === 'อนุมัติแล้ว') rec.batch = rec.batch ?? 'BAT-2610-0003'
    addAudit(rec.id, `${a.label}: ${from} → ${a.to}${reason ? ` — เหตุผล: ${reason}` : ''}`)
    bump()
    toast(`${a.label}สำเร็จ · ${rec.id}`, a.tone === 'bad' ? 'warn' : 'ok')
  }, [user, addAudit, bump, toast])

  const addRecord = (prefix: string, data: Record<string, any>) => {
    const ds = DB[prefix]
    const n = ds.rows.length + 1
    const oldId = ds.rows[0]?.id ?? ''
    const id = data.id || (/\d{4}-\d{4}$/.test(oldId) ? `${prefix}-2610-${String(n).padStart(4, '0')}` : `${prefix}-${String(n).padStart(oldId.split('-')[1]?.length || 3, '0')}`)
    const rec: Rec = { date: TODAY, ...data, id }
    ds.rows.unshift(rec)
    addAudit(id, 'สร้างรายการใหม่')
    bump()
    return rec
  }
  const updateRecord = (id: string, data: Record<string, any>) => {
    const f = findRec(id)
    if (!f) return
    Object.assign(f.rec, data)
    addAudit(id, 'แก้ไขข้อมูล: ' + Object.keys(data).join(', '))
    bump()
  }
  const markRead = (id: string) => setRead((s) => new Set(s).add(id))

  const v = useMemo<Ctx>(() => ({
    user, role, login, logout, company, setCompany: setCo, range, setRange, inRange, path, go, openId, openRec, tick, bump, toast, toasts,
    pending, setPending, runAction, audit, addAudit, addRecord, updateRecord, readIds, markRead,
  }), [user, role, company, range, path, openId, tick, toasts, pending, audit, readIds, inRange, go, bump, toast, runAction, addAudit])
  return <C.Provider value={v}>{children}</C.Provider>
}
export { USERS, prefixOf }
