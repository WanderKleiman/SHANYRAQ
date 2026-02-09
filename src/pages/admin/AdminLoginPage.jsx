import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../utils/adminAuth';
import Icon from '../../components/Icon';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = login(username, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4'>
      <div className='w-full max-w-md'>
        <div className='card'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-4'>
              <Icon name="shield" size={32} className="text-white" />
            </div>
            <h1 className='text-2xl font-bold text-[var(--text-primary)]'>Админ-панель</h1>
            <p className='text-[var(--text-secondary)]'>Вход в систему управления</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm'>
                {error}
              </div>
            )}

            <div>
              <label className='block text-sm font-medium mb-2'>Логин</label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='form-input'
                placeholder='Введите логин'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Пароль</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='form-input'
                placeholder='Введите пароль'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='btn-primary w-full'
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <button
              onClick={() => navigate('/')}
              className='text-sm text-[var(--primary-color)] hover:underline'
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
