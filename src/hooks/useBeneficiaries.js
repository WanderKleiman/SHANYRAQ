import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useBeneficiaries(category = null, city = null) {
  console.log('Hook получил:', { category, city }); // для отладки
  
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchBeneficiaries() {
      setLoading(true)
      setError(null)
      
      try {
        let query = supabase
          .from('beneficiaries')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        
        if (category && category !== 'all') {
          query = query.eq('category', category)
        }
        
       if (city && city !== 'all' && city !== 'Все города') {
  // Показываем подопечных из выбранного города ИЛИ тех, кто для всех городов
  query = query.or(`city.eq.${city},is_nationwide.eq.true`)
}
        
        const { data, error } = await query
        
        if (error) throw error
        
        setBeneficiaries(data || [])
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBeneficiaries()
  }, [category, city])

  return { beneficiaries, loading, error }
}
