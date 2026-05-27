import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getVisitorId } from '../utils/fingerprint';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = 'https://bvxccwndrkvnwmfbfhql.supabase.co';
const G = 'linear-gradient(135deg, #1e6b4e, #5ec49a)';
const AMOUNTS = [500, 1000, 2000, 5000];

// Detect if running inside an iframe (popup mode)
const IS_POPUP = window.self !== window.top;

export default function WidgetPage() {
  const { fundId } = useParams();

  const [fund, setFund]               = useState(null);
  const [bens, setBens]               = useState([]);
  const [selectedBen, setSelectedBen] = useState(null);
  const [amount, setAmount]           = useState(1000);
  const [custom, setCustom]           = useState('');
  const [method, setMethod]           = useState('kaspi'); // 'kaspi' | 'card'
  const [recurring, setRecurring]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [paying, setPaying]           = useState(false);
  const [step, setStep]               = useState('donate'); // 'donate' | 'success'

  /* ── load fund + beneficiaries ── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // fund by id
        const { data: fundData } = await supabase
          .from('partner_funds')
          .select('*')
          .eq('id', fundId)
          .single();

        if (!fundData) throw new Error('Фонд не найден');
        setFund(fundData);

        // beneficiaries of this fund
        const { data: benData } = await supabase
          .from('beneficiaries')
          .select('id, title, description, image_url, images, raised_amount, target_amount, category, city, is_urgent')
          .eq('is_active', true)
          .eq('partner_fund', fundData.name)
          .limit(10);

        setBens(benData || []);
        if (benData && benData.length > 0) setSelectedBen(benData[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (fundId) load();
  }, [fundId]);

  const finalAmount = custom ? parseInt(custom) : amount;

  /* ── pay ── */
  async function handlePay() {
    if (!finalAmount || finalAmount < 100) {
      toast.error('Минимальная сумма — 100 ₸');
      return;
    }
    if (!selectedBen) {
      toast.error('Выберите подопечного');
      return;
    }

    setPaying(true);
    try {
      const visitorId = await getVisitorId();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/xpayment-link`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount,
            beneficiaryId: selectedBen.id,
            title: selectedBen.title,
            fundId: fund.id,
            visitorId,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка оплаты');

      // Open payment link
      if (IS_POPUP) {
        // inside iframe — open in parent window
        window.parent.postMessage({ type: 'shanyrak:open-url', url: data.qr_token }, '*');
      } else {
        window.location.href = data.qr_token;
      }
      setStep('success');
    } catch (e) {
      toast.error(e.message || 'Произошла ошибка');
    } finally {
      setPaying(false);
    }
  }

  function handleClose() {
    if (IS_POPUP) {
      window.parent.postMessage({ type: 'shanyrak:close' }, '*');
    }
  }

  /* ── loading / not found ── */
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div className='w-8 h-8 rounded-full border-2 border-[#2f8f6a] border-t-transparent animate-spin' />
      </div>
    );
  }

  if (!fund) {
    return (
      <div className='min-h-screen flex items-center justify-center text-gray-500 text-sm' style={{ fontFamily: 'system-ui, sans-serif' }}>
        Фонд не найден
      </div>
    );
  }

  /* ── success screen ── */
  if (step === 'success') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-5 p-8 text-center'
        style={{ fontFamily: 'system-ui, sans-serif', background: '#f7f9f8' }}>
        <div className='text-5xl'>💚</div>
        <h2 className='text-xl font-bold text-gray-900'>Спасибо за помощь!</h2>
        <p className='text-sm text-gray-600 max-w-xs'>Ваш вклад помогает реальным людям. Платёж обрабатывается.</p>
        <button onClick={() => setStep('donate')}
          className='text-sm text-[#2f8f6a] underline'>Помочь ещё раз</button>
        {IS_POPUP && (
          <button onClick={handleClose}
            className='text-sm text-gray-400 mt-2'>Закрыть</button>
        )}
      </div>
    );
  }

  /* ── main widget ── */
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f7f9f8', minHeight: '100vh' }}>
      <Toaster position='top-center' />

      {/* header */}
      <div className='px-5 pt-5 pb-4 bg-white flex items-center justify-between'
        style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className='flex items-center gap-3'>
          {fund.logo_url
            ? <img src={fund.logo_url} alt={fund.name} className='h-9 object-contain max-w-[100px]' />
            : <div className='text-base font-bold text-gray-900'>{fund.name}</div>
          }
        </div>
        <div className='flex items-center gap-2'>
          <img src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/14.png'
            alt='Шаңырақ' className='w-5 h-5 object-contain opacity-60' />
          <span className='text-xs text-gray-400'>Шаңырақ</span>
          {IS_POPUP && (
            <button onClick={handleClose} className='ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none'>✕</button>
          )}
        </div>
      </div>

      <div className='p-5 space-y-4'>

        {/* beneficiary selector */}
        {bens.length > 0 && (
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>Выберите подопечного</p>
            <div className='flex gap-3 overflow-x-auto pb-1' style={{ scrollbarWidth: 'none' }}>
              {bens.map((b) => {
                const img = b.image_url || (b.images && b.images[0]);
                const sel = selectedBen?.id === b.id;
                return (
                  <button key={b.id} onClick={() => setSelectedBen(b)}
                    className='flex-shrink-0 rounded-2xl overflow-hidden text-left transition-all'
                    style={{
                      width: '110px',
                      border: sel ? '2px solid #2f8f6a' : '2px solid transparent',
                      boxShadow: sel ? '0 0 0 3px rgba(47,143,106,0.15)' : '0 1px 6px rgba(0,0,0,0.08)',
                      background: 'white',
                    }}>
                    <div style={{ height: '80px', overflow: 'hidden' }}>
                      {img
                        ? <img src={img} alt={b.title} className='w-full h-full object-cover' />
                        : <div className='w-full h-full flex items-center justify-center text-2xl'
                            style={{ background: 'linear-gradient(135deg,#e8f8f2,#c8f0e0)' }}>🤲</div>
                      }
                    </div>
                    <div className='p-2'>
                      <p className='text-xs font-semibold text-gray-900 leading-tight'
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {b.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* amount */}
        <div>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>Сумма</p>
          <div className='grid grid-cols-4 gap-2 mb-3'>
            {AMOUNTS.map((a) => (
              <button key={a} onClick={() => { setAmount(a); setCustom(''); }}
                className='py-2.5 rounded-xl text-sm font-semibold transition-all'
                style={{
                  background: amount === a && !custom ? G : '#f0f0f0',
                  color: amount === a && !custom ? 'white' : '#333',
                }}>
                {a.toLocaleString('ru-RU')}
              </button>
            ))}
          </div>
          <input
            type='number'
            placeholder='Другая сумма ₸'
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setAmount(0); }}
            className='w-full px-4 py-2.5 rounded-xl border text-sm outline-none'
            style={{ borderColor: custom ? '#2f8f6a' : '#e5e7eb', background: 'white' }}
          />
        </div>

        {/* method */}
        <div>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>Способ оплаты</p>
          <div className='grid grid-cols-2 gap-2'>
            {[
              { id: 'kaspi', label: 'Kaspi QR', emoji: '📱' },
              { id: 'card',  label: 'Карта',    emoji: '💳' },
            ].map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className='flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all'
                style={{
                  background: method === m.id ? 'rgba(47,143,106,0.1)' : '#f0f0f0',
                  border: method === m.id ? '2px solid #2f8f6a' : '2px solid transparent',
                  color: method === m.id ? '#1e6b4e' : '#555',
                }}>
                <span>{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* recurring */}
        <div className='flex items-center justify-between px-4 py-3 rounded-xl'
          style={{ background: recurring ? 'rgba(47,143,106,0.08)' : '#f7f7f7', border: recurring ? '1.5px solid #2f8f6a' : '1.5px solid transparent' }}>
          <div>
            <p className='text-sm font-semibold text-gray-900'>Ежемесячная поддержка</p>
            <p className='text-xs text-gray-500'>Автоматически каждый месяц</p>
          </div>
          <button onClick={() => setRecurring(!recurring)}
            className='w-11 h-6 rounded-full transition-all relative flex-shrink-0'
            style={{ background: recurring ? '#2f8f6a' : '#d1d5db' }}>
            <span className='absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all'
              style={{ left: recurring ? '22px' : '2px' }} />
          </button>
        </div>

        {/* pay button */}
        <button onClick={handlePay} disabled={paying}
          className='w-full py-4 rounded-2xl text-white font-bold text-base transition-opacity'
          style={{ background: G, opacity: paying ? 0.7 : 1 }}>
          {paying ? 'Обрабатываем...' : `Помочь ${finalAmount ? finalAmount.toLocaleString('ru-RU') + ' ₸' : ''}`}
        </button>

        {/* footer */}
        <p className='text-center text-xs text-gray-400 pb-2'>
          Платежи защищены · Powered by{' '}
          <a href='https://shanyrak.world' target='_blank' rel='noopener noreferrer' className='text-[#2f8f6a]'>
            Шаңырақ
          </a>
        </p>
      </div>
    </div>
  );
}
