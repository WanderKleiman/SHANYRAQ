// Простая аутентификация для админ-панели
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'shanyrak2024' // Измените на свой пароль
};

export function login(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const user = {
      username,
      role: 'super_admin',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('adminUser', JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, error: 'Неверный логин или пароль' };
}

export function logout() {
  localStorage.removeItem('adminUser');
}

export function checkAuth() {
  const userStr = localStorage.getItem('adminUser');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user;
  } catch {
    return null;
  }
}
