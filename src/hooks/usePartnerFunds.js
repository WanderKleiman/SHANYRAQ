import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function usePartnerFunds() {
  const [funds, setFunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchFunds() {
      try {
        const { data, error } = await supabase
          .from('partner_funds')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setFunds(data || [])
      } catch (err) {
        console.error('Ошибка загрузки фондов:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFunds()
  }, [])

  return { funds, loading, error }
}
