import { Bar, C, type TableCfg } from '../components/engine'
import { baht } from '../components/ui'
import type { Rec } from '../lib/data'

const is = (...s: string[]) => (r: Rec) => s.includes(r.status)
const all = { id: 'all', label: 'ทั้งหมด', where: () => true }
const T = (id: string, label: string, ...s: string[]) => ({ id, label, where: is(...s) })
const cnt = (rows: Rec[], f: (r: Rec) => boolean) => rows.filter(f).length
const sum = (rows: Rec[], k: string) => rows.reduce((s, r) => s + (r[k] || 0), 0)
const PEND = ['รออนุมัติ', 'รอตรวจสอบ']
const BAD = ['ผิดปกติ', 'ซ้ำ', 'ขาดเอกสาร', 'ถูกบล็อก', 'ข้อพิพาท', 'ไม่ตรงกัน', 'ขาด OUT']

export const TABLES: Record<string, TableCfg> = {
  trips: {
    prefix: 'TRP', title: 'จัดการเที่ยววิ่ง', desc: 'เที่ยววิ่งทั้งหมดพร้อมผลตรวจสอบอัตโนมัติ — คลิกแถวเพื่อดูเอกสาร ค่าใช้จ่าย น้ำมัน และกำไรที่เชื่อมโยง', addLabel: 'เพิ่มเที่ยววิ่ง',
    filters: ['company', 'type', 'status'],
    tabs: [all, T('bad', 'ผิดปกติ', 'ผิดปกติ', 'ซ้ำ', 'ขาดเอกสาร'), T('run', 'กำลังดำเนินการ', 'กำลังดำเนินการ'), T('ok', 'ตรวจสอบแล้ว', 'ตรวจสอบแล้ว')],
    kpis: (r) => [{ label: 'เที่ยววิ่ง', value: r.length }, { label: 'ผิดปกติ', value: cnt(r, (x) => BAD.includes(x.status)), tone: 'bad', pick: (x) => BAD.includes(x.status) }, { label: 'ขาดเอกสาร', value: cnt(r, (x) => x.docs !== 'ครบ'), tone: 'warn', pick: (x) => x.docs !== 'ครบ' }, { label: 'รายได้รวม', value: baht(sum(r, 'revenue')) }, { label: 'ต้นทุนรวม', value: baht(sum(r, 'cost')) }],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('route', 'เส้นทาง'), C('customerName', 'ลูกค้า'), C('vehicle', 'รถ'), C('driver', 'คนขับ'), C('barcode', 'บาร์โค้ด', 'mono'), C('km', 'กม.', 'num'), C('revenue', 'รายได้', 'money'), C('cost', 'ต้นทุน', 'money'), C('docs', 'เอกสาร', 'badge'), C('status', 'สถานะ', 'badge')],
  },
  routes: {
    prefix: 'RTE', title: 'วางแผนเส้นทาง', desc: 'เส้นทางมาตรฐาน ระยะทาง เวลา น้ำมัน และอัตราค่าขนส่ง — เส้นทางที่ไม่ได้อนุมัติจะถูกตรวจจับเมื่อมีเที่ยววิ่งใช้งาน', addLabel: 'เพิ่มเส้นทาง', noAdd: true,
    filters: ['approved'],
    cols: [C('name', 'เส้นทาง'), C('km', 'ระยะทาง (กม.)', 'num'), C('stdHr', 'เวลามาตรฐาน (ชม.)', 'num'), C('stdFuel', 'น้ำมันมาตรฐาน (ลิตร)', 'num'), C('rate', 'อัตรา/เที่ยว', 'money'), C('approved', 'การอนุมัติ', 'badge')],
  },
  vehicles: {
    prefix: 'VEH', title: 'รถบริษัท', desc: 'ทะเบียนรถบริษัท การใช้งาน และวันหมดอายุเอกสาร', where: (r) => r.ownership === 'รถบริษัท', filters: ['company', 'type', 'status'],
    cols: [C('plate', 'ทะเบียน'), C('company', 'บริษัท'), C('type', 'ประเภท'), C('status', 'สถานะ', 'badge'), C('odo', 'เลขไมล์', 'num'), C('util', 'การใช้งาน %', 'bar', { render: (r) => <Bar v={r.util} /> }), C('docExp', 'เอกสารหมดอายุ', 'date')],
  },
  partners: {
    prefix: 'VEH', title: 'รถร่วม', desc: 'รถของพันธมิตรที่ร่วมวิ่งงาน — แสดงเจ้าของรถและเอกสาร', where: (r) => r.ownership !== 'รถบริษัท', filters: ['company', 'status'],
    cols: [C('plate', 'ทะเบียน'), C('company', 'บริษัท'), C('owner', 'เจ้าของรถร่วม'), C('type', 'ประเภท'), C('status', 'สถานะ', 'badge'), C('docExp', 'เอกสารหมดอายุ', 'date')],
  },
  drivers: {
    prefix: 'DRV', title: 'คนขับ', desc: 'ทะเบียนคนขับ ใบขับขี่ และรถที่รับผิดชอบ', filters: ['company', 'status'],
    cols: [C('name', 'ชื่อ'), C('company', 'บริษัท'), C('license', 'ใบขับขี่'), C('licExp', 'ใบขับขี่หมดอายุ', 'date'), C('phone', 'โทรศัพท์'), C('vehicle', 'รถ'), C('status', 'สถานะ', 'badge')],
  },
  vdocs: {
    prefix: 'VDC', title: 'เอกสารยานพาหนะ', desc: 'ภาษี ประกัน พ.ร.บ. และเอกสารอื่น พร้อมการเตือนวันหมดอายุ', noAdd: true, filters: ['company', 'type', 'status'],
    tabs: [all, T('soon', 'ใกล้หมดอายุ', 'ใกล้หมดอายุ'), T('exp', 'หมดอายุ', 'หมดอายุ')],
    cols: [C('vehicle', 'รถ'), C('company', 'บริษัท'), C('type', 'เอกสาร'), C('exp', 'วันหมดอายุ', 'date'), C('status', 'สถานะ', 'badge')],
  },
  maintenance: {
    prefix: 'MNT', title: 'ซ่อมบำรุง', desc: 'งานซ่อมบำรุง เชื่อมกับค่าใช้จ่ายที่เบิกจริง', noAdd: true, filters: ['company', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('vehicle', 'รถ'), C('type', 'งาน'), C('cost', 'ค่าใช้จ่าย', 'money'), C('expense', 'ค่าใช้จ่ายที่เชื่อม'), C('status', 'สถานะ', 'badge')],
  },
  fuel: {
    prefix: 'FUL', title: 'คำขอน้ำมัน', desc: 'คำขอเบิกน้ำมันล่วงหน้าต่อเที่ยววิ่ง และการสรุปยอดจริง', addLabel: 'สร้างคำขอน้ำมัน', filters: ['company', 'status', 'settled'],
    tabs: [all, T('p', 'รออนุมัติ', ...PEND), T('s', 'รอสรุปยอด', 'อนุมัติแล้ว')],
    kpis: (r) => [{ label: 'คำขอทั้งหมด', value: r.length }, { label: 'รออนุมัติ', value: cnt(r, is(...PEND)), tone: 'warn', pick: is(...PEND) }, { label: 'เงินเบิกล่วงหน้ารอคืน', value: baht(r.filter((x) => String(x.settled).startsWith('รอคืน')).reduce((s, x) => s + x.advance - x.actual, 0)), tone: 'warn', pick: (x) => String(x.settled).startsWith('รอคืน') }],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('trip', 'เที่ยววิ่ง'), C('vehicle', 'รถ'), C('driver', 'คนขับ'), C('liters', 'ลิตร', 'num'), C('advance', 'เบิกล่วงหน้า', 'money'), C('actual', 'ยอดจริง', 'money'), C('settled', 'การสรุปยอด', 'badge'), C('status', 'สถานะ', 'badge')],
  },
  'fuel-status': {
    prefix: 'FUL', title: 'สถานะอนุมัติน้ำมัน', desc: 'ติดตามคำขอน้ำมันที่รออนุมัติและที่ยังไม่สรุปยอดเงินเบิกล่วงหน้า', noAdd: true, filters: ['company', 'status'],
    tabs: [T('p', 'รออนุมัติ', ...PEND), T('s', 'เบิกล่วงหน้ารอคืน', 'อนุมัติแล้ว'), all],
    cols: [C('company', 'บริษัท'), C('trip', 'เที่ยววิ่ง'), C('requester', 'ผู้ขอ'), C('advance', 'เบิกล่วงหน้า', 'money'), C('actual', 'ยอดจริง', 'money'), C('settled', 'การสรุปยอด', 'badge'), C('status', 'สถานะ', 'badge')],
  },
  fueltx: {
    prefix: 'FTX', title: 'ประวัติธุรกรรมน้ำมัน', desc: 'รายการจากบัตรน้ำมัน/สถานีบริการ เทียบกับคำขอ', noAdd: true, filters: ['company', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('fuel', 'คำขอน้ำมัน'), C('vehicle', 'รถ'), C('station', 'สถานี'), C('card', 'บัตร', 'mono'), C('liters', 'ลิตร', 'num'), C('amount', 'จำนวนเงิน', 'money'), C('status', 'สถานะ', 'badge')],
  },
  'fuel-recon': {
    prefix: 'FTX', title: 'กระทบยอดน้ำมัน', desc: 'จับคู่ธุรกรรมน้ำมันกับคำขอ — รายการที่ไม่ตรงต้องตรวจสอบก่อนปิดยอด', noAdd: true, filters: ['company', 'status'],
    tabs: [all, T('d', 'ไม่ตรงกัน', 'ไม่ตรงกัน', 'รอตรวจสอบ'), T('m', 'ตรงกัน', 'ตรงกัน')],
    cols: [C('fuel', 'คำขอน้ำมัน'), C('company', 'บริษัท'), C('station', 'สถานี'), C('liters', 'ลิตร', 'num'), C('amount', 'จำนวนเงิน', 'money'), C('status', 'ผลกระทบยอด', 'badge')],
  },
  'other-exp': {
    prefix: 'EXP', title: 'ค่าใช้จ่ายอื่น ๆ', desc: 'บันทึกค่าใช้จ่ายประกอบเที่ยววิ่ง — ระบบตรวจรายการซ้ำและเทียบงบก่อนส่งอนุมัติ', addLabel: 'เพิ่มค่าใช้จ่าย', filters: ['company', 'type', 'status', 'validation'],
    tabs: [all, T('b', 'ถูกบล็อก', 'ถูกบล็อก'), T('p', 'รออนุมัติ', ...PEND)],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('type', 'ประเภท'), C('trip', 'เที่ยววิ่ง'), C('beneficiary', 'ผู้รับเงิน'), C('amount', 'จำนวนเงิน', 'money'), C('budget', 'งบ', 'money'), C('validation', 'ตรวจสอบ', 'badge'), C('status', 'สถานะ', 'badge')],
  },
  'expense-approval': {
    prefix: 'EXP', title: 'อนุมัติค่าใช้จ่าย', desc: 'อนุมัติหลายระดับตามวงเงิน — ห้ามอนุมัติรายการของตนเอง และห้ามอนุมัติรายการที่ถูกบล็อก', noAdd: true, filters: ['company', 'type', 'validation', 'status'],
    tabs: [T('p', 'รออนุมัติ', ...PEND), T('b', 'ถูกบล็อก', 'ถูกบล็อก'), T('a', 'อนุมัติแล้ว', 'อนุมัติแล้ว'), T('r', 'ปฏิเสธ', 'ปฏิเสธ', 'ส่งกลับแก้ไข'), T('paid', 'จ่ายแล้ว', 'จ่ายแล้ว'), all],
    kpis: (r) => [{ label: 'รออนุมัติ', value: cnt(r, is(...PEND)), tone: 'warn', pick: is(...PEND) }, { label: 'มูลค่ารออนุมัติ', value: baht(r.filter(is(...PEND)).reduce((s, x) => s + x.amount, 0)), pick: is(...PEND) }, { label: 'ถูกบล็อก', value: cnt(r, is('ถูกบล็อก')), tone: 'bad', pick: is('ถูกบล็อก') }, { label: 'เกินงบ', value: cnt(r, (x) => x.amount > x.budget), tone: 'warn', pick: (x) => x.amount > x.budget }, { label: 'อนุมัติแล้ว', value: cnt(r, is('อนุมัติแล้ว')), tone: 'ok' }],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('type', 'ประเภท'), C('beneficiary', 'ผู้รับเงิน'), C('requester', 'ผู้ขอ'), C('trip', 'เที่ยววิ่ง'), C('amount', 'จำนวนเงิน', 'money'), C('budget', 'งบ', 'money'), C('level', 'ระดับอนุมัติ', 'num'), C('validation', 'ตรวจสอบ', 'badge'), C('status', 'สถานะ', 'badge')],
  },
  'daily-pay': {
    prefix: 'PAY', title: 'สรุปการจ่ายรายวัน', desc: 'การจ่ายเงินรายวัน — หนึ่งการจ่ายอาจครอบคลุมหลายเที่ยววิ่ง', noAdd: true, filters: ['company', 'kind', 'status'],
    kpis: (r) => [{ label: 'รายการจ่าย', value: r.length }, { label: 'ยอดจ่ายรวม', value: baht(sum(r, 'amount')) }, { label: 'ยังไม่กระทบยอด', value: cnt(r, (x) => x.status !== 'กระทบยอดแล้ว'), tone: 'warn', pick: (x) => x.status !== 'กระทบยอดแล้ว' }],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('beneficiary', 'ผู้รับเงิน'), C('kind', 'ประเภท'), C('trips', 'เที่ยววิ่งที่เกี่ยวข้อง', undefined, { render: (r) => <span>{r.trips.length} เที่ยว</span> }), C('batch', 'Batch'), C('bank', 'ธนาคาร'), C('amount', 'จำนวนเงิน', 'money'), C('status', 'สถานะ', 'badge')],
  },
  batches: {
    prefix: 'BAT', title: 'ชุดการจ่ายเงิน (Batch)', desc: 'รวมรายการที่อนุมัติแล้วเพื่อสั่งจ่าย — ตรวจสอบยอดรวมและผู้อนุมัติ', noAdd: true, filters: ['company', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('count', 'จำนวนรายการ', 'num'), C('total', 'ยอดรวม', 'money'), C('approver', 'ผู้อนุมัติ'), C('status', 'สถานะ', 'badge')],
  },
  'bank-recon': {
    prefix: 'BNK', title: 'กระทบยอดธนาคาร', desc: 'จับคู่รายการใน statement กับการจ่ายเงินในระบบ', noAdd: true, filters: ['status'],
    tabs: [all, T('u', 'ยังไม่ตรง', 'ไม่ตรงกัน', 'รอตรวจสอบ'), T('m', 'ตรงกัน', 'ตรงกัน')],
    cols: [C('date', 'วันที่', 'date'), C('ref', 'อ้างอิงธนาคาร', 'mono'), C('desc', 'รายละเอียด'), C('amount', 'จำนวนเงิน', 'money'), C('pay', 'การจ่ายที่จับคู่'), C('status', 'สถานะ', 'badge')],
  },
  billing: {
    prefix: 'INV', title: 'วางบิล', desc: 'ใบวางบิลลูกค้าขนส่ง สถานะชำระ และลูกหนี้ค้างชำระ', noAdd: true, filters: ['company', 'customerName', 'status'],
    tabs: [all, T('o', 'เกินกำหนด', 'เกินกำหนด'), T('w', 'รอชำระ', 'รอชำระ', 'วางบิลแล้ว'), T('p', 'ชำระแล้ว', 'ชำระแล้ว')],
    kpis: (r) => [{ label: 'ยอดวางบิล', value: baht(sum(r, 'amount')) }, { label: 'ลูกหนี้ค้างชำระ', value: baht(sum(r, 'amount') - sum(r, 'paid')), tone: 'warn', pick: (x) => x.paid < x.amount }, { label: 'เกินกำหนด', value: baht(r.filter(is('เกินกำหนด')).reduce((s, x) => s + x.amount, 0)), tone: 'bad', pick: is('เกินกำหนด') }],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('customerName', 'ลูกค้า'), C('period', 'งวด'), C('trips', 'เที่ยว', 'num'), C('amount', 'ยอดบิล', 'money'), C('paid', 'ชำระแล้ว', 'money'), C('due', 'ครบกำหนด', 'date'), C('status', 'สถานะ', 'badge')],
  },
  'cus-recon': {
    prefix: 'RCN', title: 'กระทบยอดลูกค้า', desc: 'เทียบยอดของเรากับยอดที่ลูกค้ายืนยัน', noAdd: true, filters: ['company', 'customerName', 'status'],
    tabs: [all, T('d', 'ไม่ตรงกัน', 'ไม่ตรงกัน', 'รอตรวจสอบ'), T('m', 'ตรงกัน', 'ตรงกัน')],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('customerName', 'ลูกค้า'), C('period', 'งวด'), C('ours', 'ยอดของเรา', 'money'), C('theirs', 'ยอดลูกค้า', 'money'), C('diff', 'ผลต่าง', 'money'), C('status', 'สถานะ', 'badge')],
  },
  'profit-trip': {
    prefix: 'PFT', title: 'กำไรต่อเที่ยว', desc: 'รายได้เทียบต้นทุนรายเที่ยววิ่ง — เที่ยวขาดทุนถูกไฮไลต์', noAdd: true, filters: ['company', 'status'],
    tabs: [all, T('l', 'ขาดทุน/มาร์จิ้นต่ำ', 'ขาดทุน', 'มาร์จิ้นต่ำ')],
    kpis: (r) => [{ label: 'รายได้', value: baht(sum(r, 'revenue')) }, { label: 'ต้นทุน', value: baht(sum(r, 'cost')) }, { label: 'กำไร', value: baht(sum(r, 'profit')), tone: sum(r, 'profit') < 0 ? 'bad' : 'ok' }, { label: 'เที่ยวขาดทุน', value: cnt(r, (x) => x.profit < 0), tone: 'bad', pick: (x) => x.profit < 0 }],
    rowTone: (r) => (r.profit < 0 ? 'bg-red-50/60' : undefined),
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('trip', 'เที่ยววิ่ง'), C('vehicle', 'รถ'), C('revenue', 'รายได้', 'money'), C('cost', 'ต้นทุน', 'money'), C('profit', 'กำไร', 'money'), C('margin', 'มาร์จิ้น %', 'pct'), C('status', 'สถานะ', 'badge')],
  },

  /* ───── Workforce ───── */
  employees: {
    prefix: 'EMP', title: 'ทะเบียนพนักงาน', desc: 'พนักงานรายวันของ SPT และ TPL พร้อมรหัสพนักงานลูกค้า', addLabel: 'เพิ่มพนักงาน', filters: ['company', 'hub', 'role', 'status', 'docs'],
    kpis: (r) => [{ label: 'พนักงานทั้งหมด', value: r.length }, { label: 'เอกสารไม่ครบ', value: cnt(r, (x) => x.docs !== 'ครบถ้วน'), tone: 'warn', pick: (x) => x.docs !== 'ครบถ้วน' }, { label: 'ค่าแรงเฉลี่ย/วัน', value: baht(r.length ? sum(r, 'wage') / r.length : 0) }],
    cols: [C('name', 'ชื่อ'), C('company', 'บริษัท'), C('role', 'ตำแหน่ง'), C('hub', 'ฮับ'), C('customer', 'ลูกค้า'), C('custId', 'รหัสลูกค้า', 'mono'), C('wage', 'ค่าแรง/วัน', 'money'), C('docs', 'เอกสาร', 'badge'), C('status', 'สถานะ', 'badge')],
  },
  onboarding: {
    prefix: 'ONB', title: 'รับพนักงานใหม่', desc: 'ติดตามขั้นตอนรับพนักงานใหม่จนเริ่มงาน', noAdd: true, filters: ['company', 'step', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('name', 'ชื่อ'), C('employee', 'รหัสพนักงาน'), C('company', 'บริษัท'), C('step', 'ขั้นตอน'), C('progress', 'ความคืบหน้า', 'bar', { render: (r) => <Bar v={r.progress} /> }), C('status', 'สถานะ', 'badge')],
  },
  edocs: {
    prefix: 'EDC', title: 'เอกสารพนักงาน', desc: 'เอกสารประกอบการจ้างและวันหมดอายุ', noAdd: true, filters: ['company', 'type', 'status'],
    cols: [C('employee', 'พนักงาน'), C('company', 'บริษัท'), C('type', 'เอกสาร'), C('exp', 'วันหมดอายุ', 'date'), C('status', 'สถานะ', 'badge')],
  },
  contracts: {
    prefix: 'CTR', title: 'สัญญาจ้าง', desc: 'สัญญาจ้างรายวัน/รายเดือน และวันสิ้นสุดสัญญา', noAdd: true, filters: ['company', 'type', 'status'],
    cols: [C('employee', 'พนักงาน'), C('company', 'บริษัท'), C('type', 'ประเภท'), C('start', 'เริ่ม', 'date'), C('end', 'สิ้นสุด', 'date'), C('status', 'สถานะ', 'badge')],
  },
  customers: {
    prefix: 'WCU', title: 'ลูกค้า', desc: 'ลูกค้า Workforce เงื่อนไขชำระ และรูปแบบรหัสพนักงาน', noAdd: true, filters: ['status'],
    cols: [C('name', 'ลูกค้า'), C('company', 'บริษัท'), C('idPrefix', 'รหัสพนักงานลูกค้า', 'mono'), C('hubs', 'จำนวนฮับ', 'num'), C('terms', 'เครดิต (วัน)', 'num'), C('status', 'สถานะ', 'badge')],
  },
  hubs: {
    prefix: 'HUB', title: 'คลัง / ฮับ', desc: 'สถานที่ปฏิบัติงาน กำลังคน และ SLA', noAdd: true, filters: ['company', 'customer', 'status'],
    cols: [C('name', 'ฮับ'), C('customer', 'ลูกค้า'), C('company', 'บริษัท'), C('headcount', 'กำลังคน', 'num'), C('sla', 'SLA %', 'pct'), C('status', 'สถานะ', 'badge')],
  },
  mpr: {
    prefix: 'MPR', title: 'คำขอกำลังคน', desc: 'คำขอกำลังคนจากลูกค้าและฮับ — ระบบเตือนเมื่อจัดคนได้ไม่ครบ', addLabel: 'สร้างคำขอกำลังคน', filters: ['company', 'customer', 'status'],
    tabs: [all, T('p', 'รออนุมัติ', ...PEND), T('s', 'ขาดกำลังคน', 'ขาดกำลังคน')],
    kpis: (r) => [{ label: 'คำขอ', value: r.length }, { label: 'ต้องการ', value: sum(r, 'requested') }, { label: 'จัดได้', value: sum(r, 'filled') }, { label: 'ขาด', value: sum(r, 'requested') - sum(r, 'filled'), tone: 'bad', pick: (x) => x.filled < x.requested }],
    cols: [C('date', 'วันที่ขอ', 'date'), C('company', 'บริษัท'), C('customer', 'ลูกค้า'), C('hub', 'ฮับ'), C('shiftDate', 'วันที่ต้องการ', 'date'), C('requested', 'ต้องการ', 'num'), C('filled', 'จัดได้', 'num'), C('status', 'สถานะ', 'badge')],
  },
  mpl: {
    prefix: 'MPL', title: 'แผนกำลังคนรายเดือน', desc: 'แผนกำลังคนเทียบกำลังคนปัจจุบัน และช่องว่างที่ต้องสรรหา', noAdd: true, filters: ['company', 'month', 'status'],
    cols: [C('company', 'บริษัท'), C('hub', 'ฮับ'), C('month', 'เดือน'), C('planned', 'แผน', 'num'), C('current', 'ปัจจุบัน', 'num'), C('gap', 'ช่องว่าง', 'num'), C('status', 'สถานะ', 'badge')],
  },
  assign: {
    prefix: 'SAS', title: 'มอบหมายกะพนักงาน', desc: 'จัดพนักงานเข้ากะ — ระบบตรวจการซ้อนทับของกะ', noAdd: true, filters: ['company', 'hub', 'shift', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('employee', 'รหัส'), C('company', 'บริษัท'), C('hub', 'ฮับ'), C('shift', 'กะ'), C('note', 'หมายเหตุ'), C('status', 'สถานะ', 'badge')],
  },
  avail: {
    prefix: 'AVL', title: 'ความพร้อมพนักงาน', desc: 'จำนวนวันที่พนักงานแจ้งว่าพร้อมทำงาน', noAdd: true, filters: ['company', 'pref', 'status'],
    cols: [C('name', 'พนักงาน'), C('employee', 'รหัส'), C('company', 'บริษัท'), C('days', 'วันที่พร้อม', 'num'), C('pref', 'กะที่ต้องการ'), C('status', 'สถานะ', 'badge')],
  },
  attendance: {
    prefix: 'ATT', title: 'เวลา IN / OUT', desc: 'บันทึกเข้า-ออกงานจาก QR, LINE และข้อมูลลูกค้า — ตรวจ OUT ที่ขาด การซ้ำ และเวลาผิดปกติ', noAdd: true, filters: ['company', 'hub', 'source', 'status'],
    tabs: [all, T('x', 'ผิดปกติ', 'ขาด OUT', 'ซ้ำ', 'ข้อพิพาท', 'สาย'), T('ok', 'ผ่าน', 'ผ่าน')],
    kpis: (r) => [{ label: 'บันทึกทั้งหมด', value: r.length }, { label: 'ขาด OUT', value: cnt(r, is('ขาด OUT')), tone: 'bad', pick: is('ขาด OUT') }, { label: 'ซ้ำ', value: cnt(r, is('ซ้ำ')), tone: 'bad', pick: is('ซ้ำ') }, { label: 'ข้อพิพาท', value: cnt(r, is('ข้อพิพาท')), tone: 'warn', pick: is('ข้อพิพาท') }],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('employee', 'รหัส'), C('company', 'บริษัท'), C('hub', 'ฮับ'), C('shift', 'กะ'), C('in', 'เข้า', 'mono'), C('out', 'ออก', 'mono'), C('source', 'ช่องทาง'), C('status', 'สถานะ', 'badge')],
  },
  line: {
    prefix: 'LNE', title: 'กล่องรูป LINE', desc: 'รูปหลักฐานเข้า-ออกงานที่ส่งผ่าน LINE (ยังไม่เชื่อมต่อ — ข้อมูลสาธิต)', noAdd: true, filters: ['company', 'type', 'status'],
    tabs: [T('p', 'รอตรวจสอบ', 'รอตรวจสอบ'), all],
    cols: [C('date', 'วันที่', 'date'), C('time', 'เวลา', 'mono'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('type', 'ประเภท'), C('att', 'บันทึกเวลา'), C('status', 'สถานะ', 'badge')],
  },
  qr: {
    prefix: 'QRC', title: 'QR Code ลงเวลา', desc: 'QR สำหรับสแกนเข้า-ออกงานประจำฮับ', noAdd: true, filters: ['company', 'status'],
    cols: [C('name', 'QR'), C('hub', 'ฮับ'), C('company', 'บริษัท'), C('scans', 'จำนวนสแกน', 'num'), C('lastScan', 'สแกนล่าสุด', 'mono'), C('status', 'สถานะ', 'badge')],
  },
  'att-validation': {
    prefix: 'ATT', title: 'ตรวจสอบเวลา', desc: 'คิวรายการเวลาทำงานที่ต้องตรวจก่อนคำนวณค่าแรง', noAdd: true, where: (r) => r.status !== 'ผ่าน', filters: ['company', 'hub', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('hub', 'ฮับ'), C('in', 'เข้า', 'mono'), C('out', 'ออก', 'mono'), C('source', 'ช่องทาง'), C('status', 'ปัญหา', 'badge')],
  },
  'cust-att': {
    prefix: 'CAI', title: 'นำเข้าข้อมูลเวลาลูกค้า', desc: 'ข้อมูลเวลาจากระบบลูกค้า เทียบกับบันทึกของเรา', noAdd: true, filters: ['company', 'customer', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('customer', 'ลูกค้า'), C('custEmp', 'รหัสลูกค้า', 'mono'), C('employee', 'พนักงาน'), C('in', 'เข้า', 'mono'), C('out', 'ออก', 'mono'), C('status', 'สถานะ', 'badge')],
  },
  'att-recon': {
    prefix: 'ARC', title: 'กระทบยอดเวลา', desc: 'เทียบชั่วโมงทำงานของเรากับของลูกค้า', noAdd: true, filters: ['company', 'status'],
    tabs: [all, T('d', 'ไม่ตรงกัน', 'ไม่ตรงกัน', 'รอตรวจสอบ'), T('m', 'ตรงกัน', 'ตรงกัน')],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('att', 'บันทึกเวลา'), C('oursHr', 'ชม.ของเรา', 'num'), C('theirsHr', 'ชม.ลูกค้า', 'num'), C('diff', 'ผลต่าง', 'num'), C('status', 'สถานะ', 'badge')],
  },
  disputes: {
    prefix: 'DSP', title: 'ข้อพิพาทเวลา', desc: 'ข้อพิพาทเวลาทำงานระหว่างบริษัทกับลูกค้า พร้อมหลักฐานของแต่ละฝ่าย', noAdd: true, filters: ['company', 'customer', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('customer', 'ลูกค้า'), C('claim', 'ข้อเรียกร้อง'), C('ourEvidence', 'หลักฐานของเรา'), C('amount', 'มูลค่า', 'money'), C('owner', 'ผู้รับผิดชอบ'), C('status', 'สถานะ', 'badge')],
  },
  leave: {
    prefix: 'LVE', title: 'ลา / ขาด / สาย', desc: 'ข้อมูลการลา ขาดงาน และมาสาย', noAdd: true, filters: ['company', 'type', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('type', 'ประเภท'), C('minutes', 'นาที', 'num'), C('status', 'สถานะ', 'badge')],
  },
  ot: {
    prefix: 'OTR', title: 'คำนวณ OT', desc: 'ชั่วโมงล่วงเวลาและค่าล่วงเวลา — รออนุมัติโดยหัวหน้า', noAdd: true, filters: ['company', 'status'],
    tabs: [all, T('p', 'รออนุมัติ', ...PEND)],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('hours', 'ชม. OT', 'num'), C('rate', 'อัตรา/ชม.', 'money'), C('amount', 'ค่า OT', 'money'), C('status', 'สถานะ', 'badge')],
  },
  wage: {
    prefix: 'WRT', title: 'อัตราค่าจ้าง', desc: 'อัตราค่าจ้างตามตำแหน่ง — ต่ำกว่าค่าแรงขั้นต่ำ ฿450 จะถูกเตือน', addLabel: 'เพิ่มอัตราค่าจ้าง', filters: ['company', 'hub', 'status'],
    cols: [C('role', 'ตำแหน่ง'), C('company', 'บริษัท'), C('hub', 'ฮับ'), C('daily', 'ค่าแรง/วัน', 'money'), C('ot', 'OT/ชม.', 'money'), C('effective', 'มีผล', 'date'), C('status', 'สถานะ', 'badge')],
  },
  dwage: {
    prefix: 'DWG', title: 'ค่าแรงรายวัน', desc: 'ค่าแรงที่คำนวณจากบันทึกเวลา', noAdd: true, filters: ['company', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('att', 'บันทึกเวลา'), C('hours', 'ชั่วโมง', 'num'), C('wage', 'ค่าแรง', 'money'), C('status', 'สถานะ', 'badge')],
  },
  sla: {
    prefix: 'SLA', title: 'SLA คลังสินค้า', desc: 'ผลการดำเนินงานเทียบเป้า SLA รายฮับ', noAdd: true, filters: ['company', 'hub', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('hub', 'ฮับ'), C('company', 'บริษัท'), C('week', 'สัปดาห์'), C('target', 'เป้า %', 'pct'), C('actual', 'จริง %', 'pct'), C('shortage', 'ขาดคน', 'num'), C('status', 'สถานะ', 'badge')],
  },
  penalty: {
    prefix: 'PEN', title: 'ค่าปรับ', desc: 'ค่าปรับจากลูกค้าเมื่อไม่ผ่าน SLA — ต้องอนุมัติก่อนหักบิล', addLabel: 'บันทึกค่าปรับ', filters: ['company', 'customer', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('hub', 'ฮับ'), C('customer', 'ลูกค้า'), C('reason', 'เหตุผล'), C('amount', 'จำนวนเงิน', 'money'), C('status', 'สถานะ', 'badge')],
  },
  wbilling: {
    prefix: 'WBL', title: 'วางบิลลูกค้า', desc: 'ใบวางบิลตามจำนวนคน-วัน', noAdd: true, filters: ['company', 'customer', 'status'],
    kpis: (r) => [{ label: 'ยอดวางบิล', value: baht(sum(r, 'amount')) }, { label: 'ค้างชำระ', value: baht(sum(r, 'amount') - sum(r, 'paid')), tone: 'warn', pick: (x) => x.paid < x.amount }],
    cols: [C('date', 'วันที่', 'date'), C('company', 'บริษัท'), C('customer', 'ลูกค้า'), C('hub', 'ฮับ'), C('period', 'งวด'), C('headcountDays', 'คน-วัน', 'num'), C('amount', 'ยอดบิล', 'money'), C('paid', 'ชำระแล้ว', 'money'), C('status', 'สถานะ', 'badge')],
  },
  'wbill-recon': {
    prefix: 'WCR', title: 'กระทบยอดบิล', desc: 'เทียบยอดบิลของเรากับยอดที่ลูกค้ายืนยัน', noAdd: true, filters: ['company', 'customer', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('invoice', 'ใบวางบิล'), C('customer', 'ลูกค้า'), C('ours', 'ยอดของเรา', 'money'), C('theirs', 'ยอดลูกค้า', 'money'), C('diff', 'ผลต่าง', 'money'), C('status', 'สถานะ', 'badge')],
  },
  wprofit: {
    prefix: 'WPF', title: 'กำไรตามฮับ / ลูกค้า', desc: 'รายได้เทียบต้นทุนแรงงานรายฮับ', noAdd: true, filters: ['company', 'status'],
    cols: [C('hub', 'ฮับ'), C('company', 'บริษัท'), C('revenue', 'รายได้', 'money'), C('cost', 'ต้นทุน', 'money'), C('profit', 'กำไร', 'money'), C('margin', 'มาร์จิ้น %', 'pct'), C('status', 'สถานะ', 'badge')],
  },
  'payroll-approve': {
    prefix: 'PRL', title: 'อนุมัติเงินเดือน', desc: 'อนุมัติเงินเดือนรายคน — รายการซ้ำถูกบล็อก ผู้เตรียมอนุมัติของตนเองไม่ได้', noAdd: true, filters: ['company', 'period', 'status'],
    tabs: [T('p', 'รออนุมัติ', ...PEND), T('b', 'ถูกบล็อก', 'ถูกบล็อก'), T('a', 'อนุมัติแล้ว', 'อนุมัติแล้ว'), all],
    kpis: (r) => [{ label: 'รออนุมัติ', value: cnt(r, is(...PEND)), tone: 'warn', pick: is(...PEND) }, { label: 'ยอดสุทธิรออนุมัติ', value: baht(r.filter(is(...PEND)).reduce((s, x) => s + x.net, 0)) }, { label: 'ถูกบล็อก (ซ้ำ)', value: cnt(r, is('ถูกบล็อก')), tone: 'bad', pick: is('ถูกบล็อก') }],
    cols: [C('period', 'งวด'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('days', 'วัน', 'num'), C('gross', 'รายได้', 'money'), C('ot', 'OT', 'money'), C('deduction', 'หัก', 'money'), C('net', 'สุทธิ', 'money'), C('requester', 'ผู้เตรียม'), C('status', 'สถานะ', 'badge')],
  },
  'pay-recon': {
    prefix: 'PPR', title: 'กระทบยอดจ่ายเงินเดือน', desc: 'เทียบเงินเดือนที่อนุมัติกับรายการโอนธนาคาร', noAdd: true, filters: ['company', 'status'],
    cols: [C('date', 'วันที่', 'date'), C('name', 'พนักงาน'), C('company', 'บริษัท'), C('payroll', 'เงินเดือน'), C('amount', 'จำนวนเงิน', 'money'), C('bank', 'ธนาคาร'), C('status', 'สถานะ', 'badge')],
  },
}

export const BADS = BAD
