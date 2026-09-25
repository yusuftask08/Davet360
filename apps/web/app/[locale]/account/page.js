'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { updateProfileSchema, changePasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, Badge, Star, Heart, ChevronRight } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { invalidateFavoritesCache } from '../lib/favoritesCache.js';

const STATUS_VARIANT = { new: 'default', contacted: 'accent', booked: 'success', declined: 'error', closed: 'default' };
const LEAD_STATUS_KEY = {
  new: 'leadStatusNew',
  contacted: 'leadStatusContacted',
  booked: 'leadStatusBooked',
  declined: 'leadStatusDeclined',
  closed: 'leadStatusClosed',
};

export default function AccountPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const dateFormatter = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'long' });

  // Mobilde çıkış yapmanın tek yolu burası — alt gezinme barında yok, masaüstündeki avatar
  // menüsü (AuthNav) mobilde gizli.
  function handleLogout() {
    apiClient.post(ENDPOINTS.logout).catch(() => {});
    localStorage.removeItem('user');
    invalidateFavoritesCache();
    router.push('/');
  }
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
    <main className="container page-main account-page">
      <header className="account-head">
        <span className="account-head__avatar" aria-hidden="true">
          {user.name?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
        <div className="account-head__info">
          <h1 className="account-head__name">{user.name}</h1>
          <p className="account-head__email">{user.email}</p>
        </div>
        <button type="button" className="account-head__logout" onClick={handleLogout}>
          {t('logout')}
        </button>
      </header>

      <Link href="/favorites" className="account-link-card">
        <span className="account-link-card__icon">
          <Heart size={20} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="account-link-card__text">
          <strong>{t('favoritesCard')}</strong>
          <span>{t('favoritesCardText')}</span>
        </span>
        <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
      </Link>

      <section className="account-section">
        <h2 className="account-section__heading">{t('leadsHeading')}</h2>
        <div className="account-list">
          {leads?.length === 0 && <p className="empty-state">{t('noLeads')}</p>}
          {leads?.map((lead) => (
            <Link key={lead._id} href={`/account/leads/${lead._id}`} className="account-item account-item--link">
              <div className="account-item__head">
                <strong>{lead.vendorId?.businessName ?? '—'}</strong>
                <Badge variant={STATUS_VARIANT[lead.status]}>
                  {LEAD_STATUS_KEY[lead.status] ? t(LEAD_STATUS_KEY[lead.status]) : lead.status}
                </Badge>
              </div>
              <p className="account-item__meta">
                {dateFormatter.format(new Date(lead.createdAt))}
                {lead.eventDate && ` · ${t('eventDate')}: ${dateFormatter.format(new Date(lead.eventDate))}`}
              </p>
              <p className="account-item__text">{lead.lastMessagePreview ?? lead.message}</p>
              <span className="account-item__cta">
                {lead.customerUnread > 0 ? (
                  <span className="unread-pill">{t('unreadCount', { count: lead.customerUnread })}</span>
                ) : (
                  t('openThread')
                )}
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="account-section">
        <h2 className="account-section__heading">{t('reviewsHeading')}</h2>
        <div className="account-list">
          {reviews?.length === 0 && <p className="empty-state">{t('noReviews')}</p>}
          {reviews?.map((review) => (
            <Card key={review._id} className="account-item">
              <div className="account-item__head">
                <strong>{review.vendorId?.businessName ?? '—'}</strong>
                <Badge variant={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'error' : 'default'}>
                  {t(`status${review.status.charAt(0).toUpperCase()}${review.status.slice(1)}`)}
                </Badge>
              </div>
              <p className="account-item__text account-item__rating">
                <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                {review.rating} — {review.comment}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="account-section">
        <h2 className="account-section__heading">{t('settingsHeading')}</h2>
        <Card style={{ marginBottom: 'var(--space-md)' }}>
          <h3 className="account-card-title">{t('profileHeading')}</h3>
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

        <Card>
          <h3 className="account-card-title">{t('passwordHeading')}</h3>
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
          {passwordFormError && <p className="ui-error-text" role="alert">{passwordFormError}</p>}
        </form>
        </Card>
      </section>
    </main>
  );
}
