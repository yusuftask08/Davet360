'use client';

import { X } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';

const MAX_IMAGES = 10;

// İlan oluşturma ve düzenleme sayfalarının ortak görsel alanı — tarayıcının ham "Choose Files"
// input'u yerine tıklanabilir bir yükleme kutusu + kaldırma butonlu kare önizleme ızgarası.
// Yükleme/kaldırma mantığı (API çağrıları) sayfalarda kalır, burası sadece görünüm.
export function ImageUploader({ images, uploading, onChange, onRemove }) {
  const full = images.length >= MAX_IMAGES;

  return (
    <div className="ui-field">
      <span className="ui-field__label">Görseller</span>
      <div className="image-uploader">
        {images.map((src, index) => (
          <div key={src} className="image-uploader__item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={apiClient.assetUrl(src)} alt={`Görsel ${index + 1}`} />
            {index === 0 && <span className="image-uploader__cover">Kapak</span>}
            <button
              type="button"
              className="image-uploader__remove"
              onClick={() => onRemove(src)}
              aria-label={`Görsel ${index + 1}'i kaldır`}
            >
              <X size={14} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        ))}
        {!full && (
          <label className={`image-uploader__add${uploading ? ' is-busy' : ''}`}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onChange}
              disabled={uploading}
              className="sr-only"
            />
            <span className="image-uploader__plus" aria-hidden="true">+</span>
            <span>{uploading ? 'Yükleniyor...' : 'Görsel ekle'}</span>
          </label>
        )}
      </div>
      <p className="image-uploader__hint">
        JPG, PNG veya WEBP · en fazla 5MB · {images.length}/{MAX_IMAGES} görsel. İlk görsel kapak olarak kullanılır.
      </p>
    </div>
  );
}
