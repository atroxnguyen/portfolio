// Language toggle (VI default) + reveal-on-scroll + copy-to-clipboard. Vanilla JS.
(function () {
  const KEY = "lang";
  const TITLES = {
    vi: "Nguyễn Ngô Đại Phúc — Nhân viên Nhân sự Tổng hợp",
    en: "Nguyen Ngo Dai Phuc — HR Generalist"
  };

  function setLang(lang) {
    document.body.classList.toggle("en", lang === "en");
    document.documentElement.lang = lang;
    document.title = TITLES[lang] || TITLES.vi;
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.setLang === lang));
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.dataset.setLang); });
  });

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "en") setLang("en");

  // reveal cards / timeline items as they enter the viewport
  const targets = document.querySelectorAll(".card, .timeline li");
  if ("IntersectionObserver" in window &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add("visible"); });
  }

  // Desktop (fine pointer): email/phone buttons copy to clipboard, the clicked
  // button briefly shows "Đã copy ✓" / "Copied ✓".
  // Touch devices keep native behavior: tap phone → call, tap email → mail app.
  const touchDevice = matchMedia("(pointer: coarse)").matches;
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return Promise.resolve();
  }
  const copyTimers = new WeakMap();
  if (!touchDevice) document.querySelectorAll("[data-copy]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      function done() {
        if (!copyTimers.has(a)) a.dataset.orig = a.textContent;
        a.style.minWidth = a.offsetWidth + "px";   // keep button width steady
        a.textContent = document.body.classList.contains("en") ? "Copied ✓" : "Đã copy ✓";
        clearTimeout(copyTimers.get(a));
        copyTimers.set(a, setTimeout(function () {
          a.textContent = a.dataset.orig;
          a.style.minWidth = "";
          copyTimers.delete(a);
        }, 1600));
      }
      copyText(a.dataset.copy).then(done, done);
    });
  });

  // self-check: the two language trees must both exist
  console.assert(document.querySelector('[data-lang="vi"]') && document.querySelector('[data-lang="en"]'),
    "bilingual content missing");
})();
