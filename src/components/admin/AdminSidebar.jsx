import { LayoutDashboard, Users, BadgeCheck, CreditCard, LogOut } from 'lucide-react';

export const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'alumni', label: 'Alumni', icon: Users },
  { id: 'paid', label: 'Paid Members', icon: BadgeCheck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

const AdminSidebar = ({ active, onChange, onLogout, counts = {} }) => (
  <>
    {/* Desktop: vertical rail */}
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 glass-strong p-3 self-start sticky top-20">
      <p className="px-3 pt-2 pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Menu</p>
      <nav className="space-y-1">
        {ADMIN_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              active === id
                ? 'bg-gradient-to-r from-yellow-400 to-amber-300 text-purple-950 shadow-lg shadow-yellow-400/20'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {counts[id] !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active === id ? 'bg-purple-950/15' : 'bg-white/10 text-slate-300'}`}>
                {counts[id]}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-4 pt-3 border-t border-white/10">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/10 transition">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    {/* Mobile: labeled tab bar */}
    <nav className="lg:hidden flex gap-1.5 overflow-x-auto glass-strong p-1.5">
      {ADMIN_SECTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 min-w-[5.5rem] flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[11px] font-bold transition ${
            active === id ? 'bg-yellow-400 text-purple-950' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  </>
);

export default AdminSidebar;
