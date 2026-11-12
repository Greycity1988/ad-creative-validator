import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle2, Sparkles, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { FeedbackItem, FeedbackCreateRequest } from '../types';
import { HAS_BACKEND, buildFeedbackIssueUrl, fetchFeedbacks, submitFeedback } from '../api/validator';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'write'>('list');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (!HAS_BACKEND) {
        window.open(buildFeedbackIssueUrl(reqData), '_blank', 'noopener,noreferrer');
        setSuccessMessage(
          'GitHub 이슈 작성 화면을 새 탭으로 열었습니다. 그 화면에서 등록(Create) 버튼을 눌러야 개발자에게 전달됩니다. (GitHub 로그인 필요)'
        );
        return;
      }

      await submitFeedback(reqData);
      setSuccessMessage('건의가 등록되었습니다. 검토 상태는 목록에서 확인할 수 있습니다.');
      setTitle('');
      setContent('');
      setActiveTab('list');
      await loadFeedbacks();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setErrorMessage('건의 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-3xl shadow-soft-lg border border-line w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-6 border-b border-line flex items-center justify-between bg-surface">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent text-white rounded-2xl shadow-soft-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-primary">
                건의 및 규격 업데이트 제보
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                {HAS_BACKEND
                  ? '신규 매체 추가 요청이나 최신 규격 변경 제보를 남겨주세요.'
                  : '작성한 내용은 GitHub Issues로 연결되어 개발팀에 직접 전달됩니다.'}
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

        {/* Tab Navigation */}
        <div className="px-6 pt-4 pb-2 bg-surface">
          <div className="bg-canvas-subtle p-1 rounded-2xl border border-line inline-flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-surface text-ink-primary shadow-soft-xs border border-line'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <span>건의 & 업데이트 내역 ({feedbacks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'write'
                  ? 'bg-surface text-accent shadow-soft-xs border border-line'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-mint" />
              <span>새 건의 작성하기</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {successMessage && (
            <div className="p-4 bg-accent-mint/10 border border-accent-mint/20 rounded-2xl flex items-center space-x-2.5 text-xs text-ink-primary animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-accent-mint flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-2.5 text-xs text-status-fail animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-status-fail flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'write' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-primary mb-1.5">
                  건의 분류 <span className="text-status-fail">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['신규 매체 추가', '규격 변경 제보', '기능 개선', '버그 신고'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        category === cat
                          ? 'border-accent bg-accent/5 text-accent font-bold shadow-soft-xs'
                          : 'border-line bg-surface text-ink-secondary hover:bg-canvas-subtle'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-primary mb-1.5">
                  제목 <span className="text-status-fail">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 크리테오 쇼케이스 규격 추가 제보"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-line bg-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className={`grid grid-cols-1 gap-3 ${HAS_BACKEND ? 'sm:grid-cols-2' : ''}`}>
                <div>
                  <label className="block text-xs font-bold text-ink-primary mb-1.5">
                    작성자 (선택)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="익명 마케터"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-line bg-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                {HAS_BACKEND && (
                  <div>
                    <label className="block text-xs font-bold text-ink-primary mb-1.5">
                      이메일 (답변 수신용, 선택)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-line bg-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-primary mb-1.5">
                  상세 내용 <span className="text-status-fail">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="추가하고 싶은 광고 매체명, 지면 종류, 해상도(px), 용량(KB), 공식 가이드 링크 등을 자유롭게 작성해주세요."
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-line bg-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold rounded-full border border-line text-ink-secondary hover:bg-canvas-subtle cursor-pointer transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold rounded-full bg-accent hover:bg-accent-hover text-white shadow-soft-xs disabled:opacity-50 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting ? '등록 중...' : HAS_BACKEND ? '건의 등록하기' : 'GitHub 이슈로 보내기'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-1">
                <span>등록된 건의 목록 (최신순)</span>
                <button
                  type="button"
                  onClick={loadFeedbacks}
                  className="inline-flex items-center space-x-1 text-ink-secondary hover:text-accent font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>
              </div>

              {feedbacks.length === 0 ? (
                <div className="text-center py-10 px-4 text-ink-secondary text-xs space-y-3 bg-canvas-subtle/50 rounded-2xl border border-line">
                  <p className="font-bold text-ink-primary">
                    {HAS_BACKEND
                      ? '현재 등록된 건의 및 규격 제보 내역이 없습니다.'
                      : '건의 및 규격 제보 내역은 GitHub Issues에서 확인할 수 있습니다.'}
                  </p>
                  <p className="text-ink-muted text-[11px] leading-relaxed max-w-md mx-auto">
                    새로운 매체 지면 추가나 규격 변경 제보는 상단 <strong>[새 건의 작성하기]</strong> 탭을 이용하시거나,
                    개발자 공식 GitHub 저장소 Issues를 통해 제보해주실 수 있습니다.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://github.com/Greycity1988/ad-creative-validator/issues"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-soft-xs"
                    >
                      <span>GitHub Issues로 제보하기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                feedbacks.map((item) => {
                  const isDone = item.status === '반영 완료';
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-line bg-surface shadow-soft-xs space-y-2 hover:border-line-strong transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-canvas-subtle text-ink-secondary border border-line">
                              {item.category}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                                isDone
                                  ? 'bg-accent-mint/10 text-accent-mint border border-accent-mint/20'
                                  : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                              }`}
                            >
                              {item.status}
                            </span>
                            <span className="text-[11px] text-ink-muted font-mono">
                              {item.author} • {item.created_at}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-ink-primary">{item.title}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-ink-secondary leading-relaxed whitespace-pre-wrap">
                        {item.content}
                      </p>

                      {/* Developer Reply */}
                      {item.reply && (
                        <div className="mt-2.5 p-3 rounded-xl bg-canvas-subtle border border-line text-xs space-y-1">
                          <div className="flex items-center space-x-1 font-bold text-accent text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-accent-mint" />
                            <span>개발팀 답변 / 업데이트 결과</span>
                          </div>
                          <p className="text-ink-secondary leading-relaxed font-normal">
                            {item.reply}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-canvas-subtle/50 text-center text-[11px] text-ink-muted">
          마케터 및 디자이너분들의 의견을 바탕으로 상시 업데이트되고 있습니다.
        </div>
      </div>
    </div>
  );
};
