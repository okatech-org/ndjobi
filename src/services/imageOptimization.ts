interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

interface OptimizedImage {
  blob: Blob;
  url: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

class ImageOptimizationService {
  async optimizeImage(
    file: File,
    options: OptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = 'webp',
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const optimizedSize = blob.size;
            const originalSize = file.size;
            const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

            resolve({
              blob,
              url: URL.createObjectURL(blob),
              originalSize,
              optimizedSize,
              compressionRatio,
            });
          },
          format === 'webp' ? 'image/webp' : `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.readAsDataURL(file);
    });
  }

  async optimizeMultipleImages(
    files: File[],
    options: OptimizationOptions = {}
  ): Promise<OptimizedImage[]> {
    const promises = files.map(file => this.optimizeImage(file, options));
    return Promise.all(promises);
  }

  async removeExifData(file: File): Promise<File> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const newBlob = new Blob([uint8Array], { type: file.type });
      return new File([newBlob], file.name, { type: file.type });
    } catch (error) {
      console.error('Error removing EXIF data:', error);
      return file;
    }
  }

  calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.readAsDataURL(file);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async createThumbnail(file: File, size: number = 150): Promise<Blob> {
    const optimized = await this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'webp',
    });

    return optimized.blob;
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getSupportedFormats(): string[] {
    const canvas = document.createElement('canvas');
    const formats: string[] = ['jpeg', 'png'];

    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      formats.push('webp');
    }

    return formats;
  }

  async batchOptimizeWithProgress(
    files: File[],
    options: OptimizationOptions = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const optimized = await this.optimizeImage(files[i], options);
      results.push(optimized);
      onProgress?.(i + 1, files.length);
    }

    return results;
  }
}

export const imageOptimizationService = new ImageOptimizationService();

