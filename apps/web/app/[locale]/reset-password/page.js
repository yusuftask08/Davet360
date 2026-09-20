'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { resetPasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';

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

  if (!token) {
    return (
      <main className="container" style={{ maxWidth: 420, paddingTop: 'var(--space-2xl)' }}>
        <Card>
          <p style={{ color: 'var(--color-error)' }}>{t('resetPasswordInvalidLink')}</p>
          <Link href="/forgot-password">{t('forgotPasswordLink')}</Link>
        </Card>
      </main>
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
    <main className="container" style={{ maxWidth: 420, paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
      <Card>
        <h1>{t('resetPasswordTitle')}</h1>
        {success ? (
          <p>{t('resetPasswordSuccess')}</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
            <Input
              label={t('newPasswordLabel')}
              type="password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
            <Button type="submit" disabled={loading}>
              {loading ? '...' : t('resetPasswordSubmit')}
            </Button>
            {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
          </form>
        )}
      </Card>
    </main>
  );
}
