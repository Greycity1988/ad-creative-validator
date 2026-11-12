import React, { useState } from 'react';
import {
  X,
  Coffee,
  Heart,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  QrCode,
  Monitor,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentTab = 'qr' | 'account';
type QrChannel = 'toss' | 'kakao';

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(3000);
  const [activeTab, setActiveTab] = useState<PaymentTab>('qr');
  const [qrChannel, setQrChannel] = useState<QrChannel>('toss');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Donation bank details
  const BANK_NAME = '카카오뱅크';
  const ACCOUNT_NUMBER = '0000-00-0000000';
  const ACCOUNT_NUMBER_CLEAN = '0000000000000';
  const ACCOUNT_HOLDER = '개발자';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(`${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`);
    setCopied(true);
    showToast('카카오뱅크 계좌번호와 예금주가 복사되었습니다! (PC 카카오톡 또는 인터넷 뱅킹에 바로 붙여넣기)');
    setTimeout(() => setCopied(false), 2500);
  };

  // Toss Direct Remittance Deep Link
  const tossDeepLink = `supertoss://send?bank=${encodeURIComponent(BANK_NAME)}&accountNo=${ACCOUNT_NUMBER_CLEAN}&amount=${selectedAmount}`;
  const kakaoAccountText = `${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`;

  const currentQrValue = qrChannel === 'toss' ? tossDeepLink : kakaoAccountText;

  const handleTossPay = () => {
    navigator.clipboard.writeText(`${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      showToast(`💙 토스 앱을 실행하여 ${selectedAmount.toLocaleString()}원 송금 화면으로 연결합니다.`);
      window.location.href = tossDeepLink;
    } else {
      showToast(`💙 계좌번호(${BANK_NAME} ${ACCOUNT_NUMBER})와 후원금액(₩${selectedAmount.toLocaleString()})이 복사되었습니다! 모바일 토스 앱을 열어 [붙여넣기] 해주세요.`);
      try {
        window.location.href = tossDeepLink;
      } catch {
        // ignore
      }
    }
  };

  const handleKakaoPay = () => {
    navigator.clipboard.writeText(`${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    showToast(`💬 카카오뱅크 계좌번호가 복사되었습니다! 카카오톡이나 카카오뱅크 앱을 열면 '복사한 계좌로 송금' 팝업이 바로 나타납니다.`);

    if (isMobile) {
      setTimeout(() => {
        window.location.href = 'kakaotalk://';
      }, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
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
                PC와 모바일 어디서나 3초 만에 간편하게 후원하실 수 있습니다.
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

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Coffee Option Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              후원 금액 선택
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { amount: 3000, label: '☕ 커피 1잔', desc: '아메리카노 응원!' },
                { amount: 6000, label: '☕☕ 커피 2잔', desc: '커피 & 디저트' },
                { amount: 10000, label: '🚀 서버 후원', desc: '호스팅 & 유지비' },
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

          {/* Toast Notification Box */}
          {toastMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-start space-x-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{toastMessage}</div>
            </div>
          )}

          {/* Tab Selector: QR Code vs Direct Copy */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>📱 PC 추천: 스마트폰 QR 송금</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Monitor className="w-4 h-4 text-emerald-600" />
              <span>💻 계좌 직접 복사 & 앱 송금</span>
            </button>
          </div>

          {/* TAB 1: QR Code Scanner for PC Users */}
          {activeTab === 'qr' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3.5 animate-fadeIn">
              {/* Channel Selector for QR */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQrChannel('toss')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    qrChannel === 'toss'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  💙 토스(Toss) 송금 QR
                </button>
                <button
                  type="button"
                  onClick={() => setQrChannel('kakao')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    qrChannel === 'kakao'
                      ? 'bg-yellow-400 text-slate-900 border-yellow-400 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  💬 카카오뱅크 송금 QR
                </button>
              </div>

              {/* QR Code SVG Box */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-200/90 shadow-md">
                <QRCodeSVG
                  value={currentQrValue}
                  size={150}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  {qrChannel === 'toss'
                    ? `스마트폰 카메라로 비추면 토스 앱이 열리며 ₩${selectedAmount.toLocaleString()}원이 자동 입력됩니다.`
                    : '카카오톡 상단 [코드스캔] 또는 카메라로 비추면 바로 송금창이 열립니다.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {BANK_NAME} <span className="font-mono font-semibold text-slate-700">{ACCOUNT_NUMBER}</span> ({ACCOUNT_HOLDER})
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAccount}
                className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>계좌번호 텍스트로 바로 복사하기</span>
              </button>
            </div>
          )}

          {/* TAB 2: Direct Account Copy / App Launch */}
          {activeTab === 'account' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Account Transfer Box */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center space-x-1.5">
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                    <span>계좌 직접 송금</span>
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
                        <span>복사 완료!</span>
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

              {/* Quick Pay Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    간편 송금 앱 연동 (토스 / 카카오)
                  </label>
                  <span className="text-[11px] text-slate-400">선택 금액: ₩{selectedAmount.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleKakaoPay}
                    className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-yellow-300 bg-yellow-400/95 hover:bg-yellow-400 text-slate-900 font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-98"
                    title="카카오뱅크 계좌를 복사하고 카카오톡 송금으로 연결합니다."
                  >
                    <span>💬 카카오페이 / 카카오뱅크</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-800" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTossPay}
                    className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-blue-400 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-98"
                    title="토스 앱을 실행하여 카카오뱅크 계좌와 후원 금액이 자동 입력된 송금창을 띄웁니다."
                  >
                    <span>💙 토스(Toss) 바로 송금</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Guarantee / Promise Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-2 text-[11px] text-slate-600 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              후원해주신 소중한 금액은 <strong>서버 호스팅 비용, 도메인 유지비, 신규 광고 매체 API 및 가이드라인 동기화 연구</strong>에 투명하게 사용됩니다. 진심으로 감사드립니다!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
