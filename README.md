# Lakhi Sahu & Arvind Gupta — Wedding Invitation Website

A cinematic, interactive Indian wedding invitation website built with HTML5, CSS3, and vanilla JavaScript.

---

## Quick Start

### Option 1 — VS Code Live Server (Recommended)
1. Open the project folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey) if not already installed.
3. Right-click `index.html` → **Open with Live Server**.
4. The site opens automatically at `http://127.0.0.1:5500`.

### Option 2 — Python HTTP Server
```bash
# Python 3
python -m http.server 8080
# Then open http://localhost:8080
```

### Option 3 — Node.js (npx serve)
```bash
npx serve .
```

---

## Replacing Placeholder Photos

All placeholder images are in `assets/images/`. Simply replace any file with your actual photo — **keep the same filename** so no code changes are needed.

| File | Section | Description |
|------|---------|-------------|
| `palace-entrance.jpg` | Hero entrance & closing | Palace gate background |
| `couple-main.jpg` | Announcement & Gallery | Main couple portrait |
| `couple-traditional.jpg` | Gallery | Traditional ceremony shot |
| `couple-prewedding.jpg` | Gallery | Pre-wedding photo |
| `couple-final.jpg` | Gallery & Scratch card | Final romantic portrait |

**Recommended dimensions:**
- `palace-entrance.jpg` — 1920×1080px (landscape)
- `couple-main.jpg` — 900×1200px (portrait)
- `couple-traditional.jpg` — 900×1200px (portrait)
- `couple-prewedding.jpg` — 900×1200px (portrait)
- `couple-final.jpg` — 900×1200px (portrait)

---

## Adding Background Music

1. Create the folder `assets/audio/`.
2. Place your MP3 file there named `wedding-music.mp3`.
3. In `script.js`, locate the comment inside `initMusicToggle()`:
   ```js
   // audio.src = 'assets/audio/wedding-music.mp3';
   ```
4. Uncomment that line. The music toggle button (♪) in the top-right corner will now work.

> **Note:** Music is user-activated only — it never autoplays.

---

## Venue Location (Google Maps)

The venue location is linked to:
- **Insuriya Bhavan**: [https://maps.app.goo.gl/s3JP33nxzjYMDaRH7](https://maps.app.goo.gl/s3JP33nxzjYMDaRH7)

Guests can tap the interactive venue card or click **"Open in Google Maps"** to launch turn-by-turn directions directly in the Google Maps app or browser.

---

## Updating Wedding Details

All wedding details are in `index.html`. Search for the text you want to change:

| Detail | Where to update |
|--------|----------------|
| Couple names | All 9 sections in `index.html` |
| Wedding date | `index.html` (multiple places) + `script.js` countdown target |
| Venue | `index.html` (Sections 7, 8, 9) |
| Ceremony time | `index.html` — Section 7 event card (currently "To be announced") |

**To update the countdown date**, edit `script.js`:
```js
// Line in initCountdown():
const targetUTC = Date.UTC(2026, 10, 23, 18, 30, 0);
//                             year  month day  h   m   s
// IST = UTC+5:30, so 2026-11-24 00:00 IST = 2026-11-23 18:30 UTC
// months are 0-indexed (10 = November)
```

---

## Adding More Gallery Photos

Add `<figure>` elements inside `.gallery-grid` in `index.html`:
```html
<figure class="gallery-item" tabindex="0" aria-label="Your label">
  <div class="gallery-frame">
    <img src="assets/images/your-photo.jpg" alt="Descriptive alt text" loading="lazy" />
    <div class="gallery-overlay"><p class="gallery-caption">Caption Here</p></div>
  </div>
  <div class="gallery-corner gl-tl" aria-hidden="true"></div>
  <div class="gallery-corner gl-tr" aria-hidden="true"></div>
  <div class="gallery-corner gl-bl" aria-hidden="true"></div>
  <div class="gallery-corner gl-br" aria-hidden="true"></div>
</figure>
```

---

## Adding More Events

Duplicate an `<article class="event-card">` block in Section 7 and fill in the event details.

---

## Browser Compatibility

| Feature | Requirement |
|---------|------------|
| Canvas scratch card | All modern browsers |
| IntersectionObserver | Chrome 58+, Firefox 55+, Safari 12.1+ |
| Web Share API | Chrome/Edge (Android), Safari 14+ |
| CSS custom properties | All modern browsers |
| Intl.DateTimeFormat | All modern browsers |

Internet Explorer is not supported.

---

## Project Structure

```
wedding-invitation/
├── index.html          — 10-section wedding website
├── style.css           — All styles & animations
├── script.js           — All JavaScript interactions
├── README.md           — This file
└── assets/
    ├── images/
    │   ├── palace-entrance.jpg   — Replace with real background
    │   ├── couple-main.jpg       — Replace with real photo
    │   ├── couple-traditional.jpg
    │   ├── couple-prewedding.jpg
    │   └── couple-final.jpg
    ├── icons/                    — (empty, for future favicon etc.)
    └── audio/                    — (create this folder for music)
        └── wedding-music.mp3     — (add your music file here)
```

---

## Credits

- Fonts: [Google Fonts](https://fonts.google.com/) — Cormorant Garamond, Great Vibes, Cinzel, Playfair Display
- Images: AI-generated placeholders (Antigravity / Google DeepMind)
- No third-party libraries or frameworks — pure HTML, CSS, JavaScript.

---

*With love — Lakhi Sahu & Arvind Gupta · 24 November 2026 · Insuriya Bhavan, Dibrugarh*
