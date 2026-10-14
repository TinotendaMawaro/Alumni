// The ClickNPay API is called through the same-origin proxy at /api/clicknpay.
// This avoids browser CORS errors and keeps the integration resilient.

const CLICKNPAY_PUBLIC_UNIQUE_ID = import.meta.env.VITE_CLICKNPAY_PUBLIC_UNIQUE_ID || '';
const CLICKNPAY_RETURN_URL =
  import.meta.env.VITE_CLICKNPAY_RETURN_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/payment-return` : '');

const PROXY_ENDPOINT = '/api/clicknpay';

export const isClickNPayConfigured = !!CLICKNPAY_PUBLIC_UNIQUE_ID;

export const createClickNPayOrder = async ({
  amount,
  currency = 'USD',
  customerEmail,
  customerPhone,
  description,
  clientReference,
}) => {
  const response = await fetch(`${PROXY_ENDPOINT}?action=create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Number(amount),
      currency,
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      description: description || 'Alumni Registration Payment',
      clientReference,
      publicUniqueId: CLICKNPAY_PUBLIC_UNIQUE_ID,
      returnUrl: CLICKNPAY_RETURN_URL,
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Payment gateway returned an unexpected response');
  }

  if (!response.ok || data.error) {
    throw new Error(data.error || `Payment order failed (status ${response.status})`);
  }

  if (!data.paymeUrl) {
    throw new Error('Payment gateway did not return a payment URL');
  }

  return {
    paymeUrl: data.paymeUrl,
    clientReference: data.clientReference || clientReference,
    transactionId: data.transactionId || null,
    status: data.status || null,
    raw: data.raw,
  };
};

export const checkClickNPayOrderStatus = async (clientReference) => {
  const response = await fetch(
    `${PROXY_ENDPOINT}?action=status&ref=${encodeURIComponent(clientReference)}`,
    { method: 'GET', headers: { Accept: 'application/json' } }
  );

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Payment gateway returned an unexpected response');
  }

  if (!response.ok || data.error) {
    throw new Error(data.error || `Status check failed (status ${response.status})`);
  }

  return {
    status: data.status || 'PENDING',
    clientReference: data.clientReference || clientReference,
    transactionId: data.transactionId || null,
    raw: data.raw,
  };
};
