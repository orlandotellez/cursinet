import { User, UserRole } from "../types";

// Demo users 
interface DemoUser extends User {
  password: string;
}

export const DEMO_USERS: Record<UserRole, DemoUser> = {
  student: {
    id: 'demo-student-001',
    name: 'Sofía Estudiante',
    email: 'sofia@email.com',
    role: 'student',
    emailVerified: true,
    password: '123456',
  },
  instructor: {
    id: 'demo-instructor-001',
    name: 'Martín Instructor',
    email: 'martin@cursinet.com',
    role: 'instructor',
    emailVerified: true,
    password: '123456',
  },
  admin: {
    id: 'demo-admin-001',
    name: 'Admin',
    email: 'admin@cursinet.com',
    role: 'admin',
    emailVerified: true,
    password: '123456',
  },
  moderator: {
    id: 'demo-moderator-001',
    name: 'Moderator',
    email: 'moderator@cursinet.com',
    role: 'moderator',
    emailVerified: true,
    password: '123456',
  },
};


