'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { loginSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Mail, Lock, Eye, EyeOff } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { AuthShell } from '../components/AuthShell.jsx';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <AuthShell
      title={t('loginTitle')}
      subtitle={t('loginSubtitle')}
      footer={
        <>
          <p>
            <Link href="/forgot-password" className="link-inline">
              {t('forgotPasswordLink')}
            </Link>
          </p>
          <p>
            {t('noAccount')} <Link href="/register" className="link-inline">{t('registerLink')}</Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
        <Input
          label={t('emailLabel')}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          icon={Mail}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={fieldErrors.email}
        />
        <Input
          label={t('passwordLabel')}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
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
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={fieldErrors.password}
        />
        <Button type="submit" disabled={loading}>
          {loading ? t('loginSubmitting') : t('loginSubmit')}
        </Button>
        {formError && <p className="auth-card__error">{formError}</p>}
      </form>
    </AuthShell>
  );
}
