import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedOutlet from './AnimatedOutlet'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/editor', label: 'New Entry', icon: '✏️' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
]

function Layout() {
  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--color-surface)] border-r border-pink-100 flex flex-col shadow-sm">
        <div className="p-5 border-b border-pink-100">
          <h1 className="font-['Pacifico'] text-2xl text-pink-300">DearMe ✨</h1>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-['Poppins'] text-sm transition-colors ${
                  isActive
                    ? 'bg-pink-100 text-pink-600 font-medium'
                    : 'text-[var(--color-text)] hover:bg-pink-50'
                }`
              }
            >
              {({ isActive }) => (
                <motion.span
                  className="flex items-center gap-3 w-full"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-pink-100">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-['Poppins'] text-sm text-[var(--color-text)] hover:bg-red-50 hover:text-red-400 transition-colors cursor-pointer"
          >
            <span className="text-lg">👋</span>
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatedOutlet />
      </main>
    </div>
  )
}

export default Layout
