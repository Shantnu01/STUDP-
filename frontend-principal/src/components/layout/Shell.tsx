import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UserRound, BookOpen, CalendarCheck, Settings, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
  { icon: Users,           label: 'Students',    path: '/students' },
  { icon: UserRound,       label: 'Staff',       path: '/staff' },
  { icon: BookOpen,        label: 'Classes',     path: '/classes' },
  { icon: CalendarCheck,   label: 'Attendance',  path: '/attendance' },
  { icon: Settings,        label: 'Settings',    path: '/settings' },
];

export default function Shell() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="p-6 flex items-center gap-2 border-bottom">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
             <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">EduSync</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600 text-xs">
              {profile?.displayName?.[0] || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.displayName || 'Principal'}</p>
              <p className="text-[10px] text-gray-500 truncate">{profile?.role || 'Admin'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white/80 backdrop-blur-md px-8 flex items-center justify-between z-10">
          <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            School Management System
          </h1>
          <div className="flex items-center gap-4">
             <span className="text-xs font-medium px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Active School ID: {profile?.schoolId?.slice(0, 8)}...
             </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
