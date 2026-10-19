import { useMemo } from 'react'
import { DB, type Rec } from './data'
import { useApp } from './store'

const sum = (a: Rec[], f: (r: Rec) => number) => a.reduce((s, r) => s + (f(r) || 0), 0)
export type Fin = ReturnType<typeof compute>
export function compute(ok: (r: Rec) => boolean) {
  const inv = DB.INV.rows.filter(ok), wbl = DB.WBL.rows.filter(ok)
  const exp = DB.EXP.rows.filter(ok).filter((r) => r.status !== 'ปฏิเสธ' && r.validation !== 'ถูกบล็อก')
  const trips = DB.TRP.rows.filter(ok)
  const prl = DB.PRL.rows.filter(ok).filter((r) => !['ปฏิเสธ', 'ถูกบล็อก'].includes(r.status))
  const revenue = sum(inv, (r) => r.amount) + sum(wbl, (r) => r.amount)
  const direct = sum(trips, (r) => r.cost) + sum(prl, (r) => r.net)
  const opex = sum(exp, (r) => r.amount)
  const ar = sum(inv, (r) => r.amount - r.paid) + sum(wbl, (r) => r.amount - r.paid)
  const overdue = sum(inv.filter((r) => r.status === 'เกินกำหนด'), (r) => r.amount) + sum(wbl.filter((r) => r.status === 'เกินกำหนด'), (r) => r.amount)
  const ap = sum(DB.EXP.rows.filter(ok).filter((r) => r.status === 'อนุมัติแล้ว'), (r) => r.amount) + sum(DB.PRL.rows.filter(ok).filter((r) => r.status === 'อนุมัติแล้ว'), (r) => r.net)
  const pendList = [
    ...DB.EXP.rows.filter(ok).filter((r) => r.status === 'รออนุมัติ'),
    ...DB.FUL.rows.filter(ok).filter((r) => r.status === 'รออนุมัติ'),
    ...DB.PRL.rows.filter(ok).filter((r) => r.status === 'รออนุมัติ'),
    ...DB.MPR.rows.filter(ok).filter((r) => r.status === 'รออนุมัติ'),
    ...DB.OTR.rows.filter(ok).filter((r) => r.status === 'รออนุมัติ'),
    ...DB.PEN.rows.filter(ok).filter((r) => r.status === 'รออนุมัติ'),
  ]
  const bad = (r: Rec) => ['ถูกบล็อก', 'ผิดปกติ', 'ซ้ำ', 'ข้อพิพาท', 'ไม่ตรงกัน'].includes(r.status) || r.validation === 'ถูกบล็อก'
  const alerts = [...DB.TRP.rows, ...DB.EXP.rows, ...DB.PRL.rows, ...DB.ATT.rows, ...DB.PAY.rows].filter(ok).filter(bad)
  const gross = revenue - direct
  return { inv, wbl, exp, trips, prl, revenue, direct, opex, gross, net: gross - opex, ar, overdue, ap, pendList, alerts }
}
export function useFin() {
  const { company, inRange, role, tick } = useApp()
  return useMemo(() => compute((r) => (!r.company || (role.companies.includes(r.company) && (company === 'ALL' || r.company === company))) && inRange(r.date)), [company, inRange, role, tick])
}
export const compact = (n: number) => (Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(2) + ' ล้าน' : Math.abs(n) >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : String(Math.round(n)))
