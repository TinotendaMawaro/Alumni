const CLICKNPAY_BASE = 'https://backendservices.clicknpay.africa:2081';
const CLICKNPAY_PUBLIC_UNIQUE_ID = import.meta.env.VITE_CLICKNPAY_PUBLIC_UNIQUE_ID || '';
const CLICKNPAY_RETURN_URL = import.meta.env.VITE_CLICKNPAY_RETURN_URL || window.location.origin + '/payment-return';

export const isClickNPayConfigured = !!CLICKNPAY_PUBLIC_UNIQUE_ID;

export const createClickNPayOrder = async ({ amount, currency = 'USD', customerEmail, customerPhone, description, clientReference }) => {
  const payload = {
    channel: 'AUTOMATED',
    clientReference: clientReference,
    currency,
    customerCharged: true,
    customerPhoneNumber: customerPhone || '',
    customerEmail: customerEmail || '',
    description: description || 'Alumni Registration Payment',
    multiplePayments: false,
    orderYpe: 'DYNAMIC',
    productsList: [
      {
        description: description || 'Alumni Registration',
        id: 0,
        price: Number(amount),
        productName: 'Alumni Registration',
        quantity: 1,
      },
    ],
    publicUniqueId: CLICKNPAY_PUBLIC_UNIQUE_ID,
    returnUrl: CLICKNPAY_RETURN_URL,
  };

  const response = await fetch(`${CLICKNPAY_BASE}/payme/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ClickNPay order failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return {
    paymeUrl: data.paymeURL || data.paymeUrl || data.payme_url,
    clientReference: data.clientReference || clientReference,
    raw: data,
  };
};

export const checkClickNPayOrderStatus = async (clientReference) => {
  const response = await fetch(`${CLICKNPAY_BASE}/payme/orders/${encodeURIComponent(clientReference)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ClickNPay status check failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return {
    status: data.status || data.orderStatus || 'PENDING',
    clientReference: data.clientReference || clientReference,
    raw: data,
  };
};
