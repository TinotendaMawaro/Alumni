export const PAYMENT_METHOD_TYPES = [
  { value: 'paypal', label: 'PayPal' },
  { value: 'clicknpay', label: 'ClickNPay Online' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'failed', label: 'Failed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
];

export const DEFAULT_PAYMENT_METHODS = [
  {
    id: 'default-paypal',
    name: 'PayPal',
    type: 'paypal',
    description: 'Pay securely with PayPal.',
    config: {
      paypalEmail: 'payments@schoolofhospitality.edu',
      currency: 'USD',
      instructions: 'Send payment to the PayPal email above and enter the transaction ID as your reference.',
    },
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'default-clicknpay',
    name: 'ClickNPay Online',
    type: 'clicknpay',
    description: 'Pay securely online using ClickNPay. You will be redirected to complete your payment.',
    config: {
      currency: 'USD',
      merchantName: 'School of Hospitality and Tourism',
      instructions: 'Click submit to be redirected to ClickNPay secure payment page.',
    },
    isActive: true,
    sortOrder: 2,
  },
];

export const PAYMENT_METHOD_TYPE_LABELS = Object.fromEntries(
  PAYMENT_METHOD_TYPES.map(item => [item.value, item.label])
);

export const PAYMENT_STATUS_LABELS = Object.fromEntries(
  PAYMENT_STATUSES.map(item => [item.value, item.label])
);
