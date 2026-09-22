'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@repo/constants';
import { ENDPOINTS } from '@repo/api-client';
import { updateBlogPostSchema, toFieldErrors } from '@repo/utils';
import { Button, Input, Card, Badge, Spinner } from '@repo/ui';
import { apiClient } from '../../../../../lib/apiClient.js';
import { AdminHeader } from '../../../../components/AdminHeader.jsx';
import { AdminNav } from '../../../../components/AdminNav.jsx';

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    apiClient
      .get(ENDPOINTS.adminBlogGet(id))
      .then((data) => {
        setPost(data.post);
        setForm({
          title: data.post.title,
          content: data.post.content,
          relatedCategory: data.post.relatedCategory ?? '',
          coverImage: data.post.coverImage ?? '',
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(load, [load]);

  async function handleCoverChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await apiClient.upload(ENDPOINTS.uploadImage, formData);
      setForm((prev) => ({ ...prev, coverImage: data.path }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setError(null);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      ...(form.relatedCategory ? { relatedCategory: form.relatedCategory } : {}),
      ...(form.coverImage ? { coverImage: form.coverImage } : {}),
    };

    const result = updateBlogPostSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setSaving(true);
    try {
      await apiClient.put(ENDPOINTS.adminBlogUpdate(id), result.data);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    setError(null);
    try {
      await apiClient.post(ENDPOINTS.adminBlogUnpublish(id));
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePublish() {
    setError(null);
    try {
      await apiClient.put(ENDPOINTS.adminBlogUpdate(id), { publish: true });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!post || !form) {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-md)' }}>
        <AdminHeader title="Yazıyı Düzenle" />
        <AdminNav />
        {error ? <p style={{ color: 'var(--color-error)' }}>{error}</p> : <Spinner label="Yükleniyor..." />}
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)', maxWidth: 640 }}>
      <AdminHeader title="Yazıyı Düzenle" />
      <AdminNav />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <Badge variant={post.publishedAt ? 'success' : 'default'}>{post.publishedAt ? 'Yayında' : 'Taslak'}</Badge>
        {post.publishedAt ? (
          <Button variant="ghost" onClick={handleUnpublish}>
            Yayından Kaldır
          </Button>
        ) : (
          <Button onClick={handlePublish}>Yayınla</Button>
        )}
      </div>

      <Card>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 'var(--space-sm)' }} noValidate>
          <Input
            label="Başlık"
            required
            maxLength={200}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={fieldErrors.title}
          />

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="relatedCategory">
              İlgili Kategori
            </label>
            <select
              id="relatedCategory"
              className="ui-input"
              value={form.relatedCategory}
              onChange={(e) => setForm({ ...form, relatedCategory: e.target.value })}
            >
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
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            {fieldErrors.content && <span className="ui-field__error">{fieldErrors.content}</span>}
          </div>

          <div className="ui-field">
            <label className="ui-field__label" htmlFor="coverImage">
              Kapak Görseli
            </label>
            <input id="coverImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} disabled={uploading} />
            {form.coverImage && (
              <img
                src={apiClient.assetUrl(form.coverImage)}
                alt=""
                style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-sm)' }}
              />
            )}
          </div>

          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
          {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
        </form>
      </Card>

      <Button variant="ghost" onClick={() => router.push('/blog')} style={{ marginTop: 'var(--space-md)' }}>
        ← Listeye dön
      </Button>
    </main>
  );
}
