'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Mail, MessageSquarePlus, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'Đóng góp tính năng',
  'Báo lỗi kỹ thuật',
  'Góp ý bài học / Lab',
  'Hợp tác & Giao lưu',
  'Khác',
];

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage('Vui lòng nhập nội dung góp ý tối thiểu 5 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi.');
      }

      setIsSuccess(true);
      setMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pathname = usePathname();
  const isInterviewPage = pathname?.startsWith('/interview');
  const isHome = pathname === '/';

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setErrorMessage('');
  };

  return (
    <>
      {/* Floating Trigger Button on bottom-right of viewport */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'group fixed z-40 flex h-11 cursor-pointer items-center justify-center rounded-full border border-indigo-500/30 bg-slate-900/85 px-3 text-xs font-semibold text-slate-200 shadow-xl shadow-black/50 backdrop-blur-md transition-all duration-300 hover:border-indigo-400 hover:bg-slate-800 hover:text-white hover:shadow-indigo-500/10',
          isInterviewPage
            ? 'right-6 bottom-20'
            : isHome
              ? 'right-6 bottom-14'
              : 'right-6 bottom-6'
        )}
        aria-label="Mở hòm thư góp ý"
        title="Hòm thư góp ý"
      >
        <Mail className="h-4.5 w-4.5 shrink-0 text-indigo-400 transition-transform duration-200 group-hover:scale-110" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:max-w-[120px] group-hover:pl-2 group-hover:opacity-100">
          Hòm thư góp ý
        </span>
      </button>

      {/* Modal Backdrop & Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          />

          {/* Modal Box */}
          <div className="animate-in fade-in zoom-in-95 relative w-full max-w-lg rounded-2xl border border-slate-700/60 bg-[#0d121f] p-6 text-left shadow-2xl shadow-indigo-950/40 duration-150">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Đóng modal"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              /* Success View */
              <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    Cảm ơn bạn đã đóng góp!
                  </h3>
                  <p className="max-w-sm text-sm text-slate-400">
                    Ý kiến của bạn đã được chuyển thẳng tới{' '}
                    <span className="font-semibold text-indigo-400">
                      contact@dev-pro.online
                    </span>
                    . Đội ngũ dev-pro sẽ phản hồi sớm nhất có thể.
                  </p>
                </div>
                <Button
                  onClick={handleClose}
                  className="mt-2 bg-indigo-600 font-medium text-white hover:bg-indigo-500"
                >
                  Đóng cửa sổ
                </Button>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>Hòm thư góp ý</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Gửi ý kiến đóng góp & Phản hồi
                  </h2>
                  <p className="text-xs text-slate-400">
                    Mọi ý kiến của bạn sẽ được gửi thẳng tới{' '}
                    <a
                      href="mailto:contact@dev-pro.online"
                      className="font-medium text-indigo-400 hover:underline"
                    >
                      contact@dev-pro.online
                    </a>
                  </p>
                </div>

                {errorMessage && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {errorMessage}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="feedback-email"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Email của bạn (tùy chọn — để nhận phản hồi)
                  </label>
                  <Input
                    id="feedback-email"
                    type="email"
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-700 bg-slate-900/60 text-xs text-slate-200 placeholder:text-slate-500"
                  />
                </div>

                {/* Category Pills */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Chủ đề góp ý
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          category === cat
                            ? 'bg-indigo-600 font-semibold text-white'
                            : 'border border-slate-700 bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="feedback-message"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Nội dung góp ý <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    id="feedback-message"
                    required
                    rows={4}
                    placeholder="Bạn thấy phần nào cần cải thiện, cần thêm tính năng gì hoặc phát hiện lỗi ở đâu..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border-slate-700 bg-slate-900/60 text-xs leading-relaxed text-slate-200 placeholder:text-slate-500"
                  />
                </div>

                {/* Submit & direct mail link */}
                <div className="flex items-center justify-between pt-2">
                  <a
                    href="mailto:contact@dev-pro.online"
                    className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-indigo-400"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Gửi trực tiếp qua email client</span>
                  </a>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer gap-1.5 bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Gửi góp ý</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
