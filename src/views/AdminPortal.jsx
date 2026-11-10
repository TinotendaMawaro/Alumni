import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, FileSpreadsheet, RefreshCw, Wifi, WifiOff, Database,
  Users, BadgeCheck, Wallet, Clock, Search, GraduationCap,
} from 'lucide-react';
import AlumniDirectory from './AlumniDirectory';
import PaymentAdminView from './PaymentAdminView';
import AdminSidebar from '../components/admin/AdminSidebar';
import PieChart from '../components/admin/PieChart';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useScreenshotGuard } from '../hooks/useScreenshotGuard';
import { fetchPayments } from '../services/payments';

const STATUS_COLORS = { paid: '#34d399', pending: '#facc15', failed: '#fb7185', cancelled: '#94a3b8' };
const SECTION_TITLES = {
  overview: ['Overview', 'Live snapshot of alumni and membership payments.'],
  alumni: ['Alumni Directory', 'Search, edit and manage every registered alumnus.'],
  paid: ['Paid Members', 'Alumni who have completed a membership payment.'],
  payments: ['Payments', 'Payment methods and full transaction records.'],
};

const money = (n, currency = 'USD') => `${currency} ${Number(n || 0).toFixed(2)}`;

const StatCard = ({ icon: Icon, label, value, hint, tone }) => (
  <div className="glass p-5 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition ${tone.glow}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-3xl font-black text-white mt-2 leading-none">{value}</p>
        {hint && <p className="text-[11px] text-slate-400 mt-2">{hint}</p>}
      </div>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone.chip}`}>
        <Icon className="w-5 h-5" />
      </span>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children, className = '' }) => (
  <div className={`glass p-5 ${className}`}>
    <div className="mb-4">
      <h3 className="text-sm font-black text-white">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const MonthlyBars = ({ rows }) => {
  const max = Math.max(...rows.map(r => r.total), 0);
  if (max === 0) return <div className="h-40 flex items-center justify-center text-xs text-slate-500">No paid revenue yet</div>;
  return (
    <div className="flex items-end gap-3 h-44">
      {rows.map(r => (
        <div key={r.key} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full" title={`${r.label}: ${r.total.toFixed(2)}`}>
          <span className="text-[10px] font-mono text-slate-300">{r.total > 0 ? r.total.toFixed(0) : ''}</span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-yellow-300 transition-all"
            style={{ height: `${Math.max((r.total / max) * 100, r.total > 0 ? 4 : 1)}%`, opacity: r.total > 0 ? 1 : 0.2 }}
          />
          <span className="text-[10px] text-slate-400">{r.label}</span>
        </div>
      ))}
    </div>
  );
};

const AdminPortal = ({ adminUser, alumniList, onLogout, onDeleteAlumnus, onEditAlumnus, onViewAlumnus, onExportCSV, onAddAlumnus, addToast }) => {
  const { connected, mode, lastChecked, check: checkConnection } = useConnectionStatus();

  // Deter screen capture of confidential alumni & payment records.
  useScreenshotGuard(true, addToast);

  const [section, setSection] = useState('overview');
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paidSearch, setPaidSearch] = useState('');

  const loadPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      setPayments(await fetchPayments());
    } catch (error) {
      console.warn(error);
      addToast?.('Failed to load payments.', 'error');
    } finally {
      setLoadingPayments(false);
    }
  }, [addToast]);

  // Reload whenever the admin switches section so edits made in Payments are reflected.
  useEffect(() => { loadPayments(); }, [section]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = () => {
    if (onAddAlumnus) onAddAlumnus();
    else onEditAlumnus({});
  };

  // ---- Derived, real-data analytics ----
  const paidPayments = useMemo(() => payments.filter(p => p.status === 'paid'), [payments]);

  const paidMembers = useMemo(() => {
    const map = new Map();
    paidPayments.forEach(p => {
      const key = p.alumniId || (p.alumniEmail || '').toLowerCase() || p.id;
      const prev = map.get(key);
      const when = new Date(p.updatedAt || p.createdAt || 0).getTime();
      if (!prev) {
        map.set(key, { key, name: p.alumniName, email: p.alumniEmail, whatsapp: p.alumniWhatsapp, currency: p.currency, total: Number(p.amount) || 0, count: 1, lastPaid: when, method: p.methodName, reference: p.reference || p.transactionId });
      } else {
        prev.total += Number(p.amount) || 0;
        prev.count += 1;
        if (when > prev.lastPaid) { prev.lastPaid = when; prev.method = p.methodName; prev.reference = p.reference || p.transactionId; }
      }
    });
    return [...map.values()].sort((a, b) => b.lastPaid - a.lastPaid);
  }, [paidPayments]);

  const statusData = useMemo(() => {
    const counts = {};
    payments.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value,
      color: STATUS_COLORS[status],
    }));
  }, [payments]);

  const programData = useMemo(() => {
    const counts = {};
    alumniList.forEach(a => {
      const name = (a.program || 'Unspecified').replace('Diploma in ', '').replace('Bachelor Degree in ', '');
      counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5).map(([label, value]) => ({ label, value }));
    const rest = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
    if (rest > 0) top.push({ label: 'Other', value: rest });
    return top;
  }, [alumniList]);

  const paidVsUnpaid = useMemo(() => {
    const paidEmails = new Set(paidMembers.map(m => (m.email || '').toLowerCase()));
    const paidCount = alumniList.filter(a => paidEmails.has((a.email || '').toLowerCase())).length;
    return [
      { label: 'Paid members', value: paidCount, color: '#34d399' },
      { label: 'Not yet paid', value: Math.max(alumniList.length - paidCount, 0), color: '#a855f7' },
    ];
  }, [alumniList, paidMembers]);

  const monthlyRevenue = useMemo(() => {
    const rows = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      rows.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString(undefined, { month: 'short' }), total: 0 });
    }
    paidPayments.forEach(p => {
      const d = new Date(p.createdAt || p.updatedAt);
      const row = rows.find(r => r.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (row) row.total += Number(p.amount) || 0;
    });
    return rows;
  }, [paidPayments]);

  const totalRevenue = paidPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const currency = paidPayments[0]?.currency || 'USD';

  const filteredPaid = paidMembers.filter(m => {
    const q = paidSearch.toLowerCase();
    return !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  const statusIcon = mode === 'demo'
    ? <Database className="w-4 h-4 text-yellow-400" />
    : connected ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />;
  const statusText = mode === 'demo' ? 'Database not configured' : connected ? 'Database connected' : 'Database disconnected';
  const statusColor = mode === 'demo' ? 'text-yellow-400' : connected ? 'text-emerald-400' : 'text-rose-400';

  const [title, subtitle] = SECTION_TITLES[section];

  return (
    <section className="flex-1 text-slate-100 py-6 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        <AdminSidebar
          active={section}
          onChange={setSection}
          onLogout={onLogout}
          counts={{ alumni: alumniList.length, paid: paidMembers.length, payments: payments.length }}
        />

        <div className="flex-1 min-w-0 space-y-6">

          {/* Header */}
          <div className="glass-strong p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-yellow-400 text-[11px] font-bold tracking-widest uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Welcome back, {adminUser.name}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button onClick={handleAdd} className="btn btn-secondary">
                <Plus className="w-4 h-4" /><span>Add Alumni</span>
              </button>
              <button onClick={onExportCSV} className="btn bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
                <FileSpreadsheet className="w-4 h-4" /><span>Export CSV</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 rounded-xl border border-white/10">
                {statusIcon}
                <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
                {lastChecked && <span className="text-[10px] text-slate-500">{new Date(lastChecked).toLocaleTimeString()}</span>}
                <button onClick={checkConnection} className="p-1 text-slate-400 hover:text-white transition" title="Check connection">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {section === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Alumni" value={alumniList.length} hint="Registered in the database" tone={{ glow: 'bg-purple-500', chip: 'bg-purple-500/20 text-purple-200' }} />
                <StatCard icon={BadgeCheck} label="Paid Members" value={paidMembers.length} hint={alumniList.length ? `${Math.round((paidMembers.length / alumniList.length) * 100)}% of alumni` : '—'} tone={{ glow: 'bg-emerald-500', chip: 'bg-emerald-500/20 text-emerald-200' }} />
                <StatCard icon={Wallet} label="Revenue Collected" value={money(totalRevenue, currency)} hint={`${paidPayments.length} successful payment${paidPayments.length === 1 ? '' : 's'}`} tone={{ glow: 'bg-yellow-400', chip: 'bg-yellow-400/20 text-yellow-200' }} />
                <StatCard icon={Clock} label="Pending Payments" value={pendingCount} hint="Awaiting confirmation" tone={{ glow: 'bg-sky-500', chip: 'bg-sky-500/20 text-sky-200' }} />
              </div>

              {loadingPayments && payments.length === 0 && (
                <p className="text-xs text-slate-400">Loading live payment data…</p>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Panel title="Payment Status" subtitle="All payment records by status">
                  <PieChart data={statusData} centerLabel="Payments" emptyText="No payments recorded yet" />
                </Panel>
                <Panel title="Membership Payment Coverage" subtitle="Alumni who have paid vs not yet paid">
                  <PieChart data={paidVsUnpaid} centerLabel="Alumni" centerValue={alumniList.length} emptyText="No alumni registered yet" />
                </Panel>
                <Panel title="Alumni by Programme" subtitle="Top programmes in the directory">
                  <PieChart data={programData} centerLabel="Alumni" emptyText="No alumni registered yet" />
                </Panel>
                <Panel title="Revenue — Last 6 Months" subtitle={`Paid amounts in ${currency}`}>
                  <MonthlyBars rows={monthlyRevenue} />
                </Panel>
              </div>

              <Panel title="Recent Paid Members" subtitle="Latest successful payments">
                <PaidTable rows={paidMembers.slice(0, 5)} compact />
              </Panel>
            </>
          )}

          {section === 'alumni' && (
            <AlumniDirectory
              alumniList={alumniList}
              onDelete={onDeleteAlumnus}
              onEdit={onEditAlumnus}
              onView={onViewAlumnus}
              onAdd={handleAdd}
            />
          )}

          {section === 'paid' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={BadgeCheck} label="Paid Members" value={paidMembers.length} tone={{ glow: 'bg-emerald-500', chip: 'bg-emerald-500/20 text-emerald-200' }} />
                <StatCard icon={Wallet} label="Total Collected" value={money(totalRevenue, currency)} tone={{ glow: 'bg-yellow-400', chip: 'bg-yellow-400/20 text-yellow-200' }} />
                <StatCard icon={GraduationCap} label="Coverage" value={alumniList.length ? `${Math.round((paidMembers.length / alumniList.length) * 100)}%` : '—'} hint="Of registered alumni" tone={{ glow: 'bg-purple-500', chip: 'bg-purple-500/20 text-purple-200' }} />
              </div>
              <div className="glass p-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input value={paidSearch} onChange={e => setPaidSearch(e.target.value)} placeholder="Search paid members…" className="input-field pl-9" />
                </div>
              </div>
              <div className="glass overflow-hidden">
                {loadingPayments && payments.length === 0
                  ? <div className="p-12 text-center text-xs text-slate-400">Loading…</div>
                  : <PaidTable rows={filteredPaid} />}
              </div>
            </div>
          )}

          {section === 'payments' && <PaymentAdminView addToast={addToast} embedded />}
        </div>
      </div>
    </section>
  );
};

const PaidTable = ({ rows, compact = false }) => {
  if (rows.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-500">No paid members yet.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Amount Paid</th>
            <th className="px-4 py-3">Method</th>
            {!compact && <th className="px-4 py-3">Reference</th>}
            {!compact && <th className="px-4 py-3">Payments</th>}
            <th className="px-4 py-3">Last Paid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map(m => (
            <tr key={m.key} className="hover:bg-white/5 transition">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-yellow-400 text-purple-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                    {(m.name || '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-slate-100 font-semibold truncate">{m.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{m.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 font-mono font-bold text-emerald-300">{money(m.total, m.currency)}</td>
              <td className="px-4 py-3.5">{m.method || '—'}</td>
              {!compact && <td className="px-4 py-3.5 text-[11px] text-slate-400">{m.reference || '—'}</td>}
              {!compact && <td className="px-4 py-3.5">{m.count}</td>}
              <td className="px-4 py-3.5 text-[11px] text-slate-400">{m.lastPaid ? new Date(m.lastPaid).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPortal;
