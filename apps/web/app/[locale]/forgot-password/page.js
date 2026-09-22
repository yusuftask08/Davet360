'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { forgotPasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, AltchaWidget, Mail, CheckCircle2 } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { AuthShell } from '../components/AuthShell.jsx';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState(null);

  const handleAltchaSolved = useCallback((payload) => setAltchaPayload(payload), []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const result = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    if (!altchaPayload) {
      setFormError(t('altchaWaiting'));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.forgotPassword, { ...result.data, altcha: altchaPayload });
      setSent(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t('forgotPasswordTitle')}
      subtitle={!sent ? t('forgotPasswordSubtitle') : undefined}
      footer={
        <p>
          <Link href="/login" className="link-inline">
            {t('backToLogin')}
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="auth-card__success">
          <CheckCircle2 size={40} strokeWidth={1.5} />
          <p>{t('forgotPasswordSuccess')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
          <Input
            label={t('emailLabel')}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <AltchaWidget
            challengeUrl={`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.altchaChallenge}`}
            onSolved={handleAltchaSolved}
          />
          <Button type="submit" disabled={loading || !altchaPayload}>
            {loading ? '...' : t('forgotPasswordSubmit')}
          </Button>
          {formError && <p className="auth-card__error">{formError}</p>}
        </form>
      )}
    </AuthShell>
  );
}
