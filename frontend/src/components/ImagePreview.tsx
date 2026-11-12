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
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      {/* Thumbnail */}
      <div
        className="relative group w-32 h-32 md:w-36 md:h-36 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 cursor-pointer shadow-inner"
        onClick={() => previewUrl && setIsModalOpen(true)}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={filename}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 className="w-5 h-5 drop-shadow" />
            </div>
          </>
        ) : (
          <div className="text-center p-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 font-mono">No Preview</span>
          </div>
        )}
      </div>

      {/* Meta Specs Grid */}
      <div className="flex-1 w-full space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 truncate" title={filename}>
            {filename}
          </h3>
          <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
            {imageInfo.format || 'IMAGE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium block">해상도 (W×H)</span>
            <span className="font-bold text-slate-800 font-mono">
              {imageInfo.width} × {imageInfo.height} px
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium block">종횡비</span>
            <span className="font-bold text-slate-800 font-mono">
              {imageInfo.aspect_ratio ||
                (imageInfo.height
                  ? `${(imageInfo.width / imageInfo.height).toFixed(2)}:1`
                  : '-')}
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium block">파일 용량</span>
            <span className="font-bold text-slate-800 font-mono">
              {imageInfo.file_size_kb !== undefined
                ? `${imageInfo.file_size_kb.toFixed(1)} KB`
                : '-'}
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium block">투명도(Alpha)</span>
            <span className="inline-flex items-center space-x-1 font-bold text-slate-800">
              {imageInfo.has_alpha ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">포함 (투명)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600 font-medium">미포함 (불투명)</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {isModalOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl p-2 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewUrl}
              alt={filename}
              className="max-h-[80vh] w-auto object-contain rounded-lg mx-auto"
            />
            <div className="p-3 text-center text-xs text-slate-500 font-mono">
              {filename} ({imageInfo.width}×{imageInfo.height} px, {imageInfo.file_size_kb?.toFixed(1)} KB)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
