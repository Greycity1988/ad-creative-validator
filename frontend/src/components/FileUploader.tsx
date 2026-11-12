import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Plus } from 'lucide-react';
import { UploadedFileItem } from '../types';

interface FileUploaderProps {
  files: UploadedFileItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearFiles: () => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (droppedFiles.length > 0) {
        onAddFiles(droppedFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (selectedFiles.length > 0) {
        onAddFiles(selectedFiles);
      }
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            1
          </span>
          <h2 className="text-base font-bold text-slate-800">
            소재 이미지 업로드
          </h2>
          <span className="text-xs text-slate-400 font-normal">
            (JPG, PNG, GIF, WebP 다중 선택 가능)
          </span>
        </div>

        {files.length > 0 && (
          <button
            type="button"
            onClick={onClearFiles}
            disabled={disabled}
            className="text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            전체 비우기
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-slate-400 mt-1">
              최대 용량 30MB • 다중 파일 일괄 검수 가능
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Previews */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>선택된 이미지 ({files.length}개)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
            {files.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center space-x-3 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm"
              >
                <div className="w-14 h-14 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-100">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p
                    className="text-xs font-medium text-slate-800 truncate"
                    title={item.file.name}
                  >
                    {item.file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatFileSize(item.file.size)}
                  </p>
                  {item.dimensions && (
                    <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                      {item.dimensions.width}×{item.dimensions.height}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(item.id);
                  }}
                  disabled={disabled}
                  title="파일 제거"
                  className="absolute top-2 right-2 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => !disabled && fileInputRef.current?.click()}
              disabled={disabled}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all min-h-[70px] text-xs font-medium cursor-pointer"
            >
              <Plus className="w-5 h-5 mb-1" />
              <span>추가 업로드</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
