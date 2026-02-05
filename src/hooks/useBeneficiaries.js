import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useBeneficiaries(category = null, city = null) {
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
        
        if (city && city !== 'all') {
          query = query.eq('city', city)
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
