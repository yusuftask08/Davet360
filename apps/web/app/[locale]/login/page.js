'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { loginSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email: form.email.trim(), password: form.password });
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      // Token artık backend'in set ettiği httpOnly cookie'de tutuluyor, JS'e hiç dokunmuyor.
      // localStorage'da sadece görüntüleme amaçlı, hassas olmayan kullanıcı bilgisi kalıyor.
      const { user } = await apiClient.post(ENDPOINTS.login, result.data);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
      <Card>
        <h1>{t('loginTitle')}</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label={t('emailLabel')}
            type="email"
            required
            maxLength={254}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={fieldErrors.email}
          />
          <Input
            label={t('passwordLabel')}
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={fieldErrors.password}
          />
          <Button type="submit" disabled={loading}>
            {loading ? t('loginSubmitting') : t('loginSubmit')}
          </Button>
          {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
        </form>
        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-md)' }}>
          <Link href="/forgot-password">{t('forgotPasswordLink')}</Link>
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
          {t('noAccount')} <Link href="/register">{t('registerLink')}</Link>
        </p>
      </Card>
    </main>
  );
}
