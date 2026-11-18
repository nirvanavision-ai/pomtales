# Pom Tales website

The episodes site for [thepomtales.com](https://www.thepomtales.com). Plain HTML, CSS and JavaScript, with no build step. Hosted on GitHub Pages.

## Updating content

Almost everything lives in `assets/data.js`: episodes, seasons, characters, email, YouTube, press kit and social links. Search for `[PLACEHOLDER]` to find content that still needs replacing.

To add an episode, copy one of the entries in `episodes`, put it at the top of the list (newest first) and fill it in. For a YouTube video, `youtube` is just the ID, the part after `v=` in the link.

Until an episode has a `thumb` or `youtube` ID, the site draws a placeholder scene with a fluffy Pom for it (`assets/art.js`). Add real stills as `thumb` and they replace the drawings everywhere.

See DEPLOY.md for how the domain is connected.

Images go in `assets/img/`. Replace `logo.svg` and `favicon.svg` with the real logo, and add `og.png` (1200×630) for link previews.

## Preview locally

    python3 -m http.server 8000

Then open http://localhost:8000.

## How the site is put together

- `index.html` + `assets/home.js`: the home page. An intro loader turns into the bottom dock, which switches between four views with a cube turn: **Episodes** (the curved card wall, `assets/wall.js`, WebGL), **Episode guide** (flip-number timeline), **Seasons** (a shelf of screens) and **More** (contact, cast, socials, light/dark).
- `episode.html` and `season.html` + `assets/page.js`: one page per episode (`?id=s2e6`) and per season (`?s=2`).
- `assets/style.css`: all styling.
- `intro.html`: the "Our story" page (linked from the dock). A scroll story of how the five pups were rescued, fostered, adopted and became Pom Tales. Its files are in `assets/intro/`: `intro.css` (styling), `intro.js` (the scroll choreography, built with GSAP, which is in `assets/vendor/`) and `art.js` (the felt and yarn drawings: hoop, balloon, clouds, TV, hills).

## Updating the Our story page

- **Pup art.** Each pup is one transparent image in `assets/intro/pups/`: `taz.webp`, `wookie.webp`, `skye.webp`, `ninja.webp` and `zivi.webp`. Replace a file with a new one of the same name and it changes everywhere on the page (the hoop, the crib mobile, the balloon basket, the hill at the end and the finale). Keep the background transparent and the pup standing, facing forward, cropped close at the feet.
- **Photos** are in `assets/intro/img/`. The polaroids use `real-<name>.webp` (the real puppies). The newspapers use `news-pups.webp` and `news-twins.webp`, the TV channels use `tv-twins.webp` and the `zone-*.webp` stills, and the spinning world is `world-strip.webp`, a strip whose left and right edges join up.
- **Words.** All the story text is in `intro.html`: the chapter cards near the top (`.cards`), the polaroid captions, and the two newspapers. The same story is also kept as plain text in `#story-text` for screen readers, so change both.
- **Timing.** The scroll timeline is in `intro.js`. One unit of the timeline is one screen of scrolling.
