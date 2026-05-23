import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LOCAL_IFRAME_SRC = /<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
const PUBLIC_ROOT = join(process.cwd(), "public");

export function countWords(text) {
  return textToPlainText(text).split(/\s+/).filter(Boolean).length;
}

export function articleWordCount(post) {
  return countWords([
    post.data.title,
    post.data.description,
    post.body,
    localIframeText(post.body)
  ].filter(Boolean).join(" "));
}

export function readingTime(words) {
  return Math.max(1, Math.ceil(words / 180));
}

function localIframeText(markup) {
  const iframeTexts = [];

  for (const match of String(markup ?? "").matchAll(LOCAL_IFRAME_SRC)) {
    const src = match[1];
    if (!src.startsWith("/legacy/") || !src.endsWith(".html")) continue;

    const filePath = join(PUBLIC_ROOT, src);
    if (!existsSync(filePath)) continue;

    iframeTexts.push(readFileSync(filePath, "utf8"));
  }

  return iframeTexts.join(" ");
}

function textToPlainText(input) {
  return String(input ?? "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}
