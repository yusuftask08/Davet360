'use client';

import { useEffect, useState } from 'react';
import { ENDPOINTS } from '@repo/api-client';
import { updateProfileSchema, changePasswordSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { AdminHeader } from '../../components/AdminHeader.jsx';

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    apiClient.get(ENDPOINTS.me).then((data) => {
      setUser(data.user);
      setProfileForm({ name: data.user.name ?? '', phone: data.user.phone ?? '' });
    });
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileSaved(false);
    setProfileError(null);

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
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordSaved(false);
    setPasswordError(null);

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
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  if (!user) {
    return (
      <main className="container admin-main">
        <AdminHeader title="Hesap Ayarları" />
        <Spinner label="Yükleniyor..." />
      </main>
    );
  }

  return (
    <main className="container admin-main admin-main--narrow">
      <AdminHeader title="Hesap Ayarları" />

      <Card style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ marginTop: 0, fontSize: 'var(--font-size-lg)' }}>Profil Bilgileri</h1>
        <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label="Ad Soyad"
            required
            maxLength={100}
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            error={profileErrors.name}
          />
          <Input label="Email" value={user.email} disabled />
          <Input
            label="Telefon"
            type="tel"
            inputMode="tel"
            maxLength={20}
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            error={profileErrors.phone}
          />
          <Button type="submit" disabled={profileSaving}>
            Kaydet
          </Button>
          {profileSaved && <p style={{ color: 'var(--color-success)' }}>Kaydedildi.</p>}
          {profileError && <p className="ui-error-text" role="alert">{profileError}</p>}
        </form>
      </Card>

      <Card>
        <h1 style={{ marginTop: 0, fontSize: 'var(--font-size-lg)' }}>Şifre Değiştir</h1>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label="Mevcut Şifre"
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            error={passwordErrors.currentPassword}
          />
          <Input
            label="Yeni Şifre"
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            error={passwordErrors.newPassword}
          />
          <Button type="submit" disabled={passwordSaving}>
            Şifreyi Değiştir
          </Button>
          {passwordSaved && <p style={{ color: 'var(--color-success)' }}>Şifreniz güncellendi.</p>}
          {passwordError && <p className="ui-error-text" role="alert">{passwordError}</p>}
        </form>
      </Card>
    </main>
  );
}
