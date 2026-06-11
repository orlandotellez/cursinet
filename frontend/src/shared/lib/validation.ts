import type { ZodSchema, ZodError } from 'zod';

export function flattenZodErrors<T>(error: ZodError<T>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}

export type ValidationResult<T> =
  | { success: true; data: T; fieldErrors: Record<string, never> }
  | { success: false; data: null; fieldErrors: Record<string, string> };

export function validateShape<T>(
  schema: ZodSchema<T>,
  input: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data, fieldErrors: {} };
  }

  return {
    success: false,
    data: null,
    fieldErrors: flattenZodErrors(result.error),
  };
}

export function validateOrThrow<T>(schema: ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
      .join('; ');
    throw new Error(`Error de validación: ${messages}`);
  }
  return result.data;
}
