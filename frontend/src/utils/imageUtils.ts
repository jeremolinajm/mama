/**
 * Utility functions for handling image URLs
 */

/**
 * Resolves image URLs to absolute paths
 * - If the path starts with /api or /uploads, prepends the API base URL
 * - If it's already an absolute URL (http/https), returns it as-is
 * - Otherwise, returns the path unchanged
 *
 * @param path - The image path to resolve
 * @returns The resolved absolute URL
 */
export function resolveImageUrl(path: string | null | undefined): string {
  // Return empty string for null/undefined
  if (!path) {
    return '';
  }

  // Already an absolute URL (http:// or https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative API paths need the base URL prepended
  if (path.startsWith('/api') || path.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}${path}`;
  }

  // For other paths (like public assets /placeholder.jpg), return as-is
  return path;
}
