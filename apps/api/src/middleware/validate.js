import { toFieldErrors } from '@repo/utils';
import { ApiError } from './errorHandler.js';

// Tüm endpoint'ler bu middleware ile şema doğrulamasından geçer — validasyonsuz veri kabul edilmez.
// Frontend formları da aynı zod şemasını + toFieldErrors'ı kullanır, bu yüzden hata şekli (alan adı
// -> tek mesaj) client/server arasında birebir aynıdır.
export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ApiError(400, 'Geçersiz veri', toFieldErrors(result.error)));
    }
    req.body = result.data;
    next();
  };
}
