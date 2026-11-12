#!/usr/bin/env bash
# Route + behaviour smoke test. Run against a built server:
#   npm run build && npm run start &
#   ./qa/smoke.sh [base-url]
set -u
BASE="${1:-http://127.0.0.1:3000}"
fail=0

check() { # path expected
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$1")
  if [ "$code" != "$2" ]; then echo "FAIL $1 (expected $2, got $code)"; fail=1; else echo "ok   $1 $code"; fi
}

for p in / /about /work /ventures /services /creative /journal /timeline /now /contact /admin /sitemap.xml /robots.txt; do
  check "$p" 200
done
check /definitely-not-a-page 404

echo "-- contact api"
valid='{"name":"QA","email":"qa@example.com","topic":"Website design & development","message":"This is an automated smoke test message."}'
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -d "$valid")
[ "$code" = "200" ] && echo "ok   valid post 200" || { echo "FAIL valid post ($code)"; fail=1; }

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -d '{"name":"","email":"x","topic":"","message":"hi"}')
[ "$code" = "400" ] && echo "ok   invalid post 400" || { echo "FAIL invalid post ($code)"; fail=1; }

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/inbox")
[ "$code" = "401" ] && echo "ok   inbox requires auth 401" || { echo "FAIL inbox auth ($code)"; fail=1; }

echo "-- headers"
curl -sI "$BASE/" | grep -qi 'content-security-policy' && echo "ok   CSP present" || { echo "FAIL CSP missing"; fail=1; }
curl -sI "$BASE/" | grep -qi 'x-content-type-options: nosniff' && echo "ok   nosniff present" || { echo "FAIL nosniff missing"; fail=1; }

echo "-- hero copy"
html=$(curl -s "$BASE/")
for needle in "You&#x27;re the one I&#x27;ve been expecting." "Welcome to my space." "Timfire"; do
  echo "$html" | grep -q "$needle" && echo "ok   hero contains ${needle:0:32}" || { echo "FAIL hero missing $needle"; fail=1; }
done
echo "$html" | grep -qi "little flame" && { echo "FAIL forbidden phrase present"; fail=1; } || echo "ok   forbidden phrase absent"

exit $fail
