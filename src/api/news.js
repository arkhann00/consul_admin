import { request, apiUrl } from './client';

export function listNews(skip = 0, limit = 100) {
  return request(`/news?skip=${skip}&limit=${limit}`, { auth: false });
}

export function getNewsItem(id) {
  return request(`/news/${id}`, { auth: false });
}

export function createNewsMultipart(formData) {
  const url = apiUrl('/news');
  console.log('[news] create (multipart) →', url);
  return request('/news', {
    method: 'POST',
    body: formData,
  });
}

export function createNewsJson(data) {
  const url = apiUrl('/news/json');
  console.log('[news] create (json) →', url);
  return request('/news/json', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateNewsMultipart(id, formData) {
  return request(`/news/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

export function updateNewsJson(id, data) {
  return request(`/news/${id}/json`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteNews(id) {
  return request(`/news/${id}`, { method: 'DELETE' });
}
