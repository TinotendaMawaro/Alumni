// =====================================================================
// Admin authentication
// ---------------------------------------------------------------------
// Only a fixed list of committee role accounts may access the admin
// portal. On first login each account uses the default passkey
// (admin123) once, then is forced to set a permanent password of their
// own. Afterwards the default passkey no longer works for that account.
//
// Credentials are persisted in the Supabase `admin_credentials` table
// when a database is configured, and fall back to localStorage in demo
// mode so the flow still works locally.
//
// NOTE: passwords are stored as a salted SHA-256 hash. For a hardened
// production deployment prefer Supabase Auth / an edge function so the
// hashes are never exposed to the browser. This client-side scheme is
// chosen to match the existing anon-key architecture of this project.
// =====================================================================

import { getSupabase, isDemoMode } from './supabase';

const DEFAULT_PASSKEY = 'admin123';
const LOCAL_STORAGE_KEY = 'sht_admin_credentials_v1';
const TABLE = 'admin_credentials';

// ---------------------------------------------------------------------
// Whitelisted committee accounts. Matching is case-insensitive; the
// canonical (display) email and a sensible default name are kept here.
// ---------------------------------------------------------------------
export const ADMIN_ACCOUNTS = [
  { email: 'Chairperson@schotoalumni.co.zw', name: 'Chairperson' },
  { email: 'Vicechairperson@schotoalumni.co.zw', name: 'Vice Chairperson' },
  { email: 'Treasury@schotoalumni.co.zw', name: 'Treasurer' },
  { email: 'SecretaryGeneral@schotoalumni.co.zw', name: 'Secretary General' },
  { email: 'IT@schotoalumni.co.zw', name: 'IT Administrator' },
  { email: 'Logistics@schotoalumni.co.zw', name: 'Logistics' },
];

const ACCOUNT_BY_EMAIL = new Map(
  ADMIN_ACCOUNTS.map((a) => [a.email.toLowerCase(), a])
);

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export const isWhitelisted = (email) => ACCOUNT_BY_EMAIL.has(normalizeEmail(email));

export const PASSWORD_MIN_LENGTH = 8;

// Returns an error string if the password is too weak, otherwise null.
export const validatePassword = (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (password === DEFAULT_PASSKEY) {
    return 'You cannot reuse the default passkey. Choose a different password.';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain both letters and numbers.';
  }
  return null;
};

// ---------------------------------------------------------------------
// Hashing helpers (Web Crypto, available in all secure contexts).
// ---------------------------------------------------------------------
const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const randomSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

const hashPassword = async (password, salt) => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
};

// Constant-time-ish string comparison to avoid trivial timing leaks.
const safeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

// ---------------------------------------------------------------------
// Persistence layer (Supabase in production, localStorage in demo mode).
// ---------------------------------------------------------------------
const readLocalStore = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeLocalStore = (store) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — ignore */
  }
};

const getCredential = async (email) => {
  const key = normalizeEmail(email);

  if (isDemoMode) {
    return readLocalStore()[key] || null;
  }

  const client = getSupabase();
  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('email', key)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message || 'Failed to read admin credentials');
  }
  if (!data) return null;
  return {
    email: data.email,
    name: data.name,
    salt: data.salt,
    hash: data.password_hash,
    passwordSet: data.password_set,
  };
};

const saveCredential = async (credential) => {
  const key = normalizeEmail(credential.email);

  if (isDemoMode) {
    const store = readLocalStore();
    store[key] = { ...credential, email: key };
    writeLocalStore(store);
    return;
  }

  const client = getSupabase();
  const { error } = await client.from(TABLE).upsert(
    {
      email: key,
      name: credential.name,
      salt: credential.salt,
      password_hash: credential.hash,
      password_set: credential.passwordSet,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email' }
  );
  if (error) {
    throw new Error(error.message || 'Failed to save admin credentials');
  }
};

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

/**
 * Authenticate an admin.
 * @returns one of:
 *   { status: 'ok', admin: { name, email } }
 *   { status: 'must_set_password', email, name }
 *   { status: 'error', message }
 */
export const authenticateAdmin = async (email, passkey) => {
  const key = normalizeEmail(email);
  const account = ACCOUNT_BY_EMAIL.get(key);

  if (!account) {
    return { status: 'error', message: 'This email is not authorised to access the admin portal.' };
  }

  let credential;
  try {
    credential = await getCredential(key);
  } catch (err) {
    return { status: 'error', message: err.message || 'Could not verify credentials. Please try again.' };
  }

  // Account has a permanent password set — verify it.
  if (credential && credential.passwordSet) {
    const attempt = await hashPassword(passkey, credential.salt);
    if (safeEqual(attempt, credential.hash)) {
      return { status: 'ok', admin: { name: credential.name || account.name, email: account.email } };
    }
    return { status: 'error', message: 'Incorrect password. Please try again.' };
  }

  // First login: only the default passkey is accepted, and it forces a
  // permanent password to be chosen.
  if (safeEqual(passkey, DEFAULT_PASSKEY)) {
    return { status: 'must_set_password', email: account.email, name: account.name };
  }

  return {
    status: 'error',
    message: 'First-time login requires the default passkey. You will then set your own password.',
  };
};

/**
 * Set (or replace) a permanent password for a first-time admin, then log
 * them in. Only whitelisted accounts without an existing password may do
 * this.
 * @returns { status: 'ok', admin } | { status: 'error', message }
 */
export const setAdminPassword = async (email, newPassword, displayName) => {
  const key = normalizeEmail(email);
  const account = ACCOUNT_BY_EMAIL.get(key);

  if (!account) {
    return { status: 'error', message: 'This email is not authorised to access the admin portal.' };
  }

  const validationError = validatePassword(newPassword);
  if (validationError) {
    return { status: 'error', message: validationError };
  }

  let existing;
  try {
    existing = await getCredential(key);
  } catch (err) {
    return { status: 'error', message: err.message || 'Could not save your password. Please try again.' };
  }

  // Guard: a permanent password is set once. Changing it later must go
  // through a dedicated reset flow, not the first-login screen.
  if (existing && existing.passwordSet) {
    return { status: 'error', message: 'A password has already been set for this account.' };
  }

  const salt = randomSalt();
  const hash = await hashPassword(newPassword, salt);
  const name = (displayName || '').trim() || account.name;

  try {
    await saveCredential({ email: account.email, name, salt, hash, passwordSet: true });
  } catch (err) {
    return { status: 'error', message: err.message || 'Could not save your password. Please try again.' };
  }

  return { status: 'ok', admin: { name, email: account.email } };
};
