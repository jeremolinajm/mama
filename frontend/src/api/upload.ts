import apiClient from './client';

/**
 * API module for file uploads
 */

export const uploadApi = {
  /**
   * Upload an image file
   * Backend returns the URL string directly after ApiResponse unwrapping
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<string>('/api/admin/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // El backend devuelve el string URL directamente (ej: "/api/uploads/uuid.jpg")
    return response.data;
  },
};
