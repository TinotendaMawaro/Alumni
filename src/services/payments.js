import { getSupabase, isDemoMode } from './supabase';
import { DEFAULT_PAYMENT_METHODS } from '../data/paymentMethods';

const METHODS_STORAGE_KEY = 'sht_payment_methods';
const PAYMENTS_STORAGE_KEY = 'sht_payments';

const readDemoMethods = () => {
  try {
    const raw = localStorage.getItem(METHODS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PAYMENT_METHODS;
  } catch {
    return DEFAULT_PAYMENT_METHODS;
  }
};

const writeDemoMethods = (data) => {
  localStorage.setItem(METHODS_STORAGE_KEY, JSON.stringify(data));
};

const readDemoPayments = () => {
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeDemoPayments = (data) => {
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(data));
};

const nowIso = () => new Date().toISOString();

export const fetchPaymentMethods = async ({ includeInactive = false } = {}) => {
  if (isDemoMode) {
    const data = readDemoMethods();
    return includeInactive ? data : data.filter(m => m.isActive);
  }

  const client = getSupabase();
  let query = client.from('payment_methods').select('*').order('sortOrder', { ascending: true });
  if (!includeInactive) {
    query = query.eq('isActive', true);
  }
  const { data, error } = await query;
  if (error) {
    console.warn('Payment methods fetch fallback:', error);
    return includeInactive ? DEFAULT_PAYMENT_METHODS : DEFAULT_PAYMENT_METHODS.filter(m => m.isActive);
  }
  return data && data.length > 0 ? data : (includeInactive ? DEFAULT_PAYMENT_METHODS : DEFAULT_PAYMENT_METHODS.filter(m => m.isActive));
};

export const createPaymentMethod = async (method) => {
  const payload = {
    name: method.name,
    type: method.type,
    description: method.description || '',
    config: method.config || {},
    isActive: method.isActive ?? true,
    sortOrder: method.sortOrder ?? 0,
    updatedAt: nowIso(),
  };

  if (isDemoMode) {
    const entry = { id: 'local-' + Date.now(), ...payload };
    const current = readDemoMethods();
    writeDemoMethods([...current, entry]);
    return entry;
  }

  const client = getSupabase();
  const { data, error } = await client.from('payment_methods').insert([payload]).select();
  if (error) throw error;
  return data?.[0] || null;
};

export const updatePaymentMethod = async (id, changes) => {
  const payload = { ...changes, updatedAt: nowIso() };

  if (isDemoMode) {
    const current = readDemoMethods();
    writeDemoMethods(current.map(item => item.id === id ? { ...item, ...payload } : item));
    return { id, ...payload };
  }

  const client = getSupabase();
  const { data, error } = await client
    .from('payment_methods')
    .update(payload)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data?.[0] || null;
};

export const deletePaymentMethod = async (id) => {
  if (isDemoMode) {
    const current = readDemoMethods();
    writeDemoMethods(current.filter(item => item.id !== id));
    return { id };
  }

  const client = getSupabase();
  const { error } = await client.from('payment_methods').delete().eq('id', id);
  if (error) throw error;
  return { id };
};

export const fetchPayments = async () => {
  if (isDemoMode) {
    return readDemoPayments();
  }

  const client = getSupabase();
  const { data, error } = await client.from('payments').select('*').order('createdAt', { ascending: false });
  if (error) {
    console.warn('Payments fetch fallback:', error);
    return [];
  }
  return data || [];
};

export const createPayment = async (payment) => {
  const payload = {
    alumniId: payment.alumniId || null,
    alumniName: payment.alumniName,
    alumniEmail: payment.alumniEmail,
    alumniWhatsapp: payment.alumniWhatsapp || null,
    amount: payment.amount,
    currency: payment.currency || 'USD',
    methodId: payment.methodId || null,
    methodName: payment.methodName,
    methodType: payment.methodType,
    status: payment.status || 'pending',
    reference: payment.reference || null,
    transactionId: payment.transactionId || null,
    metadata: payment.metadata || {},
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  if (isDemoMode) {
    const entry = { id: 'local-' + Date.now(), ...payload };
    const current = readDemoPayments();
    writeDemoPayments([entry, ...current]);
    return entry;
  }

  const client = getSupabase();
  const { data, error } = await client.from('payments').insert([payload]).select();
  if (error) throw error;
  return data?.[0] || null;
};

export const updatePaymentStatus = async (id, status, extra = {}) => {
  const payload = { status, ...extra, updatedAt: nowIso() };

  if (isDemoMode) {
    const current = readDemoPayments();
    writeDemoPayments(current.map(item => item.id === id ? { ...item, ...payload } : item));
    return { id, ...payload };
  }

  const client = getSupabase();
  const { data, error } = await client.from('payments').update(payload).eq('id', id).select();
  if (error) throw error;
  return data?.[0] || null;
};

export const deletePayment = async (id) => {
  if (isDemoMode) {
    const current = readDemoPayments();
    writeDemoPayments(current.filter(item => item.id !== id));
    return { id };
  }

  const client = getSupabase();
  const { error } = await client.from('payments').delete().eq('id', id);
  if (error) throw error;
  return { id };
};
