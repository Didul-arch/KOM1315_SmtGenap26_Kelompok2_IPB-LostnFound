// Lightweight API helper that prepends the VITE_API_BASE_URL
export async function api(path, { method = 'GET', body = null, token = null, headers = {} } = {}) {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const url = base.replace(/\/$/, '') + path;

  const init = { method, headers: { ...headers } };

  if (token) init.headers['Authorization'] = `Bearer ${token}`;

  if (body != null) {
    if (body instanceof URLSearchParams) {
      init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/x-www-form-urlencoded;charset=UTF-8';
      init.body = body.toString();
    } else if (body instanceof FormData) {
      // Let fetch set the multipart boundaries
      init.body = body;
      delete init.headers['Content-Type'];
    } else {
      init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
  }

  const res = await fetch(url, init);
  return res;
}

export async function apiJson(path, opts = {}) {
  const res = await api(path, opts);
  
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth-unauthorized'));
  }

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { ok: res.ok, status: res.status, data: json };
  } catch (e) {
    return { ok: res.ok, status: res.status, data: text };
  }
}
