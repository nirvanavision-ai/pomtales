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
