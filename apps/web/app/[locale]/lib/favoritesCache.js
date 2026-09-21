import { ENDPOINTS } from '@repo/api-client';
import { apiClient } from '../../../lib/apiClient.js';

// Bir sayfada 6-18 VendorCard birden render olabiliyor, her biri kendi favori durumunu
// bilmek istiyor. Her kart kendi başına GET /users/me/favorites atarsa aynı anda 18 tane
// aynı isteğe çıkar — bu modül tek bir paylaşılan fetch'i tüm kartlar arasında paylaştırır
// (in-flight promise cache'lenir), sonraki her mount aynı promise'i bekler, tekrar istek atmaz.
let cachedPromise = null;

export function getFavoriteIds() {
  if (!cachedPromise) {
    cachedPromise = apiClient
      .get(ENDPOINTS.favorites)
      .then((data) => new Set(data.items.map((vendor) => vendor._id)))
      .catch(() => {
        cachedPromise = null; // hata olursa bir sonraki çağrı tekrar denesin
        return new Set();
      });
  }
  return cachedPromise;
}

// Kullanıcı bir kalbe tıklayıp favori durumu değiştiğinde cache'i güncelle — aynı sayfadaki
// diğer kartlar (ör. aynı vendor iki farklı satırda görünüyorsa) sayfa yenilenmeden senkron kalır.
export async function updateFavoriteCache(vendorId, isFavorite) {
  const ids = await getFavoriteIds();
  if (isFavorite) ids.add(vendorId);
  else ids.delete(vendorId);
}

// Login/logout olduğunda cache tamamen geçersiz kılınır — bir sonraki getFavoriteIds() çağrısı
// taze veri çeker.
export function invalidateFavoritesCache() {
  cachedPromise = null;
}
