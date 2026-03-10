'use client';

import { useState, useEffect } from 'react';
import { DatabaseReference, onValue, DataSnapshot } from 'firebase/database';

export function useRTDBList<T = any>(ref: DatabaseReference | null) {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onValue(
      ref,
      (snapshot: DataSnapshot) => {
        const val = snapshot.val();
        if (val) {
          const list = Object.entries(val).map(([key, value]) => ({
            ...(value as T),
            id: key,
          }));
          setData(list);
        } else {
          setData([]);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}

export function useRTDBObject<T = any>(ref: DatabaseReference | null) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onValue(
      ref,
      (snapshot: DataSnapshot) => {
        const val = snapshot.val();
        if (val) {
          setData({ ...(val as T), id: snapshot.key! });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
