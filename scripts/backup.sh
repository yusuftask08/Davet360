#!/usr/bin/env bash
# MongoDB + upload klasörünün otomatik yedeklenmesi. docker exec ile mongo container'ının
# kendi mongodump'ını kullanır — host'a ayrıca mongodb-database-tools kurmaya gerek yok,
# aynı yöntem Coolify/Hetzner'daki production container'ında da çalışır.
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
MONGO_CONTAINER="${MONGO_CONTAINER:-all-organization-mongo-1}"
UPLOAD_DIR="${UPLOAD_DIR:-./apps/api/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

echo "[backup] MongoDB yedekleniyor ($MONGO_CONTAINER)..."
docker exec "$MONGO_CONTAINER" mongodump --archive --gzip > "$BACKUP_DIR/mongo-$TIMESTAMP.archive.gz"

if [ -d "$UPLOAD_DIR" ]; then
  echo "[backup] Upload klasörü yedekleniyor..."
  tar -czf "$BACKUP_DIR/uploads-$TIMESTAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
else
  echo "[backup] Upload klasörü bulunamadı, atlanıyor: $UPLOAD_DIR"
fi

echo "[backup] Tamamlandı: $BACKUP_DIR"

# Eski yedekleri temizle
find "$BACKUP_DIR" -type f -mtime "+$RETENTION_DAYS" -delete 2>/dev/null || true
