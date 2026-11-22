// Form validation helpers.
// Each function returns '' when the value is valid, or a translation key
// (or { key, vars } when the message needs numbers). Pages show it with t().

export const ANSWER_MIN = 100;
export const ANSWER_MAX = 3000;

export function validateName(name) {
  const value = name.trim();
  if (!value) return 'v.nameRequired';
  if (value.length < 2) return 'v.nameShort';
  if (value.length > 50) return 'v.nameLong';
  return '';
}

export function validateEmail(email) {
  const value = email.trim();
  if (!value) return 'v.emailRequired';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) return 'v.emailInvalid';
  return '';
}

// Firebase needs at least 6 characters. We also ask for a letter and a number.
export function validatePassword(password) {
  if (!password) return 'v.passwordRequired';
  if (password.length < 8) return 'v.passwordShort';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'v.passwordMix';
  return '';
}

export function validateConfirm(password, confirm) {
  if (!confirm) return 'v.confirmRequired';
  if (password !== confirm) return 'v.confirmMismatch';
  return '';
}

export function validateAnswer(answer) {
  const now = answer.trim().length;
  if (now === 0) return 'v.answerEmpty';
  if (now < ANSWER_MIN) return { key: 'v.answerShort', vars: { min: ANSWER_MIN, now } };
  if (now > ANSWER_MAX) return { key: 'v.answerLong', vars: { max: ANSWER_MAX, now } };
  return '';
}

// Turns a Firebase error code into a translation key.
export function firebaseMessage(error) {
  const keys = {
    'auth/email-already-in-use': 'fb.emailInUse',
    'auth/invalid-email': 'fb.invalidEmail',
    'auth/invalid-credential': 'fb.invalidCredential',
    'auth/wrong-password': 'fb.wrongPassword',
    'auth/user-not-found': 'fb.userNotFound',
    'auth/weak-password': 'fb.weakPassword',
    'auth/too-many-requests': 'fb.tooMany',
    'auth/network-request-failed': 'fb.network',
    'auth/requires-recent-login': 'fb.recentLogin',
  };
  return keys[error?.code] || 'fb.generic';
}
