import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const index = readFileSync(join(root, "src/pages/index.astro"), "utf8");
const blogIndex = readFileSync(join(root, "src/pages/blog/index.astro"), "utf8");
const bootSplash = readFileSync(join(root, "src/components/BootSplash.astro"), "utf8");
const companyIcon = readFileSync(join(root, "src/components/CompanyIcon.astro"), "utf8");
const experienceSection = readFileSync(join(root, "src/components/ExperienceSection.astro"), "utf8");
const profileIntro = readFileSync(join(root, "src/components/ProfileIntro.astro"), "utf8");
const profilePanels = readFileSync(join(root, "src/components/ProfilePanels.astro"), "utf8");
const socialIcon = readFileSync(join(root, "src/components/SocialIcon.astro"), "utf8");
const writingBrowser = readFileSync(join(root, "src/components/WritingBrowser.astro"), "utf8");
const writingSection = readFileSync(join(root, "src/components/WritingSection.astro"), "utf8");
const baseLayoutScript = readFileSync(join(root, "src/scripts/base-layout.js"), "utf8");
const css = readFileSync(join(root, "src/styles/global.css"), "utf8");
const layout = readFileSync(join(root, "src/layouts/BaseLayout.astro"), "utf8");
const manifest = readFileSync(join(root, "public/assets/img/favicon_io/site.webmanifest"), "utf8");
const persistentStorageToken = "local" + "Storage";

