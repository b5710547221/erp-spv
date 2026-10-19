import { useEffect, useState, type ReactNode } from 'react'
import { ArrowRight, CheckCircle2, Clock, Lock, ShieldAlert, ShieldCheck } from 'lucide-react'
import { COMPANIES, ROLES, USERS, type User } from '../lib/data'
import { APP_META } from '../lib/nav'
import { useApp } from '../lib/store'
import { Btn, Callout, Field, Logo, cx, inputCls } from '../components/ui'

let pendingUser: User | null = null

function Frame({ children, title, sub }: { children: ReactNode; title: string; sub?: string }) {
  return (
    <div className="grid min-h-full lg:grid-cols-[minmax(380px,5fr)_7fr]">
      <div className="relative hidden flex-col justify-between bg-black p-10 text-white lg:flex">
        <div className="mx-auto w-full max-w-[380px]"><Logo size="full" /></div>
        <div>
          <p className="max-w-sm text-[22px] font-light leading-snug text-zinc-200">แพลตฟอร์มเดียวสำหรับ<b className="font-semibold text-white">ขนส่ง</b>และ<b className="font-semibold text-white">กำลังคน</b> ของ 6 บริษัทในกลุ่ม P.T.NEX</p>
          <div className="mt-6 flex flex-wrap gap-2">{COMPANIES.map((c) => <span key={c.code} className="rounded border border-white/15 px-2.5 py-1 text-[12px] tracking-wide text-zinc-300">{c.code}</span>)}</div>
        </div>
        <div className="text-[12px] text-zinc-500">ต้นแบบเชิงโต้ตอบ · ข้อมูลทั้งหมดเป็นข้อมูลสาธิต</div>
      </div>
      <div className="flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-6 w-[120px] lg:hidden"><Logo /></div>
          <h1 className="text-[26px] font-semibold leading-tight">{title}</h1>
          {sub && <p className="mt-1.5 text-[14px] text-mute">{sub}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function Auth({ screen }: { screen: string }) {
  const { login, go, user, role, setCompany, company, logout } = useApp()
  const [email, setEmail] = useState(USERS[0].email)
  const [pw, setPw] = useState('ptnex2026')
  const [err, setErr] = useState<{ e?: string; p?: string; g?: string }>({})
  const [code, setCode] = useState('')
  const [cerr, setCerr] = useState('')
  const [sec, setSec] = useState(30)
  const [done, setDone] = useState(false)
  const [np, setNp] = useState('')
  const [np2, setNp2] = useState('')
  const [perr, setPerr] = useState<{ a?: string; b?: string }>({})
  useEffect(() => { if (screen === '2fa' && sec > 0) { const t = setTimeout(() => setSec(sec - 1), 1000); return () => clearTimeout(t) } }, [screen, sec])
  useEffect(() => { setDone(false); setCerr(''); setCode('') }, [screen])

  if (screen === 'login') {
    const submit = () => {
      const e: typeof err = {}
      if (!email.trim()) e.e = 'กรุณากรอกอีเมล'
      else if (!/^\S+@\S+\.\S+$/.test(email)) e.e = 'รูปแบบอีเมลไม่ถูกต้อง'
      if (!pw) e.p = 'กรุณากรอกรหัสผ่าน'
      const u = USERS.find((x) => x.email === email.trim())
      if (!e.e && !u) e.e = 'ไม่พบบัญชีนี้ในข้อมูลสาธิต — เลือกจากรายการด้านล่าง'
      if (!e.p && !e.e && pw !== 'ptnex2026') e.p = 'รหัสผ่านไม่ถูกต้อง (สาธิต: ptnex2026)'
      setErr(e)
      if (Object.keys(e).length) return
      pendingUser = u!
      go('/2fa')
    }
    return (
      <Frame title="เข้าสู่ระบบ" sub="P.T.NEX ERP — ใช้บัญชีสาธิตเพื่อทดลองสิทธิ์ตามบทบาท">
        <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-4" noValidate>
          <Field label="อีเมล" required error={err.e}><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls(!!err.e)} autoComplete="username" /></Field>
          <Field label="รหัสผ่าน" required error={err.p}><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls(!!err.p)} autoComplete="current-password" /></Field>
          <div className="flex justify-between text-[13px]"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#E6005C]" />จดจำอุปกรณ์นี้</label><button type="button" onClick={() => go('/forgot')} className="font-medium text-ruby hover:underline">ลืมรหัสผ่าน?</button></div>
          <Btn v="pri" type="submit" className="w-full">เข้าสู่ระบบ <ArrowRight size={16} /></Btn>
        </form>
        <div className="mt-7 border-t border-line pt-4">
          <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-mute">บัญชีสาธิตตามบทบาท (16 บทบาท)</div>
          <div className="scroll grid max-h-52 gap-1 overflow-y-auto">
            {USERS.map((u) => (
              <button key={u.id} onClick={() => { setEmail(u.email); setErr({}) }} className={cx('flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-[13px] ring-1 ring-inset transition', email === u.email ? 'bg-ruby-soft ring-ruby' : 'ring-line hover:bg-paper')}>
                <span>{ROLES.find((r) => r.id === u.role)!.th}</span><span className="text-[12px] text-mute">{u.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Frame>
    )
  }
  if (screen === '2fa') {
    const submit = () => {
      if (!/^\d{6}$/.test(code)) return setCerr('กรุณากรอกรหัส 6 หลัก')
      if (code !== '123456') return setCerr('รหัสไม่ถูกต้อง (สาธิต: 123456)')
      if (!pendingUser) return go('/login')
      login(pendingUser)
      go('/select-company')
    }
    return (
      <Frame title="ยืนยันตัวตนสองขั้นตอน" sub="กรอกรหัส 6 หลักจากแอป Authenticator หรือ SMS">
        <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-4" noValidate>
          <Field label="รหัสยืนยัน" required error={cerr} hint="รหัสสาธิต: 123456">
            <input value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCerr('') }} inputMode="numeric" autoFocus className={cx(inputCls(!!cerr), 'mono h-12 text-center text-2xl tracking-[0.5em]')} placeholder="••••••" />
          </Field>
          <Btn v="pri" type="submit" className="w-full">ยืนยัน</Btn>
          <div className="flex items-center justify-between text-[13px] text-mute">
            <button type="button" disabled={sec > 0} onClick={() => setSec(30)} className="font-medium text-ruby disabled:text-mute">{sec > 0 ? `ส่งรหัสอีกครั้งใน ${sec} วินาที` : 'ส่งรหัสอีกครั้ง'}</button>
            <button type="button" onClick={() => go('/login')} className="hover:underline">ย้อนกลับ</button>
          </div>
        </form>
      </Frame>
    )
  }
  if (screen === 'forgot') {
    return (
      <Frame title="ลืมรหัสผ่าน" sub="กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่">
        {done ? (
          <div className="space-y-4"><Callout tone="ok" title="ส่งลิงก์รีเซ็ตแล้ว (สาธิต)">ไม่มีการส่งอีเมลจริงในโหมดสาธิต</Callout><Btn v="pri" className="w-full" onClick={() => go('/reset')}>เปิดลิงก์รีเซ็ต (จำลอง)</Btn></div>
        ) : (
          <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) return setErr({ e: 'กรุณากรอกอีเมลที่ถูกต้อง' }); setDone(true) }}>
            <Field label="อีเมล" required error={err.e}><input value={email} onChange={(e) => { setEmail(e.target.value); setErr({}) }} className={inputCls(!!err.e)} /></Field>
            <Btn v="pri" type="submit" className="w-full">ส่งลิงก์รีเซ็ต</Btn>
            <button type="button" onClick={() => go('/login')} className="w-full text-center text-[13px] text-mute hover:underline">กลับไปเข้าสู่ระบบ</button>
          </form>
        )}
      </Frame>
    )
  }
  if (screen === 'reset') {
    return (
      <Frame title="ตั้งรหัสผ่านใหม่" sub="อย่างน้อย 8 ตัวอักษร และมีตัวเลขอย่างน้อย 1 ตัว">
        {done ? (
          <div className="space-y-4"><Callout tone="ok" title="เปลี่ยนรหัสผ่านสำเร็จ"></Callout><Btn v="pri" className="w-full" onClick={() => go('/login')}>เข้าสู่ระบบ</Btn></div>
        ) : (
          <form className="space-y-4" noValidate onSubmit={(e) => {
            e.preventDefault()
            const x: typeof perr = {}
            if (np.length < 8 || !/\d/.test(np)) x.a = 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวและมีตัวเลข'
            if (np2 !== np) x.b = 'รหัสผ่านไม่ตรงกัน'
            setPerr(x)
            if (!x.a && !x.b) setDone(true)
          }}>
            <Field label="รหัสผ่านใหม่" required error={perr.a}><input type="password" value={np} onChange={(e) => setNp(e.target.value)} className={inputCls(!!perr.a)} /></Field>
            <Field label="ยืนยันรหัสผ่านใหม่" required error={perr.b}><input type="password" value={np2} onChange={(e) => setNp2(e.target.value)} className={inputCls(!!perr.b)} /></Field>
            <Btn v="pri" type="submit" className="w-full">บันทึกรหัสผ่านใหม่</Btn>
          </form>
        )}
      </Frame>
    )
  }
  if (screen === 'select-company') {
    if (!user) return null
    const list = COMPANIES.filter((c) => role.companies.includes(c.code))
    const pick = (c: string) => { setCompany(c); go('/select-app') }
    return (
      <Frame title="เลือกบริษัท" sub={`${user.name} · ${role.th} — แสดงเฉพาะบริษัทที่คุณมีสิทธิ์เข้าถึง`}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {list.length > 1 && (
            <button onClick={() => pick('ALL')} className="col-span-full flex items-center justify-between rounded-xl border-2 border-ruby bg-ruby-soft p-4 text-left"><span><b className="block">ทุกบริษัทที่มีสิทธิ์</b><span className="text-[13px] text-mute">{list.map((c) => c.code).join(' · ')}</span></span><ArrowRight className="text-ruby" /></button>
          )}
          {list.map((c) => (
            <button key={c.code} onClick={() => pick(c.code)} className="rounded-xl border border-line p-4 text-left transition hover:border-ruby hover:shadow-md"><div className="text-lg font-semibold">{c.code}</div><div className="text-[13px] text-mute">{c.name}</div><div className="mt-2 text-[12px] font-medium text-ruby">{c.div} Division</div></button>
          ))}
        </div>
        <button onClick={() => logout()} className="mt-5 text-[13px] text-mute hover:underline">ออกจากระบบ</button>
      </Frame>
    )
  }
  if (screen === 'select-app') {
    if (!user) return null
    const co = COMPANIES.find((c) => c.code === company)
    const apps = role.apps.filter((a) => a === 'exec' || !co || co.div.toLowerCase() === a)
    return (
      <Frame title="เลือกแอปพลิเคชัน" sub={`${company === 'ALL' ? 'ทุกบริษัท' : company} · ${role.th}`}>
        <div className="space-y-2.5">
          {apps.length === 0 && <Callout tone="warn" title="ไม่มีแอปที่เข้าถึงได้สำหรับบริษัทนี้">กรุณาเลือกบริษัทอื่น</Callout>}
          {apps.map((a) => (
            <button key={a} onClick={() => go(a === 'exec' ? '/exec/overview' : `/${a}/dashboard`)} className="group flex w-full items-center justify-between rounded-xl border border-line p-4 text-left transition hover:border-ruby hover:shadow-md">
              <span><b className="block text-[16px]">{APP_META[a].name}</b><span className="text-[13px] text-mute">{APP_META[a].desc}</span></span>
              <ArrowRight className="text-mute transition group-hover:translate-x-1 group-hover:text-ruby" />
            </button>
          ))}
        </div>
        <button onClick={() => go('/select-company')} className="mt-5 text-[13px] text-mute hover:underline">← เลือกบริษัทใหม่</button>
      </Frame>
    )
  }
  if (screen === 'expired') {
    return (
      <Frame title="เซสชันหมดอายุ" sub="เพื่อความปลอดภัย ระบบออกจากระบบอัตโนมัติหลังไม่มีการใช้งาน 30 นาที">
        <div className="mb-5 grid size-14 place-items-center rounded-full bg-amber-50 text-amber-600"><Clock size={26} /></div>
        <Btn v="pri" className="w-full" onClick={() => go('/login')}>เข้าสู่ระบบอีกครั้ง</Btn>
      </Frame>
    )
  }
  return null
}

export function AccessDenied({ what }: { what?: string }) {
  const { go, role } = useApp()
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-red-50 text-bad"><ShieldAlert size={30} /></div>
      <h1 className="mt-4 text-[22px] font-semibold">ไม่มีสิทธิ์เข้าถึง</h1>
      <p className="mt-2 text-[14px] text-mute">บทบาท “{role.th}” ไม่มีสิทธิ์เข้าถึง{what ? ` “${what}”` : 'หน้านี้'} หากต้องการสิทธิ์เพิ่มเติม กรุณาติดต่อผู้ดูแลระบบ</p>
      <Btn className="mt-5" onClick={() => history.back()}>ย้อนกลับ</Btn>
      <button onClick={() => go('/select-company')} className="mt-3 text-[13px] text-ruby hover:underline">สลับบริษัท / แอป</button>
    </div>
  )
}
export { CheckCircle2, Lock, ShieldCheck }
