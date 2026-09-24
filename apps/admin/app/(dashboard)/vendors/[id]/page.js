'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CATEGORIES, AMENITIES } from '@repo/constants';
import { ENDPOINTS } from '@repo/api-client';
import { updateVendorSchema, toFieldErrors } from '@repo/utils';
import { Card, Badge, Button, Input, Spinner } from '@repo/ui';
import { apiClient } from '../../../../lib/apiClient.js';
import { AdminHeader } from '../../../components/AdminHeader.jsx';
import { AdminNav } from '../../../components/AdminNav.jsx';

export default function AdminVendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reasonDraft, setReasonDraft] = useState('');

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
          priceMin: data.vendor.priceRange?.min ?? '',
          priceMax: data.vendor.priceRange?.max ?? '',
          amenities: data.vendor.amenities ?? [],
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(load, [load]);

  function toggleAmenity(key) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }));
  }

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
      ...(form.priceMin && form.priceMax
        ? { priceRange: { min: Number(form.priceMin), max: Number(form.priceMax) } }
        : {}),
      amenities: form.amenities,
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
        <AdminHeader title="İşletme Detayı" />
        <p className="ui-error-text" role="alert">{error}</p>
      </main>
    );
  }

  if (!vendor || !form) {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-md)' }}>
        <AdminHeader title="İşletme Detayı" />
        <AdminNav />
        <Spinner label="Yükleniyor..." />
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)', maxWidth: 640 }}>
      <AdminHeader title="İşletme Detayı" />
      <AdminNav />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
        <Badge>{vendor.status}</Badge>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {vendor.status === 'pending' && (
            <>
              <Button onClick={() => handleAction(() => apiClient.post(ENDPOINTS.adminVendorApprove(id)))}>
                Onayla
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleAction(() => apiClient.post(ENDPOINTS.adminVendorReject(id), { reason: reasonDraft }))}
              >
                Reddet
              </Button>
            </>
          )}
          {vendor.status === 'approved' && (
            <Button
              variant="ghost"
              onClick={() => handleAction(() => apiClient.post(ENDPOINTS.adminVendorSuspend(id), { reason: reasonDraft }))}
            >
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

      {(vendor.status === 'pending' || vendor.status === 'approved') && (
        <div className="ui-field" style={{ marginBottom: 'var(--space-md)' }}>
          <label className="ui-field__label" htmlFor="statusReason">
            Reddetme / askıya alma notu (işletme bunu kendi panelinde görecek)
          </label>
          <textarea
            id="statusReason"
            className="ui-input"
            rows={2}
            placeholder="Örn. Görseller düşük kalitede, lütfen daha net fotoğraflar ekleyin."
            value={reasonDraft}
            onChange={(e) => setReasonDraft(e.target.value)}
          />
        </div>
      )}
      {(vendor.status === 'rejected' || vendor.status === 'suspended') && vendor.statusReason && (
        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-md)' }}>
          <strong>Belirtilen neden:</strong> {vendor.statusReason}
        </p>
      )}
      {actionError && <p className="ui-error-text" role="alert">{actionError}</p>}

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <Input
              label="Min. Fiyat"
              type="number"
              min="0"
              value={form.priceMin}
              onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
            />
            <Input
              label="Max. Fiyat"
              type="number"
              min="0"
              value={form.priceMax}
              onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
            />
          </div>
          {fieldErrors.priceRange && <span className="ui-field__error">{fieldErrors.priceRange}</span>}

          <div className="ui-field">
            <span className="ui-field__label">Özellikler</span>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity.key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(amenity.key)}
                    onChange={() => toggleAmenity(amenity.key)}
                  />
                  {amenity.label}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </form>
      </Card>

      <Button variant="ghost" onClick={() => router.push('/vendors')} style={{ marginTop: 'var(--space-md)' }}>
        ← Listeye dön
      </Button>
    </main>
  );
}
