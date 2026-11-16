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

for p in / /about /work /ventures /services /creative /me /gallery /timeline /now /contact /admin /sitemap.xml /robots.txt \
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
# Policy lists only what the site actually frames: a clip on somebody else's
# player is a link, not an iframe, so nothing third-party needs framing here.
csp=$(curl -sI "$BASE/" | grep -i '^content-security-policy')
printf '%s' "$csp" | grep -q 'frame-src https://www.youtube-nocookie.com https://player.vimeo.com' && echo "ok   frame-src names the two players the site can host" || { echo "FAIL frame-src lost the players it uses"; fail=1; }
printf '%s' "$csp" | grep -qi 'tiktok' && { echo "FAIL frame-src still allows TikTok, which nothing frames"; fail=1; } || echo "ok   and allows no player the site cannot promise"

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

echo "-- one public inbox, and the list at the foot of every page"
for p in / /about /work /services /creative /me /gallery /contact /now; do
  html=$(curl -s "$BASE$p")
  echo "$html" | grep -q 'hi@kutimfire.com' && { echo "FAIL $p still advertises the dead hi@ mailbox"; fail=1; } || echo "ok   $p does not mention hi@"
  echo "$html" | grep -q 'hello@kutimfire.com' && echo "ok   $p offers hello@kutimfire.com" || { echo "FAIL $p has no public inbox"; fail=1; }
  echo "$html" | grep -q 'sub-band' && echo "ok   $p carries the subscription band" || { echo "FAIL $p has no subscription band"; fail=1; }
  # A badge must never sit at the top: the band lives between the header and the footer.
  top=$(printf '%s' "$html" | grep -ob -m1 '<header' | head -1 | cut -d: -f1)
  band=$(printf '%s' "$html" | grep -ob -m1 'sub-band' | head -1 | cut -d: -f1)
  foot=$(printf '%s' "$html" | grep -ob -m1 '<footer' | head -1 | cut -d: -f1)
  if [ -n "$top" ] && [ -n "$band" ] && [ -n "$foot" ] && [ "$band" -gt "$top" ] && [ "$band" -lt "$foot" ]; then
    echo "ok   $p band sits before the footer, never at the top"
  else
    echo "FAIL $p subscription band is not between header and footer"; fail=1
  fi
  echo "$html" | grep -q 'sub-bar' && { echo "FAIL $p still renders the old top strip"; fail=1; } || echo "ok   $p has no top strip"
done
# The two pages where an invitation makes no sense.
for p in /admin /unsubscribe; do
  curl -s "$BASE$p" | grep -q 'sub-band' && { echo "FAIL $p invites the reader to subscribe"; fail=1; } || echo "ok   $p carries no subscription band"
done

echo "-- footer says what it should, and nothing twice"
html=$(curl -s "$BASE/")
echo "$html" | grep -qi 'think it' && { echo "FAIL the KR8 tagline is back on the site"; fail=1; } || echo "ok   no KR8 tagline on the site"
echo "$html" | grep -q 'All rights reserved' && echo "ok   copyright line present" || { echo "FAIL copyright line missing"; fail=1; }
echo "$html" | grep -q 'Built and owned by' && echo "ok   ownership line present" || { echo "FAIL ownership line missing"; fail=1; }

echo "-- no role badges parked in front of the calls to action"
for p in / /about; do
  curl -s "$BASE$p" | grep -q 'role-list' && { echo "FAIL $p still shows role badges"; fail=1; } || echo "ok   $p has no role badge row"
done

echo "-- sounds and music, one phrase everywhere"
html=$(curl -s "$BASE/creative")
echo "$html" | grep -q 'Music &amp; piano' && { echo "FAIL creative page still says Music & piano"; fail=1; } || echo "ok   creative page dropped Music & piano"
echo "$html" | grep -q 'Sounds and music' && echo "ok   creative page says sounds and music" || { echo "FAIL creative page missing sounds and music"; fail=1; }

echo "-- services and Me heroes carry a photograph and one description"
for p in /services /me; do
  html=$(curl -s "$BASE$p")
  echo "$html" | grep -q 'hero-split' && echo "ok   $p hero is a split with a photo" || { echo "FAIL $p hero has no photo"; fail=1; }
done
curl -s "$BASE/services" | grep -q 'The final scope and cost depend on your requirements' && { echo "FAIL services still carries the vague first description"; fail=1; } || echo "ok   services vague description gone"

