import { api } from '../lib/client';
import type { CurriculumResponse } from '../types';

export async function getCurriculum(courseId: string): Promise<CurriculumResponse> {
  return api.get<CurriculumResponse>(`/courses/${courseId}/modules/curriculum`);
}
