import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';
import { getVisitorId } from '../utils/fingerprint';
import { useAuth } from '../contexts/AuthContext';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';



const openKaspiApp = async () => {
  if (Capacitor.isNativePlatform()) {
    // Try deep link to Kaspi app first
    window.location.href = 'kaspi://';
    // Fallback to website after short delay if app not installed
    setTimeout(() => {
      Browser.open({ url: 'https://kaspi.kz' });
    }, 1500);
  } else {
    window.open('https://kaspi.kz', '_blank');
  }
};

const CATEGORIES = [
  { key: 'children', name: 'Дети', icon: 'baby' },
  { key: 'urgent', name: 'Взрослые', icon: 'user' },
  { key: 'operations', name: 'Пожилые', icon: 'user-round' },
  { key: 'animals', name: 'Животные', icon: 'heart' },
  { key: 'social', name: 'Социальные программы', icon: 'users' },
  { key: 'non_material', name: 'Нематериальная помощь', icon: 'hand-helping' }
];

function ProfilePage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithEmail, signOut } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Profile state
  const [isActivated, setIsActivated] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Donation state
  const [totalHelp, setTotalHelp] = useState(0);
  const [helpedByCategory, setHelpedByCategory] = useState({});
  const [newRequests, setNewRequests] = useState([]);
  const [invoiceSentRequests, setInvoiceSentRequests] = useState([]);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouItems, setThankYouItems] = useState([]);
  const [profileTab, setProfileTab] = useState('collection');
  const [donationsList, setDonationsList] = useState([]);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const formatPhoneDisplay = (phone) => {
    if (!phone || phone.length < 11) return phone || '';
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9)}`;
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const visitorId = await getVisitorId();

      // Collect all visitor_ids linked to this user
      let visitorIds = [visitorId];

      // 1. Parallel: find linked visitors + current visitor phone
      const [linkedVisitorsResult, visitorRecordResult] = await Promise.all([
        user
          ? supabase.from('visitors').select('visitor_id').eq('auth_user_id', user.id)
          : Promise.resolve({ data: null }),
        supabase.from('visitors').select('phone').eq('visitor_id', visitorId).single()
      ]);

      const linkedVisitors = linkedVisitorsResult.data;
      if (linkedVisitors && linkedVisitors.length > 0) {
        visitorIds = [...new Set([visitorId, ...linkedVisitors.map(v => v.visitor_id)])];
      }

      const { data: visitorRecord } = visitorRecordResult;

      let currentPhone = visitorRecord?.phone;

      // Fallback: get phone from most recent payment by this visitor_id
      if (!currentPhone) {
        const { data: recentPayment } = await supabase
          .from('kaspi_payment_requests')
          .select('phone')
          .eq('visitor_id', visitorId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (recentPayment?.phone) currentPhone = recentPayment.phone;
      }

      // 3. If phone found, find all visitor_ids that used this phone (parallel)
      if (currentPhone) {
        const [{ data: phoneVisitors }, { data: phonePayments }] = await Promise.all([
          supabase.from('visitors').select('visitor_id').eq('phone', currentPhone),
          supabase.from('kaspi_payment_requests').select('visitor_id').eq('phone', currentPhone)
        ]);

        if (phoneVisitors && phoneVisitors.length > 0) {
          visitorIds = [...new Set([...visitorIds, ...phoneVisitors.map(v => v.visitor_id)])];
        }
        if (phonePayments && phonePayments.length > 0) {
          visitorIds = [...new Set([...visitorIds, ...phonePayments.map(v => v.visitor_id)])];
        }
      }

      // Query by visitor_id AND by phone (visitor_id can be null for old/cached records)
      const queries = [
        supabase
          .from('kaspi_payment_requests')
          .select('*')
          .in('visitor_id', visitorIds)
          .order('created_at', { ascending: false }),
      ];
      if (currentPhone) {
        queries.push(
          supabase
            .from('kaspi_payment_requests')
            .select('*')
            .eq('phone', currentPhone)
            .order('created_at', { ascending: false })
        );
      }
      const results = await Promise.all(queries);
      const merged = new Map();
      results.forEach(r => (r.data || []).forEach(p => merged.set(p.id, p)));
      const allPayments = [...merged.values()].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      if (allPayments.length === 0) {
        setLoading(false);
        return;
      }

      const paidPayments = allPayments.filter(p => p.status === 'paid');

      // Show "Спасибо" only when admin confirms payment (status changed to 'paid')
      // Compare current paid IDs with previously known paid IDs
      const knownPaidIds = JSON.parse(localStorage.getItem('knownPaidIds') || 'null');
      const currentPaidIds = paidPayments.map(p => p.id);
      if (knownPaidIds === null) {
        // First time — just save current state, don't show popup
        localStorage.setItem('knownPaidIds', JSON.stringify(currentPaidIds));
      } else {
        const newlyPaid = currentPaidIds.filter(id => !knownPaidIds.includes(id));
        if (newlyPaid.length > 0) {
          const items = paidPayments.filter(p => newlyPaid.includes(p.id));
          // Fetch beneficiary images for thank you popup
          const benIds = [...new Set(items.map(p => p.beneficiary_id))];
          const { data: benImages } = await supabase
            .from('beneficiaries')
            .select('id, image_url')
            .in('id', benIds);
          const imgMap = {};
          (benImages || []).forEach(b => { imgMap[b.id] = b.image_url; });
          setThankYouItems(items.map(p => ({ ...p, beneficiary_image: imgMap[p.beneficiary_id] || '' })));
          setShowThankYou(true);
        }
        localStorage.setItem('knownPaidIds', JSON.stringify(currentPaidIds));
      }
      const now = new Date();
      const is24hOld = (dateStr) => (now - new Date(dateStr)) > 24 * 60 * 60 * 1000;
      const newRequests = allPayments.filter(p => p.status === 'new' && !is24hOld(p.created_at));
      const invoiceSent = allPayments.filter(p => p.status === 'invoice_sent' && !is24hOld(p.created_at));

      // Fetch beneficiary images for pending requests
      const pendingAll = [...newRequests, ...invoiceSent];
      if (pendingAll.length > 0) {
        const pendingBenIds = [...new Set(pendingAll.map(p => p.beneficiary_id))];
        const { data: pendingBens } = await supabase
          .from('beneficiaries')
          .select('id, image_url')
          .in('id', pendingBenIds);

        const benImageMap = {};
        (pendingBens || []).forEach(b => { benImageMap[b.id] = b.image_url; });

        const addImage = (p) => ({ ...p, beneficiary_image: benImageMap[p.beneficiary_id] || '' });
        setNewRequests(newRequests.map(addImage));
        setInvoiceSentRequests(invoiceSent.map(addImage));
      } else {
        setNewRequests([]);
        setInvoiceSentRequests([]);
      }

      const hasPaid = paidPayments.length > 0;
      setIsActivated(hasPaid);

      if (hasPaid) {
        // Use phone from the paid payment (verified phone)
        const vPhone = paidPayments[0].phone;
        setVerifiedPhone(vPhone);

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('phone', vPhone)
          .single();

        // Prefer Google auth name over phone number
        const googleName = user?.user_metadata?.full_name;

        if (profile) {
          // If profile has phone as name but Google name exists — update it
          const profileName = profile.display_name;
          const isPhoneName = profileName && /^\+?\d[\d\s]+$/.test(profileName.replace(/\s/g, ''));
          if (isPhoneName && googleName) {
            await supabase.from('user_profiles').update({ display_name: googleName }).eq('phone', vPhone);
            setDisplayName(googleName);
          } else {
            setDisplayName(profileName || googleName || formatPhoneDisplay(vPhone));
          }
          setAvatarUrl(profile.avatar_url || '');
        } else {
          const defaultName = googleName || formatPhoneDisplay(vPhone);
          await supabase.from('user_profiles').insert({
            phone: vPhone,
            display_name: defaultName,
            avatar_url: ''
          });
          setDisplayName(defaultName);
        }

        const beneficiaryIds = [...new Set(paidPayments.map(p => p.beneficiary_id))];
        const { data: beneficiaries } = await supabase
          .from('beneficiaries')
          .select('id, category, image_url, title, collection_status')
          .in('id', beneficiaryIds);

        const beneficiaryMap = {};
        (beneficiaries || []).forEach(b => { beneficiaryMap[b.id] = b; });

        const donationList = paidPayments.map(p => ({
          id: p.id,
          beneficiaryId: p.beneficiary_id,
          name: p.beneficiary_title,
          amount: p.amount,
          category: beneficiaryMap[p.beneficiary_id]?.category || 'other',
          image: beneficiaryMap[p.beneficiary_id]?.image_url || '',
          collectionStatus: beneficiaryMap[p.beneficiary_id]?.collection_status || 'active',
          date: p.created_at
        }));

        setDonationsList(donationList);
        setTotalHelp(donationList.reduce((sum, d) => sum + d.amount, 0));

        const grouped = {};
        donationList.forEach(d => {
          if (!grouped[d.category]) grouped[d.category] = [];
          grouped[d.category].push(d);
        });
        setHelpedByCategory(grouped);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const [hasEditedName, setHasEditedName] = useState(() => localStorage.getItem('hasEditedName') === 'true');

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim().slice(0, 20);
    if (!trimmed) return;
    setDisplayName(trimmed);
    setIsEditingName(false);
    setHasEditedName(true);
    localStorage.setItem('hasEditedName', 'true');
    await supabase
      .from('user_profiles')
      .update({ display_name: trimmed })
      .eq('phone', verifiedPhone);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || (!isActivated && !user)) return;

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const ownerId = verifiedPhone || user?.id || 'unknown';
      const fileName = `avatars/${ownerId}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('phone', verifiedPhone);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Ошибка загрузки фото');
    } finally {
      setUploadingAvatar(false);
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
    <div className='min-h-screen bg-white'>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleAvatarUpload}
      />

      {/* Profile Header */}
      <div className='relative'>
        <div className='relative h-48 overflow-hidden mb-4' style={{ clipPath: 'ellipse(80% 100% at 50% 0%)' }}>
          <img
            src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/ae0b6fde-54ab-4b26-a878-98c220206cb8-2.png'
            alt='Profile background'
            className='w-full h-full object-cover'
          />
        </div>

        <button
          onClick={() => setShowMoreMenu(true)}
          className='absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-10'
        >
          <Icon name="menu" size={20} className="text-[var(--text-primary)]" />
        </button>

        <div className='px-6 text-center'>
          {/* Avatar */}
          <div className='relative w-20 h-20 mx-auto -mt-14 mb-2'>
            {(isActivated || user) ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className='w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg block'
              >
                {avatarUrl || user?.user_metadata?.avatar_url ? (
                  <img src={avatarUrl || user?.user_metadata?.avatar_url} alt='Avatar' className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                    {uploadingAvatar ? (
                      <Icon name="loader" size={24} className="text-gray-400 animate-spin" />
                    ) : (
                      <Icon name="camera" size={24} className="text-gray-400" />
                    )}
                  </div>
                )}
              </button>
            ) : (
              <div className='w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                <Icon name="user" size={32} className="text-gray-400" />
              </div>
            )}
            {(isActivated || user) && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className='absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--primary-color)] rounded-full flex items-center justify-center border-2 border-white'
              >
                <Icon name="camera" size={12} className="text-white" />
              </button>
            )}
            {(!isActivated && !user) && (
              <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white'>
                <Icon name="lock" size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Name */}
          {(isActivated || user) ? (
            <div className='mb-2'>
              <div className='flex items-center justify-center space-x-2'>
                {isEditingName ? (
                  <div className='flex items-center space-x-2'>
                    <input
                      type='text'
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value.slice(0, 20))}
                      className='text-xl font-bold text-center border-b-2 border-[var(--primary-color)] outline-none bg-transparent w-48'
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <button onClick={handleSaveName} className='text-[var(--primary-color)]'>
                      <Icon name="check" size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1
                      className='text-xl font-bold text-[var(--text-primary)] cursor-pointer'
                      onClick={() => { setEditNameValue(displayName || user?.user_metadata?.full_name || ''); setIsEditingName(true); }}
                    >
                      {displayName || user?.user_metadata?.full_name || user?.email || 'Мой профиль'}
                    </h1>
                    {!hasEditedName && (
                      <button
                        onClick={() => { setEditNameValue(displayName || user?.user_metadata?.full_name || ''); setIsEditingName(true); }}
                        className='text-[var(--text-secondary)]'
                      >
                        <Icon name="pencil" size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
              {user && !isActivated && (
                <p className='text-xs text-green-600 mt-1'>Авторизован через {user.app_metadata?.provider === 'google' ? 'Google' : 'Email'}</p>
              )}
            </div>
          ) : (
            <>
              <h1 className='text-xl font-bold text-[var(--text-primary)] mb-2'>Мой профиль</h1>
              {newRequests.length === 0 && invoiceSentRequests.length === 0 && (
                <p className='text-sm text-[var(--text-secondary)]'>Сделайте первое пожертвование</p>
              )}
            </>
          )}

          {isActivated && (
            <p className='text-sm text-[var(--text-secondary)]'>
              Помог на сумму: <span className='font-bold text-[var(--text-primary)]'>{totalHelp.toLocaleString("ru-RU")} ₸</span>
            </p>
          )}
        </div>
      </div>

      {/* New requests — forming invoice */}
      {newRequests.length > 0 && (
        <div className='px-4 mt-6'>
          <h2 className='text-lg font-semibold text-[var(--text-primary)] mb-3'>Формируется счёт</h2>
          <div className='space-y-3'>
            {newRequests.map(req => (
              <div key={req.id} className='bg-orange-50 rounded-2xl p-4 border border-orange-200'>
                <div className='flex items-center space-x-3'>
                  {req.beneficiary_image ? (
                    <img
                      src={req.beneficiary_image}
                      alt={req.beneficiary_title}
                      className='w-12 h-12 rounded-xl object-cover flex-shrink-0'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0'>
                      <Icon name="user" size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-[var(--text-primary)] text-sm truncate'>{req.beneficiary_title}</p>
                    <p className='font-bold text-[var(--text-primary)]'>{req.amount?.toLocaleString("ru-RU")} ₸</p>
                  </div>
                  <div className='flex-shrink-0'>
                    <span className='text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-lg'>Формируется</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice sent requests */}
      {invoiceSentRequests.length > 0 && (
        <div className='px-4 mt-6'>
          <h2 className='text-lg font-semibold text-[var(--text-primary)] mb-3'>Ожидают оплаты</h2>
          <div className='space-y-3'>
            {invoiceSentRequests.map(req => (
              <div key={req.id} className='bg-green-50 rounded-2xl p-4 border border-green-200'>
                <div className='flex items-center space-x-3 mb-3'>
                  {/* Beneficiary avatar */}
                  {req.beneficiary_image ? (
                    <img
                      src={req.beneficiary_image}
                      alt={req.beneficiary_title}
                      className='w-12 h-12 rounded-xl object-cover flex-shrink-0'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0'>
                      <Icon name="user" size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-[var(--text-primary)] text-sm truncate'>{req.beneficiary_title}</p>
                    <p className='font-bold text-[var(--text-primary)]'>{req.amount?.toLocaleString("ru-RU")} ₸</p>
                  </div>
                </div>
                <button
                  onClick={openKaspiApp}
                  className='flex items-center justify-center w-full py-3 bg-green-500 text-white rounded-xl text-sm font-medium'
                >
                  Счёт выставлен, оплатить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Sections */}
      <div className='px-4 mt-6 space-y-6 pb-4'>
        {!isActivated && invoiceSentRequests.length === 0 && newRequests.length === 0 ? (
          <div className='text-center py-8'>
            <Icon name="heart" size={48} className="text-gray-300 mx-auto mb-4" />
            <p className='text-[var(--text-secondary)] mb-4'>У вас пока нет подтверждённых пожертвований</p>
            <button onClick={() => navigate('/')} className='btn-primary mb-6'>
              Помочь подопечным
            </button>

            {!user && (
              <div className='mt-4 space-y-3'>
                <p className='text-sm text-[var(--text-secondary)] mb-2'>Или войдите в аккаунт</p>
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
                      className='w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-center'
                    />
                    <button
                      onClick={async () => {
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) { toast.error('Введите корректный email'); return; }
                        setAuthLoading(true);
                        try { await signInWithEmail(emailInput); setEmailSent(true); } catch(e) { toast.error('Ошибка отправки'); console.error(e); } finally { setAuthLoading(false); }
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
                    <p className='text-sm text-green-700'>Ссылка для входа отправлена на <span className='font-semibold'>{emailInput}</span>. Проверьте почту!</p>
                  </div>
                )}
              </div>
            )}

            {user && (
              <div className='mt-4 bg-green-50 border border-green-200 rounded-xl p-4'>
                <p className='text-sm text-green-700'>Вы вошли как <span className='font-semibold'>{user.email}</span></p>
              </div>
            )}
          </div>
        ) : isActivated && (
          <>
            {/* Tab switcher */}
            <div className='flex rounded-xl overflow-hidden border border-[var(--border-color)]'>
              {[
                { key: 'collection', label: 'Ваши подопечные' },
                { key: 'statuses', label: 'Статусы помощи' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setProfileTab(tab.key)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    profileTab === tab.key
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] bg-[var(--bg-primary)]'
                  }`}
                  style={profileTab === tab.key ? { background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)' } : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Ваши подопечные */}
            {profileTab === 'collection' && (
              CATEGORIES.map(cat => {
                const items = helpedByCategory[cat.key] || [];
                return (
                  <div key={cat.key}>
                    <div className='flex items-center space-x-2 mb-3'>
                      <Icon name={cat.icon} size={18} className="text-[var(--primary-color)]" />
                      <h2 className='text-lg font-semibold text-[var(--text-primary)]'>{cat.name}</h2>
                    </div>

                    <div className='overflow-x-auto scrollbar-hide'>
                      <div className='flex space-x-3 items-start'>
                        {items.length === 0 ? (
                          <button
                            onClick={() => navigate(`/feed?category=${cat.key}`)}
                            className='border-2 border-dashed border-gray-300 rounded-2xl bg-green-50 flex-shrink-0 w-32 h-32 flex items-center justify-center'
                          >
                            <div className='flex flex-col items-center text-center px-2'>
                              <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2'>
                                <Icon name="plus" size={18} className="text-[var(--primary-color)]" />
                              </div>
                              <p className='text-xs text-[var(--text-secondary)] leading-tight'>Добавьте подопечных</p>
                            </div>
                          </button>
                        ) : (
                          <>
                            {items.map(item => (
                              <div
                                key={item.id}
                                className='cursor-pointer flex-shrink-0 w-32'
                                onClick={() => navigate(`/feed?beneficiary=${item.beneficiaryId}`)}
                              >
                                <div className='relative mb-2'>
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className='w-32 h-32 object-cover rounded-2xl' />
                                  ) : (
                                    <div className='w-32 h-32 bg-gray-200 rounded-2xl flex items-center justify-center'>
                                      <Icon name="user" size={24} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <h3 className='text-xs font-medium text-[var(--text-primary)] mb-1 line-clamp-2'>
                                  {item.name}
                                </h3>
                                <p className='text-xs font-bold text-[var(--text-primary)]'>
                                  {item.amount.toLocaleString("ru-RU")} ₸
                                </p>
                              </div>
                            ))}
                            <div className='flex-shrink-0 w-10 h-32 flex items-center'>
                              <button
                                onClick={() => navigate('/feed')}
                                className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'
                              >
                                <Icon name="plus" size={18} className="text-green-600" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Tab: Статусы помощи */}
            {profileTab === 'statuses' && (() => {
              // Deduplicate by beneficiaryId, sum amounts
              const uniqueMap = {};
              donationsList.forEach(d => {
                if (!uniqueMap[d.beneficiaryId]) {
                  uniqueMap[d.beneficiaryId] = { ...d, totalAmount: d.amount };
                } else {
                  uniqueMap[d.beneficiaryId].totalAmount += d.amount;
                }
              });
              const uniqueDonations = Object.values(uniqueMap);

              const STATUS_STEPS = [
                { label: 'Сбор', icon: null },
                { label: 'Завершён', icon: null },
                { label: 'Помощь', icon: null },
                { label: 'Отчёт', icon: 'heart' },
              ];

              const getActiveSteps = (status) => {
                if (status === 'reported') return 4;
                if (status === 'completed') return 3;
                return 1; // active
              };

              return uniqueDonations.length === 0 ? (
                <div className='text-center py-8'>
                  <Icon name="activity" size={32} className="text-gray-300 mx-auto mb-4" />
                  <p className='text-[var(--text-secondary)]'>Нет данных о статусах</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {uniqueDonations.map(item => {
                    const activeSteps = getActiveSteps(item.collectionStatus);
                    return (
                      <div
                        key={item.beneficiaryId}
                        className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'
                      >
                        {/* Beneficiary info */}
                        <div
                          className='flex items-center space-x-3 mb-4 cursor-pointer'
                          onClick={() => navigate(`/feed?beneficiary=${item.beneficiaryId}`)}
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} className='w-11 h-11 rounded-xl object-cover flex-shrink-0' />
                          ) : (
                            <div className='w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0'>
                              <Icon name="user" size={18} className="text-gray-400" />
                            </div>
                          )}
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-semibold text-[var(--text-primary)] truncate'>{item.name}</h3>
                            <p className='text-xs font-bold text-[var(--primary-color)]'>{item.totalAmount.toLocaleString('ru-RU')} ₸</p>
                          </div>
                        </div>

                        {/* Status tracker */}
                        <div className='relative'>
                          {/* Line */}
                          <div className='absolute top-3 left-3 right-3 h-0.5 bg-gray-200' />
                          <div
                            className='absolute top-3 left-3 h-0.5'
                            style={{
                              width: `${((activeSteps - 1) / 3) * 100}%`,
                              maxWidth: 'calc(100% - 24px)',
                              background: 'linear-gradient(90deg, #1e6b4e, #5ec49a)'
                            }}
                          />

                          {/* Steps */}
                          <div className='relative flex justify-between'>
                            {STATUS_STEPS.map((step, i) => {
                              const isActive = i < activeSteps;
                              const isCurrent = i === activeSteps - 1;
                              return (
                                <div key={i} className='flex flex-col items-center' style={{ width: '25%' }}>
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                                      isActive
                                        ? 'text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    } ${isCurrent ? 'ring-2 ring-offset-1 ring-green-300' : ''}`}
                                    style={isActive ? { background: 'linear-gradient(135deg, #1e6b4e, #5ec49a)' } : undefined}
                                  >
                                    {step.icon && isActive ? (
                                      <Icon name={step.icon} size={12} className="text-white" />
                                    ) : isActive ? (
                                      <Icon name="check" size={12} className="text-white" />
                                    ) : (
                                      <div className='w-2 h-2 rounded-full bg-gray-400' />
                                    )}
                                  </div>
                                  <span className={`text-[10px] mt-1.5 text-center leading-tight ${
                                    isActive ? 'text-[var(--primary-color)] font-semibold' : 'text-gray-400'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Report link */}
                        {item.collectionStatus === 'reported' && (
                          <button
                            onClick={() => navigate('/reports')}
                            className='mt-3 w-full text-center text-xs font-semibold text-[var(--primary-color)] bg-green-50 rounded-xl py-2'
                          >
                            Смотреть отчёт
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Thank You Popup */}
      {showThankYou && (
        <div
          className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
          onClick={() => setShowThankYou(false)}
        >
          <div className='bg-white rounded-3xl p-8 max-w-sm w-full text-center' onClick={e => e.stopPropagation()}>
            <img
              src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/Group%20270988349.jpg'
              alt='Спасибо'
              className='w-32 h-32 mx-auto mb-6'
            />
            <h2 className='text-2xl font-bold mb-3'>Спасибо!</h2>
            <p className='text-gray-600 mb-4'>Ваш платёж подтверждён. Вы помогли:</p>

            <div className='space-y-2 mb-5'>
              {thankYouItems.map(item => (
                <div key={item.id} className='flex items-center space-x-3 bg-green-50 rounded-xl p-3 text-left'>
                  {item.beneficiary_image ? (
                    <img src={item.beneficiary_image} alt='' className='w-10 h-10 rounded-lg object-cover flex-shrink-0' />
                  ) : (
                    <div className='w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0'>
                      <Icon name="heart" size={16} className="text-[var(--primary-color)]" />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-[var(--text-primary)] truncate'>{item.beneficiary_title}</p>
                    <p className='text-sm font-bold text-[var(--primary-color)]'>{item.amount?.toLocaleString('ru-RU')} ₸</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowThankYou(false)}
              className='bg-[var(--primary-color)] text-white w-full py-4 rounded-2xl font-semibold text-lg'
            >
              Отлично!
            </button>
          </div>
        </div>
      )}

      {/* More Menu Modal */}
      {showMoreMenu && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50' onClick={() => setShowMoreMenu(false)}>
          <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-4 space-y-2' onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Дополнительно</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <button
              onClick={() => {navigate('/profile/settings'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="settings" size={20} className="text-[var(--primary-color)]" />
              <span>Мой профиль</span>
            </button>

            <button
              onClick={() => {navigate('/about'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="info" size={20} className="text-[var(--primary-color)]" />
              <span>О фонде "Шанырак"</span>
            </button>

            <button
              onClick={() => {navigate('/partner-funds'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="users" size={20} className="text-[var(--primary-color)]" />
              <span>Фонды партнеры</span>
            </button>

            <button
              onClick={() => {navigate('/documents'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="file-text" size={20} className="text-[var(--primary-color)]" />
              <span>Документы</span>
            </button>

            <button
              onClick={() => {navigate('/contacts'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="phone" size={20} className="text-[var(--primary-color)]" />
              <span>Контакты</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
