import { useState } from 'react';
import { Edit3, Trash2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import PaymentMethodIcon from './PaymentMethodIcon';
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from '../../data/paymentMethods';

const PaymentMethodCard = ({ method, onEdit, onDelete, onToggleActive }) => {
  const statusColor = method.isActive
    ? 'border-emerald-500/40 bg-emerald-500/10'
    : 'border-slate-500/30 bg-slate-500/10';

  return (
    <div className={`card p-4 rounded-2xl border ${statusColor} transition`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-yellow-400">
            <PaymentMethodIcon type={method.type} className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{method.name}</h4>
            <p className="text-[11px] text-slate-400">{PAYMENT_METHOD_TYPE_LABELS[method.type] || method.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleActive(method)}
            className={`p-1.5 rounded-lg border transition ${
              method.isActive
                ? 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                : 'text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
            title={method.isActive ? 'Disable' : 'Enable'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(method)}
            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(method)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{method.description}</p>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-300 space-y-1">
        {method.type === 'bank_account' || method.type === 'bank_transfer' ? (
          <>
            <p><span className="text-slate-500">Bank:</span> {method.config.bankName}</p>
            <p><span className="text-slate-500">Account:</span> {method.config.accountName}</p>
            <p><span className="text-slate-500">Number:</span> {method.config.accountNumber}</p>
            <p><span className="text-slate-500">Branch:</span> {method.config.branch}</p>
            {method.config.swiftCode && (
              <p><span className="text-slate-500">SWIFT:</span> {method.config.swiftCode}</p>
            )}
            {method.config.referenceInstructions && (
              <p><span className="text-slate-500">Reference:</span> {method.config.referenceInstructions}</p>
            )}
          </>
        ) : null}

        {method.type === 'ecocash' ? (
          <>
            <p><span className="text-slate-500">Merchant:</span> {method.config.merchantName}</p>
            <p><span className="text-slate-500">Code:</span> {method.config.merchantCode}</p>
            <p><span className="text-slate-500">Shortcode:</span> {method.config.shortcode}</p>
          </>
        ) : null}

        {method.type === 'card' ? (
          <>
            <p><span className="text-slate-500">Gateway:</span> {method.config.gateway}</p>
            <p><span className="text-slate-500">Currency:</span> {method.config.currency}</p>
            <p><span className="text-slate-500">Mode:</span> {method.config.testMode ? 'Test / Sandbox' : 'Live'}</p>
            <p className="text-slate-400 italic">{method.config.instructions}</p>
          </>
        ) : null}

        {method.type === 'paypal' ? (
          <>
            <p><span className="text-slate-500">PayPal Email:</span> {method.config.paypalEmail}</p>
            <p><span className="text-slate-500">Currency:</span> {method.config.currency}</p>
            <p className="text-slate-400 italic">{method.config.instructions}</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentMethodCard;
