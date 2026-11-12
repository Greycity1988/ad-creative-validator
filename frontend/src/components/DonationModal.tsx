import React, { useState } from 'react';
import {
  X,
  Coffee,
  Heart,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  QrCode,
  Globe,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const BMC_URL = 'https://buymeacoffee.com/greycity1988';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(BMC_URL);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = BMC_URL;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      showToast('Buy Me a Coffee 후원 링크가 복사되었습니다!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast(`링크: ${BMC_URL}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-[#FFDD00] text-slate-900 rounded-xl shadow-xs font-black">
              <Coffee className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-1.5">
                <span>개발자 커피 후원하기</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Buy Me a Coffee
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                안전하고 간편한 글로벌 창작자 후원 플랫폼
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium flex items-start space-x-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{toastMessage}</div>
            </div>
          )}

          {/* QR Code and Mobile Guide for PC Users */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-900 text-[11px] font-bold">
              <QrCode className="w-3.5 h-3.5 text-yellow-700" />
              <span>스마트폰 카메라로 비추면 3초 만에 연결</span>
            </div>

            {/* QR Code SVG */}
            <div className="p-3 bg-white rounded-2xl border-2 border-yellow-300 shadow-sm">
              <QRCodeSVG
                value={BMC_URL}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                PC 사용자는 카메라로 QR 코드를 비추시거나,
              </p>
              <p className="text-[11px] text-slate-500">
                아래 버튼을 눌러 Buy Me a Coffee 공식 페이지에서 바로 후원하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* Main CTA: Go to Buy Me a Coffee */}
          <div className="space-y-2">
            <a
              href={BMC_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#FFDD00] hover:bg-[#FACC15] text-slate-900 font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-98"
            >
              <Coffee className="w-4 h-4 text-slate-900" />
              <span>Buy Me a Coffee로 커피 한 잔 후원하기</span>
              <ExternalLink className="w-4 h-4 text-slate-900" />
            </a>

            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 truncate border border-slate-200">
                buymeacoffee.com/greycity1988
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
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
                    <span>링크 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Safe & Global Support Notice */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-[11px] text-slate-600 leading-relaxed">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>안전한 글로벌 창작자 후원 플랫폼</span>
            </div>
            <p>
              <strong>Buy Me a Coffee</strong>는 전 세계 수백만 창작자와 개발자가 사용하는 안전한 후원 플랫폼입니다. 국내외 신용카드, 체크카드, 간편결제로 계좌번호나 개인정보 노출 없이 간편하게 마음을 전하실 수 있습니다.
            </p>
            <div className="pt-1 border-t border-slate-200 flex items-start space-x-1.5 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                후원금은 <strong>ACV의 완전 무료 서비스 유지와 15대 매체 공식 가이드 모니터링 및 규격 연구</strong>에 소중하게 사용됩니다.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span className="flex items-center space-x-1">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>Thank you for supporting Owen O. Magnus!</span>
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
