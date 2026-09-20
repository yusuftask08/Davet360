'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@repo/constants';
import { ENDPOINTS } from '@repo/api-client';
import { createBlogPostSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card } from '@repo/ui';
import { apiClient } from '../../../../lib/apiClient.js';
import { PanelHeader } from '../../../components/PanelHeader.jsx';
import { AdminNav } from '../../components/AdminNav.jsx';

const INITIAL_FORM = { title: '', content: '', relatedCategory: '', coverImage: '' };

export default function NewBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleCoverChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await apiClient.upload(ENDPOINTS.uploadImage, formData);
      setForm((prev) => ({ ...prev, coverImage: data.path }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      publish: true,
      ...(form.relatedCategory ? { relatedCategory: form.relatedCategory } : {}),
      ...(form.coverImage ? { coverImage: form.coverImage } : {}),
    };

    const result = createBlogPostSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await apiClient.post(ENDPOINTS.adminBlogCreate, result.data);
      router.push('/admin');
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
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)', maxWidth: 640 }}>
      <PanelHeader title="Yeni Blog Yazısı" />
      <AdminNav />
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label="Başlık"
            required
            maxLength={200}
            value={form.title}
            onChange={update('title')}
            error={fieldErrors.title}
          />

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="relatedCategory">
              İlgili Kategori (opsiyonel)
            </label>
            <select id="relatedCategory" className="ui-input" value={form.relatedCategory} onChange={update('relatedCategory')}>
              <option value="">Seçilmedi</option>
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="content">
              İçerik
            </label>
            <textarea
              id="content"
              className="ui-input"
              rows={10}
              required
              minLength={50}
              value={form.content}
              onChange={update('content')}
            />
            {fieldErrors.content && <span className="ui-field__error">{fieldErrors.content}</span>}
          </div>

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="coverImage">
              Kapak Görseli (opsiyonel)
            </label>
            <input id="coverImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} disabled={uploading} />
            {uploading && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>Yükleniyor...</span>}
            {form.coverImage && (
              <img
                src={apiClient.assetUrl(form.coverImage)}
                alt=""
                style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-sm)' }}
              />
            )}
          </div>

          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? 'Yayınlanıyor...' : 'Yayınla'}
          </Button>
          {formError && <p style={{ color: 'var(--color-error)' }}>{formError}</p>}
        </form>
      </Card>
    </main>
  );
}
