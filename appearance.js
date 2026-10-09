// Appearance switch.
// The page follows the system setting until the reader taps the switch.
// Choosing the same appearance as the system clears the override, so the
// page goes back to following the system on its own.

const STORAGE_KEY = "appearance";
const root = document.documentElement;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const button = document.querySelector(".appearance");

const systemAppearance = () => (systemDark.matches ? "dark" : "light");
const currentAppearance = () => root.dataset.appearance ?? systemAppearance();

function save(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private browsing); the switch still works for this visit.
  }
}

function updateLabel() {
  const next = currentAppearance() === "dark" ? "light" : "dark";
  button.setAttribute("aria-label", `Switch to ${next} appearance`);
  button.title = `Switch to ${next} appearance`;

  // Keep the browser chrome (Safari's toolbar tint) in step with the page.
  const paper = getComputedStyle(root).getPropertyValue("--paper").trim();
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.content = paper;
}

function apply(appearance) {
  if (appearance === systemAppearance()) {
    delete root.dataset.appearance;
    save(null);
  } else {
    root.dataset.appearance = appearance;
    save(appearance);
  }
  updateLabel();
}

button.addEventListener("click", () => {
  const next = currentAppearance() === "dark" ? "light" : "dark";
  if (document.startViewTransition && !reduceMotion.matches) {
    document.startViewTransition(() => apply(next));
  } else {
    apply(next);
  }
});

// If the system setting changes and the reader's choice now matches it, drop the override.
systemDark.addEventListener("change", () => {
  if (root.dataset.appearance === systemAppearance()) apply(systemAppearance());
  else updateLabel();
});

updateLabel();
