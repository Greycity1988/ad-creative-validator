import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Mail,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { FeedbackItem, FeedbackCreateRequest } from '../types';
import { fetchFeedbacks, submitFeedback } from '../api/validator';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEV_EMAIL = 'laplui2@me.com';
const GITHUB_ISSUES_URL = 'https://github.com/Greycity1988/ad-creative-validator/issues/new';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'list'>('write');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('신규 매체 추가');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFeedbacks();
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const formatFeedbackBody = (
    titleStr: string,
    catStr: string,
    contentStr: string,
    authorStr: string,
    emailStr?: string
  ) => {
    return `[ACV 건의 및 규격 제보]
• 분류: ${catStr}
• 제목: ${titleStr}
• 작성자: ${authorStr || '익명 마케터'}
• 회신 이메일: ${emailStr || '미입력'}
• 작성 일시: ${new Date().toLocaleString('ko-KR')}

[상세 제보 내용]
${contentStr}

----------------------------------------
* 광고 소재 규격 자동 검수 시스템(ACV) 피드백 폼에서 작성되었습니다.`;
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyEmail = async () => {
    const success = await copyToClipboard(DEV_EMAIL);
    if (success) {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMessage('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const reqData: FeedbackCreateRequest = {
        title: title.trim(),
        category,
        content: content.trim(),
        author: author.trim() || '익명 마케터',
        email: email.trim() || undefined,
      };

      // 1. Save local record for user history
      await submitFeedback(reqData);

      // 2. Prepare formatted email
      const bodyText = formatFeedbackBody(
        reqData.title,
        reqData.category,
        reqData.content,
        reqData.author || '',
        reqData.email
      );

      // 3. Copy to clipboard
      await copyToClipboard(bodyText);

      // 4. Trigger mailto
      const subject = encodeURIComponent(`[ACV ${category}] ${title.trim()}`);
      const body = encodeURIComponent(bodyText);
      window.location.href = `mailto:${DEV_EMAIL}?subject=${subject}&body=${body}`;

      setSuccessMessage(
        `제보 내용이 클립보드에 복사되었으며 이메일 창이 열렸습니다. 메일을 발송하시면 개발팀에서 확인 후 신속히 반영합니다! (${DEV_EMAIL})`
      );
      setTitle('');
      setContent('');
      await loadFeedbacks();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setErrorMessage('제보 처리 중 오류가 발생했습니다. 아래 개발자 이메일로 직접 보내주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenGitHubIssue = async () => {
    if (!title.trim() && !content.trim()) {
      window.open(GITHUB_ISSUES_URL, '_blank');
      return;
    }

    const currentTitle = title.trim() || '신규 규격 제보';
    const bodyText = formatFeedbackBody(currentTitle, category, content.trim(), author.trim(), email.trim());
    await copyToClipboard(bodyText);

    const issueTitle = encodeURIComponent(`[${category}] ${currentTitle}`);
    const issueBody = encodeURIComponent(bodyText);
    window.open(`${GITHUB_ISSUES_URL}?title=${issueTitle}&body=${issueBody}`, '_blank');

    setSuccessMessage('내용이 클립보드에 복사되었으며 GitHub Issues 등록 페이지가 새 탭으로 열렸습니다!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-800">
                  개발자에게 건의 및 규격 업데이트 제보
                </h2>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Direct Contact
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                신규 매체 추가 요청이나 최신 규격 변경 제보를 개발팀에 직접 전달합니다.
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

        {/* Developer Contact Quick Bar */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>개발자 직통 이메일:</span>
            <strong className="text-slate-800 font-mono text-[11px]">{DEV_EMAIL}</strong>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-semibold cursor-pointer transition-colors"
              title="이메일 주소 복사"
            >
              {emailCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>주소 복사</span>
                </>
              )}
            </button>
          </div>

          <a
            href="https://github.com/Greycity1988/ad-creative-validator/issues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-slate-600 hover:text-blue-600 font-semibold text-[11px] cursor-pointer"
          >
            <span>GitHub Issues 저장소</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'write'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>건의 / 규격 제보 작성</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>내 로컬 작성 히스토리 ({feedbacks.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'write' ? (
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start space-x-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>대외비 소재 보안 보장 원칙:</strong> ACV는 사용자의 광고 소재 유출을 원천 방지하기 위해 일체의 중앙 데이터베이스 서버를 두지 않습니다. 따라서 작성하신 제보는 <strong>개발자 이메일(mailto)</strong> 또는 <strong>공식 GitHub Issues</strong>를 통해 개발팀에 유실 없이 즉시 직결됩니다.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  건의 분류 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['신규 매체 추가', '규격 변경 제보', '기능 개선', '버그 신고'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        category === cat
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 크리테오 쇼케이스 규격 추가 제보"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    작성자 (선택)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="익명 마케터"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    이메일 (답변 수신용, 선택)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상세 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="추가하고 싶은 광고 매체명, 지면 종류, 해상도(px), 용량(KB), 공식 가이드 링크 등을 자유롭게 작성해주세요."
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons: Email vs GitHub */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenGitHubIssue}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors shadow-2xs"
                  title="GitHub Issues 템플릿에 내용을 자동 채워 등록합니다."
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>GitHub Issues로 제보하기</span>
                </button>

                <div className="w-full sm:w-auto flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('');
                      setContent('');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    내용 비우기
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? '처리 중...' : '이메일로 제보 전송하기'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>내 브라우저 작성 기록 (최근순)</span>
                <button
                  type="button"
                  onClick={loadFeedbacks}
                  className="inline-flex items-center space-x-1 text-slate-500 hover:text-blue-600 font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>
              </div>

              {feedbacks.length === 0 ? (
                <div className="text-center py-10 px-4 text-slate-500 text-xs space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-700">작성된 제보 내역이 없습니다.</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed max-w-md mx-auto">
                    새로운 매체 지면 추가나 규격 변경 제보는 상단 <strong>[건의 / 규격 제보 작성]</strong> 탭을 이용하시거나,
                    개발자 공식 이메일 또는 GitHub Issues를 통해 제보해주실 수 있습니다.
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>새 제보 작성하기</span>
                    </button>
                    <a
                      href="https://github.com/Greycity1988/ad-creative-validator/issues"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors shadow-2xs"
                    >
                      <span>GitHub Issues 열기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                feedbacks.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              제보 등록됨
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {item.author} • {item.created_at}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {item.content}
                      </p>

                      <div className="pt-1 flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            copyToClipboard(
                              formatFeedbackBody(item.title, item.category, item.content, item.author, item.email)
                            );
                            setSuccessMessage('해당 건의 내용이 클립보드에 복사되었습니다.');
                          }}
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>내용 복사</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-[11px] text-slate-400">
          마케터 및 디자이너분들의 의견을 바탕으로 상시 업데이트되고 있습니다. (문의: {DEV_EMAIL})
        </div>
      </div>
    </div>
  );
};

