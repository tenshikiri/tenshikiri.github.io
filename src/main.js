import "./style.css";

// ── i18n ──
// (i18n.js is loaded separately via <script> in index.html)

// ── Hamburger menu ──
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileMenu?.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
  const icon = menuToggle.querySelector("i");
  icon.className = isOpen
    ? "fa-solid fa-xmark text-xl"
    : "fa-solid fa-bars text-xl";
});

// Close mobile menu on link click
mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.querySelector("i").className = "fa-solid fa-bars text-xl";
  });
});

// ── Scroll handlers (rAF-throttled) ──
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const el = document.getElementById("progress-bar");
      const pct =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;
      el.style.width = pct + "%";

      document
        .getElementById("back-top")
        .classList.toggle("visible", window.scrollY > 400);

      const nav = document.querySelector(".nav-blur");
      nav?.classList.toggle("shadow-lg", window.scrollY > 10);

      ticking = false;
    });
    ticking = true;
  }
});

// ── Reveal on scroll ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ── Back to top ──
document.getElementById("back-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── Footer year ──
const yearEl = document.getElementById("footer-year");
const sepEl = document.getElementById("footer-year-sep");
if (yearEl) {
  const y = new Date().getFullYear();
  yearEl.textContent = y;
  if (y <= 2025 && sepEl) sepEl.style.display = "none";
}


