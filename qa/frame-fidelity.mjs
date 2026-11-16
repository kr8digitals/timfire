#!/usr/bin/env node
/**
 * Frame fidelity: no photograph on a story page or a journal card may be cropped
 * through somebody's face.
 *
 * The owner's complaint was exact — "my face is cut off from view, both on mobile
 * and other screens" — and the cause was two CSS boxes that guessed a shape the
 * archive photographs do not have: a story photo forced into a 1200x800 landscape
 * frame with `object-fit: cover`, and a card thumbnail 250px tall with the window
 * centred. Most of these frames are tall portraits (640x1337, 843x1765), so both
 * boxes sliced straight through the head.
 *
 * This checks the fix from three sides:
 *   1. every journal photograph carries its real pixel size, read here straight
 *      out of the WebP on disk — a stale or missing size is what lets a crop back in;
 *   2. the stylesheet still fits story photos whole (`contain`, never `cover`);
 *   3. card thumbnails keep a top-biased window, where faces are;
 *   4. a story page still opens as a split — what the piece is on the left, the
 *      frame or clip that carries it on the right, the writing below both — and
 *      the gallery viewer keeps the same rhythm;
 *   5. the musician story still carries no lead photograph, only the clip.
 *
 * WebP dimensions are parsed from the file header rather than shelling out, so
 * the check needs nothing installed.
 *
 *   npm run build && node qa/frame-fidelity.mjs http://127.0.0.1:3100
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url);
const BASE = process.argv[2] ?? 'http://127.0.0.1:3100';

let checks = 0;
let failures = 0;
function check(label, condition, detail) {
  checks += 1;
  if (condition) console.log(`ok   ${label}`);
  else {
    console.log(`FAIL ${label}${detail === undefined ? '' : ` — ${detail}`}`);
    failures += 1;
  }
}

/** Width and height of a WebP, from RIFF/VP8, RIFF/VP8L or RIFF/VP8X. */
function webpSize(file) {
  const b = readFileSync(file);
  if (b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WEBP') return null;
  const fourcc = b.toString('latin1', 12, 16);
  if (fourcc === 'VP8X') {
    // 4 bytes size, 4 bytes flags, then canvas width-1 and height-1 as 24-bit LE.
    const w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    const h = 1 + (b[28] | (b[29] << 8) | (b[30] << 16));
    return { width: w, height: h };
  }
  if (fourcc === 'VP8L') {
    const at = 21; // chunk header (8) + 4-byte size field is at 16; signature 0x2f at 20
    if (b[at - 1] !== 0x2f) return null;
    const bits = b.readUInt32LE(at);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === 'VP8 ') {
    // chunk size at 16, frame data from 20: 3-byte tag then the 9d 01 2a start code.
    let at = 20;
    while (at < b.length - 6 && !(b[at] === 0x9d && b[at + 1] === 0x01 && b[at + 2] === 0x2a)) at += 1;
    if (b[at] !== 0x9d) return null;
    return { width: b.readUInt16LE(at + 3) & 0x3fff, height: b.readUInt16LE(at + 5) & 0x3fff };
  }
  return null;
}

const css = readFileSync(join(ROOT.pathname, 'app/globals.css'), 'utf8');
const rule = (selector) => {
  const at = css.indexOf(selector);
  if (at < 0) return '';
  const end = css.indexOf('}', at);
  return css.slice(at, end < 0 ? undefined : end + 1);
};

const res = await fetch(`${BASE}/api/content`);
if (!res.ok) {
  console.log(`FAIL ${BASE}/api/content answered ${res.status}`);
  process.exit(1);
}
const { journal } = await res.json();
const illustrated = journal.filter((item) => typeof item.image === 'string' && item.image.startsWith('/images/'));

/* Fourteen, not fifteen: the musician story deliberately carries no lead
   photograph. Its frame was a still from a different clip, so it said something
   the post did not — the owner's call was the video alone, on the right. */
check('the Me page carries illustrated posts to measure', illustrated.length >= 14, `${illustrated.length} with images`);

const musician = journal.find((item) => item.id === 'a-musician');
check('the musician story was found', !!musician, 'id a-musician missing from /api/content');
if (musician) {
  check('and carries no lead photograph', !musician.image, `image is still ${musician.image}`);
  check(
    'and its video says what the video actually is',
    musician.videoCaption === 'This is what I can do: me singing, breaking the doubt.',
    JSON.stringify(musician.videoCaption),
  );
  check('and the clip it points at is the TikTok post', /tiktok\.com\/@kutimfire\/video\/7644259695053589778/.test(musician.videoExternal || ''), musician.videoExternal);
}

let mismatches = 0;
for (const item of illustrated) {
  const file = join(ROOT.pathname, 'public', item.image);
  let real;
  try {
    real = webpSize(file);
  } catch (error) {
    real = null;
    console.log(`FAIL ${item.slug}: ${item.image} could not be read — ${error.message}`);
    failures += 1;
    checks += 1;
    continue;
  }
  checks += 1;
  const declared = { width: item.imageWidth, height: item.imageHeight };
  const same = !!real && declared.width === real.width && declared.height === real.height;
  if (!same) {
    mismatches += 1;
    console.log(
      `FAIL ${item.slug}: declares ${declared.width}x${declared.height}, ${item.image} is ${real ? `${real.width}x${real.height}` : 'unreadable'}`,
    );
  }
}
check(
  'every story photograph declares the real pixel size of its file',
  mismatches === 0,
  `${mismatches} of ${illustrated.length} wrong`,
);
if (!mismatches) console.log(`     (${illustrated.length} frames measured against the files on disk)`);

/* The two boxes that used to crop. Both are asserted as contracts, because the
   failure they cause is invisible to every other suite: the page renders, the
   image loads, the link resolves — only the person in the photograph is missing. */
const story = rule('.photo-card.article-photo img');
check('a story photo is fitted whole, never cropped', story.includes('object-fit:contain'), story.slice(0, 160));
check('and is allowed to be as tall as it is', !/max-height:650px/.test(story), story.slice(0, 160));

/* The layout the owner asked for: what the piece is on the left, the frame or
   the clip that carries it on the right, and the writing below both. Asserted
   here because a regression is invisible to every other suite — the page still
   renders, it just goes back to dumping a full-width photograph under a title. */
const split = rule('.story-split{');
/* The right-hand column is a fixed measure rather than a share of the page, so a
   tall portrait or a 9:16 clip cannot grow into a wall next to a short title —
   that was the owner's "the alignment is not good". */
check('a story opens as two columns, text and media side by side', /grid-template-columns:minmax\(0,1fr\) minmax\(0,460px\)/.test(split), split.slice(0, 200));
const mediaCol = rule('.story-media>*{');
check('and everything in the media column is capped to that measure', mediaCol.includes('max-width:460px'), mediaCol.slice(0, 160));
const clip = rule('.story-media .story-video{');
check('a clip is capped by height, since it is taller than it is wide', /max-height:min\(72vh,680px\)/.test(clip), clip.slice(0, 160));
check('and a story with no media falls back to one column', rule('.story-split.single{').includes('grid-template-columns:minmax(0,1fr)'), rule('.story-split.single{').slice(0, 160));
check('the media column exists and centres its frame', rule('.story-media{').includes('justify-items:center'), rule('.story-media{').slice(0, 160));
const stacked = css.slice(css.indexOf('@media(max-width:900px){.story-split'));
check('and on a phone the two columns stack', /^\{grid-template-columns:1fr/.test(stacked.slice('@media(max-width:900px){.story-split'.length)), stacked.slice(0, 120));

/* Likes and comments. The story body renders in the browser, so these are read
   out of the source and the stylesheet: what the DOM looks like after hydration
   is the same contract, and a curl of the page can only ever see "Loading…". */
const detail = readFileSync(join(ROOT.pathname, 'components/detail.tsx'), 'utf8');
const engage = readFileSync(join(ROOT.pathname, 'components/engage.tsx'), 'utf8');
const sections = readFileSync(join(ROOT.pathname, 'components/sections.tsx'), 'utf8');
const admin = readFileSync(join(ROOT.pathname, 'components/admin.tsx'), 'utf8');
check('every story carries the comment box', detail.includes('<Engagement post={postKey(kind, item.slug)} />'), 'detail.tsx lost the Engagement block');
check('a clip that cannot be embedded is a card that says where it goes', detail.includes('Watch on {platformOf(external)}'), 'detail.tsx lost the external-clip card');
check('and no story leans on a player it cannot promise', !/tiktok\.com\/embed/.test(detail), 'detail.tsx is embedding TikTok again');
check('the comment form promises what moderation actually does', engage.includes('It goes up immediately'), 'engage.tsx lost the post-moderation promise');
check('a like is one per reader, held by a token in their browser', engage.includes('timfire-reader-token'), 'engage.tsx lost the reader token');
for (const sel of ['.engagement{', '.engage-bar{', '.like-button{', '.comment-list{', '.comment{', '.comment-form{', '.card-counts{']) {
  check(`the stylesheet frames ${sel.slice(0, -1)}`, rule(sel).length > 0, 'missing from app/globals.css');
}
check('every card on the Me page carries the two counts', sections.includes('<CardCounts counts={counts?.[postKey(') , 'sections.tsx lost CardCounts');
check('and the shelf asks for them in one request, not one per card', sections.includes("fetch('/api/engagement'"), 'sections.tsx is not batching the counts');

/* The owner's other note: the Me page described itself twice, and vaguely. */
const journalFn = sections.slice(sections.indexOf('function Journal()'), sections.indexOf('function Timeline()'));
check('the Me page describes itself once, in the hero only', !/page-lead/.test(journalFn), 'Journal() carries its own description again');
check('the dashboard has a Comments tab', admin.includes("comments:'Comments'") && admin.includes('{tab===\'comments\'&&<CommentsEditor/>}'), 'admin.tsx lost the Comments tab');
check('and moderation hides before it deletes', admin.includes('Hide first'), 'admin.tsx lost the hide-before-delete rule');

const box = rule('.lightbox-figure{');
check('the gallery viewer keeps the same rhythm: words left, frame right', /grid-template-columns:minmax\(0,300px\) minmax\(0,1fr\)/.test(box), box.slice(0, 200));
check('and its frame sits in the right-hand column', rule('.lightbox-figure img{').includes('grid-column:2'), rule('.lightbox-figure img{').slice(0, 160));

const thumb = rule('.card-image.journal-thumb');
const bias = /object-position:center (\d+)%/.exec(thumb);
check('a journal card keeps its window on the face, not the middle', !!bias && Number(bias[1]) <= 20, thumb.slice(0, 160));
check('and that window is taller than the 250px that cut heads off', /height:clamp\(/.test(thumb), thumb.slice(0, 160));

console.log(`\n${checks - failures}/${checks} checks passed.`);
if (failures) {
  console.log(`FAIL: ${failures} frame-fidelity checks failed.`);
  process.exit(1);
}
console.log('PASS: every story frame is measured, fitted whole and framed on the face.');
