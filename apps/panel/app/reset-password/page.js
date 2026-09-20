'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { resetPasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';
import { AuthShell } from '../components/AuthShell.jsx';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
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
      <AuthShell>
        <Card>
          <p style={{ color: 'var(--color-error)' }}>Bu link geçersiz. Şifre sıfırlama işlemini tekrar başlatın.</p>
          <Link href="/forgot-password">Şifremi unuttum</Link>
        </Card>
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
    <AuthShell>
      <Card>
        <h1>Yeni Şifre Belirle</h1>
        {success ? (
          <p>Şifreniz güncellendi. Şimdi giriş yapabilirsiniz.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
            <Input
              label="Yeni Şifre"
              type="password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
            <Button type="submit" disabled={loading}>
              {loading ? '...' : 'Şifreyi Güncelle'}
            </Button>
            {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
