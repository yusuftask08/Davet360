'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { resetPasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Lock, Eye, EyeOff, CheckCircle2 } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { AuthShell } from '../components/AuthShell.jsx';

// useSearchParams() Next.js'te Suspense sınırı ister.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <AuthShell title={t('resetPasswordTitle')}>
        <p className="auth-card__error">{t('resetPasswordInvalidLink')}</p>
        <p style={{ marginTop: 'var(--space-md)' }}>
          <Link href="/forgot-password" className="link-inline">
            {t('forgotPasswordLink')}
          </Link>
        </p>
      </AuthShell>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const result = resetPasswordSchema.safeParse({ token, password });
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.resetPassword, result.data);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t('resetPasswordTitle')}>
      {success ? (
        <div className="auth-card__success">
          <CheckCircle2 size={40} strokeWidth={1.5} />
          <p>{t('resetPasswordSuccess')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
          <Input
            label={t('newPasswordLabel')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            icon={Lock}
            endAdornment={
              <button
                type="button"
                className="ui-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <Button type="submit" disabled={loading}>
            {loading ? '...' : t('resetPasswordSubmit')}
          </Button>
          {formError && <p className="auth-card__error" role="alert">{formError}</p>}
        </form>
      )}
    </AuthShell>
  );
}
