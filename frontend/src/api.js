export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function apiCall(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function apiGet(path, params = {}) {
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  const url = queryString ? `${path}?${queryString}` : path;
  return apiCall(url);
}

export async function apiPost(path, data) {
  return apiCall(path, {
    method: 'POST',
    body: data,
  });
}

export async function apiPut(path, data) {
  return apiCall(path, {
    method: 'PUT',
    body: data,
  });
}

export async function apiPatch(path, data) {
  return apiCall(path, {
    method: 'PATCH',
    body: data,
  });
}

export async function apiDelete(path) {
  return apiCall(path, {
    method: 'DELETE',
  });
}
