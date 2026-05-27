import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getVisitorId } from '../utils/fingerprint';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = 'https://bvxccwndrkvnwmfbfhql.supabase.co';
const G = 'linear-gradient(135deg, #1e6b4e, #5ec49a)';
const IS_POPUP = window.self !== window.top;

const TABS = [
  { id: 'subscribe', label: '🔄 Подписка',     desc: 'Ежемесячно' },
  { id: 'kaspi',     label: '📱 Kaspi бонусы', desc: 'Бонусами' },
  { id: 'once',      label: '💳 Разово',        desc: 'Один раз'  },
];

const AMOUNTS_SUB  = [500, 1000, 2000, 5000];
const AMOUNTS_ONCE = [1000, 2000, 5000, 10000];

export default function WidgetSubscribePage() {
  const { fundId } = useParams();

  const [fund, setFund]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('subscribe');
  const [amount, setAmount]       = useState(1000);
  const [custom, setCustom]       = useState('');
  const [paying, setPaying]       = useState(false);
  const [done, setDone]           = useState(false);

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

  // reset amount when switching tabs
  useEffect(() => {
    setAmount(tab === 'once' ? 1000 : 1000);
    setCustom('');
  }, [tab]);

  const finalAmount = custom ? parseInt(custom) : amount;
  const amountList  = tab === 'once' ? AMOUNTS_ONCE : AMOUNTS_SUB;

  async function handlePay() {
    if (!finalAmount || finalAmount < 100) {
      toast.error('Минимальная сумма — 100 ₸');
      return;
    }
    setPaying(true);
    try {
      const visitorId = await getVisitorId();

      // find any beneficiary of this fund to attach payment
      const { data: bens } = await supabase
        .from('beneficiaries')
        .select('id, title')
        .eq('is_active', true)
        .eq('partner_fund', fund.name)
        .limit(1);

      const ben = bens && bens[0];
      if (!ben) throw new Error('У фонда пока нет активных подопечных');

      const res = await fetch(`${SUPABASE_URL}/functions/v1/xpayment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          beneficiaryId: ben.id,
          title: ben.title,
          fundId: fund.id,
          visitorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка оплаты');

      if (IS_POPUP) {
        window.parent.postMessage({ type: 'shanyrak:open-url', url: data.qr_token }, '*');
      } else {
        window.location.href = data.qr_token;
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
    <div style={styles.center}>
      <div style={styles.spinner} />
    </div>
  );

  if (!fund) return (
    <div style={styles.center}>
      <p style={{ color: '#888', fontSize: 14 }}>Фонд не найден</p>
    </div>
  );

  /* ── success ── */
  if (done) return (
    <div style={{ ...styles.wrap, ...styles.center, flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 52 }}>💚</div>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Спасибо!</p>
      <p style={{ fontSize: 13, color: '#666', maxWidth: 260 }}>
        Платёж обрабатывается. Ваша помощь делает мир лучше.
      </p>
      <button onClick={() => setDone(false)} style={styles.linkBtn}>Помочь ещё раз</button>
      {IS_POPUP && <button onClick={close} style={{ ...styles.linkBtn, color: '#aaa' }}>Закрыть</button>}
    </div>
  );

  /* ── main ── */
  return (
    <div style={styles.wrap}>
      <Toaster position='top-center' toastOptions={{ style: { fontSize: 13 } }} />

      {/* ── header ── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {fund.logo_url
            ? <img src={fund.logo_url} alt={fund.name} style={{ height: 36, maxWidth: 110, objectFit: 'contain' }} />
            : <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{fund.name}</span>
          }
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/14.png'
            alt='Шаңырақ' style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.5 }} />
          <span style={{ fontSize: 11, color: '#bbb' }}>Шаңырақ</span>
          {IS_POPUP && (
            <button onClick={close} style={styles.closeBtn}>✕</button>
          )}
        </div>
      </div>

      {/* ── hero text ── */}
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>
          {tab === 'subscribe' && 'Поддержите фонд ежемесячно'}
          {tab === 'kaspi'     && 'Помогите бонусами Kaspi'}
          {tab === 'once'      && 'Сделайте разовый вклад'}
        </h2>
        <p style={styles.heroSub}>
          {tab === 'subscribe' && 'Регулярная поддержка помогает планировать помощь надолго вперёд'}
          {tab === 'kaspi'     && 'Потратьте накопленные бонусы Kaspi Gold на реальную помощь'}
          {tab === 'once'      && 'Любая сумма важна — даже разовый вклад меняет чью-то жизнь'}
        </p>
      </div>

      {/* ── tabs ── */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.body}>

        {/* ── amount ── */}
        <div>
          <p style={styles.label}>
            Сумма{tab === 'subscribe' ? ' в месяц' : ''}
          </p>
          <div style={styles.amountGrid}>
            {amountList.map(a => (
              <button key={a} onClick={() => { setAmount(a); setCustom(''); }}
                style={{
                  ...styles.amountBtn,
                  ...(amount === a && !custom ? styles.amountBtnActive : {}),
                }}>
                {a.toLocaleString('ru-RU')} ₸
              </button>
            ))}
          </div>
          <input
            type='number'
            placeholder='Своя сумма ₸'
            value={custom}
            onChange={e => { setCustom(e.target.value); setAmount(0); }}
            style={{ ...styles.input, ...(custom ? styles.inputActive : {}) }}
          />
        </div>

        {/* ── kaspi bonus note ── */}
        {tab === 'kaspi' && (
          <div style={styles.noteBox}>
            <span style={{ fontSize: 18 }}>💛</span>
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
              Бонусы Kaspi Gold можно потратить на помощь подопечным. Курс 1 бонус = 1 тенге.
              После нажатия кнопки откроется Kaspi Pay.
            </p>
          </div>
        )}

        {/* ── subscribe note ── */}
        {tab === 'subscribe' && (
          <div style={{ ...styles.noteBox, background: '#f0faf5', borderColor: '#b2e8d0' }}>
            <span style={{ fontSize: 18 }}>🔄</span>
            <p style={{ fontSize: 12, color: '#2f6b50', lineHeight: 1.5 }}>
              Списывается автоматически каждый месяц. Отменить можно в любой момент.
            </p>
          </div>
        )}

        {/* ── pay button ── */}
        <button onClick={handlePay} disabled={paying}
          style={{
            ...styles.payBtn,
            opacity: paying ? 0.7 : 1,
            background: tab === 'kaspi' ? '#ef3340' : G,
          }}>
          {paying ? 'Обрабатываем...' : (
            tab === 'subscribe' ? `Подписаться · ${finalAmount ? finalAmount.toLocaleString('ru-RU') + ' ₸/мес' : ''}` :
            tab === 'kaspi'     ? `Помочь бонусами · ${finalAmount ? finalAmount.toLocaleString('ru-RU') + ' ₸' : ''}` :
                                  `Помочь · ${finalAmount ? finalAmount.toLocaleString('ru-RU') + ' ₸' : ''}`
          )}
        </button>

        <p style={styles.footer}>
          Платежи защищены · Powered by{' '}
          <a href='https://shanyrak.world' target='_blank' rel='noopener noreferrer'
            style={{ color: '#2f8f6a', textDecoration: 'none' }}>
            Шаңырақ
          </a>
        </p>
      </div>
    </div>
  );
}

/* ── styles ── */
const styles = {
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
    border: '2.5px solid #2f8f6a', borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    padding: '16px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #f2f2f2',
  },
  closeBtn: {
    marginLeft: 8, background: 'none', border: 'none',
    color: '#bbb', cursor: 'pointer', fontSize: 16, lineHeight: 1,
    padding: '2px 4px',
  },
  hero: {
    padding: '20px 20px 0',
    background: 'linear-gradient(180deg, #f0faf5 0%, #fff 100%)',
  },
  heroTitle: {
    margin: '0 0 6px', fontSize: 20, fontWeight: 800,
    color: '#0f1f17', lineHeight: 1.2,
  },
  heroSub: {
    margin: '0 0 16px', fontSize: 13, color: '#555', lineHeight: 1.5,
  },
  tabs: {
    display: 'flex', gap: 6, padding: '0 20px 16px',
    background: 'linear-gradient(180deg, #f0faf5 0%, #fff 100%)',
  },
  tab: {
    flex: 1, padding: '8px 4px', borderRadius: 12, border: '1.5px solid #e5e5e5',
    background: '#f9f9f9', color: '#666', fontSize: 11, fontWeight: 600,
    cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
  },
  tabActive: {
    background: '#e8f8f2', borderColor: '#2f8f6a', color: '#1e6b4e',
  },
  body: {
    padding: '0 20px 20px',
    display: 'flex', flexDirection: 'column', gap: 14, flex: 1,
  },
  label: {
    fontSize: 11, fontWeight: 700, color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
  },
  amountGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8,
  },
  amountBtn: {
    padding: '10px 4px', borderRadius: 12, border: '1.5px solid #e5e5e5',
    background: '#f5f5f5', color: '#333', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all .15s',
  },
  amountBtnActive: {
    background: 'linear-gradient(135deg, #1e6b4e, #5ec49a)',
    borderColor: 'transparent', color: '#fff',
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid #e5e5e5', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', background: '#fafafa', color: '#333',
  },
  inputActive: {
    borderColor: '#2f8f6a', background: '#fff',
  },
  noteBox: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: '#fffbea', border: '1px solid #fde68a',
    borderRadius: 12, padding: '10px 12px',
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
    fontSize: 13, color: '#2f8f6a', textDecoration: 'underline',
  },
};
