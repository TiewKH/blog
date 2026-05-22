import { getCollection } from "astro:content";

export function slugFromId(id: string) {
  return id
    .replace(/\.(md|mdx)$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function readingTime(words: number) {
  return Math.max(1, Math.ceil(words / 180));
}

export async function getPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function getPostHref(id: string) {
  return `/blog/${slugFromId(id)}/`;
}
