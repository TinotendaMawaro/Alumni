const CLICKNPAY_BASE = 'https://backendservices.clicknpay.africa:2081';

export default async function handler(req, res) {
  const { method, query, body } = req;
  const action = query.action;

  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // Env vars take priority; the publicUniqueId is also passed by the client
  // as a fallback because it is public configuration, not a secret.
  const publicKey =
    process.env.CLICKNPAY_PUBLIC_UNIQUE_ID ||
    process.env.VITE_CLICKNPAY_PUBLIC_UNIQUE_ID ||
    body?.publicUniqueId ||
    '';

  const returnUrl =
    process.env.CLICKNPAY_RETURN_URL ||
    process.env.VITE_CLICKNPAY_RETURN_URL ||
    body?.returnUrl ||
    '';

  if (method === 'POST' && action === 'create') {
    if (!publicKey) {
      return res.status(500).json({ error: 'ClickNPay publicUniqueId is not configured' });
    }

    if (!body?.clientReference) {
      return res.status(400).json({ error: 'clientReference is required' });
    }

    if (!Number(body.amount) || Number(body.amount) <= 0) {
      return res.status(400).json({ error: 'A valid amount is required' });
    }

    const description = body.description || 'Alumni Registration Payment';

    const payload = {
      channel: 'AUTOMATED',
      clientReference: body.clientReference,
      currency: body.currency || 'USD',
      customerCharged: true,
      customerPhoneNumber: body.customerPhone || '',
      customerEmail: body.customerEmail || '',
      description,
      multiplePayments: false,
      orderYpe: 'DYNAMIC',
      productsList: [
        {
          description: body.productDescription || description,
          id: 0,
          price: Number(body.amount),
          productName: body.productName || description,
          quantity: 1,
        },
      ],
      publicUniqueId: publicKey,
      returnUrl: returnUrl || 'https://alumni-sigma-inky.vercel.app/payment-return',
    };

    try {
      const response = await fetch(`${CLICKNPAY_BASE}/payme/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || data.error || text || 'ClickNPay order failed' });
      }

      res.status(200).json({
        paymeUrl: data.paymeURL || data.paymeUrl || data.payme_url,
        clientReference: data.clientReference || body.clientReference,
        transactionId: data.correlator || data.openapiGatewayReference || null,
        status: data.status || null,
        raw: data,
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'ClickNPay request failed' });
    }
  } else if (method === 'GET' && action === 'status') {
    const ref = query.ref;

    if (!ref) {
      return res.status(400).json({ error: 'clientReference is required' });
    }

    try {
      const response = await fetch(`${CLICKNPAY_BASE}/payme/orders/${encodeURIComponent(ref)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || data.error || text || 'Status check failed' });
      }

      res.status(200).json({
        status: data.status || data.orderStatus || 'PENDING',
        clientReference: data.clientReference || ref,
        transactionId: data.correlator || data.openapiGatewayReference || null,
        raw: data,
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'ClickNPay status check failed' });
    }
  } else {
    res.status(400).json({ error: 'Invalid request' });
  }
}
