import type { UserRole, UserStatus } from '@/src/shared/types';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    email: 'carlos@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria@example.com',
    role: 'instructor',
    status: 'active',
    joinedAt: '2025-02-20',
  },
  {
    id: '3',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'student',
    status: 'active',
    joinedAt: '2025-03-10',
  },
  {
    id: '4',
    name: 'Ana García',
    email: 'ana@example.com',
    role: 'instructor',
    status: 'active',
    joinedAt: '2025-03-22',
  },
  {
    id: '5',
    name: 'Pedro Rodríguez',
    email: 'pedro@example.com',
    role: 'student',
    status: 'suspended',
    joinedAt: '2025-04-05',
  },
  {
    id: '6',
    name: 'Laura Martínez',
    email: 'laura@example.com',
    role: 'student',
    status: 'active',
    joinedAt: '2025-04-18',
  },
  {
    id: '7',
    name: 'Diego Fernández',
    email: 'diego@example.com',
    role: 'instructor',
    status: 'active',
    joinedAt: '2025-05-01',
  },
  {
    id: '8',
    name: 'Sofía Torres',
    email: 'sofia@example.com',
    role: 'student',
    status: 'active',
    joinedAt: '2025-05-12',
  },
];
