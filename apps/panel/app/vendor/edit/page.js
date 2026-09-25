'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, AMENITIES } from '@repo/constants';
import { ENDPOINTS } from '@repo/api-client';
import { updateVendorSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { PanelHeader } from '../../components/PanelHeader.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';

export default function EditOwnVendorPage() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(null);
  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback((id) => {
    apiClient
      .get(ENDPOINTS.vendorOwn(id))
      .then((data) => {
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
        setImages(data.vendor.images ?? []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (!user?.vendorId) {
      router.push('/vendor/new');
      return;
    }
    setVendorId(user.vendorId);
    load(user.vendorId);
  }, [load, router]);

  function toggleAmenity(key) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }));
  }

  async function handleImageChange(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    if (images.length + files.length > 10) {
      setError('En fazla 10 görsel yükleyebilirsiniz');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const data = await apiClient.upload(ENDPOINTS.uploadImage, formData);
        uploaded.push(data.path);
      }
      const nextImages = [...images, ...uploaded];
      setImages(nextImages);
      await apiClient.put(ENDPOINTS.vendorUpdate(vendorId), { images: nextImages });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function removeImage(src) {
    const nextImages = images.filter((item) => item !== src);
    setImages(nextImages);
    try {
      await apiClient.put(ENDPOINTS.vendorUpdate(vendorId), { images: nextImages });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSaved(false);

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
      await apiClient.put(ENDPOINTS.vendorUpdate(vendorId), result.data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <main className="container panel-main">
        <PanelHeader title="İlanımı Düzenle" />
        {error ? <p className="ui-error-text" role="alert">{error}</p> : <Spinner label="Yükleniyor..." />}
      </main>
    );
  }

  return (
    <main className="container panel-main panel-main--narrow">
      <PanelHeader title="İlanımı Düzenle" subtitle="Değişiklikler admin onayı beklemeden hemen yayına yansır." />
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
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
              minLength={20}
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
            label="WhatsApp (opsiyonel)"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            error={fieldErrors.whatsapp}
          />
          <Input
            label="Email (opsiyonel)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={fieldErrors.email}
          />
          <Input
            label="Kapasite (opsiyonel)"
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <Input
              label="Min. Fiyat (opsiyonel)"
              type="number"
              min="0"
              value={form.priceMin}
              onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
            />
            <Input
              label="Max. Fiyat (opsiyonel)"
              type="number"
              min="0"
              value={form.priceMax}
              onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
            />
          </div>
          {fieldErrors.priceRange && <span className="ui-field__error">{fieldErrors.priceRange}</span>}

          <div className="ui-field">
            <span className="ui-field__label">Özellikler (opsiyonel)</span>
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

          <ImageUploader images={images} uploading={uploading} onChange={handleImageChange} onRemove={removeImage} />

          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
          {saved && <p style={{ color: 'var(--color-success)' }}>Kaydedildi.</p>}
          {error && <p className="ui-error-text" role="alert">{error}</p>}
        </form>
      </Card>
    </main>
  );
}
