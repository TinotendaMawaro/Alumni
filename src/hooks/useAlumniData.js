import { useState, useEffect, useRef } from 'react';
import { getSupabase, getAlumniTable, isDemoMode } from '../services/supabase';
import { SEED_ALUMNI } from '../data/seedData';

export const useAlumniData = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let channel;

    const setupRealtime = async () => {
      if (isDemoMode) {
        setAlumniList(SEED_ALUMNI);
        setLoading(false);
        return;
      }

      const client = getSupabase();
      const table = getAlumniTable();

      const { data, error } = await table.select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase select fallback:', error);
        setAlumniList(SEED_ALUMNI);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setAlumniList(SEED_ALUMNI);
      } else {
        setAlumniList(data);
      }
      setLoading(false);

      channel = client
        .channel('public:alumni')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'alumni' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setAlumniList(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setAlumniList(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
            } else if (payload.eventType === 'DELETE') {
              setAlumniList(prev => prev.filter(a => a.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        getSupabase().removeChannel(channel);
      }
    };
  }, []);

  return { alumniList, setAlumniList, loading };
};
