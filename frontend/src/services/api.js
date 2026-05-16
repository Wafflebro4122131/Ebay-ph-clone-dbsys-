export async function fetchProducts({ backendUrl, search }) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);

  const response = await fetch(`${backendUrl}/api/products?${params.toString()}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch products');
  }

  return response.json();
}
