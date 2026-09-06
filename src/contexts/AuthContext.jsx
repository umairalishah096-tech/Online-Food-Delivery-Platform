import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { setDocument, getDocument, COLLECTIONS } from "../firebase/firestore";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register with email/password
  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    const profile = {
      uid: cred.user.uid,
      email,
      displayName,
      role: "user",
      phone: "",
      address: "",
      photoURL: "",
      createdAt: new Date().toISOString(),
    };
    await setDocument(COLLECTIONS.USERS, cred.user.uid, profile);
    setUserProfile(profile);
    return cred;
  };

  // Login
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Google sign-in
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);

    // Create profile if first time
    const existing = await getDocument(COLLECTIONS.USERS, cred.user.uid);
    if (!existing) {
      const profile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        role: "user",
        phone: "",
        address: "",
        photoURL: cred.user.photoURL || "",
        createdAt: new Date().toISOString(),
      };
      await setDocument(COLLECTIONS.USERS, cred.user.uid, profile);
      setUserProfile(profile);
    }
    return cred;
  };

  // Logout
  const logout = () => signOut(auth);

  // Password reset
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Update user profile in Firestore
  const updateUserProfile = async (data) => {
    if (!currentUser) return;
    await setDocument(COLLECTIONS.USERS, currentUser.uid, {
      ...userProfile,
      ...data,
    });
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getDocument(COLLECTIONS.USERS, user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    isAdmin: userProfile?.role === "admin",
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
