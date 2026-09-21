'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, AMENITIES } from '@repo/constants';
import { ENDPOINTS } from '@repo/api-client';
import { createVendorSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { PanelHeader } from '../../components/PanelHeader.jsx';

const INITIAL_FORM = {
  businessName: '',
  category: CATEGORIES[0].slug,
  description: '',
  city: '',
  phone: '',
  whatsapp: '',
  email: '',
  capacity: '',
  priceMin: '',
  priceMax: '',
  amenities: [],
};

function buildPayload(form, images) {
  return {
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
    ...(form.amenities.length > 0 ? { amenities: form.amenities } : {}),
    ...(images.length > 0 ? { images } : {}),
  };
}

export default function NewVendorListingPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

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
      setFormError('En fazla 10 görsel yükleyebilirsiniz');
      event.target.value = '';
      return;
    }

    setUploading(true);
    setFormError(null);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} 5MB sınırını aşıyor`);
        }
        const formData = new FormData();
        formData.append('image', file);
        const data = await apiClient.upload(ENDPOINTS.uploadImage, formData);
        uploaded.push(data.path);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  function removeImage(src) {
    setImages((prev) => prev.filter((item) => item !== src));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const payload = buildPayload(form, images);

    // Backend'in de kullandığı AYNI zod şeması — fiyat aralığı (min<=max), telefon formatı,
    // uzunluk sınırları hepsi burada da uygulanıyor, sunucuya gitmeden önce yakalanıyor.
    const result = createVendorSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await apiClient.post(ENDPOINTS.vendors, result.data);

      // vendorId sunucuda güncellendi — /auth/me ile taze bilgiyi çekip localStorage'ı tazeliyoruz.
      const { user } = await apiClient.get(ENDPOINTS.me);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/vendor');
    } catch (err) {
      if (err.status === 400 && err.details) {
        setFieldErrors(err.details);
      } else {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="container"
      style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)', maxWidth: 640 }}
    >
      <PanelHeader title="İlan Oluştur" />
      <Card>
        <h1 style={{ marginTop: 0 }}>İşletme Bilgileriniz</h1>
        <p style={{ color: 'var(--color-neutral-500)' }}>
          Başvurunuz admin onayından geçtikten sonra yayına girer.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label="İşletme Adı"
            required
            maxLength={150}
            value={form.businessName}
            onChange={update('businessName')}
            error={fieldErrors.businessName}
          />

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="category">
              Kategori
            </label>
            <select id="category" className="ui-input" value={form.category} onChange={update('category')}>
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
            {fieldErrors.category && <span className="ui-field__error">{fieldErrors.category}</span>}
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
              maxLength={3000}
              value={form.description}
              onChange={update('description')}
            />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>
              {form.description.length}/3000
            </span>
            {fieldErrors.description && <span className="ui-field__error">{fieldErrors.description}</span>}
          </div>

          <Input
            label="Şehir"
            required
            maxLength={100}
            value={form.city}
            onChange={update('city')}
            error={fieldErrors.city}
          />
          <Input
            label="Telefon"
            type="tel"
            inputMode="tel"
            placeholder="0532 123 45 67"
            required
            maxLength={20}
            value={form.phone}
            onChange={update('phone')}
            error={fieldErrors.phone}
          />
          <Input
            label="WhatsApp (opsiyonel)"
            type="tel"
            inputMode="tel"
            placeholder="0532 123 45 67"
            maxLength={20}
            value={form.whatsapp}
            onChange={update('whatsapp')}
            error={fieldErrors.whatsapp}
          />
          <Input
            label="Email (opsiyonel)"
            type="email"
            maxLength={254}
            value={form.email}
            onChange={update('email')}
            error={fieldErrors.email}
          />
          <Input
            label="Kapasite (opsiyonel)"
            type="number"
            min="1"
            step="1"
            value={form.capacity}
            onChange={update('capacity')}
            error={fieldErrors.capacity}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <Input
              label="Min. Fiyat (opsiyonel)"
              type="number"
              min="0"
              step="1"
              value={form.priceMin}
              onChange={update('priceMin')}
            />
            <Input
              label="Max. Fiyat (opsiyonel)"
              type="number"
              min="0"
              step="1"
              value={form.priceMax}
              onChange={update('priceMax')}
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

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="images">
              Görseller (jpg, png, webp — en fazla 5MB, en fazla 10 görsel)
            </label>
            <input
              id="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              disabled={uploading || images.length >= 10}
            />
            {uploading && (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>
                Yükleniyor...
              </span>
            )}
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
                {images.map((src) => (
                  <div key={src} style={{ position: 'relative' }}>
                    <img
                      src={apiClient.assetUrl(src)}
                      alt=""
                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(src)}
                      aria-label="Görseli kaldır"
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: '999px',
                        border: 'none',
                        background: 'var(--color-error)',
                        color: 'white',
                        cursor: 'pointer',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
          </Button>
          {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
        </form>
      </Card>
    </main>
  );
}
