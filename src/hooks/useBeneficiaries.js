import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useBeneficiaries(category = null, city = null) {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false;

    async function fetchBeneficiaries() {
      setLoading(true)
      setError(null)
      
      try {
        let query = supabase
          .from('beneficiaries')
          .select('id, title, description, category, city, partner_fund, target_amount, raised_amount, image_url, images, videos, is_urgent, is_nationwide, collection_status, helpers_count, documents_link')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        
        if (category && category !== 'all') {
          query = query.eq('category', category)
        }
        
        if (city && city !== 'all' && city !== 'Все города' && city !== 'Вся страна') {
          query = query.or(`city.eq.${city},is_nationwide.eq.true`)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        if (!cancelled) {
          let results = data || []
          // Скрываем карточки "Донорство" когда выбрана "Вся страна"
          if (!city || city === 'all' || city === 'Все города' || city === 'Вся страна') {
            results = results.filter(b => !b.title?.toLowerCase().includes('донорство'))
          }
          setBeneficiaries(results)
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchBeneficiaries();

    return () => {
      cancelled = true;
    }
  }, [category, city])

  return { beneficiaries, loading, error }
}
