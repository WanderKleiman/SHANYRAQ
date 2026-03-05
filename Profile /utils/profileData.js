async function getUserProfile() {
  try {
    const mockUserId = 'user_001';
    const donations = await getUserDonations(mockUserId);
    
    const totalHelp = donations.reduce((sum, d) => sum + d.amount, 0);
    const helpedByCategory = groupDonationsByCategory(donations);

    return {
      id: mockUserId,
      name: 'Александр Клейман',
      totalHelp: totalHelp,
      helpedByCategory: helpedByCategory
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      id: 'user_001',
      name: 'Пользователь',
      totalHelp: 0,
      helpedByCategory: {}
    };
  }
}

async function getUserDonations(userId) {
  const mockDonations = [
    {
      beneficiaryId: 'ben_001',
      name: 'Юрий Иванович',
      category: 'operations',
      amount: 3000,
      image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&q=80',
      date: '2026-02-15'
    },
    {
      beneficiaryId: 'ben_002',
      name: 'Айгерим Сериковна',
      category: 'children',
      amount: 5000,
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
      date: '2026-02-10'
    },
    {
      beneficiaryId: 'ben_003',
      name: 'Марат Жумабаев',
      category: 'operations',
      amount: 2500,
      image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&q=80',
      date: '2026-02-12'
    },
    {
      beneficiaryId: 'ben_004',
      name: 'Алия Нурбекова',
      category: 'operations',
      amount: 4000,
      image: 'https://images.unsplash.com/photo-1594824595269-1c9e1e2a7bdd?w=400&q=80',
      date: '2026-02-08'
    },
    {
      beneficiaryId: 'ben_005',
      name: 'Ермек Садыков',
      category: 'operations',
      amount: 3500,
      image: 'https://images.unsplash.com/photo-1546456073-ea246a7bd25f?w=400&q=80',
      date: '2026-02-05'
    },
    {
      beneficiaryId: 'ben_006',
      name: 'Динара Касымова',
      category: 'operations',
      amount: 2800,
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&q=80',
      date: '2026-02-01'
    }
  ];

  return mockDonations.map(d => ({
    ...d,
    id: d.beneficiaryId
  }));
}

function groupDonationsByCategory(donations) {
  const grouped = {};
  
  donations.forEach(donation => {
    if (!grouped[donation.category]) {
      grouped[donation.category] = [];
    }
    
    grouped[donation.category].push({
      id: donation.id,
      name: donation.name,
      image: donation.image,
      helpAmount: donation.amount,
      date: donation.date
    });
  });

  return grouped;
}