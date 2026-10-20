import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import PaymentMethodIcon from './PaymentMethodIcon';

const PaymentForm = ({ methods, onSubmit, addToast, defaultAmount, prefill }) => {
  const selectedMethod = useMemo(() => methods[0] || null, [methods]);
  const suggested = Number(defaultAmount) > 0 ? Number(defaultAmount) : 0;

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [alumniName, setAlumniName] = useState('');
  const [alumniEmail, setAlumniEmail] = useState('');
  const [alumniWhatsapp, setAlumniWhatsapp] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prefill the suggested membership amount, but leave it fully editable.
  useEffect(() => {
    if (suggested > 0) setAmount(String(suggested.toFixed(2)));
  }, [suggested]);

  useEffect(() => {
    if (!prefill) return;
    if (prefill.alumniName) setAlumniName(prefill.alumniName);
    if (prefill.alumniEmail) setAlumniEmail(prefill.alumniEmail);
    if (prefill.alumniWhatsapp) setAlumniWhatsapp(prefill.alumniWhatsapp);
  }, [prefill]);

  const numericAmount = Number(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMethod) return;
    if (!numericAmount || numericAmount <= 0) {
      addToast?.('Please enter a valid amount.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      methodId: selectedMethod.id,
      methodName: selectedMethod.name,
      methodType: selectedMethod.type,
      amount: numericAmount,
      currency,
      alumniName: alumniName.trim() || 'Guest',
      alumniEmail: alumniEmail.trim(),
      alumniWhatsapp: alumniWhatsapp.trim() || null,
      reference: reference.trim() || (suggested > 0 ? 'Monthly alumni membership' : null),
      metadata: {},
      status: 'pending',
    };

    try {
      await onSubmit(payload);
      if (selectedMethod.type !== 'clicknpay') {
        setAlumniName('');
        setAlumniEmail('');
        setAlumniWhatsapp('');
        setReference('');
      }
    } catch (error) {
      console.error(error);
      addToast?.('Payment could not be started. Please try again.', 'error');
    } finally {
      if (selectedMethod.type !== 'clicknpay') setSubmitting(false);
    }
  };

  if (!selectedMethod) return null;

  return (
    <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-white/15 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Full Name *</label>
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
          <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Email *</label>
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
          <label className="block text-xs font-bold uppercase text-slate-200 mb-1">WhatsApp Phone</label>
          <input
            type="tel"
            value={alumniWhatsapp}
            onChange={e => setAlumniWhatsapp(e.target.value)}
            placeholder="+263 77 123 4567"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-200 mb-1">
            {suggested > 0 ? 'Membership Fee (per month)' : 'Amount *'}
            {suggested > 0 && (
              <span className="ml-1.5 font-normal normal-case tracking-normal text-slate-400">
                editable
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="5.00"
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

      <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/10 space-y-3">
        <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Secure Payment Gateway</p>
        <div className="flex items-center gap-3">
          <PaymentMethodIcon type={selectedMethod.type} className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="text-sm font-bold text-white">{selectedMethod.name}</p>
            <p className="text-[11px] text-slate-300">{selectedMethod.description}</p>
          </div>
        </div>
        {selectedMethod.config?.instructions && (
          <p className="text-[11px] text-yellow-300">{selectedMethod.config.instructions}</p>
        )}
        {suggested > 0 && (
          <p className="text-[11px] text-slate-300">
            Suggested membership fee is <span className="font-bold text-yellow-400">$5.00 USD every month</span> —
            you can pay a different amount if you wish.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-200 mb-1">
          Payment Reference {suggested > 0 ? '' : '(optional)'}
        </label>
        <input
          type="text"
          value={reference}
          onChange={e => setReference(e.target.value)}
          placeholder={suggested > 0 ? 'Monthly alumni membership' : 'e.g. Donation'}
          className="input-field"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !numericAmount || numericAmount <= 0}
        className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-purple-950 font-black rounded-xl transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-purple-950 border-t-transparent rounded-full animate-spin" />
            <span>Redirecting to secure checkout...</span>
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            <span>Pay Now</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-300 pt-1">
        <Lock className="w-3 h-3" />
        <span>Your information is protected by industry-standard encryption</span>
      </div>
    </form>
  );
};

export default PaymentForm;
