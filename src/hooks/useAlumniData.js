import { useState, useEffect, useRef } from 'react';
import { getSupabase, isDemoMode } from '../services/supabase';
import { fetchAlumni } from '../services/alumni';
import { SEED_ALUMNI } from '../data/seedData';

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
        if (data && data.length > 0) {
          setAlumniList(data);
        } else {
          setAlumniList(SEED_ALUMNI);
        }
      } catch (error) {
        console.warn('Alumni load fallback:', error);
        setAlumniList(SEED_ALUMNI);
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
                setAlumniList(prev => [payload.new, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setAlumniList(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
              } else if (payload.eventType === 'DELETE') {
                setAlumniList(prev => prev.filter(a => a.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (realtimeError) {
        console.warn('Realtime subscription fallback:', realtimeError);
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
