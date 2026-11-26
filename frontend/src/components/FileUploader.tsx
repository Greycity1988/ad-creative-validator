import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Plus, ShieldCheck, FolderOpen, Folder, Loader2, Tags } from 'lucide-react';
import { UploadedFileItem } from '../types';
import {
  UploadEntry,
  classifyCreativePath,
  collectDroppedFiles,
  entriesFromInput,
  folderOf,
  isCheckableImage,
  PLATFORM_LABELS,
} from '../utils/folderClassifier';

interface FileUploaderProps {
  files: UploadedFileItem[];
  onAddFiles: (entries: UploadEntry[]) => void;
  onRemoveFile: (id: string) => void;
  onClearFiles: () => void;
  disabled?: boolean;
  autoClassify: boolean;
  onToggleAutoClassify: (value: boolean) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  disabled = false,
  autoClassify,
  onToggleAutoClassify,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // React has no typed prop for the folder picker; set the attributes directly.
  useEffect(() => {
    folderInputRef.current?.setAttribute('webkitdirectory', '');
    folderInputRef.current?.setAttribute('directory', '');
  }, []);

  const addEntries = (entries: UploadEntry[]) => {
    const images = entries.filter((e) => isCheckableImage(e.file, e.relativePath));
    setSkippedCount(entries.length - images.length);
    if (images.length > 0) onAddFiles(images);
  };

  // Group the upload list by folder and count auto-classified files.
  const { groups, classifiedCount, hasFolders } = useMemo(() => {
    const map = new Map<string, UploadedFileItem[]>();
    let classified = 0;
    for (const f of files) {
      const folder = folderOf(f.relativePath);
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(f);
      if (classifyCreativePath(f.relativePath)) classified++;
    }
    return {
      groups: Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ko')),
      classifiedCount: classified,
      hasFolders: files.some((f) => f.relativePath.includes('/')),
    };
  }, [files]);

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

