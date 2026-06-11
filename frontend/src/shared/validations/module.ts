import { z } from 'zod';

export const createModuleSchema = z.object({
  title: z
    .string()
    .min(1, 'El título del módulo es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo'),
  description: z.string().nullable().optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

export const updateModuleSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo')
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
  isPublished: z.boolean().nullable().optional(),
});

export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

export const reorderItemSchema = z.object({
  id: z.string().min(1, 'El ID del módulo es obligatorio'),
  sortOrder: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo'),
});

export const reorderPayloadSchema = z.object({
  items: z
    .array(reorderItemSchema)
    .min(1, 'Debe haber al menos un módulo para reordenar'),
});

export type ReorderInput = z.infer<typeof reorderPayloadSchema>;
