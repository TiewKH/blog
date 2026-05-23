type WindowId = "readme" | "writing" | "article" | "contact";
type RoutedWindowId = Exclude<WindowId, "article">;
type ResizeEdge = "right" | "bottom" | "corner";
type SnapSide = "left" | "right";

interface WindowSnapshot {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

interface WindowGeometry extends WindowSnapshot {
  z: number;
  closed: boolean;
  alignRight?: number;
  alignRightPx?: number;
  centered?: boolean;
  maximized?: boolean;
  needsLayout?: boolean;
  previous?: WindowSnapshot;
}

type WindowState = Record<WindowId, WindowGeometry>;
type WindowUpdate = Partial<WindowGeometry>;
type RouteOptions = {
  updateUrl?: boolean;
};

const windowIds = ["readme", "writing", "article", "contact"] as const;
const isWindowId = (value: string | null | undefined): value is WindowId =>
  windowIds.includes(value as WindowId);
const isResizeEdge = (value: string | undefined): value is ResizeEdge =>
  value === "right" || value === "bottom" || value === "corner";

const workspaceElement = document.querySelector<HTMLElement>(".desktop-grid");
if (!workspaceElement) {
  throw new Error("Desktop workspace not found.");
}
const workspace = workspaceElement;

const windows = [...document.querySelectorAll<HTMLElement>("[data-window-id]")];
const dockButtons = [
  ...document.querySelectorAll<HTMLElement>("[data-open-window]"),
];
const articleContents = [
  ...document.querySelectorAll<HTMLElement>("[data-article-content]"),
];
const articleWindowTitle = document.querySelector<HTMLElement>(
  "[data-article-window-title]",
);
const snapIndicator = document.querySelector<HTMLElement>(
  "[data-snap-indicator]",
);
const storageKey = "tiewosWindowLayout:v7";
const windowStateStorage = window.sessionStorage;
const desktopMedia = window.matchMedia("(min-width: 768px)");
const closeAnimationMs = 180;
const snapThreshold = -50;
const minWindowSize = { width: 320, height: 240 };
const windowRoutes: Record<RoutedWindowId, string> = {
  readme: "/",
  writing: "/blog/",
  contact: "/contact/",
};
const defaultState: WindowState = {
  readme: {
    x: 80,
    y: 42,
    width: 860,
    height: 660,
    z: 4,
    closed: false,
    centered: true,
  },
  writing: {
    x: 0,
    y: 32,
    width: 980,
    height: 660,
    z: 2,
    closed: true,
    alignRightPx: 24,
  },
  article: { x: 118, y: 24, width: 980, height: 720, z: 4, closed: true },
  contact: {
    x: 0,
    y: 96,
    width: 760,
    height: 620,
    z: 1,
    closed: true,
    alignRightPx: 72,
  },
};
const initialParams = new URLSearchParams(window.location.search);
const requestedInitialApp = initialParams.get("app");
const initialApp = isWindowId(requestedInitialApp) ? requestedInitialApp : null;
const initialArticle = initialParams.get("article");
const initialRoute = initialParams.get("route");
let focusedId: WindowId = initialApp ?? "readme";
let activeArticlePath = "";
let windowState = closeArticleWindowWithoutRoute(readState());

function readState(): WindowState {
  try {
    const saved = JSON.parse(
      windowStateStorage.getItem(storageKey) || "{}",
    ) as Partial<Record<WindowId, Partial<WindowGeometry>>>;
    return Object.fromEntries(
      windowIds.map((id) => [
        id,
        {
          ...getDefaultState(id),
          ...(saved[id] || {}),
          needsLayout: !saved[id],
        },
      ]),
    ) as WindowState;
  } catch {
    return Object.fromEntries(
      windowIds.map((id) => [
        id,
        { ...getDefaultState(id), needsLayout: true },
      ]),
    ) as WindowState;
  }
}

function saveState(): void {
  windowStateStorage.setItem(storageKey, JSON.stringify(windowState));
}

function isArticleRoute(path: string): boolean {
  return path.startsWith("/blog/") && path !== "/blog/";
}

function closeArticleWindowWithoutRoute(state: WindowState): WindowState {
  if (
    initialArticle ||
    isArticleRoute(window.location.pathname) ||
    !state.article
  )
    return state;
  state.article = { ...state.article, closed: true, maximized: false };
  return state;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function canUseDesktop(): boolean {
  return document.documentElement.dataset.mode === "os" && desktopMedia.matches;
}

function getWorkspaceSize(): Size {
  return {
    width: workspace.clientWidth,
    height: workspace.clientHeight,
  };
}

function getBounds(width: number, height: number) {
  const desktop = getWorkspaceSize();
  return {
    maxX: Math.max(0, desktop.width - width),
    maxY: Math.max(0, desktop.height - height),
  };
}

function getDefaultState(id: WindowId): WindowGeometry {
  const workspaceRect = workspace.getBoundingClientRect();
  const defaults = { ...defaultState[id] };
  if (defaults.alignRight !== undefined) {
    defaults.x =
      workspaceRect.width -
      defaults.width -
      workspaceRect.width * defaults.alignRight;
  }
  if (defaults.alignRightPx !== undefined) {
    defaults.x = workspaceRect.width - defaults.width - defaults.alignRightPx;
  }
  if (defaults.centered) {
    defaults.x = (workspaceRect.width - defaults.width) / 2;
    defaults.y = (workspaceRect.height - defaults.height) / 2;
  }
  const bounds = getBounds(defaults.width, defaults.height);
  return {
    ...defaults,
    x: clamp(defaults.x, 0, bounds.maxX),
    y: clamp(defaults.y, 0, bounds.maxY),
  };
}

function updateDockState(): void {
  dockButtons.forEach((button) => {
    const id = button.dataset.openWindow;
    if (!isWindowId(id)) return;
    const isOpen = windowState[id] && !windowState[id].closed;
    button.classList.toggle("active", isOpen);
    button.setAttribute("aria-pressed", String(isOpen));
  });
}

function getWindowEntries(): [WindowId, WindowGeometry][] {
  return windowIds.map((id) => [id, windowState[id]]);
}

function normalizeZOrder(nextFocusedId: WindowId = focusedId): void {
  const openStates = getWindowEntries()
    .filter(([, state]) => !state.closed)
    .sort((a, b) => (a[1].z || 0) - (b[1].z || 0));

  openStates.forEach(([id], index) => {
    windowState[id].z = index + 1;
  });

  if (windowState[nextFocusedId] && !windowState[nextFocusedId].closed) {
    const top = Math.max(1, openStates.length);
    getWindowEntries().forEach(([id, state]) => {
      if (
        id === nextFocusedId ||
        state.closed ||
        state.z < windowState[nextFocusedId].z
      )
        return;
      state.z = Math.max(1, state.z - 1);
    });
    windowState[nextFocusedId].z = top;
    focusedId = nextFocusedId;
  }
}

function focusWindow(id: WindowId, options: RouteOptions = {}): void {
  if (!windowState[id] || windowState[id].closed) return;
  normalizeZOrder(id);
  renderWindows();
  saveState();
  routeWindowFocus(id, options);
}

function setWindowGeometry(id: WindowId, updates: WindowUpdate): void {
  const current = windowState[id];
  const width = Math.max(minWindowSize.width, updates.width ?? current.width);
  const height = Math.max(
    minWindowSize.height,
    updates.height ?? current.height,
  );
  const bounds = getBounds(width, height);
  windowState[id] = {
    ...current,
    ...updates,
    width: Math.round(width),
    height: Math.round(height),
    x: Math.round(clamp(updates.x ?? current.x, 0, bounds.maxX)),
    y: Math.round(clamp(updates.y ?? current.y, 0, bounds.maxY)),
  };
}

function maximizeWindow(id: WindowId): void {
  const current = windowState[id];
  if (!current || current.closed) return;

  if (current.maximized) {
    const previous = current.previous || getDefaultState(id);
    setWindowGeometry(id, {
      ...previous,
      previous: undefined,
      maximized: false,
    });
  } else {
    const desktop = getWorkspaceSize();
    windowState[id].previous = {
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
    };
    setWindowGeometry(id, {
      x: 0,
      y: 0,
      width: desktop.width,
      height: desktop.height,
      maximized: true,
    });
  }

  focusWindow(id);
}

function resizeToPostHogDefault(id: WindowId): void {
  const desktop = getWorkspaceSize();
  const width = Math.min(Math.round(window.innerWidth * 0.9), desktop.width);
  const height = Math.min(Math.round(window.innerHeight * 0.9), desktop.height);
  const x = Math.round((desktop.width - width) / 2);
  const y = Math.round((desktop.height - height) / 2);
  setWindowGeometry(id, { x, y, width, height, maximized: false });
  focusWindow(id);
}

function getRouteForWindow(id: WindowId): string {
  if (id === "article") return activeArticlePath;
  return windowRoutes[id];
}

function pushRoute(route: string, options: RouteOptions = {}): void {
  if (
    options.updateUrl === false ||
    !route ||
    window.location.pathname === route
  )
    return;
  history.pushState(null, "", route);
}

function routeWindowFocus(id: WindowId, options: RouteOptions = {}): void {
  pushRoute(getRouteForWindow(id), options);
}

function closeWindow(id: WindowId, options: RouteOptions = {}): void {
  const win = document.querySelector(`[data-window-id="${id}"]`);
  if (!win || !windowState[id]) return;
  win.classList.add("is-closing");
  window.setTimeout(() => {
    windowState[id].closed = true;
    windowState[id].maximized = false;
    const nextOpen = getWindowEntries()
      .filter(([windowId, state]) => windowId !== id && !state.closed)
      .sort((a, b) => (b[1].z || 0) - (a[1].z || 0))[0];
    if (nextOpen) focusedId = nextOpen[0];
    renderWindows();
    saveState();
    const route = getRouteForWindow(id);
    if (
      id === "article" &&
      options.updateUrl !== false &&
      window.location.pathname.startsWith("/blog/")
    ) {
      history.pushState(null, "", "/");
    } else if (
      route &&
      route !== "/" &&
      options.updateUrl !== false &&
      window.location.pathname === route
    ) {
      history.pushState(null, "", "/");
    }
  }, closeAnimationMs);
}

function openWindow(id: WindowId, options: RouteOptions = {}): void {
  if (!windowState[id]) return;
  if (windowState[id].closed) {
    const defaults = getDefaultState(id);
    windowState[id] = {
      ...defaults,
      previous: windowState[id].previous,
      closed: false,
    };
  }
  focusWindow(id, options);
}

function openRoutedWindow(
  id: string | null | undefined,
  options: RouteOptions = {},
): void {
  if (!isWindowId(id)) return;
  openWindow(id, options);
}

function openInitialApp(): void {
  if (initialArticle) {
    openWindow("writing", { updateUrl: false });
    openArticleWindow(initialArticle, { updateUrl: false });
  } else if (initialApp) {
    openWindow(initialApp, { updateUrl: false });
  } else {
    syncWindowForPath(window.location.pathname);
    return;
  }
  history.replaceState(null, "", initialRoute || window.location.pathname);
}

function normalizeArticleHref(href: string): string {
  return new URL(href, window.location.origin).pathname;
}

function setActiveArticle(href: string): boolean {
  const articlePath = normalizeArticleHref(href);
  let activeTitle = "Article.md";
  let matched = false;
  articleContents.forEach((article) => {
    const isActive =
      normalizeArticleHref(article.dataset.articleContent ?? "") ===
      articlePath;
    article.hidden = !isActive;
    if (isActive) {
      matched = true;
      activeArticlePath = articlePath;
      activeTitle = `${article.querySelector("h1")?.textContent?.trim() || "Article"}.md`;
      document.querySelector(".article-window-body")?.scrollTo?.(0, 0);
    }
  });
  if (articleWindowTitle) articleWindowTitle.textContent = activeTitle;
  return matched;
}

function openArticleWindow(href: string, options: RouteOptions = {}): void {
  if (!setActiveArticle(href)) {
    window.location.href = href;
    return;
  }
  openWindow("article");
  const articlePath = normalizeArticleHref(href);
  if (options.updateUrl !== false && window.location.pathname !== articlePath) {
    history.pushState(null, "", articlePath);
  }
}

function syncWindowForPath(path: string): void {
  if (path.startsWith("/blog/") && path !== "/blog/") {
    openWindow("writing", { updateUrl: false });
    openArticleWindow(path, { updateUrl: false });
    return;
  }

  if (path === "/blog" || path === "/blog/" || path.startsWith("/archive/")) {
    openWindow("writing", { updateUrl: false });
    return;
  }

  if (path.startsWith("/contact/")) {
    openWindow("contact", { updateUrl: false });
    return;
  }

  openWindow("readme", { updateUrl: false });
}

function snapWindow(id: WindowId, side: SnapSide): void {
  if (!windowState[id] || windowState[id].closed) return;
  const desktop = getWorkspaceSize();
  const width = Math.round(desktop.width / 2);
  windowState[id].previous = {
    x: windowState[id].x,
    y: windowState[id].y,
    width: windowState[id].width,
    height: windowState[id].height,
  };
  setWindowGeometry(id, {
    x: side === "left" ? 0 : width,
    y: 0,
    width,
    height: desktop.height,
    maximized: false,
  });
  focusWindow(id);
}

function renderSnapIndicator(side: SnapSide | null): void {
  if (!snapIndicator) return;
  if (!side) {
    snapIndicator.hidden = true;
    snapIndicator.dataset.side = "";
    return;
  }
  snapIndicator.hidden = false;
  snapIndicator.dataset.side = side;
}

function applyResponsiveWindowState(win: HTMLElement, width: number): void {
  win.classList.toggle("is-narrow", width < 700);
}

function renderWindows(): void {
  if (!canUseDesktop()) {
    windows.forEach((win) => {
      win.hidden = false;
      win.classList.remove(
        "is-positioned",
        "is-focused",
        "is-dragging",
        "is-closing",
        "is-maximized",
      );
      win.classList.remove("is-narrow");
      win.style.left = "";
      win.style.top = "";
      win.style.width = "";
      win.style.height = "";
      win.style.zIndex = "";
      win.style.right = "";
      win.style.marginTop = "";
    });
    renderSnapIndicator(null);
    updateDockState();
    return;
  }

  windows.forEach((win) => {
    const id = win.dataset.windowId;
    if (!isWindowId(id)) return;
    const state = windowState[id]?.needsLayout
      ? { ...getDefaultState(id), closed: windowState[id].closed }
      : windowState[id] || getDefaultState(id);
    const height = Math.min(state.height, getWorkspaceSize().height);
    const width = Math.min(state.width, getWorkspaceSize().width);
    const bounds = getBounds(width, height);
    const x = clamp(state.x, 0, bounds.maxX);
    const y = clamp(state.y, 0, bounds.maxY);

    win.hidden = Boolean(state.closed);
    win.classList.toggle("is-focused", id === focusedId && !state.closed);
    win.classList.toggle("is-maximized", Boolean(state.maximized));
    applyResponsiveWindowState(win, width);
    win.classList.remove("is-closing");
    win.style.left = `${Math.round(x)}px`;
    win.style.top = `${Math.round(y)}px`;
    win.style.width = `${Math.round(width)}px`;
    win.style.height = `${Math.round(height)}px`;
    win.style.right = "auto";
    win.style.marginTop = "0";
    win.style.zIndex = String(20 + (state.z || 1));
    win.classList.add("is-positioned");

    windowState[id] = {
      ...state,
      needsLayout: false,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    };
    const maximizeButton = win.querySelector('[data-window-action="maximize"]');
    if (maximizeButton) {
      maximizeButton.setAttribute(
        "aria-label",
        state.maximized
          ? `Restore ${win.querySelector(".window-bar strong")?.textContent}`
          : `Maximize ${win.querySelector(".window-bar strong")?.textContent}`,
      );
      maximizeButton.textContent = state.maximized ? "⧉" : "□";
    }
  });
  updateDockState();
}

function startWindowResize(
  win: HTMLElement,
  id: WindowId,
  edge: ResizeEdge,
  event: PointerEvent,
): void {
  if (
    !canUseDesktop() ||
    event.button !== 0 ||
    !windowState[id] ||
    windowState[id].closed
  )
    return;
  const start = { ...windowState[id] };
  const workspaceRect = workspace.getBoundingClientRect();
  const handle = event.currentTarget;
  if (!(handle instanceof HTMLElement)) return;
  let nextGeometry: WindowUpdate = { ...start };
  let animationFrame = 0;
  focusWindow(id);
  win.classList.add("is-resizing");
  document.body.dataset.windowInteraction = "resize";
  handle.setPointerCapture?.(event.pointerId);

  const paint = () => {
    animationFrame = 0;
    setWindowGeometry(id, nextGeometry);
    const state = windowState[id];
    applyResponsiveWindowState(win, state.width);
    win.style.left = `${state.x}px`;
    win.style.top = `${state.y}px`;
    win.style.width = `${state.width}px`;
    win.style.height = `${state.height}px`;
  };

  const schedulePaint = () => {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(paint);
  };

  const move = (moveEvent: PointerEvent) => {
    const deltaX = moveEvent.clientX - event.clientX;
    const deltaY = moveEvent.clientY - event.clientY;
    const updates: WindowUpdate = { maximized: false };

    if (edge === "right" || edge === "corner") {
      updates.width = clamp(
        start.width + deltaX,
        minWindowSize.width,
        workspaceRect.width - start.x,
      );
    }

    if (edge === "bottom" || edge === "corner") {
      updates.height = clamp(
        start.height + deltaY,
        minWindowSize.height,
        workspaceRect.height - start.y,
      );
    }

    nextGeometry = { ...start, ...updates };
    schedulePaint();
  };

  const end = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      paint();
    }
    win.classList.remove("is-resizing");
    delete document.body.dataset.windowInteraction;
    handle.releasePointerCapture?.(event.pointerId);
    renderWindows();
    saveState();
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", end);
    document.removeEventListener("pointercancel", end);
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", end);
  document.addEventListener("pointercancel", end);
}

function installResizeBehavior(win: HTMLElement, id: WindowId): void {
  win
    .querySelectorAll<HTMLElement>("[data-window-resize]")
    .forEach((handle) => {
      handle.addEventListener("pointerdown", (event: PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isResizeEdge(handle.dataset.windowResize)) return;
        startWindowResize(win, id, handle.dataset.windowResize, event);
      });
    });
}

