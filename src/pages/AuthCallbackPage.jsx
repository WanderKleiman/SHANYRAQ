import React, { useEffect } from 'react';
import Icon from '../components/Icon';

export default function AuthCallbackPage() {
  useEffect(() => {
    // Get the full URL with tokens from hash
    const hash = window.location.hash;
    if (hash) {
      // Try to redirect to app with tokens
      const appUrl = `shanyrak://auth${hash}`;
      window.location.href = appUrl;
    }

    // Fallback: if app doesn't open in 2 seconds, redirect to profile on web
    const timeout = setTimeout(() => {
      window.location.href = '/profile';
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-white'>
      <div className='text-center'>
        <Icon name="loader" size={32} className="text-[var(--primary-color)] animate-spin mx-auto mb-4" />
        <p className='text-[var(--text-secondary)]'>Авторизация...</p>
      </div>
    </div>
  );
}
