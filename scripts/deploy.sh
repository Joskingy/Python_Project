#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
export APP_IMAGE="${1:?Pass the published image digest}"
if [[ ! "$APP_IMAGE" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]]; then
  echo 'Expected a GitHub Container Registry image pinned by SHA-256 digest.' >&2
  exit 1
fi
if [[ ! -f .env ]]; then
  echo 'Missing server .env. Complete the server setup in docs/deployment.md first.' >&2
  exit 1
fi

compose=(docker compose --env-file .env -f docker-compose.production.yml)
"${compose[@]}" config --quiet
# Pull before replacing the current app. Private images require server-side login.
"${compose[@]}" pull webapp
# Keep an existing database container and its data intact.
"${compose[@]}" up --detach --no-recreate --wait --wait-timeout 120 db
"${compose[@]}" up --detach --no-deps --no-build --wait --wait-timeout 120 webapp
"${compose[@]}" ps
printf 'Deployed %s\n' "$APP_IMAGE"
