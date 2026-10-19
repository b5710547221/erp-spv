import { useEffect } from 'react'
import { Provider, useApp } from './lib/store'
import { NAV, canSee } from './lib/nav'
import Shell from './components/Shell'
import Auth, { AccessDenied } from './pages/auth'
import ExecPage from './pages/exec'
import TransportPage from './pages/transport'
import WorkforcePage from './pages/workforce'
import { Profile } from './pages/common'

const PUBLIC = ['login', '2fa', 'forgot', 'reset', 'expired']

function Router() {
  const { path, user, role, go } = useApp()
  const [a, b] = path.split('/').filter(Boolean)
  const needsAuth = !PUBLIC.includes(a)
  useEffect(() => { if (needsAuth && !user) go('/login') }, [needsAuth, user, go])
  if (!a) return <Auth screen="login" />
  if (needsAuth && !user) return null
  if (['login', '2fa', 'forgot', 'reset', 'expired', 'select-company', 'select-app'].includes(a)) return <Auth screen={a} />
  if (a === 'profile') return <Shell app={role.apps[0]} page="profile"><Profile /></Shell>
  if (a === 'denied') return <Shell app={role.apps[0]} page="x"><AccessDenied /></Shell>
  if (a === 'exec' || a === 'transport' || a === 'workforce') {
    const page = b ?? (a === 'exec' ? 'overview' : 'dashboard')
    if (!role.apps.includes(a)) return <Shell app={role.apps[0]} page="x"><AccessDenied what={a} /></Shell>
    const item = NAV[a].flatMap((g) => g.items).find((i) => i.id === page)
    const ok = !item || canSee(role, item)
    return (
      <Shell app={a} page={page}>
        {!ok ? <AccessDenied what={item!.label} /> : a === 'exec' ? <ExecPage page={page} /> : a === 'transport' ? <TransportPage page={page} /> : <WorkforcePage page={page} />}
      </Shell>
    )
  }
  return <Auth screen="login" />
}

export default function App() {
  return (
    <Provider>
      <Router />
    </Provider>
  )
}
