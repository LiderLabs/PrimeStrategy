/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // SERVICES PAGE
   Night Atelier. Shutter transitions. Reveals. Parallax.
   Menu toggle is handled by js/nav.js.
   No overlay, no click-to-reveal — full content is on the page.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ REVEALS + SHUTTER ═══ */
  function initReveals() {
    var revealables = document.querySelectorAll("[data-reveal]");
    var disciplines = document.querySelectorAll(".svc-disc");
    if (!revealables.length && !disciplines.length) return;

    if (!("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-revealed"); });
      disciplines.forEach(function (el) { el.classList.add("is-active"); });
      return;
    }

    // Reveal observer for text + list rows
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

    // Shutter observer for the wipe transition on each discipline
    var shutterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
        }
      });
    }, {
      rootMargin: "-15% 0px -35% 0px",
      threshold: 0
    });

    disciplines.forEach(function (el) { shutterObserver.observe(el); });
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