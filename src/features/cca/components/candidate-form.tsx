'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { examApi, ExamApiError } from '../api';
import type { Session } from '../contracts';

export function CandidateForm({
  available,
  initialSession,
  onVerified,
}: {
  available: boolean;
  initialSession?: Session | null;
  onVerified: (session: Session) => Promise<void>;
}) {
  const router = useRouter();
  const setupSession = initialSession?.kind === 'password_setup' ? initialSession : null;
  const [username, setUsername] = useState('');
  const [passwordUsername, setPasswordUsername] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const needsPassword = !!setupSession || passwordUsername !== null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (setupSession) {
        if (password.length < 12 || password !== confirmPassword)
          throw new Error('Mật khẩu cần ít nhất 12 ký tự và xác nhận phải khớp.');
        const session = await examApi.setupPassword(password, confirmPassword);
        if (session.kind !== 'authenticated')
          throw new Error('Chưa hoàn tất đặt mật khẩu. Vui lòng thử lại.');
        setPassword('');
        setConfirmPassword('');
        await onVerified(session);
        return;
      }
      const canonicalUsername = (passwordUsername ?? username).trim().toLowerCase();
      const result = await examApi.login(
        canonicalUsername,
        passwordUsername === null ? undefined : password
      );
      if ('needPassword' in result) {
        setUsername(result.username);
        setPasswordUsername(result.username);
        setPassword('');
        setVisible(false);
        return;
      }
      setPassword('');
      if (result.session.kind === 'password_setup') router.replace('/setup-password');
      else await onVerified(result.session);
    } catch (error) {
      setError(
        setupSession && error instanceof ExamApiError && error.status === 401
          ? 'Phiên đặt mật khẩu đã hết hạn. Chọn Đổi tài khoản để đăng nhập lại.'
          : error instanceof Error
            ? error.message
            : 'Chưa thể đăng nhập.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeAccount() {
    setBusy(true);
    setError('');
    try {
      if (setupSession) {
        await examApi.logout();
        router.replace('/login');
      } else {
        setPasswordUsername(null);
      }
      setPassword('');
      setConfirmPassword('');
      setVisible(false);
    } catch {
      setError('Chưa thể đổi tài khoản. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="mx-auto max-w-sm py-12 sm:py-20"
      aria-labelledby="candidate-heading"
    >
      <h1
        id="candidate-heading"
        className={setupSession ? 'font-serif text-2xl' : 'sr-only'}
      >
        {setupSession ? 'Đặt mật khẩu của bạn' : 'Đăng nhập phòng thi'}
      </h1>
      <form onSubmit={submit} className="mt-4" aria-busy={busy}>
        <fieldset disabled={busy} className="min-w-0 space-y-4">
          {!setupSession && (
            <label className="block space-y-2 text-sm font-medium">
              <span className="sr-only">Username</span>
              <Input
                name="username"
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={64}
                value={passwordUsername ?? username}
                onChange={(event) => setUsername(event.target.value)}
                readOnly={passwordUsername !== null}
                required
                className="read-only:bg-muted/40 focus-visible:ring-ring/30 h-11"
              />
            </label>
          )}
          {needsPassword && (
            <div className="space-y-2">
              <label className="block space-y-2 text-sm font-medium">
                <span>{setupSession ? 'Mật khẩu mới' : 'Mật khẩu'}</span>
                <Input
                  key={setupSession ? 'setup' : 'password'}
                  autoFocus
                  name="password"
                  aria-describedby={setupSession ? 'password-requirements' : undefined}
                  type={visible ? 'text' : 'password'}
                  autoComplete={setupSession ? 'new-password' : 'current-password'}
                  minLength={setupSession ? 12 : 1}
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="focus-visible:ring-ring/30 h-11"
                />
              </label>
              {setupSession && (
                <p id="password-requirements" className="text-muted-foreground text-xs">
                  Từ 12 đến 128 ký tự.
                </p>
              )}
            </div>
          )}
          {setupSession && (
            <label className="block space-y-2 text-sm font-medium">
              <span>Xác nhận mật khẩu</span>
              <Input
                name="confirmPassword"
                type={visible ? 'text' : 'password'}
                autoComplete="new-password"
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="focus-visible:ring-ring/30 h-11"
              />
            </label>
          )}
          {needsPassword && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex cursor-pointer items-center gap-2 rounded py-1 text-xs focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setVisible(!visible)}
              aria-pressed={visible}
            >
              {visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            </button>
          )}
          {error && (
            <p
              role="alert"
              className="text-destructive bg-destructive/5 border-destructive/20 rounded-lg border p-3 text-sm leading-6"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="h-11 w-full shadow-none hover:shadow-none"
            isLoading={busy}
            disabled={!available}
          >
            {setupSession ? 'Đặt mật khẩu' : passwordUsername ? 'Đăng nhập' : 'Tiếp tục'}
          </Button>
          {needsPassword && (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground w-full"
              onClick={() => void changeAccount()}
            >
              Đổi tài khoản
            </Button>
          )}
        </fieldset>
      </form>
    </section>
  );
}
