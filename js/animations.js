/* ═══════════════════════════════════════════════════════════════════
   PRIMESTRATEGY // CAROUSEL + WAVES + 3D + RING
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var lenis;

  function initLenis() {
    if (typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smooth: true,
      smoothTouch: false
    });
    if (typeof ScrollTrigger !== "undefined") lenis.on("scroll", ScrollTrigger.update);
    if (typeof gsap !== "undefined") {
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  }

  /* Progress rail */
  function initProgressRail() {
    var fill = document.getElementById("progressFill");
    if (!fill) return;
    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.height = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* Hero carousel — symmetric triangle */
  function initHeroCarousel() {
    var heroSection = document.getElementById("hero-carousel");
    var slates = document.querySelectorAll(".ps-slate");
    var progressFill = document.getElementById("carouselProgress");
    var introRow = document.querySelector(".ps-hero-row--intro");
    if (!heroSection || !slates.length) return;

    var total = slates.length;
    var currentActive = -1;

    function applyClasses(activeIndex) {
      slates.forEach(function (slate, i) {
        slate.classList.remove(
          "is-active",
          "pos-1", "pos-2", "pos-3", "pos-4",
          "neg-1", "neg-2", "neg-3", "neg-4"
        );
        var offset = i - activeIndex;
        while (offset > total / 2)  offset -= total;
        while (offset < -total / 2) offset += total;

        if (offset === 0) slate.classList.add("is-active");
        else if (offset === -1) slate.classList.add("pos-1");
        else if (offset === -2) slate.classList.add("pos-2");
        else if (offset <= -3) slate.classList.add("pos-3");
        else if (offset === 1) slate.classList.add("neg-1");
        else if (offset === 2) slate.classList.add("neg-2");
        else if (offset >= 3) slate.classList.add("neg-3");
      });
      if (progressFill) {
        progressFill.style.width = (((activeIndex + 1) / total) * 100).toFixed(1) + "%";
      }
    }

    function updateFromScroll() {
      var rect = heroSection.getBoundingClientRect();
      var sectionHeight = heroSection.offsetHeight;
      var vh = window.innerHeight;
      var scrolled = -rect.top;
      var maxScroll = sectionHeight - vh;
      var progress = 0;
      if (maxScroll > 0) progress = Math.max(0, Math.min(1, scrolled / maxScroll));

      var cardProgress = Math.min(1, progress / 0.75);
      var index = Math.round(cardProgress * (total - 1));
      index = Math.max(0, Math.min(total - 1, index));

      if (index !== currentActive) {
        currentActive = index;
        applyClasses(index);
      }

      if (introRow) {
        var exitProgress = Math.min(1, progress / 0.35);
        introRow.style.opacity = (1 - exitProgress * 0.9).toFixed(3);
        introRow.style.transform = "translateY(" + (-exitProgress * 24).toFixed(1) + "px)";
      }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { updateFromScroll(); ticking = false; });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (lenis && lenis.on) lenis.on("scroll", onScroll);

    slates.forEach(function (slate, i) {
      slate.addEventListener("click", function (e) {
        if (i === currentActive) return;
        e.preventDefault();
        var sectionTop = heroSection.offsetTop;
        var sectionHeight = heroSection.offsetHeight;
        var vh = window.innerHeight;
        var maxScroll = sectionHeight - vh;
        var targetProgress = total === 1 ? 0 : (i / (total - 1)) * 0.75;
        var targetY = sectionTop + targetProgress * maxScroll;
        if (lenis) lenis.scrollTo(targetY, { duration: 1.2 });
        else window.scrollTo({ top: targetY, behavior: "smooth" });
      });
    });

    applyClasses(0);
    currentActive = 0;
    updateFromScroll();
  }

  /* Split words */
  function initSplitWords() {
    var headings = document.querySelectorAll(".ps-split-words");
    if (!headings.length) return;
    headings.forEach(function (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.innerHTML = words.map(function (w) {
        return '<span class="ps-word"><span>' + w + "</span></span>";
      }).join(" ");
    });
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".ps-word > span").forEach(function (w, idx) {
              w.style.transitionDelay = (idx * 0.06).toFixed(2) + "s";
            });
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      headings.forEach(function (h) { io.observe(h); });
    } else {
      headings.forEach(function (h) { h.classList.add("is-revealed"); });
    }
  }

  /* Stagger */
  function initStagger() {
    document.querySelectorAll(".ps-stagger").forEach(function (container) {
      Array.prototype.slice.call(container.children).forEach(function (child, i) {
        child.classList.add("ps-stagger-item");
        child.style.transitionDelay = (i * 0.06) + "s";
      });
      if (typeof IntersectionObserver !== "undefined") {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });
        io.observe(container);
      } else container.classList.add("is-revealed");
    });
  }

  /* Simple fade-up */
  function initReveal() {
    var elements = document.querySelectorAll(".ps-reveal");
    if (!elements.length) return;
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      elements.forEach(function (el) { io.observe(el); });
    } else elements.forEach(function (el) { el.classList.add("is-revealed"); });
  }

  /* 3D fly-in cards */
  function init3DCards() {
    var cards = document.querySelectorAll(".ps-3d-card");
    if (!cards.length) return;
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger within each grid
            var parent = entry.target.parentElement;
            var siblings = parent ? Array.prototype.slice.call(parent.querySelectorAll(".ps-3d-card")) : [entry.target];
            var idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = (idx * 0.1).toFixed(2) + "s";
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      cards.forEach(function (card) { io.observe(card); });
    } else cards.forEach(function (card) { card.classList.add("is-revealed"); });
  }

  /* Metric counters */
  function initCounters() {
    var counters = document.querySelectorAll(".ps-counter");
    if (!counters.length) return;
    function animateAll() {
      counters.forEach(function (el) {
        if (el.dataset.psAnimated === "true") return;
        el.dataset.psAnimated = "true";
        var target = parseFloat(el.dataset.target) || 0;
        var duration = 2200;
        var start = null;
        function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
        function tick(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          el.textContent = Math.floor(easeOutQuart(progress) * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(tick);
      });
    }
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateAll(); io.disconnect(); }
        });
      }, { threshold: 0.3 });
      var section = document.getElementById("metrics-section");
      if (section) io.observe(section);
    } else animateAll();
  }

  /* Smooth anchors */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        if (anchor.closest(".ps-slate")) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.2 });
        else target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function boot() {
    var steps = [
      initLenis,
      initProgressRail,
      initHeroCarousel,
      initSplitWords,
      initStagger,
      initReveal,
      init3DCards,
      initCounters,
      initSmoothAnchors
    ];
    steps.forEach(function (fn) {
      try { fn(); } catch (err) { console.warn("[PS] Step failed:", fn.name, err); }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();