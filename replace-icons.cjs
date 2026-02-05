const fs = require('fs');
const path = require('path');

// Маппинг иконок: className -> { name, size }
const iconReplacements = {
  'icon-map-pin': { name: 'map-pin', defaultSize: 20 },
  'icon-file-text': { name: 'file-text', defaultSize: 20 },
  'icon-menu': { name: 'menu', defaultSize: 20 },
  'icon-x': { name: 'x', defaultSize: 16 },
  'icon-info': { name: 'info', defaultSize: 20 },
  'icon-users': { name: 'users', defaultSize: 20 },
  'icon-phone': { name: 'phone', defaultSize: 20 },
  'icon-building': { name: 'building', defaultSize: 20 },
  'icon-shield': { name: 'shield', defaultSize: 20 },
  'icon-map': { name: 'map', defaultSize: 20 },
  'icon-chevron-left': { name: 'chevron-left', defaultSize: 20 },
  'icon-chevron-right': { name: 'chevron-right', defaultSize: 20 },
  'icon-external-link': { name: 'external-link', defaultSize: 16 },
  'icon-shield-check': { name: 'shield-check', defaultSize: 20 },
  'icon-share-2': { name: 'share-2', defaultSize: 20 },
  'icon-arrow-left': { name: 'arrow-left', defaultSize: 20 },
  'icon-heart': { name: 'heart', defaultSize: 20 },
  'icon-activity': { name: 'activity', defaultSize: 20 },
  'icon-zap': { name: 'zap', defaultSize: 20 },
  'icon-loader': { name: 'loader', defaultSize: 24 },
  'icon-credit-card': { name: 'credit-card', defaultSize: 20 },
  'icon-check': { name: 'check', defaultSize: 16 },
  'icon-file-edit': { name: 'file-edit', defaultSize: 20 },
  'icon-message-circle': { name: 'message-circle', defaultSize: 20 },
  'icon-mail': { name: 'mail', defaultSize: 20 },
  'icon-instagram': { name: 'instagram', defaultSize: 20 },
  'icon-settings': { name: 'settings', defaultSize: 20 },
};

// Функция для извлечения размера из Tailwind классов
function extractSize(classes) {
  if (classes.includes('text-xs')) return 12;
  if (classes.includes('text-sm')) return 16;
  if (classes.includes('text-lg')) return 20;
  if (classes.includes('text-xl')) return 24;
  if (classes.includes('text-2xl')) return 28;
  if (classes.includes('text-3xl')) return 32;
  return null;
}

// Функция замены иконок в файле
function replaceIconsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  let needsImport = false;

  // Регулярное выражение для поиска иконок
  const iconRegex = /<div className=['"]([^'"]*icon-[^'"]*)['"]\s*\/>/g;
  
  content = content.replace(iconRegex, (match, classes) => {
    // Найти какая иконка используется
    let iconName = null;
    let iconConfig = null;
    
    for (const [className, config] of Object.entries(iconReplacements)) {
      if (classes.includes(className)) {
        iconName = className;
        iconConfig = config;
        break;
      }
    }
    
    if (!iconName || !iconConfig) return match;
    
    // Извлечь размер и остальные классы
    const size = extractSize(classes) || iconConfig.defaultSize;
    const otherClasses = classes
      .replace(iconName, '')
      .replace(/text-(xs|sm|lg|xl|2xl|3xl)/g, '')
      .trim();
    
    hasChanges = true;
    needsImport = true;
    
    // Создать новый JSX для Icon компонента
    const classNameProp = otherClasses ? ` className="${otherClasses}"` : '';
    return `<Icon name="${iconConfig.name}" size={${size}}${classNameProp} />`;
  });

  // Добавить импорт Icon если нужно
  if (needsImport && !content.includes("import Icon from")) {
    // Найти где добавить импорт (после других импортов)
    const importMatch = content.match(/^(import .+\n)+/m);
    if (importMatch) {
      const lastImportEnd = importMatch[0].length;
      content = content.slice(0, lastImportEnd) + 
                "import Icon from '../components/Icon';\n" + 
                content.slice(lastImportEnd);
    } else {
      // Если импортов нет, добавить в начало
      content = "import Icon from '../components/Icon';\n\n" + content;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Обновлен: ${filePath}`);
    return true;
  }
  
  return false;
}

// Рекурсивный обход директории
function processDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      count += processDirectory(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (replaceIconsInFile(filePath)) {
        count++;
      }
    }
  }
  
  return count;
}

// Запуск скрипта
console.log('🔄 Начинаем замену иконок...\n');
const count = processDirectory('./src');
console.log(`\n✨ Готово! Обновлено файлов: ${count}`);
