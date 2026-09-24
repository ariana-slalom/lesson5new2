# My Link

A personal link-in-bio page for Ariana De Ryss. The site is a mobile-first static page with a dark-first organic color palette, theme toggle, animated background, and links to Ariana's portfolio, LinkedIn, and email.

## Tech

- HTML
- CSS
- JavaScript
- Google Fonts: Inter and DM Mono
- No framework, build tool, or dependencies

## Run Locally

From this directory, start any static server. For example:

```bash
python3 -m http.server 4173
```

Then open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) in a browser.

## Deploy

This project is ready for an educational Vercel deployment as a static site. It is not presented as approved for client delivery or internal production use.

### Vercel

- Framework preset: Other
- Root directory: `.`
- Build command: none
- Output directory: `.`

From the Vercel dashboard, import [ariana-slalom/lesson5new2](https://github.com/ariana-slalom/lesson5new2), keep the settings above, and deploy. No Vercel CLI or account credentials are stored in this repository.

### GitHub

The project is ready to commit and is currently published at [github.com/ariana-slalom/lesson5new2](https://github.com/ariana-slalom/lesson5new2). To publish future changes:

```bash
git add .
git commit -m "Describe the change"
git push
```

## Accessibility and Scope

- Semantic headings, navigation, links, and button controls are used.
- The theme toggle has an accessible label and pressed state.
- Focus-visible styles are provided for interactive controls.
- Reduced-motion preferences are respected.
- The project contains only fictional/personal link-page content and no client or company-sensitive information.

This is a static link-in-bio page, not a Vue dashboard. It has no filter logic, metrics, JSON data, regional totals, exception table, TypeScript build, or package dependencies.

## Files

- `index.html` - page structure and content
- `styles.css` - responsive layout, themes, animation, and visual styling
- `script.js` - theme toggle and local preference persistence
- `BRIEF.md` - original project brief
- `.gitignore` - ignores dependencies, build output, local environment files, and OS artifacts
