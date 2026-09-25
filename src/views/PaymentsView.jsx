import { useState } from 'react';
import { Wallet, Send } from 'lucide-react';
import PaymentForm from '../components/payments/PaymentForm';
import { usePaymentMethods } from '../hooks/usePayments';
import { createPayment } from '../services/payments';

const PaymentsView = ({ addToast }) => {
  const { methods, loading } = usePaymentMethods();

  const handleSubmit = async (payload) => {
    try {
      await createPayment(payload);
      addToast('Payment request submitted successfully. We will contact you to confirm.', 'success');
    } catch (error) {
      console.error(error);
      addToast('Payment submission failed. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <section className="flex-1 bg-slate-950 text-slate-100 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center text-xs text-slate-400">Loading payment methods...</div>
      </section>
    );
  }

  const activeMethods = methods.filter(m => m.isActive);

  return (
    <section className="flex-1 bg-slate-950 text-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-4 border-2 border-yellow-400">
            <div className="w-14 h-14 relative flex items-center justify-center overflow-hidden">
              <img src="/logo.jpeg" alt="School of Hospitality and Tourism" className="w-full h-full object-contain" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-mono text-yellow-400 uppercase tracking-tight">
            Make a Payment
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Choose a payment method below and submit your payment request. Our team will confirm receipt shortly.
          </p>
        </div>

        {activeMethods.length === 0 ? (
          <div className="card p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No active payment methods configured. Please contact administration.
          </div>
        ) : (
          <PaymentForm methods={activeMethods} onSubmit={handleSubmit} />
        )}
      </div>
    </section>
  );
};

export default PaymentsView;
