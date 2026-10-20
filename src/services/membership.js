import { getSupabase, isDemoMode } from './supabase';

const padNumber = (n) => String(n).padStart(4, '0');

const readMaxMembershipNumber = async (client) => {
  const { data, error } = await client
    .from('payments')
    .select('metadata')
    .in('status', ['paid', 'succeeded']);

  if (error) throw error;

  const numbers = (data || [])
    .map(row => Number(row?.metadata?.membershipNumber))
    .filter(n => Number.isFinite(n) && n > 0);

  return numbers.length ? Math.max(...numbers) : 0;
};

/**
 * Issues the next sequential membership number for a paid alumnus and persists
 * it in the payment row's metadata so it survives page reloads.
 *
 * Sequential: always greater than every previously issued number.
 * Idempotent: a payment that already carries a number is returned untouched.
 */
export const assignMembershipNumber = async (payment, alumnus) => {
  if (!alumnus?.email) {
    throw new Error('An alumni email is required to issue a membership number');
  }

  if (isDemoMode) {
    const number = 1;
    return { membershipNumber: number, membershipCode: `SHT-${padNumber(number)}`, alumnus };
  }

  const client = getSupabase();

  const metadata = payment?.metadata || {};
  const existingNumber = Number(metadata.membershipNumber);

  if (Number.isFinite(existingNumber) && existingNumber > 0) {
    return { membershipNumber: existingNumber, membershipCode: `SHT-${padNumber(existingNumber)}`, alumnus };
  }

  const highest = await readMaxMembershipNumber(client);
  let membershipNumber = highest + 1;

  // Collision guard for near-simultaneous payments.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await client
      .from('payments')
      .select('id')
      .eq('metadata->>membershipNumber', String(membershipNumber));
    if (!clash || clash.length === 0) break;
    membershipNumber += 1;
  }

  const updatedMetadata = { ...metadata, membershipNumber, membershipIssuedAt: new Date().toISOString() };

  if (payment?.id) {
    const { error } = await client
      .from('payments')
      .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
      .eq('id', payment.id);
    if (error) throw error;
  }

  return { membershipNumber, membershipCode: `SHT-${padNumber(membershipNumber)}`, alumnus };
};

/**
 * Looks up a membership that was already issued for an alumni email.
 */
export const findMembershipByEmail = async (email) => {
  if (!email || isDemoMode) return null;

  const client = getSupabase();
  const { data, error } = await client
    .from('payments')
    .select('metadata')
    .ilike('alumni_email', email)
    .eq('status', 'paid');

  if (error) return null;

  for (const row of data || []) {
    const n = Number(row?.metadata?.membershipNumber);
    if (Number.isFinite(n) && n > 0) {
      return { membershipNumber: n, membershipCode: `SHT-${padNumber(n)}` };
    }
  }
  return null;
};
