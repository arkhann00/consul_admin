const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) return null;
  if (!IMAGE_TYPES.includes(file.type)) {
    return 'Допустимые форматы: JPEG, PNG, WebP, GIF';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Размер файла не более 5 MB';
  }
  return null;
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
