import { useState, useEffect } from 'react';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { app } from '../lib/firebase'; // firebase初期化を確認

export const useAuthUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginAsGuest = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Login Error:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return { user, loading, loginAsGuest, logout };
};
