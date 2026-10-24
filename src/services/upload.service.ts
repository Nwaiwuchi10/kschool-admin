import apiClient from './api';

export interface UploadResult {
  url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  resource_type?: string;
}

export const uploadService = {
  /**
   * Upload a single image, audio file, or voice note to Cloudinary
   * Max file size: 10MB
   */
  async uploadFile(file: File, folder: string = 'kschoolmate/lessons'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post<UploadResult>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload multiple images to Cloudinary (up to 10 files, max 10MB each)
   */
  async uploadMultipleFiles(
    files: File[],
    folder: string = 'kschoolmate/lessons'
  ): Promise<{ files: UploadResult[]; count: number }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const response = await apiClient.post<{ files: UploadResult[]; count: number }>(
      '/uploads/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload audio voice note Blob/File recorded in browser
   * Max size: 10MB
   */
  async uploadVoiceNote(audioBlob: Blob, filename = 'lesson_voicenote.webm'): Promise<UploadResult> {
    const audioFile = new File([audioBlob], filename, { type: audioBlob.type || 'audio/webm' });
    return this.uploadFile(audioFile, 'kschoolmate/voicenotes');
  },
};

export default uploadService;
