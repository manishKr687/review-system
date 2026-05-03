#!/usr/bin/env bash
# Usage: ./scripts/backup.sh
# Creates a timestamped SQL dump of the reviewlens database.
# Backups are written to ./backups/ — add that folder to .gitignore.

set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/reviewlens_${TIMESTAMP}.sql"

echo "Dumping database to $FILE ..."
docker compose exec -T db pg_dump -U reviewlens reviewlens > "$FILE"
echo "Done. Size: $(du -sh "$FILE" | cut -f1)"

# Keep only the 10 most recent backups
ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | tail -n +11 | xargs -r rm --
echo "Old backups pruned (keeping 10 most recent)."
