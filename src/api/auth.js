import { request } from './client';
import { setTokens, clearTokens } from '../auth/tokenStorage';

export async function login(phone, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    auth: false,
    skipRefresh: true,
    body: JSON.stringify({ phone, password }),
  });

  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function fetchMe() {
  return request('/auth/me');
}

export function logout() {
  clearTokens();
}
