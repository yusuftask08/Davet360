'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { loginSchema, toFieldErrors } from '@repo/utils';
import { Button, Input } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';
import { AuthShell } from '../components/AuthShell.jsx';

export default function LoginPage() {
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
      const { user } = await apiClient.post(ENDPOINTS.login, result.data);
      localStorage.setItem('user', JSON.stringify(user));
      router.push(user.role === 'admin' ? '/admin' : '/vendor');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Panel Girişi"
      footer={
        <>
          <p>
            <Link href="/forgot-password" className="link-inline">Şifremi unuttum</Link>
          </p>
          <p>
            Henüz hesabınız yok mu?{' '}
            <Link href="/register" className="link-inline">İşletme olarak kayıt olun</Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
        <Input
          label="Email"
          type="email"
          required
          maxLength={254}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={fieldErrors.email}
        />
        <Input
          label="Şifre"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={fieldErrors.password}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Button>
        {formError && <p className="auth-card__error">{formError}</p>}
      </form>
    </AuthShell>
  );
}
