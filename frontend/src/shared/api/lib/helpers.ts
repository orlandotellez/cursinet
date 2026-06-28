export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    const message = extractErrorMessage(data) ?? `HTTP ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function extractErrorMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null) {
    if (
      'message' in data &&
      typeof (data as Record<string, unknown>).message === 'string'
    ) {
      return (data as Record<string, unknown>).message as string;
    }
    if (
      'detail' in data &&
      typeof (data as Record<string, unknown>).detail === 'string'
    ) {
      return (data as Record<string, unknown>).detail as string;
    }
    if (Array.isArray(data) && data.length > 0 && 'message' in data[0]) {
      return String(data[0].message);
    }
  }
  return null;
}

export async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }
  return res.json();
}

export async function assertOk(res: Response, fallbackMessage = 'Error del servidor'): Promise<void> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }
}
