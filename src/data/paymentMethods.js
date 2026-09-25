export const PAYMENT_METHOD_TYPES = [
  { value: 'bank_account', label: 'Bank Account Deposit' },
  { value: 'bank_transfer', label: 'Direct Bank Transfer' },
  { value: 'ecocash', label: 'EcoCash Mobile Money' },
  { value: 'card', label: 'Visa / Mastercard' },
  { value: 'paypal', label: 'PayPal' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'failed', label: 'Failed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
];

export const DEFAULT_PAYMENT_METHODS = [
  {
    id: 'default-bank-account',
    name: 'CBZ Bank Account Deposit',
    type: 'bank_account',
    description: 'Deposit directly into our CBZ bank account.',
    config: {
      bankName: 'CBZ Bank',
      accountName: 'School of Hospitality and Tourism',
      accountNumber: '1234567890',
      branch: 'Harare Main Branch',
      swiftCode: 'CBZ ZWHARX',
      currency: 'USD',
    },
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'default-bank-transfer',
    name: 'Direct Bank Transfer',
    type: 'bank_transfer',
    description: 'Transfer funds directly to our primary account.',
    config: {
      bankName: 'CBZ Bank',
      accountName: 'School of Hospitality and Tourism',
      accountNumber: '1234567890',
      branch: 'Harare Main Branch',
      swiftCode: 'CBZ ZWHARX',
      referenceInstructions: 'Use your full name as reference.',
      currency: 'USD',
    },
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'default-ecocash',
    name: 'EcoCash Mobile Money',
    type: 'ecocash',
    description: 'Pay using EcoCash mobile money.',
    config: {
      merchantName: 'School of Hospitality and Tourism',
      merchantCode: '123456',
      shortcode: '*151#',
      currency: 'USD',
    },
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'default-card',
    name: 'Visa / Mastercard',
    type: 'card',
    description: 'Secure card payment via supported gateway.',
    config: {
      gateway: 'Stripe / Paystack',
      currency: 'USD',
      testMode: true,
      instructions: 'Card details are processed securely by the payment gateway and are not stored on this portal.',
    },
    isActive: true,
    sortOrder: 4,
  },
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
    sortOrder: 5,
  },
];

export const PAYMENT_METHOD_TYPE_LABELS = Object.fromEntries(
  PAYMENT_METHOD_TYPES.map(item => [item.value, item.label])
);

export const PAYMENT_STATUS_LABELS = Object.fromEntries(
  PAYMENT_STATUSES.map(item => [item.value, item.label])
);
