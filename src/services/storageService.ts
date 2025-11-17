import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private baseApiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

  async uploadFile(file: File, folder: string = 'uploads'): Promise<{ url: string; path: string }> {
    try {
      const filename = `${uuidv4()}-${file.name}`;
      const path = `${folder}/${filename}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', filename);
      formData.append('folder', folder);

      const response = await fetch(`${this.baseApiUrl}/media/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();
      return { url: result.url, path: result.pathname };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseApiUrl}/media/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files: File[], folder: string = 'uploads'): Promise<Array<{ url: string; path: string }>> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  // Helper method for validating file types
  validateFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']): boolean {
    return allowedTypes.includes(file.type);
  }

  // Helper method for validating file size (default 5MB)
  validateFileSize(file: File, maxSizeInMB: number = 5): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}