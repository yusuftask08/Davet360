'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { registerSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, AltchaWidget } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';

const INITIAL_FORM = { name: '', email: '', password: '', phone: '' };

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      setFormError(t('termsRequired'));
      return;
    }

    if (!altchaPayload) {
      setFormError(t('altchaWaiting'));
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
      router.push('/');
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
    <main className="container" style={{ maxWidth: 420, paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
      <Card>
        <h1>{t('registerTitle')}</h1>
        <p style={{ color: 'var(--color-neutral-500)', marginTop: 0 }}>{t('registerSubtitle')}</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label={t('nameLabel')}
            required
            maxLength={100}
            value={form.name}
            onChange={update('name')}
            error={fieldErrors.name}
          />
          <Input
            label={t('emailLabel')}
            type="email"
            required
            maxLength={254}
            value={form.email}
            onChange={update('email')}
            error={fieldErrors.email}
          />
          <Input
            label={t('phoneLabel')}
            type="tel"
            inputMode="tel"
            placeholder="0532 123 45 67"
            maxLength={20}
            value={form.phone}
            onChange={update('phone')}
            error={fieldErrors.phone}
          />
          <Input
            label={t('passwordLabel')}
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={form.password}
            onChange={update('password')}
            error={fieldErrors.password}
          />
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 'var(--font-size-sm)' }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              {t.rich('termsAgreement', {
                terms: (chunks) => <Link href="/terms" className="link-inline">{chunks}</Link>,
                privacy: (chunks) => <Link href="/privacy" className="link-inline">{chunks}</Link>,
              })}
            </span>
          </label>
          <AltchaWidget challengeUrl={`${process.env.NEXT_PUBLIC_API_URL}/altcha/challenge`} onSolved={handleAltchaSolved} />
          <Button type="submit" disabled={loading || !altchaPayload || !termsAccepted}>
            {loading ? t('registerSubmitting') : t('registerSubmit')}
          </Button>
          {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
        </form>
        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-md)' }}>
          {t('hasAccount')} <Link href="/login" className="link-inline">{t('loginLink')}</Link>
        </p>
      </Card>
    </main>
  );
}
