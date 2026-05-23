import { getBaseUrl } from '../api/client';

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getBaseUrl()}${path}`;
}
