'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { createReviewSchema, toFieldErrors } from '@repo/utils';
import { Button, Input } from '@repo/ui';
import { Link } from '../../../../../i18n/navigation.js';
import { apiClient } from '../../../../../lib/apiClient.js';

export function ReviewForm({ vendorId }) {
  const t = useTranslations('reviewForm');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const payload = { vendorId, rating: Number(form.rating), comment: form.comment.trim() };
    const result = createReviewSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setStatus('loading');
    try {
      await apiClient.post(ENDPOINTS.reviews, result.data);
      setStatus('success');
    } catch (err) {
      setFormError(err.message);
      setStatus('error');
    }
  }

  if (!isLoggedIn) {
    return (
      <p style={{ color: 'var(--color-neutral-500)' }}>
        {t('loginPrompt')} <Link href="/login">{t('loginLink')}</Link>.
      </p>
    );
  }

  if (status === 'success') {
    return <p>{t('success')}</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
      <div className="ui-field">
        <label className="ui-field__label" htmlFor="rating">
          {t('ratingLabel')}
        </label>
        <select
          id="rating"
          className="ui-input"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>
      </div>
      <Input
        label={t('commentLabel')}
        required
        maxLength={1000}
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        error={fieldErrors.comment}
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? t('submitting') : t('submit')}
      </Button>
      {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
    </form>
  );
}
