import { useState, useMemo } from 'react';
import { Wallet, CreditCard, Building2, Repeat, Send } from 'lucide-react';
import PaymentMethodIcon from './PaymentMethodIcon';
import { PAYMENT_STATUS_LABELS } from '../../data/paymentMethods';

const PaymentForm = ({ methods, onSubmit }) => {
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [alumniName, setAlumniName] = useState('');
  const [alumniEmail, setAlumniEmail] = useState('');
  const [alumniWhatsapp, setAlumniWhatsapp] = useState('');
  const [reference, setReference] = useState('');
  const [methodDetails, setMethodDetails] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const selectedMethod = useMemo(
    () => methods.find(m => m.id === selectedMethodId) || null,
    [methods, selectedMethodId]
  );

  const updateDetails = (key, value) => {
    setMethodDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMethod || !amount || Number(amount) <= 0) return;

    setSubmitting(true);
    const payload = {
      methodId: selectedMethod.id,
      methodName: selectedMethod.name,
      methodType: selectedMethod.type,
      amount: Number(amount),
      currency,
      alumniName: alumniName.trim() || 'Guest',
      alumniEmail: alumniEmail.trim(),
      alumniWhatsapp: alumniWhatsapp.trim() || null,
      reference: reference.trim() || null,
      metadata: { methodDetails },
      status: 'pending',
    };

    await onSubmit(payload);
    setSelectedMethodId('');
    setAmount('');
    setCurrency('USD');
    setAlumniName('');
    setAlumniEmail('');
    setAlumniWhatsapp('');
    setReference('');
    setMethodDetails({});
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={alumniName}
            onChange={e => setAlumniName(e.target.value)}
            placeholder="e.g. Farai Mutsvene"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Email *</label>
          <input
            type="email"
            required
            value={alumniEmail}
            onChange={e => setAlumniEmail(e.target.value)}
            placeholder="farai@example.com"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">WhatsApp Phone</label>
          <input
            type="tel"
            value={alumniWhatsapp}
            onChange={e => setAlumniWhatsapp(e.target.value)}
            placeholder="+263 77 123 4567"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Amount *</label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="absolute right-2 top-2 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1"
            >
              <option value="USD">USD</option>
              <option value="ZWL">ZWL</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Payment Method *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {methods.map(method => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethodId(method.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                selectedMethodId === method.id
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <PaymentMethodIcon type={method.type} className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-xs font-bold text-white">{method.name}</p>
                <p className="text-[11px] text-slate-400">{PAYMENT_STATUS_LABELS[method.type] || method.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMethod && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Method Details</p>
          {(selectedMethod.type === 'bank_account' || selectedMethod.type === 'bank_transfer') && (
            <div className="space-y-1 text-xs text-slate-300">
              <p><span className="text-slate-500">Bank:</span> {selectedMethod.config.bankName}</p>
              <p><span className="text-slate-500">Account:</span> {selectedMethod.config.accountName}</p>
              <p><span className="text-slate-500">Number:</span> {selectedMethod.config.accountNumber}</p>
              <p><span className="text-slate-500">Branch:</span> {selectedMethod.config.branch}</p>
              {selectedMethod.config.swiftCode && (
                <p><span className="text-slate-500">SWIFT:</span> {selectedMethod.config.swiftCode}</p>
              )}
              {selectedMethod.config.referenceInstructions && (
                <p className="text-yellow-300">{selectedMethod.config.referenceInstructions}</p>
              )}
            </div>
          )}

          {selectedMethod.type === 'ecocash' && (
            <div className="space-y-1 text-xs text-slate-300">
              <p><span className="text-slate-500">Merchant:</span> {selectedMethod.config.merchantName}</p>
              <p><span className="text-slate-500">Code:</span> {selectedMethod.config.merchantCode}</p>
              <p><span className="text-slate-500">Shortcode:</span> {selectedMethod.config.shortcode}</p>
            </div>
          )}

          {selectedMethod.type === 'card' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-300">{selectedMethod.config.instructions}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={methodDetails.cardName || ''}
                    onChange={e => updateDetails('cardName', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={methodDetails.cardLast4 || ''}
                    onChange={e => updateDetails('cardLast4', e.target.value.replace(/\D/g, ''))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={methodDetails.cardExpiry || ''}
                    onChange={e => updateDetails('cardExpiry', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Brand</label>
                  <select
                    value={methodDetails.cardBrand || ''}
                    onChange={e => updateDetails('cardBrand', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select</option>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {selectedMethod.type === 'paypal' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-300">{selectedMethod.config.instructions}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">PayPal Email</label>
                  <input
                    type="email"
                    value={methodDetails.paypalEmail || ''}
                    onChange={e => updateDetails('paypalEmail', e.target.value)}
                    placeholder={selectedMethod.config.paypalEmail}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={methodDetails.transactionId || ''}
                    onChange={e => updateDetails('transactionId', e.target.value)}
                    placeholder="PayPal transaction ID"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Payment Reference</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. Teller / Ecocash / Card ref"
              className="input-field"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedMethod || !amount || Number(amount) <= 0 || submitting}
        className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Processing...' : 'Submit Payment'}
      </button>
    </form>
  );
};

export default PaymentForm;
