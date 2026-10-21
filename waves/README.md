# HighTide — Waves copy

Separate editable copy of https://intensity-reasons-cow-descending.trycloudflare.com/ saved October 20, 2026. The original site has not been modified.

The original type, teal palette, page content, merchandise links, and interactive CAD breakdown are retained. Additions:

- A locally saved, looping crashing-wave GIF behind the hero.
- Dark mode is the default, with black-and-white waves and a graphite CAD model. The small moon button switches between dark and original teal colors; the selection is saved on the device.
- A single continuous Ripcurrent CAD model travels from the hero through the subsystem breakdown, reassembles into the shooting scene, and fades out after shooting. Scroll distance controls all 24 shots and the score; reverse scrolling rewinds it.
- The fuel uses the official 5.91-inch diameter, measured against the CAD's screen projection. The hub is a simplified projected 3D model based on FIRST's official 2026 drawings: square 47-inch base, hexagonal opening at 72 inches, and the 120.36-inch rear net. It is an illustrative model, not official field CAD.
- Two photos: the supplied pit photo and the user-provided championship confetti image. No gallery or photo carousel.
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
- `fuel-follow.js`: continuous CAD handoff, physical fuel scale, trajectories and counter.
- `hub.js`: inch-based procedural hub geometry and projected rendering.
- `theme.js`: saved color preference and navigation toggle.
- `assets/index-*.js`, `assets/index-*.css`, `assets/robot-*.js`: saved original build. The model path and font paths use relative URLs for subfolder hosting.
- `media/`: all media saved locally.

## Sources

Original CAD, artwork, fonts and existing media: the user-supplied HighTide website.

Ocean: Atakan Ozkan, *Sea Waves Crashing the Beach Shore*, Pexels, https://www.pexels.com/video/sea-waves-crashing-the-beach-shore-3116760/ . Converted from the existing local `assets/ocean-waves.mp4` into a silent five-second GIF. License: https://www.pexels.com/license/ .

Photos: the user-supplied Team 4414 / HighTide Google Photos album and the replacement championship confetti image. Sources are recorded in `photo-sources.json`.

Hub and fuel references: FIRST 2026 Game Manual, sections 5.4 and 5.10.1, https://firstfrc.blob.core.windows.net/frc2026/Manual/2026GameManual.pdf ; official field dimension drawings, GE-26300 sheet 4, https://firstfrc.blob.core.windows.net/frc2026/FieldAssets/2026-field-dimension-dwgs.pdf . The small tag patterns are illustrative markings, not usable AprilTags.

Verified in the browser at desktop and 390px phone width: original CAD and scoring CAD load, score advances and rewinds, images load, no horizontal overflow, no console warnings/errors. JavaScript syntax checks pass.

