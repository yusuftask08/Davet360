'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { registerSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, AltchaWidget } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';
import { AuthShell } from '../components/AuthShell.jsx';

const INITIAL_FORM = { name: '', email: '', password: '', phone: '' };

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const webUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3600';

  const handleAltchaSolved = useCallback((payload) => setAltchaPayload(payload), []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
    };

    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    if (!termsAccepted) {
      setFormError('Devam etmek için şartları kabul etmelisiniz');
      return;
    }

    if (!altchaPayload) {
      setFormError('Lütfen doğrulama kutucuğunun tamamlanmasını bekleyin');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.register, { ...result.data, altcha: altchaPayload });
      const { user } = await apiClient.post(ENDPOINTS.login, {
        email: result.data.email,
        password: result.data.password,
      });
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/vendor/new');
    } catch (err) {
      if (err.status === 400 && err.details) {
        setFieldErrors(err.details);
      } else {
        setFormError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="İşletme Olarak Kayıt Ol"
      subtitle="Önce hesabınızı oluşturun, ardından işletme bilgilerinizi gireceksiniz."
      footer={
        <p>
          Zaten hesabınız var mı? <Link href="/login" className="link-inline">Giriş yapın</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
        <Input
          label="Ad Soyad"
          required
          maxLength={100}
          value={form.name}
          onChange={update('name')}
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          type="email"
          required
          maxLength={254}
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email}
        />
        <Input
          label="Telefon (opsiyonel)"
          type="tel"
          inputMode="tel"
          placeholder="0532 123 45 67"
          maxLength={20}
          value={form.phone}
          onChange={update('phone')}
          error={fieldErrors.phone}
        />
        <Input
          label="Şifre"
          type="password"
          required
          minLength={8}
          maxLength={72}
          value={form.password}
          onChange={update('password')}
          error={fieldErrors.password}
        />
        <label className="auth-card__terms">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span>
            <a href={`${webUrl}/terms`} target="_blank" rel="noopener noreferrer" className="link-inline">
              Kullanım Şartları'nı
            </a>{' '}
            ve{' '}
            <a href={`${webUrl}/privacy`} target="_blank" rel="noopener noreferrer" className="link-inline">
              Gizlilik Politikası'nı
            </a>{' '}
            okudum, kabul ediyorum.
          </span>
        </label>
        <AltchaWidget
          challengeUrl={`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.altchaChallenge}`}
          onSolved={handleAltchaSolved}
        />
        <Button type="submit" disabled={loading || !altchaPayload || !termsAccepted}>
          {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </Button>
        {formError && <p className="auth-card__error" role="alert">{formError}</p>}
      </form>
    </AuthShell>
  );
}
