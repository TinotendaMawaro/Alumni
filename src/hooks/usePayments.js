import { useState, useEffect, useRef } from 'react';
import { fetchPaymentMethods, fetchPayments } from '../services/payments';

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const load = async () => {
      try {
        const data = await fetchPaymentMethods();
        setMethods(data);
      } catch (error) {
        console.warn('Payment methods fallback:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { methods, setMethods, loading };
};

export const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const load = async () => {
      try {
        const data = await fetchPayments();
        setPayments(data);
      } catch (error) {
        console.warn('Payments fallback:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { payments, setPayments, loading };
};
