function CategoryHelpSection({ category, helpedList, selectedCity }) {
  const categoryInfo = {
    children: { name: 'Дети', icon: 'baby' },
    urgent: { name: 'Взрослые', icon: 'user' },
    operations: { name: 'Пожилые', icon: 'user-round' },
    animals: { name: 'Животные', icon: 'heart' },
    social: { name: 'Социальные программы', icon: 'users' },
    non_material: { name: 'Не материальная помощь', icon: 'hand-helping' }
  };

  const info = categoryInfo[category];

  const handleAddClick = () => {
    window.location.href = `index.html?category=${category}`;
  };

  return (
    <div data-name='category-help-section' data-file='components/CategoryHelpSection.js'>
      <div className='flex items-center space-x-2 mb-3'>
        <div className={`icon-${info.icon} text-lg text-[var(--primary-color)]`} />
        <h2 className='text-lg font-semibold text-[var(--text-primary)]'>{info.name}</h2>
      </div>

      <div className='overflow-x-auto scrollbar-hide'>
        <div className='flex space-x-3'>
          {helpedList.length === 0 ? (
            <EmptyCategoryCard category={category} categoryName={info.name} />
          ) : (
            <>
              {helpedList.map(item => (
                <HelpedBeneficiaryCard key={item.id} data={item} />
              ))}
              <button 
                onClick={handleAddClick}
                className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'
              >
                <div className='icon-plus text-lg text-green-600' />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
