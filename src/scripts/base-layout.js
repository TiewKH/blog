const BOOT_SPLASH_STORAGE_KEY = "tiewosBootSplashShown:v1";
const MODE_PREFERENCE_KEY = "siteModePreference:v2";
const OS_MEDIA_QUERY = "(min-width: 768px)";
const LEGACY_FRAME_MIN_HEIGHT = 760;

const root = document.documentElement;

function normalizeMode(mode) {
  if (mode === "workbench") return "os";
  if (mode === "reader") return "website";
  return mode === "os" ? "os" : "website";
}

function getOsAppForPath(path) {
  if (path.startsWith("/about/")) return "readme";
  if (path.startsWith("/blog/") && path !== "/blog/") {
    return `writing&article=${encodeURIComponent(path)}&route=${encodeURIComponent(path)}`;
  }
  if (path === "/blog" || path === "/blog/" || path.startsWith("/archive/")) {
    return `writing&route=${encodeURIComponent(path)}`;
  }
  if (path.startsWith("/contact/")) return `contact&route=${encodeURIComponent(path)}`;
  return "";
}

function applyExternalLinkTargets() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const url = new URL(href, window.location.href);
    if (!["http:", "https:"].includes(url.protocol) || url.origin === window.location.origin) return;

    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function resizeLegacyFrame(iframe) {
  try {
    const frameDocument = iframe.contentDocument;
    if (!frameDocument) return;

    const { body, documentElement } = frameDocument;
    const height = Math.max(
      body?.scrollHeight || 0,
      body?.offsetHeight || 0,
      documentElement?.scrollHeight || 0,
      documentElement?.offsetHeight || 0,
      LEGACY_FRAME_MIN_HEIGHT
    );

    iframe.style.height = `${height}px`;
    iframe.scrolling = "no";
  } catch {
    iframe.style.height = iframe.style.height || `${LEGACY_FRAME_MIN_HEIGHT}px`;
  }
}

function applyLegacyFrameSizing() {
  document.querySelectorAll(".legacy-frame iframe").forEach((iframe) => {
    const resize = () => {
      resizeLegacyFrame(iframe);
      window.setTimeout(() => resizeLegacyFrame(iframe), 250);
      window.setTimeout(() => resizeLegacyFrame(iframe), 1000);
    };

    if (!iframe.dataset.legacyFrameSizing) {
      iframe.dataset.legacyFrameSizing = "true";
      iframe.addEventListener("load", resize);
    }

    resize();
  });
}

function getPreferredMode() {
  try {
    return normalizeMode(window.sessionStorage.getItem(MODE_PREFERENCE_KEY) || "os");
  } catch {
    return "os";
  }
}

function rememberModePreference(mode) {
  try {
    window.sessionStorage.setItem(MODE_PREFERENCE_KEY, normalizeMode(mode));
  } catch {
    // Storage can be unavailable in hardened browsing contexts.
  }
}

function applyMode(mode) {
  const requestedMode = normalizeMode(mode);
  const isOsAvailable = window.matchMedia(OS_MEDIA_QUERY).matches;
  const nextMode = isOsAvailable && requestedMode === "os" ? "os" : "website";
  const path = window.location.pathname;

  root.dataset.osAvailable = isOsAvailable ? "true" : "false";

  if (nextMode === "website" && document.body?.classList.contains("home-page") && path !== "/") {
    window.location.assign(path);
    return;
  }

  if (nextMode === "os" && path !== "/") {
    const app = getOsAppForPath(path);
    if (app) {
      window.location.replace(`/?app=${app}`);
      return;
    }
  }

  root.dataset.mode = nextMode;
}

function finishBootSplash() {
  const bootSplash = document.querySelector("[data-boot-splash]");
  if (!bootSplash || !root.dataset.bootSplash) return;

  const randomizedDuration = Number(window.__tiewosBootDurationMs);
  const duration = root.dataset.bootSplash === "reduced"
    ? 450
    : Math.min(2000, Math.max(1000, Number.isFinite(randomizedDuration) ? randomizedDuration : 2000));

  window.setTimeout(() => {
    bootSplash.classList.add("is-complete");
    try {
      window.sessionStorage.setItem(BOOT_SPLASH_STORAGE_KEY, "true");
    } catch {
      // Storage can be unavailable in hardened browsing contexts.
    }

    window.setTimeout(() => {
      delete root.dataset.bootSplash;
    }, root.dataset.bootSplash === "reduced" ? 80 : 260);
  }, duration);
}

function installModeToggleHandlers() {
  document.querySelectorAll("[data-mode-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedMode = button.getAttribute("data-mode-choice");
      rememberModePreference(selectedMode);
      applyMode(selectedMode);
    });
  });
}

applyMode(getPreferredMode());

window.addEventListener("resize", () => {
  applyMode(getPreferredMode());
  applyLegacyFrameSizing();
});

window.addEventListener("DOMContentLoaded", () => {
  applyExternalLinkTargets();
  applyLegacyFrameSizing();
  finishBootSplash();
  installModeToggleHandlers();
});
