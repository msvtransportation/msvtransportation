/* ============================================================
   MSV Transportation — interactions
   ============================================================ */

// ------------------------------------------------------------
// Split headings into words for staggered reveal
// ------------------------------------------------------------
function splitWords(el) {
  if (!el || el.dataset.split === "1") return;
  el.dataset.split = "1";
  const html = el.innerHTML;
  // Walk text nodes only, preserving inline tags like <span class="red">
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let i = 0;
  nodes.forEach(node => {
    const parent = node.parentNode;
    const words = node.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    words.forEach(w => {
      if (w.trim() === "") {
        frag.appendChild(document.createTextNode(w));
      } else {
        const wrap = document.createElement("span");
        wrap.className = "reveal-word";
        const inner = document.createElement("span");
        inner.textContent = w;
        inner.style.transitionDelay = (i * 60) + "ms";
        wrap.appendChild(inner);
        frag.appendChild(wrap);
        i++;
      }
    });
    parent.replaceChild(frag, node);
  });
}

document.querySelectorAll("[data-split]").forEach(splitWords);

// ------------------------------------------------------------
// IntersectionObserver — in-view reveals
// ------------------------------------------------------------
const inViewObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      // Don't unobserve — we want to keep state if user resizes,
      // but it's cheap and safe to release once revealed
      inViewObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

document.querySelectorAll("[data-observe]").forEach(el => inViewObserver.observe(el));

// ------------------------------------------------------------
// Sticky nav state
// ------------------------------------------------------------
const nav = document.querySelector(".nav");
const forceScrolledNav = document.body.classList.contains("legal-page");
const onScroll = () => {
  if (forceScrolledNav || window.scrollY > 24) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
  parallaxHero();
  updateActiveNav();
};
window.addEventListener("scroll", onScroll, { passive: true });

// ------------------------------------------------------------
// Parallax hero
// ------------------------------------------------------------
const heroImg = document.querySelector(".hero-visual .img-clip img");
function parallaxHero() {
  if (!heroImg) return;
  const y = window.scrollY;
  if (y > window.innerHeight) return;
  const t = Math.min(y / window.innerHeight, 1);
  heroImg.style.setProperty("--py", (t * 60) + "px");
  heroImg.style.transform = `translateY(${t * 40}px) scale(${1 + t * 0.05})`;
}

// ------------------------------------------------------------
// Active section in nav
// ------------------------------------------------------------
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-menu a");
function updateActiveNav() {
  const y = window.scrollY + 120;
  let active = null;
  sections.forEach(sec => {
    if (sec.offsetTop <= y) active = sec.id;
  });
  navLinks.forEach(a => {
    const href = a.getAttribute("href");
    if (!href.startsWith("#")) return;
    const target = href.replace("#", "");
    a.classList.toggle("active", target === active);
  });
}

// ------------------------------------------------------------
// Mobile nav toggle
// ------------------------------------------------------------
const navToggle = document.querySelector(".nav-toggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("menu-open");
    navToggle.classList.toggle("open");
  });
  document.querySelectorAll(".nav-menu a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("menu-open");
      navToggle.classList.remove("open");
    });
  });
}

// ------------------------------------------------------------
// FAQ accordion
// ------------------------------------------------------------
document.querySelectorAll(".faq-item").forEach(item => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  q.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(other => {
      other.classList.remove("open");
      other.querySelector(".faq-a").style.maxHeight = "0px";
    });
    if (!isOpen) {
      item.classList.add("open");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
});

// ------------------------------------------------------------
// Animated counters
// ------------------------------------------------------------
function animateNumber(el) {
  if (el.dataset.counted === "1") return;
  el.dataset.counted = "1";
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const dur = 1600;
  const start = performance.now();
  const startVal = 0;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = startVal + (target - startVal) * eased;
    el.textContent = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  requestAnimationFrame(tick);
}

const numberObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateNumber(e.target);
      numberObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll("[data-count]").forEach(el => numberObserver.observe(el));

// ------------------------------------------------------------
// Dynamic loads counter (preserve original logic)
// ------------------------------------------------------------
(function updateLoads() {
  const el = document.querySelector("[data-dynamic-loads]");
  if (!el) return;
  const now = new Date();
  const ref = new Date("2025-01-01");
  const ms = 1000 * 60 * 60 * 24;
  const daysSince = Math.floor((now - ref) / ms);
  const refDay = Math.floor(ref.getTime() / ms);
  let loads = 20580;
  for (let i = 0; i < daysSince; i++) {
    const seed = refDay + i;
    const rand = Math.abs(Math.sin(seed * 9301 + 49297)) % 1;
    loads += 8 + Math.floor(rand * 5);
  }
  el.dataset.count = loads;
})();

// ------------------------------------------------------------
// Years live counter
// ------------------------------------------------------------
(function updateYears() {
  const el = document.querySelector("[data-dynamic-years]");
  if (!el) return;
  el.dataset.count = new Date().getFullYear() - 2017;
})();

// ------------------------------------------------------------
// Smooth anchor scrolling
// ------------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#" || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// ------------------------------------------------------------
// Form submit state
// ------------------------------------------------------------
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", () => {
    const btn = form.querySelector("button[type=submit]");
    if (btn) { btn.disabled = true; btn.querySelector("span").textContent = "SENDING…"; }
  });
}

// ------------------------------------------------------------
// Run initial state
// ------------------------------------------------------------
onScroll();
updateActiveNav();

// Auto-open first FAQ as hint
const firstFaq = document.querySelector(".faq-item");
if (firstFaq) {
  setTimeout(() => {
    firstFaq.classList.add("open");
    const a = firstFaq.querySelector(".faq-a");
    a.style.maxHeight = a.scrollHeight + "px";
  }, 600);
}

console.log("%cMSV Transportation", "background:#E11D2A;color:#F5F2EC;font-family:Anton,sans-serif;font-size:18px;padding:8px 14px;letter-spacing:2px");
