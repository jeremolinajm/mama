import apiClient from './client';

/**
 * API module for file uploads
 */

interface UploadResponse {
  url: string;
}

export const uploadApi = {
  /**
   * Upload an image file
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/api/admin/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },
};