echo "-- the journal address follows the rename, old links included"
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/journal")
[ "$code" = "308" ] && echo "ok   /journal redirects permanently" || { echo "FAIL /journal answered $code, expected 308"; fail=1; }
loc=$(curl -s -D - -o /dev/null "$BASE/journal/hes-got-a-queen" | grep -i '^location:' | tr -d '\r')
echo "$loc" | grep -q '/me/hes-got-a-queen' && echo "ok   an old story link follows to /me" || { echo "FAIL old story link went to: $loc"; fail=1; }
code=$(curl -s -o /dev/null -w '%{http_code}' -L "$BASE/journal/hes-got-a-queen")
[ "$code" = "200" ] && echo "ok   and lands on a live page" || { echo "FAIL following the old link gave $code"; fail=1; }

echo "-- the page is called Me, and it is aimed at the reader"
html=$(curl -s "$BASE/me")
echo "$html" | grep -q 'is for you' && echo "ok   the Me page says who it is for" || { echo "FAIL the Me page hero lost its point"; fail=1; }
echo "$html" | grep -qi 'The journal' && { echo "FAIL the Me page still calls itself the journal"; fail=1; } || echo "ok   the Me page no longer calls itself the journal"
# One description, not two: the hero carries it and nothing repeats it underneath.
# Scoped to the hero, because `page-lead` is also the class the weekly-feature
# blocks use for their own copy — counting the whole page blamed the wrong text.
hero=$(printf '%s' "$html" | tr -d '\n' | sed 's/.*<section class="shell page-hero/page-hero/; s/<\/section>.*//')
leads=$(printf '%s' "$hero" | grep -o 'page-lead' | wc -l | tr -d ' ')
[ "$leads" = "1" ] && echo "ok   the Me hero describes the page once" || { echo "FAIL the Me hero carries $leads descriptions, expected 1"; fail=1; }
echo "$html" | grep -q 'Read one, like it, and tell me under the page what it did to you' && echo "ok   and that description says what a reader can do here" || { echo "FAIL the Me page description is vague again"; fail=1; }
echo "$html" | grep -q 'One week in seven this page belongs to a reader' && echo "ok   and it says what the weekly feature is" || { echo "FAIL the Me page description lost the weekly feature"; fail=1; }
curl -s "$BASE/me" | grep -q '<title>Me | TIMFIRE</title>' && echo "ok   the tab is titled Me" || { echo "FAIL the Me page title is wrong"; fail=1; }

echo "-- likes and comments, under every piece"
# A fresh reader every run: the token is what makes a like one like, and the
# address is what the rate limit counts, so a second run of this suite must not
# inherit the first run's likes or spend its allowance.
key=journal:they-get-disappointed
tok="qasmoke${RANDOM}${RANDOM}"
other="qasmoke${RANDOM}${RANDOM}"
IP="203.0.113.$((RANDOM % 200 + 20))"   # TEST-NET-3: reserved for documentation
as_reader=(-H "x-forwarded-for: $IP")
likes_of() { curl -s "${as_reader[@]}" "$BASE/api/engagement?posts=$key" | sed 's/.*"likes":\([0-9]*\).*/\1/'; }
like() { curl -s "${as_reader[@]}" -X POST "$BASE/api/likes" -H 'Content-Type: application/json' -d "{\"post\":\"$key\",\"token\":\"$1\",\"liked\":$2}"; }

base=$(likes_of)
like "$tok" true > /dev/null
after=$(likes_of)
[ "$after" = "$((base + 1))" ] && echo "ok   a like raises the count by one" || { echo "FAIL a like took the count from $base to $after"; fail=1; }

body=$(like "$tok" true)
again=$(likes_of)
[ "$again" = "$after" ] && echo "ok   liking twice is still one like" || { echo "FAIL the same reader counted twice: $after -> $again ($body)"; fail=1; }
echo "$body" | grep -q "\"liked\":true" && echo "ok   and the reader is told the like is theirs" || { echo "FAIL the like response lost its state: $body"; fail=1; }

like "$other" true > /dev/null
two=$(likes_of)
[ "$two" = "$((after + 1))" ] && echo "ok   a second reader is a second like" || { echo "FAIL two readers gave $two likes, expected $((after + 1))"; fail=1; }

like "$tok" false > /dev/null
back=$(likes_of)
[ "$back" = "$after" ] && echo "ok   withdrawing a like takes the number back down" || { echo "FAIL unliking left $back likes, expected $after"; fail=1; }

code=$(curl -s "${as_reader[@]}" -o /dev/null -w '%{http_code}' -X POST "$BASE/api/likes" -H 'Content-Type: application/json' -d '{"post":"not-a-key","token":"qasmoketoken0003","liked":true}')
[ "$code" = "400" ] && echo "ok   a malformed post key is refused" || { echo "FAIL malformed like answered $code, expected 400"; fail=1; }
code=$(curl -s "${as_reader[@]}" -o /dev/null -w '%{http_code}' -X POST "$BASE/api/likes" -H 'Content-Type: application/json' -d '{"post":"journal:does-not-exist","token":"qasmoketoken0003","liked":true}')
[ "$code" = "404" ] && echo "ok   liking a piece that is not published is refused" || { echo "FAIL like on an unpublished key answered $code, expected 404"; fail=1; }
code=$(curl -s "${as_reader[@]}" -o /dev/null -w '%{http_code}' -X POST "$BASE/api/likes" -H 'Content-Type: application/json' -d "{\"post\":\"$key\",\"token\":\"short\",\"liked\":true}")
[ "$code" = "400" ] && echo "ok   a reader id this site did not issue is refused" || { echo "FAIL a bad token answered $code, expected 400"; fail=1; }

