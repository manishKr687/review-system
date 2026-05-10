#!/usr/bin/env bash
# ReviewLens production deployment script
# Usage:
#   ./deploy.sh           — build, migrate, restart
#   ./deploy.sh --ssl     — obtain/renew SSL certificate first, then deploy
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"
ENV_FILE=".env.prod"

# ── Pre-flight checks ─────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Copy backend/.env.example, fill in values, save as .env.prod"
  exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

if [[ -z "${JWT_SECRET:-}" || "$JWT_SECRET" == "REPLACE_WITH"* ]]; then
  echo "ERROR: JWT_SECRET is not set or still a placeholder in $ENV_FILE"
  exit 1
fi

if [[ -z "${ADMIN_API_KEY:-}" || "$ADMIN_API_KEY" == "REPLACE_WITH"* ]]; then
  echo "ERROR: ADMIN_API_KEY is not set or still a placeholder in $ENV_FILE"
  exit 1
fi

# ── Optional: SSL certificate via certbot ─────────────────────────────────────
if [[ "${1:-}" == "--ssl" ]]; then
  DOMAIN="${BACKEND_URL#https://}"
  DOMAIN="${DOMAIN#http://}"
  echo "==> Obtaining SSL certificate for $DOMAIN"

  # Start nginx on HTTP only (comment out the HTTPS server block first if needed)
  $COMPOSE up -d nginx

  docker run --rm \
    -v "$(pwd)/certbot_www:/var/www/certbot" \
    -v "$(pwd)/certbot_conf:/etc/letsencrypt" \
    certbot/certbot certonly \
      --webroot \
      --webroot-path=/var/www/certbot \
      --email "${SMTP_FROM:-admin@$DOMAIN}" \
      --agree-tos \
      --no-eff-email \
      -d "$DOMAIN"

  echo "==> SSL certificate obtained. Update nginx.conf with your domain name, then re-run without --ssl."
  exit 0
fi

# ── Build ─────────────────────────────────────────────────────────────────────
echo "==> Building images"
$COMPOSE build --pull

# ── Migrate ───────────────────────────────────────────────────────────────────
echo "==> Running database migrations"
$COMPOSE run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  api alembic upgrade head

# ── Deploy ────────────────────────────────────────────────────────────────────
echo "==> Starting services"
$COMPOSE up -d

# ── Verify ────────────────────────────────────────────────────────────────────
echo "==> Waiting for health check..."
sleep 5
$COMPOSE ps

echo ""
echo "==> Checking API health"
curl -sf http://localhost/api/health && echo " ✓ healthy" || echo " ✗ health check failed"

# ── Prune old images ──────────────────────────────────────────────────────────
echo "==> Pruning unused images"
docker image prune -f

echo ""
echo "==> Deploy complete!"
