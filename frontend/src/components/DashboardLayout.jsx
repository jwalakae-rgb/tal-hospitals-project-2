import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = {
  patient: [
    { to: '/app/dashboard', label: 'Overview', icon: 'grid' },
    { to: '/app/doctors', label: 'Find a Doctor', icon: 'search' },
    { to: '/app/appointments', label: 'My Appointments', icon: 'calendar' },
    { to: '/app/prescriptions', label: 'Prescriptions', icon: 'file' },
    { to: '/app/profile', label: 'My Profile', icon: 'user' },
  ],
  doctor: [
    { to: '/app/dashboard', label: 'Overview', icon: 'grid' },
    { to: '/app/appointments', label: 'Appointment Requests', icon: 'calendar' },
    { to: '/app/availability', label: 'My Availability', icon: 'clock' },
    { to: '/app/profile', label: 'My Profile', icon: 'user' },
  ],
  admin: [
    { to: '/app/dashboard', label: 'Analytics', icon: 'grid' },
    { to: '/app/doctors', label: 'Doctors', icon: 'stethoscope' },
    { to: '/app/departments', label: 'Departments', icon: 'building' },
    { to: '/app/patients-admin', label: 'Patients', icon: 'users' },
    { to: '/app/appointments', label: 'Appointments', icon: 'calendar' },
  ],
};

const ICONS = {
  grid: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zm0 9h7v7h-7v-7zm-9 0h7v7H4v-7z',
  search: 'M11 4a7 7 0 104.9 12.1L20 20.2l1.4-1.4-4.1-4.1A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z',
  calendar: 'M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z',
  file: 'M14 3v5h5M6 3h8l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0',
  clock: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
  stethoscope: 'M6 3v6a4 4 0 008 0V3M10 15a6 6 0 006-6M18 21a3 3 0 100-6 3 3 0 000 6z',
  building: 'M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01',
  users: 'M17 21v-2a4 4 0 00-3-3.87M7 21v-2a4 4 0 013-3.87m6-6a4 4 0 11-8 0 4 4 0 018 0z',
};

function Icon({ name, className = 'w-4.5 h-4.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={ICONS[name] || ICONS.grid} />
    </svg>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 shrink-0 bg-ink-950 text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-vital-500 flex items-center justify-center font-display font-bold text-sm">T</div>
            <div>
              <p className="font-display font-semibold leading-none">TALHospitals</p>
              <p className="text-[11px] text-ink-300 mt-1 capitalize">{user?.role} portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive ? 'bg-clinical-700 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-ink-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4.5 h-4.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
