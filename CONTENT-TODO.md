# Content and image TODO

Everything marked `TODO(image)` or `TODO(content)` in `index.html` is a spot to fill in.
In VS Code, press `Ctrl+Shift+F` and search for `TODO(` to jump through all of them.

## 1. Images to replace (or find better ones)

| Where | Currently | Recommended replacement | Notes |
|---|---|---|---|
| Hero avatar | `images/avatar.jpg` (your formal photo on a blue background) | A casual photo, a **transparent-background cutout** (PNG/WebP), or a **cartoon/pixel-art avatar** | Square-ish crop around the face, about 600x600 or bigger, under 200 KB. The playful theme suits something less formal than an ID photo. |
| About section (polaroid) | `images/placeholders/about-photo.svg` | A **candid photo**: hobby, desk setup, a trip, you laughing | 4:5 portrait, about 800x1000, `.jpg` or `.webp`. Change the `src` in `index.html`. |
| Project cards | All five now use real screenshots: `images/project-apple-ripeness.webp`, `images/project-gamfui.png`, `images/project-ngear.webp`, `images/project-trek.jpg` and `images/project-website.jpg`. More GamFui screens (exercise, diet, meal photo) would show the app off better; the card shows the top of the one screenshot. |
| Link preview (WhatsApp, LinkedIn, Discord) | Not set | A **1200x630** banner with your name and tagline | Save as `images/og-image.png`, then uncomment/add the `og:image` meta tag in `<head>` using your final site URL. |
| Browser tab icon | `images/favicon.svg` (an "H" in a neon frame) | Your own logo or initials if you want | Keep it simple, it is shown at 16x16. |

## 2. Text and content to replace

| Where | What to do |
|---|---|
| Hero typed line | Edit the phrases in `data-typed` (separated by `\|`). |
| Hero intro line | Write your own one-liner. |
| `./linkedin` and the Contact section | Replace `https://www.linkedin.com/in/your-handle` with your real profile. |
| Contact email | Replace `your.email@example.com` (in the `href` **and** the visible text). The Copy button and terminal pick it up automatically. |
| About | Two paragraphs, four "fun facts", three stats (`data-count` is the number that counts up). |
| Skills | Names and levels (`--level: 1` to `5`). The "soft skills" card is the funny one, keep or change it. |
| Project 01 (Apple Ripeness) | The tags are Python, OpenCV, Computer Vision and Image Processing; add any other libraries or the web framework, your own role in the team, and the live demo and source links (both are `#` right now). |
| Project 02 (GamFui) | The tags are Flutter, Dart and Mobile App; add the other tech you used (database, how the calories are calculated), your own role in the team, and the source link (`#` right now). |
| Project 03 (NGEAR) | The tags are PHP, MySQL, Stripe, XAMPP and 2FA; add your own role in the team and the source link (`#` right now). It runs locally on XAMPP, so there is no live demo. |
| Project 04 (TREK) | The tags are Flutter, Dart, Supabase, Gemini and OCR; add your own role in the team and the source link (`#` right now). |
| Project 05 (This Website) | Already points to this repo. Add a live link once the site is published. |
| Footer | The year updates itself. |

## 3. Fun features (so you know they exist)

- **Theme toggle** (sun/moon in the header), remembered between visits.
- **Terminal** in Contact. Try `help`, `whoami`, `contact`, `coffee`, `joke`, `matrix`, `cd projects`, `sudo hire hermen`, `sudo rm -rf /`. Add your own in `js/script.js` inside the `commands` object.
- **Konami code**: press up, up, down, down, left, right, left, right, B, A anywhere outside the terminal.
- **Rubber duck** (bottom-right): click for a debugging tip. Edit the `tips` list in `js/script.js`.
- Glitching name, orbiting chips, typed text, cursor glow, card tilt and scroll reveals. All of them switch off for visitors who have "reduce motion" turned on in their system settings.

## 4. Quick tweaks

- **Colours:** the first block of `css/style.css` (`:root` for dark, `[data-theme='light']` for light).
- **Background density:** `count` in `resize()` inside `initBackground()` in `js/script.js`.
- **Fewer floating symbols:** `count` and the `glyphs` list in `initGlyphs()`.

## 5. Design references

I looked at a few public personal sites for ideas (no code was copied):

- [brittanychiang.com](https://brittanychiang.com): dark navy theme, soft fade-in on load, a glow that follows the cursor.
- [joshwcomeau.com](https://www.joshwcomeau.com): dark, playful, and tag chips; proof that "fun" and "professional" can live together.
- [davidesantangelo.com](https://www.davidesantangelo.com): the small status chip above the headline and the avatar with a short caption.
- Search results about terminal-style portfolios (Termfolio, dotUniverse and similar) inspired the hidden terminal commands and the Konami easter egg.

## 6. Before you publish

- [ ] Replace every placeholder above.
- [ ] Check it on your phone (and in light mode).
- [ ] Run Lighthouse (Chrome DevTools) and aim for 90+.
- [ ] Add a live-site link to Project 01 and the `og:image` tag.
