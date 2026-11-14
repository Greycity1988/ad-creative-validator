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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-3xl shadow-soft-lg border border-line w-full max-w-md overflow-hidden animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-line flex items-center justify-between bg-surface flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent text-white rounded-2xl shadow-soft-xs">
              <Coffee className="w-5 h-5 text-[#FFDD00]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary flex items-center space-x-1.5">
                <span>개발자 커피 후원하기</span>
                <span className="text-[10px] font-mono font-semibold bg-canvas-subtle text-ink-secondary border border-line px-2 py-0.5 rounded-full">
                  Coffee Sponsorship
                </span>
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                안전하고 간편한 글로벌 창작자 후원 플랫폼
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 bg-accent-mint/10 border border-accent-mint/20 rounded-2xl text-xs text-ink-primary font-medium flex items-start space-x-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-accent-mint flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{toastMessage}</div>
            </div>
          )}

          {/* QR Code */}
          <div className="p-5 bg-canvas-subtle/70 rounded-2xl border border-line flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface border border-line text-ink-secondary text-[11px] font-semibold shadow-2xs">
              <QrCode className="w-3.5 h-3.5 text-accent" />
              <span>스마트폰 카메라로 비추면 3초 만에 연결</span>
            </div>

            <div className="p-3.5 bg-surface rounded-2xl border border-line shadow-soft-xs">
              <QRCodeSVG
                value={BMC_URL}
                size={150}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-ink-primary">
                PC 사용자는 카메라로 QR 코드를 비추시거나,
              </p>
              <p className="text-[11px] text-ink-muted">
                아래 버튼을 눌러 Buy Me a Coffee 공식 페이지에서 바로 후원하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* Witty encouragement banner */}
          <div className="p-3 bg-amber-500/[0.06] rounded-xl border border-amber-500/20 flex items-center space-x-2.5 text-xs">
            <span className="text-xl">☕✨</span>
            <div className="leading-snug">
              <strong className="text-ink-primary font-bold text-xs">
                당신의 $1가 개발자에게 큰 힘이 됩니다!
              </strong>
              <p className="text-[11px] text-ink-secondary mt-0.5">
                야근과 지속적인 신규 매체 규격 업데이트 연구를 이어가는 가장 달콤한 연료입니다 🚀
              </p>
            </div>
          </div>

          {/* Main CTA */}
          <div className="space-y-2.5">
            <a
              href={BMC_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-5 rounded-full bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-soft-xs cursor-pointer active:scale-[0.99]"
            >
              <Coffee className="w-4 h-4 text-[#FFDD00]" />
              <span>Buy Me a Coffee로 커피 한 잔 후원하기</span>
              <ExternalLink className="w-4 h-4 text-white/80" />
            </a>

            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3.5 py-2 bg-canvas-subtle rounded-full text-xs font-mono text-ink-muted truncate border border-line">
                buymeacoffee.com/greycity1988
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs ${
                  copied
                    ? 'bg-accent-mint text-white'
                    : 'bg-surface hover:bg-canvas-subtle text-ink-primary border border-line'
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
          <div className="p-4 bg-canvas-subtle/50 rounded-2xl border border-line space-y-2 text-[11px] text-ink-secondary leading-relaxed">
            <div className="flex items-center space-x-1.5 font-bold text-ink-primary">
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span>안전한 글로벌 창작자 후원 플랫폼</span>
            </div>
            <p>
              <strong>Buy Me a Coffee</strong>는 전 세계 수백만 창작자와 개발자가 사용하는 안전한 후원 플랫폼입니다. 국내외 신용카드, 체크카드, 간편결제로 계좌번호나 개인정보 노출 없이 간편하게 마음을 전하실 수 있습니다.
            </p>
            <div className="pt-2 border-t border-line/60 flex items-start space-x-1.5 text-ink-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-mint flex-shrink-0 mt-0.5" />
              <span>
                후원금은 <strong>ACV의 완전 무료 서비스 유지와 매체 공식 가이드 모니터링 및 규격 연구</strong>에 소중하게 사용됩니다.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-canvas-subtle/50 flex items-center justify-between text-xs text-ink-muted flex-shrink-0">
          <span className="flex items-center space-x-1">
            <Heart className="w-3.5 h-3.5 text-status-fail fill-current" />
            <span>Thank you for supporting Owen O. Magnus!</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-secondary hover:text-ink-primary font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
