const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCacheKey(type, params = {}) {
  const paramString = Object.keys(params).length > 0 
    ? '_' + Object.entries(params).map(([k, v]) => `${k}_${v}`).join('_')
    : '';
  return `cache_${type}${paramString}`;
}

export function getCachedData(type, params = {}) {
  try {
    const key = getCacheKey(type, params);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function setCachedData(type, data, params = {}) {
  try {
    const key = getCacheKey(type, params);
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

export function clearCache(type = null) {
  try {
    if (type) {
      const prefix = `cache_${type}_`;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}