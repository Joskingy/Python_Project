#!/usr/bin/env bash
# Exercise deployment ordering with a fake Docker CLI; never start containers.
set -euo pipefail
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"
cleanup() {
  rm -f -- "$fixture/scripts/deploy.sh" "$fixture/bin/docker" "$fixture/.env" "$fixture/commands" "$fixture/output"
  rmdir -- "$fixture/scripts" "$fixture/bin" "$fixture"
}
trap cleanup EXIT
mkdir "$fixture/scripts" "$fixture/bin"
cp "$root/scripts/deploy.sh" "$fixture/scripts/deploy.sh"
touch "$fixture/.env"
export DEPLOY_TEST_LOG="$fixture/commands"
export PATH="$fixture/bin:$PATH"
cat > "$fixture/bin/docker" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$DEPLOY_TEST_LOG"
case "${DEPLOY_TEST_FAILURE:-}:$*" in
  pull:*'pull webapp'|db:*'120 db'|app:*'120 webapp') exit 1 ;;
esac
MOCK
chmod +x "$fixture/bin/docker"
image="ghcr.io/example/people@sha256:$(printf 'a%.0s' {1..64})"

bash "$fixture/scripts/deploy.sh" "$image" > "$fixture/output" 2>&1
[[ $(wc -l < "$DEPLOY_TEST_LOG") -eq 5 ]]
[[ $(sed -n '2p' "$DEPLOY_TEST_LOG") == *'pull webapp' ]]
[[ $(sed -n '3p' "$DEPLOY_TEST_LOG") == *'up --detach --no-recreate --wait --wait-timeout 120 db' ]]
[[ $(sed -n '4p' "$DEPLOY_TEST_LOG") == *'up --detach --no-deps --no-build --wait --wait-timeout 120 webapp' ]]
if grep -Eq '(^| )(down|rm|prune)( |$)' "$DEPLOY_TEST_LOG"; then exit 1; fi

for scenario in pull db app; do
  : > "$DEPLOY_TEST_LOG"
  if DEPLOY_TEST_FAILURE="$scenario" bash "$fixture/scripts/deploy.sh" "$image" > "$fixture/output" 2>&1; then
    echo "FAIL: $scenario failure was ignored" >&2
    exit 1
  fi
  case "$scenario" in
    pull) [[ $(wc -l < "$DEPLOY_TEST_LOG") -eq 2 ]] ;;
    db) [[ $(wc -l < "$DEPLOY_TEST_LOG") -eq 3 ]] ;;
    app) [[ $(wc -l < "$DEPLOY_TEST_LOG") -eq 4 ]] ;;
  esac
done

: > "$DEPLOY_TEST_LOG"
if bash "$fixture/scripts/deploy.sh" 'ghcr.io/example/people:latest' > "$fixture/output" 2>&1; then exit 1; fi
[[ ! -s "$DEPLOY_TEST_LOG" ]]
rm -- "$fixture/.env"
if bash "$fixture/scripts/deploy.sh" "$image" > "$fixture/output" 2>&1; then exit 1; fi
[[ ! -s "$DEPLOY_TEST_LOG" ]]
echo 'PASS: deployment order, data preservation flags, pull/database/app failure handling, digest validation, and missing env rejection'
