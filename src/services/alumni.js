import { getSupabase, getAlumniTable, isDemoMode } from './supabase';

const demoStorageKey = 'sht_alumni_demo';

const readDemoAlumni = () => {
  try {
    const raw = localStorage.getItem(demoStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeDemoAlumni = (data) => {
  localStorage.setItem(demoStorageKey, JSON.stringify(data));
};

export const isRemoteId = (id) => id && !id.startsWith('seed-') && !id.startsWith('local-');

export const fetchAlumni = async () => {
  if (isDemoMode) {
    return readDemoAlumni() || [];
  }

  const table = getAlumniTable();
  const { data, error } = await table.select('*').order('created_at', { ascending: false });
  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      throw new Error('ALUMNI_TABLE_MISSING');
    }
    throw error;
  }
  return data || [];
};

export const createAlumnus = async (record) => {
  if (isDemoMode) {
    const id = 'local-' + Date.now();
    const entry = { ...record, id };
    const current = readDemoAlumni() || [];
    writeDemoAlumni([entry, ...current]);
    return entry;
  }

  const table = getAlumniTable();
  const { data, error } = await table.insert([record]).select();
  if (error) throw error;
  return data?.[0] || null;
};

export const updateAlumnus = async (id, changes) => {
  if (isDemoMode) {
    const current = readDemoAlumni() || [];
    writeDemoAlumni(current.map(item => item.id === id ? { ...item, ...changes } : item));
    return { id, ...changes };
  }

  const table = getAlumniTable();
  const { data, error } = await table.update(changes).eq('id', id).select();
  if (error) throw error;
  return data?.[0] || null;
};

export const deleteAlumnus = async (id) => {
  if (isDemoMode) {
    const current = readDemoAlumni() || [];
    writeDemoAlumni(current.filter(item => item.id !== id));
    return { id };
  }

  const table = getAlumniTable();
  const { error } = await table.delete().eq('id', id);
  if (error) throw error;
  return { id };
};

export const syncLocalToRemote = async () => {
  if (isDemoMode) {
    return { synced: 0, errors: [] };
  }

  const localData = readDemoAlumni() || [];
  const localRecords = localData.filter(r => r.id?.startsWith('local-'));
  
  if (localRecords.length === 0) {
    return { synced: 0, errors: [] };
  }

  const table = getAlumniTable();
  const results = { synced: 0, errors: [] };

  for (const record of localRecords) {
    try {
      const { id, ...remoteRecord } = record;
      const { data, error } = await table.insert([remoteRecord]).select();
      if (error) throw error;
      if (data?.[0]) {
        results.synced++;
      }
    } catch (err) {
      results.errors.push({ record: record.id, error: err.message });
    }
  }

  if (results.synced > 0) {
    const remaining = localData.filter(r => !r.id?.startsWith('local-') || 
      !localRecords.some(lr => lr.id === r.id));
    writeDemoAlumni(remaining);
  }

  return results;
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
