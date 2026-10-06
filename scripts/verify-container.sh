#!/bin/sh
# Local verification only: no host ports, deployment, or external services.
set -eu
repo=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo"
if docker compose version >/dev/null 2>&1; then
  compose() { docker compose "$@"; }
else
  compose() { docker-compose "$@"; }
fi
mkdir -p artifacts
override="$repo/artifacts/compose.verify.yaml"
cat > "$override" <<'YAML'
version: "3.7"
services:
  web:
    image: hello-crt:verification
YAML
project_a="hello-verify-a-$$"
project_b="hello-verify-b-$$"
cleanup() {
  compose -f compose.yaml -f "$override" -p "$project_a" down >/dev/null 2>&1 || true
  compose -f compose.yaml -f "$override" -p "$project_b" down >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM
export PUBLIC_DISPLAY_NAME='Alexandria-Catherine von Hohenlohe'
compose -f compose.yaml config >/dev/null
docker build -t hello-crt:verification --build-arg "PUBLIC_DISPLAY_NAME=$PUBLIC_DISPLAY_NAME" .
for project in "$project_a" "$project_b"; do
  compose -f compose.yaml -f "$override" -p "$project" up -d --no-build
done
container_a=$(compose -f compose.yaml -f "$override" -p "$project_a" ps -q web)
container_b=$(compose -f compose.yaml -f "$override" -p "$project_b" ps -q web)
for container in "$container_a" "$container_b"; do
  docker update --memory 768m --memory-swap 768m --cpus 2 --pids-limit 256 "$container" >/dev/null
  docker exec "$container" wget -q -O - http://127.0.0.1:80/health
  docker exec "$container" wget -q -O - http://web:80/health
  docker exec "$container" nginx -t
done
address_a=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container_a")
address_b=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container_b")
test "$address_a" != "$address_b"
if docker exec "$container_a" wget -T 2 -q -O /dev/null "http://$address_b:80/health"; then
  echo 'FAIL: the two projects can reach each other' >&2
  exit 1
fi
echo 'PASS: separate Compose projects are isolated'
TEST_BASE_URL="http://$address_a" npm run test:e2e
node --input-type=module - "$address_a" <<'JS'
import assert from 'node:assert/strict';
const root = `http://${process.argv[2]}`;
for (const path of ['/', '/index.html']) {
  const response = await fetch(root + path);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(response.headers.get('content-security-policy').includes("script-src 'self'"));
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
}
assert.equal((await fetch(root + '/.env')).status, 404);
assert.equal((await fetch(root + '/missing.js')).status, 404);
console.log('PASS: HTTP security headers and missing-file handling');
JS
attempt=0
while [ "$(docker inspect -f '{{.State.Health.Status}}' "$container_a")" != healthy ]; do
  attempt=$((attempt + 1))
  test "$attempt" -lt 40
  sleep 1
done
docker stats --no-stream --format '{{.Name}}: {{.MemUsage}}, PIDs={{.PIDs}}' "$container_a" "$container_b"
compose -f compose.yaml -f "$override" -p "$project_a" down
compose -f compose.yaml -f "$override" -p "$project_a" up -d --no-build
recreated=$(compose -f compose.yaml -f "$override" -p "$project_a" ps -q web)
test "$recreated" != "$container_a"
docker exec "$recreated" wget -q -O - http://127.0.0.1:80/health
docker exec "$recreated" sh -c 'grep -q "Alexandria-Catherine von Hohenlohe" /usr/share/nginx/html/main-*.js'
echo 'PASS: service recreation retains the public build configuration'
echo 'PASS: production image, health, browser flows, resource limits, isolation and recreation'
