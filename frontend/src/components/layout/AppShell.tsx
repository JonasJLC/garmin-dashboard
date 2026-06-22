import { Bell, CircleUserRound, Dumbbell, HeartPulse, LayoutDashboard, Search, Settings, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/training', label: 'Training', icon: Dumbbell },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 border-l-4 px-md py-sm text-sm font-semibold text-on-surface-variant transition-colors',
    isActive
      ? 'border-primary-container bg-surface-container-high text-on-surface'
      : 'border-transparent hover:bg-surface-container',
  ].join(' ')
}

export function AppShell() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-outline bg-surface-container-lowest px-md md:px-margin-desktop">
        <div className="text-headline-md font-bold text-primary">APEX PERFORMANCE</div>
        <label className="hidden w-full max-w-md items-center gap-sm rounded-lg border border-outline bg-surface-container px-md py-sm text-on-surface-variant md:flex">
          <Search className="h-4 w-4" />
          <input
            className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            placeholder="Search activities"
          />
        </label>
        <div className="flex items-center gap-sm">
          <Bell className="h-5 w-5 text-on-surface-variant" />
          <Settings className="h-5 w-5 text-on-surface-variant" />
          <CircleUserRound className="h-7 w-7 text-primary" />
        </div>
      </header>

      <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-outline bg-surface-container-lowest py-md md:flex">
        <nav className="grid gap-xs">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass}>
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto grid gap-xs px-md text-sm text-on-surface-variant">
          <span>Support</span>
          <span>Log out</span>
        </div>
      </aside>

      <main className="min-h-dvh pb-20 pt-16 md:ml-64 md:pb-0">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-4 border-t border-outline bg-surface-container-lowest md:hidden">
        {navItems.slice(0, 4).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-xs text-label-caps text-on-surface-variant',
                isActive ? 'text-primary' : '',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
