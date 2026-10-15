/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // ABOUT PAGE
   Background motion, reveals, CEO rule, closing underline,
   Ghana map — panel-triggered draw-in, region + dot interactions.
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

  /* ═══ GHANA MAP ═══ */
  function initGhanaMap() {
    var mapWrap = document.querySelector(".psa-map");
    if (!mapWrap) return;

    var isCoarse = window.matchMedia("(pointer: coarse)").matches;

    /* ─── 1. Reveal trigger ─── */
    var maps = document.querySelectorAll(".psa-map");
    maps.forEach(function (m) {
      if (typeof IntersectionObserver !== "undefined") {
        var mapObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              mapObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
        mapObserver.observe(m);
      } else {
        m.classList.add("is-revealed");
      }
    });

    /* ─── 2. Interactions ─── */
    var desktopTooltip = document.getElementById("mapTooltipDesktop");
    var mobileTooltip = document.getElementById("mapTooltip");
    var mobileInfo = document.getElementById("mapInfo");
    var mobileInfoLabel = document.getElementById("mapInfoLabel");
    var mobileInfoClose = document.getElementById("mapInfoClose");

    /* DESKTOP: hover tooltip */
    if (!isCoarse && desktopTooltip) {
      var desktopMap = document.querySelector(".psa-map--inline");
      if (desktopMap) {
        var regionEls = desktopMap.querySelectorAll(".psa-map__region");
        var dotEls = desktopMap.querySelectorAll(".psa-map__dot-group");

        function showDesktopTooltip(text, target) {
          if (!text) return;
          var wrapRect = desktopMap.getBoundingClientRect();
          var targetRect = target.getBoundingClientRect();
          var cx = targetRect.left + targetRect.width / 2 - wrapRect.left;
          var cy = targetRect.top + targetRect.height / 2 - wrapRect.top;

          desktopTooltip.textContent = text;
          desktopTooltip.style.left = cx + "px";
          desktopTooltip.style.top  = cy + "px";
          desktopTooltip.classList.add("is-visible");
          desktopTooltip.setAttribute("aria-hidden", "false");
        }

        function hideDesktopTooltip() {
          desktopTooltip.classList.remove("is-visible");
          desktopTooltip.setAttribute("aria-hidden", "true");
        }

        regionEls.forEach(function (el) {
          el.addEventListener("mouseenter", function () {
            showDesktopTooltip(el.getAttribute("data-region"), el);
          });
          el.addEventListener("mousemove", function () {
            showDesktopTooltip(el.getAttribute("data-region"), el);
          });
          el.addEventListener("mouseleave", hideDesktopTooltip);
        });

        dotEls.forEach(function (el) {
          el.addEventListener("mouseenter", function (e) {
            e.stopPropagation();
            showDesktopTooltip(el.getAttribute("data-label"), el);
          });
          el.addEventListener("mousemove", function (e) {
            e.stopPropagation();
            showDesktopTooltip(el.getAttribute("data-label"), el);
          });
          el.addEventListener("mouseleave", hideDesktopTooltip);
        });

        window.addEventListener("scroll", hideDesktopTooltip, { passive: true });
      }
    }

    /* MOBILE: tap on region or dot → info card at bottom */
    if (isCoarse) {
      var mobileMapPanel = document.querySelector(".psa-panel--map");
      if (!mobileMapPanel) return;

      var mRegions = mobileMapPanel.querySelectorAll(".psa-map__region");
      var mDots = mobileMapPanel.querySelectorAll(".psa-map__dot-group");

      var currentSelection = null;

      function clearSelection() {
        if (currentSelection) {
          currentSelection.classList.remove("is-selected");
          currentSelection = null;
        }
      }

      function showInfo(text, target) {
        if (!mobileInfo || !mobileInfoLabel) return;
        clearSelection();
        target.classList.add("is-selected");
        currentSelection = target;

        mobileInfoLabel.textContent = text || "";
        mobileInfo.classList.add("is-visible");
        mobileInfo.setAttribute("aria-hidden", "false");
      }

      function hideInfo() {
        if (!mobileInfo) return;
        mobileInfo.classList.remove("is-visible");
        mobileInfo.setAttribute("aria-hidden", "true");
        clearSelection();
      }

      mRegions.forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.stopPropagation();
          var region = el.getAttribute("data-region");
          if (currentSelection === el) {
            hideInfo();
            return;
          }
          showInfo(region, el);
        });
      });

      mDots.forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.stopPropagation();
          var label = el.getAttribute("data-label");
          if (currentSelection === el) {
            hideInfo();
            return;
          }
          showInfo(label, el);
        });
      });

      if (mobileInfoClose) {
        mobileInfoClose.addEventListener("click", function (e) {
          e.stopPropagation();
          hideInfo();
        });
      }

      /* Tap anywhere on the panel background dismisses */
      mobileMapPanel.addEventListener("click", function (e) {
        var withinInteractive =
          e.target.closest(".psa-map__region") ||
          e.target.closest(".psa-map__dot-group") ||
          e.target.closest(".psa-map__info");
        if (!withinInteractive) hideInfo();
      });

      /* Hide on scroll away */
      window.addEventListener("scroll", function () {
        var rect = mobileMapPanel.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < vh * 0.3 || rect.top > vh * 0.7) hideInfo();
      }, { passive: true });
    }
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