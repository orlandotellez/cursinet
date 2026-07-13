export { getCourses, getCourseById, getCourseBySlug, createCourse, updateCourse, deleteCourse, publishCourse, unpublishCourse, uploadCourseImage } from './courses';
export { getModules, getModule, createModule, updateModule, deleteModule, reorderModules } from './modules';
export { getLessons, getLesson, createLesson, updateLesson, deleteLesson, reorderLessons, getProgress, upsertProgress } from './lessons';
export { getCurriculum } from './curriculum';
export { getCategories } from './categories';
export type {
  CourseDTO,
  CreateCoursePayload,
  UpdateCoursePayload,
  ModuleResponse,
  LessonSummary,
  CreateModulePayload,
  UpdateModulePayload,
  ReorderPayload,
  LessonResponse,
  LessonProgressResponse,
  UpsertProgressPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  CurriculumLesson,
  CurriculumModule,
  CurriculumResponse,
  CategoryDTO,
} from '../types/course.types';
