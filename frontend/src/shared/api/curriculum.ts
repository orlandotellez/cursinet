import { API_URL } from "../lib/constants";

// ─── Types aligned with backend ─────────────────────────────────────────────

export interface CurriculumLesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
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

// ─── Helpers ────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error del servidor' }));
    throw new Error(body.detail || body.title || 'Error del servidor');
  }
  return res.json();
}

// ─── API functions ──────────────────────────────────────────────────────────

export async function getCurriculum(courseId: string): Promise<CurriculumResponse> {
  const res = await fetch(`${API_URL}/courses/${courseId}/modules/curriculum`, { credentials: 'include' });
  return handleResponse<CurriculumResponse>(res);
}
