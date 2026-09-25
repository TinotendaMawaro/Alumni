import { useState, useEffect, useRef } from 'react';
import { checkConnection } from '../services/alumni';
import { isDemoMode } from '../services/supabase';

export const useConnectionStatus = () => {
  const [status, setStatus] = useState({ connected: false, mode: 'checking', lastChecked: null });
  const intervalRef = useRef(null);

  const check = async () => {
    const result = await checkConnection();
    setStatus(prev => ({ ...prev, ...result, lastChecked: new Date().toISOString() }));
  };

  useEffect(() => {
    check();
    
    if (!isDemoMode) {
      intervalRef.current = setInterval(check, 30000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { ...status, check };
};