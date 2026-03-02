import FingerprintJS from '@fingerprintjs/fingerprintjs';

const STORAGE_KEY = 'visitorId';
let cachedVisitorId = null;

export async function getVisitorId() {
  if (cachedVisitorId) return cachedVisitorId;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    cachedVisitorId = stored;
    return stored;
  }

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedVisitorId = result.visitorId;
  localStorage.setItem(STORAGE_KEY, cachedVisitorId);
  return cachedVisitorId;
}
