import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';

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
  const fileInputRef = useRef(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHelp, setTotalHelp] = useState(0);
  const [helpedByCategory, setHelpedByCategory] = useState({});
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const userPhone = localStorage.getItem('userPhone');

  useEffect(() => {
    loadProfile();
  }, []);

  const formatPhoneDisplay = (phone) => {
    if (!phone || phone.length < 11) return phone || '';
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9)}`;
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (!userPhone) {
        setLoading(false);
        return;
      }

      // Check if user has any paid payments
      const { data: payments } = await supabase
        .from('kaspi_payment_requests')
        .select('*')
        .eq('phone', userPhone)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (!payments || payments.length === 0) {
        // No paid payments — profile not activated
        setIsActivated(false);
        setLoading(false);
        return;
      }

      setIsActivated(true);

      // Load or create user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone', userPhone)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || formatPhoneDisplay(userPhone));
        setAvatarUrl(profile.avatar_url || '');
      } else {
        // Create profile with phone as default name
        const defaultName = formatPhoneDisplay(userPhone);
        await supabase.from('user_profiles').insert({
          phone: userPhone,
          display_name: defaultName,
          avatar_url: ''
        });
        setDisplayName(defaultName);
      }

      // Build donation data
      const beneficiaryIds = [...new Set(payments.map(p => p.beneficiary_id))];
      const { data: beneficiaries } = await supabase
        .from('beneficiaries')
        .select('id, category, image_url, title')
        .in('id', beneficiaryIds);

      const beneficiaryMap = {};
      (beneficiaries || []).forEach(b => { beneficiaryMap[b.id] = b; });

      const donationList = payments.map(p => ({
        id: p.id,
        beneficiaryId: p.beneficiary_id,
        name: p.beneficiary_title,
        amount: p.amount,
        category: beneficiaryMap[p.beneficiary_id]?.category || 'other',
        image: beneficiaryMap[p.beneficiary_id]?.image_url || '',
        date: p.created_at
      }));

      setTotalHelp(donationList.reduce((sum, d) => sum + d.amount, 0));

      const grouped = {};
      donationList.forEach(d => {
        if (!grouped[d.category]) grouped[d.category] = [];
        grouped[d.category].push(d);
      });
      setHelpedByCategory(grouped);
      setDonations(donationList);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim().slice(0, 20);
    if (!trimmed) return;
    setDisplayName(trimmed);
    setIsEditingName(false);
    await supabase
      .from('user_profiles')
      .update({ display_name: trimmed })
      .eq('phone', userPhone);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `avatars/${userPhone}_${Date.now()}.${ext}`;

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
        .eq('phone', userPhone);
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Ошибка загрузки фото');
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
      {/* Hidden file input for avatar */}
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

        {/* Menu button */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className='absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-10'
        >
          <Icon name="menu" size={20} className="text-[var(--text-primary)]" />
        </button>

        <div className='px-6 text-center'>
          {/* Avatar */}
          <div className='relative w-20 h-20 mx-auto -mt-14 mb-2'>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt='Avatar'
                className='w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg'
              />
            ) : (
              <div className='w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                <Icon name="user" size={32} className="text-gray-400" />
              </div>
            )}
            {isActivated ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className='absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--primary-color)] rounded-full flex items-center justify-center border-2 border-white'
              >
                {uploadingAvatar ? (
                  <Icon name="loader" size={12} className="text-white animate-spin" />
                ) : (
                  <Icon name="camera" size={12} className="text-white" />
                )}
              </button>
            ) : (
              <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white'>
                <Icon name="lock" size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Name */}
          {isActivated ? (
            <div className='flex items-center justify-center space-x-2 mb-2'>
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
                  <h1 className='text-xl font-bold text-[var(--text-primary)]'>{displayName}</h1>
                  <button
                    onClick={() => { setEditNameValue(displayName); setIsEditingName(true); }}
                    className='text-[var(--text-secondary)]'
                  >
                    <Icon name="pencil" size={16} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {!isActivated && (
                <p className='text-[10px] text-[var(--text-secondary)] mb-2'>Подтвердите аккаунт для добавления фото</p>
              )}
              <h1 className='text-xl font-bold text-[var(--text-primary)] mb-2'>Мой профиль</h1>
            </>
          )}

          {isActivated ? (
            <p className='text-sm text-[var(--text-secondary)]'>
              Помог на сумму: <span className='font-bold text-[var(--text-primary)]'>{totalHelp.toLocaleString()} ₸</span>
            </p>
          ) : (
            <p className='text-sm text-[var(--text-secondary)]'>
              Сделайте первое пожертвование
            </p>
          )}
        </div>
      </div>

      {/* Category Sections */}
      <div className='px-4 mt-6 space-y-6 pb-4'>
        {!isActivated ? (
          <div className='text-center py-8'>
            <Icon name="heart" size={48} className="text-gray-300 mx-auto mb-4" />
            <p className='text-[var(--text-secondary)] mb-4'>Здесь будет отображаться история вашей помощи</p>
            <button
              onClick={() => navigate('/')}
              className='btn-primary'
            >
              Перейти к подопечным
            </button>
          </div>
        ) : (
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
                        onClick={() => navigate('/')}
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
                            onClick={() => navigate(`/?beneficiary=${item.beneficiaryId}`)}
                          >
                            <div className='relative mb-2'>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className='w-32 h-32 object-cover rounded-2xl'
                                />
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
                              {item.amount.toLocaleString()} ₸
                            </p>
                          </div>
                        ))}
                        <div className='flex-shrink-0 w-10 h-32 flex items-center'>
                          <button
                            onClick={() => navigate('/')}
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
      </div>

      {/* More Menu Modal */}
      {showMoreMenu && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50'>
          <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-4 space-y-2'>
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

            <button
              onClick={() => {navigate('/admin-access'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="shield" size={20} className="text-[var(--primary-color)]" />
              <span>Админ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
