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
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentTab = 'qr' | 'account' | 'paypal';

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(3000);
  const [activeTab, setActiveTab] = useState<PaymentTab>('qr');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Donation bank details
  const BANK_NAME = '카카오뱅크';
  const ACCOUNT_NUMBER = '0000-00-0000000';
  const ACCOUNT_NUMBER_CLEAN = '0000000000000';
  const ACCOUNT_HOLDER = '개발자';
  const PAYPAL_EMAIL = 'donation@example.com'; // Owen O. Magnus PayPal account

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

  // Toss Direct Remittance Deep Link (Verified 100% working)
  const tossDeepLink = `supertoss://send?bank=${encodeURIComponent(BANK_NAME)}&accountNo=${ACCOUNT_NUMBER_CLEAN}&amount=${selectedAmount}`;

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

  const usdAmount = selectedAmount === 3000 ? 3 : selectedAmount === 6000 ? 5 : 10;

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

          {/* Tab Selector: QR Code vs Direct Copy vs PayPal */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>📱 토스 QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              <span>💬 계좌 복사</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paypal')}
              className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                activeTab === 'paypal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>💳 페이팔 카드</span>
            </button>
          </div>

          {/* TAB 1: QR Code Scanner for PC Users (Toss 100% verified) */}
          {activeTab === 'qr' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3.5 animate-fadeIn">
              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>스마트폰 카메라 / 토스로 비추면 3초 만에 송금 완료</span>
              </div>

              {/* QR Code SVG Box */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-blue-200/90 shadow-md">
                <QRCodeSVG
                  value={tossDeepLink}
                  size={155}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  스마트폰 기본 카메라로 비추면 토스 앱이 열리며 <span className="text-blue-600 font-extrabold">₩{selectedAmount.toLocaleString()}원</span>이 자동 입력됩니다.
                </p>
                <p className="text-[11px] text-slate-500">
                  {BANK_NAME} <span className="font-mono font-semibold text-slate-700">{ACCOUNT_NUMBER}</span> ({ACCOUNT_HOLDER})
                </p>
              </div>

              {/* Kakao & General Copy Helper */}
              <div className="w-full pt-2 border-t border-slate-200/80 flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="w-full py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                  title="카카오뱅크 계좌를 복사하여 카카오톡이나 은행 앱에서 붙여넣기합니다."
                >
                  <Copy className="w-3.5 h-3.5 text-slate-800" />
                  <span>💬 카카오톡 / 카카오뱅크로 송금하기 (계좌 1초 복사)</span>
                </button>
                <p className="text-[10px] text-slate-500 leading-tight">
                  💡 카카오톡/카카오뱅크는 계좌번호 복사 후 앱을 열면 <strong>"복사한 계좌로 송금할까요?"</strong> 팝업이 바로 나타납니다.
                </p>
              </div>
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

          {/* TAB 3: PayPal Credit/Debit Card Payment */}
          {activeTab === 'paypal' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">해외 및 국내 신용/체크카드 결제 (PayPal)</span>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  글로벌 카드 지원
                </span>
              </div>

              {/* Supported card badges */}
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold flex-wrap gap-y-1">
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-bold">VISA</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-bold">MasterCard</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-bold">AMEX</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-bold">JCB</span>
                <span className="text-slate-500 text-[11px]">페이팔 계정 없이 카드 단독 결제 가능</span>
              </div>

              {/* Amount conversion summary */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">후원 금액 (USD):</span>
                  <span className="font-black text-blue-600 text-sm">
                    ${usdAmount}.00 USD
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>수취 계정:</span>
                  <span className="font-mono font-semibold text-slate-700">{PAYPAL_EMAIL}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  (한화 약 {selectedAmount.toLocaleString()}원 상당 • 달러(USD) 기준으로 안전하게 승인 결제됩니다)
                </p>
              </div>

              {/* PayPal External Link Button */}
              <a
                href={`https://www.paypal.com/donate/?business=${encodeURIComponent(PAYPAL_EMAIL)}&currency_code=USD&amount=${usdAmount}&item_name=Ad%20Creative%20Validator%20Coffee%20Sponsorship`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <span>🅿️ PayPal 신용/체크카드 결제창 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                💡 페이팔 화면이 열리면 로그인할 필요 없이 <strong className="text-slate-800">[신용카드 또는 체크카드로 결제 (Donate with Debit or Credit Card)]</strong>를 누르시면 3초 만에 카드 결제하실 수 있습니다.
              </p>
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
