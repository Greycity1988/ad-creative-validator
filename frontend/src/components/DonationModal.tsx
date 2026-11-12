import React, { useState } from 'react';
import { X, Coffee, Heart, Copy, Check, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(3000);
  const [copied, setCopied] = useState(false);

  // Donation bank details
  const BANK_NAME = '카카오뱅크';
  const ACCOUNT_NUMBER = '0000-00-0000000';
  const ACCOUNT_HOLDER = '개발자';

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(`${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-1.5">
                <span>개발자 커피 후원하기</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  Sponsorship
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                광고 소재 검수 도구의 무료 운영과 지속적인 규격 최신화에 큰 힘이 됩니다.
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

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Coffee Option Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              후원 금액 선택
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { amount: 3000, label: '☕ 커피 1잔', desc: '아메리카노 응원!' },
                { amount: 6000, label: '☕☕ 커피 2잔', desc: '커피와 달콤한 디저트' },
                { amount: 10000, label: '🚀 서버 후원', desc: '1달 서버 호스팅 지원' },
              ].map((opt) => (
                <button
                  key={opt.amount}
                  type="button"
                  onClick={() => setSelectedAmount(opt.amount)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedAmount === opt.amount
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm text-amber-950 font-bold scale-[1.02]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-sm font-extrabold text-amber-600 mt-0.5">
                    ₩{opt.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Transfer Box */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>계좌 간편 이체 후원</span>
              </span>
              <span className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                수수료 0원
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">{BANK_NAME}</span>
                <p className="text-sm font-mono font-bold text-slate-900 tracking-wide mt-0.5">
                  {ACCOUNT_NUMBER}
                </p>
                <span className="text-[11px] text-slate-500">예금주: {ACCOUNT_HOLDER}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyAccount}
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>계좌 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Pay Links */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              간편 송금 앱 바로가기
            </label>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://qr.kakaopay.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-yellow-300 bg-yellow-400/90 hover:bg-yellow-400 text-slate-900 font-bold text-xs transition-colors shadow-2xs"
              >
                <span>💬 카카오페이 송금</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              </a>

              <a
                href="https://toss.me"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-blue-300 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <span>💙 토스(Toss) 송금</span>
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </a>
            </div>
          </div>

          {/* Guarantee / Promise Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-2 text-[11px] text-slate-600 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              후원해주신 소중한 금액은 <strong>서버 호스팅 비용, 도메인 유지비, 신규 광고 매체 API 및 가이드라인 동기화 연구</strong>에 투명하게 사용됩니다. 진심으로 감사드립니다!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Thank you for supporting this project!</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
