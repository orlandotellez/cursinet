export type UserStatus = 'active' | 'suspended' | 'pending';
export type UserRole = 'student' | 'instructor' | 'admin' | 'moderator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string | null;
  phone?: string | null;
  bio?: string | null;
  userName?: string | null;
}
