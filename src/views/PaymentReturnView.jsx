import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Home } from 'lucide-react';
import { checkClickNPayOrderStatus } from '../services/clicknpay';
import { fetchPayments, updatePaymentStatus } from '../services/payments';

const PaymentReturnView = ({ addToast }) => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Verifying your payment with ClickNPay...');
  const [clientReference, setClientReference] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('clientReference') || params.get('client_reference') || params.get('reference');
    
    if (!ref) {
      ref = localStorage.getItem('clicknpay_return_ref');
      if (ref) {
        localStorage.removeItem('clicknpay_return_ref');
      }
    }
    setClientReference(ref);

    if (!ref) {
      setStatus('error');
      setMessage('Missing payment reference. Please contact support if you completed the payment.');
      return;
    }

    verifyPayment(ref);
  }, []);

  const verifyPayment = async (ref) => {
    try {
      const result = await checkClickNPayOrderStatus(ref);
      const normalized = (result.status || '').toUpperCase();

      if (normalized === 'SUCCESS') {
        setStatus('success');
        setMessage('Your payment was successful. Thank you for your contribution.');
      } else if (['PENDING', 'INITIATED'].includes(normalized)) {
        setStatus('pending');
        setMessage('Your payment is being processed. We will confirm once it is completed.');
      } else if (normalized === 'FAILED') {
        setStatus('failed');
        setMessage('Your payment was declined or failed. Please try again or contact support.');
      } else {
        setStatus('unknown');
        setMessage(`Payment status: ${result.status || 'unknown'}. Please keep this page open.`);
      }

      try {
        const payments = await fetchPayments();
        const matching = payments.find(p => p.reference === ref || p.transactionId === ref);
        if (matching) {
          const paymentStatus = normalized === 'SUCCESS' ? 'paid' : ['PENDING', 'INITIATED'].includes(normalized) ? 'pending' : normalized === 'FAILED' ? 'failed' : 'pending';
          await updatePaymentStatus(matching.id, paymentStatus, {
            metadata: { ...matching.metadata, clicknPay: result.raw },
          });
        }
      } catch (updateErr) {
        console.warn('Could not update payment record status:', updateErr);
      }
    } catch (err) {
      setStatus('error');
      setMessage('We could not verify your payment right now. Please try again or contact support.');
      console.error(err);
    }
  };

  const handleRetry = async () => {
    if (!clientReference) return;
    setRetrying(true);
    await verifyPayment(clientReference);
    setRetrying(false);
  };

  const getStatusColor = () => {
    if (status === 'success') return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (status === 'failed' || status === 'error') return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    if (status === 'pending' || status === 'checking') return 'text-yellow-400 border-yellow-500/40 bg-yellow-950/40';
    return 'text-slate-300 border-slate-700 bg-slate-900';
  };

  const getStatusIcon = () => {
    if (status === 'checking') return <Loader2 className="w-10 h-10 animate-spin" />;
    if (status === 'success') return <CheckCircle2 className="w-10 h-10" />;
    if (status === 'failed' || status === 'error') return <XCircle className="w-10 h-10" />;
    return <RefreshCw className="w-10 h-10" />;
  };

  return (
    <section className="flex-1 bg-slate-950 text-slate-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className={`card p-6 rounded-2xl border ${getStatusColor()} flex items-start gap-4`}>
          <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
          <div>
            <p className="text-sm font-bold">Payment Verification</p>
            <p className="text-xs mt-1 leading-relaxed">{message}</p>
            {clientReference && status !== 'checking' && (
              <p className="text-[11px] mt-2 font-mono text-slate-400 break-all">
                Reference: {clientReference}
              </p>
            )}
          </div>
        </div>

        {(status === 'pending' || status === 'error' || status === 'failed') && (
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Checking...' : 'Check Again'}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaymentReturnView;
