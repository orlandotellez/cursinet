import type { Instructor } from '@/src/shared/types';

export const instructors: Instructor[] = [
  { id: 'inst-1', name: 'Martín López', username: 'mlopez', avatar: '', bio: 'Arquitecto de software con 15+ años de experiencia en sistemas distribuidos. Ha liderado equipos en startups y empresas Fortune 500.', role: 'Arquitecto de Software', coursesCount: 8, studentsCount: 15420, rating: 4.9, revenue: 89200 },
  { id: 'inst-2', name: 'Laura García', username: 'lgarcia', avatar: '', bio: 'Full-stack developer especializada en React, Node.js y arquitectura cloud. Google Developer Expert en Web Technologies.', role: 'Full-stack Developer', coursesCount: 12, studentsCount: 23100, rating: 4.8, revenue: 124500 },
  { id: 'inst-3', name: 'Carlos Ruiz', username: 'cruiz', avatar: '', bio: 'DevOps engineer apasionado por la infraestructura como código y CI/CD. AWS Certified Solutions Architect.', role: 'DevOps Engineer', coursesCount: 6, studentsCount: 8900, rating: 4.7, revenue: 56000 },
  { id: 'inst-4', name: 'Ana Jiménez', username: 'ajimenez', avatar: '', bio: 'Data scientist especializada en ML, análisis de datos y visualización. PhD en Ciencias de la Computación.', role: 'Data Scientist', coursesCount: 10, studentsCount: 19200, rating: 4.9, revenue: 97800 },
];

export function getInstructorByUsername(username: string): Instructor | undefined {
  return instructors.find((i) => i.username === username);
}
