export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl?: string;
  instructorName: string;
  enrolledAt: string;
  lastAccessedAt?: string;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  courseDurationMinutes: number;
}

export interface EnrollmentStatusResponse {
  isEnrolled: boolean;
  enrollmentId?: string;
  enrolledAt?: string;
  progressPercentage?: number;
}

export interface BookmarkResponse {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl: string | null;
  courseShortDescription: string | null;
  instructorName: string;
  instructorAvatar: string | null;
  categoryName: string;
  courseLevel: string;
  durationMinutes: number;
  price: number;
  averageRating: number;
  reviewsCount: number;
  studentsCount: number;
  createdAt: string;
}

export interface CommentDTO {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  parentId: string | null;
  body: string;
  likesCount: number;
  isEdited: boolean;
  createdAt: string;
  replies: CommentDTO[] | null;
}

export interface CreateCommentPayload {
  body: string;
  parentId?: string | null;
}

export interface UpdateCommentPayload {
  body: string;
}

export interface NoteDTO {
  id: string;
  lessonId: string;
  content: string;
  videoTimestampSeconds: number | null;
  updatedAt: string;
}
