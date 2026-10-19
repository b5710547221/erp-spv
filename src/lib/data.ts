export type Rec = { id: string; [k: string]: any }
export type User = { id: string; name: string; email: string; role: string }
export type Action = {
  label: string
  to: string
  reason?: boolean
  tone?: 'ok' | 'bad' | 'warn' | 'pri'
  when?: (r: Rec) => boolean
  guard?: (r: Rec, u: Role, user: User) => string | null
  note?: string
}
export type DSet = {
  prefix: string
  label: string
  app: 'transport' | 'workforce' | 'exec' | 'shared'
  page: string
  rows: Rec[]
  title: (r: Rec) => string
  actions?: Action[]
}
export type Role = {
  id: string
  th: string
  en: string
  apps: ('exec' | 'transport' | 'workforce')[]
  companies: string[]
  perms: string[]
  limit: number
}

export const TODAY = '2026-10-19'
export const ALL_CO = ['SPV', 'TKQ', 'THRS', 'T&A', 'SPT', 'TPL']
export const TR_CO = ['SPV', 'TKQ', 'THRS', 'T&A']
export const WF_CO = ['SPT', 'TPL']
export const COMPANIES = [
  { code: 'SPV', name: 'SPV Transport', div: 'Transport' },
  { code: 'TKQ', name: 'TKQ Logistics', div: 'Transport' },
  { code: 'THRS', name: 'THRS Freight', div: 'Transport' },
  { code: 'T&A', name: 'T&A Express', div: 'Transport' },
  { code: 'SPT', name: 'SPT Workforce', div: 'Workforce' },
  { code: 'TPL', name: 'TPL Manpower', div: 'Workforce' },
]

export const ROLES: Role[] = [
  { id: 'super', th: 'ผู้ดูแลระบบสูงสุด', en: 'Super Admin', apps: ['exec', 'transport', 'workforce'], companies: ALL_CO, perms: ['*'], limit: 1e9 },
  { id: 'group', th: 'ผู้บริหารกลุ่ม', en: 'Group Executive', apps: ['exec'], companies: ALL_CO, perms: ['exec', 'approve', 'audit'], limit: 1e9 },
  { id: 'coexec', th: 'ผู้บริหารบริษัท', en: 'Company Executive', apps: ['exec', 'transport'], companies: ['SPV', 'TKQ'], perms: ['exec', 'approve', 'ops', 'cost', 'billing'], limit: 200000 },
  { id: 'tmgr', th: 'ผู้จัดการขนส่ง', en: 'Transport Manager', apps: ['transport'], companies: TR_CO, perms: ['ops', 'cost', 'approve', 'billing'], limit: 50000 },
  { id: 'tadmin', th: 'แอดมินขนส่ง', en: 'Transport Admin', apps: ['transport'], companies: ['SPV', 'TKQ'], perms: ['ops'], limit: 0 },
  { id: 'cost', th: 'ควบคุมต้นทุน', en: 'Cost Control', apps: ['transport'], companies: TR_CO, perms: ['ops', 'cost'], limit: 0 },
  { id: 'fin', th: 'เจ้าหน้าที่การเงิน', en: 'Finance Officer', apps: ['transport', 'workforce'], companies: ALL_CO, perms: ['finance', 'cost', 'billing'], limit: 0 },
  { id: 'payappr', th: 'ผู้อนุมัติการจ่ายเงิน', en: 'Payment Approver', apps: ['transport', 'workforce', 'exec'], companies: ALL_CO, perms: ['finance', 'approve'], limit: 500000 },
  { id: 'wmgr', th: 'ผู้จัดการ Workforce', en: 'Workforce Manager', apps: ['workforce'], companies: WF_CO, perms: ['hr', 'attend', 'payroll', 'approve', 'billing'], limit: 300000 },
  { id: 'whsup', th: 'หัวหน้าคลังสินค้า', en: 'Warehouse Supervisor', apps: ['workforce'], companies: ['SPT'], perms: ['attend'], limit: 0 },
  { id: 'wadmin', th: 'แอดมิน Workforce', en: 'Workforce Admin', apps: ['workforce'], companies: WF_CO, perms: ['hr', 'attend'], limit: 0 },
  { id: 'recruit', th: 'เจ้าหน้าที่สรรหา', en: 'Recruitment Officer', apps: ['workforce'], companies: WF_CO, perms: ['hr'], limit: 0 },
  { id: 'attchk', th: 'ผู้ตรวจเวลาทำงาน', en: 'Attendance Checker', apps: ['workforce'], companies: WF_CO, perms: ['attend'], limit: 0 },
  { id: 'payroll', th: 'เจ้าหน้าที่เงินเดือน', en: 'Payroll Officer', apps: ['workforce'], companies: WF_CO, perms: ['payroll', 'attend'], limit: 0 },
  { id: 'bill', th: 'เจ้าหน้าที่วางบิล', en: 'Billing Officer', apps: ['transport', 'workforce'], companies: ALL_CO, perms: ['billing'], limit: 0 },
  { id: 'audit', th: 'ผู้ตรวจสอบ', en: 'Auditor', apps: ['exec', 'transport', 'workforce'], companies: ALL_CO, perms: ['audit', 'view'], limit: 0 },
]
export const USERS: User[] = [
  { id: 'U01', name: 'ธนพล วงศ์ประเสริฐ', email: 'admin@ptnex.co.th', role: 'super' },
  { id: 'U02', name: 'วรากร พิทักษ์ไทย', email: 'ceo@ptnex.co.th', role: 'group' },
  { id: 'U03', name: 'ศิริพร เลิศวัฒนา', email: 'siriporn@spv.co.th', role: 'coexec' },
  { id: 'U04', name: 'สมชาย ใจดี', email: 'somchai@ptnex.co.th', role: 'tmgr' },
  { id: 'U05', name: 'กมลวรรณ แสงทอง', email: 'kamol@spv.co.th', role: 'tadmin' },
  { id: 'U06', name: 'ปิยะ รุ่งเรือง', email: 'piya@ptnex.co.th', role: 'cost' },
  { id: 'U07', name: 'นภา ศรีสุข', email: 'napa@ptnex.co.th', role: 'fin' },
  { id: 'U08', name: 'อนุชา มั่นคง', email: 'anucha@ptnex.co.th', role: 'payappr' },
  { id: 'U09', name: 'พัชรี บุญมา', email: 'patcharee@spt.co.th', role: 'wmgr' },
  { id: 'U10', name: 'ชัยวัฒน์ ทองดี', email: 'chaiwat@spt.co.th', role: 'whsup' },
  { id: 'U11', name: 'รัตนา สายชล', email: 'rattana@spt.co.th', role: 'wadmin' },
  { id: 'U12', name: 'ลลิตา เพชรแก้ว', email: 'lalita@tpl.co.th', role: 'recruit' },
  { id: 'U13', name: 'เอกชัย วงศ์ใหญ่', email: 'ekachai@spt.co.th', role: 'attchk' },
  { id: 'U14', name: 'จิราพร จันทร์เพ็ญ', email: 'jiraporn@tpl.co.th', role: 'payroll' },
  { id: 'U15', name: 'มณีรัตน์ พึ่งบุญ', email: 'maneerat@ptnex.co.th', role: 'bill' },
  { id: 'U16', name: 'ณัฐพล อินทรา', email: 'audit@ptnex.co.th', role: 'audit' },
]

