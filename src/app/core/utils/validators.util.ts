/**
 * Validation Utilities
 * Pure functions following Functional Programming principles
 * No side effects, immutable, testable
 */

/**
 * Validates if a string is not empty or just whitespace
 */
export function isValidText(text: string | undefined | null): boolean {
  return typeof text === 'string' && text.trim().length > 0;
}

/**
 * Validates breakdown form data
 */
export interface BreakdownValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateBreakdownForm(
  category: string | undefined,
  description: string | undefined,
  location: string | undefined,
): BreakdownValidationResult {
  const errors: Record<string, string> = {};

  if (!category) {
    errors['category'] = 'La categoría es requerida';
  }

  if (!isValidText(description)) {
    errors['description'] = 'La descripción es requerida';
  }

  if (!isValidText(location)) {
    errors['location'] = 'La ubicación es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates file is an image
 */
export function isValidImageFile(file: File | undefined): boolean {
  if (!file) return false;

  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validMimeTypes.includes(file.type);
}

/**
 * Validates file is a supported video
 */
export function isValidVideoFile(file: File | undefined): boolean {
  if (!file) return false;

  const validMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  return validMimeTypes.includes(file.type);
}

/**
 * Validates file size (in MB)
 */
export function isValidFileSize(file: File | undefined, maxSizeMB: number = 5): boolean {
  if (!file) return false;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
