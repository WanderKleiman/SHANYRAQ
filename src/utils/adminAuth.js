import { supabase } from '../supabaseClient';

// Admin emails allowed to access admin panel
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: 'Неверный логин или пароль' };
  }

  const userEmail = data.user?.email;
  if (!ADMIN_EMAILS.includes(userEmail)) {
    await supabase.auth.signOut();
    return { success: false, error: 'У вас нет прав администратора' };
  }

  const user = {
    id: data.user.id,
    email: userEmail,
    role: 'super_admin',
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('adminUser', JSON.stringify(user));
  return { success: true, user };
}

export function logout() {
  localStorage.removeItem('adminUser');
  supabase.auth.signOut();
}

export async function checkAuth() {
  const userStr = localStorage.getItem('adminUser');
  if (!userStr) return null;

  try {
    const stored = JSON.parse(userStr);
    // Verify session is still valid
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !ADMIN_EMAILS.includes(session.user?.email)) {
      localStorage.removeItem('adminUser');
      return null;
    }
    return stored;
  } catch {
    localStorage.removeItem('adminUser');
    return null;
  }
}
