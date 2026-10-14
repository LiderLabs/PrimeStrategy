/* PrimeStrategy experience layer */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 900px)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var hasGsap = typeof gsap !== "undefined";
  if (hasGsap && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  window.PS = { lenis: null, playLobby: null };
  var booted = false;
  var onAbout = false;
  var leaving = false;
  var armedExit = false;

  var DOORS_HTML =
    '<div class="about-doors" id="aboutDoors" aria-hidden="true">' +
      '<div class="about-doors__panel about-doors__panel--l"><div class="about-doors__img"></div><div class="about-doors__shade"></div></div>' +
      '<div class="about-doors__panel about-doors__panel--r"><div class="about-doors__img"></div><div class="about-doors__shade"></div></div>' +
      '<div class="about-doors__seam"></div>' +
      '<div class="about-doors__ring"></div>' +
    '</div>';

  function injectScenes() {
    if (!document.getElementById("aboutDoors")) document.body.insertAdjacentHTML("beforeend", DOORS_HTML);
  }
  injectScenes();

  function initCursor() {
    if (!fine || reduced) return;
    var dot = document.querySelector(".ps-cursor-dot");
    var ring = document.querySelector(".ps-cursor-ring");
    if (!dot || !ring) return;
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my, raf = 0, hovering = false;
    document.body.classList.add("ps-cursor-on");

    function tick() {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) raf = requestAnimationFrame(tick);
      else raf = 0;
    }
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      var hit = !!e.target.closest("a, button, input, select, textarea, label, .carousel__card, [data-magnetic]");
      if (hit === hovering) return;
      hovering = hit;
      document.body.classList.toggle("ps-cursor-hover", hit);
    }, { passive: true });
  }

  function initLenis() {
    if (!hasGsap || typeof Lenis === "undefined" || reduced) return;
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.PS.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function syncLenisWithMode() {
    var l = window.PS.lenis;
    if (!l) return;
    if (document.body.classList.contains("mode-hub")) l.stop(); else l.start();
  }

  function doorParts() {
    var d = document.getElementById("aboutDoors");
    if (!d) return null;
    return {
      root: d,
      L: d.querySelector(".about-doors__panel--l"),
      R: d.querySelector(".about-doors__panel--r"),
      imgs: d.querySelectorAll(".about-doors__img, .about-doors__shade"),
      seam: d.querySelector(".about-doors__seam"),
      ring: d.querySelector(".about-doors__ring")
    };
  }

  function aboutDoorsOpen(el, done) {
    var p = doorParts();
    el.style.visibility = "hidden";
    if (!p) { done(); return; }
    var photo = p.root.querySelectorAll(".about-doors__img");

    p.root.style.visibility = "visible";
    gsap.set([p.L, p.R], { xPercent: 0 });
    gsap.set(photo, { scale: 2.2, transformOrigin: "50% 50%" });
    gsap.set(p.seam, { scaleY: 0, scaleX: 1, opacity: 1 });
    gsap.set(p.ring, { scale: 0, opacity: 0 });

    if (window.PS.playLobby) window.PS.playLobby(1.1, true);

    var tl = gsap.timeline({
      onComplete: function () {
        p.root.style.visibility = "hidden";
        gsap.set([p.L, p.R, p.seam, p.ring, photo], { clearProps: "all" });
        done();
      }
    });
    tl.to(photo, { scale: 1, duration: 1.7, ease: "expo.out" }, 0)
      .to(p.seam, { scaleY: 1, duration: 0.45, ease: "expo.out" }, 0)
      .to(p.ring, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 0.15)
      .to(p.seam, { scaleX: 40, opacity: 0, duration: 0.7, ease: "power2.in" }, 0.6)
      .to(p.ring, { scale: 8, opacity: 0, duration: 1.4, ease: "power3.out" }, 0.6)
      .to(p.L, { xPercent: -102, duration: 1.3, ease: "expo.inOut" }, 0.6)
      .to(p.R, { xPercent: 102, duration: 1.3, ease: "expo.inOut" }, 0.6);
  }

  function aboutDoorsClose(done) {
    var p = doorParts();
    if (!p) { done(); return; }
    var photo = p.root.querySelectorAll(".about-doors__img");

    p.root.style.visibility = "visible";
    gsap.set([p.L, p.R], { xPercent: -102 });
    gsap.set(p.R, { xPercent: 102 });
    gsap.set(photo, { scale: 1, transformOrigin: "50% 50%" });
    gsap.set(p.seam, { scaleY: 1, scaleX: 40, opacity: 0 });
    gsap.set(p.ring, { scale: 8, opacity: 0 });

    var tl = gsap.timeline();
    tl.to(p.ring, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.in" }, 0)
      .to(p.seam, { scaleX: 1, opacity: 1, duration: 0.5, ease: "power2.out" }, 0.5)
      .to(p.L, { xPercent: 0, duration: 1.0, ease: "expo.inOut" }, 0)
      .to(p.R, { xPercent: 0, duration: 1.0, ease: "expo.inOut" }, 0)
      .to(photo, { scale: 2.2, duration: 1.2, ease: "expo.in" }, 0.5)
      .add(function () { done(); }, 1.5)
      .to(p.root, { opacity: 0, duration: 0.6, ease: "power1.out" }, 1.6)
      .add(function () {
        p.root.style.visibility = "hidden";
        gsap.set([p.root, p.L, p.R, p.seam, p.ring, photo], { clearProps: "all" });
      });
  }

  var TRANSITIONS = {
    "#about-section": aboutDoorsOpen,
    "#services-section": function (el, done) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)", x: 0, y: 0 });
      gsap.to(el, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.9, ease: "power3.inOut", onComplete: done });
    },
    "#case-study-section": function (el, done) {
      gsap.set(el, { clipPath: "none", x: 0, yPercent: 0 });
      gsap.to(el, { yPercent: -100, duration: 1, ease: "back.in(1.3)", onComplete: done });
    },
    "#careers-section": function (el, done) {
      gsap.set(el, { clipPath: "circle(150% at 50% 50%)", x: 0, y: 0 });
      gsap.to(el, { clipPath: "circle(0% at 50% 50%)", duration: 1.1, ease: "power2.inOut", onComplete: done });
    },
    "#contact-section": function (el, done) {
      gsap.set(el, { clipPath: "none", x: 0, yPercent: 0 });
      gsap.to(el, { yPercent: 100, duration: 1.3, ease: "bounce.out", onComplete: done });
    },
    "#login-section": function (el, done) {
      gsap.set(el, { clipPath: "none", y: 0, xPercent: 0 });
      gsap.to(el, { xPercent: 100, duration: 0.9, ease: "power4.inOut", onComplete: done });
    }
  };

  function runTransition(target) {
    var el = document.getElementById("psTransition");
    var fn = TRANSITIONS[target];
    if (!el || !fn || !hasGsap || reduced) return;
    el.style.visibility = "visible";
    fn(el, function () {
      el.style.visibility = "hidden";
      gsap.set(el, { clearProps: "all" });
    });
  }

  function exitAbout() {
    if (leaving || !onAbout || !hasGsap || reduced) return;
    var back = document.querySelector(".floating-hub-return");
    if (!back) return;
    leaving = true;
    if (window.PS.lenis) window.PS.lenis.stop();
    aboutDoorsClose(function () {
      back.click();
      onAbout = false;
      armedExit = false;
      setTimeout(function () { leaving = false; }, 900);
    });
  }

  function initExitGesture() {
    window.addEventListener("wheel", function (e) {
      if (!onAbout || leaving || document.body.classList.contains("mode-hub")) return;
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y > 320) armedExit = true;
      if (e.deltaY < -20 && y <= 2 && armedExit) exitAbout();
    }, { passive: true });

    var touchY = 0;
    window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener("touchend", function (e) {
      if (!onAbout || leaving) return;
      var y = window.scrollY || 0;
      if (y > 320) armedExit = true;
      if (e.changedTouches[0].clientY - touchY > 90 && y <= 2 && armedExit) exitAbout();
    }, { passive: true });
  }

  function initSplitText() {
    if (!hasGsap || typeof SplitType === "undefined" || reduced) return;
    document.querySelectorAll("#services-section .section-main-heading, #case-study-section .section-main-heading, #careers-section .section-main-heading, #contact-section .section-main-heading, #login-section .section-main-heading").forEach(function (h) {
      var s = new SplitType(h, { types: "chars,words" });
      gsap.from(s.chars, {
        yPercent: 110, rotate: 6, opacity: 0, duration: 0.9, ease: "back.out(1.6)", stagger: 0.025,
        scrollTrigger: { trigger: h, start: "top 88%", toggleActions: "play none none reverse" }
      });
    });
    var q = document.querySelector(".ceo-hero__quote");
    if (q) {
      var qs = new SplitType(q, { types: "words" });
      gsap.from(qs.words, {
        opacity: 0.08, y: 12, duration: 0.6, ease: "power2.out", stagger: 0.03,
        scrollTrigger: { trigger: q, start: "top 85%" }
      });
    }
  }

  function assignStaggerDelays() {
    var about = document.getElementById("about-section");
    if (!about) return;
    var groups = about.querySelectorAll(
      ".psa-panel__center, .psa-anchor-row__inner, .psa-ceo__aside-inner, .psa-blocks, .psa-closing__inner"
    );
    groups.forEach(function (g) {
      var kids = g.querySelectorAll(".psa-fade");
      kids.forEach(function (el, i) {
        el.style.setProperty("--psa-delay", (i * 90) + "ms");
      });
    });
  }

  function observeAboutReveal() {
    var all = [];
    all = all.concat(
      [].slice.call(document.querySelectorAll("#about-section .psa-fade")),
      [].slice.call(document.querySelectorAll("#about-section .psa-panel--navy")),
      [].slice.call(document.querySelectorAll("#about-section .psa-closing__line"))
    );
    if (!all.length) return;

    if (reduced || typeof IntersectionObserver === "undefined") {
      all.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

    all.forEach(function (el) { io.observe(el); });
  }

  function initScrollLinkedText() {
    var ceoLines = document.querySelectorAll("#about-section .psa-ceo__line");
    var offerLines = document.querySelectorAll("#about-section .psa-offer__line");

    if (isMobile || reduced || !hasGsap || typeof ScrollTrigger === "undefined") {
      ceoLines.forEach(function (el) { el.style.setProperty("--psa-line-op", 1); });
      offerLines.forEach(function (el) { el.style.setProperty("--psa-line-op", 1); });
      var pqEl = document.querySelector("#about-section .psa-pullquote");
      if (pqEl) pqEl.style.setProperty("--psa-quote-bar", 1);
      return;
    }

    ceoLines.forEach(function (line) {
      ScrollTrigger.create({
        trigger: line,
        start: "top 88%",
        end: "top 50%",
        scrub: 0.5,
        onUpdate: function (self) {
          var p = Math.max(0, Math.min(1, self.progress));
          line.style.setProperty("--psa-line-op", p.toFixed(3));
        }
      });
    });

    offerLines.forEach(function (line) {
      ScrollTrigger.create({
        trigger: line,
        start: "top 88%",
        end: "top 55%",
        scrub: 0.5,
        onUpdate: function (self) {
          var p = Math.max(0, Math.min(1, self.progress));
          line.style.setProperty("--psa-line-op", p.toFixed(3));
        }
      });
    });

    var pq = document.querySelector("#about-section .psa-pullquote");
    if (pq) {
      ScrollTrigger.create({
        trigger: pq,
        start: "top 82%",
        end: "top 45%",
        scrub: 0.5,
        onUpdate: function (self) {
          var p = Math.max(0, Math.min(1, self.progress));
          pq.style.setProperty("--psa-quote-bar", p.toFixed(3));
        }
      });
    }
  }

  function linkCeoRuleToScroll() {
    if (!hasGsap || typeof ScrollTrigger === "undefined" || reduced) return;
    var rule = document.querySelector("#about-section .psa-ceo__rule");
    var text = document.querySelector("#about-section .psa-ceo__text");
    if (!rule || !text) return;

    ScrollTrigger.create({
      trigger: text,
      start: "top 72%",
      end: "bottom 45%",
      scrub: 0.6,
      onUpdate: function (self) {
        var pct = Math.max(0, Math.min(1, self.progress));
        rule.style.setProperty("--psa-rule-progress", (pct * 100).toFixed(2) + "%");
      }
    });
  }

  function initPanelStack() {
    var about = document.getElementById("about-section");
    if (!about) return;
    var stack = about.querySelector(".psa-stack");
    if (!stack) return;
    var panels = stack.querySelectorAll("[data-psa-panel]");
    if (!panels.length) return;

    if (isMobile || reduced) {
      panels.forEach(function (p) {
        p.style.position = "relative";
        p.style.top = "auto";
        p.style.minHeight = "auto";
        p.style.boxShadow = "none";
      });
      var inners = stack.querySelectorAll(".psa-panel__inner");
      inners.forEach(function (inner) {
        inner.style.minHeight = "auto";
        inner.style.padding = "80px 24px";
      });
      stack.style.height = "auto";
      return;
    }

    stack.querySelectorAll(".psa-spacer").forEach(function (s) { s.remove(); });

    panels.forEach(function (panel, i) {
      panel.style.position = "sticky";
      panel.style.top = "0";
      panel.style.minHeight = "100vh";

      if (i < panels.length - 1) {
        var spacer = document.createElement("div");
        spacer.className = "psa-spacer";
        spacer.setAttribute("aria-hidden", "true");
        spacer.style.height = "100vh";
        spacer.style.width = "100%";
        spacer.style.pointerEvents = "none";
        panel.parentNode.insertBefore(spacer, panel.nextSibling);
      }
    });

    var last = panels[panels.length - 1];
    if (last) {
      last.style.position = "relative";
      last.style.top = "auto";
    }

    if (typeof ScrollTrigger !== "undefined") {
      requestAnimationFrame(function () { ScrollTrigger.refresh(); });
    }

    var tmr = null;
    window.addEventListener("resize", function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () {
        stack.querySelectorAll(".psa-spacer").forEach(function (s) {
          s.style.height = window.innerHeight + "px";
        });
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      }, 200);
    });
  }

  function initScrollLinks() {
    var links = document.querySelectorAll("#about-section .psa-link[data-psa-scroll]");
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetSel = link.getAttribute("data-psa-scroll");
        if (!targetSel) return;
        var target = document.querySelector(targetSel);
        if (!target) return;
        e.preventDefault();

        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (window.PS.lenis && !reduce) {
          window.PS.lenis.scrollTo(target, { duration: 1.4, offset: -60 });
        } else {
          var y = target.getBoundingClientRect().top + window.pageYOffset - 60;
          window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
        }

        if (target.tabIndex < 0) target.tabIndex = -1;
        setTimeout(function () { target.focus({ preventScroll: true }); }, 800);
      });
    });
  }

  function driveFloorLayUp() {
    var floor = document.querySelector("#about-section [data-psa-floor]");
    var cards = document.querySelectorAll("#about-section .psa-floor-card");
    if (!cards.length) return;

    if (isMobile || reduced || !hasGsap || typeof ScrollTrigger === "undefined") {
      cards.forEach(function (c) { c.style.setProperty("--psa-floor", 1); c.classList.add("is-revealed"); });
      return;
    }

    if (!floor) return;

    ScrollTrigger.create({
      trigger: floor,
      start: "top 105%",
      end: "top 15%",
      scrub: 0.7,
      onUpdate: function (self) {
        var pct = Math.max(0, Math.min(1, self.progress));

        var localPct;
        if (pct < 0.20)      localPct = 0;
        else if (pct > 0.85) localPct = 1;
        else                 localPct = (pct - 0.20) / 0.65;

        var eased = 1 - Math.pow(1 - localPct, 3);

        cards.forEach(function (c, i) {
          var lag = i * 0.07;
          var local = Math.max(0, Math.min(1, (eased - lag) / (1 - lag || 1)));
          c.style.setProperty("--psa-floor", local.toFixed(3));
        });
      },
      onLeave: function () {
        cards.forEach(function (c) { c.style.setProperty("--psa-floor", "1"); });
      },
      onLeaveBack: function () {
        cards.forEach(function (c) { c.style.setProperty("--psa-floor", "0"); });
      }
    });
  }

  function initAboutMotion() {
    assignStaggerDelays();
    observeAboutReveal();
    initScrollLinkedText();
    linkCeoRuleToScroll();
    initPanelStack();
    driveFloorLayUp();
    initScrollLinks();
  }

  function initCeo() {
    var portrait = document.querySelector(".ceo-hero__portrait");
    var hero = document.querySelector(".ceo-hero");
    if (!portrait) return;
    if (!portrait.querySelector(".crest__ring")) {
      portrait.insertAdjacentHTML("beforeend",
        '<i class="crest__ring crest__ring--a"></i><i class="crest__ring crest__ring--b"></i><span class="crest__cap">Chief Executive Officer</span>');
    }
    if (!hasGsap || !fine || reduced || !hero) return;
    gsap.set(portrait, { transformPerspective: 900 });
    var ryTo = gsap.quickTo(portrait, "rotationY", { duration: 0.8, ease: "power3.out" });
    var rxTo = gsap.quickTo(portrait, "rotationX", { duration: 0.8, ease: "power3.out" });
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      ryTo(((e.clientX - r.left) / r.width - 0.5) * 14);
      rxTo(((e.clientY - r.top) / r.height - 0.5) * -11);
    });
    hero.addEventListener("pointerleave", function () { ryTo(0); rxTo(0); });
  }

  function initCards() {
    if (!fine || reduced) return;
    document.querySelectorAll(".carousel__card").forEach(function (card) {
      var content = card.querySelector(".carousel__card-content");
      if (!content) return;
      card.addEventListener("pointermove", function (e) {
        if (!card.classList.contains("is-active")) return;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (x * 100) + "%");
        card.style.setProperty("--my", (y * 100) + "%");
        content.style.setProperty("--rx", ((y - 0.5) * -8) + "deg");
        content.style.setProperty("--ry", ((x - 0.5) * 10) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        content.style.setProperty("--rx", "0deg");
        content.style.setProperty("--ry", "0deg");
      });
    });
  }

  function initAbout() {
    if (!hasGsap) return;
    initCeo();
    initCards();
    initAboutMotion();

    document.querySelectorAll(".ps-section-fabric__marker").forEach(function (m) {
      gsap.fromTo(m, { scale: 0.4 }, { scale: 1, duration: 1.4, ease: "elastic.out(1, 0.4)",
        scrollTrigger: { trigger: m, start: "top 90%", toggleActions: "play none none reverse" } });
    });
  }

  function initMagnetic() {
    if (!fine || !hasGsap || reduced) return;
    document.querySelectorAll(".ps-btn, .carousel__arrow, .floating-hub-return").forEach(function (b) {
      b.setAttribute("data-magnetic", "");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - (r.left + r.width / 2)) * 0.3, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.4, ease: "power3.out" });
      });
      b.addEventListener("pointerleave", function () { gsap.to(b, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)" }); });
    });
  }

  function boot() {
    if (booted) return;
    booted = true;
    initLenis();
    initSplitText();
    initAbout();
    initMagnetic();
    initExitGesture();
  }

  initCursor();
  new MutationObserver(syncLenisWithMode).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("ps:site-enter", function (e) {
    var target = e.detail && e.detail.target;
    onAbout = target === "#about-section";
    armedExit = false;
    boot();
    assignStaggerDelays();
    observeAboutReveal();
    initScrollLinkedText();
    linkCeoRuleToScroll();
    initPanelStack();
    driveFloorLayUp();
    initScrollLinks();
    syncLenisWithMode();
    runTransition(target);

    setTimeout(function () {
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      var el = target && document.querySelector(target);
      if (el && window.PS.lenis) window.PS.lenis.scrollTo(el, { duration: 1.4 });
    }, 120);
  });
})();