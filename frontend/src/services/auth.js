const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

async function requestAuth(path, body) {
  const response = await fetch(`${backendUrl}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
}

export function login({ email, password }) {
  return requestAuth('login', { email, password });
}

export function signup({ firstName, lastName, email, password, phone }) {
  return requestAuth('signup', { firstName, lastName, email, password, phone });
}
