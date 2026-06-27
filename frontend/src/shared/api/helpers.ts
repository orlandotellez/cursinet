export async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorMessage = body.detail || body.message || body.title || 'Error del servidor';
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function assertOk(res: Response, fallbackMessage = 'Error del servidor'): Promise<void> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorMessage = body.detail || body.message || body.title || fallbackMessage;
    throw new Error(errorMessage);
  }
}
