import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';
import { getVisitorId } from '../utils/fingerprint';

const KASPI_LOGO = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/png-klev-club-xxta-p-kaspii-logotip-png-10.png';

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
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
      const visitorId = await getVisitorId();

      const { data: allPayments } = await supabase
        .from('kaspi_payment_requests')
        .select('*')
        .eq('visitor_id', visitorId)
        .order('created_at', { ascending: false });

      if (!allPayments || allPayments.length === 0) {
        setLoading(false);
        return;
      }

      const paidPayments = allPayments.filter(p => p.status === 'paid');
      const newRequests = allPayments.filter(p => p.status === 'new');
      const invoiceSent = allPayments.filter(p => p.status === 'invoice_sent');

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
        const verifiedPhone = vPhone;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('phone', verifiedPhone)
          .single();

        if (profile) {
          setDisplayName(profile.display_name || formatPhoneDisplay(verifiedPhone));
          setAvatarUrl(profile.avatar_url || '');
        } else {
          const defaultName = formatPhoneDisplay(verifiedPhone);
          await supabase.from('user_profiles').insert({
            phone: verifiedPhone,
            display_name: defaultName,
            avatar_url: ''
          });
          setDisplayName(defaultName);
        }

        const beneficiaryIds = [...new Set(paidPayments.map(p => p.beneficiary_id))];
        const { data: beneficiaries } = await supabase
          .from('beneficiaries')
          .select('id, category, image_url, title')
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
          date: p.created_at
        }));

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

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim().slice(0, 20);
    if (!trimmed) return;
    setDisplayName(trimmed);
    setIsEditingName(false);
    await supabase
      .from('user_profiles')
      .update({ display_name: trimmed })
      .eq('phone', verifiedPhone);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !isActivated) return;

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `avatars/${verifiedPhone}_${Date.now()}.${ext}`;

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
            {isActivated ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className='w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg block'
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt='Avatar' className='w-full h-full object-cover' />
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
            {isActivated && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className='absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--primary-color)] rounded-full flex items-center justify-center border-2 border-white'
              >
                <Icon name="camera" size={12} className="text-white" />
              </button>
            )}
            {!isActivated && (
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
              <h1 className='text-xl font-bold text-[var(--text-primary)] mb-2'>Мой профиль</h1>
              {newRequests.length === 0 && invoiceSentRequests.length === 0 && (
                <p className='text-sm text-[var(--text-secondary)]'>Сделайте первое пожертвование</p>
              )}
            </>
          )}

          {isActivated && (
            <p className='text-sm text-[var(--text-secondary)]'>
              Помог на сумму: <span className='font-bold text-[var(--text-primary)]'>{totalHelp.toLocaleString()} ₸</span>
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
                    <p className='font-bold text-[var(--text-primary)]'>{req.amount?.toLocaleString()} ₸</p>
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
                    <p className='font-bold text-[var(--text-primary)]'>{req.amount?.toLocaleString()} ₸</p>
                  </div>
                </div>
                <a
                  href='https://kaspi.kz'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-center w-full py-3 bg-green-500 text-white rounded-xl text-sm font-medium'
                >
                  Счёт выставлен, оплатить
                </a>
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
            <button onClick={() => navigate('/')} className='btn-primary'>
              Помочь подопечным
            </button>
          </div>
        ) : isActivated && (
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
