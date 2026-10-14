import { getSupabase, isDemoMode } from './supabase';
import {
  paymentToDb,
  paymentFromDb,
  paymentMethodToDb,
  paymentMethodFromDb,
  generateId,
} from '../utils/dbMapper';

export const fetchPaymentMethods = async ({ includeInactive = false } = {}) => {
  if (isDemoMode) {
    return [];
  }

  const client = getSupabase();
  let query = client.from('payment_methods').select('*').order('sort_order', { ascending: true });
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || 'Failed to load payment methods');
  }
  return (data || []).map(paymentMethodFromDb);
};

export const createPaymentMethod = async (method) => {
  const payload = paymentMethodToDb(method);

  if (isDemoMode) return { ...method, id: payload.id };

  const client = getSupabase();
  const { data, error } = await client.from('payment_methods').insert([payload]).select();
  if (error) throw error;
  return data?.[0] ? paymentMethodFromDb(data[0]) : null;
};

export const updatePaymentMethod = async (id, changes) => {
  const payload = {};
  if (changes.name !== undefined) payload.name = changes.name;
  if (changes.type !== undefined) payload.type = changes.type;
  if (changes.description !== undefined) payload.description = changes.description;
  if (changes.config !== undefined) payload.config = changes.config;
  if (changes.isActive !== undefined) payload.is_active = changes.isActive;
  if (changes.sortOrder !== undefined) payload.sort_order = changes.sortOrder;

  if (isDemoMode) return { id, ...changes };

  const client = getSupabase();
  const { data, error } = await client
    .from('payment_methods')
    .update(payload)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data?.[0] ? paymentMethodFromDb(data[0]) : null;
};

export const deletePaymentMethod = async (id) => {
  if (isDemoMode) return { id };

  const client = getSupabase();
  const { error } = await client.from('payment_methods').delete().eq('id', id);
  if (error) throw error;
  return { id };
};

export const fetchPayments = async () => {
  if (isDemoMode) return [];

  const client = getSupabase();
  const { data, error } = await client
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message || 'Failed to load payments');
  }
  return (data || []).map(paymentFromDb);
};

export const createPayment = async (payment) => {
  if (isDemoMode) return { ...payment, id: generateId('pay') };

  const client = getSupabase();
  const payload = paymentToDb(payment, generateId('pay'));
  const { data, error } = await client.from('payments').insert([payload]).select();
  if (error) throw error;
  return data?.[0] ? paymentFromDb(data[0]) : null;
};

export const updatePaymentStatus = async (id, status, extra = {}) => {
  const payload = { status, updated_at: new Date().toISOString() };
  if (extra.transactionId !== undefined) payload.transaction_id = extra.transactionId;
  if (extra.reference !== undefined) payload.reference = extra.reference;
  if (extra.metadata !== undefined) payload.metadata = extra.metadata;

  if (isDemoMode) return { id, ...payload };

  const client = getSupabase();
  const { data, error } = await client.from('payments').update(payload).eq('id', id).select();
  if (error) throw error;
  return data?.[0] ? paymentFromDb(data[0]) : { id, status };
};

export const deletePayment = async (id) => {
  if (isDemoMode) return { id };

  const client = getSupabase();
  const { error } = await client.from('payments').delete().eq('id', id);
  if (error) throw error;
  return { id };
};
