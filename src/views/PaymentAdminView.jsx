import { useState } from 'react';
import { Plus, Wallet, FileText, Trash2 } from 'lucide-react';
import PaymentMethodCard from '../components/payments/PaymentMethodCard';
import PaymentMethodForm from '../components/payments/PaymentMethodForm';
import ConfirmDialog from '../components/ConfirmDialog';
import PaymentStatusBadge from '../components/payments/PaymentStatusBadge';
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  fetchPayments,
  updatePaymentStatus,
  deletePayment,
} from '../services/payments';

const PaymentAdminView = ({ addToast }) => {
  const [methods, setMethods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [editingMethod, setEditingMethod] = useState(null);
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [deleteMethodId, setDeleteMethodId] = useState(null);
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  const [activeTab, setActiveTab] = useState('methods');

  const loadMethods = async () => {
    setLoadingMethods(true);
    try {
      const data = await fetchPaymentMethods({ includeInactive: true });
      setMethods(data);
    } catch (error) {
      console.warn(error);
      addToast('Failed to load payment methods.', 'error');
    } finally {
      setLoadingMethods(false);
    }
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await fetchPayments();
      setPayments(data);
    } catch (error) {
      console.warn(error);
      addToast('Failed to load payments.', 'error');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSaveMethod = async (method) => {
    try {
      if (method.id && !method.id.startsWith('default-') && !method.id.startsWith('local-')) {
        await updatePaymentMethod(method.id, method);
        addToast('Payment method updated.', 'success');
      } else {
        await createPaymentMethod(method);
        addToast('Payment method created.', 'success');
      }
      setShowMethodForm(false);
      setEditingMethod(null);
      await loadMethods();
    } catch (error) {
      console.error(error);
      addToast('Failed to save payment method.', 'error');
    }
  };

  const handleDeleteMethod = async () => {
    if (!deleteMethodId) return;
    try {
      await deletePaymentMethod(deleteMethodId);
      addToast('Payment method deleted.', 'info');
      setDeleteMethodId(null);
      await loadMethods();
    } catch (error) {
      console.error(error);
      addToast('Failed to delete payment method.', 'error');
    }
  };

  const handleToggleActive = async (method) => {
    try {
      await updatePaymentMethod(method.id, { isActive: !method.isActive });
      addToast(`Payment method ${method.isActive ? 'disabled' : 'enabled'}.`, 'success');
      await loadMethods();
    } catch (error) {
      console.error(error);
      addToast('Failed to update payment method.', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePaymentStatus(id, status);
      addToast('Payment status updated.', 'success');
      await loadPayments();
    } catch (error) {
      console.error(error);
      addToast('Failed to update payment status.', 'error');
    }
  };

  const handleDeletePayment = async () => {
    if (!deletePaymentId) return;
    try {
      await deletePayment(deletePaymentId);
      addToast('Payment record deleted.', 'info');
      setDeletePaymentId(null);
      await loadPayments();
    } catch (error) {
      console.error(error);
      addToast('Failed to delete payment record.', 'error');
    }
  };

  return (
    <section className="flex-1 bg-slate-950 text-slate-100 py-6 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div>
            <h2 className="text-xl md:text-3xl font-black font-mono text-white">Payment Management</h2>
            <p className="text-xs text-slate-400 mt-1">Manage payment methods and review payment records.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              onClick={() => { setEditingMethod(null); setShowMethodForm(true); }}
              className="btn btn-secondary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Method</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'methods' ? 'bg-yellow-400 text-purple-950' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            <span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Payment Methods</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'payments' ? 'bg-yellow-400 text-purple-950' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Payment Records</span>
          </button>
        </div>

        {activeTab === 'methods' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingMethods ? (
              <div className="col-span-full text-center text-xs text-slate-400">Loading payment methods...</div>
            ) : (
              methods.map(method => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onEdit={m => { setEditingMethod(m); setShowMethodForm(true); }}
                  onDelete={m => setDeleteMethodId(m.id)}
                  onToggleActive={handleToggleActive}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Payer</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {payments.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {new Date(item.createdAt || item.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-200 font-medium">{item.alumniName}</div>
                        <div className="text-[11px] text-slate-400">{item.alumniEmail}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-300">{item.methodName}</span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-yellow-400">
                        {item.currency} {Number(item.amount).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {item.reference || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={item.status}
                            onChange={e => handleStatusChange(item.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => setDeletePaymentId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-500">No payment records yet.</div>
            )}
          </div>
        )}
      </div>

      {showMethodForm && (
        <PaymentMethodForm
          method={editingMethod}
          onClose={() => { setShowMethodForm(false); setEditingMethod(null); }}
          onSave={handleSaveMethod}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteMethodId}
        onClose={() => setDeleteMethodId(null)}
        onConfirm={handleDeleteMethod}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDialog
        isOpen={!!deletePaymentId}
        onClose={() => setDeletePaymentId(null)}
        onConfirm={handleDeletePayment}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? This action cannot be undone."
        confirmText="Delete"
      />
    </section>
  );
};

export default PaymentAdminView;
