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

for p in / /about /work /ventures /services /creative /journal /gallery /timeline /now /contact /admin /sitemap.xml /robots.txt \
  /services/website-design-development /services/ai-agent-development /services/seo-optimisation /services/graphic-design \
  /services/branding /services/video-editing /services/mentorship \
  /collaborate/music /collaborate/spoken-word /collaborate/poetry /collaborate/speaking; do
  check "$p" 200
done
check /definitely-not-a-page 404

echo "-- contact api (per-form schema)"
valid='{"kind":"general","name":"QA","email":"qa@example.com","answers":{"topic":"Something else","message":"This is an automated smoke test message."},"website":""}'
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -d "$valid")
[ "$code" = "200" ] && echo "ok   valid post 200" || { echo "FAIL valid post ($code)"; fail=1; }

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -d '{"kind":"general","name":"QA","email":"qa@example.com","answers":{},"website":""}')
[ "$code" = "400" ] && echo "ok   missing required fields 400" || { echo "FAIL missing-fields post ($code)"; fail=1; }

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -d '{"kind":"nope","name":"QA","email":"qa@example.com","answers":{},"website":""}')
[ "$code" = "400" ] && echo "ok   unknown kind 400" || { echo "FAIL unknown kind ($code)"; fail=1; }

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -d '{"kind":"general","name":"QA","email":"qa@example.com","answers":{"topic":"Something else","message":"honeypot filled"},"website":"http://spam.example"}')
[ "$code" = "200" ] && echo "ok   honeypot silent 200" || { echo "FAIL honeypot ($code)"; fail=1; }

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/inbox")
[ "$code" = "401" ] && echo "ok   inbox requires auth 401" || { echo "FAIL inbox auth ($code)"; fail=1; }

echo "-- subscription + email surfaces"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/subscribe" -H 'Content-Type: application/json' -d '{"name":"","email":"x"}')
[ "$code" = "400" ] && echo "ok   subscribe validation 400" || { echo "FAIL subscribe validation ($code)"; fail=1; }
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/subscribe" -H 'Content-Type: application/json' -d '{"name":"QA Reader","email":"qa-reader@example.com"}')
if [ "$code" = "200" ] || [ "$code" = "503" ]; then echo "ok   subscribe responds ($code: 200 live, 503 only when the database is unreachable)"; else { echo "FAIL subscribe ($code)"; fail=1; }; fi
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/unsubscribe?token=not-a-real-token")
[ "$code" = "200" ] && echo "ok   unsubscribe page renders" || { echo "FAIL unsubscribe page ($code)"; fail=1; }
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/admin/broadcast" -H 'Content-Type: application/json' -d '{"subject":"x","body":"y"}')
[ "$code" = "401" ] && echo "ok   broadcast requires auth 401" || { echo "FAIL broadcast auth ($code)"; fail=1; }
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/templates")
[ "$code" = "401" ] && echo "ok   templates require auth 401" || { echo "FAIL templates auth ($code)"; fail=1; }

echo "-- content api"
html=$(curl -s "$BASE/api/content")
echo "$html" | grep -q '"version":1' && echo "ok   /api/content serves site data" || { echo "FAIL /api/content"; fail=1; }
echo "$html" | grep -q 'ADD: poem' && { echo "FAIL drafts leak to anonymous /api/content"; fail=1; } || echo "ok   drafts hidden from anonymous content api"

echo "-- headers"
curl -sI "$BASE/" | grep -qi 'content-security-policy' && echo "ok   CSP present" || { echo "FAIL CSP missing"; fail=1; }
curl -sI "$BASE/" | grep -qi 'x-content-type-options: nosniff' && echo "ok   nosniff present" || { echo "FAIL nosniff missing"; fail=1; }

echo "-- hero copy"
html=$(curl -s "$BASE/")
for needle in "You&#x27;re the one I&#x27;ve been expecting." "Welcome to my space." "Timfire"; do
  echo "$html" | grep -q "$needle" && echo "ok   hero contains ${needle:0:32}" || { echo "FAIL hero missing $needle"; fail=1; }
