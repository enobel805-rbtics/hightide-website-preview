# HighTide / Team 4414

A standalone website concept inspired by the oversized typography, contour graphics, photo collage, and on/off-track structure of landonorris.com. Cyan, deep ink, warm white, and real HighTide imagery form an original Team 4414 adaptation.

The story centers on HighTide as a whole: people, curiosity, collaboration, community, and the team's work across seasons. The robot gallery gives all eight archive robots the same card treatment.

## Preview

Run `python -m http.server 4430 --bind 127.0.0.1 --directory hightide-norris` from the parent Websites folder, then open http://127.0.0.1:4430/.

Edit `index.html`, `style.css`, and `app.js` directly. The motion layer lives in `motion.css` and `motion.js`. No build, npm install, external fonts, or remote image service is required. `prepare_assets.py` recreates optimized local images from the existing parent workspace using Pillow.

Includes an opening brand iris, a sticky hero that expands into a full-screen team photograph as you scroll, staggered word reveals, photo parallax and image wipes, an animated menu with staggered links, expanding on/off-field panels, contextual cursors, a draggable eight-season robot gallery with progress, animated link arrows, and a page progress indicator. Motion work runs on scroll and pointer events rather than continuous idle loops. Includes keyboard navigation, Escape and focus containment, video captions, responsive layouts, and reduced-motion support.

## Assets and content

- Team group photo and arena confetti: existing user-provided HighTide photo collection in the parent workspace. The group photograph includes HighTide with other teams at the event.
- Robot photos: existing official team and The Blue Alliance image archive; original source mapping is in the parent `robot-photo-sources.json`.
- Competition film: existing 2023 and 2026 montage. Source broadcasts by FIRST Robotics Competition, https://www.youtube.com/watch?v=PFW2Sc3shaA and https://www.youtube.com/watch?v=j8wz5vw5XfE.
- Logo and sponsor artwork: existing official HighTide site assets. Sponsor links are drawn from the parent site sources.
- Reference site is used for visual direction; no Lando Norris images, logos, scripts, or fonts are included.

Saved as a separate local concept. Existing root site, official snapshot, and published GitHub Pages site are unchanged.
