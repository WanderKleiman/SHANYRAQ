import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useMainPageData() {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalRaised, setTotalRaised] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all active beneficiaries
        const { data: benData, error: benError } = await supabase
          .from('beneficiaries')
          .select('id, title, description, category, city, partner_fund, target_amount, raised_amount, image_url, images, videos, is_urgent, is_nationwide, collection_status, helpers_count, documents_link, focal_x, focal_y')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (benError) throw benError;
        setBeneficiaries(benData || []);

        // Compute category counts and total target
        const counts = {};
        let target = 0;
        let raised = 0;
        (benData || []).forEach(b => {
          counts[b.category] = (counts[b.category] || 0) + 1;
          target += b.target_amount || 0;
          raised += b.raised_amount || 0;
        });
        setCategoryCounts(counts);
        setTotalTarget(target);
        setTotalRaised(raised);

      } catch (err) {
        console.error('Error loading main page data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { categoryCounts, totalRaised, totalTarget, beneficiaries, loading };
}
