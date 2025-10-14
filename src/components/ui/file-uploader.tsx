import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, FileImage, FileText, FileVideo, FileAudio, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.startsWith('audio/')) return FileAudio;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  return File;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  multiple = true,
  onFilesChange,
  onUpload,
  className,
  disabled = false,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Fichier trop volumineux (max ${formatFileSize(maxSize)})`;
    }
    if (accept && !accept.split(',').some(type => {
      const trimmedType = type.trim();
      if (trimmedType.endsWith('/*')) {
        return file.type.startsWith(trimmedType.replace('/*', '/'));
      }
      return file.type === trimmedType || file.name.endsWith(trimmedType);
    })) {
      return 'Type de fichier non autorisé';
    }
    return null;
  };

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      alert(`Vous ne pouvez télécharger que ${maxFiles} fichiers maximum`);
      return;
    }

    const processedFiles: UploadedFile[] = await Promise.all(
      fileArray.map(async (file) => {
        const error = validateFile(file);
        const preview = await generatePreview(file);
        
        return {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
          status: error ? 'error' : 'idle',
          progress: 0,
          error,
        } as UploadedFile;
      })
    );

    const updatedFiles = [...files, ...processedFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, maxFiles, onFilesChange, generatePreview, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  const handleUploadAll = useCallback(async () => {
    const filesToUpload = files.filter(f => f.status === 'idle').map(f => f.file);
    
    if (filesToUpload.length === 0) return;
    
    setFiles(prev => prev.map(f => 
      f.status === 'idle' ? { ...f, status: 'uploading' as const, progress: 0 } : f
    ));

    try {
      if (onUpload) {
        await onUpload(filesToUpload);
      }
      
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: 'Erreur lors de l\'upload' } 
          : f
      ));
    }
  }, [files, onUpload]);

  const clearAll = useCallback(() => {
    setFiles([]);
    onFilesChange?.([]);
  }, [onFilesChange]);

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          isDragging && 'border-primary bg-primary/5 scale-102',
          !isDragging && 'border-gray-300 hover:border-primary hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-all',
            isDragging ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
          )}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragging ? 'Déposez vos fichiers ici' : 'Glissez vos fichiers ici'}
            </p>
            <p className="text-xs text-muted-foreground">
              ou cliquez pour sélectionner
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Max {maxFiles} fichiers • {formatFileSize(maxSize)} par fichier</p>
            {accept && (
              <p className="text-xs">{accept.split(',').map(t => t.trim().replace('*/', '')).join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Fichiers sélectionnés ({files.length}) • {formatFileSize(totalSize)}
            </p>
            <div className="flex gap-2">
              {files.some(f => f.status === 'idle') && onUpload && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUploadAll}
                  disabled={disabled}
                >
                  Tout uploader
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={disabled}
              >
                Tout supprimer
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file.type);
              
              return (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    
                    {uploadedFile.status === 'uploading' && (
                      <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                    )}
                    
                    {uploadedFile.error && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                    {uploadedFile.status === 'success' && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {(uploadedFile.status === 'idle' || uploadedFile.status === 'error') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                        disabled={disabled}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

