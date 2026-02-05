import React from 'react';
import Icon from './Icon';

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
    <div className='px-4'>
      <div className='flex space-x-2 overflow-x-auto scrollbar-hide'>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`category-tab flex items-center space-x-2 whitespace-nowrap ${
              activeCategory === category.id ? 'active' : 'inactive'
            }`}
          >
            <Icon name={category.icon} size={16} />
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs;