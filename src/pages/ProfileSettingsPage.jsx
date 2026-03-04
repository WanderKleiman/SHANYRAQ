import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';
import { getVisitorId } from '../utils/fingerprint';
import { useAuth } from '../contexts/AuthContext';

function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithEmail, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [totalHelp, setTotalHelp] = useState(0);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [phone, setPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const visitorId = await getVisitorId();

      // Collect all visitor_ids linked to this user
      let visitorIds = [visitorId];

      if (user) {
        const { data: linkedVisitors } = await supabase
          .from('visitors')
          .select('visitor_id')
          .eq('auth_user_id', user.id);

        if (linkedVisitors && linkedVisitors.length > 0) {
          visitorIds = [...new Set([visitorId, ...linkedVisitors.map(v => v.visitor_id)])];
        }
      }

      // Find phone from visitors table and merge by phone
      const { data: visitorRecord } = await supabase
        .from('visitors')
        .select('phone')
        .eq('visitor_id', visitorId)
        .single();

      if (visitorRecord?.phone) {
        const { data: phoneVisitors } = await supabase
          .from('visitors')
          .select('visitor_id')
          .eq('phone', visitorRecord.phone);

        if (phoneVisitors && phoneVisitors.length > 0) {
          visitorIds = [...new Set([...visitorIds, ...phoneVisitors.map(v => v.visitor_id)])];
        }

        const { data: phonePayments } = await supabase
          .from('kaspi_payment_requests')
          .select('visitor_id')
          .eq('phone', visitorRecord.phone);

        if (phonePayments && phonePayments.length > 0) {
          visitorIds = [...new Set([...visitorIds, ...phonePayments.map(v => v.visitor_id)])];
        }
      }

      const { data: payments } = await supabase
        .from('kaspi_payment_requests')
        .select('*')
        .in('visitor_id', visitorIds)
        .eq('status', 'paid');

      if (payments && payments.length > 0) {
        setIsVerified(true);
        setTotalHelp(payments.reduce((sum, p) => sum + p.amount, 0));
        const uniqueBeneficiaries = new Set(payments.map(p => p.beneficiary_id));
        setBeneficiaryCount(uniqueBeneficiaries.size);
        setPhone(payments[0].phone);
      }

      // Also check visitors table for updated phone
      const { data: visitor } = await supabase
        .from('visitors')
        .select('phone')
        .eq('visitor_id', visitorId)
        .single();

      if (visitor?.phone) {
        setPhone(visitor.phone);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneDisplay = (p) => {
    if (!p || p.length < 11) return p || '';
    return `+7 ${p.slice(1, 4)} ${p.slice(4, 7)} ${p.slice(7, 9)} ${p.slice(9)}`;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    setEditPhoneValue(value);
  };

  const handleSavePhone = async () => {
    if (editPhoneValue.length !== 11) {
      alert('Введите корректный номер телефона (11 цифр)');
      return;
    }

    try {
      const visitorId = await getVisitorId();
      await supabase.from('visitors').upsert({
        visitor_id: visitorId,
        phone: editPhoneValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'visitor_id' });

      setPhone(editPhoneValue);
      setIsEditingPhone(false);
    } catch (error) {
      console.error('Error saving phone:', error);
      alert('Ошибка сохранения');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin" />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => navigate('/profile')}
            className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <h1 className='text-xl font-bold'>Мой профиль</h1>
        </div>
      </header>

      <div className='p-4 space-y-4'>
        {/* Stats */}
        {isVerified && (
          <div className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
            <h2 className='text-sm font-semibold text-[var(--text-secondary)] mb-3 text-center'>Ваша помощь</h2>
            <div className='space-y-3'>
              <div className='flex flex-col items-center text-center'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1'>
                  <Icon name="heart" size={18} className="text-green-600" />
                </div>
                <p className='text-sm text-[var(--text-secondary)]'>Вы оказали помощь на</p>
                <p className='font-bold text-[var(--text-primary)]'>{totalHelp.toLocaleString()} ₸</p>
              </div>
              <div className='flex flex-col items-center text-center'>
                <div className='w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-1'>
                  <span className='text-xl'>❤️</span>
                </div>
                <p className='text-sm text-[var(--text-secondary)]'>Вы помогли</p>
                <p className='font-bold text-[var(--text-primary)]'>{beneficiaryCount} {beneficiaryCount === 1 ? 'подопечному' : 'подопечным'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Kaspi Phone */}
        <div className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
          <div className='flex items-center space-x-2 mb-3'>
            <img src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/png-klev-club-xxta-p-kaspii-logotip-png-10.png" alt="Kaspi" className="h-8 object-contain" />
            <h2 className='text-sm font-semibold text-[var(--text-secondary)]'>Номер для оплаты Kaspi</h2>
          </div>
          {isEditingPhone ? (
            <div className='space-y-3'>
              <input
                type='tel'
                value={editPhoneValue.length > 0 ? formatPhoneDisplay(editPhoneValue) : '+7'}
                onChange={handlePhoneChange}
                placeholder='+7'
                className='w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
                autoFocus
              />
              <div className='flex space-x-2'>
                <button
                  onClick={handleSavePhone}
                  className='flex-1 py-2 bg-[var(--primary-color)] text-white rounded-xl text-sm font-medium'
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setIsEditingPhone(false)}
                  className='flex-1 py-2 bg-gray-100 text-[var(--text-primary)] rounded-xl text-sm font-medium'
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                  <Icon name="phone" size={18} className="text-orange-600" />
                </div>
                <div>
                  {phone ? (
                    <>
                      <p className='font-medium text-[var(--text-primary)]'>{formatPhoneDisplay(phone)}</p>
                      {isVerified && <p className='text-xs text-green-600'>Верифицирован</p>}
                    </>
                  ) : (
                    <p className='text-sm text-[var(--text-secondary)]'>Не указан</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setEditPhoneValue(phone || ''); setIsEditingPhone(true); }}
                className='text-sm text-[var(--primary-color)] font-medium'
              >
                {phone ? 'Сменить' : 'Добавить'}
              </button>
            </div>
          )}
        </div>

        {/* Card placeholder */}
        <div className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
          <h2 className='text-sm font-semibold text-[var(--text-secondary)] mb-3'>Банковская карта</h2>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                <Icon name="credit-card" size={18} className="text-gray-400" />
              </div>
              <p className='text-sm text-[var(--text-secondary)]'>Не привязана</p>
            </div>
            <span className='text-xs text-[var(--text-secondary)] bg-gray-100 px-2 py-1 rounded-lg'>скоро</span>
          </div>
        </div>

        {/* Account / Auth */}
        <div className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
          <h2 className='text-sm font-semibold text-[var(--text-secondary)] mb-3'>Аккаунт</h2>
          {user ? (
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                  <Icon name="mail" size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className='font-medium text-[var(--text-primary)]'>{user.email}</p>
                  <p className='text-xs text-green-600'>Авторизован</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className='w-full py-2 bg-gray-100 text-red-500 rounded-xl text-sm font-medium'
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className='space-y-3'>
              <button
                onClick={async () => { setAuthLoading(true); try { await signInWithGoogle(); } catch(e) { console.error(e); } finally { setAuthLoading(false); }}}
                disabled={authLoading}
                className='w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white border border-gray-300 rounded-xl text-[var(--text-primary)] font-medium hover:bg-gray-50'
              >
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Войти через Google</span>
              </button>

              {!emailSent ? (
                <div className='space-y-2'>
                  <input
                    type='email'
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder='Введите email'
                    className='w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
                  />
                  <button
                    onClick={async () => {
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) { alert('Введите корректный email'); return; }
                      setAuthLoading(true);
                      try { await signInWithEmail(emailInput); setEmailSent(true); } catch(e) { alert('Ошибка отправки'); console.error(e); } finally { setAuthLoading(false); }
                    }}
                    disabled={authLoading}
                    className='w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 border border-gray-300 rounded-xl text-[var(--text-primary)] font-medium hover:bg-gray-50'
                  >
                    <Icon name="mail" size={20} />
                    <span>Войти через Email</span>
                  </button>
                </div>
              ) : (
                <div className='bg-green-50 border border-green-200 rounded-xl p-4'>
                  <p className='text-sm text-green-700'>Ссылка для входа отправлена на <span className='font-semibold'>{emailInput}</span></p>
                </div>
              )}
            </div>
          )}
        </div>

        {!isVerified && (
          <div className='text-center py-4'>
            <p className='text-sm text-[var(--text-secondary)] mb-3'>Сделайте первую оплату для верификации профиля</p>
            <button onClick={() => navigate('/')} className='btn-primary'>
              Помочь подопечным
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
