import { NavLink } from 'react-router-dom';
import { Home, NotebookText, Target, BarChart3, User } from 'lucide-react';

const ITEMS = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/timeline', icon: NotebookText, label: 'Timeline' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/insight', icon: BarChart3, label: 'Insight' },
  { to: '/profile', icon: User, label: 'Profil' }
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-line">
      <div className="max-w-md mx-auto flex justify-around py-2.5">
        {ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-[10px] ${
                isActive ? 'text-sage-dark' : 'text-ink-soft/70'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}