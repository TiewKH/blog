# Design

## Overview

The visual system supports a software engineer portfolio and technical blog with two modes:

- Workbench mode: an OS-inspired homepage for orientation, profile proof, writing, resume, and contact.
- Reader mode: conventional navigation and article reading for mobile, accessibility, search, and long sessions.

The default design direction is light-first, crisp, technical, and readable. It should feel like a production engineering workspace rather than a playful desktop clone.

## Color

Use OKLCH tokens. The current system uses cool tinted neutrals with green, orange, and violet accents:

```css
--bg: oklch(0.975 0.012 185);
--surface: oklch(0.99 0.007 105);
--surface-2: oklch(0.94 0.018 205);
--ink: oklch(0.18 0.018 235);
--muted: oklch(0.45 0.025 230);
--line: oklch(0.82 0.025 210);
--accent: oklch(0.55 0.145 155);
--accent-2: oklch(0.64 0.17 35);
--accent-3: oklch(0.58 0.12 265);
--code-bg: oklch(0.2 0.025 230);
--code-ink: oklch(0.94 0.018 130);
```

Usage guidance:

- Use `--accent` for primary actions, active mode, focus treatment, and selected windows.
- Use `--accent-2` sparingly for external-link emphasis, warnings, latest markers, and close hover states.
- Use `--accent-3` for secondary technical states such as contact, search, or project details.
- Keep large reading surfaces quiet. Long posts should not sit inside high-chroma backgrounds.
- Avoid beige dominance, generic dark-blue developer palettes, and one-note green themes.

## Typography

Current families:

- Body: `Atkinson Hyperlegible`, with system fallback.
- Display and UI: `Recursive`, used for headings and OS chrome.
- Code: `JetBrains Mono`, used only for code and compact technical labels.

Rules:

- Article prose should stay near 65 to 75 characters per line.
- Body line height should remain generous, around `1.68` in light mode.
- Code blocks need horizontal overflow, stable padding, and clear contrast.
- Do not use monospace as the main article or portfolio voice.
- Headings should create strong hierarchy through size and weight, not all-caps styling.

## Layout

Reader mode:

- Keep normal routes, sticky header, direct navigation, and article-first flow.
- Article content should be centered with enough margin for scanning and code blocks.
- Mobile should use Reader mode only, with simple navigation and no desktop windows.

Workbench mode:

- Use a top menu bar, dock/icons, window frames, and direct links to writing, resume, GitHub, LinkedIn, and contact.
- The primary window should introduce the person before secondary windows compete for attention.
- Windows may drag, resize, snap, close, and maximize, but direct routes must remain the durable navigation model.
- Window controls must be actual buttons with accessible names.

Spacing:

- Use fluid spacing such as `clamp(16px, 3vw, 40px)` for broad layout rhythm.
- Use compact spacing in OS chrome and generous spacing in article prose.
- Avoid nested cards. Use framed windows for app-like panels and unframed sections for normal pages.

## Components

Core components:

- `BaseLayout`: shared metadata, navigation, mode setup, and page shell.
- `ProfileIntro`: concise identity and summary.
- `ProfilePanels`: stack, focus areas, and proof blocks.
- `ExperienceSection`: chronological credibility and company context.
- `WritingSection` and `WritingBrowser`: searchable or browsable article index.
- `PostLayout`: readable article shell with title, description, date, reading time, featured media, and markdown content.
- Window frames in `src/pages/index.astro`: OS-style containers for README, Writing, Article, and Contact.

Component guidance:

- Buttons should clearly distinguish navigation, external links, and window controls.
- Repeated content should appear as dense, comparable rows where scanning matters.
- Use cards only for individual repeated items, not as a default page-section wrapper.
- External links should announce that they leave the site visually and semantically.

## Interaction

- Workbench mode is progressive enhancement. Reading should not require JavaScript.
- Store interface preferences locally, but never block normal URLs.
- Provide clear exits from windows and search.
- Respect browser history when opening articles in OS mode.
- Animate only transform and opacity. Avoid layout-property animation.
- Respect `prefers-reduced-motion`.

## Accessibility

- Use semantic landmarks: header, nav, main, article, section, aside, footer where appropriate.
- Every icon-only or symbolic control needs an accessible name.
- Active route, active mode, open window, and focused window states must not rely on color alone.
- Links in prose should remain visibly identifiable.
- Search result updates should be announced or otherwise programmatically discoverable if results change live.
- Keep focus rings visible and high-contrast.

## Performance

- Keep Astro-generated pages static and crawlable.
- Avoid turning the site into a client-side SPA.
- Optimize images with explicit dimensions or stable aspect ratios to prevent layout shift.
- Defer nonessential JavaScript.
- Treat Core Web Vitals as product quality: fast article load, stable layout, and responsive controls.
