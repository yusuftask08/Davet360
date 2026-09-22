'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { contactSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, AltchaWidget } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';

const INITIAL_FORM = { name: '', email: '', message: '' };

export function ContactForm() {
  const t = useTranslations('pages.contact');
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState(null);

  const handleAltchaSolved = useCallback((payload) => setAltchaPayload(payload), []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const payload = { name: form.name.trim(), email: form.email.trim(), message: form.message.trim() };
    const result = contactSchema.safeParse(payload);
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
      await apiClient.post(ENDPOINTS.contact, { ...result.data, altcha: altchaPayload });
      setSent(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card style={{ marginTop: 'var(--space-lg)' }}>
      {sent ? (
        <p>{t('success')}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label={t('nameLabel')}
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={fieldErrors.name}
          />
          <Input
            label={t('emailLabel')}
            type="email"
            required
            maxLength={254}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={fieldErrors.email}
          />
          <div className="ui-field">
            <label className="ui-field__label" htmlFor="message">
              {t('messageLabel')}
            </label>
            <textarea
              id="message"
              className="ui-input"
              rows={5}
              required
              minLength={10}
              maxLength={2000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            {fieldErrors.message && <span className="ui-field__error">{fieldErrors.message}</span>}
          </div>
          <AltchaWidget
            challengeUrl={`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.altchaChallenge}`}
            onSolved={handleAltchaSolved}
          />
          <Button type="submit" disabled={loading || !altchaPayload}>
            {loading ? t('submitting') : t('submit')}
          </Button>
          {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
        </form>
      )}
    </Card>
  );
}
