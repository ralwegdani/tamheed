// All database work (Firestore) lives in this file.
// Pages never talk to Firestore directly. They call these functions.
//
// Collections:
//   users/{uid}        profile: name, email, role, status, dates, daily usage
//   results/{id}       one evaluated answer (uid tells who it belongs to)
//   simulations/{id}   admin changes: edited built-in simulations, new ones, hidden flag
//   settings/platform  daily limit and announcement
//   adminLog/{id}      what admins did and when
//
// Who can read or change what is enforced by firestore.rules (in the project root).
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebase';
import { SIMULATIONS } from '../data/simulations';
import { ADMIN_EMAILS } from '../data/admins';
import AppError from '../utils/AppError';

export const DEFAULT_SETTINGS = {
  dailyLimit: 5,
  announcement: { text: '', active: false },
};

const now = () => new Date().toISOString();

// Today's date as text, in the user's local time. Used for the daily limit.
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Turns a Firestore error into one of our translated messages.
function toAppError(error) {
  if (error instanceof AppError) return error;
  if (error?.code === 'permission-denied') return new AppError('db.denied');
  if (error?.code === 'unavailable') return new AppError('db.offline');
  return new AppError('db.generic');
}

async function run(task) {
  try {
    return await task();
  } catch (error) {
    console.error(error);
    throw toAppError(error);
  }
}

const listOf = (snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

/* =========================================================
   Users
   ========================================================= */

// Reads the user's profile, or creates it the first time they log in.
// Emails in data/admins.js start as admins. Everyone else starts as a student.
export function loadOrCreateProfile(firebaseUser, name) {
  return run(async () => {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      const email = firebaseUser.email.toLowerCase();
      const profile = {
        uid: firebaseUser.uid,
        name: name || firebaseUser.displayName || email.split('@')[0],
        email,
        role: ADMIN_EMAILS.includes(email) ? 'admin' : 'student',
        status: 'active',
        createdAt: now(),
        lastActiveAt: now(),
        usage: { date: todayKey(), count: 0 },
      };
      await setDoc(ref, profile);
      return profile;
    }

    const profile = snapshot.data();
    const lastActiveAt = now();
    if (profile.status === 'active') await updateDoc(ref, { lastActiveAt });
    return { ...profile, lastActiveAt };
  });
}

export function getUser(uid) {
  return run(async () => {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return snapshot.exists() ? snapshot.data() : null;
  });
}

export function updateUserName(uid, name) {
  return run(() => updateDoc(doc(db, 'users', uid), { name }));
}

// How many AI evaluations the user already used today.
export function usedToday(profile) {
  return profile?.usage?.date === todayKey() ? profile.usage.count : 0;
}

export function addUsage(profile) {
  const usage = { date: todayKey(), count: usedToday(profile) + 1 };
  return run(() => updateDoc(doc(db, 'users', profile.uid), { usage }));
}

/* ----- Admin: users ----- */

export function getAllUsers() {
  return run(async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((d) => d.data());
  });
}

// changes: { role } or { status } or { usage }
export function updateUserByAdmin(uid, changes) {
  return run(() => updateDoc(doc(db, 'users', uid), changes));
}

export function resetUserUsage(uid) {
  return updateUserByAdmin(uid, { usage: { date: todayKey(), count: 0 } });
}

// Firebase sends the email. The user picks a new password from the link.
export function sendPasswordReset(email) {
  return run(() => sendPasswordResetEmail(auth, email));
}

/* =========================================================
   Results
   ========================================================= */

export function saveResult(profile, result) {
  return run(async () => {
    const ref = await addDoc(collection(db, 'results'), {
      ...result,
      uid: profile.uid,
      userName: profile.name,
      userEmail: profile.email,
    });
    return ref.id;
  });
}

const newestFirst = (list) => [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export function getUserResults(uid) {
  return run(async () => {
    const snapshot = await getDocs(query(collection(db, 'results'), where('uid', '==', uid)));
    return newestFirst(listOf(snapshot));
  });
}

// Returns null when the result does not exist or belongs to someone else.
export async function getResult(id) {
  try {
    const snapshot = await getDoc(doc(db, 'results', id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    if (error?.code === 'permission-denied') return null;
    throw toAppError(error);
  }
}

export function getAllResults() {
  return run(async () => newestFirst(listOf(await getDocs(collection(db, 'results')))));
}

export function deleteUserResults(uid) {
  return run(async () => {
    const snapshot = await getDocs(query(collection(db, 'results'), where('uid', '==', uid)));
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return snapshot.size;
  });
}

/* =========================================================
   Simulations: built-in ones from the code + admin changes from Firestore
   ========================================================= */

export function getAllSimulations() {
  return run(async () => {
    const changes = {};
    (await getDocs(collection(db, 'simulations'))).docs.forEach((d) => {
      changes[d.id] = d.data();
    });

    const builtIn = SIMULATIONS.map((sim) => ({
      ...sim,
      ...(changes[sim.id] || {}),
      hidden: Boolean(changes[sim.id]?.hidden),
      isCustom: false,
      isChanged: Boolean(changes[sim.id]?.edited),
    }));

    const builtInIds = SIMULATIONS.map((s) => s.id);
    const custom = Object.entries(changes)
      .filter(([id, data]) => !builtInIds.includes(id) && data.title)
      .map(([id, data]) => ({ ...data, id, hidden: Boolean(data.hidden), isCustom: true }));

    return [...builtIn, ...custom];
  });
}

export async function getVisibleSimulations() {
  return (await getAllSimulations()).filter((sim) => !sim.hidden);
}

export async function getSimulationById(id) {
  return (await getAllSimulations()).find((sim) => sim.id === id) || null;
}

export function saveSimulation(simulation) {
  // An edited simulation is shown in the language the admin wrote it in.
  const { hidden, isCustom, isChanged, ...clean } = simulation;
  return run(() => setDoc(doc(db, 'simulations', clean.id), { ...clean, edited: true }, { merge: true }));
}

export function setSimulationHidden(id, hidden) {
  return run(() => setDoc(doc(db, 'simulations', id), { hidden }, { merge: true }));
}

// For a new simulation: deletes it. For a built-in one: removes the admin changes.
export function removeSimulationChanges(id) {
  return run(() => deleteDoc(doc(db, 'simulations', id)));
}

/* =========================================================
   Settings (anyone can read them, only admins can change them)
   ========================================================= */

export function getSettings() {
  return run(async () => {
    const snapshot = await getDoc(doc(db, 'settings', 'platform'));
    const data = snapshot.exists() ? snapshot.data() : {};
    return {
      ...DEFAULT_SETTINGS,
      ...data,
      announcement: { ...DEFAULT_SETTINGS.announcement, ...(data.announcement || {}) },
    };
  });
}

export function saveSettings(settings) {
  return run(() => setDoc(doc(db, 'settings', 'platform'), settings));
}

/* =========================================================
   Admin log
   ========================================================= */

// action is a translation key, for example 'log.blocked'.
export function logAdminAction(admin, action, target = '') {
  return run(() =>
    addDoc(collection(db, 'adminLog'), {
      adminUid: admin.uid,
      adminName: admin.name,
      action,
      target,
      createdAt: now(),
    })
  );
}

export function getAdminLog(count = 15) {
  return run(async () =>
    listOf(await getDocs(query(collection(db, 'adminLog'), orderBy('createdAt', 'desc'), limit(count))))
  );
}
