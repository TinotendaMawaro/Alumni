import { useState } from 'react';
import { Plus, FileSpreadsheet, LogOut, UserCheck, GraduationCap, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import AlumniDirectory from './AlumniDirectory';

const AdminPortal = ({ adminUser, alumniList, onLogout, onAddAlumnus, onDeleteAlumnus, onEditAlumnus, onViewAlumnus, onExportCSV }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <section className="flex-1 bg-slate-950 text-slate-100 py-6 px-4 lg:px-8">
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold tracking-wider uppercase mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Authenticated Admin Session</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black font-mono text-white flex items-center gap-2">
              Welcome back, {adminUser.name}! 👋
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as: <span className="text-purple-300 font-mono">{adminUser.email}</span> &bull; Managing School of Hospitality & Tourism Database
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn btn-secondary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Alumni</span>
            </button>

            <button 
              onClick={onExportCSV}
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button 
              onClick={onLogout}
              className="btn btn-ghost"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <AlumniDirectory 
          alumniList={alumniList}
          onDelete={onDeleteAlumnus}
          onEdit={onEditAlumnus}
          onView={onViewAlumnus}
          onAdd={() => setShowAddForm(true)}
        />

      </div>

    </section>
  );
};

export default AdminPortal;
