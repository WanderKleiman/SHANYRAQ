import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import CharityCard from '../components/CharityCard';
import CharityModal from '../components/CharityModal';
import PaymentModal from '../components/PaymentModal';
import Icon from '../components/Icon';
import { getCategoryName } from '../utils/charityData';
import { getVisitorId } from '../utils/fingerprint';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const SUPABASE_IMG = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images';
const KASPI_LOGO = `${SUPABASE_IMG}/png-klev-club-xxta-p-kaspii-logotip-png-10.png`;

function formatPhoneDisplay(digits) {
  if (!digits) return '+7';
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 ${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 ${digits.slice(1, 4)} ${digits.slice(4)}`;
  return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}

function FundLandingPage() {
  const { fundId } = useParams();
  const [fund, setFund] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const descRef = useRef(null);

  // One-time donation state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState(1000);
  const [customDonateAmount, setCustomDonateAmount] = useState('');
  const [donateSubmitting, setDonateSubmitting] = useState(false);
  const DONATE_PRESETS = [500, 1000, 2000, 5000];

  // Subscription state
  const [subAmount, setSubAmount] = useState(3000);
  const [customSubAmount, setCustomSubAmount] = useState('');
  const [showSubModal, setShowSubModal] = useState(false);
  const [subPhone, setSubPhone] = useState('');
  const [subStep, setSubStep] = useState('phone'); // 'phone' | 'done'
  const [subSubmitting, setSubSubmitting] = useState(false);
  const SUB_PRESETS = [1000, 3000, 5000, 10000];

  // Kaspi bonus state
  const [kaspiPayment, setKaspiPayment] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: fundData, error: fundError } = await supabase
          .from('partner_funds')
          .select('*')
          .eq('id', fundId)
          .single();

        if (fundError) throw fundError;
        setFund(fundData);

        const { data: beneficiariesData, error: beneficiariesError } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('partner_fund', fundData.name)
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
          collectionStatus: item.collection_status,
          focalX: item.focal_x ?? 50,
          focalY: item.focal_y ?? 50,
          fundId: fundData.id,
        }));

        setBeneficiaries(formatted);

        // Auto-open beneficiary from ?beneficiary=ID query param (shared link)
        const params = new URLSearchParams(window.location.search);
        const sharedBenId = params.get('beneficiary');
        if (sharedBenId) {
          const match = formatted.find(b => String(b.id) === sharedBenId);
          if (match) setSelectedCharity(match);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    }

    if (fundId) loadData();
  }, [fundId]);

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter(b => b.collectionStatus === activeTab);
  }, [beneficiaries, activeTab]);

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
        </div>
      </div>
    );
  }

  const socialLinks = fund.social_links || {};
  const hasDetails = fund.bin || fund.founded_date || fund.location;

  // Build Kaspi bonus payment object from first active beneficiary (or fund directly)
  const firstActiveBen = beneficiaries.find(b => b.collectionStatus === 'active');
  const kaspiPaymentObj = firstActiveBen
    ? { ...firstActiveBen, fundId: fund.id }
    : { id: 'kaspi-bonus', title: `Помощь бонусами Kaspi — ${fund.name}`, target: 0, fundId: fund.id };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className='min-h-screen bg-[var(--bg-secondary)]'>
        <div className='p-4 pb-8'>
          {/* Fund card */}
          <div className='card mb-6'>
            <div className='flex flex-col items-center text-center'>
              <img
                src={fund.logo_url}
                alt={fund.name}
                className='w-24 h-24 object-contain rounded-2xl mb-3'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/96?text=' + fund.name.charAt(0);
                }}
              />
              <div className='flex items-center space-x-2 mb-3 max-w-full'>
                <h2 className='text-xl font-bold truncate max-w-[calc(100vw-80px)]'>{fund.name}</h2>
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

            {/* Fund details — collapsible */}
            {hasDetails && (
              <div className='pt-3 border-t border-[var(--border-color)]'>
                <button
                  onClick={() => setDetailsOpen(v => !v)}
                  className='flex items-center justify-between w-full text-sm font-medium text-[var(--text-secondary)]'
                >
                  <span>Сведения о фонде</span>
                  <Icon
                    name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    className='text-[var(--text-secondary)]'
                  />
                </button>

                {detailsOpen && (
                  <div className='space-y-3 mt-3'>
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
              </div>
            )}

            {/* Social links — always visible */}
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

          {/* Help fund button */}
          <button
            onClick={() => { setShowDonateModal(true); setDonateAmount(1000); setCustomDonateAmount(''); }}
            className='flex items-center justify-center space-x-2 w-full py-4 rounded-2xl mb-4 font-bold text-white active:scale-[0.98] transition-transform'
            style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)' }}
          >
            <Icon name="heart" size={18} className="text-white" />
            <span>Помочь фонду</span>
          </button>

          {/* Subscription card */}
          <div className='rounded-2xl p-5 mb-4 text-white' style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)' }}>
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
                setSubStep('phone');
                setSubPhone('');
              }}
              className='w-full py-3 bg-white text-[#2f8f6a] font-bold rounded-xl text-sm active:scale-[0.98] transition-transform flex items-center justify-center space-x-2'
            >
              <Icon name="heart" size={16} className="text-[#2f8f6a]" />
              <span>Помогать ежемесячно</span>
            </button>
          </div>

          {/* Kaspi bonuses card */}
          <div className='rounded-2xl p-5 mb-6 text-white' style={{ background: 'linear-gradient(135deg, #9b1c1c 0%, #ef3340 40%, #f87171 100%)' }}>
            <div className='flex items-center space-x-2 mb-1'>
              <img src={KASPI_LOGO} alt='Kaspi' className='h-5 object-contain brightness-0 invert' />
              <h3 className='text-[15px] font-bold'>Помочь бонусами Kaspi</h3>
            </div>
            <p className='text-[13px] text-white/80 mb-4'>
              Потратьте накопленные бонусы Kaspi Gold на реальную помощь. Курс 1 бонус = 1 тенге.
            </p>
            <button
              onClick={() => setKaspiPayment(kaspiPaymentObj)}
              className='w-full py-3 bg-white text-[#ef3340] font-bold rounded-xl text-sm active:scale-[0.98] transition-transform flex items-center justify-center space-x-2'
            >
              <img src={KASPI_LOGO} alt='Kaspi' className='h-4 object-contain' />
              <span>Помочь бонусами</span>
            </button>
          </div>

          {/* Beneficiaries list */}
          <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-3'>
              Подопечные фонда ({beneficiaries.length})
            </h3>
            <div className='flex rounded-xl overflow-hidden border border-[var(--border-color)]'>
              {[
                { key: 'active', label: 'Активные' },
                { key: 'completed', label: 'Завершённые' },
                { key: 'reported', label: 'Отчёты' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] bg-[var(--bg-primary)]'
                  }`}
                  style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)' } : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredBeneficiaries.length === 0 ? (
            <div className='text-center py-8'>
              <Icon name="users" size={32} className="text-gray-400 mx-auto mb-4" />
              <p className='text-[var(--text-secondary)]'>
                {activeTab === 'active' && 'Нет активных подопечных'}
                {activeTab === 'completed' && 'Нет завершённых сборов'}
                {activeTab === 'reported' && 'Нет отчётов'}
              </p>
            </div>
          ) : (
            <div className='cards-grid'>
              {filteredBeneficiaries.map(item => (
                <CharityCard
                  key={item.id}
                  data={item}
                  onCardClick={() => setSelectedCharity(item)}
                  shareBaseUrl={`https://shanyrak.world/f/${fundId}`}
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
          shareBaseUrl={`https://shanyrak.world/f/${fundId}`}
        />
      )}

      {/* Kaspi bonus modal */}
      {kaspiPayment && (
        <PaymentModal
          beneficiary={kaspiPayment}
          onClose={() => setKaspiPayment(null)}
          kaspiBonus={true}
        />
      )}

      {/* One-time donation modal */}
      {showDonateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50' onClick={() => setShowDonateModal(false)}>
          <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-5' onClick={e => e.stopPropagation()}>
            <div className='w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4' />
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold'>Помочь фонду</h3>
              <button onClick={() => setShowDonateModal(false)} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                <Icon name="x" size={16} />
              </button>
            </div>
            <p className='text-sm text-[var(--text-secondary)] mb-4'>{fund.name}</p>

            <div className='grid grid-cols-2 gap-3 mb-3'>
              {DONATE_PRESETS.map(a => (
                <button key={a} onClick={() => { setDonateAmount(a); setCustomDonateAmount(''); }}
                  className={`py-3 rounded-xl font-medium transition-all ${donateAmount === a && !customDonateAmount ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 text-[var(--text-primary)]'}`}>
                  {a.toLocaleString('ru-RU')} ₸
                </button>
              ))}
            </div>
            <input
              type='text' inputMode='numeric'
              value={customDonateAmount}
              onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setCustomDonateAmount(v); setDonateAmount(0); }}
              placeholder='Своя сумма'
              style={{ fontSize: '16px' }}
              className='w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] mb-4'
            />
            <button
              onClick={async () => {
                const amount = donateAmount || parseInt(customDonateAmount);
                if (!amount || amount < 100) { toast.error('Минимальная сумма — 100 ₸'); return; }
                const isNative = Capacitor.isNativePlatform();
                const newTab = isNative ? null : window.open('', '_blank');
                setDonateSubmitting(true);
                try {
                  const visitorId = await getVisitorId();
                  const res = await fetch('https://bvxccwndrkvnwmfbfhql.supabase.co/functions/v1/xpayment-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, fundId: fund.id, fundName: fund.name, visitorId }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Ошибка');
                  setShowDonateModal(false);
                  if (isNative) {
                    await Browser.open({ url: data.qr_token });
                  } else if (newTab) {
                    newTab.location.href = data.qr_token;
                  } else {
                    window.location.href = data.qr_token;
                  }
                } catch (err) {
                  if (newTab) newTab.close();
                  toast.error(err.message || 'Произошла ошибка');
                } finally {
                  setDonateSubmitting(false);
                }
              }}
              disabled={donateSubmitting || (!donateAmount && !customDonateAmount)}
              className='w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 active:scale-[0.98] transition-transform'
              style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)' }}
            >
              {donateSubmitting ? 'Открываем Kaspi...' : `Помочь — ${(donateAmount || parseInt(customDonateAmount) || 0).toLocaleString('ru-RU')} ₸`}
            </button>
          </div>
        </div>
      )}

      {/* Subscription modal */}
      {showSubModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50' onClick={() => setShowSubModal(false)}>
          <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-5' onClick={e => e.stopPropagation()}>
            <div className='w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4' />
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-lg font-bold'>{subStep === 'done' ? 'Подписка оформлена' : 'Ежемесячная помощь'}</h3>
              <button onClick={() => setShowSubModal(false)} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                <Icon name="x" size={16} />
              </button>
            </div>

            {subStep === 'phone' && (
              <>
                <p className='text-sm text-[var(--text-secondary)] mb-1'>{fund.name}</p>
                <p className='text-xl font-bold text-[var(--text-primary)] mb-5'>{subAmount.toLocaleString('ru-RU')} ₸ / мес</p>
                <label className='block text-sm font-medium mb-2'>Номер телефона Kaspi</label>
                <p className='text-xs text-[var(--text-secondary)] mb-3'>На этот номер придёт запрос на оплату в Kaspi</p>
                <input
                  type='tel' inputMode='numeric'
                  placeholder='+7 ___ ___ __ __'
                  value={formatPhoneDisplay(subPhone)}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 11) val = val.slice(0, 11);
                    if (val && !val.startsWith('7')) val = '7' + val;
                    setSubPhone(val);
                  }}
                  style={{ fontSize: '16px' }}
                  className='w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] mb-4'
                />
                {subPhone.length > 0 && subPhone.length < 11 && (
                  <p className='text-xs text-red-500 -mt-3 mb-4'>Введите 11 цифр</p>
                )}
                <button
                  onClick={async () => {
                    if (subPhone.length !== 11) { toast.error('Введите номер телефона'); return; }
                    setSubSubmitting(true);
                    try {
                      const visitorId = await getVisitorId();
                      const res = await fetch('https://bvxccwndrkvnwmfbfhql.supabase.co/functions/v1/xpayment-invoice', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: subPhone, amount: subAmount, fundId: fund.id, fundName: fund.name, visitorId }),
                      });
                      const result = await res.json();
                      if (!res.ok) throw new Error(result.error || 'Ошибка');
                      setSubStep('done');
                    } catch (err) {
                      toast.error(err.message || 'Произошла ошибка');
                    } finally {
                      setSubSubmitting(false);
                    }
                  }}
                  disabled={subPhone.length !== 11 || subSubmitting}
                  className='w-full py-3 bg-[var(--primary-color)] text-white font-bold rounded-xl text-sm disabled:opacity-50'
                >
                  {subSubmitting ? 'Отправляем...' : 'Подтвердить подписку'}
                </button>
              </>
            )}

            {subStep === 'done' && (
              <div className='text-center py-4'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Icon name="check" size={32} className="text-[var(--primary-color)]" />
                </div>
                <p className='font-semibold mb-2'>Запрос на оплату отправлен!</p>
                <p className='text-sm text-[var(--text-secondary)] mb-4'>Откройте Kaspi и подтвердите платёж. Каждый месяц будет приходить новый запрос.</p>
                <a href='https://kaspi.kz' target='_blank' rel='noopener noreferrer'
                  className='block w-full py-3 bg-[var(--primary-color)] text-white font-bold rounded-xl text-sm text-center'>
                  Готово
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FundLandingPage;