function installWindowBehavior(win: HTMLElement): void {
  const id = win.dataset.windowId;
  if (!isWindowId(id)) return;
  const handle = win.querySelector<HTMLElement>(".window-bar");
  if (!handle) return;

  win.addEventListener("pointerdown", () => focusWindow(id));
  handle.addEventListener("dblclick", () => {
    resizeToPostHogDefault(id);
    saveState();
  });

  handle.addEventListener("pointerdown", (event: PointerEvent) => {
    if (!canUseDesktop() || event.button !== 0 || windowState[id]?.maximized)
      return;
    if (
      event.target instanceof Element &&
      event.target.closest("a, button, input, textarea, select")
    )
      return;

    const workspaceRect = workspace.getBoundingClientRect();
    const winRect = win.getBoundingClientRect();
    const offsetX = event.clientX - winRect.left;
    const offsetY = event.clientY - winRect.top;
    let pendingSnap: SnapSide | null = null;
    let nextGeometry: WindowUpdate = { ...windowState[id] };
    let animationFrame = 0;
    focusWindow(id);
    win.classList.add("is-dragging");
    document.body.dataset.windowInteraction = "drag";
    handle.setPointerCapture?.(event.pointerId);

    const paint = () => {
      animationFrame = 0;
      setWindowGeometry(id, nextGeometry);
      const state = windowState[id];
      applyResponsiveWindowState(win, state.width);
      win.style.left = `${state.x}px`;
      win.style.top = `${state.y}px`;
    };

    const schedulePaint = () => {
      if (animationFrame) return;
      animationFrame = requestAnimationFrame(paint);
    };

    const move = (moveEvent: PointerEvent) => {
      const nextX = moveEvent.clientX - workspaceRect.left - offsetX;
      const nextY = moveEvent.clientY - workspaceRect.top - offsetY;
      const rightOverflow =
        nextX + windowState[id].width - workspace.clientWidth;
      pendingSnap =
        nextX < snapThreshold
          ? "left"
          : rightOverflow > Math.abs(snapThreshold)
            ? "right"
            : null;
      renderSnapIndicator(pendingSnap);
      nextGeometry = { ...windowState[id], x: nextX, y: nextY };
      schedulePaint();
    };

    const end = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        paint();
      }
      win.classList.remove("is-dragging");
      if (pendingSnap) snapWindow(id, pendingSnap);
      renderSnapIndicator(null);
      delete document.body.dataset.windowInteraction;
      handle.releasePointerCapture?.(event.pointerId);
      renderWindows();
      saveState();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
  });

  win
    .querySelector('[data-window-action="maximize"]')
    ?.addEventListener("click", () => {
      maximizeWindow(id);
      saveState();
    });

  win
    .querySelector('[data-window-action="close"]')
    ?.addEventListener("click", () => closeWindow(id));
  installResizeBehavior(win, id);
}

