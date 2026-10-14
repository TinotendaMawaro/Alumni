// Column mapping between the app (camelCase) and Supabase (snake_case).
// The live database uses snake_case columns, so every read/write must be mapped.

export const generateId = (prefix = 'rec') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------- Alumni ----------------

export const alumniToDb = (record) => {
  const payload = {
    id: record.id || generateId('alum'),
    fullname: record.fullName,
    email: record.email,
    whatsapp: record.whatsapp,
    program: record.program,
    year: record.year === null || record.year === undefined ? '' : String(record.year),
    employment: record.employment || 'N/A',
    location: record.location || 'N/A',
  };
  return payload;
};

export const alumniFromDb = (row) => ({
  id: row.id,
  fullName: row.fullname,
  email: row.email,
  whatsapp: row.whatsapp,
  program: row.program,
  year: row.year,
  employment: row.employment || 'N/A',
  location: row.location || 'N/A',
  termsAccepted: true,
  createdAt: row.created_at ? row.created_at.split('T')[0] : '',
  created_at: row.created_at,
});

// ---------------- Payments ----------------

export const paymentToDb = (payment, id) => ({
  id: id || payment.id || generateId('pay'),
  alumni_id: payment.alumniId || null,
  alumni_name: payment.alumniName,
  alumni_email: payment.alumniEmail,
  alumni_whatsapp: payment.alumniWhatsapp || null,
  amount: payment.amount,
  currency: payment.currency || 'USD',
  method_name: payment.methodName,
  method_type: payment.methodType,
  status: payment.status || 'pending',
  reference: payment.reference || null,
  transaction_id: payment.transactionId || null,
  metadata: payment.metadata || {},
});

export const paymentFromDb = (row) => ({
  id: row.id,
  alumniId: row.alumni_id,
  alumniName: row.alumni_name,
  alumniEmail: row.alumni_email,
  alumniWhatsapp: row.alumni_whatsapp,
  amount: row.amount,
  currency: row.currency,
  methodId: row.method_id,
  methodName: row.method_name,
  methodType: row.method_type,
  status: row.status,
  reference: row.reference,
  transactionId: row.transaction_id,
  metadata: row.metadata || {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ---------------- Payment methods ----------------

export const paymentMethodToDb = (method) => ({
  id: method.id || generateId('pm'),
  name: method.name,
  type: method.type,
  description: method.description || '',
  config: method.config || {},
  is_active: method.isActive ?? true,
  sort_order: method.sortOrder ?? 0,
});

export const paymentMethodFromDb = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  description: row.description || '',
  config: row.config || {},
  isActive: row.is_active,
  sortOrder: row.sort_order,
});
