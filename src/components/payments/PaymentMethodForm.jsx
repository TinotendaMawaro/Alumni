import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import PaymentMethodIcon from './PaymentMethodIcon';
import { PAYMENT_METHOD_TYPES } from '../../data/paymentMethods';

const EMPTY_CONFIG = {
  bank_account: { bankName: '', accountName: '', accountNumber: '', branch: '', swiftCode: '', currency: 'USD' },
  bank_transfer: { bankName: '', accountName: '', accountNumber: '', branch: '', swiftCode: '', referenceInstructions: '', currency: 'USD' },
  ecocash: { merchantName: '', merchantCode: '', shortcode: '', currency: 'USD' },
  card: { gateway: 'Stripe / Paystack', currency: 'USD', testMode: true, instructions: 'Card details are processed securely by the payment gateway and are not stored on this portal.' },
  paypal: { paypalEmail: '', currency: 'USD', instructions: 'Send payment to the PayPal email above and enter the transaction ID as your reference.' },
};

const PaymentMethodForm = ({ method, onClose, onSave }) => {
  const isEditing = !!method?.id;
  const [form, setForm] = useState({
    name: '',
    type: 'bank_account',
    description: '',
    config: EMPTY_CONFIG.bank_account,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (method) {
      setForm({
        name: method.name || '',
        type: method.type || 'bank_account',
        description: method.description || '',
        config: method.config || EMPTY_CONFIG.bank_account,
        isActive: method.isActive ?? true,
        sortOrder: method.sortOrder ?? 0,
      });
    }
  }, [method]);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      config: EMPTY_CONFIG[prev.type] || EMPTY_CONFIG.bank_account,
    }));
  }, [form.type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(method || {}),
      ...form,
    });
  };

  const updateConfig = (key, value) => {
    setForm(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  };

  const configFields = useMemo(() => {
    if (form.type === 'bank_account' || form.type === 'bank_transfer') {
      const fields = [
        { key: 'bankName', label: 'Bank Name', type: 'text' },
        { key: 'accountName', label: 'Account Name', type: 'text' },
        { key: 'accountNumber', label: 'Account Number', type: 'text' },
        { key: 'branch', label: 'Branch', type: 'text' },
        { key: 'swiftCode', label: 'SWIFT Code', type: 'text' },
        { key: 'currency', label: 'Currency', type: 'text' },
      ];
      if (form.type === 'bank_transfer') {
        fields.push({ key: 'referenceInstructions', label: 'Reference Instructions', type: 'text' });
      }
      return fields;
    }

    if (form.type === 'ecocash') {
      return [
        { key: 'merchantName', label: 'Merchant Name', type: 'text' },
        { key: 'merchantCode', label: 'Merchant Code', type: 'text' },
        { key: 'shortcode', label: 'Shortcode', type: 'text' },
        { key: 'currency', label: 'Currency', type: 'text' },
      ];
    }

    if (form.type === 'card') {
      return [
        { key: 'gateway', label: 'Gateway Name', type: 'text' },
        { key: 'currency', label: 'Currency', type: 'text' },
        { key: 'testMode', label: 'Test Mode', type: 'checkbox' },
        { key: 'instructions', label: 'Instructions', type: 'textarea' },
      ];
    }

    if (form.type === 'paypal') {
      return [
        { key: 'paypalEmail', label: 'PayPal Email', type: 'email' },
        { key: 'currency', label: 'Currency', type: 'text' },
        { key: 'instructions', label: 'Instructions', type: 'textarea' },
      ];
    }

    return [];
  }, [form.type]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-purple-900/80 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold font-mono text-white mb-4">
          {isEditing ? 'Edit Payment Method' : 'Add Payment Method'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Method Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Type *</label>
              <select
                required
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="input-field"
              >
                {PAYMENT_METHOD_TYPES.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field"
              rows={2}
            />
          </div>

          <div className="pt-1">
            <div className="flex items-center gap-2 mb-2">
              <PaymentMethodIcon type={form.type} className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Configuration</span>
            </div>

            <div className="space-y-2">
              {configFields.map(field => (
                <div key={field.key}>
                  <label className="block text-slate-300 font-bold mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={form.config[field.key] || ''}
                      onChange={e => updateConfig(field.key, e.target.value)}
                      className="input-field"
                      rows={2}
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={!!form.config[field.key]}
                        onChange={e => updateConfig(field.key, e.target.checked)}
                        className="rounded border-slate-700 text-yellow-400 focus:ring-yellow-400 bg-slate-900 w-4 h-4"
                      />
                      <span className="text-xs">Enabled</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      value={form.config[field.key] || ''}
                      onChange={e => updateConfig(field.key, e.target.value)}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-secondary">
              Save Payment Method
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
