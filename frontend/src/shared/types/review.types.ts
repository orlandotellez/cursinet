export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}
