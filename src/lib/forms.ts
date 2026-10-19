import { DB, DRIVERS, EMPLOYEES, HUBS, TR_CO, VEHICLES, WF_CO, CUS_T, ROUTES } from './data'

export type FField = {
  key: string
  label: string
  type?: 'text' | 'number' | 'select' | 'date' | 'textarea'
  required?: boolean
  options?: { v: string; l: string }[]
  min?: number
  hint?: string
  validate?: (v: any, all: Record<string, any>, editingId?: string) => string | null
}
export type FForm = { title: string; fields: FField[]; defaults?: Record<string, any>; transform?: (d: Record<string, any>) => Record<string, any> }
const co = (list: string[]) => list.map((c) => ({ v: c, l: c }))
const opt = (rows: { id: string; [k: string]: any }[], f: (r: any) => string) => rows.map((r) => ({ v: r.id, l: `${r.id} · ${f(r)}` }))

const COMPANY = (l: string[]): FField => ({ key: 'company', label: 'บริษัท', type: 'select', required: true, options: co(l) })

export const FORMS: Record<string, FForm> = {
  TRP: {
    title: 'เที่ยววิ่ง',
    defaults: { company: 'SPV', status: 'กำลังดำเนินการ', docs: 'ไม่ครบ' },
    fields: [
      COMPANY(TR_CO),
      { key: 'routeId', label: 'เส้นทาง', type: 'select', required: true, options: opt(ROUTES, (r) => r.name + (r.approved === 'ไม่อนุมัติ' ? ' (นอกเส้นทางอนุมัติ)' : '')) },
      { key: 'customer', label: 'ลูกค้า', type: 'select', required: true, options: opt(CUS_T, (r) => r.name) },
      { key: 'vehicle', label: 'ยานพาหนะ', type: 'select', required: true, options: opt(VEHICLES, (r) => r.plate) },
      { key: 'driver', label: 'คนขับ', type: 'select', required: true, options: opt(DRIVERS, (r) => r.name) },
      { key: 'barcode', label: 'บาร์โค้ด', required: true, hint: 'รูปแบบ BC-xxxxxxxx', validate: (v, _a, id) => (!/^BC-\d{8}$/.test(v) ? 'รูปแบบไม่ถูกต้อง (BC- ตามด้วยตัวเลข 8 หลัก)' : DB.TRP.rows.some((t) => t.barcode === v && t.id !== id) ? 'บาร์โค้ดนี้ถูกใช้แล้ว (ซ้ำกับ ' + DB.TRP.rows.find((t) => t.barcode === v)!.id + ')' : null) },
      { key: 'revenue', label: 'ค่าขนส่ง (บาท)', type: 'number', required: true, min: 0 },
    ],
    transform: (d) => {
      const r = ROUTES.find((x) => x.id === d.routeId)!
      const c = CUS_T.find((x) => x.id === d.customer)!
      return { ...d, route: r.name, km: r.km, stdHr: r.stdHr, hours: 0, customerName: c.name, cost: Math.round(d.revenue * 0.7), type: VEHICLES.find((v) => v.id === d.vehicle)?.ownership, status: r.approved === 'ไม่อนุมัติ' ? 'ผิดปกติ' : 'กำลังดำเนินการ' }
    },
  },
  VEH: {
    title: 'ยานพาหนะ',
    defaults: { company: 'SPV', ownership: 'รถบริษัท', status: 'ใช้งาน', odo: 0, util: 0 },
    fields: [
      COMPANY(TR_CO),
      { key: 'plate', label: 'ทะเบียนรถ', required: true, validate: (v, _a, id) => (DB.VEH.rows.some((r) => r.plate === v && r.id !== id) ? 'ทะเบียนนี้มีในระบบแล้ว' : null) },
      { key: 'type', label: 'ประเภทรถ', type: 'select', required: true, options: co(['4 ล้อตู้ทึบ', '6 ล้อ', '10 ล้อ', 'หัวลาก']) },
      { key: 'ownership', label: 'ความเป็นเจ้าของ', type: 'select', required: true, options: co(['รถบริษัท', 'รถร่วม']) },
      { key: 'owner', label: 'เจ้าของรถ', required: true },
      { key: 'docExp', label: 'วันหมดอายุเอกสาร', type: 'date', required: true },
    ],
  },
  DRV: {
    title: 'คนขับ',
    defaults: { company: 'SPV', status: 'ใช้งาน' },
    fields: [
      COMPANY(TR_CO),
      { key: 'name', label: 'ชื่อ-นามสกุล', required: true },
      { key: 'license', label: 'เลขใบขับขี่', required: true },
      { key: 'licExp', label: 'ใบขับขี่หมดอายุ', type: 'date', required: true },
      { key: 'phone', label: 'เบอร์โทร', required: true, validate: (v) => (/^0\d{2}-?\d{3}-?\d{4}$/.test(v) ? null : 'เบอร์โทรไม่ถูกต้อง') },
      { key: 'vehicle', label: 'รถประจำ', type: 'select', options: opt(VEHICLES, (r) => r.plate) },
    ],
  },
  EXP: {
    title: 'คำขอค่าใช้จ่าย',
    defaults: { company: 'SPV', status: 'รออนุมัติ', validation: 'ผ่าน', level: 1 },
    fields: [
      COMPANY(TR_CO),
      { key: 'type', label: 'ประเภทค่าใช้จ่าย', type: 'select', required: true, options: co(['ค่าทางด่วน', 'ค่าซ่อมบำรุง', 'ค่าที่พักคนขับ', 'ค่าล่วงเวลาคนขับ', 'ค่ายาง', 'ค่าล้างรถ']) },
      { key: 'trip', label: 'เที่ยววิ่งที่เกี่ยวข้อง', type: 'select', required: true, options: opt(DB.TRP.rows.slice(0, 20), (r) => r.route) },
      { key: 'beneficiary', label: 'ผู้รับเงิน', required: true },
      { key: 'amount', label: 'จำนวนเงิน (บาท)', type: 'number', required: true, min: 1 },
      { key: 'purpose', label: 'วัตถุประสงค์', type: 'textarea', required: true },
    ],
    transform: (d) => {
      const dup = DB.EXP.rows.find((e) => e.trip === d.trip && e.beneficiary === d.beneficiary && Number(e.amount) === Number(d.amount))
      return { ...d, vehicle: DB.TRP.rows.find((t) => t.id === d.trip)?.vehicle, budget: d.amount * 1.3, avg: d.amount, doc: 'DOC-ใหม่.pdf', bank: 'ยังไม่ระบุ', level: d.amount > 20000 ? 3 : d.amount > 5000 ? 2 : 1, ...(dup ? { validation: 'ถูกบล็อก', dupOf: dup.id, note: `ซ้ำกับ ${dup.id}` } : {}) }
    },
  },
  FUL: {
    title: 'คำขอน้ำมัน',
    defaults: { company: 'SPV', status: 'รออนุมัติ', settled: 'ยังไม่สรุป', actual: 0 },
    fields: [
      COMPANY(TR_CO),
      { key: 'trip', label: 'เที่ยววิ่ง', type: 'select', required: true, options: opt(DB.TRP.rows.slice(0, 20), (r) => r.route) },
      { key: 'liters', label: 'จำนวนลิตร', type: 'number', required: true, min: 1 },
    ],
    transform: (d) => {
      const t = DB.TRP.rows.find((x) => x.id === d.trip)!
      return { ...d, vehicle: t.vehicle, driver: t.driver, advance: Math.round(d.liters * 33.4), requester: 'ผู้ใช้ปัจจุบัน' }
    },
  },
  EMP: {
    title: 'พนักงาน',
    defaults: { company: 'SPT', status: 'ทำงาน', docs: 'ไม่ครบ', wage: 450 },
    fields: [
      { key: 'id', label: 'รหัสพนักงาน', required: true, hint: 'รูปแบบ EMP-0025', validate: (v, _a, eid) => (!/^EMP-\d{4}$/.test(v) ? 'รูปแบบไม่ถูกต้อง' : v !== eid && EMPLOYEES.some((e) => e.id === v) ? 'รหัสพนักงานซ้ำ — มีอยู่แล้วในทะเบียนกลาง' : null) },
      COMPANY(WF_CO),
      { key: 'name', label: 'ชื่อ-นามสกุล', required: true },
      { key: 'hub', label: 'คลัง/ฮับ', type: 'select', required: true, options: opt(HUBS, (r) => r.name) },
      { key: 'role', label: 'ตำแหน่ง', type: 'select', required: true, options: co(['พนักงานคัดแยก', 'หัวหน้ากะ']) },
      { key: 'custId', label: 'รหัสพนักงานของลูกค้า (Mapping)', hint: 'เช่น SPX-88231', validate: (v) => (v && !/^[A-Z]{3}-\d{5}$/.test(v) ? 'รูปแบบ XXX-12345' : null) },
      { key: 'wage', label: 'ค่าแรงรายวัน (บาท)', type: 'number', required: true, min: 450, hint: 'ขั้นต่ำ ฿450 ตามข้อกำหนด' },
      { key: 'phone', label: 'เบอร์โทร', required: true, validate: (v) => (/^0\d{2}-?\d{3}-?\d{4}$/.test(v) ? null : 'เบอร์โทรไม่ถูกต้อง') },
    ],
    transform: (d) => {
      const h = HUBS.find((x) => x.id === d.hub)!
      return { ...d, customer: h.customer, startDate: '2026-10-19' }
    },
  },
  RCT: {
    title: 'ผู้สมัคร',
    defaults: { company: 'SPT', status: 'สมัครใหม่', position: 'พนักงานคัดแยก' },
    fields: [
      COMPANY(WF_CO),
      { key: 'name', label: 'ชื่อ-นามสกุล', required: true },
      { key: 'hub', label: 'คลัง/ฮับ', type: 'select', required: true, options: opt(HUBS, (r) => r.name) },
      { key: 'source', label: 'ช่องทางสมัคร', type: 'select', required: true, options: co(['LINE OA', 'Facebook', 'แนะนำ', 'Walk-in']) },
    ],
  },
  MPR: {
    title: 'คำขอกำลังคน',
    defaults: { company: 'SPT', status: 'รออนุมัติ', filled: 0 },
    fields: [
      COMPANY(WF_CO),
      { key: 'hub', label: 'คลัง/ฮับ', type: 'select', required: true, options: opt(HUBS, (r) => r.name) },
      { key: 'shiftDate', label: 'วันที่ต้องการ', type: 'date', required: true },
      { key: 'requested', label: 'จำนวนที่ขอ (คน)', type: 'number', required: true, min: 1 },
    ],
    transform: (d) => ({ ...d, customer: HUBS.find((h) => h.id === d.hub)!.customer }),
  },
  WRT: {
    title: 'อัตราค่าจ้าง',
    defaults: { company: 'SPT', status: 'ใช้งาน', effective: '2026-11-01' },
    fields: [
      COMPANY(WF_CO),
      { key: 'role', label: 'ตำแหน่ง', type: 'select', required: true, options: co(['พนักงานคัดแยก', 'หัวหน้ากะ']) },
      { key: 'hub', label: 'คลัง/ฮับ', type: 'select', required: true, options: opt(HUBS, (r) => r.name) },
      { key: 'daily', label: 'ค่าแรงรายวัน', type: 'number', required: true, min: 450, hint: 'ต้องไม่ต่ำกว่า ฿450' },
      { key: 'ot', label: 'ค่า OT ต่อชั่วโมง', type: 'number', required: true, min: 1 },
    ],
  },
  PEN: {
    title: 'ค่าปรับ',
    defaults: { company: 'SPT', status: 'รออนุมัติ' },
    fields: [
      COMPANY(WF_CO),
      { key: 'hub', label: 'คลัง/ฮับ', type: 'select', required: true, options: opt(HUBS, (r) => r.name) },
      { key: 'reason', label: 'เหตุผล', type: 'textarea', required: true },
      { key: 'amount', label: 'จำนวนเงิน', type: 'number', required: true, min: 1 },
    ],
    transform: (d) => ({ ...d, customer: HUBS.find((h) => h.id === d.hub)!.customer }),
  },
}
