Hacker News Daily — Interactive Newspaper
========================================

An interactive, flippable newspaper layout that presents the most relevant Hacker News stories with a professional, print-inspired design.

Features
--------

- Newspaper layout: lead story, multi-column flow, subtle rules.
- Page flipping: keyboard arrows, buttons, and touch swipes.
- Live data: pulls top stories from Hacker News public API.
- Lightweight: pure HTML/CSS/JS, no build step.
- Deploy ready: GitHub Pages workflow included.

Local Usage
-----------

1. Open `index.html` in a modern browser.
2. Use ◀ ▶ or Arrow keys to flip pages.

Deployment (GitHub Pages)
-------------------------

1. Push this repository to GitHub.
2. Ensure default branch is `main` (or `master`).
3. The workflow `.github/workflows/deploy.yml` uploads the static site and deploys to Pages on each push.
4. In the repo settings, enable GitHub Pages with the GitHub Actions workflow.

Notes
-----

- Data source: https://hacker-news.firebaseio.com/v0 (top stories).
- CORS: The official HN API supports browser requests; no server needed.
- Accessibility: Pages are regions with labels; controls use standard buttons.

Customization
-------------

- Change page size: tweak `PAGE_SIZE` in `script.js`.
- Increase fetched items: update `MAX_STORIES`.
- Styles: adjust variables and layout in `styles.css` for different column counts and typography.

