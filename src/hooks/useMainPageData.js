import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useMainPageData() {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalRaised, setTotalRaised] = useState(0);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all active beneficiaries
        const { data: benData, error: benError } = await supabase
          .from('beneficiaries')
          .select('id, title, description, category, city, partner_fund, target_amount, raised_amount, image_url, images, videos, is_urgent, is_nationwide, collection_status, helpers_count, documents_link')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (benError) throw benError;
        setBeneficiaries(benData || []);

        // Compute category counts
        const counts = {};
        (benData || []).forEach(b => {
          counts[b.category] = (counts[b.category] || 0) + 1;
        });
        setCategoryCounts(counts);

        // Fetch total raised from paid payments
        const { data: totalData, error: totalError } = await supabase
          .from('kaspi_payment_requests')
          .select('amount')
          .eq('status', 'paid');

        if (totalError) throw totalError;
        const sum = (totalData || []).reduce((acc, r) => acc + (r.amount || 0), 0);
        setTotalRaised(sum);
      } catch (err) {
        console.error('Error loading main page data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { categoryCounts, totalRaised, beneficiaries, loading };
}
