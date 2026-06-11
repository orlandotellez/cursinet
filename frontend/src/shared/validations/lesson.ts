import { z } from 'zod';

export const lessonTypeSchema = z.enum([
  'Video',
  'Text',
  'Code',
  'Quiz',
  'Resource',
]);

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo'),
  type: lessonTypeSchema,
  isPreview: z.boolean().optional(),
  videoUrl: z
    .string()
    .url('La URL del video no es válida')
    .nullable()
    .optional(),
  videoDurationSeconds: z
    .number()
    .int('La duración debe ser un número entero')
    .min(0, 'La duración no puede ser negativa')
    .nullable()
    .optional(),
  contentMarkdown: z.string().nullable().optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo')
    .nullable()
    .optional(),
  type: lessonTypeSchema.nullable().optional(),
  isPublished: z.boolean().nullable().optional(),
  isPreview: z.boolean().nullable().optional(),
  videoUrl: z
    .string()
    .url('La URL del video no es válida')
    .nullable()
    .optional(),
  videoDurationSeconds: z
    .number()
    .int('La duración debe ser un número entero')
    .min(0, 'La duración no puede ser negativa')
    .nullable()
    .optional(),
  contentMarkdown: z.string().nullable().optional(),
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export const reorderItemSchema = z.object({
  id: z.string().min(1, 'El ID del ítem es obligatorio'),
  sortOrder: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo'),
});

export const reorderPayloadSchema = z.object({
  items: z
    .array(reorderItemSchema)
    .min(1, 'Debe haber al menos un ítem para reordenar'),
});

export type ReorderInput = z.infer<typeof reorderPayloadSchema>;

export const upsertProgressSchema = z.object({
  isCompleted: z.boolean().optional(),
  watchedSeconds: z
    .number()
    .int('Los segundos deben ser un número entero')
    .min(0, 'Los segundos no pueden ser negativos')
    .optional(),
  lastPositionSeconds: z
    .number()
    .int('Los segundos deben ser un número entero')
    .min(0, 'Los segundos no pueden ser negativos')
    .optional(),
});

export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>;
