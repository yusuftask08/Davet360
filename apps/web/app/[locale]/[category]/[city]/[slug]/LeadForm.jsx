'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { createLeadSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, AltchaWidget } from '@repo/ui';
import { apiClient } from '../../../../../lib/apiClient.js';

const INITIAL_FORM = { customerName: '', customerPhone: '', eventDate: '', message: '' };

export function LeadForm({ vendorId }) {
  const t = useTranslations('leadForm');
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState(null);
  const [altchaPayload, setAltchaPayload] = useState(null);

  const handleAltchaSolved = useCallback((payload) => setAltchaPayload(payload), []);

  // Giriş yapmış kullanıcının adını önceden doldurur — apiClient zaten token'ı Authorization
  // header'ına ekliyor, backend bu isteği kendi hesabına otomatik bağlıyor (optionalAuth).
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') ?? 'null');
      if (user?.name) setForm((prev) => ({ ...prev, customerName: user.name }));
    } catch {
      // localStorage okunamazsa formu boş bırak, sorun değil
    }
  }, []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const payload = {
      vendorId,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      ...(form.eventDate ? { eventDate: form.eventDate } : {}),
      ...(form.message.trim() ? { message: form.message.trim() } : {}),
    };

    // Aynı zod şeması apps/api'de de çalışıyor — telefon formatı/uzunluk kuralları tek yerden gelir.
    const result = createLeadSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    if (!altchaPayload) {
      setFormError(t('altchaWaiting'));
      return;
    }

    setStatus('loading');
    try {
      await apiClient.post(ENDPOINTS.leads, { ...result.data, altcha: altchaPayload });
      setStatus('success');
    } catch (err) {
      if (err.status === 400 && err.details) {
        setFieldErrors(err.details);
        setStatus('idle');
      } else {
        setFormError(err.message);
        setStatus('error');
      }
    }
  }

  if (status === 'success') {
    return <p>{t('success')}</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
      <Input
        label={t('name')}
        required
        maxLength={100}
        value={form.customerName}
        onChange={update('customerName')}
        error={fieldErrors.customerName}
      />
      <Input
        label={t('phone')}
        type="tel"
        inputMode="tel"
        placeholder="0532 123 45 67"
        required
        maxLength={20}
        value={form.customerPhone}
        onChange={update('customerPhone')}
        error={fieldErrors.customerPhone}
      />
      <Input
        label={t('eventDate')}
        type="date"
        value={form.eventDate}
        onChange={update('eventDate')}
        error={fieldErrors.eventDate}
      />
      <Input
        label={t('message')}
        maxLength={1000}
        value={form.message}
        onChange={update('message')}
        error={fieldErrors.message}
      />
      <AltchaWidget challengeUrl={`${process.env.NEXT_PUBLIC_API_URL}/altcha/challenge`} onSolved={handleAltchaSolved} />
      <Button type="submit" disabled={status === 'loading' || !altchaPayload}>
        {status === 'loading' ? t('submitting') : t('submit')}
      </Button>
      {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
    </form>
  );
}
