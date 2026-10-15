import { Globe } from 'lucide-react';
import { PAYMENT_METHOD_TYPE_LABELS } from '../../data/paymentMethods';

const ICONS = {
  clicknpay: Globe,
};

const PaymentMethodIcon = ({ type, className = 'w-6 h-6' }) => {
  const Icon = ICONS[type] || Globe;
  return <Icon className={className} />;
};

export default PaymentMethodIcon;

export { PAYMENT_METHOD_TYPE_LABELS };
