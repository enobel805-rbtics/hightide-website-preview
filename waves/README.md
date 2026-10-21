# HighTide — Waves copy

Separate editable copy of https://intensity-reasons-cow-descending.trycloudflare.com/ saved October 20, 2026. The original site has not been modified.

The original type, teal palette, page content, merchandise links, and interactive CAD breakdown are retained. Additions:

- A locally saved, looping crashing-wave GIF behind the hero.
- Dark mode is the default, with black-and-white waves and a graphite CAD model. The small moon button switches between dark and original teal colors; the selection is saved on the device.
- A pinned scroll scene using the original Ripcurrent CAD. Yellow fuel follows an arc into a line-drawn hub. Scroll distance controls all 24 shots and the score; reverse scrolling rewinds it.
- Exactly two album photos: the supplied pit photo and a team photo from the same shared album. No gallery or photo carousel.
- Mobile layout, reduced-motion stills, and a saved-robot fallback when WebGL is unavailable.

## Preview

Serve this folder using an HTTP server; do not open index.html directly because the 3D model uses ES modules and fetch.

```powershell
python -m http.server 4442 --bind 127.0.0.1 --directory hightide-waves
```

Local preview: http://127.0.0.1:4442/ . Public website: https://enobel805-rbtics.github.io/hightide-website-preview/waves/ .

## Editing

- `index.html`: content and new sections.
- `waves.css`: additions to the original styles.
- `fuel.js`: scroll position, CAD rendering, fuel trajectories and counter.
- `theme.js`: saved color preference and navigation toggle.
- `assets/index-*.js`, `assets/index-*.css`, `assets/robot-*.js`: saved original build. The model path and font paths use relative URLs for subfolder hosting.
- `media/`: all media saved locally.

## Sources

Original CAD, artwork, fonts and existing media: the user-supplied HighTide website.

Ocean: Atakan Ozkan, *Sea Waves Crashing the Beach Shore*, Pexels, https://www.pexels.com/video/sea-waves-crashing-the-beach-shore-3116760/ . Converted from the existing local `assets/ocean-waves.mp4` into a silent five-second GIF. License: https://www.pexels.com/license/ .

Photos: user-supplied Team 4414 / HighTide Google Photos album. Exact selected image URLs are recorded in `photo-sources.json`.

Verified in the browser at desktop and 390px phone width: original CAD and scoring CAD load, score advances and rewinds, images load, no horizontal overflow, no console warnings/errors. JavaScript syntax checks pass.

