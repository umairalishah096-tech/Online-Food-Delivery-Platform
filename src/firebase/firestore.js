import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "./config";

// ─── Collections ────────────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: "users",
  RESTAURANTS: "restaurants",
  MENU_ITEMS: "menuItems",
  ORDERS: "orders",
  REVIEWS: "reviews",
  CATEGORIES: "categories",
  NOTIFICATIONS: "notifications",
};

// ─── Generic helpers ─────────────────────────────────────────────────────────
export const createDocument = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const setDocument = async (collectionName, id, data) => {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getDocument = async (collectionName, id) => {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateDocument = async (collectionName, id, data) => {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};

export const getCollection = async (collectionName, constraints = []) => {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── Real-time listeners ──────────────────────────────────────────────────────
export const subscribeToCollection = (collectionName, constraints, callback) => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

export const subscribeToDocument = (collectionName, id, callback) => {
  return onSnapshot(doc(db, collectionName, id), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
};

// ─── Re-export Firestore utilities ───────────────────────────────────────────
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  getDocs,
  getDoc,
};
