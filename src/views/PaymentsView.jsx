import { useState } from 'react';
import { Wallet, Lock } from 'lucide-react';
import PaymentForm from '../components/payments/PaymentForm';
import { usePaymentMethods } from '../hooks/usePayments';
import { createPayment, updatePaymentStatus } from '../services/payments';
import { createClickNPayOrder } from '../services/clicknpay';

const PaymentsView = ({ addToast }) => {
  const { methods, loading } = usePaymentMethods();

  const handleSubmit = async (payload) => {
    try {
      if (payload.methodType === 'clicknpay') {
        const clientReference = `CNP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        // 1. Create the ClickNPay order first so we have a real reference.
        const order = await createClickNPayOrder({
          amount: payload.amount,
          currency: payload.currency,
          customerEmail: payload.alumniEmail,
          customerPhone: payload.alumniWhatsapp,
          description: `Alumni Registration - ${payload.alumniName}`,
          clientReference,
        });

        if (!order.paymeUrl) {
          throw new Error('Payment gateway did not return a payment URL');
        }

        // 2. Persist the pending payment against the database.
        const savedPayment = await createPayment({
          ...payload,
          reference: order.clientReference,
          transactionId: order.transactionId || order.clientReference,
          status: 'pending',
          metadata: {
            clicknpay: order.raw,
            paymeUrl: order.paymeUrl,
          },
        });

        // 3. Remember the reference in case the return URL omits it.
        localStorage.setItem('clicknpay_return_ref', order.clientReference);

        // 4. Ensure the row is linked to the gateway order.
        if (savedPayment?.id) {
          await updatePaymentStatus(savedPayment.id, 'pending', {
            transactionId: order.transactionId || order.clientReference,
            reference: order.clientReference,
            metadata: {
              clicknpay: order.raw,
              paymeUrl: order.paymeUrl,
            },
          });
        }

        // 5. Redirect to ClickNPay in the same tab.
        window.location.href = order.paymeUrl;
      } else {
        await createPayment(payload);
        addToast('Payment request submitted successfully. We will contact you to confirm.', 'success');
      }
    } catch (error) {
      console.error(error);
      addToast(error?.message || 'Payment could not be started. Please try again.', 'error');
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
            Complete your payment securely through ClickNPay. You will be redirected to the payment gateway.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Lock className="w-3 h-3" />
          <span>Your information is protected by industry-standard encryption</span>
        </div>

        {activeMethods.length === 0 ? (
          <div className="card p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No active payment methods configured. Please contact administration.
          </div>
        ) : (
          <PaymentForm methods={activeMethods} onSubmit={handleSubmit} addToast={addToast} />
        )}
      </div>
    </section>
  );
};

export default PaymentsView;
