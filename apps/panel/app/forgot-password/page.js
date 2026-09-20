'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { forgotPasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, AltchaWidget } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';
import { AuthShell } from '../components/AuthShell.jsx';

export default function ForgotPasswordPage() {
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
      setFormError('Lütfen doğrulama kutucuğunun tamamlanmasını bekleyin');
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
    <AuthShell>
      <Card>
        <h1>Şifremi Unuttum</h1>
        {sent ? (
          <p>Email adresiniz sistemde kayıtlıysa şifre sıfırlama linki gönderildi.</p>
        ) : (
          <>
            <p style={{ color: 'var(--color-neutral-500)', marginTop: 0 }}>
              Email adresinizi girin, şifre sıfırlama linki gönderelim.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
              <Input
                label="Email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
              />
              <AltchaWidget
                challengeUrl={`${process.env.NEXT_PUBLIC_API_URL}/altcha/challenge`}
                onSolved={handleAltchaSolved}
              />
              <Button type="submit" disabled={loading || !altchaPayload}>
                {loading ? '...' : 'Sıfırlama Linki Gönder'}
              </Button>
              {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
            </form>
          </>
        )}
        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-md)' }}>
          <Link href="/login">Giriş sayfasına dön</Link>
        </p>
      </Card>
    </AuthShell>
  );
}
