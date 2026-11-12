#!/usr/bin/env bash
# Route, form and header smoke test.
#
#   npm run build && npm run start &
#   ./qa/smoke.sh [base-url]
#
# Ends with a non-zero status if anything fails. Safe to run against a preview
# deployment. It never needs the real admin password: the authenticated checks
# only assert that the endpoints refuse an anonymous caller.
set -u
BASE="${1:-http://127.0.0.1:3000}"
fail=0

check() { # path expected-code
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$1")
  if [ "$code" != "$2" ]; then
    echo "FAIL $1 (expected $2, got $code)"
    fail=1
  else
    echo "ok   $1 $code"
  fi
}

echo "-- public routes"
for p in / /about /work /ventures /services /creative /journal /timeline /now /contact \
         /services/website /services/ai /services/seo /services/graphic /services/branding \
         /services/mentorship /work/afristem-global /journal; do
  check "$p" 200
done

echo "-- machine routes"
check /admin 200
check /sitemap.xml 200
check /robots.txt 200
check /feed.xml 200
check /definitely-not-a-page 404

echo "-- auth is required"
for p in /api/cms/content /api/cms/enquiries /api/cms/status; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")
  if [ "$code" = "401" ]; then echo "ok   $p refuses anonymous 401"; else echo "FAIL $p ($code)"; fail=1; fi
done

echo "-- login rejects a wrong password"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"nobody@example.com","password":"definitely-not-the-password"}')
if [ "$code" = "401" ]; then echo "ok   wrong password 401"; else echo "FAIL wrong password ($code)"; fail=1; fi

echo "-- enquiry validation"
# Missing the message entirely.
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/enquiry" \
  -H 'Content-Type: application/json' -d '{"service":"website","name":"QA","email":"qa@example.com"}')
if [ "$code" = "400" ]; then echo "ok   incomplete enquiry 400"; else echo "FAIL incomplete enquiry ($code)"; fail=1; fi

# Malformed email and a message that is too short.
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/enquiry" \
  -H 'Content-Type: application/json' \
  -d '{"service":"website","name":"QA","email":"not-an-email","message":"too short"}')
if [ "$code" = "400" ]; then echo "ok   invalid email 400"; else echo "FAIL invalid email ($code)"; fail=1; fi

# Honeypot: accepted silently, never stored.
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/enquiry" \
  -H 'Content-Type: application/json' \
  -d '{"service":"website","name":"Bot","email":"bot@example.com","message":"This message was filled by a robot and should never be stored.","website":"http://spam.example"}')
if [ "$code" = "200" ]; then echo "ok   honeypot swallowed 200"; else echo "FAIL honeypot ($code)"; fail=1; fi

echo "-- headers"
head="$(curl -sI "$BASE/")"
echo "$head" | grep -qi 'content-security-policy' && echo "ok   CSP present" || { echo "FAIL CSP missing"; fail=1; }
echo "$head" | grep -qi 'x-content-type-options: nosniff' && echo "ok   nosniff present" || { echo "FAIL nosniff missing"; fail=1; }
echo "$head" | grep -qi 'referrer-policy' && echo "ok   referrer policy present" || { echo "FAIL referrer policy missing"; fail=1; }

echo "-- admin is not indexable"
curl -s "$BASE/robots.txt" | grep -q 'Disallow: /admin' && echo "ok   robots disallows /admin" || { echo "FAIL robots does not disallow /admin"; fail=1; }
curl -s "$BASE/admin" | grep -qi 'noindex' && echo "ok   admin carries noindex" || { echo "FAIL admin missing noindex"; fail=1; }

echo "-- hero renders without JavaScript"
html=$(curl -s "$BASE/")
for needle in "You&#x27;re the one I&#x27;ve been expecting." "Welcome to my space." "Timfire"; do
  if echo "$html" | grep -q "$needle"; then
    echo "ok   hero contains ${needle:0:34}"
  else
    echo "FAIL hero missing $needle"
    fail=1
  fi
done
if echo "$html" | grep -qi "little flame"; then echo "FAIL forbidden phrase present"; fail=1; else echo "ok   forbidden phrase absent"; fi

echo "-- visible copy has no placeholders"
for p in / /about /services /work /journal /contact; do
  if curl -s "$BASE$p" | grep -q '\[ADD:'; then echo "FAIL $p renders an [ADD: …] placeholder"; fail=1; else echo "ok   $p has no visible placeholders"; fi
done

echo "-- sitemap and feed use the canonical origin"
curl -s "$BASE/sitemap.xml" | grep -q '<loc>https://kutimfire.com' && echo "ok   sitemap absolute URLs" || { echo "FAIL sitemap URLs"; fail=1; }
curl -s "$BASE/feed.xml" | grep -q '<rss version="2.0"' && echo "ok   feed is RSS 2.0" || { echo "FAIL feed"; fail=1; }

echo
if [ "$fail" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; fi
exit $fail
