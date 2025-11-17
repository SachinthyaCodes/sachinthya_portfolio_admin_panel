// Vercel Blob service for frontend file uploads
export class VercelBlobService {
    static async uploadFile(file, fileName) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', fileName);

            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    static async deleteFile(url) {
        try {
            const response = await fetch('/api/media/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            return { message: 'File deleted successfully' };
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }

    static async getFileInfo(url) {
        try {
            const response = await fetch(`/api/media/info?url=${encodeURIComponent(url)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('File info error:', error);
            throw error;
        }
    }

    // Helper method for generating unique file names
    static generateFileName(originalName) {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop();
        const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
        const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '_');
        return `${sanitizedName}_${timestamp}.${extension}`;
    }

    // Helper method for validating file types
    static validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
        return allowedTypes.includes(file.type);
    }

    // Helper method for validating file size (default 5MB)
    static validateFileSize(file, maxSizeInMB = 5) {
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return file.size <= maxSizeInBytes;
    }
}