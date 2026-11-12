import React from 'react';
import { X, BookOpen, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800">
                  광고 소재 검수 도구 활용 가이드
                </h2>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  User Guide
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                이 도구가 왜 필요한지, 그리고 실무에서 언제 어떻게 쓰면 가장 효과적인지 안내해 드립니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
          {/* Section 1: Why is this needed? */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                !
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                1. 왜 이 검수 시스템이 필요한가요?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1.5">
                <div className="font-bold text-rose-800 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>잦은 심사 반려(Reject) 방지</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  매체마다 해상도(단 1px 차이), 용량(KB), 비율, 알파 채널(투명 PNG) 요구가 제각각이라, 등록 후 심사 반려되면 캠페인 라이브 일정이 1~2일씩 지연됩니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 space-y-1.5">
                <div className="font-bold text-amber-800 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>텍스트 20% 초과 사전 진단</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  네이버 타임보드·스페셜DA, 카카오 비즈보드는 이미지 내 텍스트 면적이 20%를 넘으면 즉각 반려됩니다. AI OCR로 등록 전에 즉시 초과 여부를 감지합니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1.5">
                <div className="font-bold text-blue-800 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>수십 개 가이드 뒤적임 종결</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  카카오, 네이버, 메타, 구글, 크리테오 등 수십 페이지짜리 매체 가이드 PDF를 찾아볼 필요 없이, 이미지만 올리면 모든 규격을 1초 만에 전수 대조합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: When to use? */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                ★
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                2. 실무에서 어떨 때 사용하면 가장 좋나요?
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    캠페인 라이브 D-1 또는 당일 소재 일괄 등록 전
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    디자이너로부터 전달받은 대량의 배너 에셋(수십~수백 개)을 매체사 어드민에 업로드하기 직전, 단 한 번의 드래그앤드롭으로 불일치 소재를 사전 적발할 때.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    디자인 제작/익스포트 완료 직후 자가 검증 시
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    피그마나 포토샵에서 내보낸 PNG 파일의 배경 투명도(Alpha 누끼)가 제대로 적용되었는지, 용량이 300KB/500KB 한도 내에 들어왔는지 디자이너가 즉시 자가 체크할 때.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    디자이너 ↔ 마케터 간 수정 요청 커뮤니케이션 시
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    "이 소재 수정해주세요"라고 말로 설명할 필요 없이, 검수 완료 후 <strong>[엑셀 리포트 다운로드]</strong>를 눌러 불합격 사유가 일목요연하게 정리된 시트를 슬랙/잔디에 공유할 때.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    매체별 공식 개정 규격이 헷갈리거나 확인이 필요할 때
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    카카오 비즈보드 960×300 단일화, 네이버 NOSP 타임보드 1660×260, 스페셜DA 1250×520 등 2026년 최신 공식 가이드라인 개정일과 세부 규격을 확인하고 싶을 때.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 3-step usage */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                ✓
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                3. 3단계 초간단 사용 방법
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  STEP 1
                </span>
                <h4 className="font-bold text-slate-800 mt-1">소재 파일 업로드</h4>
                <p className="text-[11px] text-slate-500">
                  검수할 이미지(JPG, PNG, GIF, WebP)를 점선 영역에 끌어다 놓습니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  STEP 2
                </span>
                <h4 className="font-bold text-slate-800 mt-1">지면 또는 매체 선택</h4>
                <p className="text-[11px] text-slate-500">
                  상단 <strong>[17대 주요 지면 셀렉터]</strong>에서 카카오 DA, 네이버 타임보드 등 원하는 지면을 선택합니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  STEP 3
                </span>
                <h4 className="font-bold text-slate-800 mt-1">검수 시작 & 리포트</h4>
                <p className="text-[11px] text-slate-500">
                  파란색 <strong>[검수 시작]</strong> 버튼을 누르고 결과 확인 및 엑셀 다운로드를 진행합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            궁금한 점이나 추가 규격 제보는 헤더의 <strong>[건의 / 규격 제보]</strong>를 이용해주세요!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors"
          >
            확인 및 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
