# AGENTS.md — Инструкции для AI-агентов

## SEO-фоллбек в index.html

В файле `index.html` внутри `<div id="root">` находится статический HTML-фоллбек:

```html
<div id="seo-fallback">
  <header>...</header>
  <main>...</main>
</div>
```

### Зачем он нужен

Приложение — React SPA. Поисковые краулеры (Яндекс, Google) видят пустую страницу,
пока не выполнится JavaScript. Статический фоллбек даёт краулерам текстовый контент
(заголовки, описание, ссылки, разделы) немедленно, до загрузки JS.

React заменяет содержимое `#root` при монтировании — пользователи фоллбек не видят.

### Правило: НЕ УДАЛЯТЬ без замены

**Не удаляй `<div id="seo-fallback">` и его содержимое**, если не выполнено одно из:
- Переход на SSR (Next.js, Remix, Astro)
- Настроен build-time пререндеринг (vite-plugin-ssr, react-snap, Netlify Edge)
- Настроен Dynamic Rendering (Rendertron, prerender.io) для краулеров

Без этих альтернатив удаление фоллбека обнулит SEO-индексацию.

---

## window.YandexRotorSettings

В `<head>` перед другими скриптами установлено:

```js
window.YandexRotorSettings = {
  WaitForInnerLinks: true
};
```

Это сигнал Яндексу, что страница — SPA, и краулер должен дождаться появления
всех внутренних ссылок перед фиксацией DOM.

Документация: https://yandex.ru/support/webmaster/ru/yandex-indexing/rendering

**Не удалять.** При переходе на SSR — убрать можно, т.к. SSR даёт HTML сразу.

---

## Cache-Control

Кэширование управляется через `public/_headers` (Netlify):
- Статические ассеты (`/assets/*`, `*.js`, `*.css`) — `max-age=31536000, immutable`
- HTML (`/`) — `max-age=0, must-revalidate`

Не добавляй `<meta http-equiv="Cache-Control">` в `index.html` — HTTP-заголовки
из `_headers` имеют приоритет, а meta-теги кэша вредят SEO и игнорируются CDN.

---

## Структура роутов (React Router)

| Путь | Страница | В sitemap |
|------|----------|-----------|
| `/` | MainPage (редирект на /feed) | ✅ |
| `/feed` | HomePage — лента подопечных | ✅ |
| `/companies` | Для компаний (CSR/ESG) | ✅ |
| `/partner-funds` | Партнёрские фонды | ✅ |
| `/about` | О фонде | ✅ |
| `/contacts` | Контакты | ✅ |
| `/documents` | Документы | ✅ |
| `/policy` | Политика конфиденциальности | ✅ |
| `/oferta` | Публичная оферта | ✅ |
| `/admin` | Админка | ❌ (закрыт в robots.txt) |
| `/profile` | Профиль пользователя | ❌ (приватная) |
| `/auth-callback` | OAuth callback | ❌ (закрыт в robots.txt) |
