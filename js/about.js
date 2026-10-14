/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // ABOUT PAGE
   Background motion, reveals, CEO rule, closing underline,
   Ghana map — panel-triggered draw-in and region tooltips.
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

  /* ═══ REVEALS — fires per panel as it becomes the active stacked panel ═══ */
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

  /* ═══ CEO TEXT — paragraph-by-paragraph reveal ═══ */
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

  /* ═══ GHANA MAP — panel-triggered draw-in + region tooltips ═══ */
  function initGhanaMap() {
    var mapWrap = document.querySelector(".psa-map");
    var tooltip = document.getElementById("mapTooltip");
    if (!mapWrap) return;

    /* ─── 1. Reveal animation trigger ───
       The map lives inside the anchors panel. Its draw-in (outline
       strokes, staggered pin drops) is driven by CSS transitions
       which fire once the panel gets `.is-active` OR once the map
       itself gets `.is-revealed`. If either class lands, the
       animations play. We add a third fallback here: an explicit
       IntersectionObserver on the map, so it plays even if the
       panel-level trigger misses (e.g. very short viewport). */
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

    /* ─── 2. Region hover tooltips ───
       Each .psa-map__pin has a data-region attribute. On hover,
       position the tooltip above the pin and set its text. */
    if (!tooltip) return;

    var pins = mapWrap.querySelectorAll(".psa-map__pin");
    if (!pins.length) return;

    /* Skip on touch devices — tooltips don't add value on mobile. */
    var isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    function showTooltip(evt, pin) {
      var region = pin.getAttribute("data-region") || "";
      if (!region) return;

      var svg = pin.closest(".psa-map__svg");
      if (!svg) return;

      /* Position the tooltip over the pin, in the wrapper's
         coordinate space (offsetParent = .psa-map). */
      var svgRect = svg.getBoundingClientRect();
      var wrapRect = mapWrap.getBoundingClientRect();
      var circle = pin.querySelector(".psa-map__dot");
      if (!circle) return;

      var circleRect = circle.getBoundingClientRect();

      /* SVG circle center, in mapWrap space */
      var cx = circleRect.left + circleRect.width / 2 - wrapRect.left;
      var cy = circleRect.top + circleRect.height / 2 - wrapRect.top;

      tooltip.textContent = region;
      tooltip.style.left = cx + "px";
      tooltip.style.top  = cy + "px";
      tooltip.classList.add("is-visible");
      tooltip.setAttribute("aria-hidden", "false");
    }

    function hideTooltip() {
      tooltip.classList.remove("is-visible");
      tooltip.setAttribute("aria-hidden", "true");
    }

    pins.forEach(function (pin) {
      pin.addEventListener("mouseenter", function (e) {
        showTooltip(e, pin);
      });
      pin.addEventListener("mousemove", function (e) {
        /* Reposition on move for accuracy if the map shifts */
        showTooltip(e, pin);
      });
      pin.addEventListener("mouseleave", hideTooltip);
      /* Focus and blur make the tooltip keyboard accessible
         if the pins ever become focusable; they are decorative
         for now, so this is a safe no-op. */
      pin.addEventListener("focus", function () { showTooltip(null, pin); });
      pin.addEventListener("blur", hideTooltip);
    });

    /* Hide tooltip on scroll — the map shifts with the panel */
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