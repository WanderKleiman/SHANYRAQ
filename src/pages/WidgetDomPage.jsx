import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getVisitorId } from '../utils/fingerprint';
import toast, { Toaster } from 'react-hot-toast';
import { Browser } from '@capacitor/browser';

const SUPABASE_URL = 'https://bvxccwndrkvnwmfbfhql.supabase.co';
const KASPI_LOGO   = `${SUPABASE_URL}/storage/v1/object/public/images/png-klev-club-xxta-p-kaspii-logotip-png-10.png`;
const SHANYRAK_LOGO = `${SUPABASE_URL}/storage/v1/object/public/images/14.png`;
const IS_POPUP = window.self !== window.top;

const G_BLUE = 'linear-gradient(135deg, #1a3a6b 0%, #1e5fc0 50%, #4d9de0 100%)';
const AMOUNTS = [500, 1000, 2000, 5000];

const OTHER_METHODS = [
  { id: 'qiwi',       name: 'Qiwi.kz',                   color: '#FF6B00', letter: 'Q',   url: 'https://qiwi.kz' },
  { id: 'halyk',      name: 'Халык банк',                 color: '#006B3C', letter: 'H',   url: 'https://halykbank.kz' },
  { id: 'bereke',     name: 'Береке банк',                color: '#0057A8', letter: 'Б',   url: 'https://berekebank.kz' },
  { id: 'bcc',        name: 'Банк Центр Кредит',          color: '#1A237E', letter: 'БЦК', url: 'https://bcc.kz' },
  { id: 'giftery',    name: 'Подарочная карта Giftery',   color: '#C2185B', letter: 'G',   url: 'https://giftery.kz' },
  { id: 'tayyab',     name: 'Исламский сервис Tayyab',    color: '#1B5E20', letter: 'T',   url: 'https://tayyab.kz' },
  { id: 'magnum',     name: 'Magnum',                     color: '#D32F2F', letter: 'M',   url: 'https://magnum.kz' },
  { id: 'requisites', name: 'По реквизитам',              color: '#546E7A', letter: '₸',   url: null },
];

function LogoBadge({ color, letter, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: letter.length > 1 ? 9 : 14,
      letterSpacing: letter.length > 1 ? '-0.5px' : 0,
    }}>
      {letter}
    </div>
  );
}

