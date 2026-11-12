import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle2, Sparkles, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { FeedbackItem, FeedbackCreateRequest } from '../types';
import { fetchFeedbacks, submitFeedback } from '../api/validator';

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

      await submitFeedback(reqData);
      setSuccessMessage('건의가 성공적으로 등록되었습니다! 개발팀에서 검토 후 빠르게 업데이트하겠습니다.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                개발자에게 건의 및 규격 업데이트 제보
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                신규 매체 추가 요청이나 최신 규격 변경 제보를 남겨주시면 신속히 반영합니다.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>건의 & 업데이트 내역 ({feedbacks.length})</span>
          </button>
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
            <span>새 건의 작성하기</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'write' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? '등록 중...' : '건의 등록하기'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>등록된 건의 목록 (최신순)</span>
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
                  <p className="font-bold text-slate-700">현재 등록된 건의 및 규격 제보 내역이 없습니다.</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed max-w-md mx-auto">
                    새로운 매체 지면 추가나 규격 변경 제보는 상단 <strong>[새 건의 작성하기]</strong> 탭을 이용하시거나,
                    개발자 공식 GitHub 저장소 Issues를 통해 제보해주실 수 있습니다.
                  </p>
                  <div className="pt-1">
                    <a
                      href="https://github.com/Greycity1988/ad-creative-validator/issues"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors shadow-2xs"
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
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {item.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.status}
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

                      {/* Developer Reply */}
                      {item.reply && (
                        <div className="mt-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs space-y-1">
                          <div className="flex items-center space-x-1 font-bold text-blue-900 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>개발팀 답변 / 업데이트 결과</span>
                          </div>
                          <p className="text-blue-800 leading-relaxed font-normal">
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
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-[11px] text-slate-400">
          마케터 및 디자이너분들의 의견을 바탕으로 상시 업데이트되고 있습니다.
        </div>
      </div>
    </div>
  );
};
