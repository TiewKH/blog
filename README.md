# blog

Modern Astro version of the old [Long Haul](https://github.com/brianmaierjr/long-haul) blog template and heavily inspired by [Posthog.com](https://github.com/PostHog/posthog.com/tree/master)

## Write a post

Create a Markdown file in `src/content/blog`.

````md
---
title: "My New Post"
date: 2026-05-14
description: "Short summary shown on the blog index."
---

Write Markdown here.

```python
print("code blocks work")
```
````

````

Use plain `.md` files for the Long Haul-style writing flow. If you need to embed an old notebook or visualization export, use a normal HTML iframe:

```md
---
title: "Notebook post"
date: 2026-05-14
description: "A notebook-backed post."
---

Some Markdown prose.

<figure class="legacy-frame">
  <iframe src="/legacy/QLearningOpenAITaxi.html" title="Q-Learning notebook" loading="lazy"></iframe>
  <figcaption>Legacy interactive/output embed. <a href="/legacy/QLearningOpenAITaxi.html">Open full page</a></figcaption>
</figure>
````

## Run locally

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

Posts build to `/blog/post-slug/`.
