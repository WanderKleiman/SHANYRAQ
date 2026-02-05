const partnerFunds = require('./partner_fund_2026-02-05.json');
const beneficiaries = require('./charity_beneficiary_2026-02-05.json');

// Ваши ключи из Supabase (получим на следующем шаге)
const SUPABASE_URL = 'https://bvxccwndrkvnwmfbfhql.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2eGNjd25kcmt2bndtZmJmaHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjE0NjAsImV4cCI6MjA4NTc5NzQ2MH0.hGWnNGkhg1htJTMtGd74y_hTJX6zMcPhQqd6ZVQO7UA';

async function importData() {
  console.log('🔄 Начинаем импорт данных...\n');

  // Импорт фондов-партнеров
  console.log('📦 Импорт фондов-партнеров...');
  for (const item of partnerFunds) {
    const data = {
      trickle_id: item.objectId,
      name: item.objectData.name,
      description: item.objectData.description,
      logo_url: item.objectData.logo_url,
      is_verified: item.objectData.is_verified === true || item.objectData.is_verified === 'true',
      created_at: item.objectData.created_at || item.createdAt
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/partner_funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log(`  ✅ ${data.name}`);
      } else {
        console.log(`  ❌ Ошибка: ${data.name} - ${await response.text()}`);
      }
    } catch (error) {
      console.log(`  ❌ Ошибка: ${data.name} - ${error.message}`);
    }
  }

  // Импорт подопечных
  console.log('\n📦 Импорт подопечных...');
  for (const item of beneficiaries) {
    // Пропускаем пустые записи
    if (!item.objectData || Object.keys(item.objectData).length === 0) {
      continue;
    }

    const data = {
      trickle_id: item.objectId,
      title: item.objectData.title,
      description: item.objectData.description,
      category: item.objectData.category,
      city: item.objectData.city,
      partner_fund: item.objectData.partner_fund,
      target_amount: item.objectData.target_amount || 0,
      raised_amount: item.objectData.raised_amount || 0,
      image_url: item.objectData.image_url,
      images: item.objectData.images || [],
      videos: item.objectData.videos || [],
      helpers_count: item.objectData.helpers_count,
      is_active: item.objectData.is_active !== false,
      is_urgent: item.objectData.is_urgent === true || item.objectData.is_urgent === 'true',
      is_nationwide: item.objectData.is_nationwide === true,
      collection_status: item.objectData.collection_status || 'active',
      completion_date: item.objectData.completion_date,
      report_photos: item.objectData.report_photos || [],
      report_videos: item.objectData.report_videos || [],
      report_description: item.objectData.report_description,
      documents_link: item.objectData.documents_link,
      created_at: item.createdAt,
      updated_at: item.updatedAt
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/beneficiaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log(`  ✅ ${data.title || 'Без названия'}`);
      } else {
        console.log(`  ❌ Ошибка: ${data.title} - ${await response.text()}`);
      }
    } catch (error) {
      console.log(`  ❌ Ошибка: ${data.title} - ${error.message}`);
    }
  }

  console.log('\n✨ Импорт завершён!');
}

importData();

