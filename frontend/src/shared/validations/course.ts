import { z } from 'zod';

export const courseLevelSchema = z.enum([
  'Begginer',
  'Intermediate',
  'Advanced',
  'Expert',
]);

export const courseStatusSchema = z.enum([
  'draft',
  'published',
  'pending',
  'rejected',
]);

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo'),
  categoryId: z
    .string()
    .min(1, 'La categoría es obligatoria'),
  level: courseLevelSchema,
  shortDescription: z
    .string()
    .max(300, 'La descripción corta no puede superar los 300 caracteres')
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
  thumbnailUrl: z
    .string()
    .url('La URL de la miniatura no es válida')
    .nullable()
    .optional(),
  previewVideoUrl: z
    .string()
    .url('La URL del video de preview no es válida')
    .nullable()
    .optional(),
  language: z.string().min(2).max(50).optional(),
  durationMinutes: z
    .number()
    .int('La duración debe ser un número entero')
    .min(1, 'La duración debe ser al menos 1 minuto')
    .optional(),
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .optional(),
  originalPrice: z
    .number()
    .min(0, 'El precio original no puede ser negativo')
    .nullable()
    .optional(),
  isFree: z.boolean().optional(),
  requirements: z.array(z.string()).nullable().optional(),
  learningObjectives: z.array(z.string()).nullable().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo')
    .nullable()
    .optional(),
  categoryId: z.string().min(1).nullable().optional(),
  level: courseLevelSchema.nullable().optional(),
  shortDescription: z
    .string()
    .max(300, 'La descripción corta no puede superar los 300 caracteres')
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
  thumbnailUrl: z
    .string()
    .url('La URL de la miniatura no es válida')
    .nullable()
    .optional(),
  previewVideoUrl: z
    .string()
    .url('La URL del video de preview no es válida')
    .nullable()
    .optional(),
  language: z.string().min(2).max(50).nullable().optional(),
  durationMinutes: z
    .number()
    .int('La duración debe ser un número entero')
    .min(1, 'La duración debe ser al menos 1 minuto')
    .nullable()
    .optional(),
  price: z.number().min(0, 'El precio no puede ser negativo').nullable().optional(),
  originalPrice: z
    .number()
    .min(0, 'El precio original no puede ser negativo')
    .nullable()
    .optional(),
  isFree: z.boolean().nullable().optional(),
  requirements: z.array(z.string()).nullable().optional(),
  learningObjectives: z.array(z.string()).nullable().optional(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const courseQuerySchema = z.object({
  categoryId: z.string().optional(),
  level: courseLevelSchema.optional(),
  isPublished: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .optional(),
  isFeatured: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .optional(),
  search: z.string().max(200).optional(),
});

export type CourseQueryInput = z.input<typeof courseQuerySchema>;
