import { API_URL } from "../lib/constants";
import { authedFetch } from "../lib/api";
import { handleJsonResponse } from "./helpers";

export interface CurriculumLesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
  isCompleted?: boolean;
  videoDurationSeconds: number | null;
  videoUrl?: string | null;
  contentMarkdown?: string | null;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: CurriculumLesson[];
}

export interface CurriculumResponse {
  courseId: string;
  modules: CurriculumModule[];
}

export async function getCurriculum(courseId: string): Promise<CurriculumResponse> {
  const res = await authedFetch(`${API_URL}/courses/${courseId}/modules/curriculum`);
  return handleJsonResponse<CurriculumResponse>(res);
}