code=$(curl -s "${as_reader[@]}" -o /dev/null -w '%{http_code}' -X POST "$BASE/api/comments" -H 'Content-Type: application/json' -d "{\"post\":\"$key\",\"name\":\"\",\"body\":\"\",\"website\":\"\"}")
[ "$code" = "400" ] && echo "ok   an empty comment is refused" || { echo "FAIL empty comment answered $code, expected 400"; fail=1; }
body=$(curl -s "${as_reader[@]}" -X POST "$BASE/api/comments" -H 'Content-Type: application/json' -d "{\"post\":\"$key\",\"name\":\"QA Reader\",\"email\":\"qa-reader@example.com\",\"body\":\"This is an automated smoke test comment.\",\"website\":\"\"}")
echo "$body" | grep -q 'QA Reader' && echo "ok   a comment goes up immediately" || { echo "FAIL the comment was not stored: $body"; fail=1; }
echo "$body" | grep -q 'qa-reader@example.com' && { echo "FAIL the writer email came back to the reader"; fail=1; } || echo "ok   and the writer email is never sent back"
listed=$(curl -s "${as_reader[@]}" "$BASE/api/comments?post=$key")
echo "$listed" | grep -q 'automated smoke test comment' && echo "ok   the thread lists it" || { echo "FAIL the thread is missing the comment: $listed"; fail=1; }
echo "$listed" | grep -q '"likes":' && echo "ok   and the thread arrives with its counts" || { echo "FAIL the thread carried no counts: $listed"; fail=1; }
code=$(curl -s "${as_reader[@]}" -o /dev/null -w '%{http_code}' -X POST "$BASE/api/comments" -H 'Content-Type: application/json' -d "{\"post\":\"$key\",\"name\":\"QA Reader\",\"body\":\"honeypot filled\",\"website\":\"http://spam.example\"}")
[ "$code" = "200" ] && echo "ok   a filled honeypot is answered and ignored" || { echo "FAIL honeypot answered $code, expected a silent 200"; fail=1; }
listed=$(curl -s "${as_reader[@]}" "$BASE/api/comments?post=$key")
n=$(printf '%s' "$listed" | grep -o 'honeypot filled' | wc -l | tr -d ' ')
[ "$n" = "0" ] && echo "ok   and it is never stored" || { echo "FAIL the honeypot comment was stored ($n)"; fail=1; }
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/comments?post=nonsense")
[ "$code" = "400" ] && echo "ok   a thread is only served for a real piece" || { echo "FAIL a nonsense thread key answered $code, expected 400"; fail=1; }

echo "-- moderation belongs to the owner alone"
for r in /api/admin/comments; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$r")
  [ "$code" = "401" ] && echo "ok   $r requires auth 401" || { echo "FAIL $r answered $code to an anonymous reader"; fail=1; }
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE$r" -H 'Content-Type: application/json' -d '{"id":"00000000-0000-0000-0000-000000000000","action":"delete"}')
  [ "$code" = "401" ] && echo "ok   $r refuses an anonymous write" || { echo "FAIL $r accepted an anonymous POST ($code)"; fail=1; }
done
echo "-- the homepage carries the owner's own positioning statement"
html=$(curl -s "$BASE/")
echo "$html" | grep -q 'A creative technologist, digital entrepreneur, founder, worshipper' && echo "ok   the hero says what he is" || { echo "FAIL the hero statement is missing"; fail=1; }
echo "$html" | grep -q 'opportunities that make a difference' && echo "ok   and what he makes" || { echo "FAIL the hero statement is truncated"; fail=1; }
# Scoped to the hero itself: that phrase still belongs in the footer, where it has always been.
hero=$(printf '%s' "$html" | tr -d '\n' | sed 's/.*hero-intro/hero-intro/; s/hero-art.*//')
printf '%s' "$hero" | grep -q 'Websites and AI agents built to work' && { echo "FAIL the old hero lead is still in the hero"; fail=1; } || echo "ok   the old hero lead is out of the hero"
printf '%s' "$hero" | grep -q 'hero-lead-short' && echo "ok   and the mobile hero still has its one short line" || { echo "FAIL the mobile hero lead went missing"; fail=1; }

exit $fail
