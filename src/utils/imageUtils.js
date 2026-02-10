/**
 * Оптимизирует URL изображения через Supabase Transform API
 * Автоматически сжимает и конвертирует в WebP
 */
export function optimizeImage(url, { width = 400, quality = 75 } = {}) {
  if (!url) return url;
  
  // Только для Supabase Storage
  if (url.includes('supabase.co/storage')) {
    return `${url}?width=${width}&quality=${quality}&format=webp`;
  }
  
  // Для Tilda
  if (url.includes('tildacdn.com')) {
    return `${url}?w=${width}&q=${quality}`;
  }
  
  return url;
}
