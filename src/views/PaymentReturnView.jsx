import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Home, CreditCard, Mail, Phone, Hash, Calendar } from 'lucide-react';
import { checkClickNPayOrderStatus } from '../services/clicknpay';
import { fetchPayments, updatePaymentStatus } from '../services/payments';
import { assignMembershipNumber } from '../services/membership';

const MembershipCard = ({ card, onDone }) => {
  const cardRef = useRef(null);
  const alumnus = card?.alumnus || {};

  const handleDownload = () => {
    const node = cardRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('School of Hospitality & Tourism Alumni', 28, 56);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Membership Number', 28, 92);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(card.membershipCode, 28, 140);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Name: ${alumnus.fullName || 'N/A'}`, 28, 180);
    ctx.fillText(`Email: ${alumnus.email || 'N/A'}`, 28, 204);
    ctx.fillText(`Phone: ${alumnus.whatsapp || 'N/A'}`, 28, 228);
    ctx.fillText(`Issued: ${new Date().toLocaleDateString()}`, 28, 252);
    ctx.fillText('Status: ACTIVE  |  $5.00 USD per month', 28, 276);

    const link = document.createElement('a');
    link.download = `SHT-Membership-${card.membershipCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-5 items-center">
        <div
          ref={cardRef}
          className="w-full md:w-[420px] p-6 rounded-2xl border-2 border-yellow-400 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 55%, #1e1b4b 100%)',
          }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">
            School of Hospitality &amp; Tourism
          </p>
          <h3 className="text-xl font-black font-mono text-white uppercase mt-1">Membership Number</h3>

          <div className="mt-4 border-t border-white/20 pt-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Membership Number</p>
            <p className="text-2xl font-black font-mono text-yellow-400 tracking-wider">
              {card.membershipCode}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-1.5 text-xs text-slate-200">
            <p className="flex items-center gap-2 truncate">
              <span className="text-slate-400">Name:</span>
              <span className="font-bold text-white truncate">{alumnus.fullName || 'N/A'}</span>
            </p>
            <p className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{alumnus.email || 'N/A'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{alumnus.whatsapp || 'N/A'}</span>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3">
            <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              ACTIVE &middot; $5/mo
            </span>
          </div>
        </div>

        <div className="text-left space-y-3">
          <p className="text-sm font-bold text-white">Your membership is active.</p>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
            Keep your membership number <span className="font-mono font-bold text-yellow-400">{card.membershipCode}</span> for
            reference. A confirmation has been emailed to <span className="text-white">{alumnus.email || 'your inbox'}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownload} className="btn btn-primary">
              <CreditCard className="w-4 h-4" />
              Download Card
            </button>
            <button onClick={onDone} className="btn btn-ghost">
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentReturnView = ({ addToast }) => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Verifying your payment with ClickNPay...');
  const [clientReference, setClientReference] = useState(null);
  const [membership, setMembership] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('clientReference') || params.get('client_reference') || params.get('reference');

    if (!ref) {
      ref = localStorage.getItem('clicknpay_return_ref');
      if (ref) localStorage.removeItem('clicknpay_return_ref');
    }

    setClientReference(ref);

    if (!ref) {
      setStatus('error');
      setMessage('Missing payment reference. Please contact support if you completed the payment.');
      return;
    }

    verifyPayment(ref);
  }, []);

  const issueMembership = async (payment, ref) => {
    let alumnus = null;
    try {
      const raw = localStorage.getItem('clicknpay_return_alumnus');
      if (raw) {
        alumnus = JSON.parse(raw);
        localStorage.removeItem('clicknpay_return_alumnus');
      }
    } catch {
      alumnus = null;
    }

    if (!alumnus?.email && payment?.alumni_email) {
      alumnus = {
        fullName: payment.alumni_name,
        email: payment.alumni_email,
        whatsapp: payment.alumni_whatsapp,
      };
    }

    if (!alumnus?.email) return null;

    try {
      const result = await assignMembershipNumber(payment, alumnus);
      setMembership({ ...result, alumnus });

      const { sendMembershipCard } = await import('../services/email.js');
      sendMembershipCard(alumnus, result.membershipCode);

      return result;
    } catch (err) {
      console.warn('Membership issue failed:', err);
      return null;
    }
  };

  const verifyPayment = async (ref) => {
    try {
      const result = await checkClickNPayOrderStatus(ref);
      const raw = (result.status || '').toUpperCase();

      if (raw === 'SUCCESS' || raw === 'SUCCEEDED') {
        setStatus('success');
        setMessage('Your membership payment was successful. Your membership number is ready below.');
      } else if (['PENDING', 'INITIATED', 'PROCESSING'].includes(raw)) {
        setStatus('pending');
        setMessage('Your payment is being processed. We will confirm once it is completed.');
      } else if (raw === 'FAILED' || raw === 'ERROR') {
        setStatus('failed');
        setMessage('Your payment was declined or failed. Please try again or contact support.');
      } else {
        setStatus('unknown');
        setMessage(`Payment status: ${result.status || 'unknown'}. Please keep this page open.`);
      }

      try {
        const payments = await fetchPayments();
        let payment = payments.find(p => p.reference === ref || p.transactionId === ref);

        const mapped = raw === 'SUCCESS' || raw === 'SUCCEEDED'
          ? 'paid'
          : ['FAILED', 'ERROR'].includes(raw)
            ? 'failed'
            : 'pending';

        // 1. Persist the verified status first, preserving any membership data.
        if (payment) {
          await updatePaymentStatus(payment.id, mapped, {
            metadata: { ...payment.metadata, clicknPay: result.raw },
          });
          payment = {
            ...payment,
            status: mapped,
            metadata: { ...payment.metadata, clicknPay: result.raw },
          };
        }

        // 2. Only a successful payment unlocks a membership number.
        if (payment && mapped === 'paid') {
          if (payment.metadata?.membershipNumber) {
            const n = Number(payment.metadata.membershipNumber);
            setMembership({
              membershipNumber: n,
              membershipCode: `SHT-${String(n).padStart(4, '0')}`,
              alumnus: {
                fullName: payment.alumni_name,
                email: payment.alumni_email,
                whatsapp: payment.alumni_whatsapp,
              },
            });
          } else {
            await issueMembership(payment, ref);
          }
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
    if (status === 'success') return 'text-emerald-300 border-emerald-400/40 bg-emerald-950/50';
    if (status === 'failed' || status === 'error') return 'text-rose-300 border-rose-500/40 bg-rose-950/50';
    if (status === 'pending' || status === 'checking') return 'text-yellow-300 border-yellow-500/40 bg-yellow-950/50';
    return 'text-slate-300 border-white/15 bg-slate-900/40';
  };

  const getStatusIcon = () => {
    if (status === 'checking') return <Loader2 className="w-10 h-10 animate-spin" />;
    if (status === 'success') return <CheckCircle2 className="w-10 h-10" />;
    if (status === 'failed' || status === 'error') return <XCircle className="w-10 h-10" />;
    return <RefreshCw className="w-10 h-10" />;
  };

  return (
    <section className="flex-1 text-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className={`glass-strong p-6 flex items-start gap-4 ${getStatusColor()}`}>
          <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
          <div>
            <p className="text-sm font-bold">Payment Verification</p>
            <p className="text-xs mt-1 leading-relaxed">{message}</p>
            {clientReference && status !== 'checking' && (
              <p className="text-[11px] mt-2 font-mono text-slate-300/80 break-all">
                Reference: {clientReference}
              </p>
            )}
          </div>
        </div>

        {status === 'success' && membership && (
          <div className="glass-strong p-6">
            <MembershipCard
              card={membership}
              onDone={() => { window.location.href = '/'; }}
            />
          </div>
        )}

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
              onClick={() => { window.location.href = '/'; }}
              className="btn btn-ghost flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        )}

        {status === 'success' && !membership && (
          <div className="flex justify-center">
            <button
              onClick={() => { window.location.href = '/'; }}
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
