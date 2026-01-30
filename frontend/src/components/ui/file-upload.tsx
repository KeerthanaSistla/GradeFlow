import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, FileSpreadsheet, X, Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  id: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  sampleFileUrl?: string;
  sampleFileName?: string;
  onFileChange: (file: File | null) => void;
  value: File | null;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label = "Select File",
  accept = ".xlsx,.xls",
  maxSize = 5,
  sampleFileUrl,
  sampleFileName,
  onFileChange,
  value,
  error,
  disabled = false,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      return file.type === type;
    })) {
      onFileChange(null);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onFileChange(null);
      return;
    }

    onFileChange(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}

      {/* Sample File Download */}
      {sampleFileUrl && sampleFileName && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">Download sample format:</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = sampleFileUrl;
              link.download = sampleFileName;
              link.click();
            }}
            className="text-blue-600 hover:text-blue-800 border-blue-300 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {sampleFileName}
          </Button>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
          error ? "border-destructive/50 bg-destructive/5" : "",
          value ? "bg-green-50 border-green-200" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleBrowseClick}
      >
        {value ? (
          // File Selected State
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{value.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(value.size)}
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // No File Selected State
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports {accept.replace(/\./g, '').toUpperCase()} files (max {maxSize}MB)
              </p>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
              >
                Browse Files
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
