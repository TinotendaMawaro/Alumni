import { getSupabase, getAlumniTable, isDemoMode } from './supabase';
import {
  alumniToDb,
  alumniFromDb,
  generateId,
} from '../utils/dbMapper';

const demoStorageKey = 'sht_alumni_demo';

const readDemoAlumni = () => {
  try {
    const raw = localStorage.getItem(demoStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isRemoteId = (id) => id && !id.startsWith('seed-') && !id.startsWith('local-');

export const fetchAlumni = async () => {
  if (isDemoMode) {
    return readDemoAlumni() || [];
  }

  const table = getAlumniTable();
  const { data, error } = await table.select('*').order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message || 'Failed to load alumni records');
  }
  return (data || []).map(alumniFromDb);
};

export const createAlumnus = async (record) => {
  if (isDemoMode) {
    const id = generateId('alum');
    const entry = { ...record, id };
    return entry;
  }

  const table = getAlumniTable();
  const payload = alumniToDb(record);
  const { data, error } = await table.insert([payload]).select();
  if (error) throw error;
  return data?.[0] ? alumniFromDb(data[0]) : null;
};

export const updateAlumnus = async (id, changes) => {
  if (isDemoMode) {
    return { id, ...changes };
  }

  const table = getAlumniTable();
  const dbChanges = {
    fullname: changes.fullName,
    email: changes.email,
    whatsapp: changes.whatsapp,
    program: changes.program,
    year: changes.year === null || changes.year === undefined ? '' : String(changes.year),
    employment: changes.employment || 'N/A',
    location: changes.location || 'N/A',
  };

  const { data, error } = await table.update(dbChanges).eq('id', id).select();
  if (error) throw error;
  return data?.[0] ? alumniFromDb(data[0]) : { id, ...changes };
};

export const deleteAlumnus = async (id) => {
  if (isDemoMode) {
    return { id };
  }

  const table = getAlumniTable();
  const { error } = await table.delete().eq('id', id);
  if (error) throw error;
  return { id };
};

export const checkConnection = async () => {
  if (isDemoMode) {
    return { connected: false, mode: 'demo' };
  }

  try {
    const client = getSupabase();
    const { error } = await client.from('alumni').select('id').limit(1);
    return { connected: !error, mode: 'remote' };
  } catch {
    return { connected: false, mode: 'remote' };
  }
};
