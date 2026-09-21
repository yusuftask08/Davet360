'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { updateProfileSchema, changePasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, Badge, Star } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';

const STATUS_VARIANT = { new: 'default', contacted: 'accent', closed: 'success' };

export default function AccountPage() {
  const t = useTranslations('account');
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState(null);

  const [leads, setLeads] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      setError('loginRequired');
      return;
    }
    apiClient
      .get(ENDPOINTS.me)
      .then((data) => {
        setUser(data.user);
        setProfileForm({ name: data.user.name ?? '', phone: data.user.phone ?? '' });
      })
      .catch((err) => setError(err.message));
    apiClient.get(ENDPOINTS.myLeads).then((data) => setLeads(data.items)).catch(() => setLeads([]));
    apiClient.get(ENDPOINTS.myReviews).then((data) => setReviews(data.items)).catch(() => setReviews([]));
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileSaved(false);

    const payload = { name: profileForm.name.trim(), ...(profileForm.phone.trim() ? { phone: profileForm.phone.trim() } : {}) };
    const result = updateProfileSchema.safeParse(payload);
    if (!result.success) {
      setProfileErrors(toFieldErrors(result.error));
      return;
    }
    setProfileErrors({});

    setProfileSaving(true);
    try {
      const { user: updated } = await apiClient.put(ENDPOINTS.updateProfile, result.data);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updated }));
      setProfileSaved(true);
    } catch (err) {
      setProfileErrors({ name: err.message });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordSaved(false);
    setPasswordFormError(null);

    const result = changePasswordSchema.safeParse(passwordForm);
    if (!result.success) {
      setPasswordErrors(toFieldErrors(result.error));
      return;
    }
    setPasswordErrors({});

    setPasswordSaving(true);
    try {
      await apiClient.post(ENDPOINTS.changePassword, result.data);
      setPasswordSaved(true);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordFormError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  if (error === 'loginRequired') {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <p>
          <Link href="/login">{t('title')}</Link>
        </p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="container" style={{ maxWidth: 640, paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      <h1>{t('title')}</h1>

      <Card style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-lg)' }}>{t('profileHeading')}</h2>
        <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label={t('nameLabel')}
            required
            maxLength={100}
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            error={profileErrors.name}
          />
          <Input label={t('emailLabel')} value={user.email} disabled />
          <Input
            label={t('phoneLabel')}
            type="tel"
            inputMode="tel"
            maxLength={20}
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            error={profileErrors.phone}
          />
          <Button type="submit" disabled={profileSaving}>
            {t('saveButton')}
          </Button>
          {profileSaved && <p style={{ color: 'var(--color-success)' }}>{t('saved')}</p>}
        </form>
      </Card>

      <Card style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-lg)' }}>{t('passwordHeading')}</h2>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label={t('currentPasswordLabel')}
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            error={passwordErrors.currentPassword}
          />
          <Input
            label={t('newPasswordLabel')}
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            error={passwordErrors.newPassword}
          />
          <Button type="submit" disabled={passwordSaving}>
            {t('changePasswordButton')}
          </Button>
          {passwordSaved && <p style={{ color: 'var(--color-success)' }}>{t('passwordChanged')}</p>}
          {passwordFormError && <p style={{ color: 'var(--color-error)' }}>{passwordFormError}</p>}
        </form>
      </Card>

      <p style={{ marginBottom: 'var(--space-lg)' }}>
        <Link href="/favorites">{t('favoritesLink')}</Link>
      </p>

      <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{t('leadsHeading')}</h2>
      <div style={{ display: 'grid', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
        {leads?.length === 0 && <p style={{ color: 'var(--color-neutral-500)' }}>{t('noLeads')}</p>}
        {leads?.map((lead) => (
          <Card key={lead._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{lead.vendorId?.businessName ?? '—'}</strong>
              <Badge variant={STATUS_VARIANT[lead.status]}>{lead.status}</Badge>
            </div>
            {lead.message && <p style={{ margin: '4px 0 0', color: 'var(--color-neutral-500)' }}>{lead.message}</p>}
          </Card>
        ))}
      </div>

      <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{t('reviewsHeading')}</h2>
      <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
        {reviews?.length === 0 && <p style={{ color: 'var(--color-neutral-500)' }}>{t('noReviews')}</p>}
        {reviews?.map((review) => (
          <Card key={review._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{review.vendorId?.businessName ?? '—'}</strong>
              <Badge variant={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'error' : 'default'}>
                {t(`status${review.status.charAt(0).toUpperCase()}${review.status.slice(1)}`)}
              </Badge>
            </div>
            <p style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              {review.rating} — {review.comment}
            </p>
          </Card>
        ))}
      </div>
    </main>
  );
}