    // Must start synchronously: the browser clears dataTransfer after this handler returns.
    const pending = collectDroppedFiles(e.dataTransfer);
    setIsReading(true);
    pending
      .then(addEntries)
      .finally(() => setIsReading(false));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addEntries(entriesFromInput(e.target.files));
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
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 transition-all dark:bg-[#141416] dark:border-[#26272c] dark:shadow-2xl">
      {/* Step Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold font-mono tracking-tight shadow-sm dark:bg-[#000000] dark:text-[#A8FF1A] dark:border-[#26272c] dark:shadow-inner">
            01
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                소재 이미지 업로드
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-[#202126] dark:border-[#2e2f36] dark:text-[#A8FF1A]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#A8FF1A]" />
                <span>서버 미저장 · 100% 보안 안심</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#AEAEAE] mt-0.5">
              (JPG, PNG, GIF, WebP · 여러 파일 또는 폴더째 업로드 가능)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <button
            type="button"
            onClick={onClearFiles}
            disabled={disabled}
            className="text-xs font-semibold text-slate-600 hover:text-rose-600 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer dark:text-[#AEAEAE] dark:hover:text-[#F34238] dark:bg-[#202126] dark:hover:bg-[#2c2d33] dark:border-[#2e2f36]"
          >
            전체 비우기
          </button>
        )}
      </div>

      {/* Security Privacy Callout */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 leading-relaxed shadow-sm dark:bg-[#1a1b1f] dark:border-[#26272c] dark:text-[#AEAEAE] dark:shadow-inner">
        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-[#202126] dark:border-[#2e2f36] dark:text-[#A8FF1A]">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-white">100% 무저장 안심 보안 확인: </span>
          업로드하신 광고 소재는 서버나 외부 DB에 <span className="font-bold text-emerald-700 underline underline-offset-2 dark:text-[#A8FF1A]">일체 저장되지 않으며</span>, 규격 판정 즉시 메모리(RAM)에서 완전히 파기됩니다. 기업 대외비 및 런칭 전 신규 캠페인 에셋도 유출 걱정 없이 안전하게 검수하실 수 있습니다.
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          // The hidden inputs live inside this zone; their own click events bubble up here and
          // must not open a second (file) picker on top of the folder picker.
          if (e.target instanceof HTMLInputElement) return;
          if (!disabled) fileInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.995] dark:border-[#A8FF1A] dark:bg-[#202126]'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100/70 dark:border-[#2e3036] dark:hover:border-[#A8FF1A] dark:bg-[#1a1b1f] dark:hover:bg-[#202126]'
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
        <input
          ref={folderInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          data-testid="folder-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm group-hover:scale-105 group-hover:border-slate-400 transition-all duration-200 dark:bg-[#202126] dark:border-[#2e2f36] dark:text-[#A8FF1A] dark:shadow-inner dark:group-hover:border-[#A8FF1A]">
            {isReading ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {isReading ? '폴더를 읽는 중...' : '이미지나 폴더를 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#AEAEAE] mt-1">
              폴더째 올리면 하위 폴더까지 읽고, 폴더·파일 이름으로 매체를 자동 분류합니다
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) fileInputRef.current?.click();
              }}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-300 text-slate-800 hover:border-slate-500 transition-colors cursor-pointer dark:bg-[#202126] dark:border-[#2e2f36] dark:text-white dark:hover:border-[#A8FF1A]"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              파일 선택
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) folderInputRef.current?.click();
              }}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-300 text-slate-800 hover:border-slate-500 transition-colors cursor-pointer dark:bg-[#202126] dark:border-[#2e2f36] dark:text-white dark:hover:border-[#A8FF1A]"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              폴더 선택
            </button>
          </div>
        </div>
      </div>

      {skippedCount > 0 && (
        <p className="text-[11px] text-slate-500 dark:text-[#AEAEAE] -mt-2">
          이미지가 아닌 파일 {skippedCount}개(문서, 시스템 파일 등)는 제외했습니다.
        </p>
      )}

      {/* Auto-classification toggle (shown once a folder or file name names a platform) */}
      {classifiedCount > 0 && (
        <label className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-xs cursor-pointer select-none dark:border-[#2e2f36] dark:bg-[#1a1b1f]">
          <input
            type="checkbox"
            checked={autoClassify}
            onChange={(e) => onToggleAutoClassify(e.target.checked)}
            disabled={disabled}
            className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
          />
          <span className="leading-relaxed text-slate-700 dark:text-[#AEAEAE]">
            <span className="font-bold text-slate-900 dark:text-white">
              <Tags className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-emerald-600 dark:text-[#A8FF1A]" />
              폴더·파일 이름으로 매체 자동 분류 ({classifiedCount}/{files.length}개 분류됨)
            </span>
            <br />
            분류된 소재는 해당 매체 규격으로만 검수하고, 분류되지 않은 {files.length - classifiedCount}개는 아래에서 선택한 매체로 검수합니다.
          </span>
        </label>
      )}

      {/* Selected File Previews */}
      {files.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#AEAEAE]">
            <span className="tracking-wide text-slate-900 dark:text-white">
              선택된 이미지 ({files.length}개)
            </span>
            <span className="text-slate-500 dark:text-[#AEAEAE] text-[11px]">
              지면별 적합도 자동 판정 준비 완료
            </span>
          </div>

          <div className="max-h-[26rem] overflow-y-auto pr-1 space-y-4">
            {groups.map(([folder, groupFiles]) => {
              const folderClass = autoClassify && folder ? classifyCreativePath(folder + '/_') : null;
              return (
                <div key={folder || '(root)'} className="space-y-2">
                  {hasFolders && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-[#AEAEAE]">
                      <Folder className="w-3.5 h-3.5 text-slate-400 dark:text-[#6E6E6E]" />
                      <span className="font-mono truncate" title={folder}>{folder || '(폴더 밖 파일)'}</span>
                      <span className="text-slate-400 dark:text-[#6E6E6E]">{groupFiles.length}개</span>
                      {folderClass && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold dark:bg-[#202126] dark:border-[#2e2f36] dark:text-[#A8FF1A]">
                          {folderClass.platformIds.map((id) => PLATFORM_LABELS[id] || id).join(' · ')}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {groupFiles.map((item) => {
              const ratioLabel = getAspectRatioLabel(item.dimensions?.width, item.dimensions?.height);
              return (
                <div
                  key={item.id}
                  className="group relative flex items-center space-x-3 p-3 rounded-2xl border border-slate-200/90 bg-slate-50 hover:border-slate-300 transition-all shadow-sm dark:border-[#26272c] dark:bg-[#1a1b1f] dark:hover:border-[#3a3b42] dark:shadow-none"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 flex items-center justify-center border border-slate-200 relative dark:bg-[#0d0e10] dark:border-[#26272c]">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400 dark:text-[#6E6E6E]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p
                      className="text-xs font-bold text-slate-900 dark:text-white truncate"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[11px] text-slate-600 dark:text-[#AEAEAE] font-mono">
                        {formatFileSize(item.file.size)}
                      </span>
                      {ratioLabel && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-[#202126] dark:border-[#2e2f36] dark:text-[#A8FF1A]">
                          {ratioLabel}
                        </span>
                      )}
                    </div>
                    {item.dimensions && (
                      <span className="inline-block mt-0.5 text-[10px] text-slate-500 dark:text-[#AEAEAE] font-mono">
                        {item.dimensions.width}×{item.dimensions.height} px
                      </span>
                    )}
                    {(() => {
                      const c = autoClassify ? classifyCreativePath(item.relativePath) : null;
                      if (!c) return null;
                      return (
                        <span
                          className="block mt-0.5 text-[10px] font-bold text-emerald-700 dark:text-[#A8FF1A] truncate"
                          title={`${c.source === 'folder' ? '폴더' : '파일명'} "${c.matched}"에서 분류`}
                        >
                          → {c.platformIds.map((id) => PLATFORM_LABELS[id] || id).join(' · ')}
                        </span>
                      );
                    })()}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(item.id);
                    }}
                    disabled={disabled}
                    title="파일 제거"
                    className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-all cursor-pointer dark:text-[#AEAEAE] dark:hover:text-[#F34238] dark:hover:bg-[#202126]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
                  </div>
                </div>
              );
            })}

            {/* Quick Add Button */}
            <div
              onClick={() => !disabled && fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all dark:border-[#2e3036] dark:hover:border-[#A8FF1A] dark:bg-[#1a1b1f] dark:hover:bg-[#202126]"
            >
              <Plus className="w-4 h-4 text-slate-600 dark:text-[#A8FF1A]" />
              <span className="text-xs font-semibold text-slate-700 dark:text-white">
                소재 추가
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
