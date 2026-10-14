/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // ABOUT PAGE
   Background motion, reveals, CEO rule, closing underline,
   Ghana map — panel-triggered draw-in, region + dot tooltips.
   Menu toggle is handled by js/nav.js — no menu code here.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined";
  if (hasGsap && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ═══ BACKGROUND MOTION ═══ */
  function initBackground() {
    var bg = document.getElementById("psaBgImage");
    if (!bg) return;
    if (reduced || !hasGsap || typeof ScrollTrigger === "undefined") return;

    gsap.fromTo(bg,
      { scale: 1.05 },
      {
        scale: 1.22,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2
        }
      }
    );

    gsap.fromTo(bg,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.4
        }
      }
    );
  }

  /* ═══ REVEALS ═══ */
  function initReveals() {
    var panels = document.querySelectorAll(".psa-panel");
    if (!panels.length) return;

    if (reduced) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }

    var ticking = false;

    function revealAll(el) {
      el.querySelectorAll("[data-reveal]").forEach(function (child) {
        child.classList.add("is-revealed");
      });
    }

    function update() {
      var vh = window.innerHeight;
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--ps-nav-h"), 10) || 68;
      panels.forEach(function (panel) {
        var rect = panel.getBoundingClientRect();
        var active = rect.top <= navH + vh * 0.15 && rect.bottom > navH + vh * 0.35;
        if (active) {
          panel.classList.add("is-active");
          revealAll(panel);
        }
      });
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

  /* ═══ CEO TEXT ═══ */
  function initCeoReveals() {
    var paras = document.querySelectorAll(".psa-ceo__text p");
    if (!paras.length) return;

    if (reduced || typeof IntersectionObserver === "undefined") {
      paras.forEach(function (p) { p.classList.add("is-revealed"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    paras.forEach(function (p) { io.observe(p); });
  }

  /* ═══ CEO ORANGE RULE ═══ */
  function initCeoRule() {
    var rule = document.querySelector(".psa-ceo__rule");
    var text = document.querySelector(".psa-ceo__text");
    if (!rule || !text || reduced || !hasGsap || typeof ScrollTrigger === "undefined") return;

    ScrollTrigger.create({
      trigger: text,
      start: "top 75%",
      end: "bottom 45%",
      scrub: 0.6,
      onUpdate: function (self) {
        var pct = Math.max(0, Math.min(1, self.progress));
        rule.style.setProperty("--psa-rule-progress", (pct * 100).toFixed(2) + "%");
      }
    });
  }

  /* ═══ CLOSING UNDERLINE ═══ */
  function initClosingUnderline() {
    var line = document.querySelector(".psa-closing__line");
    if (!line) return;
    if (reduced || typeof IntersectionObserver === "undefined") {
      line.classList.add("is-revealed");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    io.observe(line);
  }

  /* ═══ GHANA MAP — draw-in + region/dot tooltips ═══ */
  function initGhanaMap() {
    var mapWrap = document.querySelector(".psa-map");
    var tooltip = document.getElementById("mapTooltip");
    if (!mapWrap) return;

    /* ─── 1. Reveal animation trigger ─── */
    if (typeof IntersectionObserver !== "undefined") {
      var mapObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            mapWrap.classList.add("is-revealed");
            mapObserver.unobserve(mapWrap);
          }
        });
      }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

      mapObserver.observe(mapWrap);
    } else {
      mapWrap.classList.add("is-revealed");
    }

    /* ─── 2. Tooltips ───
       Two groups now:
       - .psa-map__region  → reads data-region
       - .psa-map__dot-group → reads data-label
       Dots sit on top in the SVG so they win pointer events naturally. */
    if (!tooltip) return;

    var regionEls = mapWrap.querySelectorAll(".psa-map__region");
    var dotEls = mapWrap.querySelectorAll(".psa-map__dot-group");

    if (!regionEls.length && !dotEls.length) return;

    var isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    function showTooltip(text, target) {
      if (!text) return;

      /* Position the tooltip above the hovered element's bounding-box center. */
      var wrapRect = mapWrap.getBoundingClientRect();
      var targetRect = target.getBoundingClientRect();

      var cx = targetRect.left + targetRect.width / 2 - wrapRect.left;
      var cy = targetRect.top + targetRect.height / 2 - wrapRect.top;

      tooltip.textContent = text;
      tooltip.style.left = cx + "px";
      tooltip.style.top  = cy + "px";
      tooltip.classList.add("is-visible");
      tooltip.setAttribute("aria-hidden", "false");
    }

    function hideTooltip() {
      tooltip.classList.remove("is-visible");
      tooltip.setAttribute("aria-hidden", "true");
    }

    /* Region hover — show region name */
    regionEls.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        showTooltip(el.getAttribute("data-region"), el);
      });
      el.addEventListener("mousemove", function () {
        showTooltip(el.getAttribute("data-region"), el);
      });
      el.addEventListener("mouseleave", hideTooltip);
    });

    /* Dot hover — show dot label (region tooltip is superseded) */
    dotEls.forEach(function (el) {
      el.addEventListener("mouseenter", function (e) {
        e.stopPropagation();
        showTooltip(el.getAttribute("data-label"), el);
      });
      el.addEventListener("mousemove", function (e) {
        e.stopPropagation();
        showTooltip(el.getAttribute("data-label"), el);
      });
      el.addEventListener("mouseleave", hideTooltip);
    });

    window.addEventListener("scroll", hideTooltip, { passive: true });
  }

  /* ═══ BOOT ═══ */
  function boot() {
    initBackground();
    initReveals();
    initCeoReveals();
    initCeoRule();
    initClosingUnderline();
    initGhanaMap();

    if (hasGsap && typeof ScrollTrigger !== "undefined") {
      setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();