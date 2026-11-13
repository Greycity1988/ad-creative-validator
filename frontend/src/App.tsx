import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewHero } from './components/OverviewHero';
import { FileUploader } from './components/FileUploader';
import { MediaSelector } from './components/MediaSelector';
import { ResultDashboard } from './components/ResultDashboard';
import { FeedbackModal } from './components/FeedbackModal';
import { DonationModal } from './components/DonationModal';
import { GuideModal } from './components/GuideModal';
import { LogoModal } from './components/LogoModal';
import { ACVLogo } from './components/ACVLogo';
import { UploadedFileItem, ValidationItem, PlatformMetadata } from './types';
import { fetchPlatformsMetadata, validateImages } from './api/validator';
import { AlertCircle } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { track, pageview } from '@vercel/analytics';

export const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  // Default to the 4 core major platforms to prevent result cluttering
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'naver',
    'kakao',
    'meta',
    'google_ads',
  ]);
  const [platformsMetadata, setPlatformsMetadata] = useState<PlatformMetadata[]>([]);
  const [selectedPlacements, setSelectedPlacements] = useState<Record<string, string[]>>({});
  const [autoMatch, setAutoMatch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ValidationItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isDonationOpen, setIsDonationOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isLogoOpen, setIsLogoOpen] = useState<boolean>(false);

  // Fetch available platform & placement specs from backend (or static fallback)
  useEffect(() => {
    fetchPlatformsMetadata()
      .then((data) => setPlatformsMetadata(data))
      .catch((err) => console.error('Failed to fetch platforms metadata:', err));
  }, []);

  // Clean up object URLs strictly on unmount
  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

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
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  };

  const handleStartValidation = async () => {
    if (files.length === 0 || selectedPlatforms.length === 0) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Track validation metrics for project owner
      try {
        // 1. Virtual pageview: tracks under "Pages" (/validated) completely free on Vercel Hobby plan
        pageview({ route: '/validated', path: '/validated' });
        if (window.location.pathname !== '/validated') {
          window.history.pushState({}, '', '/validated');
        }

        // 2. Custom event: logged if Pro plan is active
        track('Validation Executed', {
          file_count: files.length,
          platform_count: selectedPlatforms.length,
          platforms: selectedPlatforms.slice(0, 8).join(','),
          auto_match: autoMatch ? 'enabled' : 'disabled',
        });
      } catch {
        // ignore tracking failures
      }

      const rawFiles = files.map((f) => f.file);
      const response = await validateImages(
        rawFiles,
        selectedPlatforms,
        selectedPlacements,
        false,
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
      let message = '검수 처리 중 예기치 못한 오류가 발생했습니다.';
      if (err instanceof Error) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Map item IDs and file names to preview URLs for ResultDashboard
  const filePreviewMap: Record<string, string> = {};
  files.forEach((f) => {
    filePreviewMap[f.file.name] = f.previewUrl;
    filePreviewMap[f.id] = f.previewUrl;
  });

  const totalPlacementsCount = platformsMetadata.reduce(
    (acc, p) => acc + (p.placements?.length || 0),
    0
  ) || 160;

  return (
    <div className="min-h-screen bg-canvas text-ink-primary font-sans antialiased flex flex-col selection:bg-accent/15 selection:text-accent">
      <Analytics scriptSrc="https://va.vercel-scripts.com/v1/script.js" />
      <Header
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenLogo={() => setIsLogoOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Scandinavian Metric Hero Banner */}
        <OverviewHero
          files={files}
          selectedPlatformCount={selectedPlatforms.length}
          totalPlatformCount={platformsMetadata.length}
          totalPlacementCount={totalPlacementsCount}
          onScrollToUpload={() => {
            const el = document.getElementById('step-upload');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Step 1: Upload */}
        <div id="step-upload">
          <FileUploader
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
            disabled={isLoading}
          />
        </div>

        {/* Step 2: Platform & Placement Selection & Action */}
        <MediaSelector
          selectedPlatforms={selectedPlatforms}
          onChangeSelected={setSelectedPlatforms}
          platformsMetadata={platformsMetadata}
          selectedPlacements={selectedPlacements}
          onChangePlacements={setSelectedPlacements}
          autoMatch={autoMatch}
          onToggleAutoMatch={setAutoMatch}
          onStartValidation={handleStartValidation}
          isLoading={isLoading}
          canValidate={files.length > 0 && selectedPlatforms.length > 0}
          fileCount={files.length}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-5 bg-red-50/80 border border-red-200/90 rounded-2xl flex items-start space-x-3 text-red-800 shadow-soft-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="text-sm">
              <span className="font-bold">검수 처리 오류: </span>
              <span className="text-red-700">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Step 3: Results Dashboard */}
        {results && (
          <div id="results-section" className="pt-2">
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

      <footer className="mt-auto border-t border-line bg-surface/80 backdrop-blur-sm py-10 text-center text-xs text-ink-muted space-y-3 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => setIsLogoOpen(true)}
          className="group relative p-2 rounded-2xl hover:bg-canvas-subtle transition-all cursor-pointer"
          title="클릭하여 ACV 로고 아이덴티티 및 고해상도 엠블럼 크게 보기"
        >
          <ACVLogo size={36} showText={false} className="opacity-80 group-hover:opacity-100 transition-transform group-hover:scale-105" />
        </button>
        <p className="font-semibold text-ink-primary text-sm tracking-tight">
          Crafted with passion in 2026 by <strong className="text-accent font-bold">Owen O. Magnus</strong>.
        </p>
        <p className="text-xs text-ink-secondary font-medium">
          Feedbacks are warmly welcomed, and{' '}
          <button
            type="button"
            onClick={() => setIsDonationOpen(true)}
            className="text-accent hover:text-accent-hover font-bold underline decoration-accent/30 hover:decoration-accent cursor-pointer inline-flex items-center space-x-1"
          >
            <span>coffee sponsorships</span>
            <span>☕✨</span>
          </button>{' '}
          are deeply appreciated!
        </p>
        <p className="text-[11px] text-ink-muted">
          ACV (Ad Creative Validator) • 32 Major Advertising Platforms & 430+ Official Placements Supported • PC 환경 최적화
        </p>
      </footer>

      {/* Modals */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
      <LogoModal
        isOpen={isLogoOpen}
        onClose={() => setIsLogoOpen(false)}
      />
    </div>
  );
};

export default App;
