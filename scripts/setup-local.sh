#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .local/postgres-data
if [ ! -f .local/postgres.env ]; then
  umask 077
  local_password="$(openssl rand -hex 24)"
  printf 'POSTGRES_USER=furniprop\nPOSTGRES_DB=furniprop\nPOSTGRES_PASSWORD=%s\n' "$local_password" > .local/postgres.env
  printf 'DATABASE_URL="postgresql://furniprop:%s@127.0.0.1:5432/furniprop?schema=public"\nDEMO_MODE="true"\n' "$local_password" > .env.local
fi
if [ ! -f .env.local ]; then
  local_password="$(sed -n 's/^POSTGRES_PASSWORD=//p' .local/postgres.env)"
  umask 077
  printf 'DATABASE_URL="postgresql://furniprop:%s@127.0.0.1:5432/furniprop?schema=public"\nDEMO_MODE="true"\n' "$local_password" > .env.local
fi
if ! docker container inspect furniprop-postgres >/dev/null 2>&1; then
  docker run --name furniprop-postgres --env-file .local/postgres.env -v "$PWD/.local/postgres-data:/var/lib/postgresql/data" -p 127.0.0.1:5432:5432 -d postgres:17-alpine >/dev/null
else
  docker start furniprop-postgres >/dev/null || true
fi
for attempt in $(seq 1 40); do
  if docker exec furniprop-postgres pg_isready -U furniprop -d furniprop >/dev/null 2>&1; then break; fi
  if [ "$attempt" -eq 40 ]; then echo 'PostgreSQL did not become ready' >&2; exit 1; fi
  sleep 1
done
set -a
. ./.env.local
set +a
npm run db:generate
npm run db:migrate
if [ "${DEMO_MODE:-false}" = true ]; then npm run db:seed; fi
echo 'FurniProp local database ready.'
