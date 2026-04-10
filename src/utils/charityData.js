export function getCategoryName(category) {
  const categories = {
    children: 'Дети',
    urgent: 'Взрослые',
    operations: 'Пожилые',
    animals: 'Животные',
    social: 'Социальные проекты',
    non_material: 'Нематериальная помощь'
  };
  return categories[category] || category;
}