import React from 'react';

function CategoryTabs({ activeCategory, onCategoryChange }) {
  const categories = [
    { id: 'all', name: 'Все', icon: 'grid-3x3' },
    { id: 'children', name: 'Дети', icon: 'baby' },
    { id: 'urgent', name: 'Срочные', icon: 'zap' },
    { id: 'operations', name: 'Операции', icon: 'activity' },
    { id: 'animals', name: 'Животные', icon: 'heart' },
    { id: 'social', name: 'Социальные программы', icon: 'users' },
    { id: 'non_material', name: 'Не материальная помощь', icon: 'hand-helping' }
  ];

  return (
    <div className='px-4' data-name='category-tabs' data-file='src/components/CategoryTabs.jsx'>
      <div className='flex space-x-2 overflow-x-auto scrollbar-hide'>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`category-tab flex items-center space-x-2 whitespace-nowrap ${
              activeCategory === category.id ? 'active' : 'inactive'
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

export default CategoryTabs;