export default function WidgetDomPage() {
  const { fundId } = useParams();

  const [fund, setFund]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [amount, setAmount]         = useState(1000);
  const [custom, setCustom]         = useState('');
  const [method, setMethod]         = useState('kaspi'); // 'kaspi' | 'card' | other id
  const [othersOpen, setOthersOpen] = useState(false);
  const [paying, setPaying]         = useState(false);
  const [done, setDone]             = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('partner_funds')
        .select('id, name, logo_url, description')
        .eq('id', fundId)
        .single();
      setFund(data);
      setLoading(false);
    }
    if (fundId) load();
  }, [fundId]);

  const finalAmount = custom ? parseInt(custom) : amount;
  const isOther = method !== 'kaspi' && method !== 'card';
  const selectedOther = OTHER_METHODS.find(m => m.id === method);

  async function handlePay() {
    if (method === 'card') {
      toast('Оплата картой скоро будет доступна', { icon: '🔜' });
      return;
    }

    if (isOther) {
      if (method === 'requisites') {
        toast('Напишите нам — мы пришлём реквизиты фонда', { icon: '📋', duration: 4000 });
        return;
      }
      if (selectedOther?.url) {
        window.open(selectedOther.url, '_blank');
      }
      return;
    }

    // Kaspi flow
    if (!finalAmount || finalAmount < 100) {
      toast.error('Минимальная сумма — 100 ₸');
      return;
    }
    setPaying(true);
    try {
      const visitorId = await getVisitorId();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/xpayment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, fundId: fund.id, fundName: fund.name, visitorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка оплаты');

      if (IS_POPUP) {
        window.parent.postMessage({ type: 'shanyrak:open-url', url: data.qr_token }, '*');
      } else {
        await Browser.open({ url: data.qr_token });
      }
      setDone(true);
    } catch (e) {
      toast.error(e.message || 'Произошла ошибка');
    } finally {
      setPaying(false);
    }
  }

  function close() {
    if (IS_POPUP) window.parent.postMessage({ type: 'shanyrak:close' }, '*');
  }

  function selectOther(id) {
    setMethod(id);
    setOthersOpen(false);
  }

  /* ── loading ── */
  if (loading) return (
    <div style={s.center}><div style={s.spinner} /></div>
  );

  if (!fund) return (
    <div style={s.center}><p style={{ color: '#888', fontSize: 14 }}>Фонд не найден</p></div>
  );

  /* ── success ── */
  if (done) return (
    <div style={{ ...s.wrap, ...s.center, flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 52 }}>💙</div>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Спасибо!</p>
      <p style={{ fontSize: 13, color: '#666', maxWidth: 260 }}>
        Платёж обрабатывается. Ваша помощь делает мир лучше.
      </p>
      <button onClick={() => setDone(false)} style={s.linkBtn}>Помочь ещё раз</button>
      {IS_POPUP && <button onClick={close} style={{ ...s.linkBtn, color: '#aaa' }}>Закрыть</button>}
    </div>
  );

  /* ── pay button label ── */
  function payLabel() {
    if (paying) return 'Обрабатываем...';
    if (method === 'card') return 'Оплатить картой — скоро';
    if (method === 'requisites') return 'Получить реквизиты';
    if (isOther && selectedOther) return `Перейти на ${selectedOther.name}`;
    const amt = finalAmount ? ` · ${finalAmount.toLocaleString('ru-RU')} ₸` : '';
    return (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <img src={KASPI_LOGO} alt='Kaspi' style={{ height: 20, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <span>Оплатить через Kaspi{amt}</span>
      </span>
    );
  }

  function payBtnColor() {
    if (method === 'card') return '#9e9e9e';
    if (isOther && selectedOther) return selectedOther.color;
    return G_BLUE;
  }

  /* ── main ── */
  return (
    <div style={s.wrap}>
      <Toaster position='top-center' toastOptions={{ style: { fontSize: 13 } }} />

      {/* header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          {fund.logo_url
            ? <img src={fund.logo_url} alt={fund.name} style={{ height: 34, maxWidth: 120, objectFit: 'contain' }} />
            : <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{fund.name}</span>
          }
        </div>
        <div style={s.headerRight}>
          <img src={SHANYRAK_LOGO} alt='Шаңырақ' style={{ width: 16, height: 16, objectFit: 'contain', opacity: 0.4 }} />
          <span style={{ fontSize: 11, color: '#bbb' }}>Шаңырақ</span>
          {IS_POPUP && <button onClick={close} style={s.closeBtn}>✕</button>}
        </div>
      </div>

      {/* hero */}
      <div style={s.hero}>
        <h2 style={s.heroTitle}>Поддержите фонд</h2>
        <p style={s.heroSub}>{fund.name}</p>
      </div>

      {/* body */}
      <div style={s.body}>

        {/* amount */}
        <div>
          <p style={s.label}>Сумма помощи</p>
          <div style={s.amountGrid}>
            {AMOUNTS.map(a => (
              <button key={a}
                onClick={() => { setAmount(a); setCustom(''); }}
                style={{ ...s.amountBtn, ...(amount === a && !custom ? s.amountBtnActive : {}) }}>
                {a.toLocaleString('ru-RU')} ₸
              </button>
            ))}
          </div>
          <input
            type='number'
            placeholder='Своя сумма ₸'
            value={custom}
            onChange={e => { setCustom(e.target.value); setAmount(0); }}
            style={{ ...s.input, ...(custom ? s.inputActive : {}) }}
          />
        </div>

        {/* payment method */}
        <div>
          <p style={s.label}>Способ оплаты</p>

          {/* main two tabs */}
          <div style={s.methodTabs}>
            <button
              onClick={() => setMethod('kaspi')}
              style={{ ...s.methodTab, ...(method === 'kaspi' ? s.methodTabActive : {}) }}
            >
              <img src={KASPI_LOGO} alt='Kaspi'
                style={{ height: 18, objectFit: 'contain',
                  filter: method === 'kaspi' ? 'brightness(0) invert(1)' : 'none' }} />
              <span>Kaspi</span>
            </button>
            <button
              onClick={() => setMethod('card')}
              style={{ ...s.methodTab, ...(method === 'card' ? s.methodTabActive : {}) }}
            >
              <span style={{ fontSize: 16 }}>💳</span>
              <span>По карте</span>
            </button>
          </div>

          {/* others dropdown */}
          <div style={{ position: 'relative', marginTop: 8 }}>
            <button
              onClick={() => setOthersOpen(v => !v)}
              style={{
                ...s.othersToggle,
                ...(isOther ? s.othersToggleSelected : {}),
              }}
            >
              {isOther && selectedOther ? (
                <>
                  <LogoBadge color={selectedOther.color} letter={selectedOther.letter} size={24} />
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>{selectedOther.name}</span>
                </>
              ) : (
                <span style={{ flex: 1, textAlign: 'left', fontSize: 13, color: '#555' }}>
                  Другие способы оплаты
                </span>
              )}
              <span style={{ fontSize: 11, color: '#aaa', transition: 'transform .2s',
                display: 'inline-block', transform: othersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {othersOpen && (
              <div style={s.dropdown}>
                {OTHER_METHODS.map(m => (
                  <button key={m.id} onClick={() => selectOther(m.id)} style={s.dropdownItem}>
                    <LogoBadge color={m.color} letter={m.letter} size={32} />
                    <span style={{ fontSize: 13, color: '#222', textAlign: 'left', flex: 1 }}>{m.name}</span>
                    {method === m.id && <span style={{ color: '#1e5fc0', fontSize: 14 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* pay button */}
        <button
          onClick={handlePay}
          disabled={paying}
          style={{ ...s.payBtn, opacity: paying ? 0.7 : 1, background: payBtnColor() }}
        >
          {payLabel()}
        </button>

        <p style={s.footer}>
          Платежи защищены · Powered by{' '}
          <a href='https://shanyrak.world' target='_blank' rel='noopener noreferrer'
            style={{ color: '#1e5fc0', textDecoration: 'none' }}>
            Шаңырақ
          </a>
        </p>
      </div>
    </div>
  );
}

/* ── styles ── */
const s = {
  wrap: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#fff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  center: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh',
  },
  spinner: {
    width: 32, height: 32, borderRadius: '50%',
    border: '2.5px solid #1e5fc0', borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    padding: '14px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #f2f2f2',
  },
  headerLeft: { display: 'flex', alignItems: 'center' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 6 },
  closeBtn: {
    marginLeft: 6, background: 'none', border: 'none',
    color: '#bbb', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px',
  },
  hero: {
    background: 'linear-gradient(180deg, #e8f0fb 0%, #fff 100%)',
    padding: '22px 20px 18px',
  },
  heroTitle: { margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0d1e3d', lineHeight: 1.2 },
  heroSub:   { margin: 0, fontSize: 13, color: '#555' },
  body: {
    padding: '20px 20px 24px',
    display: 'flex', flexDirection: 'column', gap: 16, flex: 1,
  },
  label: {
    fontSize: 11, fontWeight: 700, color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
  },
  amountGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8,
  },
  amountBtn: {
    padding: '11px 4px', borderRadius: 12, border: '1.5px solid #e5e5e5',
    background: '#f5f5f5', color: '#333', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all .15s',
  },
  amountBtnActive: {
    background: G_BLUE,
    borderColor: 'transparent', color: '#fff',
  },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: 12,
    border: '1.5px solid #e5e5e5', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', background: '#fafafa', color: '#333',
  },
  inputActive: { borderColor: '#1e5fc0', background: '#fff' },
  methodTabs: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
  },
  methodTab: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '11px 8px', borderRadius: 12, border: '1.5px solid #e5e5e5',
    background: '#f5f5f5', color: '#333', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all .15s',
  },
  methodTabActive: {
    background: G_BLUE,
    borderColor: 'transparent', color: '#fff',
  },
  othersToggle: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e5e5e5',
    background: '#f9f9f9', cursor: 'pointer', boxSizing: 'border-box',
  },
  othersToggleSelected: {
    borderColor: '#1e5fc0', background: '#f0f5ff',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
    background: '#fff', borderRadius: 14, border: '1.5px solid #e5e5e5',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 50, overflow: 'hidden',
  },
  dropdownItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', background: 'none', border: 'none',
    cursor: 'pointer', boxSizing: 'border-box',
    borderBottom: '1px solid #f5f5f5', transition: 'background .1s',
  },
  payBtn: {
    width: '100%', padding: '15px', borderRadius: 16,
    border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', transition: 'all .15s',
  },
  footer: { textAlign: 'center', fontSize: 11, color: '#bbb', margin: 0 },
  linkBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: '#1e5fc0', textDecoration: 'underline',
  },
};
