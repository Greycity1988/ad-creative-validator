import React, { useState } from 'react';
import { Maximize2, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageInfo } from '../types';

interface ImagePreviewProps {
  filename: string;
  imageInfo: ImageInfo;
  previewUrl?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  filename,
  imageInfo,
  previewUrl,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-surface rounded-2xl border border-line p-5 shadow-soft-xs flex flex-col md:flex-row gap-5 items-center">
      {/* Thumbnail */}
      <div
        className="relative group w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-canvas-subtle flex-shrink-0 flex items-center justify-center border border-line cursor-pointer"
        onClick={() => previewUrl && setIsModalOpen(true)}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={filename}
              className="w-full h-full object-contain p-1"
            />
            <div className="absolute inset-0 bg-ink-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
              <Maximize2 className="w-5 h-5 drop-shadow" />
            </div>
          </>
        ) : (
          <div className="text-center p-2">
            <FileText className="w-8 h-8 text-ink-muted mx-auto mb-1" />
            <span className="text-[10px] text-ink-muted font-mono">No Preview</span>
          </div>
        )}
      </div>

      {/* Meta Specs Grid */}
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center justify-between border-b border-line/60 pb-2">
          <h3 className="text-sm font-bold text-ink-primary truncate" title={filename}>
            {filename}
          </h3>
          <span className="text-[11px] font-mono font-semibold bg-canvas-subtle text-ink-secondary px-2.5 py-0.5 rounded-full border border-line">
            {imageInfo.format || 'IMAGE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-canvas-subtle/70 p-3 rounded-xl border border-line">
            <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">해상도 (W×H)</span>
            <span className="font-bold text-ink-primary font-mono text-xs sm:text-sm mt-0.5 block">
              {imageInfo.width} × {imageInfo.height}
            </span>
          </div>

          <div className="bg-canvas-subtle/70 p-3 rounded-xl border border-line">
            <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">종횡비</span>
            <span className="font-bold text-ink-primary font-mono text-xs sm:text-sm mt-0.5 block">
              {imageInfo.aspect_ratio ||
                (imageInfo.height
                  ? `${(imageInfo.width / imageInfo.height).toFixed(2)}:1`
                  : '-')}
            </span>
          </div>

          <div className="bg-canvas-subtle/70 p-3 rounded-xl border border-line">
            <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">파일 용량</span>
            <span className="font-bold text-ink-primary font-mono text-xs sm:text-sm mt-0.5 block">
              {imageInfo.file_size_kb !== undefined
                ? `${imageInfo.file_size_kb.toFixed(1)} KB`
                : '-'}
            </span>
          </div>

          <div className="bg-canvas-subtle/70 p-3 rounded-xl border border-line">
            <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">투명도(Alpha)</span>
            <span className="inline-flex items-center space-x-1 font-bold text-ink-primary mt-0.5 block">
              {imageInfo.has_alpha ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-mint inline" />
                  <span className="text-accent-mint font-semibold text-xs ml-1">포함 (투명)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-ink-muted inline" />
                  <span className="text-ink-secondary font-medium text-xs ml-1">미포함 (불투명)</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {isModalOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-ink-primary/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-surface rounded-3xl p-3 shadow-soft-lg border border-line overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 z-10 p-2 rounded-full bg-ink-primary/60 text-white hover:bg-ink-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewUrl}
              alt={filename}
              className="max-h-[80vh] w-auto object-contain rounded-2xl mx-auto"
            />
            <div className="p-3 text-center text-xs text-ink-muted font-mono">
              {filename} ({imageInfo.width}×{imageInfo.height} px, {imageInfo.file_size_kb?.toFixed(1)} KB)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
