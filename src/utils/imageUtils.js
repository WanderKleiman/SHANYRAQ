/**
 * Оптимизирует URL изображения через Supabase Transform API
 * Автоматически сжимает и конвертирует в WebP
 */
export function optimizeImage(url, { width = 400, quality = 75 } = {}) {
  if (!url) return url;

  // Только для Supabase Storage — используем render endpoint для трансформаций
  if (url.includes('supabase.co/storage')) {
    const transformUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    return `${transformUrl}?width=${width}&quality=${quality}&format=webp`;
  }

  // Для Tilda
  if (url.includes('tildacdn.com')) {
    return `${url}?w=${width}&q=${quality}`;
  }

  return url;
}
