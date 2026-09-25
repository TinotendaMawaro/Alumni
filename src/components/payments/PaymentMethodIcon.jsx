import { Building2, CreditCard, Wallet, Repeat } from 'lucide-react';
import { PAYMENT_METHOD_TYPE_LABELS } from '../../data/paymentMethods';

const ICONS = {
  bank_account: Building2,
  bank_transfer: Repeat,
  ecocash: Wallet,
  card: CreditCard,
  paypal: null,
};

const PaymentMethodIcon = ({ type, className = 'w-6 h-6' }) => {
  if (type === 'paypal') {
    return <span className={`${className} inline-flex items-center justify-center rounded-full border border-purple-700 bg-purple-900 text-[10px] font-black text-yellow-400`}>P</span>;
  }
  const Icon = ICONS[type] || Wallet;
  return <Icon className={className} />;
};

export default PaymentMethodIcon;

export { PAYMENT_METHOD_TYPE_LABELS };
