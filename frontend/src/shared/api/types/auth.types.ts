export type UserRoleDTO = 'Admin' | 'Instructor' | 'Student' | 'Moderator';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  image: string | null;
  role: UserRoleDTO;
  userName: string | null;
  bio: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByName: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRoleDTO;
  phone?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRoleDTO;
  phone?: string | null;
  bio?: string | null;
  userName?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateMyProfilePayload {
  name?: string;
  bio?: string | null;
  phone?: string | null;
  userName?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  image?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
