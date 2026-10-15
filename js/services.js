/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // SERVICES PAGE
   Split reveal with pre-split seam draw. Reveals. Parallax.
   Menu toggle is handled by js/nav.js.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ REVEALS + SPLIT REVEAL ═══ */
  function initReveals() {
    var revealables = document.querySelectorAll("[data-reveal]");
    var disciplines = document.querySelectorAll(".svc-disc");
    if (!revealables.length && !disciplines.length) return;

    if (!("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-revealed"); });
      disciplines.forEach(function (el) { el.classList.add("is-active"); });
      return;
    }

    /* Reveal observer — text + list rows fade in once. */
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.05
    });

    revealables.forEach(function (el) { revealObserver.observe(el); });

    /* Split-reveal observer.
       Two zones:
       - "pre" — section is approaching the middle band. Seam draws in.
       - "active" — section is centered in the band. Panels split.
       Both clear when the section leaves the viewport band. */

    var preObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-pre");
        } else {
          entry.target.classList.remove("is-pre");
        }
      });
    }, {
      rootMargin: "-10% 0px -10% 0px",
      threshold: 0
    });

    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
        } else {
          entry.target.classList.remove("is-active");
        }
      });
    }, {
      rootMargin: "-28% 0px -28% 0px",
      threshold: 0
    });

    disciplines.forEach(function (el) {
      preObserver.observe(el);
      activeObserver.observe(el);
    });
  }

  /* ═══ PARALLAX BACKGROUND ═══ */
  function initParallax() {
    var bg = document.getElementById("svcBgImage");
    if (!bg || reduced) return;

    var ticking = false;

    function update() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var doc = document.documentElement;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      var progress = Math.min(1, scrollY / max);

      var y = scrollY * -0.15;
      var scale = 1.1 + progress * 0.12;
      bg.style.setProperty("--svc-bg-y", y.toFixed(1) + "px");
      bg.style.setProperty("--svc-bg-scale", scale.toFixed(3));

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ═══ BOOT ═══ */
  function boot() {
    initReveals();
    initParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();