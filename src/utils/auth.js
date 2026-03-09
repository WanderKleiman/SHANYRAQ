import { supabase } from '../supabaseClient';
import { Capacitor } from '@capacitor/core';

const SITE_URL = 'https://shanyrak.world';

export async function signInWithGoogle() {
  const redirectTo = Capacitor.isNativePlatform()
    ? SITE_URL + '/profile'
    : window.location.origin + '/profile';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo }
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email) {
  const redirectTo = Capacitor.isNativePlatform()
    ? SITE_URL + '/profile'
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
