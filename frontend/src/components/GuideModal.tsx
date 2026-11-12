import React from 'react';
import { X, BookOpen, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-3xl shadow-soft-lg border border-line w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-6 border-b border-line flex items-center justify-between bg-surface">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent text-white rounded-2xl shadow-soft-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-ink-primary">
                  광고 소재 검수 도구 활용 가이드
                </h2>
                <span className="text-[10px] font-mono font-semibold bg-canvas-subtle text-ink-secondary border border-line px-2.5 py-0.5 rounded-full">
                  User Guide
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                실무에서 불필요한 소재 심사 반려를 0%로 줄이는 검수 워크플로우 안내
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-ink-secondary">
          {/* Section 1: Why is this needed? */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold font-mono">
                01
              </span>
              <h3 className="text-sm font-bold text-ink-primary">
                왜 이 검수 시스템이 필요한가요?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl border border-line bg-canvas-subtle/50 space-y-1.5">
                <div className="font-bold text-ink-primary flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-fail" />
                  <span>심사 반려(Reject) 사전 차단</span>
                </div>
                <p className="text-ink-secondary leading-relaxed text-[11px]">
                  매체마다 해상도(단 1px 차이), 용량(KB), 비율, 알파 채널(투명 PNG) 요구가 제각각이라, 등록 후 반려 시 캠페인 라이브가 1~2일 지연됩니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-line bg-canvas-subtle/50 space-y-1.5">
                <div className="font-bold text-ink-primary flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-mint" />
                  <span>투명 배경 & 포맷 바이너리 검증</span>
                </div>
                <p className="text-ink-secondary leading-relaxed text-[11px]">
                  카카오 비즈보드, 네이버 스마트채널 등 투명 배경(Alpha PNG)이 필수인 지면의 누끼 여부와 파일 확장자 위장 여부를 정밀 분석합니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-line bg-canvas-subtle/50 space-y-1.5">
                <div className="font-bold text-ink-primary flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  <span>수십 개 매체 가이드 전수 대조</span>
                </div>
                <p className="text-ink-secondary leading-relaxed text-[11px]">
                  카카오, 네이버, 메타, 구글, 크리테오 등 수십 페이지짜리 매체 가이드 PDF를 찾아볼 필요 없이, 이미지만 올리면 모든 규격을 1초 만에 전수 대조합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: When to use? */}
          <div className="space-y-3 pt-2 border-t border-line/60">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold font-mono">
                02
              </span>
              <h3 className="text-sm font-bold text-ink-primary">
                실무 활용 시점 권장
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-canvas-subtle/60 border border-line">
                <div className="w-6 h-6 rounded-lg bg-surface border border-line text-accent font-mono font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-2xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-ink-primary">
                    캠페인 라이브 D-1 또는 당일 소재 일괄 등록 전
                  </h4>
                  <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                    디자이너로부터 전달받은 대량의 배너 에셋을 매체사 어드민에 업로드하기 직전, 단 한 번의 드래그앤드롭으로 불일치 소재를 사전 적발할 때.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-canvas-subtle/60 border border-line">
                <div className="w-6 h-6 rounded-lg bg-surface border border-line text-accent font-mono font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-2xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-ink-primary">
                    디자인 제작/익스포트 완료 직후 자가 검증 시
                  </h4>
                  <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                    피그마나 포토샵에서 내보낸 PNG 파일의 배경 투명도(Alpha 누끼)가 제대로 적용되었는지, 용량이 기준 한도 내에 들어왔는지 즉시 자가 체크할 때.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-canvas-subtle/60 border border-line">
                <div className="w-6 h-6 rounded-lg bg-surface border border-line text-accent font-mono font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-2xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-ink-primary">
                    디자이너 ↔ 마케터 간 수정 요청 커뮤니케이션 시
                  </h4>
                  <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                    검수 완료 후 <strong>[CSV 다운로드 (엑셀 호환)]</strong>를 눌러 불합격 사유가 일목요연하게 정리된 시트를 메신저로 공유할 때.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 3-step usage */}
          <div className="space-y-3 pt-2 border-t border-line/60">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold font-mono">
                03
              </span>
              <h3 className="text-sm font-bold text-ink-primary">
                3단계 초간단 사용 방법
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl border border-line bg-canvas-subtle/50 space-y-1">
                <span className="text-[10px] font-mono font-bold text-accent bg-surface px-2 py-0.5 rounded-md border border-line">
                  STEP 01
                </span>
                <h4 className="font-bold text-ink-primary mt-1">소재 파일 업로드</h4>
                <p className="text-[11px] text-ink-secondary">
                  검수할 이미지(JPG, PNG, GIF, WebP)를 드래그앤드롭합니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-line bg-canvas-subtle/50 space-y-1">
                <span className="text-[10px] font-mono font-bold text-accent bg-surface px-2 py-0.5 rounded-md border border-line">
                  STEP 02
                </span>
                <h4 className="font-bold text-ink-primary mt-1">지면 또는 매체 선택</h4>
                <p className="text-[11px] text-ink-secondary">
                  원클릭 필터 또는 15개 매체 카드에서 타겟 지면을 확인합니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-line bg-canvas-subtle/50 space-y-1">
                <span className="text-[10px] font-mono font-bold text-accent bg-surface px-2 py-0.5 rounded-md border border-line">
                  STEP 03
                </span>
                <h4 className="font-bold text-ink-primary mt-1">정밀 검수 & CSV 리포트</h4>
                <p className="text-[11px] text-ink-secondary">
                  검수 시작을 누르고 1초 만에 판정 결과와 CSV 파일을 수령합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-line bg-canvas-subtle/50 flex items-center justify-between text-xs">
          <span className="text-ink-muted text-[11px]">
            궁금한 점이나 추가 규격 제보는 상단의 <strong>[건의 / 제보]</strong>를 이용해주세요.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-bold cursor-pointer transition-all shadow-soft-xs"
          >
            확인 및 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
