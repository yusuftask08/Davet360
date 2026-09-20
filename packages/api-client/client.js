export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function createApiClient({ baseUrl, getToken } = {}) {
  async function request(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
    const token = getToken?.();
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    let res;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
        ...rest,
      });
    } catch {
      // fetch network hatası (sunucu kapalı, internet yok vs.) — kullanıcıya asla ham
      // "Failed to fetch" / TypeError mesajı gösterilmez.
      throw new ApiError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.', 0);
    }

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      throw new ApiError(data?.message ?? 'İstek başarısız oldu, lütfen tekrar deneyin.', res.status, data?.details);
    }
    return data;
  }

  // Upload dosyaları API'nin kök domaininde (/uploads/..) servis edilir, /api altında değil —
  // bu yüzden vendor.images gibi göreli path'ler her zaman bu fonksiyonla çözülür.
  function assetUrl(path) {
    if (!path) return path;
    if (/^https?:\/\//.test(path)) return path;
    const origin = baseUrl.replace(/\/api\/?$/, '');
    return `${origin}${path}`;
  }

  return {
    get: (path, opts) => request(path, { ...opts, method: 'GET' }),
    post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
    put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
    patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
    del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
    upload: (path, formData) => request(path, { method: 'POST', body: formData }),
    assetUrl,
  };
}
