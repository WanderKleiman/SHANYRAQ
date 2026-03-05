# Благотворительный фонд "Шанырак"

Веб-приложение благотворительного фонда в стиле Apple с функциями пожертвований и отчетности.

## ✅ Trickle Native Version

Проект работает ТОЛЬКО на Trickle хостинге с встроенной базой данных.

## Структура проекта

### Технологии
- React 18 (CDN)
- Babel Standalone
- TailwindCSS (CDN)
- Lucide Icons
- Trickle Database API

### Основные страницы
- `index.html` - Главная страница (React SPA)
- `payment.html` - Страница оплаты пожертвований
- `reports.html` - Страница отчетов
- `admin.html` - Админ-панель
- `fund.html` - Страница фонда-партнера
- `about-fund.html` - О фонде
- `documents.html` - Документы
- `contacts.html` - Контакты
- `companies.html` - Спонсоры

### React компоненты (src/)
- `src/main.jsx` - Точка входа
- `src/App.jsx` - Главный компонент
- `src/components/Header.jsx` - Заголовок
- `src/components/CategoryTabs.jsx` - Категории
- `src/components/CharityCard.jsx` - Карточка проекта
- `src/components/CharityModal.jsx` - Модальное окно
- `src/components/BottomNavigation.jsx` - Навигация
- `src/components/CitySelectionModal.jsx` - Выбор города

### Утилиты (src/utils/)
- `charityData.js` - Работа с данными подопечных
- `dataCache.js` - Кэширование данных
- `yandexMetrika.js` - Аналитика

### База данных
- `charity_beneficiary` - Подопечные
- `admin_user` - Администраторы
- `partner_fund` - Фонды-партнеры
- `company_profile` - Спонсоры

### Функциональность
- Фильтрация по категориям и городам (20 городов)
- Система пожертвований
- Отчеты о завершенных проектах
- Админ-панель для управления
- Кэширование данных (10 минут)
- Yandex Metrika аналитика
- Адаптивный дизайн

### Дизайн
- Цветовая схема: #35856c (зеленый)
- Apple-стиль дизайн
- TailwindCSS для стилизации
- Lucide иконки
- Адаптив для мобильных

## Последнее обновление
5 февраля 2026 г. - Восстановлена Trickle-native версия

### Что изменилось:
- ✅ Удалены все файлы сборки (Vite, Vercel)
- ✅ Проект работает только на Trickle хостинге
- ✅ Использует встроенную базу данных Trickle
- ✅ React 18 + CDN (без сборки)
- ✅ Все страницы открываются напрямую
- ✅ Добавлена страница экспорта базы данных (export.html)

### ⚠️ ВАЖНО:
- Проект НЕ будет работать на других хостингах
- Требует доступ к Trickle Database API
- Открывайте файлы напрямую на Trickle хостинге
