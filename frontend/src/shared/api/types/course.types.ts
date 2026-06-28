export interface CourseDTO {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  level: string;
  language: string;
  durationMinutes: number;
  lessonsCount?: number;
  price: number;
  originalPrice: number | null;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  requirements: string[] | null;
  learningObjectives: string[] | null;
  studentsCount: number;
  averageRating: number;
  reviewsCount: number;
  instructorId: string;
  instructorName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByName: string | null;
}

export interface CreateCoursePayload {
  title: string;
  categoryId: string;
  level: string;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  language?: string;
  durationMinutes?: number;
  price?: number;
  originalPrice?: number | null;
  isFree?: boolean;
  requirements?: string[];
  learningObjectives?: string[];
}

export interface UpdateCoursePayload {
  title?: string | null;
  categoryId?: string | null;
  level?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  language?: string | null;
  durationMinutes?: number | null;
  price?: number | null;
  originalPrice?: number | null;
  isFree?: boolean | null;
  requirements?: string[] | null;
  learningObjectives?: string[] | null;
}

export interface ModuleResponse {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  lessons?: LessonSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonSummary {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
  videoDurationSeconds: number | null;
}

export interface CreateModulePayload {
  title: string;
  description?: string | null;
}

export interface UpdateModulePayload {
  title?: string | null;
  description?: string | null;
  isPublished?: boolean | null;
}

export interface ReorderPayload {
  items: { id: string; sortOrder: number }[];
}

export interface LessonResponse {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  slug: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  contentMarkdown: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgressResponse {
  isCompleted: boolean;
  watchedSeconds: number;
  lastPositionSeconds: number;
  updatedAt: string;
}

export interface UpsertProgressPayload {
  isCompleted?: boolean;
  watchedSeconds?: number;
  lastPositionSeconds?: number;
}

export interface CreateLessonPayload {
  title: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  isPreview?: boolean;
  videoUrl?: string | null;
  videoDurationSeconds?: number | null;
  contentMarkdown?: string | null;
}

export interface UpdateLessonPayload {
  title?: string | null;
  type?: string | null;
  isPublished?: boolean | null;
  isPreview?: boolean | null;
  videoUrl?: string | null;
  videoDurationSeconds?: number | null;
  contentMarkdown?: string | null;
}

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
