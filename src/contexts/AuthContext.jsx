// AuthContext shares the logged-in user with every page.
// Pattern from the React lecture: AuthProvider + useAuth hook.
// It also loads the user's profile from Firestore (role, status, daily usage)
// and the platform settings (daily limit, announcement).
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { loadOrCreateProfile, getUser, updateUserName, getSettings, DEFAULT_SETTINGS } from '../services/db';
import AppError from '../utils/AppError';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null); // null = logged out
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [blockedNotice, setBlockedNotice] = useState(false);
  // True while signup or login is running, so the listener below does not do the same work twice.
  const busy = useRef(false);

  // A blocked user is logged out at once.
  async function acceptProfile(loaded) {
    if (loaded.status === 'blocked') {
      await signOut(auth);
      setProfile(null);
      setBlockedNotice(true);
      throw new AppError('auth.blocked');
    }
    setBlockedNotice(false);
    setProfile(loaded);
  }

  async function signup(name, email, password) {
    busy.current = true;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await acceptProfile(await loadOrCreateProfile(result.user, name));
    } finally {
      busy.current = false;
    }
  }

  async function login(email, password) {
    busy.current = true;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await acceptProfile(await loadOrCreateProfile(result.user));
    } finally {
      busy.current = false;
    }
  }

  // Sign out from Firebase first, then clear the screen, so a reload never brings the user back.
  async function logout() {
    await signOut(auth);
    setProfile(null);
  }

  async function updateName(name) {
    await updateProfile(auth.currentUser, { displayName: name });
    await updateUserName(profile.uid, name);
    setProfile({ ...profile, name });
  }

  // Firebase asks for the current password again before a password change.
  async function changePassword(currentPassword, newPassword) {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }

  // Reads the profile again, for example after the daily usage changed.
  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    const fresh = await getUser(auth.currentUser.uid);
    if (fresh) setProfile(fresh);
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      setSettings(await getSettings());
    } catch {
      // Keep the default settings if the database cannot be reached.
    }
  }, []);

  useEffect(() => {
    refreshSettings();
    // Runs on page load and every time the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (busy.current) return;
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        await acceptProfile(await loadOrCreateProfile(firebaseUser));
      } catch {
        // Blocked or database error: the user stays logged out.
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [refreshSettings]);

  // "user" keeps the same shape as before, so pages did not need to change much.
  const user = profile && {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.name,
  };

  const value = {
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    settings,
    blockedNotice,
    signup,
    login,
    logout,
    updateName,
    changePassword,
    refreshProfile,
    refreshSettings,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
