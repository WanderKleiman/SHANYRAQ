import { supabase } from '../supabaseClient';
import { Capacitor } from '@capacitor/core';

const SITE_URL = 'https://shanyrak.world';

export async function signInWithGoogle() {
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: SITE_URL + '/auth-callback',
        skipBrowserRedirect: true
      }
    });
    if (error) throw error;
    if (data?.url) {
      await Browser.open({ url: data.url, presentationStyle: 'popover' });
    }
    return data;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/profile' }
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email) {
  const redirectTo = Capacitor.isNativePlatform()
    ? SITE_URL + '/auth-callback'
    : window.location.origin + '/profile';

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}
