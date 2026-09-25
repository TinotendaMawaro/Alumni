import { PAYMENT_STATUSES } from '../../data/paymentMethods';

const PaymentStatusBadge = ({ status }) => {
  const statusConfig = PAYMENT_STATUSES.find(item => item.value === status) || {
    value: status,
    label: status,
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold ${statusConfig.color}`}>
      {statusConfig.label}
    </span>
  );
};

export default PaymentStatusBadge;
