# /media — self-hosted video

The site hosts at most a handful of videos, on purpose: every megabyte here
ships with every deploy, so the rule is **one hero performance, hosted; the
rest linked out** (journal posts carry `videoExternal` + `videoPoster` for
those, rendered as a card with a still and a play line).

Conventions for anything that does live here:

- Container: `.mp4` (H.264 + AAC) so every browser and phone plays it; `.webm`
  (VP9) only as a second source when a clip matters enough to encode twice.
- Size: keep each file under ~40 MB — transcode down from the archive original
  with `ffmpeg -i in.mov -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart out.mp4`
  (`+faststart` moves the header to the front so playback begins before the
  file finishes downloading).
- Resolution: 1280×720 is the ceiling for hosted clips; the archive keeps the
  originals, the site keeps the fast cut.
- Poster: a still from the clip, saved as WebP next to the photographs in
  `public/images/` and listed in `public/images/INDEX.md`, referenced from the
  post's `videoPoster` field.
- Referenced from content only through the journal fields `videoSrc` (this
  folder), `videoPoster`, or the creative collection's `mediaType: 'video'`
  with `mediaUrl` pointing here.

Nothing in this folder is committed to Git history twice: replace a clip by
overwriting the same filename, never by adding a second copy.
