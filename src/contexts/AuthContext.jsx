import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { signInWithGoogle, signInWithEmail, signOut as authSignOut } from '../utils/auth';
import { getVisitorId, clearVisitorCache } from '../utils/fingerprint';

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

    return () => subscription.unsubscribe();
  }, []);

  // Link auth user to visitor record
  const linkVisitor = async (authUser) => {
    try {
      const visitorId = await getVisitorId();
      await supabase.from('visitors').upsert({
        visitor_id: visitorId,
        auth_user_id: authUser.id,
        email: authUser.email,
        updated_at: new Date().toISOString()
      }, { onConflict: 'visitor_id' });
    } catch (error) {
      console.error('Error linking visitor:', error);
    }
  };

  const handleSignOut = async () => {
    await authSignOut();
    clearVisitorCache();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signOut: handleSignOut
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