const checks = [
  {
    name: "desktop windows expose resize handles",
    pass:
      index.includes('data-window-resize="right"') &&
      index.includes('data-window-resize="bottom"') &&
      index.includes('data-window-resize="corner"')
  },
  {
    name: "resize behavior updates geometry through document-level pointer tracking",
    pass:
      index.includes("installResizeBehavior") &&
      index.includes("startWindowResize") &&
      index.includes('document.addEventListener("pointermove", move)') &&
      index.includes("requestAnimationFrame")
  },
  {
    name: "window controls include maximize and close only",
    pass:
      !index.includes('data-window-action="minimize"') &&
      !index.includes("function minimizeWindow") &&
      !index.includes("is-minimized") &&
      index.includes('data-window-action="maximize"') &&
      index.includes('data-window-action="close"')
  },
  {
    name: "maximized OS windows fill the desktop viewport below the menubar",
    pass:
      css.includes('html[data-mode="os"] body.home-page') &&
      css.includes("overflow: hidden") &&
      css.includes("height: calc(100vh - 48px)") &&
      index.includes("width: desktop.width") &&
      index.includes("height: desktop.height")
  },
  {
    name: "OS menubar explicitly spans the viewport width",
    pass:
      css.includes("inline-size: 100vw") &&
      css.includes("margin-left: calc(50% - 50vw)") &&
      css.includes("margin-right: calc(50% - 50vw)") &&
      css.includes("max-width: none")
  },
  {
    name: "external desktop links are visually distinct",
    pass:
      index.includes('data-link-kind="external"') &&
      css.includes(".desktop-icon.external-link") &&
      css.includes(".external-indicator")
  },
  {
    name: "OS article clicks open a managed route-backed desktop article window",
    pass:
      index.includes('data-window-id="article"') &&
      index.includes("data-article-content") &&
      index.includes("function openArticleWindow") &&
      index.includes('const articlePath = new URL(link.href).pathname') &&
      index.includes('history.pushState(null, "", articlePath)') &&
      index.includes('openWindow("article")') &&
      !layout.includes("data-os-subpage-window={!isHome ? \"true\" : undefined}")
  },
  {
    name: "Writing.app uses the same browser UI as the blog page",
    pass:
      index.includes('import WritingSection from "../components/WritingSection.astro"') &&
      blogIndex.includes('import WritingSection from "../../components/WritingSection.astro"') &&
      index.includes('<WritingSection posts={posts} headingClass="window-writing-heading" />') &&
      blogIndex.includes("<WritingSection posts={posts} />") &&
      writingSection.includes('import WritingBrowser from "./WritingBrowser.astro"') &&
      writingSection.includes("<WritingBrowser posts={posts} />") &&
      writingBrowser.includes('class="writing-browser"')
  },
  {
    name: "Writing.app has no full-open escape link",
    pass:
      !index.includes("Open full Writing.app") &&
      !index.includes("app-window-link") &&
      !index.includes("data-open-full-window") &&
      index.includes('const storageKey = "tiewosWindowLayout:v7"')
  },
  {
    name: "OS window layout state is tab-scoped",
    pass:
      index.includes("const windowStateStorage = window.sessionStorage") &&
      index.includes("windowStateStorage.getItem(storageKey)") &&
      index.includes("windowStateStorage.setItem(storageKey, JSON.stringify(windowState))") &&
      !index.includes('window.addEventListener("storage"')
  },
  {
    name: "external links open in a new tab globally",
    pass:
      layout.includes('import "../scripts/base-layout.js"') &&
      baseLayoutScript.includes("function applyExternalLinkTargets") &&
      baseLayoutScript.includes('document.querySelectorAll("a[href]")') &&
      baseLayoutScript.includes('link.target = "_blank"') &&
      baseLayoutScript.includes('link.rel = "noopener noreferrer"') &&
      baseLayoutScript.includes("url.origin === window.location.origin")
  },
  {
    name: "mode toggle order is stable across website and OS headers",
    pass:
      /data-mode-choice="website"[\s\S]*data-mode-choice="os"/.test(index) &&
      /data-mode-choice="website"[\s\S]*data-mode-choice="os"/.test(layout) &&
      !/data-mode-choice="os"[\s\S]{0,180}data-mode-choice="website"/.test(index) &&
      !/data-mode-choice="os"[\s\S]{0,180}data-mode-choice="website"/.test(layout)
  },
  {
    name: "desktop visitors default to OS mode unless they explicitly choose another mode",
    pass:
      baseLayoutScript.includes('const MODE_PREFERENCE_KEY = "siteModePreference:v2"') &&
      baseLayoutScript.includes('window.sessionStorage.getItem(MODE_PREFERENCE_KEY) || "os"') &&
      baseLayoutScript.includes("applyMode(getPreferredMode())") &&
      baseLayoutScript.includes("rememberModePreference(selectedMode)") &&
      !layout.includes(persistentStorageToken) &&
      !baseLayoutScript.includes(persistentStorageToken)
  },
  {
    name: "mobile view disables OS mode and stays in website mode",
    pass:
      baseLayoutScript.includes('const nextMode = isOsAvailable && requestedMode === "os" ? "os" : "website"') &&
      baseLayoutScript.includes('const MODE_PREFERENCE_KEY = "siteModePreference:v2"') &&
      baseLayoutScript.includes('window.sessionStorage.getItem(MODE_PREFERENCE_KEY) || "os"') &&
      baseLayoutScript.includes("window.sessionStorage.setItem(MODE_PREFERENCE_KEY, normalizeMode(mode))") &&
      css.includes('@media (max-width: 767px)') &&
      css.includes('.mode-toggle {\n    display: none;') &&
      css.includes('html[data-mode="os"] .os-home {\n    display: none;') &&
      css.includes('html[data-mode="os"] .website-home {\n    display: revert;')
  },
  {
    name: "mobile header exposes primary navigation",
    pass:
      css.includes(".site-header nav {\n    display: flex;") &&
      css.includes("grid-column: 1 / -1;") &&
      css.includes("order: 3;") &&
      css.includes(".site-header nav a {\n    flex: 1 1 0;") &&
      !css.includes(".brand small,\n  .site-header nav")
  },
  {
    name: "website and OS top bars use matching desktop sizing",
    pass:
      css.includes("--topbar-height: 48px") &&
      css.includes("--text-ui: 0.95rem") &&
      css.includes("height: var(--topbar-height)") &&
      css.includes(".os-menubar") &&
      css.includes("font-size: var(--text-ui)") &&
      css.includes("bottom: 0")
  },
  {
    name: "OS navigation targets desktop apps instead of standalone pages",
    pass:
      layout.includes('href="/blog/" data-os-app-link="writing"') &&
      layout.includes('href="/" data-os-app-link="readme"') &&
      layout.includes('href="/contact/" data-os-app-link="contact"') &&
      index.includes('data-open-window="contact"') &&
      index.includes('data-window-id="contact"') &&
      index.includes("function openInitialApp")
  },
  {
    name: "OS README, Writing, and Contact windows are URL-backed",
    pass:
      index.includes('readme: "/"') &&
      index.includes('writing: "/blog/"') &&
      index.includes('contact: "/contact/"') &&
      index.includes("function openRoutedWindow") &&
      index.includes("function routeWindowFocus") &&
      index.includes('history.pushState(null, "", route)') &&
      index.includes('syncWindowForPath(path)') &&
      baseLayoutScript.includes('`writing&route=${encodeURIComponent(path)}`') &&
      baseLayoutScript.includes('`contact&route=${encodeURIComponent(path)}`')
  },
  {
    name: "clicking an existing OS window updates the URL to that focused window",
    pass:
      index.includes("function routeWindowFocus(id, options = {})") &&
      index.includes("focusWindow(id, options = {})") &&
      index.includes("routeWindowFocus(id, options)") &&
      index.includes('win.addEventListener("pointerdown", () => focusWindow(id))') &&
      index.includes('if (id === "article") return activeArticlePath')
  },
  {
    name: "Website-to-OS toggle redirects subpages into route-backed landing desktop apps",
    pass:
      baseLayoutScript.includes("function getOsAppForPath") &&
      baseLayoutScript.includes('path.startsWith("/about/")') &&
      baseLayoutScript.includes('path.startsWith("/blog/") && path !== "/blog/"') &&
      baseLayoutScript.includes('`writing&article=${encodeURIComponent(path)}&route=${encodeURIComponent(path)}`') &&
      baseLayoutScript.includes('path === "/blog" || path === "/blog/" || path.startsWith("/archive/")') &&
      baseLayoutScript.includes('`writing&route=${encodeURIComponent(path)}`') &&
      baseLayoutScript.includes('path.startsWith("/contact/")') &&
      baseLayoutScript.includes('`contact&route=${encodeURIComponent(path)}`') &&
      baseLayoutScript.includes("window.location.replace(`/?app=${app}`)") &&
      baseLayoutScript.includes('nextMode === "os" && path !== "/"') &&
      baseLayoutScript.includes('window.location.assign(path)')
  },
  {
    name: "OS mode sends direct article URLs to the desktop article window",
    pass:
      !baseLayoutScript.includes('path.startsWith("/blog/") || path.startsWith("/archive/") ? "writing"') &&
      baseLayoutScript.includes('path.startsWith("/blog/") && path !== "/blog/"') &&
      baseLayoutScript.includes('`writing&article=${encodeURIComponent(path)}&route=${encodeURIComponent(path)}`') &&
      index.includes('const initialRoute = initialParams.get("route")')
  },
  {
    name: "plain OS landing closes stale article windows restored from another tab",
    pass:
      index.includes("function closeArticleWindowWithoutRoute") &&
      index.includes("windowState = closeArticleWindowWithoutRoute(readState())") &&
      index.includes("state.article = { ...state.article, closed: true, maximized: false }") &&
      index.includes("isArticleRoute(window.location.pathname)")
  },
  {
    name: "website navigation tabs are About, Writings, Contact",
    pass:
      layout.includes('const navItems = [\n  { href: "/", label: "About" },\n  { href: "/blog/", label: "Writings" },\n  { href: "/contact/", label: "Contact" }\n];')
  },
  {
    name: "first landing view opens About in website and OS modes",
    pass:
      index.includes('let focusedId = defaultState[initialApp] ? initialApp : "readme"') &&
      index.includes('<ProfileIntro variant="website" />') &&
      profileIntro.includes('class="page-heading home-about website-home"') &&
      index.includes("centered: true") &&
      index.includes('data-window-id="readme"')
  },
  {
    name: "Contact.app stacks form below copy in narrow OS windows",
    pass:
      css.includes(".contact-window.is-narrow .contact-window-layout") &&
      css.includes("@container contact-window") &&
      css.includes("grid-template-columns: 1fr") &&
      index.includes('win.classList.toggle("is-narrow"') &&
      index.includes("applyResponsiveWindowState(win, state.width)")
  },
  {
    name: "footer is completely hidden in OS mode",
    pass:
      css.includes('html[data-mode="os"] .site-footer') &&
      css.includes('html[data-mode="os"] body > footer.site-footer') &&
      css.includes("display: none !important")
  },
  {
    name: "OS menubars use the provided logo instead of TiewOS text",
    pass:
      index.includes('class="os-brand-logo"') &&
      layout.includes('class="os-brand-logo"') &&
      index.includes('src="/assets/img/logo.png"') &&
      layout.includes('src="/assets/img/logo.png"') &&
      layout.includes('class="brand-mark"') &&
      css.includes(".brand-mark img") &&
      !index.includes("<strong>TiewOS</strong>") &&
      !layout.includes("<strong>TiewOS</strong>")
  },
  {
    name: "OS boot splash uses the provided logo and session-scoped two-second loading sequence",
    pass:
      layout.includes('import BootSplash from "../components/BootSplash.astro"') &&
      layout.includes("<BootSplash />") &&
      bootSplash.includes('class="boot-splash"') &&
      bootSplash.includes('data-boot-splash') &&
      bootSplash.includes('src="/assets/img/logo.png"') &&
      bootSplash.includes("const buildDate = new Date()") &&
      bootSplash.includes("const buildVersion = `v${buildDate.getFullYear()}.${pad(buildDate.getMonth() + 1)}.${pad(buildDate.getDate())}`") &&
      bootSplash.includes("version: {buildVersion}") &&
      !bootSplash.includes("data-boot-version") &&
      layout.includes('const key = "tiewosBootSplashShown:v1"') &&
      baseLayoutScript.includes('const BOOT_SPLASH_STORAGE_KEY = "tiewosBootSplashShown:v1"') &&
      baseLayoutScript.includes("const randomizedDuration = Number(window.__tiewosBootDurationMs)") &&
      baseLayoutScript.includes('const duration = root.dataset.bootSplash === "reduced"') &&
      baseLayoutScript.includes(": Math.min(2000") &&
      bootSplash.includes("Math.round(1350 + Math.random() * 650)") &&
      bootSplash.includes("window.__tiewosBootDurationMs = duration") &&
      bootSplash.includes("--boot-progress-mid-a") &&
      bootSplash.includes("--boot-progress-mid-b") &&
      bootSplash.includes('class="boot-ring"') &&
      !bootSplash.includes('class="boot-meter"') &&
      css.includes("@property --boot-progress") &&
      css.includes("animation: boot-ring-progress var(--boot-duration, 2s)") &&
      css.includes("@keyframes boot-ring-progress") &&
      !css.includes(".boot-meter") &&
      css.includes('html[data-boot-splash] .boot-splash')
  },
  {
    name: "OS top bars do not include social icons or search",
    pass:
      !index.includes('class="os-social-links"') &&
      !layout.includes('class="os-social-links"') &&
      !index.includes('class="os-search"') &&
      !layout.includes('class="os-search"')
  },
  {
    name: "desktop GitHub and LinkedIn shortcuts render social icons",
    pass:
      index.includes('<SocialIcon icon="github" />') &&
      index.includes('<SocialIcon icon="linkedin" />') &&
      layout.includes('<SocialIcon icon="github" />') &&
      layout.includes('<SocialIcon icon="linkedin" />') &&
      css.includes(".icon-file.social svg")
  },
  {
    name: "Contact.app close button uses a plain X glyph",
    pass:
      index.includes('aria-label="Close Contact.app">X</button>') &&
      !index.includes('aria-label="Close Contact.app">Ãƒâ€”</button>')
  },
  {
    name: "experience rows render company icons",
    pass:
      experienceSection.includes("CompanyIcon") &&
      companyIcon.includes("company-icon") &&
      companyIcon.includes("<img") &&
      companyIcon.includes("open_government_products_logo.jpg") &&
      companyIcon.includes("shopback_logo.jpg") &&
      companyIcon.includes("moneylion_logo.jpg") &&
      companyIcon.includes("airasia_logo.jpg") &&
      companyIcon.includes("ifast_logo.jpg") &&
      experienceSection.includes("item.icon") &&
      css.includes(".company-icon")
  },
  {
    name: "README window mirrors website index content",
    pass:
      index.includes('<ProfilePanels className="readme-profile-grid" />') &&
      index.includes('<ProfilePanels className="profile-grid website-home" />') &&
      index.includes('<ExperienceSection className="readme-experience-section" titleId="readme-experience-title" />') &&
      index.includes('<ExperienceSection className="experience-section website-home" titleId="experience-title" />') &&
      profilePanels.includes("profile.stackGroups.map") &&
      experienceSection.includes("experience.map")
  },
  {
    name: "favicon bundle is fully referenced",
    pass:
      layout.includes('/assets/img/favicon_io/favicon.ico') &&
      layout.includes('/assets/img/favicon_io/favicon-32x32.png') &&
      layout.includes('/assets/img/favicon_io/favicon-16x16.png') &&
      layout.includes('/assets/img/favicon_io/apple-touch-icon.png') &&
      layout.includes('/assets/img/favicon_io/site.webmanifest') &&
      manifest.includes('/android-chrome-192x192.png') &&
      manifest.includes('/android-chrome-512x512.png')
  },
  {
    name: "shared social icon component backs OS desktop icons",
    pass:
      socialIcon.includes('icon === "github"') &&
      socialIcon.includes('viewBox="0 0 24 24"') &&
      layout.includes("<SocialIcon") &&
      index.includes("<SocialIcon")
  }
];

const failed = checks.filter((check) => !check.pass);

if (failed.length) {
  console.error("OS window behavior verification failed:");
  for (const check of failed) {
    console.error(`- ${check.name}`);
  }
  process.exit(1);
}

console.log(`OS window behavior verification passed (${checks.length} checks).`);
