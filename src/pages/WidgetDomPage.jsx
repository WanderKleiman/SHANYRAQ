import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getVisitorId } from '../utils/fingerprint';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = 'https://bvxccwndrkvnwmfbfhql.supabase.co';
const KASPI_LOGO = `${SUPABASE_URL}/storage/v1/object/public/images/png-klev-club-xxta-p-kaspii-logotip-png-10.png`;
const SHANYRAK_LOGO = `${SUPABASE_URL}/storage/v1/object/public/images/14.png`;
const IS_POPUP = window.self !== window.top;

// Blue gradient theme
const G = 'linear-gradient(135deg, #1a3a6b 0%, #1e5fc0 50%, #4d9de0 100%)';
const AMOUNTS = [500, 1000, 2000, 5000];

export default function WidgetDomPage() {
  const { fundId } = useParams();

  const [fund, setFund]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount]   = useState(1000);
  const [custom, setCustom]   = useState('');
  const [paying, setPaying]   = useState(false);
  const [done, setDone]       = useState(false);

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

  async function handlePay() {
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
        body: JSON.stringify({
          amount: finalAmount,
          fundId: fund.id,
          fundName: fund.name,
          visitorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка оплаты');

      if (IS_POPUP) {
        window.parent.postMessage({ type: 'shanyrak:open-url', url: data.qr_token }, '*');
      } else {
        window.open(data.qr_token, '_blank');
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

  /* ── loading ── */
  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
    </div>
  );

  if (!fund) return (
    <div style={s.center}>
      <p style={{ color: '#888', fontSize: 14 }}>Фонд не найден</p>
    </div>
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
          {IS_POPUP && (
            <button onClick={close} style={s.closeBtn}>✕</button>
          )}
        </div>
      </div>

      {/* hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <h2 style={s.heroTitle}>Поддержите фонд</h2>
          <p style={s.heroSub}>{fund.name}</p>
        </div>
      </div>

      {/* body */}
      <div style={s.body}>

        {/* amount */}
        <div>
          <p style={s.label}>Сумма помощи</p>
          <div style={s.amountGrid}>
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustom(''); }}
                style={{
                  ...s.amountBtn,
                  ...(amount === a && !custom ? s.amountBtnActive : {}),
                }}
              >
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

        {/* pay button */}
        <button
          onClick={handlePay}
          disabled={paying}
          style={{ ...s.payBtn, opacity: paying ? 0.7 : 1, background: G }}
        >
          {paying ? 'Обрабатываем...' : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <img src={KASPI_LOGO} alt='Kaspi' style={{ height: 20, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span>Оплатить через Kaspi{finalAmount ? ` · ${finalAmount.toLocaleString('ru-RU')} ₸` : ''}</span>
            </span>
          )}
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
  headerLeft: {
    display: 'flex', alignItems: 'center',
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  closeBtn: {
    marginLeft: 6, background: 'none', border: 'none',
    color: '#bbb', cursor: 'pointer', fontSize: 16, lineHeight: 1,
    padding: '2px 4px',
  },
  hero: {
    background: 'linear-gradient(180deg, #e8f0fb 0%, #fff 100%)',
    padding: '22px 20px 18px',
  },
  heroInner: {},
  heroTitle: {
    margin: '0 0 4px', fontSize: 22, fontWeight: 800,
    color: '#0d1e3d', lineHeight: 1.2,
  },
  heroSub: {
    margin: 0, fontSize: 13, color: '#555',
  },
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
    background: 'linear-gradient(135deg, #1a3a6b 0%, #1e5fc0 50%, #4d9de0 100%)',
    borderColor: 'transparent', color: '#fff',
  },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: 12,
    border: '1.5px solid #e5e5e5', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', background: '#fafafa', color: '#333',
  },
  inputActive: {
    borderColor: '#1e5fc0', background: '#fff',
  },
  payBtn: {
    width: '100%', padding: '15px', borderRadius: 16,
    border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', transition: 'opacity .15s',
  },
  footer: {
    textAlign: 'center', fontSize: 11, color: '#bbb', margin: 0,
  },
  linkBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: '#1e5fc0', textDecoration: 'underline',
  },
};
