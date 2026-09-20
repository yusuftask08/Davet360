export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Kaynak bulunamadı' });
}

// Merkezi hata yönetimi: her endpoint kendi try/catch formatını icat etmez,
// beklenmeyen hatanın stack trace'i asla client'a sızmaz.
export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  const message = status === 500 ? 'Sunucu hatası oluştu' : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ message, details: err.details });
}
