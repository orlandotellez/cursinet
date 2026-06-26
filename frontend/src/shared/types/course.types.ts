export type Level = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'pending' | 'rejected';

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  previewVideoUrl?: string | null;
  instructor: Instructor;
  category: Category;
  level: Level;
  duration: number;
  lessonsCount: number;
  price: number;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  publishedAt: string;
  tags: string[];
  modules: CourseModule[];
  status?: CourseStatus;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'code' | 'resource';
  duration: number;
  isCompleted?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  role: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  revenue?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  coursesCount: number;
}

export interface CourseCardData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnail: string;
  instructor: Pick<Instructor, 'name' | 'avatar'>;
  category: Pick<Category, 'name'>;
  level: Level;
  duration: number;
  lessonsCount: number;
  price: number;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  badge?: string;
  status?: CourseStatus;
}

// ─── Backend-aligned types for Modules & Lessons API ────────────────────────

export interface CurriculumModule {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: CurriculumLesson[];
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
  videoDurationSeconds: number | null;
  videoUrl?: string | null;
  contentMarkdown?: string | null;
}
