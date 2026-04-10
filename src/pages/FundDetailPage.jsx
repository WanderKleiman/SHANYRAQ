import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import CharityCard from '../components/CharityCard';
import CharityModal from '../components/CharityModal';
import Icon from '../components/Icon';
import { optimizeImage } from '../utils/imageUtils';
import { getCategoryName } from '../utils/charityData';

function FundDetailPage() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [fund, setFund] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const descRef = useRef(null);

  // Subscription state
  const [subAmount, setSubAmount] = useState(3000);
  const [customSubAmount, setCustomSubAmount] = useState('');
  const [showSubModal, setShowSubModal] = useState(false);
  const [subPhone, setSubPhone] = useState('');
  const [subStep, setSubStep] = useState('method'); // 'method' | 'kaspi' | 'done'
  const SUB_PRESETS = [1000, 3000, 5000, 10000];

  useEffect(() => {
    async function loadData() {
      try {
        const { data: fundData, error: fundError } = await supabase
          .from('partner_funds')
          .select('*')
          .eq('name', decodeURIComponent(name))
          .single();

        if (fundError) throw fundError;
        setFund(fundData);

        const { data: beneficiariesData, error: beneficiariesError } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('partner_fund', decodeURIComponent(name))
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (beneficiariesError) throw beneficiariesError;

        const formatted = beneficiariesData.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          categoryName: getCategoryName(item.category),
          partnerFund: item.partner_fund,
          image: item.image_url,
          images: item.images || [item.image_url],
          videos: item.videos || [],
          helpersCount: item.helpers_count,
          documentsLink: item.documents_link,
          raised: item.raised_amount || 0,
          target: item.target_amount || 0,
          isUrgent: item.is_urgent,
          collectionStatus: item.collection_status
        }));

        setBeneficiaries(formatted);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [name]);

  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseFloat(getComputedStyle(descRef.current).lineHeight);
      const height = descRef.current.scrollHeight;
      setIsDescriptionLong(height > lineHeight * 5);
    }
  }, [fund]);

  if (loading) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin" />
      </div>
    );
  }

  if (!fund) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-[var(--text-secondary)] mb-4'>Фонд не найден</p>
          <button onClick={() => navigate(-1)} className='btn-primary'>
            Назад
          </button>
        </div>
      </div>
    );
  }

  const socialLinks = fund.social_links || {};

  return (
    <>
      <div className='min-h-screen bg-[var(--bg-secondary)]'>
        <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => navigate(-1)}
              className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
            >
              <Icon name="arrow-left" size={20} />
            </button>
            <h1 className='text-xl font-bold'>{fund.name}</h1>
          </div>
        </header>

        <div className='p-4 pb-20'>
          {/* Fund card - new layout: logo top, name, description, details */}
          <div className='card mb-6'>
            <div className='flex flex-col items-center text-center'>
              <img
                src={optimizeImage(fund.logo_url, { width: 160, quality: 75 })}
                alt={fund.name}
                className='w-24 h-24 object-contain rounded-2xl mb-3'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/96?text=' + fund.name.charAt(0);
                }}
              />
              <div className='flex items-center space-x-2 mb-3'>
                <h2 className='text-xl font-bold'>{fund.name}</h2>
                {fund.is_verified && (
                  <img
                    src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/Galochka.png'
                    alt='Верифицирован'
                    className='w-6 h-6'
                  />
                )}
              </div>
            </div>

            {/* Description with "ещё" */}
            {fund.description && (
              <div className='mb-4'>
                <p
                  ref={descRef}
                  className={`text-[var(--text-secondary)] text-sm leading-relaxed ${!showFullDescription && isDescriptionLong ? 'line-clamp-5' : ''}`}
                >
                  {fund.description}
                </p>
                {isDescriptionLong && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className='text-[var(--primary-color)] text-sm font-medium mt-1'
                  >
                    {showFullDescription ? 'Свернуть' : 'Ещё'}
                  </button>
                )}
              </div>
            )}

            {/* Fund details */}
            {(fund.bin || fund.founded_date || fund.location) && (
              <div className='space-y-3 pt-3 border-t border-[var(--border-color)]'>
                {fund.bin && (
                  <div className='flex items-center space-x-3'>
                    <Icon name="file-check" size={18} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className='text-xs text-[var(--text-secondary)]'>БИН</p>
                      <p className='text-sm font-medium'>{fund.bin}</p>
                    </div>
                  </div>
                )}
                {fund.founded_date && (
                  <div className='flex items-center space-x-3'>
                    <Icon name="database" size={18} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className='text-xs text-[var(--text-secondary)]'>Дата создания</p>
                      <p className='text-sm font-medium'>{new Date(fund.founded_date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                )}
                {fund.location && (
                  <div className='flex items-center space-x-3'>
                    <Icon name="map-pin" size={18} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className='text-xs text-[var(--text-secondary)]'>Расположение</p>
                      <p className='text-sm font-medium'>{fund.location}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social links */}
            {(socialLinks.website || socialLinks.instagram || socialLinks.facebook || socialLinks.whatsapp) && (
              <div className='pt-3 mt-3 border-t border-[var(--border-color)]'>
                <p className='text-xs text-[var(--text-secondary)] mb-2'>Социальные сети</p>
                <div className='flex flex-wrap gap-2'>
                  {socialLinks.website && (
                    <a href={socialLinks.website} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="external-link" size={14} className="text-[var(--primary-color)]" />
                      <span>Сайт</span>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="instagram" size={14} className="text-[#E4405F]" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="users" size={14} className="text-[#1877F2]" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {socialLinks.whatsapp && (
                    <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="message-circle" size={14} className="text-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subscription card */}
          <div className='rounded-2xl p-5 mb-6 text-white' style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)' }}>
            <div className='flex items-center space-x-2 mb-1'>
              <Icon name="heart-handshake" size={22} className="text-white" />
              <h3 className='text-[15px] font-bold'>Помогать ежемесячно</h3>
            </div>
            <p className='text-[13px] text-white/80 mb-4'>Подпишитесь на регулярную помощь фонду</p>

            <div className='flex gap-2 mb-3'>
              {SUB_PRESETS.map(amount => (
                <button
                  key={amount}
                  onClick={() => { setSubAmount(amount); setCustomSubAmount(''); }}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                    subAmount === amount && !customSubAmount
                      ? 'bg-white text-[#2f8f6a]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {amount >= 10000 ? `${amount / 1000}k` : amount.toLocaleString('ru-RU')} ₸
                </button>
              ))}
            </div>

            <div className='relative mb-4'>
              <input
                type='number'
                inputMode='numeric'
                placeholder='Своя сумма'
                value={customSubAmount}
                onFocus={() => setSubAmount(0)}
                onChange={(e) => { setCustomSubAmount(e.target.value); setSubAmount(0); }}
                className='w-full h-10 px-4 pr-8 rounded-xl bg-white/20 text-white placeholder-white/60 text-[16px] font-medium focus:outline-none focus:bg-white/30'
              />
              <span className='absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm'>₸</span>
            </div>

            <button
              onClick={() => {
                const finalAmount = customSubAmount ? parseInt(customSubAmount) : subAmount;
                if (!finalAmount || finalAmount < 100) { toast.error('Минимальная сумма — 100 ₸'); return; }
                setSubAmount(finalAmount);
                setShowSubModal(true);
                setSubStep('method');
                setSubPhone('');
              }}
              className='w-full py-3 bg-white text-[#2f8f6a] font-bold rounded-xl text-sm active:scale-[0.98] transition-transform flex items-center justify-center space-x-2'
            >
              <Icon name="heart" size={16} className="text-[#2f8f6a]" />
              <span>Помогать ежемесячно</span>
            </button>
          </div>

          {/* Beneficiaries list */}
          <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-3'>
              Подопечные фонда ({beneficiaries.length})
            </h3>
          </div>

          {beneficiaries.length === 0 ? (
            <div className='text-center py-8'>
              <Icon name="users" size={32} className="text-gray-400 mx-auto mb-4" />
              <p className='text-[var(--text-secondary)]'>У этого фонда пока нет подопечных</p>
            </div>
          ) : (
            <div className='cards-grid'>
              {beneficiaries.map(item => (
                <CharityCard
                  key={item.id}
                  data={item}
                  onCardClick={() => setSelectedCharity(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCharity && (
        <CharityModal
          data={selectedCharity}
          onClose={() => setSelectedCharity(null)}
        />
      )}

      {/* Subscription payment modal */}
      {showSubModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50' onClick={() => setShowSubModal(false)}>
          <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-5' onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold'>
                {subStep === 'method' && 'Способ оплаты'}
                {subStep === 'kaspi' && 'Оплата через Kaspi'}
                {subStep === 'done' && 'Заявка отправлена'}
              </h3>
              <button onClick={() => setShowSubModal(false)} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                <Icon name="x" size={16} />
              </button>
            </div>

            <p className='text-sm text-[var(--text-secondary)] mb-1'>Ежемесячная помощь фонду «{fund.name}»</p>
            <p className='text-xl font-bold text-[var(--text-primary)] mb-5'>{subAmount.toLocaleString('ru-RU')} ₸ / мес</p>

            {subStep === 'method' && (
              <div className='space-y-3'>
                <button
                  onClick={() => setSubStep('kaspi')}
                  className='w-full flex items-center space-x-4 p-4 rounded-2xl bg-[var(--bg-secondary)] active:bg-gray-100 transition-colors'
                >
                  <div className='w-12 h-12 bg-[#FF0000] rounded-xl flex items-center justify-center flex-shrink-0'>
                    <span className='text-white font-bold text-lg'>K</span>
                  </div>
                  <div className='text-left flex-1'>
                    <p className='font-semibold'>Kaspi</p>
                    <p className='text-xs text-[var(--text-secondary)]'>Оплата через Kaspi</p>
                  </div>
                  <Icon name="chevron-right" size={20} className="text-[var(--text-secondary)]" />
                </button>

                <button
                  disabled
                  className='w-full flex items-center space-x-4 p-4 rounded-2xl bg-[var(--bg-secondary)] opacity-50'
                >
                  <div className='w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <Icon name="credit-card" size={22} className="text-gray-500" />
                  </div>
                  <div className='text-left flex-1'>
                    <p className='font-semibold text-[var(--text-secondary)]'>Банковская карта</p>
                    <p className='text-xs text-[var(--text-secondary)]'>Скоро</p>
                  </div>
                </button>
              </div>
            )}

            {subStep === 'kaspi' && (
              <div>
                <label className='block text-sm font-medium mb-2'>Номер телефона</label>
                <input
                  type='tel'
                  inputMode='numeric'
                  placeholder='+7 ___ ___ __ __'
                  value={subPhone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 11) val = val.slice(0, 11);
                    if (val && !val.startsWith('7')) val = '7' + val;
                    setSubPhone(val);
                  }}
                  className='w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[16px] mb-4'
                />
                {subPhone.length > 0 && subPhone.length < 11 && (
                  <p className='text-xs text-red-500 -mt-3 mb-4'>Введите 11 цифр</p>
                )}
                <button
                  onClick={async () => {
                    if (subPhone.length !== 11) { toast.error('Введите номер телефона (11 цифр)'); return; }
                    const { error } = await supabase.from('fund_subscriptions').insert({
                      fund_id: fund.id,
                      fund_name: fund.name,
                      phone: subPhone,
                      amount: subAmount,
                      payment_method: 'kaspi',
                      visitor_id: localStorage.getItem('visitorId') || null,
                    });
                    if (error) { toast.error('Ошибка: ' + error.message); return; }
                    setSubStep('done');
                  }}
                  disabled={subPhone.length !== 11}
                  className='w-full py-3 bg-[var(--primary-color)] text-white font-bold rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform'
                >
                  Отправить заявку
                </button>
              </div>
            )}

            {subStep === 'done' && (
              <div className='text-center py-4'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Icon name="check" size={32} className="text-[var(--primary-color)]" />
                </div>
                <p className='text-[var(--text-primary)] font-semibold mb-2'>Заявка на подписку отправлена!</p>
                <p className='text-sm text-[var(--text-secondary)] mb-4'>Мы свяжемся с вами для подтверждения ежемесячного платежа.</p>
                <button
                  onClick={() => setShowSubModal(false)}
                  className='w-full py-3 bg-[var(--primary-color)] text-white font-bold rounded-xl text-sm'
                >
                  Готово
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FundDetailPage;
