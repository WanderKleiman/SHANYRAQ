import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getVisitorId } from '../utils/fingerprint';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = 'https://bvxccwndrkvnwmfbfhql.supabase.co';
const G  = 'linear-gradient(135deg, #1e6b4e, #5ec49a)';
const GB = 'linear-gradient(160deg, #0f4f35 0%, #1e7a52 50%, #3aab78 100%)';

const AMOUNTS = [500, 1000, 2000, 5000];
const TABS = [
  { id: 'subscribe', icon: '🔄', label: 'Подписка',     sub: 'ежемесячно' },
  { id: 'once',      icon: '💳', label: 'Разово',        sub: 'один раз'  },
  { id: 'kaspi',     icon: '📱', label: 'Kaspi бонусы', sub: 'бонусами'  },
];

const CAT = {
  children: 'Дети', animals: 'Питомцы', urgent: 'Взрослые',
  operations: 'Пожилые', social: 'Соц. проект',
};

export default function FundLandingPage() {
  const { fundId } = useParams();

  const [fund, setFund]       = useState(null);
  const [bens, setBens]       = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab]         = useState('subscribe');
  const [amount, setAmount]   = useState(1000);
  const [custom, setCustom]   = useState('');
  const [selBen, setSelBen]   = useState(null);
  const [paying, setPaying]   = useState(false);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: b }] = await Promise.all([
        supabase.from('partner_funds').select('*').eq('id', fundId).single(),
        supabase.from('beneficiaries')
          .select('id,title,description,image_url,images,raised_amount,target_amount,category,city,is_urgent')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      setFund(f);
      // filter by fund name after fetch (partner_fund field)
      const filtered = b ? b.filter(x => f && x.partner_fund === f.name) : [];
      // if no fund-specific bens, show all (fallback)
      setBens(filtered.length ? filtered : (b || []).slice(0, 6));
      if (filtered.length) setSelBen(filtered[0]);
      else if (b && b[0]) setSelBen(b[0]);
      setLoading(false);
    }
    if (fundId) load();
  }, [fundId]);

  useEffect(() => { setCustom(''); setAmount(1000); }, [tab]);

  const finalAmount = custom ? parseInt(custom) : amount;
  const ig = fund?.social_links?.instagram;
  const wa = fund?.social_links?.whatsapp;

  async function handlePay() {
    if (!finalAmount || finalAmount < 100) { toast.error('Минимальная сумма — 100 ₸'); return; }
    if (!selBen) { toast.error('Нет доступных подопечных'); return; }
    setPaying(true);
    try {
      const visitorId = await getVisitorId();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/xpayment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount, beneficiaryId: selBen.id,
          title: selBen.title, fundId: fund.id, visitorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      window.location.href = data.qr_token;
      setDone(true);
    } catch (e) {
      toast.error(e.message || 'Произошла ошибка');
    } finally {
      setPaying(false);
    }
  }

  // ── loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f9f8' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #2f8f6a', borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!fund) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Страница не найдена</p>
    </div>
  );

  const totalRaised = bens.reduce((s, b) => s + (b.raised_amount || 0), 0);

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', background: '#f7f9f8', minHeight: '100vh' }}>
      <Toaster position='top-center' toastOptions={{ style: { fontSize: 13 } }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{ background: GB, position: 'relative', overflow: 'hidden', paddingBottom: 48 }}>
        {/* blob */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(126,241,208,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* logo row */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {fund.logo_url ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '8px 14px', display: 'inline-flex', alignItems: 'center' }}>
              <img src={fund.logo_url} alt={fund.name} style={{ height: 44, maxWidth: 140, objectFit: 'contain' }} />
            </div>
          ) : (
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{fund.name}</span>
          )}
          {fund.is_verified && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>✅</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600 }}>Верифицирован</span>
            </div>
          )}
        </div>

        {/* headline */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 24px 0' }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(24px,5vw,38px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 14px' }}>
            {fund.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 520 }}>
            {fund.description}
          </p>

          {/* stats */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { v: '35 000+', l: 'семей получили помощь' },
              { v: fund.location || 'Казахстан', l: 'город присутствия' },
              { v: new Date(fund.founded_date).getFullYear(), l: 'год основания' },
            ].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 18px', backdropFilter: 'blur(8px)' }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{s.v}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DONATION CARD (overlap) ───────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: '-32px auto 0', padding: '0 16px' }}>
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', overflow: 'hidden' }}>

          {/* tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #f0f0f0' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '16px 8px', border: 'none', cursor: 'pointer', background: 'none',
                borderBottom: tab === t.id ? '2.5px solid #2f8f6a' : '2.5px solid transparent',
                transition: 'all .15s',
              }}>
                <div style={{ fontSize: 20, marginBottom: 3 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: tab === t.id ? '#1e6b4e' : '#444' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{t.sub}</div>
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 20px 24px' }}>
            {/* context message */}
            <div style={{
              background: tab === 'subscribe' ? '#f0faf5' : tab === 'kaspi' ? '#fff8f0' : '#f5f5ff',
              borderRadius: 12, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>
                {tab === 'subscribe' ? '💚' : tab === 'kaspi' ? '💛' : '🤝'}
              </span>
              <p style={{ margin: 0, fontSize: 13, color: '#444', lineHeight: 1.55 }}>
                {tab === 'subscribe' && 'Регулярные взносы позволяют фонду планировать закупки продуктов заранее. Списание происходит автоматически каждый месяц.'}
                {tab === 'kaspi' && 'Ваши бонусы Kaspi Gold превращаются в реальную продуктовую помощь. 1 бонус = 1 тенге.'}
                {tab === 'once' && 'Каждые 10 000 ₸ — это полная продуктовая корзина для одной семьи на месяц.'}
              </p>
            </div>

            {/* beneficiary selector (compact) */}
            {bens.length > 1 && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                  Куда пойдут деньги
                </p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {bens.map(b => (
                    <button key={b.id} onClick={() => setSelBen(b)} style={{
                      flexShrink: 0, padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: selBen?.id === b.id ? '1.5px solid #2f8f6a' : '1.5px solid #e5e5e5',
                      background: selBen?.id === b.id ? '#e8f8f2' : '#f9f9f9',
                      color: selBen?.id === b.id ? '#1e6b4e' : '#555',
                      transition: 'all .15s', whiteSpace: 'nowrap',
                    }}>
                      {b.title.length > 28 ? b.title.slice(0, 28) + '…' : b.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* amount */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
              Сумма{tab === 'subscribe' ? ' в месяц' : ''}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setAmount(a); setCustom(''); }} style={{
                  padding: '11px 4px', borderRadius: 12, border: '1.5px solid transparent', cursor: 'pointer',
                  background: amount === a && !custom ? G : '#f2f2f2',
                  color: amount === a && !custom ? 'white' : '#333',
                  fontSize: 13, fontWeight: 700, transition: 'all .15s',
                }}>
                  {a.toLocaleString('ru-RU')}
                </button>
              ))}
            </div>
            <input
              type='number' placeholder='Своя сумма ₸' value={custom}
              onChange={e => { setCustom(e.target.value); setAmount(0); }}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 12, marginBottom: 16,
                border: `1.5px solid ${custom ? '#2f8f6a' : '#e5e5e5'}`,
                fontSize: 13, outline: 'none', background: custom ? 'white' : '#fafafa', color: '#333',
              }}
            />

            {/* pay button */}
            <button onClick={handlePay} disabled={paying} style={{
              width: '100%', padding: '16px', borderRadius: 16, border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
              background: tab === 'kaspi' ? '#ef3340' : G,
              color: 'white', fontWeight: 800, fontSize: 16, opacity: paying ? 0.75 : 1, transition: 'opacity .15s',
            }}>
              {paying ? 'Обрабатываем...' : (
                tab === 'subscribe' ? `Подписаться · ${finalAmount ? finalAmount.toLocaleString('ru-RU') + ' ₸/мес' : '—'}` :
                tab === 'kaspi'     ? `Помочь бонусами · ${finalAmount ? finalAmount.toLocaleString('ru-RU') + ' ₸' : '—'}` :
                                      `Помочь · ${finalAmount ? finalAmount.toLocaleString('ru-RU') + ' ₸' : '—'}`
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', margin: '12px 0 0' }}>
              🔒 Безопасный платёж · Powered by Шаңырақ
            </p>
          </div>
        </div>
      </div>

      {/* ── BENEFICIARIES ─────────────────────────────────────────────────── */}
      {bens.length > 0 && (
        <div style={{ maxWidth: 680, margin: '40px auto 0', padding: '0 16px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f1f17', margin: '0 0 16px' }}>
            Кому помогает фонд
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bens.map(b => {
              const img = b.image_url || (b.images && b.images[0]);
              const pct = b.target_amount ? Math.min(Math.round((b.raised_amount / b.target_amount) * 100), 100) : 0;
              return (
                <div key={b.id} style={{
                  background: 'white', borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex',
                }}>
                  {/* photo */}
                  <div style={{ width: 100, flexShrink: 0, position: 'relative' }}>
                    {img
                      ? <img src={img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e8f8f2,#c8f0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🤲</div>
                    }
                    {b.is_urgent && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', borderRadius: 6, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: 'white' }}>
                        СРОЧНО
                      </div>
                    )}
                  </div>
                  {/* content */}
                  <div style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#f0faf5', color: '#2f8f6a', borderRadius: 6, padding: '2px 8px' }}>
                        {CAT[b.category] || b.category}
                      </span>
                      {b.city && (
                        <span style={{ fontSize: 10, color: '#999' }}>📍 {b.city}</span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13, color: '#111', lineHeight: 1.3 }}>
                      {b.title}
                    </p>
                    {/* progress */}
                    <div style={{ background: '#f0f0f0', borderRadius: 4, height: 5, overflow: 'hidden', marginBottom: 5 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: G, borderRadius: 4 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: '#2f8f6a', fontWeight: 700 }}>{pct}%</span>
                      <span style={{ color: '#999' }}>{(b.raised_amount || 0).toLocaleString('ru-RU')} / {(b.target_amount || 0).toLocaleString('ru-RU')} ₸</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: '36px auto 0', padding: '0 16px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: '#0f1f17' }}>О фонде</h3>
          <p style={{ margin: '0 0 18px', fontSize: 13, color: '#555', lineHeight: 1.65 }}>{fund.description}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              fund.location && { icon: '📍', text: fund.location },
              fund.bin      && { icon: '📋', text: `БИН ${fund.bin}` },
              fund.founded_date && { icon: '📅', text: `С ${new Date(fund.founded_date).getFullYear()} года` },
            ].filter(Boolean).map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f7f9f8', borderRadius: 10, padding: '6px 12px' }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* social */}
          {(ig || wa) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              {ig && (
                <a href={ig} target='_blank' rel='noopener noreferrer' style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  borderRadius: 12, textDecoration: 'none', color: 'white', fontSize: 13, fontWeight: 600,
                }}>
                  📸 Instagram
                </a>
              )}
              {wa && (
                <a href={`https://wa.me/${wa.replace(/\D/g, '')}`} target='_blank' rel='noopener noreferrer' style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  background: '#25D366', borderRadius: 12, textDecoration: 'none',
                  color: 'white', fontSize: 13, fontWeight: 600,
                }}>
                  💬 WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SECOND CTA ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: '32px auto 0', padding: '0 16px' }}>
        <div style={{ background: G, borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 18, margin: '0 0 8px' }}>
            Каждая продуктовая корзина — это накормленная семья
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 20px' }}>
            10 000 ₸ = 1 полная корзина продуктов на месяц
          </p>
          <button onClick={() => { setTab('subscribe'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ background: 'white', border: 'none', borderRadius: 50, padding: '12px 28px', fontWeight: 800, fontSize: 14, color: '#1e6b4e', cursor: 'pointer' }}>
            Поддержать фонд →
          </button>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: '32px auto 0', padding: '0 16px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <img src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/14.png'
            alt='Шаңырақ' style={{ width: 20, height: 20, objectFit: 'contain', opacity: 0.5 }} />
          <span style={{ fontSize: 12, color: '#bbb' }}>Платежи через платформу Шаңырақ</span>
        </div>
        <p style={{ fontSize: 11, color: '#ccc', margin: 0 }}>
          <a href='https://shanyrak.world' target='_blank' rel='noopener noreferrer' style={{ color: '#aaa', textDecoration: 'none' }}>
            shanyrak.world
          </a>
          {' · '}
          <a href='https://shanyrak.world/policy' target='_blank' rel='noopener noreferrer' style={{ color: '#aaa', textDecoration: 'none' }}>
            Политика конфиденциальности
          </a>
        </p>
      </div>
    </div>
  );
}
