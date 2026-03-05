function CategoryTabs({ activeCategory, onCategoryChange }) {
  const categories = [
    { id: 'all', name: 'Все', icon: 'grid-3x3' },
    { id: 'children', name: 'Дети', icon: 'baby' },
    { id: 'urgent', name: 'Взрослые', icon: 'user' },
    { id: 'operations', name: 'Пожилые', icon: 'user-round' },
    { id: 'animals', name: 'Животные', icon: 'heart' },
    { id: 'social', name: 'Социальные программы', icon: 'users' },
    { id: 'non_material', name: 'Не материальная помощь', icon: 'hand-helping' }
  ];

  return (
    <div className='px-4' data-name='category-tabs' data-file='components/CategoryTabs.js'>
      <div className='flex space-x-2 overflow-x-auto scrollbar-hide'>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-2 ${
              activeCategory === category.id 
                ? 'bg-[var(--primary-color)] text-white' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            <div className={`icon-${category.icon} text-sm`} />
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}