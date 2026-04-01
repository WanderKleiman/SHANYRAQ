import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

function CategoryTabs({ activeCategory, onCategoryChange }) {
  const scrollRef = useRef(null);
  const categories = [
    { id: 'all', name: 'Все', icon: 'grid-3x3' },
    { id: 'children', name: 'Дети', icon: 'baby' },
    { id: 'urgent', name: 'Взрослые', icon: 'user' },
    { id: 'operations', name: 'Пожилые', icon: 'accessibility' },
    { id: 'animals', name: 'Животные', icon: 'paw-print' },
    { id: 'social', name: 'Социальные проекты', icon: 'users' },
    { id: 'non_material', name: 'Не материальная помощь', icon: 'hand-helping' }
  ];

  // Scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeCategory]);

  return (
    <div className='px-4'>
      <div ref={scrollRef} className='flex space-x-2 overflow-x-auto scrollbar-hide'>
        {categories.map(category => (
          <button
            key={category.id}
            data-active={activeCategory === category.id}
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