dockButtons.forEach((button) => {
  button.addEventListener("click", () =>
    openRoutedWindow(button.dataset.openWindow),
  );
});

document.addEventListener("click", (event) => {
  const link =
    event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>('a[href^="/blog/"]')
      : null;
  if (!link || !canUseDesktop()) return;
  const articlePath = new URL(link.href).pathname;
  if (articlePath === "/blog/" || articlePath === "/blog") return;
  event.preventDefault();
  openArticleWindow(articlePath);
});

window.addEventListener("popstate", () => {
  const path = window.location.pathname;
  if (!path.startsWith("/blog/") && !windowState.article.closed) {
    closeWindow("article", { updateUrl: false });
  }
  syncWindowForPath(path);
});

windows.forEach(installWindowBehavior);
window.addEventListener("resize", () => {
  renderWindows();
  saveState();
});
document.querySelectorAll("[data-mode-choice]").forEach((button) => {
  button.addEventListener("click", () => requestAnimationFrame(renderWindows));
});
document.addEventListener("keydown", (event) => {
  if (
    !canUseDesktop() ||
    !event.shiftKey ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  )
    return;
  if (!focusedId || windowState[focusedId]?.closed) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    snapWindow(focusedId, "left");
    saveState();
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    snapWindow(focusedId, "right");
    saveState();
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    maximizeWindow(focusedId);
    saveState();
  }
  if (event.key.toLowerCase() === "w") {
    event.preventDefault();
    closeWindow(focusedId);
  }
});
normalizeZOrder(focusedId);
renderWindows();
openInitialApp();