const pad = (n: number, w = 4) => String(n).padStart(w, '0')
let seed = 20261019
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
const ri = (a: number, b: number) => Math.round(a + rnd() * (b - a))
export const dayOff = (n: number) => {
  const d = new Date(TODAY + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const ym = '2610'
const mk = (prefix: string, rows: Record<string, any>[], opts: { ym?: boolean; w?: number } = {}): Rec[] =>
  rows.map((r, i) => ({ ...r, id: r.id ?? (opts.ym === false ? `${prefix}-${pad(i + 1, opts.w ?? 3)}` : `${prefix}-${ym}-${pad(i + 1)}`) }))
const TH_F = ['สมชาย', 'สมหญิง', 'วิชัย', 'ประยุทธ', 'นภา', 'กมล', 'อรทัย', 'ธนากร', 'พัชรี', 'อนุชา', 'สุรีย์', 'ภานุวัฒน์', 'รัตนา', 'ศิริพร', 'ชัยวัฒน์', 'มณีรัตน์', 'ปิยะ', 'วราภรณ์', 'เอกชัย', 'จิราพร', 'สุเมธ', 'ลลิตา', 'ณัฐพล', 'กาญจนา']
const TH_L = ['ใจดี', 'แสงทอง', 'มั่นคง', 'พึ่งบุญ', 'ศรีสุข', 'รุ่งเรือง', 'บุญมา', 'ทองดี', 'สายชล', 'เพชรแก้ว', 'วงศ์ใหญ่', 'จันทร์เพ็ญ']

// ───────── Transport master ─────────
export const CUS_T = mk('TCU', [
  { name: 'Flash Express (OSM)', type: 'ขนส่งพัสดุ', terms: 30, status: 'ใช้งาน' },
  { name: 'SPX Express (Shopee)', type: 'ขนส่งพัสดุ', terms: 45, status: 'ใช้งาน' },
  { name: 'J&T Express', type: 'ขนส่งพัสดุ', terms: 30, status: 'ใช้งาน' },
  { name: 'บจก. สยามฟู้ดส์ซัพพลาย', type: 'สินค้าอุปโภค', terms: 60, status: 'ใช้งาน' },
], { ym: false, w: 2 })

export const ROUTES = mk('RTE', [
  { from: 'ศูนย์ฯ บางนา', to: 'ลำลูกกา', km: 62, stdHr: 2.5, stdFuel: 18, rate: 7800, approved: 'อนุมัติ' },
  { from: 'ศูนย์ฯ บางนา', to: 'นวนคร', km: 74, stdHr: 3, stdFuel: 22, rate: 8600, approved: 'อนุมัติ' },
  { from: 'ลำลูกกา', to: 'ขอนแก่น', km: 440, stdHr: 8, stdFuel: 118, rate: 24500, approved: 'อนุมัติ' },
  { from: 'บางนา', to: 'ชลบุรี (แหลมฉบัง)', km: 112, stdHr: 3.5, stdFuel: 31, rate: 11200, approved: 'อนุมัติ' },
  { from: 'บางพลี', to: 'โคราช', km: 255, stdHr: 5, stdFuel: 70, rate: 17800, approved: 'อนุมัติ' },
  { from: 'นวนคร', to: 'เชียงใหม่', km: 680, stdHr: 11, stdFuel: 180, rate: 38000, approved: 'อนุมัติ' },
  { from: 'บางนา', to: 'หาดใหญ่', km: 940, stdHr: 15, stdFuel: 250, rate: 52000, approved: 'อนุมัติ' },
  { from: 'บางนา', to: 'ระยอง (นอกเส้นทาง)', km: 190, stdHr: 4, stdFuel: 52, rate: 0, approved: 'ไม่อนุมัติ' },
], { ym: false, w: 2 }).map((r): Rec => ({ ...r, name: `${r.from} → ${r.to}` }))

const PLATES = ['1กข-2201', '1กข-2288', '2ฒก-4521', '2ฒก-4533', '70-1234', '70-1259', '71-3308', '71-3342', '3ขค-9012', '3ขค-9044', '4นน-1175', '4นน-1190', '5มม-6001', '5มม-6020']
export const VEHICLES = mk('VEH', PLATES.map((plate, i) => ({
  plate,
  company: TR_CO[i % 4],
  type: ['6 ล้อ', '10 ล้อ', 'หัวลาก', '4 ล้อตู้ทึบ'][i % 4],
  ownership: i < 8 ? 'รถบริษัท' : 'รถร่วม',
  owner: i < 8 ? 'P.T.NEX Group' : ['หจก. ศรีสุขขนส่ง', 'นายประเสริฐ ทองดี', 'หจก. พึ่งบุญทรานสปอร์ต'][i % 3],
  status: i === 6 ? 'ซ่อมบำรุง' : 'ใช้งาน',
  odo: ri(80000, 420000),
  util: ri(58, 94),
  docExp: dayOff(i === 3 ? 12 : i === 9 ? -4 : ri(40, 300)),
})), { ym: false })

export const DRIVERS = mk('DRV', TH_F.slice(0, 10).map((f, i) => ({
  name: `${f} ${TH_L[i % 12]}`,
  company: TR_CO[i % 4],
  license: `ท.${pad(ri(10000, 99999), 5)}`,
  licExp: dayOff(i === 5 ? 9 : ri(60, 500)),
  phone: `08${ri(1, 9)}-${ri(100, 999)}-${ri(1000, 9999)}`,
  vehicle: VEHICLES[i % 14].id,
  status: i === 8 ? 'ลาพัก' : 'ใช้งาน',
})), { ym: false })

// ───────── Trips ─────────
const BC = (n: number) => `BC-${88213000 + n}`
export const TRIPS = mk('TRP', Array.from({ length: 40 }, (_, i) => {
  const rt = ROUTES[i % 7]
  const v = VEHICLES[(i * 3) % 14]
  const dr = DRIVERS[(i * 7) % 10]
  const rev = Math.round(rt.rate * (0.96 + rnd() * 0.1))
  const cost = Math.round(rev * (0.62 + rnd() * 0.18))
  const co = v.company
  const r: any = {
    company: co, date: dayOff(-Math.floor(i * 0.6)), route: rt.name, routeId: rt.id,
    customer: CUS_T[i % 4].id, customerName: CUS_T[i % 4].name, vehicle: v.id, driver: dr.id, barcode: BC(i + 1),
    type: v.ownership, km: rt.km, hours: +(rt.stdHr * (0.9 + rnd() * 0.2)).toFixed(1), stdHr: rt.stdHr,
    revenue: rev, cost, docs: 'ครบ', status: i < 6 ? 'กำลังดำเนินการ' : 'ตรวจสอบแล้ว', stage: 'ตรวจสอบแล้ว',
  }
  return r
}))
Object.assign(TRIPS[0], { company: 'SPV', route: ROUTES[0].name, status: 'ตรวจสอบแล้ว', hours: 2.4, note: 'เที่ยวปกติ ผ่านทุกกฎตรวจสอบ' })
Object.assign(TRIPS[13], { route: 'บางนา → ระยอง (นอกเส้นทางอนุมัติ)', routeId: ROUTES[7].id, hours: 19.2, stdHr: 4, km: 190, status: 'ผิดปกติ', revenue: 0, note: 'ออกนอกเส้นทางอนุมัติ และใช้เวลานานผิดปกติ 4.8 เท่า' })
Object.assign(TRIPS[8], { barcode: BC(9) })
Object.assign(TRIPS[14], { barcode: BC(9), status: 'ซ้ำ', note: 'บาร์โค้ดซ้ำกับ TRP-2610-0009' })
Object.assign(TRIPS[20], { docs: 'ขาด (ใบส่งสินค้า)', status: 'ขาดเอกสาร' })
Object.assign(TRIPS[2], { status: 'ตรวจสอบแล้ว' })

// ───────── Fuel ─────────
export const FUELS = mk('FUL', Array.from({ length: 12 }, (_, i) => {
  const t = TRIPS[i + 1]
  const L = Math.round(ROUTES[t.routeId ? Number(t.routeId.slice(-2)) - 1 : 0].stdFuel * (0.95 + rnd() * 0.12))
  const amt = Math.round(L * 33.4)
  return {
    company: t.company, date: t.date, trip: t.id, vehicle: t.vehicle, driver: t.driver, liters: L, advance: amt, actual: amt - ri(0, 200),
    settled: 'ปิดยอดแล้ว', status: i < 3 ? 'รออนุมัติ' : 'อนุมัติแล้ว', requester: 'กมลวรรณ แสงทอง',
  }
}))
Object.assign(FUELS[3], { advance: 3000, actual: 2410, liters: 72, settled: 'รอคืนเงิน 590', status: 'อนุมัติแล้ว', note: 'เงินเบิกล่วงหน้า (Advance) รอสรุปยอดจริง — ไม่นับเป็นค่าใช้จ่ายเพิ่ม' })
Object.assign(FUELS[10], { liters: 160, advance: 5350, actual: 0, status: 'รออนุมัติ', settled: 'ยังไม่สรุป', note: 'ขอน้ำมันเกินมาตรฐานเส้นทาง (std 31 ลิตร)' })

export const FTX = mk('FTX', FUELS.slice(0, 10).map((f, i) => ({
  company: f.company, date: f.date, fuel: f.id, vehicle: f.vehicle, station: ['PTT Station บางนา', 'Shell ลำลูกกา', 'บางจาก นวนคร', 'PTT บางพลี'][i % 4],
  liters: f.liters, amount: f.actual || f.advance, card: `FC-${ri(1000, 9999)}`, status: 'ตรงกัน',
})))

// ───────── Expense / Payments ─────────
const EXP_T = ['ค่าทางด่วน', 'ค่าซ่อมบำรุง', 'ค่าที่พักคนขับ', 'ค่าล่วงเวลาคนขับ', 'ค่าปรับ/ค่าธรรมเนียม', 'ค่ายาง', 'ค่าล้างรถ']
const BEN = ['บจก. ทางด่วนไทย', 'หจก. ศรีสุขการช่าง', 'โรงแรมริเวอร์ไซด์', 'นายสมชาย ใจดี', 'บจก. ยางไทยเซอร์วิส', 'หจก. เพชรแก้วคาร์แคร์']
export const EXPENSES = mk('EXP', Array.from({ length: 16 }, (_, i) => {
  const t = TRIPS[i + 1]
  const amt = ri(8, 90) * 100
  return {
    company: t.company, date: dayOff(-i), type: EXP_T[i % 7], trip: t.id, vehicle: t.vehicle, beneficiary: BEN[i % 6], bank: `กสิกร xxx-x-${ri(10, 99)}${ri(100, 999)}-${ri(1, 9)}`,
    amount: amt, budget: Math.round(amt * (1.1 + rnd() * 0.5)), avg: Math.round(amt * (0.85 + rnd() * 0.3)),
    requester: ['กมลวรรณ แสงทอง', 'ปิยะ รุ่งเรือง'][i % 2], status: i < 7 ? 'รออนุมัติ' : 'อนุมัติแล้ว', validation: 'ผ่าน', doc: `DOC-${ri(1000, 9999)}.pdf`, level: amt > 5000 ? 2 : 1,
    batch: null, purpose: 'ค่าใช้จ่ายประกอบเที่ยววิ่ง',
  }
}))
Object.assign(EXPENSES[1], { status: 'จ่ายแล้ว', validation: 'ผ่าน', batch: 'BAT-2610-0001', payment: 'PAY-2610-0001', note: 'ตัวอย่างคำขอที่อนุมัติและจ่ายแล้ว' })
Object.assign(EXPENSES[2], { type: 'ค่าซ่อมบำรุง', amount: 4850, beneficiary: 'หจก. ศรีสุขการช่าง', status: 'รออนุมัติ', trip: TRIPS[3].id, vehicle: TRIPS[3].vehicle })
Object.assign(EXPENSES[6], { amount: 4850, type: 'ค่าซ่อมบำรุง', beneficiary: 'หจก. ศรีสุขการช่าง', trip: TRIPS[3].id, vehicle: TRIPS[3].vehicle, status: 'รออนุมัติ', validation: 'ถูกบล็อก', note: 'ซ้ำกับ EXP-2610-0003 (ผู้รับเงิน เที่ยว ยอด และใบเสร็จเดียวกัน)', dupOf: 'EXP-2610-0003' })
Object.assign(EXPENSES[8], { status: 'ปฏิเสธ', validation: 'เตือน', amount: 12600, type: 'ค่าปรับ/ค่าธรรมเนียม', rejectReason: 'ไม่มีใบเสร็จรับเงิน และเกินงบประมาณ' })
Object.assign(EXPENSES[4], { amount: 38500, budget: 24000, avg: 9800, type: 'ค่าซ่อมบำรุง', status: 'รออนุมัติ', validation: 'เตือน', level: 3, note: 'ยอดสูงกว่าค่าเฉลี่ยย้อนหลัง 3.9 เท่า' })
Object.assign(EXPENSES[5], { validation: 'ต้องตรวจสอบ', status: 'รออนุมัติ', note: 'บัญชีผู้รับเงินเพิ่งเพิ่มใหม่ ยังไม่เคยจ่าย' })

export const checksFor = (e: Rec) => {
  const names = ['เลขที่เที่ยววิ่ง (Trip ref)', 'บาร์โค้ด', 'ทะเบียนรถ', 'เลขที่ค่าใช้จ่าย', 'ผู้รับเงิน', 'บัญชีธนาคาร', 'งวดการจ่าย', 'ยอดที่เคยจ่ายแล้ว', 'ชุดการจ่าย (Batch)', 'ข้ามบริษัท']
  return names.map((rule, i) => {
    let result = 'ผ่าน', detail = 'ไม่พบรายการซ้ำ'
    if (e.dupOf && [0, 3, 4, 7].includes(i)) { result = 'ถูกบล็อก'; detail = `พบรายการเดียวกันใน ${e.dupOf}` }
    if (e.dupOf && i === 2) { result = 'เตือน'; detail = 'ทะเบียนเดียวกันมีค่าซ่อมในงวดนี้แล้ว' }
    if (e.validation === 'ต้องตรวจสอบ' && i === 5) { result = 'ต้องตรวจสอบ'; detail = 'บัญชีใหม่ — ยังไม่เคยมีประวัติจ่าย' }
    if (e.validation === 'เตือน' && i === 7) { result = 'เตือน'; detail = `ยอดสูงกว่าค่าเฉลี่ยย้อนหลัง (${Math.round(e.amount / (e.avg || 1) * 10) / 10} เท่า)` }
    return { rule, result, detail }
  })
}

export const PAYMENTS = mk('PAY', [
  { company: 'SPV', date: dayOff(-9), beneficiary: 'หจก. ศรีสุขขนส่ง (รถร่วม)', amount: 18200, trips: ['TRP-2610-0002'], batch: 'BAT-2610-0001', bank: 'BNK-2610-0001', status: 'กระทบยอดแล้ว', kind: 'ค่าเที่ยวรถร่วม' },
  { company: 'SPV', date: dayOff(-6), beneficiary: 'บจก. ทางด่วนไทย', amount: 3400, trips: ['TRP-2610-0002'], batch: 'BAT-2610-0001', bank: 'BNK-2610-0002', status: 'กระทบยอดแล้ว', kind: 'ค่าใช้จ่ายอื่น' },
  { company: 'TKQ', date: dayOff(-5), beneficiary: 'นายประเสริฐ ทองดี (รถร่วม)', amount: 22000, trips: ['TRP-2610-0003'], batch: 'BAT-2610-0002', bank: null, status: 'จ่ายแล้ว', kind: 'ค่าเที่ยวรถร่วม' },
  { company: 'THRS', date: dayOff(-4), beneficiary: 'หจก. พึ่งบุญทรานสปอร์ต', amount: 14500, trips: ['TRP-2610-0004'], batch: 'BAT-2610-0002', bank: 'BNK-2610-0005', status: 'ส่งแล้ว', kind: 'ค่าเที่ยวรถร่วม' },
  { company: 'SPV', date: dayOff(-3), beneficiary: 'หจก. ศรีสุขขนส่ง (รถร่วม)', amount: 62400, trips: ['TRP-2610-0001', 'TRP-2610-0002', 'TRP-2610-0003'], alloc: [21800, 19600, 21000], batch: 'BAT-2610-0003', bank: 'BNK-2610-0006', status: 'จ่ายแล้ว', kind: 'โอนรวมหลายเที่ยว', note: 'โอนครั้งเดียว 62,400 บาท จัดสรรให้ 3 เที่ยววิ่ง' },
  { company: 'T&A', date: dayOff(-2), beneficiary: 'หจก. ศรีสุขการช่าง', amount: 4850, trips: ['TRP-2610-0003'], batch: 'BAT-2610-0003', bank: null, status: 'ถูกบล็อก', kind: 'ค่าซ่อมบำรุง', note: 'ซ้ำกับ EXP-2610-0003' },
])
export const BATCHES = mk('BAT', [
  { company: 'SPV', date: dayOff(-9), count: 2, total: 21600, approver: 'อนุชา มั่นคง', status: 'กระทบยอดแล้ว' },
  { company: 'TKQ', date: dayOff(-5), count: 2, total: 36500, approver: 'อนุชา มั่นคง', status: 'จ่ายแล้ว' },
  { company: 'SPV', date: dayOff(-3), count: 2, total: 67250, approver: '-', status: 'รออนุมัติ', note: 'มีรายการถูกบล็อก 1 รายการ — ต้องนำออกก่อนอนุมัติ' },
])
export const BANKS = mk('BNK', [
  { date: dayOff(-9), amount: 18200, ref: 'KBANK-5521-8841', desc: 'โอนออก หจก. ศรีสุขขนส่ง', pay: 'PAY-2610-0001', status: 'ตรงกัน' },
  { date: dayOff(-6), amount: 3400, ref: 'KBANK-5521-8902', desc: 'โอนออก บจก. ทางด่วนไทย', pay: 'PAY-2610-0002', status: 'ตรงกัน' },
  { date: dayOff(-5), amount: 22000, ref: 'KBANK-5521-9013', desc: 'โอนออก นายประเสริฐ ทองดี', pay: null, status: 'ไม่ตรงกัน' },
  { date: dayOff(-4), amount: 14500, ref: 'SCB-1140-0072', desc: 'โอนออก หจก. พึ่งบุญฯ', pay: 'PAY-2610-0004', status: 'รอตรวจสอบ' },
  { date: dayOff(-3), amount: 5000, ref: 'KBANK-5521-9130', desc: 'โอนออก ไม่ระบุ', pay: null, status: 'ไม่ตรงกัน' },
  { date: dayOff(-3), amount: 62400, ref: 'KBANK-5521-9177', desc: 'โอนออก หจก. ศรีสุขขนส่ง', pay: 'PAY-2610-0005', status: 'ตรงกัน' },
], { w: 4 })

export const MAINT = mk('MNT', VEHICLES.slice(0, 8).map((v, i) => ({
  company: v.company, date: dayOff(-i * 3), vehicle: v.id, type: ['เปลี่ยนน้ำมันเครื่อง', 'เปลี่ยนยาง', 'ซ่อมเบรก', 'ตรวจเช็คตามระยะ'][i % 4],
  cost: ri(8, 60) * 100, expense: i === 2 ? 'EXP-2610-0003' : null, status: i === 6 ? 'กำลังดำเนินการ' : 'เสร็จสิ้น',
})))
export const VDOCS = mk('VDC', VEHICLES.flatMap((v, i) => [{ company: v.company, vehicle: v.id, type: 'ภาษีรถประจำปี', exp: v.docExp }, i % 3 === 0 ? { company: v.company, vehicle: v.id, type: 'ประกันภัย', exp: dayOff(ri(20, 330)) } : null].filter(Boolean) as any[]).map((d: any) => ({
  ...d, status: d.exp < TODAY ? 'หมดอายุ' : d.exp < dayOff(30) ? 'ใกล้หมดอายุ' : 'ถูกต้อง',
})), { ym: false, w: 3 })

export const INVOICES = mk('INV', Array.from({ length: 10 }, (_, i) => {
  const amt = ri(45, 95) * 1000
  const st = i < 4 ? 'ชำระแล้ว' : i < 8 ? 'รอชำระ' : 'เกินกำหนด'
  return { company: TR_CO[i % 4], date: dayOff(-i * 4 - 3), customer: CUS_T[i % 4].id, customerName: CUS_T[i % 4].name, period: 'ก.ย. 69', trips: ri(8, 22), amount: amt, due: dayOff(-i * 4 + 27 - (i >= 8 ? 55 : 0)), status: st, paid: st === 'ชำระแล้ว' ? amt : 0 }
}))
export const TRECON = mk('RCN', CUS_T.flatMap((c, i) => [0, 1].map((k) => {
  const mine = ri(45, 95) * 1000
  const diff = i === 1 && k === 0 ? -ri(6, 12) * 1000 : 0
  return { company: TR_CO[i], date: dayOff(-k * 30 - 4), customer: c.id, customerName: c.name, period: k ? 'ส.ค. 69' : 'ก.ย. 69', ours: mine, theirs: mine + diff, diff, status: diff ? 'ไม่ตรงกัน' : k ? 'ตรงกัน' : 'รอตรวจสอบ' }
})))
export const DUPCHK = mk('DUP', [
  ...EXPENSES.slice(0, 8).map((e) => ({ company: e.company, ref: e.id, kind: 'ค่าใช้จ่าย', beneficiary: e.beneficiary, amount: e.amount, result: e.validation, reason: e.validation === 'ผ่าน' ? 'ไม่พบรายการซ้ำ' : e.note || 'ต้องตรวจสอบ' })),
  ...PAYMENTS.map((p) => ({ company: p.company, ref: p.id, kind: 'การโอนเงิน', beneficiary: p.beneficiary, amount: p.amount, result: p.status === 'ถูกบล็อก' ? 'ถูกบล็อก' : 'ผ่าน', reason: p.status === 'ถูกบล็อก' ? 'ซ้ำกับ EXP-2610-0003 — ห้ามส่งเข้าอนุมัติจ่าย' : 'ไม่พบรายการซ้ำ' })),
  { company: 'SPV', ref: 'TRP-2610-0015', kind: 'เที่ยววิ่ง', beneficiary: '-', amount: TRIPS[14].revenue, result: 'ต้องตรวจสอบ', reason: 'บาร์โค้ด BC-88213009 ซ้ำกับ TRP-2610-0009 (ข้ามบริษัท)' },
])
export const PROFIT = mk('PFT', TRIPS.slice(0, 20).map((t) => ({ company: t.company, date: t.date, trip: t.id, vehicle: t.vehicle, revenue: t.revenue, cost: t.cost, profit: t.revenue - t.cost, margin: t.revenue ? Math.round(((t.revenue - t.cost) / t.revenue) * 100) : -100, status: t.revenue - t.cost < 0 ? 'ขาดทุน' : 'ปกติ' })))
PROFIT.forEach((p) => (p.id = 'PFT-' + p.trip.slice(4)))

// ───────── Workforce ─────────
export const HUBS = mk('HUB', [
  { name: 'คลังลำลูกกา', customer: 'SPX Express', company: 'SPT', headcount: 120, sla: 96.2, status: 'ใช้งาน' },
  { name: 'ฮับบางนา', customer: 'Flash Express', company: 'SPT', headcount: 85, sla: 94.8, status: 'ใช้งาน' },
  { name: 'คลังบางพลี', customer: 'J&T Express', company: 'TPL', headcount: 64, sla: 91.5, status: 'ใช้งาน' },
  { name: 'คลังนวนคร', customer: 'SPX Express', company: 'TPL', headcount: 78, sla: 97.1, status: 'ใช้งาน' },
  { name: 'ฮับขอนแก่น', customer: 'Flash Express', company: 'SPT', headcount: 42, sla: 89.9, status: 'ใช้งาน' },
], { ym: false, w: 2 })
export const CUS_W = mk('WCU', [
  { name: 'SPX Express', idPrefix: 'SPX', hubs: 2, terms: 45, status: 'ใช้งาน', company: 'SPT' },
  { name: 'Flash Express', idPrefix: 'FLS', hubs: 2, terms: 30, status: 'ใช้งาน', company: 'SPT' },
  { name: 'J&T Express', idPrefix: 'JNT', hubs: 1, terms: 30, status: 'ใช้งาน', company: 'TPL' },
], { ym: false, w: 2 })
export const EMPLOYEES = mk('EMP', Array.from({ length: 24 }, (_, i) => {
  const hub = HUBS[i % 5]
  return {
    company: hub.company, name: `${TH_F[i]} ${TH_L[(i * 5) % 12]}`, role: i % 6 === 0 ? 'หัวหน้ากะ' : 'พนักงานคัดแยก', hub: hub.id, customer: hub.customer,
    custId: `${hub.customer.slice(0, 3).toUpperCase()}-${ri(80000, 89999)}`, wage: i % 6 === 0 ? 560 : 450, status: i === 11 ? 'ลาออก' : 'ทำงาน', docs: i === 4 ? 'ไม่ครบ' : 'ครบถ้วน', phone: `09${ri(1, 9)}-${ri(100, 999)}-${ri(1000, 9999)}`, startDate: dayOff(-ri(30, 700)),
  }
}), { ym: false, w: 4 })
EMPLOYEES[6].wage = 450
export const RECRUIT = mk('RCT', ['สุวิทย์ ปาน', 'เกศินี รัก', 'ภูมิ ทอง', 'อรุณ เดช', 'พิมพ์ชนก ศรี', 'ธีระ มณี', 'วิภา สุข', 'ชาติ ชาย'].map((n, i) => ({
  company: WF_CO[i % 2], date: dayOff(-i), name: n, position: 'พนักงานคัดแยก', hub: HUBS[i % 5].id, source: ['LINE OA', 'Facebook', 'แนะนำ', 'Walk-in'][i % 4], status: ['สมัครใหม่', 'คัดกรอง', 'สัมภาษณ์', 'ทดลองงาน', 'ผ่านแล้ว', 'สมัครใหม่', 'คัดกรอง', 'สัมภาษณ์'][i],
})))
export const ONBOARD = mk('ONB', EMPLOYEES.slice(16, 22).map((e, i) => ({ company: e.company, date: dayOff(-i * 2), employee: e.id, name: e.name, step: ['เอกสารครบ', 'ตรวจประวัติ', 'ทำสัญญา', 'อบรมความปลอดภัย', 'มอบหมายคลัง', 'ปฐมนิเทศ'][i], progress: Math.round(((i + 1) / 6) * 100), status: i === 5 ? 'เสร็จสิ้น' : 'กำลังดำเนินการ' })))
export const EDOCS = mk('EDC', EMPLOYEES.slice(0, 12).flatMap((e, i) => [{ company: e.company, employee: e.id, type: 'บัตรประชาชน', exp: dayOff(ri(100, 900)), status: 'ถูกต้อง' }, { company: e.company, employee: e.id, type: i === 4 ? 'ใบรับรองแพทย์' : 'สำเนาทะเบียนบ้าน', exp: dayOff(i === 4 ? -10 : 300), status: i === 4 ? 'หมดอายุ' : 'ถูกต้อง' }]))
export const CONTRACTS = mk('CTR', EMPLOYEES.slice(0, 16).map((e, i) => ({ company: e.company, employee: e.id, type: i % 3 ? 'สัญญารายวัน' : 'สัญญารายเดือน', start: e.startDate, end: dayOff(i === 3 ? 14 : ri(60, 330)), status: i === 3 ? 'ใกล้หมดอายุ' : 'ใช้งาน' })))
export const MPR = mk('MPR', [
  { company: 'SPT', date: dayOff(-1), customer: 'SPX Express', hub: 'HUB-01', shiftDate: dayOff(1), requested: 60, filled: 58, status: 'อนุมัติแล้ว' },
  { company: 'SPT', date: dayOff(-1), customer: 'Flash Express', hub: 'HUB-02', shiftDate: dayOff(1), requested: 45, filled: 45, status: 'อนุมัติแล้ว' },
  { company: 'TPL', date: dayOff(-1), customer: 'J&T Express', hub: 'HUB-03', shiftDate: dayOff(1), requested: 40, filled: 31, status: 'รออนุมัติ', note: 'กำลังคนไม่พอ — ขาด 9 คน' },
  { company: 'TPL', date: dayOff(-2), customer: 'SPX Express', hub: 'HUB-04', shiftDate: dayOff(2), requested: 50, filled: 50, status: 'อนุมัติแล้ว' },
  { company: 'SPT', date: dayOff(-3), customer: 'Flash Express', hub: 'HUB-05', shiftDate: dayOff(2), requested: 30, filled: 12, status: 'ปฏิเสธ', rejectReason: 'ส่งคำขอล่วงหน้าน้อยกว่า 24 ชม. ตามนโยบาย' },
])
export const MPLAN = mk('MPL', HUBS.map((h, i) => ({ company: h.company, date: dayOff(-i), hub: h.id, month: 'พ.ย. 69', planned: h.headcount + 10, current: h.headcount, gap: 10, status: i === 2 ? 'รออนุมัติ' : 'อนุมัติแล้ว' })))
export const SHIFTS = mk('SHF', HUBS.flatMap((h, i) => ['กลางวัน 08:00-17:00', 'กลางคืน 20:00-05:00'].map((s, k) => {
  const planned = Math.round(h.headcount * (k ? 0.5 : 0.8) * 0.5)
  const actual = h.id === 'HUB-03' && k === 0 ? planned - 9 : planned - ri(0, 2)
  return { company: h.company, date: dayOff(1), hub: h.id, shift: s, planned, actual, status: actual < planned - 3 ? 'กำลังคนไม่พอ' : actual < planned ? 'เตือน' : 'ครบถ้วน' }
})))
export const SHIFT_ASSIGN = mk('SAS', EMPLOYEES.slice(0, 14).map((e, i) => ({ company: e.company, date: dayOff(1), employee: e.id, name: e.name, hub: e.hub, shift: 'กลางวัน 08:00-17:00', status: i === 8 ? 'ซ้อนทับกะ' : 'ยืนยันแล้ว', note: i === 8 ? 'ถูกมอบหมายกะกลางคืนที่ HUB-03 ซ้อนกัน' : '' })))
export const AVAIL = mk('AVL', EMPLOYEES.slice(0, 14).map((e, i) => ({ company: e.company, date: dayOff(1), employee: e.id, name: e.name, days: 6 - (i % 3), pref: ['กลางวัน', 'กลางคืน', 'ได้ทุกกะ'][i % 3], status: i === 11 ? 'ไม่ว่าง' : 'พร้อม' })))

const ATTS = Array.from({ length: 36 }, (_, i) => {
  const e = EMPLOYEES[i % 12 === 11 ? 0 : i % 12]
  const late = i % 7 === 3
  return { company: e.company, date: dayOff(-Math.floor(i / 8)), employee: e.id, name: e.name, hub: e.hub, shift: 'กลางวัน', in: late ? '08:34' : `07:${ri(40, 59)}`, out: '17:0' + ri(0, 9), source: ['LINE', 'QR', 'LINE', 'ด้วยมือ'][i % 4], status: late ? 'สาย' : 'ผ่าน' }
})
export const ATTEND = mk('ATT', ATTS)
Object.assign(ATTEND[16], { employee: 'EMP-0004', name: EMPLOYEES[3].name, hub: EMPLOYEES[3].hub, company: EMPLOYEES[3].company, in: '08:02', out: '17:05', status: 'ข้อพิพาท', note: 'ระบบเรามี IN/OUT แต่ลูกค้าระบุว่าขาดงาน' })
Object.assign(ATTEND[9], { out: '', status: 'ขาด OUT', note: 'ไม่มีเวลาออกงาน' })
Object.assign(ATTEND[20], { status: 'ซ้ำ', note: 'บันทึกซ้ำจาก LINE และ QR' })
export const LINEIN = mk('LNE', ATTEND.slice(0, 10).map((a, i) => ({ company: a.company, date: a.date, employee: a.employee, name: a.name, time: a.in, type: i % 2 ? 'OUT' : 'IN', att: a.id, status: i < 3 ? 'รอตรวจสอบ' : 'ตรวจสอบแล้ว' })))
export const QRS = mk('QRC', HUBS.map((h, i) => ({ company: h.company, hub: h.id, name: `QR ${h.name}`, scans: ri(180, 640), lastScan: '07:58', status: 'ใช้งาน' })))
export const CATT = mk('CAI', ATTEND.slice(0, 16).map((a, i) => ({ company: a.company, date: a.date, customer: EMPLOYEES.find((e) => e.id === a.employee)!.customer, custEmp: EMPLOYEES.find((e) => e.id === a.employee)!.custId, employee: a.employee, in: a.id === ATTEND[16].id ? '' : a.in, out: a.out, status: a.id === ATTEND[16].id ? 'ไม่ตรงกัน' : 'ตรงกัน' })))
export const ATTRECON = mk('ARC', ATTEND.slice(8, 22).map((a) => {
  const dis = a.status === 'ข้อพิพาท'
  const ours = a.out ? 9 : 0
  return { company: a.company, date: a.date, employee: a.employee, name: a.name, att: a.id, oursHr: ours, theirsHr: dis ? 0 : ours, diff: dis ? ours : 0, status: dis ? 'ไม่ตรงกัน' : a.status === 'ผ่าน' ? 'ตรงกัน' : 'รอตรวจสอบ' }
}))
export const DISPUTES = mk('DSP', [
  { company: 'SPT', date: dayOff(-2), employee: 'EMP-0004', name: EMPLOYEES[3].name, att: ATTEND[16].id, customer: 'Flash Express', claim: 'ลูกค้าระบุว่าขาดงาน (0 ชม.)', ourEvidence: 'LINE photo 08:02 / QR OUT 17:05', amount: 450, status: 'รอตรวจสอบ', owner: 'เอกชัย วงศ์ใหญ่' },
  { company: 'TPL', date: dayOff(-5), employee: 'EMP-0010', name: EMPLOYEES[9].name, att: ATTEND[5].id, customer: 'J&T Express', claim: 'ลูกค้าระบุออกงานก่อนเวลา 2 ชม.', ourEvidence: 'หัวหน้ากะยืนยัน', amount: 112, status: 'ปิดแล้ว', owner: 'รัตนา สายชล' },
])
export const LEAVES = mk('LVE', EMPLOYEES.slice(0, 10).map((e, i) => ({ company: e.company, date: dayOff(-i), employee: e.id, name: e.name, type: ['ลาป่วย', 'ขาดงาน', 'มาสาย', 'ลากิจ'][i % 4], minutes: i % 4 === 2 ? 34 : 0, status: i % 4 === 1 ? 'ไม่ได้แจ้ง' : 'ยืนยันแล้ว' })))
export const OT = mk('OTR', EMPLOYEES.slice(0, 12).map((e, i) => {
  const hrs = [2, 3, 1.5, 2, 4, 2, 3, 2, 1, 2, 3, 2][i]
  return { company: e.company, date: dayOff(-i), employee: e.id, name: e.name, hours: hrs, rate: e.wage / 8 * 1.5, amount: Math.round(hrs * (e.wage / 8) * 1.5), status: i === 4 ? 'ไม่ได้รับอนุมัติ' : i < 3 ? 'รออนุมัติ' : 'อนุมัติแล้ว', note: i === 4 ? 'OT 4 ชม. ไม่มีใบขออนุมัติ' : '' }
}))
export const WAGES = mk('WRT', [
  { company: 'SPT', role: 'พนักงานคัดแยก', hub: 'HUB-01', daily: 450, ot: 84.4, effective: '2026-01-01', status: 'ใช้งาน' },
  { company: 'SPT', role: 'หัวหน้ากะ', hub: 'HUB-01', daily: 560, ot: 105, effective: '2026-01-01', status: 'ใช้งาน' },
  { company: 'SPT', role: 'พนักงานคัดแยก', hub: 'HUB-02', daily: 450, ot: 84.4, effective: '2026-01-01', status: 'ใช้งาน' },
  { company: 'TPL', role: 'พนักงานคัดแยก', hub: 'HUB-03', daily: 400, ot: 75, effective: '2026-01-01', status: 'ไม่ถูกต้อง', note: 'ต่ำกว่าอัตราค่าจ้างขั้นต่ำ (฿400 < ฿450)' },
  { company: 'TPL', role: 'พนักงานคัดแยก', hub: 'HUB-04', daily: 450, ot: 84.4, effective: '2026-01-01', status: 'ใช้งาน' },
  { company: 'SPT', role: 'พนักงานคัดแยก', hub: 'HUB-05', daily: 430, ot: 80, effective: '2026-01-01', status: 'ใช้งาน' },
], { ym: false })
export const DAILYW = mk('DWG', ATTEND.filter((a) => a.status === 'ผ่าน' || a.status === 'สาย').slice(0, 20).map((a) => { const e = EMPLOYEES.find((x) => x.id === a.employee)!; return { company: a.company, date: a.date, employee: a.employee, name: a.name, att: a.id, hours: 9, wage: e.wage, status: 'คำนวณแล้ว' } }))
export const PAYROLL = mk('PRL', EMPLOYEES.filter((e) => e.status === 'ทำงาน').map((e, i) => {
  const days = ri(24, 27), ot = ri(2, 12) * 80, ded = i % 5 === 0 ? 300 : 0
  return { company: e.company, date: dayOff(-3), period: 'ต.ค. 69 (รอบ 1)', employee: e.id, name: e.name, days, gross: days * e.wage, ot, deduction: ded, net: days * e.wage + ot - ded, status: i < 14 ? 'รออนุมัติ' : i < 18 ? 'อนุมัติแล้ว' : 'ร่าง', approver: '-', requester: 'จิราพร จันทร์เพ็ญ' }
}))
{
  const base = PAYROLL.find((p) => p.employee === 'EMP-0007')!
  PAYROLL.push({ ...base, id: 'PRL-2610-0099', status: 'ถูกบล็อก', note: 'รายการเงินเดือนซ้ำของ EMP-0007 ในงวดเดียวกัน (ซ้ำกับ ' + base.id + ')', dupOf: base.id })
  PAYROLL[PAYROLL.indexOf(base)].status = 'รออนุมัติ'
  const ap = PAYROLL.find((p) => p.status === 'อนุมัติแล้ว')!; ap.approver = 'พัชรี บุญมา'
  const rj = PAYROLL[PAYROLL.length - 2]; rj.status = 'ปฏิเสธ'; rj.rejectReason = 'จำนวนวันทำงานไม่ตรงกับข้อมูลลูกค้า'
}
export const PAYRECON = mk('PPR', PAYROLL.filter((p) => p.status === 'อนุมัติแล้ว').map((p, i) => ({ company: p.company, date: dayOff(-1), payroll: p.id, employee: p.employee, name: p.name, amount: p.net, bank: `BNK-W-${pad(i + 1)}`, status: i === 0 ? 'ไม่ตรงกัน' : 'กระทบยอดแล้ว' })))
export const SLA = mk('SLA', HUBS.flatMap((h, i) => [0, 1].map((w) => ({ company: h.company, date: dayOff(-w * 7), hub: h.id, week: w ? 'สัปดาห์ก่อน' : 'สัปดาห์นี้', target: 95, actual: +(h.sla + (w ? 0.6 : 0) - (i === 4 ? 0 : 0)).toFixed(1), shortage: i === 2 ? 9 - w * 3 : ri(0, 2), status: h.sla < 95 ? 'ต่ำกว่าเป้า' : 'ผ่าน' }))))
export const PENALTY = mk('PEN', [
  { company: 'TPL', date: dayOff(-4), hub: 'HUB-03', customer: 'J&T Express', reason: 'กำลังคนไม่ครบตามที่ตกลง (ขาด 9)', amount: 4500, status: 'รออนุมัติ' },
  { company: 'SPT', date: dayOff(-8), hub: 'HUB-05', customer: 'Flash Express', reason: 'SLA ต่ำกว่า 90%', amount: 6000, status: 'อนุมัติแล้ว' },
  { company: 'SPT', date: dayOff(-12), hub: 'HUB-02', customer: 'Flash Express', reason: 'มาสายเกิน 5 คน', amount: 1200, status: 'ปฏิเสธ', rejectReason: 'ลูกค้าไม่ได้ยื่นหลักฐานครบ' },
])
export const WBILL = mk('WBL', HUBS.concat(HUBS.slice(0, 3)).map((h, i) => {
  const amt = ri(38, 62) * 1000
  const st = i < 4 ? 'ชำระแล้ว' : i < 7 ? 'รอชำระ' : 'เกินกำหนด'
  return { company: h.company, date: dayOff(-i * 3 - 2), customer: h.customer, hub: h.id, period: 'ก.ย. 69', headcountDays: ri(900, 2400), amount: amt, status: st, paid: st === 'ชำระแล้ว' ? amt : 0 }
}))
export const WRECON = mk('WCR', WBILL.slice(0, 6).map((b, i) => ({ company: b.company, date: b.date, invoice: b.id, customer: b.customer, ours: b.amount, theirs: i === 2 ? b.amount - 3200 : b.amount, diff: i === 2 ? 3200 : 0, status: i === 2 ? 'ไม่ตรงกัน' : 'ตรงกัน' })))
export const WPROFIT = mk('WPF', HUBS.map((h, i) => { const rev = ri(380, 520) * 1000, cost = Math.round(rev * (0.72 + rnd() * 0.12)); return { company: h.company, date: dayOff(-2), hub: h.id, revenue: rev, cost, profit: rev - cost, margin: Math.round(((rev - cost) / rev) * 100), status: rev - cost < rev * 0.2 ? 'ต่ำกว่าเป้า' : 'ปกติ' } }), { ym: false, w: 2 })

// ───────── Shared ─────────
export const VALIDATIONS = mk('VAL', [
  { div: 'Transport', rule: 'บาร์โค้ดซ้ำ', source: 'Flash OSM', ref: 'TRP-2610-0015', company: 'SPV', owner: 'กมลวรรณ แสงทอง', severity: 'สูง', reason: 'BC-88213009 ซ้ำกับ TRP-2610-0009', impact: 29800, stage: 'ถูกบล็อก' },
  { div: 'Transport', rule: 'นอกเส้นทางอนุมัติ', source: 'Dispatch', ref: 'TRP-2610-0014', company: 'THRS', owner: 'สมชาย ใจดี', severity: 'สูง', reason: 'RTE-08 ไม่อยู่ในรายการเส้นทางอนุมัติ / ระยะเวลา 19.2 ชม.', impact: 14200, stage: 'มอบหมายตรวจสอบ' },
  { div: 'Transport', rule: 'ค่าใช้จ่ายซ้ำ', source: 'Expense', ref: 'EXP-2610-0007', company: 'TKQ', owner: 'ปิยะ รุ่งเรือง', severity: 'สูง', reason: 'ซ้ำกับ EXP-2610-0003', impact: 4850, stage: 'ถูกบล็อก' },
  { div: 'Transport', rule: 'เอกสารเที่ยววิ่งไม่ครบ', source: 'Drive', ref: 'TRP-2610-0021', company: 'T&A', owner: 'กมลวรรณ แสงทอง', severity: 'กลาง', reason: 'ขาดใบส่งสินค้า (POD)', impact: 0, stage: 'เตือน' },
  { div: 'Transport', rule: 'ขอน้ำมันเกินมาตรฐาน', source: 'Fuel', ref: 'FUL-2610-0011', company: 'SPV', owner: 'ปิยะ รุ่งเรือง', severity: 'กลาง', reason: 'ขอ 160 ลิตร มาตรฐาน 31 ลิตร', impact: 5350, stage: 'ผ่านการตรวจสอบอัตโนมัติ' },
  { div: 'Transport', rule: 'ยอดโอนไม่ตรงกับธนาคาร', source: 'Bank CSV', ref: 'BNK-2610-0003', company: 'TKQ', owner: 'นภา ศรีสุข', severity: 'กลาง', reason: 'ไม่พบ PAY ที่ตรงกับ 22,000 บาท', impact: 22000, stage: 'มอบหมายตรวจสอบ' },
  { div: 'Transport', rule: 'ค่าใช้จ่ายสูงผิดปกติ', source: 'Expense', ref: 'EXP-2610-0005', company: 'SPV', owner: 'ปิยะ รุ่งเรือง', severity: 'กลาง', reason: 'สูงกว่าค่าเฉลี่ยย้อนหลัง 3.9 เท่า', impact: 38500, stage: 'ตรวจซ้ำ' },
  { div: 'Workforce', rule: 'ไม่มีเวลาออกงาน', source: 'LINE', ref: 'ATT-2610-0010', company: 'SPT', owner: 'เอกชัย วงศ์ใหญ่', severity: 'กลาง', reason: 'พบ IN แต่ไม่พบ OUT', impact: 0, stage: 'ใหม่' },
  { div: 'Workforce', rule: 'เวลาไม่ตรงกับลูกค้า', source: 'Flash OSM', ref: 'ATT-2610-0017', company: 'SPT', owner: 'เอกชัย วงศ์ใหญ่', severity: 'สูง', reason: 'ลูกค้าระบุขาดงาน แต่ระบบมี IN/OUT', impact: 450, stage: 'มอบหมายตรวจสอบ' },
  { div: 'Workforce', rule: 'เงินเดือนซ้ำ', source: 'Payroll', ref: 'PRL-2610-0099', company: 'SPT', owner: 'จิราพร จันทร์เพ็ญ', severity: 'สูง', reason: 'EMP-0007 งวดเดียวกันซ้ำ', impact: 12350, stage: 'ถูกบล็อก' },
  { div: 'Workforce', rule: 'อัตราค่าจ้างไม่ถูกต้อง', source: 'Wage Rate', ref: 'WRT-004', company: 'TPL', owner: 'พัชรี บุญมา', severity: 'สูง', reason: '฿400 ต่ำกว่าอัตราขั้นต่ำ ฿450', impact: 0, stage: 'มอบหมายตรวจสอบ' },
  { div: 'Workforce', rule: 'กำลังคนจริงน้อยกว่าแผน', source: 'Manpower', ref: 'MPR-2610-0003', company: 'TPL', owner: 'พัชรี บุญมา', severity: 'สูง', reason: 'ขอ 40 จัดได้ 31 (ขาด 9)', impact: 4500, stage: 'เตือน' },
  { div: 'Workforce', rule: 'OT ไม่ได้รับอนุมัติ', source: 'OT', ref: 'OTR-2610-0005', company: 'SPT', owner: 'รัตนา สายชล', severity: 'ต่ำ', reason: 'OT 4 ชม. ไม่มีใบขอ', impact: 675, stage: 'แก้ไขแล้ว' },
  { div: 'Workforce', rule: 'เอกสารพนักงานไม่ครบ', source: 'Documents', ref: 'EMP-0005', company: 'SPT', owner: 'ลลิตา เพชรแก้ว', severity: 'ต่ำ', reason: 'ใบรับรองแพทย์หมดอายุ', impact: 0, stage: 'ปิดแล้ว' },
])
export const NOTIFS = mk('NTF', [
  { type: 'เที่ยววิ่งผิดปกติ', severity: 'สูง', company: 'THRS', ref: 'TRP-2610-0014', owner: 'สมชาย ใจดี', time: '10:42', line: 'ส่งแล้ว', msg: 'ออกนอกเส้นทางอนุมัติ ระยะเวลา 19.2 ชม.' },
  { type: 'เสี่ยงจ่ายซ้ำ', severity: 'สูง', company: 'TKQ', ref: 'EXP-2610-0007', owner: 'ปิยะ รุ่งเรือง', time: '10:15', line: 'ส่งแล้ว', msg: 'ค่าซ่อมซ้ำกับ EXP-2610-0003' },
  { type: 'ขอน้ำมันเกินมาตรฐาน', severity: 'กลาง', company: 'SPV', ref: 'FUL-2610-0011', owner: 'ปิยะ รุ่งเรือง', time: '09:50', line: 'รอส่ง', msg: 'ขอ 160 ลิตร เกินมาตรฐาน 5 เท่า' },
  { type: 'กำลังคนไม่พอ', severity: 'สูง', company: 'TPL', ref: 'MPR-2610-0003', owner: 'พัชรี บุญมา', time: '09:30', line: 'ส่งแล้ว', msg: 'HUB-03 ขาด 9 คน กะพรุ่งนี้' },
  { type: 'เงินเดือนซ้ำ', severity: 'สูง', company: 'SPT', ref: 'PRL-2610-0099', owner: 'จิราพร จันทร์เพ็ญ', time: '09:05', line: 'ส่งแล้ว', msg: 'EMP-0007 มีรายการเงินเดือนซ้ำ' },
  { type: 'ข้อมูลลูกค้าไม่ตรง', severity: 'กลาง', company: 'SPT', ref: 'ATT-2610-0017', owner: 'เอกชัย วงศ์ใหญ่', time: '08:48', line: 'รอส่ง', msg: 'ลูกค้าระบุขาดงาน' },
  { type: 'รออนุมัติ', severity: 'กลาง', company: 'SPV', ref: 'EXP-2610-0005', owner: 'อนุชา มั่นคง', time: '08:30', line: 'ส่งแล้ว', msg: 'ค่าซ่อม 38,500 บาท รอผู้บริหารอนุมัติ' },
  { type: 'คำขอถูกปฏิเสธ', severity: 'ต่ำ', company: 'T&A', ref: 'EXP-2610-0009', owner: 'กมลวรรณ แสงทอง', time: 'เมื่อวาน', line: 'ส่งแล้ว', msg: 'ไม่มีใบเสร็จรับเงิน' },
  { type: 'กระทบยอดล้มเหลว', severity: 'กลาง', company: 'TKQ', ref: 'BNK-2610-0003', owner: 'นภา ศรีสุข', time: 'เมื่อวาน', line: 'ส่งแล้ว', msg: 'ไม่พบ PAY ที่ตรงกับยอดโอน 22,000' },
  { type: 'เอกสารเที่ยววิ่งไม่ครบ', severity: 'กลาง', company: 'T&A', ref: 'TRP-2610-0021', owner: 'กมลวรรณ แสงทอง', time: 'เมื่อวาน', line: 'ส่งแล้ว', msg: 'ขาดใบส่งสินค้า' },
])
export const INTEGRATIONS = mk('INT', [
  { name: 'Google Sheets', purpose: 'นำเข้าแผนเที่ยววิ่ง/รายชื่อ', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'Google Drive', purpose: 'เก็บเอกสารแนบ', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'LINE Messaging API', purpose: 'แจ้งเตือน + รับรูปเข้างาน', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'n8n', purpose: 'Workflow Automation', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'Flash OSM', purpose: 'ข้อมูลเที่ยววิ่ง/เวลาเข้างานลูกค้า', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'SPX / Shopee', purpose: 'ข้อมูลเวลาเข้างานลูกค้า', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'J&T', purpose: 'ข้อมูลเที่ยววิ่ง', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'Bank Transaction Import', purpose: 'นำเข้า statement ธนาคาร', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
  { name: 'Excel / CSV', purpose: 'นำเข้าไฟล์ด้วยมือ', last: 'ไม่เคยนำเข้า', imported: 0, failed: 0, status: 'พร้อมใช้งาน' },
  { name: 'ระบบลูกค้าอื่น ๆ', purpose: 'API ลูกค้าเพิ่มเติม', last: '-', imported: 0, failed: 0, status: 'Demo / ยังไม่เชื่อมต่อ' },
], { ym: false, w: 2 })

// ───────── Registry ─────────
const A_APPR = (roleNeed?: string): Action[] => [
  { label: 'อนุมัติ', to: 'อนุมัติแล้ว', tone: 'ok', when: (r) => ['รออนุมัติ', 'รอตรวจสอบ'].includes(r.status), guard: (r, role, user) => {
    if (!role.perms.includes('*') && !role.perms.includes('approve')) return 'บทบาทของคุณไม่มีสิทธิ์อนุมัติ'
    if (r.requester && r.requester === user.name) return 'ไม่สามารถอนุมัติคำขอของตนเองได้ ตามนโยบายบริษัท'
    if (r.validation === 'ถูกบล็อก' || r.status === 'ถูกบล็อก') return 'รายการถูกบล็อกจากการตรวจสอบ — ต้องแก้ไขก่อนอนุมัติ'
    if ((r.amount ?? r.net ?? 0) > role.limit) return `ยอดเกินวงเงินอนุมัติของบทบาท (฿${role.limit.toLocaleString()}) — ต้องส่งต่อระดับถัดไป`
    return null
  } },
  { label: 'ขอแก้ไข', to: 'ส่งกลับแก้ไข', tone: 'warn', reason: true, when: (r) => ['รออนุมัติ', 'รอตรวจสอบ'].includes(r.status) },
  { label: 'ปฏิเสธ', to: 'ปฏิเสธ', tone: 'bad', reason: true, when: (r) => ['รออนุมัติ', 'รอตรวจสอบ'].includes(r.status) },
]
const A_RECON: Action[] = [
  { label: 'ยืนยันการกระทบยอด', to: 'กระทบยอดแล้ว', tone: 'ok', when: (r) => ['ไม่ตรงกัน', 'รอตรวจสอบ'].includes(r.status), guard: (r) => (r.diff ? 'ยังมีผลต่างที่ยังไม่ได้ชี้แจง — แก้ไขหรือบันทึกข้อพิพาทก่อน' : null) },
]
const mkDS = (prefix: string, label: string, app: DSet['app'], page: string, rows: Rec[], title: (r: Rec) => string, actions?: Action[]): DSet => ({ prefix, label, app, page, rows, title, actions })

export const DB: Record<string, DSet> = Object.fromEntries([
  mkDS('TRP', 'เที่ยววิ่ง', 'transport', 'trips', TRIPS, (r) => r.route, [
    { label: 'ยืนยันผ่านการตรวจสอบ', to: 'ตรวจสอบแล้ว', tone: 'ok', when: (r) => ['ผิดปกติ', 'ซ้ำ', 'ขาดเอกสาร'].includes(r.status), guard: (r) => (r.status === 'ซ้ำ' ? 'บาร์โค้ดซ้ำ — ต้องแก้ไขข้อมูลก่อน' : null) },
    { label: 'ส่งตรวจสอบเพิ่ม', to: 'ผิดปกติ', tone: 'warn', reason: true, when: (r) => r.status === 'ตรวจสอบแล้ว' },
  ]),
  mkDS('RTE', 'เส้นทาง', 'transport', 'routes', ROUTES, (r) => r.name),
  mkDS('VEH', 'ยานพาหนะ', 'transport', 'vehicles', VEHICLES, (r) => r.plate),
  mkDS('DRV', 'คนขับ', 'transport', 'drivers', DRIVERS, (r) => r.name),
  mkDS('VDC', 'เอกสารยานพาหนะ', 'transport', 'vdocs', VDOCS, (r) => `${r.type} ${r.vehicle}`),
  mkDS('MNT', 'ซ่อมบำรุง', 'transport', 'maintenance', MAINT, (r) => r.type),
  mkDS('FUL', 'คำขอน้ำมัน', 'transport', 'fuel', FUELS, (r) => `น้ำมัน ${r.liters} ลิตร`, [
    ...A_APPR(),
    { label: 'สรุปยอดเงินเบิกล่วงหน้า', to: 'ปิดยอดแล้ว', tone: 'pri', when: (r) => String(r.settled).startsWith('รอคืน') },
  ]),
  mkDS('FTX', 'ธุรกรรมน้ำมัน', 'transport', 'fueltx', FTX, (r) => r.station),
  mkDS('EXP', 'ค่าใช้จ่าย', 'transport', 'expense-approval', EXPENSES, (r) => `${r.type} · ${r.beneficiary}`, A_APPR()),
  mkDS('PAY', 'การจ่ายเงิน', 'transport', 'daily-pay', PAYMENTS, (r) => r.beneficiary),
  mkDS('BAT', 'ชุดการจ่าย', 'transport', 'batches', BATCHES, (r) => `Batch ${r.id}`, [
    { label: 'อนุมัติจ่าย', to: 'อนุมัติแล้ว', tone: 'ok', when: (r) => r.status === 'รออนุมัติ', guard: (r, role) => (r.note ? 'ชุดนี้มีรายการถูกบล็อก (PAY-2610-0006) — นำออกก่อนอนุมัติ' : !role.perms.includes('*') && !role.perms.includes('approve') ? 'ไม่มีสิทธิ์อนุมัติ' : null) },
  ]),
  mkDS('BNK', 'รายการธนาคาร', 'transport', 'bank-recon', BANKS, (r) => r.desc, [
    { label: 'ยืนยันการจับคู่', to: 'ตรงกัน', tone: 'ok', when: (r) => r.status === 'รอตรวจสอบ' },
  ]),
  mkDS('INV', 'ใบวางบิล', 'transport', 'billing', INVOICES, (r) => r.customerName),
  mkDS('RCN', 'กระทบยอดลูกค้า', 'transport', 'cus-recon', TRECON, (r) => `${r.customerName} ${r.period}`, A_RECON),
  mkDS('DUP', 'ตรวจจ่ายซ้ำ', 'transport', 'dup', DUPCHK, (r) => r.ref),
  mkDS('PFT', 'กำไรต่อเที่ยว', 'transport', 'profit-trip', PROFIT, (r) => r.trip),
  mkDS('TCU', 'ลูกค้าขนส่ง', 'transport', 'cus-recon', CUS_T, (r) => r.name),
  mkDS('HUB', 'คลัง/ฮับ', 'workforce', 'hubs', HUBS, (r) => r.name),
  mkDS('WCU', 'ลูกค้า Workforce', 'workforce', 'customers', CUS_W, (r) => r.name),
  mkDS('EMP', 'พนักงาน', 'workforce', 'employees', EMPLOYEES, (r) => r.name),
  mkDS('RCT', 'ผู้สมัคร', 'workforce', 'recruit', RECRUIT, (r) => r.name),
  mkDS('ONB', 'การรับพนักงานใหม่', 'workforce', 'onboarding', ONBOARD, (r) => r.name),
  mkDS('EDC', 'เอกสารพนักงาน', 'workforce', 'edocs', EDOCS, (r) => r.type),
  mkDS('CTR', 'สัญญาจ้าง', 'workforce', 'contracts', CONTRACTS, (r) => r.type),
  mkDS('MPR', 'คำขอกำลังคน', 'workforce', 'mpr', MPR, (r) => `${r.customer} · ${r.hub}`, [
    ...A_APPR(),
    { label: 'จัดหาเพิ่ม', to: 'อนุมัติแล้ว', tone: 'pri', when: () => false },
  ]),
  mkDS('MPL', 'แผนกำลังคนรายเดือน', 'workforce', 'mpl', MPLAN, (r) => `${r.hub} ${r.month}`),
  mkDS('SHF', 'แผนกะรายวัน', 'workforce', 'shifts', SHIFTS, (r) => `${r.hub} ${r.shift}`),
  mkDS('SAS', 'มอบหมายกะ', 'workforce', 'assign', SHIFT_ASSIGN, (r) => r.name, [
    { label: 'แก้ไขกะซ้อนทับ', to: 'ยืนยันแล้ว', tone: 'ok', when: (r) => r.status === 'ซ้อนทับกะ' },
  ]),
  mkDS('AVL', 'ความพร้อมพนักงาน', 'workforce', 'avail', AVAIL, (r) => r.name),
  mkDS('ATT', 'เวลาทำงาน', 'workforce', 'attendance', ATTEND, (r) => `${r.name} ${r.date}`, [
    { label: 'ยืนยันถูกต้อง', to: 'ผ่าน', tone: 'ok', when: (r) => ['ขาด OUT', 'ซ้ำ', 'สาย'].includes(r.status) },
    { label: 'ส่งเข้าข้อพิพาท', to: 'ข้อพิพาท', tone: 'warn', reason: true, when: (r) => ['ขาด OUT', 'ซ้ำ'].includes(r.status) },
  ]),
  mkDS('LNE', 'หลักฐาน LINE', 'workforce', 'line', LINEIN, (r) => `${r.name} ${r.type}`, [
    { label: 'ยืนยันรูป', to: 'ตรวจสอบแล้ว', tone: 'ok', when: (r) => r.status === 'รอตรวจสอบ' },
    { label: 'ปฏิเสธรูป', to: 'ปฏิเสธ', tone: 'bad', reason: true, when: (r) => r.status === 'รอตรวจสอบ' },
  ]),
  mkDS('QRC', 'QR Code', 'workforce', 'qr', QRS, (r) => r.name),
  mkDS('CAI', 'ข้อมูลเวลาลูกค้า', 'workforce', 'cust-att', CATT, (r) => `${r.customer} ${r.custEmp}`),
  mkDS('ARC', 'กระทบยอดเวลา', 'workforce', 'att-recon', ATTRECON, (r) => r.name, [
    { label: 'ส่งเข้าข้อพิพาท', to: 'ข้อพิพาท', tone: 'warn', reason: true, when: (r) => r.status === 'ไม่ตรงกัน' },
    { label: 'ยืนยันตรงกัน', to: 'ตรงกัน', tone: 'ok', when: (r) => r.status === 'รอตรวจสอบ' },
  ]),
  mkDS('DSP', 'ข้อพิพาทเวลา', 'workforce', 'disputes', DISPUTES, (r) => `${r.name} · ${r.customer}`, [
    { label: 'ยอมรับตามลูกค้า', to: 'ปิดแล้ว', tone: 'warn', reason: true, when: (r) => r.status === 'รอตรวจสอบ' },
    { label: 'ยืนยันหลักฐานของเรา', to: 'ปิดแล้ว', tone: 'ok', reason: true, when: (r) => r.status === 'รอตรวจสอบ', note: 'ต้องแนบเหตุผล — ระบบไม่อนุมัติข้อพิพาทอัตโนมัติ' },
  ]),
  mkDS('LVE', 'ลา/ขาด/สาย', 'workforce', 'leave', LEAVES, (r) => `${r.name} ${r.type}`),
  mkDS('OTR', 'ค่าล่วงเวลา', 'workforce', 'ot', OT, (r) => `OT ${r.name}`, A_APPR()),
  mkDS('WRT', 'อัตราค่าจ้าง', 'workforce', 'wage', WAGES, (r) => `${r.role} ${r.hub}`),
  mkDS('DWG', 'ค่าแรงรายวัน', 'workforce', 'dwage', DAILYW, (r) => r.name),
  mkDS('PRL', 'เงินเดือน', 'workforce', 'payroll-approve', PAYROLL, (r) => `${r.name} ${r.period}`, A_APPR()),
  mkDS('PPR', 'กระทบยอดจ่ายเงินเดือน', 'workforce', 'pay-recon', PAYRECON, (r) => r.name, A_RECON),
  mkDS('SLA', 'SLA', 'workforce', 'sla', SLA, (r) => `${r.hub} ${r.week}`),
  mkDS('PEN', 'ค่าปรับ', 'workforce', 'penalty', PENALTY, (r) => r.reason, A_APPR()),
  mkDS('WBL', 'ใบวางบิล Workforce', 'workforce', 'wbilling', WBILL, (r) => `${r.customer} ${r.hub}`),
  mkDS('WCR', 'กระทบยอดบิลลูกค้า', 'workforce', 'wbill-recon', WRECON, (r) => r.customer, A_RECON),
  mkDS('WPF', 'กำไร Workforce', 'workforce', 'wprofit', WPROFIT, (r) => r.hub),
  mkDS('VAL', 'การตรวจสอบ', 'shared', 'validation', VALIDATIONS, (r) => r.rule),
  mkDS('NTF', 'การแจ้งเตือน', 'shared', 'notifications', NOTIFS, (r) => r.type),
].map((d) => [d.prefix, d]))

export const prefixOf = (id: string) => id.split('-')[0]
export const isRecId = (v: any) => typeof v === 'string' && /^[A-Z]{3}-[A-Z0-9-]*\d+$/.test(v) && !!DB[prefixOf(v)]
export const findRec = (id: string): { ds: DSet; rec: Rec } | null => {
  const ds = DB[prefixOf(id)]
  const rec = ds?.rows.find((r) => r.id === id)
  return ds && rec ? { ds, rec } : null
}
export const AUDIT_SEED: { id: string; at: string; by: string; text: string }[] = [
  { id: 'TRP-2610-0014', at: '10:42', by: 'ระบบ', text: 'ตรวจสอบอัตโนมัติ: ผิดปกติ (นอกเส้นทาง)' },
  { id: 'EXP-2610-0007', at: '10:15', by: 'ระบบ', text: 'ตรวจสอบอัตโนมัติ: ถูกบล็อก (ซ้ำ EXP-2610-0003)' },
  { id: 'PRL-2610-0099', at: '09:05', by: 'ระบบ', text: 'ตรวจสอบอัตโนมัติ: ถูกบล็อก (เงินเดือนซ้ำ)' },
]
export const MONTHS = ['เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.']
export const TREND = MONTHS.map((m, i) => ({ m, rev: [3.1, 3.4, 3.3, 3.8, 4.0, 4.3, 4.6][i], exp: [2.5, 2.7, 2.7, 3.0, 3.2, 3.4, 3.6][i] }))
