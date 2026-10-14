import { useState } from 'react';
import { Plus, FileSpreadsheet, LogOut, RefreshCw, Wifi, WifiOff, Database } from 'lucide-react';
import AlumniDirectory from './AlumniDirectory';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const AdminPortal = ({ adminUser, alumniList, onLogout, onDeleteAlumnus, onEditAlumnus, onViewAlumnus, onExportCSV, onAddAlumnus }) => {
  const { connected, mode, lastChecked, check: checkConnection } = useConnectionStatus();

  const handleAdd = () => {
    if (onAddAlumnus) {
      onAddAlumnus();
    } else {
      onEditAlumnus({});
    }
  };

  const getStatusIcon = () => {
    if (mode === 'demo') return <Database className="w-4 h-4 text-yellow-400" />;
    return connected ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />;
  };

  const getStatusText = () => {
    if (mode === 'demo') return 'Database not configured';
    return connected ? 'Database connected' : 'Database disconnected';
  };

  const getStatusColor = () => {
    if (mode === 'demo') return 'text-yellow-400';
    return connected ? 'text-emerald-400' : 'text-rose-400';
  };

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
              Logged in as: <span className="text-purple-300 font-mono">{adminUser.email}</span> &bull; Managing School of Hospitality &amp; Tourism Database
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              onClick={handleAdd}
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

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              {getStatusIcon()}
              <span className={`text-xs font-medium ${getStatusColor()}`}>{getStatusText()}</span>
              {lastChecked && (
                <span className="text-[10px] text-slate-500">
                  {new Date(lastChecked).toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={checkConnection}
                className="p-1 text-slate-400 hover:text-white transition"
                title="Check connection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

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
          onAdd={handleAdd}
        />

      </div>

    </section>
  );
};

export default AdminPortal;