done
echo "$html" | grep -qi "little flame" && { echo "FAIL forbidden phrase present"; fail=1; } || echo "ok   forbidden phrase absent"

echo "-- admin sign-in (password, then an emailed code)"
# One request, two checks, from a documentation-range IP so repeated QA runs
# never spend the real owner's attempt budget or lock their address out.
QA_IP="203.0.113.7"
hdr=$(curl -s -D - -o /dev/null -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -H "X-Forwarded-For: $QA_IP" -d '{"email":"nobody@example.com","password":"not-the-password"}')
code=$(printf '%s\n' "$hdr" | head -1 | awk '{print $2}')
[ "$code" = "401" ] && echo "ok   wrong password 401" || { echo "FAIL wrong password ($code)"; fail=1; }
# A password alone must never hand back a session: the emailed code is the proof.
printf '%s\n' "$hdr" | grep -qi 'set-cookie: timfire_admin' && { echo "FAIL login issued a session cookie without a code"; fail=1; } || echo "ok   no session cookie without the code"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -H "X-Forwarded-For: $QA_IP" -d '{"email":"nobody@example.com","password":"still-not-it"}')
[ "$code" = "401" ] && echo "ok   a second wrong password stays 401 (not locked)" || { echo "FAIL second wrong password ($code)"; fail=1; }
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/verify" -H 'Content-Type: application/json' -d '{"email":"nobody@example.com","code":"000000"}')
[ "$code" = "401" ] && echo "ok   verify with no live code 401" || { echo "FAIL verify ($code)"; fail=1; }
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/verify" -H 'Content-Type: application/json' -d '{"email":"not-an-email","code":"12"}')
[ "$code" = "400" ] && echo "ok   verify validates its shape 400" || { echo "FAIL verify shape ($code)"; fail=1; }
curl -s "$BASE/api/auth/session" | grep -q '"authenticated":false' && echo "ok   anonymous session reports signed out" || { echo "FAIL anonymous session"; fail=1; }

echo "-- contact page keeps the purpose-built forms its own secret"
html=$(curl -s "$BASE/contact")
echo "$html" | grep -q 'contact-form' && echo "ok   the general form is on the page" || { echo "FAIL contact form missing"; fail=1; }
echo "$html" | grep -q 'Tell me what' && echo "ok   contact gives a reason to write" || { echo "FAIL contact lead missing"; fail=1; }
for needle in "Open the form" "/services/website-design-development#form" "/collaborate/music#form" "dir-card"; do
  echo "$html" | grep -q "$needle" && { echo "FAIL contact page advertises $needle"; fail=1; } || echo "ok   contact hides $needle"
done
# The deep links themselves must still work, reached from the pages that own them.
for p in "/services/website-design-development" "/collaborate/music"; do
  curl -s "$BASE$p" | grep -q 'id="form"' && echo "ok   $p still hosts its own form" || { echo "FAIL $p lost its #form anchor"; fail=1; }
done

echo "-- mobile pass"
csshref=$(curl -s "$BASE/" | grep -o '/_next/static/css/[^"]*\.css' | head -1)
if [ -n "$csshref" ]; then
  css=$(curl -s "$BASE$csshref")
  echo "$css" | grep -q 'touch-action:manipulation' && echo "ok   double-tap zoom disabled" || { echo "FAIL touch-action:manipulation missing"; fail=1; }
  echo "$css" | grep -q 'text-size-adjust:100%' && echo "ok   iOS text inflation disabled" || { echo "FAIL text-size-adjust missing"; fail=1; }
  echo "$css" | grep -q 'overflow-x:clip' && echo "ok   sideways overflow clipped at the root" || { echo "FAIL overflow-x guard missing"; fail=1; }
else
  echo "FAIL could not locate the stylesheet"; fail=1
fi
html=$(curl -s "$BASE/")
echo "$html" | grep -q 'hero-lead-short' && echo "ok   mobile hero keeps one short line" || { echo "FAIL mobile hero lead missing"; fail=1; }

exit $fail
