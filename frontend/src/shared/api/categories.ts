import { API_URL } from "../lib/constants";
import { authedFetch } from "../lib/api";
import { handleJsonResponse } from "./helpers";

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

export async function getCategories(): Promise<CategoryDTO[]> {
  const res = await authedFetch(`${API_URL}/categories`, { credentials: 'include' });
  return handleJsonResponse<CategoryDTO[]>(res);
}
