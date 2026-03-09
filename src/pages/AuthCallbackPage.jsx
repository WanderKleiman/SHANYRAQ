import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
      // Extract tokens and set session
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        }).then(() => {
          // Try to open the native app
          window.location.href = `shanyrak://auth${hash}`;
          // Fallback: redirect to profile on web after 1.5s
          setTimeout(() => navigate('/profile', { replace: true }), 1500);
        });
        return;
      }
    }

    // No tokens — just go to profile
    navigate('/profile', { replace: true });
  }, [navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-white'>
      <div className='text-center'>
        <Icon name="loader" size={32} className="text-[var(--primary-color)] animate-spin mx-auto mb-4" />
        <p className='text-[var(--text-secondary)]'>Авторизация...</p>
      </div>
    </div>
  );
}
