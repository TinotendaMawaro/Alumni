import { useState, useEffect, useRef } from 'react';
import { getSupabase, isDemoMode } from '../services/supabase';
import { fetchAlumni } from '../services/alumni';
import { alumniFromDb } from '../utils/dbMapper';

export const useAlumniData = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let channel;

    const load = async () => {
      try {
        const data = await fetchAlumni();
        setAlumniList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load alumni records:', error);
        setAlumniList([]);
      } finally {
        setLoading(false);
      }

      if (isDemoMode) return;

      try {
        const client = getSupabase();
        channel = client
          .channel('public:alumni')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'alumni' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setAlumniList(prev => [alumniFromDb(payload.new), ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setAlumniList(prev => prev.map(a => a.id === payload.new.id ? alumniFromDb(payload.new) : a));
              } else if (payload.eventType === 'DELETE') {
                setAlumniList(prev => prev.filter(a => a.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (realtimeError) {
        console.warn('Realtime subscription unavailable:', realtimeError);
      }
    };

    load();

    return () => {
      if (channel) {
        getSupabase().removeChannel(channel);
      }
    };
  }, []);

  return { alumniList, setAlumniList, loading };
};
