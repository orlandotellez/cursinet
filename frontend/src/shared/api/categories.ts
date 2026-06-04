import { API_URL } from "../lib/constants";
import { authedFetch } from "../lib/api";

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error del servidor' }));
    throw new Error(body.detail || body.title || 'Error del servidor');
  }
  return res.json();
}

export async function getCategories(): Promise<CategoryDTO[]> {
  const res = await authedFetch(`${API_URL}/categories`, { credentials: 'include' });
  return handleResponse<CategoryDTO[]>(res);
}
