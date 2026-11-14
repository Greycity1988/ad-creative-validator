import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Plus, ShieldCheck } from 'lucide-react';
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

  const getAspectRatioLabel = (width?: number, height?: number): string | null => {
    if (!width || !height) return null;
    const ratio = width / height;
    if (Math.abs(ratio - 1.0) < 0.05) return '1:1';
    if (Math.abs(ratio - 1.91) < 0.08) return '1.91:1';
    if (Math.abs(ratio - 0.5625) < 0.05) return '9:16';
    if (Math.abs(ratio - 0.8) < 0.05) return '4:5';
    if (Math.abs(ratio - 2.0) < 0.08) return '2:1';
    return `${(width / height).toFixed(2)}:1`;
  };

  return (
    <div className="bg-surface rounded-3xl border border-line shadow-soft-sm p-6 sm:p-8 space-y-6 transition-all">
      {/* Step Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold font-mono tracking-tight shadow-soft-xs">
            01
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink-primary">
                소재 이미지 업로드
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-canvas-subtle border border-line text-ink-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                <span>서버 미저장 · 100% 보안 안심</span>
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              (JPG, PNG, GIF, WebP 다중 선택 가능)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <button
            type="button"
            onClick={onClearFiles}
            disabled={disabled}
            className="text-xs font-medium text-ink-muted hover:text-status-fail px-3 py-1.5 rounded-full hover:bg-canvas-subtle transition-all cursor-pointer"
          >
            전체 비우기
          </button>
        )}
      </div>

      {/* Security Privacy Callout */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-canvas-subtle/80 border border-line text-xs text-ink-secondary leading-relaxed">
        <div className="w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center text-accent flex-shrink-0 mt-0.5 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-mint" />
        </div>
        <div>
          <span className="font-bold text-ink-primary">100% 무저장 안심 보안 확인: </span>
          업로드하신 광고 소재는 서버나 외부 DB에 <span className="font-semibold text-ink-primary underline decoration-accent-mint decoration-2 underline-offset-2">일체 저장되지 않으며</span>, 규격 판정 즉시 메모리(RAM)에서 완전히 파기됩니다. 기업 대외비 및 런칭 전 신규 캠페인 에셋도 유출 걱정 없이 안전하게 검수하실 수 있습니다.
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group ${
          isDragging
            ? 'border-accent bg-accent/5 scale-[0.995]'
            : 'border-line-strong hover:border-accent/60 bg-canvas/60 hover:bg-canvas-subtle'
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

        <div className="flex flex-col items-center justify-center space-y-3.5">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center text-accent shadow-soft-xs group-hover:scale-105 group-hover:border-accent/40 transition-all duration-200">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-primary">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-ink-muted mt-1">
              최대 용량 30MB • 다중 파일 일괄 검수 가능
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Previews */}
      {files.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-secondary">
            <span className="tracking-wide">
              선택된 이미지 ({files.length}개)
            </span>
            <span className="text-ink-muted text-[11px]">
              지면별 적합도 자동 판정 준비 완료
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-88 overflow-y-auto pr-1">
            {files.map((item) => {
              const ratioLabel = getAspectRatioLabel(item.dimensions?.width, item.dimensions?.height);
              return (
                <div
                  key={item.id}
                  className="group relative flex items-center space-x-3 p-3 rounded-2xl border border-line bg-surface hover:border-accent/40 hover:shadow-soft-xs transition-all"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-canvas-subtle flex-shrink-0 flex items-center justify-center border border-line relative">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-ink-muted" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p
                      className="text-xs font-medium text-ink-primary truncate"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[11px] text-ink-muted font-mono">
                        {formatFileSize(item.file.size)}
                      </span>
                      {ratioLabel && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-canvas-subtle border border-line text-ink-secondary">
                          {ratioLabel}
                        </span>
                      )}
                    </div>
                    {item.dimensions && (
                      <span className="inline-block mt-0.5 text-[10px] text-ink-muted font-mono">
                        {item.dimensions.width}×{item.dimensions.height} px
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
                    className="absolute top-2.5 right-2.5 p-1 rounded-full text-ink-muted hover:text-status-fail hover:bg-canvas-subtle transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => !disabled && fileInputRef.current?.click()}
              disabled={disabled}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-line-strong text-ink-secondary hover:border-accent hover:text-accent hover:bg-canvas-subtle/70 transition-all min-h-[76px] text-xs font-semibold cursor-pointer group"
            >
              <Plus className="w-4 h-4 mb-1 text-ink-muted group-hover:text-accent group-hover:scale-110 transition-all" />
              <span>추가 업로드</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
