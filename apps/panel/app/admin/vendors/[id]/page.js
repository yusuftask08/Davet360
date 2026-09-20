'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@repo/constants';
import { ENDPOINTS } from '@repo/api-client';
import { updateVendorSchema, toFieldErrors } from '@repo/utils';
import { Card, Badge, Button, Input, Spinner } from '@repo/ui';
import { apiClient } from '../../../../lib/apiClient.js';
import { PanelHeader } from '../../../components/PanelHeader.jsx';
import { AdminNav } from '../../components/AdminNav.jsx';

export default function AdminVendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    apiClient
      .get(ENDPOINTS.adminVendor(id))
      .then((data) => {
        setVendor(data.vendor);
        setForm({
          businessName: data.vendor.businessName,
          category: data.vendor.category,
          description: data.vendor.description,
          city: data.vendor.city,
          phone: data.vendor.phone,
          whatsapp: data.vendor.whatsapp ?? '',
          email: data.vendor.email ?? '',
          capacity: data.vendor.capacity ?? '',
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(load, [load]);

  async function handleAction(action) {
    setActionError(null);
    try {
      await action();
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setActionError(null);

    const payload = {
      businessName: form.businessName.trim(),
      category: form.category,
      description: form.description.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      ...(form.whatsapp.trim() ? { whatsapp: form.whatsapp.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.capacity ? { capacity: Number(form.capacity) } : {}),
    };

    const result = updateVendorSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setSaving(true);
    try {
      await apiClient.put(ENDPOINTS.adminVendor(id), result.data);
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-md)' }}>
        <PanelHeader title="Vendor Detayı" />
        <p style={{ color: 'var(--color-error)' }}>{error}</p>
      </main>
    );
  }

  if (!vendor || !form) {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-md)' }}>
        <PanelHeader title="Vendor Detayı" />
        <AdminNav />
        <Spinner label="Yükleniyor..." />
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)', maxWidth: 640 }}>
      <PanelHeader title="Vendor Detayı" />
      <AdminNav />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <Badge>{vendor.status}</Badge>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {vendor.status === 'pending' && (
            <>
              <Button onClick={() => handleAction(() => apiClient.post(ENDPOINTS.adminVendorApprove(id)))}>
                Onayla
              </Button>
              <Button variant="ghost" onClick={() => handleAction(() => apiClient.post(ENDPOINTS.adminVendorReject(id)))}>
                Reddet
              </Button>
            </>
          )}
          {vendor.status === 'approved' && (
            <Button variant="ghost" onClick={() => handleAction(() => apiClient.post(ENDPOINTS.adminVendorSuspend(id)))}>
              Yayından Kaldır
            </Button>
          )}
          {(vendor.status === 'suspended' || vendor.status === 'rejected') && (
            <Button onClick={() => handleAction(() => apiClient.post(ENDPOINTS.adminVendorReactivate(id)))}>
              Yayına Al / Onayla
            </Button>
          )}
        </div>
      </div>
      {actionError && <p style={{ color: 'var(--color-error)' }}>{actionError}</p>}

      {vendor.images?.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          {vendor.images.map((src) => (
            <img
              key={src}
              src={apiClient.assetUrl(src)}
              alt=""
              style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
          ))}
        </div>
      )}

      <Card>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label="İşletme Adı"
            required
            maxLength={150}
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            error={fieldErrors.businessName}
          />

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="category">
              Kategori
            </label>
            <select
              id="category"
              className="ui-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="description">
              Açıklama
            </label>
            <textarea
              id="description"
              className="ui-input"
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {fieldErrors.description && <span className="ui-field__error">{fieldErrors.description}</span>}
          </div>

          <Input
            label="Şehir"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            error={fieldErrors.city}
          />
          <Input
            label="Telefon"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={fieldErrors.phone}
          />
          <Input
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            error={fieldErrors.whatsapp}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={fieldErrors.email}
          />
          <Input
            label="Kapasite"
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />

          <Button type="submit" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </form>
      </Card>

      <Button variant="ghost" onClick={() => router.push('/admin/vendors')} style={{ marginTop: 'var(--space-md)' }}>
        ← Listeye dön
      </Button>
    </main>
  );
}
