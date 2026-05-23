import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokenStorage';

export const API_PREFIX = '/api/v1';

/** @returns {string} Пустая строка = same-origin (nginx в Docker проксирует /api) */
export function getBaseUrl() {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env === '') return '';
  if (env) return env;
  return 'http://127.0.0.1:8000';
}

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${API_PREFIX}${normalized}`;
}

let refreshPromise = null;

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const res = await fetch(apiUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    const err = await parseError(res);
    throw err;
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

async function parseError(res) {
  let detail = res.statusText;
  try {
    const body = await res.json();
    if (body.detail) {
      detail = Array.isArray(body.detail)
        ? body.detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
        : body.detail;
    }
  } catch {
    /* empty body */
  }
  const error = new Error(String(detail));
  error.status = res.status;
  error.detail = detail;
  return error;
}

/**
 * @param {string} path - path after /api/v1
 * @param {RequestInit & { auth?: boolean, skipRefresh?: boolean }} options
 */
export async function request(path, options = {}) {
  const { auth = true, skipRefresh = false, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const isFormData = rest.body instanceof FormData;
  if (!isFormData && rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(apiUrl(path), { ...rest, headers });

  const shouldRefresh =
    res.status === 401 &&
    auth &&
    !skipRefresh &&
    !path.includes('/auth/login') &&
    !path.includes('/auth/refresh');

  if (shouldRefresh) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;

      const newToken = getAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
      }
      res = await fetch(apiUrl(path), { ...rest, headers });
    } catch {
      throw await parseError(res);
    }
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  return res.text();
}
