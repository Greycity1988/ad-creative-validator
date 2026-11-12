import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { MediaSelector, PLATFORMS } from './components/MediaSelector';
import { ResultDashboard } from './components/ResultDashboard';
import { UploadedFileItem, ValidationItem, PlatformMetadata } from './types';
import { fetchPlatformsMetadata, validateImages, updateAllSpecs } from './api/validator';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    PLATFORMS.map((p) => p.id)
  );
  const [platformsMetadata, setPlatformsMetadata] = useState<PlatformMetadata[]>([]);
  const [selectedPlacements, setSelectedPlacements] = useState<Record<string, string[]>>({});
  const [analyzeText, setAnalyzeText] = useState<boolean>(true);
  const [autoMatch, setAutoMatch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdatingSpecs, setIsUpdatingSpecs] = useState<boolean>(false);
  const [specsUpdateMessage, setSpecsUpdateMessage] = useState<string | null>(null);
  const [results, setResults] = useState<ValidationItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch available platform & placement specs from backend
  useEffect(() => {
    fetchPlatformsMetadata()
      .then((data) => setPlatformsMetadata(data))
      .catch((err) => console.error('Failed to fetch platforms metadata:', err));
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [files]);

  const handleUpdateSpecs = async () => {
    try {
      setIsUpdatingSpecs(true);
      setSpecsUpdateMessage(null);
      const res = await updateAllSpecs();
      const freshMeta = await fetchPlatformsMetadata();
      setPlatformsMetadata(freshMeta);
      setSpecsUpdateMessage(res.message);
      setTimeout(() => setSpecsUpdateMessage(null), 6000);
    } catch (err) {
      console.error('Failed to update specs:', err);
      setSpecsUpdateMessage('가이드라인 동기화 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingSpecs(false);
    }
  };

  const handleAddFiles = (newFiles: File[]) => {
    const newItems: UploadedFileItem[] = newFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      const item: UploadedFileItem = {
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl,
      };

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setFiles((current) =>
          current.map((f) =>
            f.id === item.id
              ? { ...f, dimensions: { width: img.naturalWidth, height: img.naturalHeight } }
              : f
          )
        );
      };
      img.src = previewUrl;

      return item;
    });

    setFiles((prev) => [...prev, ...newItems]);
    setErrorMessage(null);
  };

  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearFiles = () => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setResults(null);
    setErrorMessage(null);
  };

  const handleStartValidation = async () => {
    if (files.length === 0 || selectedPlatforms.length === 0) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const rawFiles = files.map((f) => f.file);
      const response = await validateImages(
        rawFiles,
        selectedPlatforms,
        selectedPlacements,
        analyzeText,
        autoMatch
      );

      setResults(response.results);

      // Scroll to results section smoothly
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: unknown) {
      console.error('Validation request failed:', err);
      let message = '검수 요청 처리 중 오류가 발생했습니다. 백엔드 서버 상태를 확인해주세요.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axErr = err as { response?: { data?: { detail?: string } } };
        if (axErr.response?.data?.detail) {
          message = axErr.response.data.detail;
        }
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Map file names to preview URLs for ResultDashboard
  const filePreviewMap: Record<string, string> = {};
  files.forEach((f) => {
    filePreviewMap[f.file.name] = f.previewUrl;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step 1: Upload */}
        <FileUploader
          files={files}
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveFile}
          onClearFiles={handleClearFiles}
          disabled={isLoading}
        />

        {/* Step 2: Platform & Placement Selection & Action */}
        <MediaSelector
          selectedPlatforms={selectedPlatforms}
          onChangeSelected={setSelectedPlatforms}
          platformsMetadata={platformsMetadata}
          selectedPlacements={selectedPlacements}
          onChangePlacements={setSelectedPlacements}
          onUpdateSpecs={handleUpdateSpecs}
          isUpdatingSpecs={isUpdatingSpecs}
          specsUpdateMessage={specsUpdateMessage}
          analyzeText={analyzeText}
          onToggleAnalyzeText={setAnalyzeText}
          autoMatch={autoMatch}
          onToggleAutoMatch={setAutoMatch}
          onStartValidation={handleStartValidation}
          isLoading={isLoading}
          canValidate={files.length > 0 && selectedPlatforms.length > 0}
          fileCount={files.length}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="text-sm">
              <span className="font-bold">검수 오류: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Step 3: Results Dashboard */}
        {results && (
          <div id="results-section" className="pt-4">
            <ResultDashboard
              results={results}
              filePreviews={filePreviewMap}
              onReset={() => {
                setResults(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>
          광고 소재 규격 자동 검수 시스템 • 카카오, 네이버, 애디슨, 구글, 메타, 틱톡, 몰로코, 크리테오, RTB House, 애피어, 엑스 (X)
        </p>
      </footer>
    </div>
  );
};

export default App;
