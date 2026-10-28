# Pom Tales website

The episodes site for [thepomtales.com](https://www.thepomtales.com). Plain HTML, CSS and JavaScript, with no build step. Hosted on GitHub Pages.

## Updating content

Almost everything lives in `assets/data.js`: the tagline, episodes, characters, FAQ, email and social links. Search for `[PLACEHOLDER]` to find content that still needs replacing.

To add an episode, copy one of the entries in `episodes`, put it at the top of the list (newest first) and fill it in. For a YouTube video, `youtube` is just the ID, the part after `v=` in the link.

See DEPLOY.md for how the domain is connected.

Images go in `assets/img/`. Replace `logo.svg` and `favicon.svg` with the real logo, and add `og.png` (1200×630) for link previews.

## Preview locally

    python3 -m http.server 8000

Then open http://localhost:8000.
