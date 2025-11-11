const GUEST_FLAG_KEY = 'guestMode';
const GUEST_RESUMES_KEY = 'guestResumes';

const getStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
};

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const makeGuestId = () => {
  const cryptoObj = (typeof window !== 'undefined' && window.crypto) || (typeof crypto !== 'undefined' && crypto);
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const isGuestSession = () => getStorage()?.getItem(GUEST_FLAG_KEY) === '1';

export const enableGuestSession = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(GUEST_FLAG_KEY, '1');
  if (!storage.getItem(GUEST_RESUMES_KEY)) {
    storage.setItem(GUEST_RESUMES_KEY, '[]');
  }
};

export const disableGuestSession = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(GUEST_FLAG_KEY);
};

export const clearGuestData = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(GUEST_FLAG_KEY);
  storage.removeItem(GUEST_RESUMES_KEY);
};

export const loadGuestResumes = () => {
  const storage = getStorage();
  if (!storage) return [];
  const raw = storage.getItem(GUEST_RESUMES_KEY);
  const parsed = parseJSON(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveGuestResumes = (resumes = []) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(GUEST_RESUMES_KEY, JSON.stringify(resumes));
};

export const upsertGuestResume = (resume) => {
  if (!resume) return null;
  const list = loadGuestResumes();
  const targetId = resume._id || makeGuestId();
  const nextResume = resume._id ? resume : { ...resume, _id: targetId };
  const idx = list.findIndex(r => r._id === targetId);
  if (idx >= 0) list[idx] = nextResume;
  else list.push(nextResume);
  saveGuestResumes(list);
  return nextResume;
};

export const createGuestResumeId = () => makeGuestId();
