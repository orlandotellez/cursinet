import { z } from 'zod';

export const reviewPayloadSchema = z.object({
  rating: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1 estrella')
    .max(5, 'La calificación máxima es 5 estrellas'),
  comment: z
    .string()
    .max(2000, 'El comentario no puede superar los 2000 caracteres')
    .optional(),
});

export type ReviewInput = z.infer<typeof reviewPayloadSchema>;
