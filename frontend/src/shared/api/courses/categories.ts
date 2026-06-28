import { api } from '../lib/client';
import type { CategoryDTO } from '../types';

export async function getCategories(): Promise<CategoryDTO[]> {
  return api.get<CategoryDTO[]>('/categories');
}
