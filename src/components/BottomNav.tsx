import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BarChart3, Bell, User } from 'lucide-react';

const TABS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/log', label: 'Log', icon: PlusCircle },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 z-50">
      <div className="max-w-md mx-auto flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
