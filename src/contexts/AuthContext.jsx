import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { signInWithGoogle, signInWithEmail, signOut as authSignOut } from '../utils/auth';
import { getVisitorId, clearVisitorCache } from '../utils/fingerprint';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) linkVisitor(currentUser);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) linkVisitor(currentUser);
    });

    // Handle deep links in native app (magic link / OAuth callback)
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('appUrlOpen', ({ url }) => {
        if (url.includes('access_token') || url.includes('token_hash')) {
          // Extract the hash/query from the URL and pass to Supabase
          const hashPart = url.split('#')[1] || url.split('?')[1];
          if (hashPart) {
            const params = new URLSearchParams(hashPart);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            }
          }
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  // Link auth user to visitor record
  const linkVisitor = async (authUser) => {
    try {
      const visitorId = await getVisitorId();

      // Get existing visitor record to preserve phone
      const { data: existing } = await supabase
        .from('visitors')
        .select('phone')
        .eq('visitor_id', visitorId)
        .single();

      const upsertData = {
        visitor_id: visitorId,
        auth_user_id: authUser.id,
        email: authUser.email,
        updated_at: new Date().toISOString()
      };

      // Preserve existing phone if present
      if (existing?.phone) {
        upsertData.phone = existing.phone;
      }

      await supabase.from('visitors').upsert(upsertData, { onConflict: 'visitor_id' });

      // Also link all other visitors with same phone to this auth_user_id
      if (existing?.phone) {
        await supabase
          .from('visitors')
          .update({ auth_user_id: authUser.id })
          .eq('phone', existing.phone)
          .is('auth_user_id', null);
      }
    } catch (error) {
      console.error('Error linking visitor:', error);
    }
  };

  const handleSignOut = async () => {
    await authSignOut();
    clearVisitorCache();
    setUser(null);
  };

  const deleteAccount = async () => {
    try {
      const visitorId = await getVisitorId();
      // Unlink auth from visitor records but keep data for analytics
      await supabase
        .from('visitors')
        .update({ auth_user_id: null, email: null })
        .eq('visitor_id', visitorId);
      // Sign out from Supabase auth
      await authSignOut();
      clearVisitorCache();
      localStorage.clear();
      setUser(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signOut: handleSignOut,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
