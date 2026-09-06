import { useState, useEffect, useCallback } from "react";
import {
  getCollection,
  subscribeToCollection,
  subscribeToDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
} from "../firebase/firestore";

// ── Fetch a collection once ───────────────────────────────────────────────────
export const useCollection = (collectionName, constraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCollection(collectionName, constraints);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ── Real-time collection subscription ────────────────────────────────────────
export const useRealtimeCollection = (collectionName, constraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToCollection(collectionName, constraints, (result) => {
      setData(result);
      setLoading(false);
    });
    return unsub;
  }, [collectionName]);

  return { data, loading, error };
};

// ── Real-time single document ─────────────────────────────────────────────────
export const useRealtimeDocument = (collectionName, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const unsub = subscribeToDocument(collectionName, id, (result) => {
      setData(result);
      setLoading(false);
    });
    return unsub;
  }, [collectionName, id]);

  return { data, loading };
};

// ── Fetch single document ─────────────────────────────────────────────────────
export const useDocument = (collectionName, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getDocument(collectionName, id)
      .then((result) => { setData(result); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [collectionName, id]);

  return { data, loading, error };
};
