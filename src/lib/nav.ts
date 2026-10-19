import type { Role } from './data'

export type NavItem = { id: string; label: string; perms?: string[] }
export type NavGroup = { group: string; items: NavItem[] }
export const APP_META = {
  exec: { name: 'Executive Center', th: 'ศูนย์บริหารกลุ่ม', desc: 'ภาพรวมการเงิน ความเสี่ยง และการอนุมัติของทั้งกลุ่ม P.T.NEX', color: '#E6005C' },
  transport: { name: 'Transport ERP', th: 'ระบบขนส่ง', desc: 'SPV · TKQ · THRS · T&A — เที่ยววิ่ง รถ น้ำมัน ค่าใช้จ่าย วางบิล', color: '#E6005C' },
  workforce: { name: 'Workforce ERP', th: 'ระบบบริหารกำลังคน', desc: 'SPT · TPL — สรรหา กะงาน เวลาทำงาน เงินเดือน วางบิลลูกค้า', color: '#E6005C' },
} as const

const SHARED: NavGroup = {
  group: 'ศูนย์ควบคุม',
  items: [
    { id: 'validation', label: 'Validation Center' },
    { id: 'notifications', label: 'การแจ้งเตือน' },
    { id: 'integrations', label: 'การเชื่อมต่อข้อมูล', perms: ['admin', 'audit'] },
  ],
}
export const NAV: Record<string, NavGroup[]> = {
  exec: [
    { group: 'ภาพรวม', items: [{ id: 'overview', label: 'ภาพรวมผู้บริหาร' }, { id: 'transport-monitor', label: 'ติดตามงานขนส่ง' }] },
    { group: 'การเงิน', items: [{ id: 'expense-approval', label: 'อนุมัติค่าใช้จ่าย', perms: ['approve', 'exec'] }, { id: 'payroll-approve', label: 'อนุมัติเงินเดือน', perms: ['approve', 'exec'] }, { id: 'reconciliation', label: 'กระทบยอดการเงิน', perms: ['exec', 'finance'] }, { id: 'reports', label: 'รายงานผู้บริหาร' }] },
    SHARED,
  ],
  transport: [
    { group: 'ภาพรวม', items: [{ id: 'dashboard', label: 'แดชบอร์ดขนส่ง' }] },
    { group: 'การเดินรถ', items: [
      { id: 'trips', label: 'จัดการเที่ยววิ่ง', perms: ['ops'] }, { id: 'trip-form', label: 'เพิ่ม/แก้ไขเที่ยววิ่ง', perms: ['ops'] },
      { id: 'routes', label: 'วางแผนเส้นทาง', perms: ['ops'] }, { id: 'dispatch', label: 'มอบหมายงาน (Dispatch)', perms: ['ops'] },
    ] },
    { group: 'ยานพาหนะ & คนขับ', items: [
      { id: 'vehicles', label: 'รถบริษัท', perms: ['ops'] }, { id: 'partners', label: 'รถร่วม', perms: ['ops'] }, { id: 'drivers', label: 'คนขับ', perms: ['ops'] },
      { id: 'vdocs', label: 'เอกสารยานพาหนะ', perms: ['ops'] }, { id: 'maintenance', label: 'ซ่อมบำรุง', perms: ['ops'] },
    ] },
    { group: 'น้ำมัน', items: [
      { id: 'fuel', label: 'คำขอน้ำมัน', perms: ['ops', 'cost'] }, { id: 'fuel-status', label: 'สถานะอนุมัติน้ำมัน', perms: ['ops', 'cost', 'approve'] },
      { id: 'fueltx', label: 'ประวัติธุรกรรมน้ำมัน', perms: ['ops', 'cost', 'finance'] }, { id: 'fuel-recon', label: 'กระทบยอดน้ำมัน', perms: ['cost', 'finance'] },
    ] },
    { group: 'ค่าใช้จ่าย & จ่ายเงิน', items: [
      { id: 'other-exp', label: 'ค่าใช้จ่ายอื่น ๆ', perms: ['ops', 'cost'] }, { id: 'expense-approval', label: 'อนุมัติค่าใช้จ่าย', perms: ['cost', 'approve'] },
      { id: 'daily-pay', label: 'สรุปการจ่ายรายวัน', perms: ['finance', 'approve'] }, { id: 'dup', label: 'ตรวจจับจ่ายซ้ำ', perms: ['finance', 'cost', 'approve'] },
      { id: 'batches', label: 'ชุดการจ่ายเงิน (Batch)', perms: ['finance', 'approve'] }, { id: 'bank-recon', label: 'กระทบยอดธนาคาร', perms: ['finance'] },
    ] },
    { group: 'รายได้ & กำไร', items: [
      { id: 'billing', label: 'วางบิล', perms: ['billing', 'finance'] }, { id: 'cus-recon', label: 'กระทบยอดลูกค้า', perms: ['billing', 'finance'] },
      { id: 'profit-trip', label: 'กำไรต่อเที่ยว', perms: ['cost', 'billing', 'approve'] }, { id: 'vehicle-profit', label: 'กำไรต่อคัน', perms: ['cost', 'billing', 'approve'] },
    ] },
    { group: 'ระบบ', items: [{ id: 'reports', label: 'รายงานขนส่ง' }, { id: 'settings', label: 'ตั้งค่าขนส่ง', perms: ['admin'] }] },
    SHARED,
  ],
  workforce: [
    { group: 'ภาพรวม', items: [{ id: 'dashboard', label: 'แดชบอร์ด Workforce' }] },
    { group: 'บุคลากร', items: [
      { id: 'employees', label: 'ทะเบียนพนักงาน', perms: ['hr', 'attend', 'payroll'] }, { id: 'emp-form', label: 'เพิ่ม/แก้ไขพนักงาน', perms: ['hr'] },
      { id: 'recruit', label: 'Recruitment Pipeline', perms: ['hr'] }, { id: 'onboarding', label: 'รับพนักงานใหม่', perms: ['hr'] },
      { id: 'edocs', label: 'เอกสารพนักงาน', perms: ['hr'] }, { id: 'contracts', label: 'สัญญาจ้าง', perms: ['hr'] },
    ] },
    { group: 'ลูกค้า & คลัง', items: [{ id: 'customers', label: 'ลูกค้า', perms: ['hr', 'billing'] }, { id: 'hubs', label: 'คลัง / ฮับ', perms: ['hr', 'attend', 'billing'] }] },
    { group: 'แผนกำลังคน', items: [
      { id: 'mpr', label: 'คำขอกำลังคน', perms: ['hr', 'attend', 'approve'] }, { id: 'mpl', label: 'แผนรายเดือน', perms: ['hr'] },
      { id: 'shifts', label: 'แผนกะรายวัน', perms: ['hr', 'attend'] }, { id: 'assign', label: 'มอบหมายกะพนักงาน', perms: ['hr', 'attend'] }, { id: 'avail', label: 'ความพร้อมพนักงาน', perms: ['hr', 'attend'] },
    ] },
    { group: 'เวลาทำงาน', items: [
      { id: 'attendance', label: 'เวลา IN / OUT', perms: ['attend'] }, { id: 'line', label: 'กล่องรูป LINE', perms: ['attend'] }, { id: 'qr', label: 'QR Code', perms: ['attend'] },
      { id: 'att-validation', label: 'ตรวจสอบเวลา', perms: ['attend'] }, { id: 'cust-att', label: 'นำเข้าข้อมูลลูกค้า', perms: ['attend'] },
      { id: 'att-recon', label: 'กระทบยอดเวลา', perms: ['attend'] }, { id: 'disputes', label: 'ข้อพิพาทเวลา', perms: ['attend'] }, { id: 'leave', label: 'ลา / ขาด / สาย', perms: ['attend', 'hr'] },
    ] },
    { group: 'ค่าแรง', items: [{ id: 'ot', label: 'คำนวณ OT', perms: ['attend', 'payroll'] }, { id: 'wage', label: 'อัตราค่าจ้าง', perms: ['payroll', 'hr'] }, { id: 'dwage', label: 'ค่าแรงรายวัน', perms: ['payroll'] }] },
    { group: 'เงินเดือน', items: [
      { id: 'payroll-prep', label: 'เตรียมเงินเดือน', perms: ['payroll'] }, { id: 'payroll-validate', label: 'ตรวจสอบเงินเดือน', perms: ['payroll'] },
      { id: 'payroll-approve', label: 'อนุมัติเงินเดือน', perms: ['payroll', 'approve'] }, { id: 'pay-recon', label: 'กระทบยอดจ่ายเงินเดือน', perms: ['payroll', 'finance'] },
    ] },
    { group: 'SLA & วางบิล', items: [
      { id: 'sla', label: 'SLA คลังสินค้า', perms: ['attend', 'billing', 'hr'] }, { id: 'penalty', label: 'ค่าปรับ', perms: ['billing', 'approve'] },
      { id: 'wbilling', label: 'วางบิลลูกค้า', perms: ['billing'] }, { id: 'wbill-recon', label: 'กระทบยอดบิล', perms: ['billing'] }, { id: 'wprofit', label: 'กำไร Workforce', perms: ['billing', 'approve'] },
    ] },
    { group: 'ระบบ', items: [{ id: 'reports', label: 'รายงาน Workforce' }, { id: 'settings', label: 'ตั้งค่า Workforce', perms: ['admin'] }] },
    SHARED,
  ],
}
export const canSee = (role: Role, item: NavItem) => !item.perms || role.perms.includes('*') || role.perms.includes('view') || item.perms.some((p) => role.perms.includes(p))
