import { Menu, X, FileText, ShieldCheck, LogOut } from 'lucide-react';

const Header = ({ activeView, onSwitchView, alumniCount, adminUser, onLogout, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <header className="sticky top-0 z-40 bg-purple-950/95 backdrop-blur-md border-b border-purple-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div 
          onClick={() => onSwitchView('public')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-xl p-1 shadow-md flex items-center justify-center border border-purple-300 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 100" className="w-full h-full text-purple-800">
              <path d="M50 5 L90 20 L90 55 C90 75 50 95 50 95 C50 95 10 75 10 55 L10 20 Z" fill="#6B21A8" stroke="#FACC15" strokeWidth="3"/>
              <path d="M50 15 L50 85 M20 45 L80 45" stroke="#FACC15" strokeWidth="4"/>
              <circle cx="50" cy="45" r="12" fill="#EAB308"/>
              <path d="M50 38 L53 43 L58 44 L54 48 L55 53 L50 50 L45 53 L46 48 L42 44 L47 43 Z" fill="#3B0764"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black uppercase tracking-wider text-white leading-tight">
              School of Hospitality
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-yellow-400 tracking-widest uppercase">
              & Tourism Alumni
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-purple-900/60 p-1.5 rounded-2xl border border-purple-800">
          <button
            onClick={() => onSwitchView('public')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'public'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Public Form</span>
          </button>

          <button
            onClick={() => onSwitchView('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'admin'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
            <span className="bg-purple-950/80 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-400/30 font-extrabold">
              {alumniCount}
            </span>
          </button>

          {adminUser && activeView === 'admin' && (
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="Logout of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-purple-200 hover:text-white bg-purple-900/60 border border-purple-800 rounded-xl"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-purple-800/80 flex flex-col gap-2">
          <button
            onClick={() => { onSwitchView('public'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between ${
              activeView === 'public' ? 'bg-yellow-400 text-purple-950' : 'bg-purple-900/50 text-white'
            }`}
          >
            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Public Registration Form</span>
            <span className="text-[10px] opacity-75">&rarr;</span>
          </button>

          <button
            onClick={() => { onSwitchView('admin'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between ${
              activeView === 'admin' ? 'bg-yellow-400 text-purple-950' : 'bg-purple-900/50 text-white'
            }`}
          >
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Admin Portal</span>
            <span className="bg-purple-950 text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {alumniCount}
            </span>
          </button>

          {adminUser && (
            <button
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 px-4 bg-rose-600/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout ({adminUser.name})</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
