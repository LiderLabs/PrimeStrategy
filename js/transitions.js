/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // PAGE TRANSITIONS
   Intercepts internal link clicks. Plays the door animation on
   the CURRENT page, then navigates. The destination page loads
   behind the doors — no white flash, SPA-like feel.
   Load on every page. Uses <div class="psa-doors"> if present,
   otherwise falls back to instant navigation.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined";

  /* Pages this script handles transitions for. Add more as you
     build them. Any link whose href matches one of these will get
     the door transition. External links, anchors, and mailto/tel
     are not intercepted. */
  var INTERNAL_PAGES = [
    "index.html",
    "about.html",
    "services.html",
    "case-study.html",
    "careers.html",
    "contact.html",
    "login.html",
    ""
  ];

  function isInternalLink(href) {
    if (!href) return false;
    if (href.indexOf("#") === 0) return false;         /* anchor only */
    if (href.indexOf("http") === 0) return false;      /* external */
    if (href.indexOf("mailto:") === 0) return false;
    if (href.indexOf("tel:") === 0) return false;
    /* Strip query strings and hashes */
    var clean = href.split("?")[0].split("#")[0];
    if (clean === "") return true;
    return INTERNAL_PAGES.indexOf(clean) !== -1;
  }

  /* Get or create the door overlay. If the page has one, reuse it.
     If not, build it on the fly so every page has the transition. */
  function ensureDoors() {
    var doors = document.getElementById("psaDoors");
    if (doors) return doors;

    doors = document.createElement("div");
    doors.className = "psa-doors";
    doors.id = "psaDoors";
    doors.setAttribute("aria-hidden", "true");
    doors.innerHTML =
      '<div class="psa-doors__panel psa-doors__panel--l">' +
        '<div class="psa-doors__img"></div>' +
        '<div class="psa-doors__shade"></div>' +
      '</div>' +
      '<div class="psa-doors__panel psa-doors__panel--r">' +
        '<div class="psa-doors__img"></div>' +
        '<div class="psa-doors__shade"></div>' +
      '</div>' +
      '<div class="psa-doors__seam"></div>' +
      '<div class="psa-doors__ring"></div>';
    document.body.appendChild(doors);
    return doors;
  }

  /* Close the doors — panels slide in from the sides to cover the page. */
  function playCloseDoors(doors, onCovered) {
    if (!doors || !hasGsap || reduced) {
      if (onCovered) onCovered();
      return;
    }

    var L = doors.querySelector(".psa-doors__panel--l");
    var R = doors.querySelector(".psa-doors__panel--r");
    var imgs = doors.querySelectorAll(".psa-doors__img");
    var seam = doors.querySelector(".psa-doors__seam");
    var ring = doors.querySelector(".psa-doors__ring");

    doors.style.visibility = "visible";

    /* Start state — panels fully open (off-screen), no seam visible. */
    gsap.set([L, R], { xPercent: -102 });
    gsap.set(R, { xPercent: 102 });
    gsap.set(imgs, { scale: 1.3, transformOrigin: "50% 50%" });
    gsap.set(seam, { scaleY: 0, scaleX: 1, opacity: 0 });
    gsap.set(ring, { scale: 0, opacity: 0 });

    var tl = gsap.timeline({
      onComplete: function () {
        if (onCovered) onCovered();
      }
    });

    tl.to(seam, { scaleY: 1, opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
      .to(ring, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, 0.1)
      .to(L, { xPercent: 0, duration: 0.75, ease: "expo.inOut" }, 0.25)
      .to(R, { xPercent: 0, duration: 0.75, ease: "expo.inOut" }, 0.25)
      .to(ring, { scale: 8, opacity: 0, duration: 0.9, ease: "power3.in" }, 0.4)
      .to(seam, { scaleX: 40, opacity: 0, duration: 0.5, ease: "power2.in" }, 0.5)
      .to(imgs, { scale: 1, duration: 1.0, ease: "expo.out" }, 0.4);
  }

  /* Handle a click on an internal link. */
  function handleLinkClick(e) {
    var link = e.currentTarget;
    var href = link.getAttribute("href");

    if (!isInternalLink(href)) return;

    /* If reduced motion or no gsap, let the browser navigate normally. */
    if (reduced || !hasGsap) return;

    e.preventDefault();

    var doors = ensureDoors();

    /* After the doors fully cover the screen, navigate. */
    playCloseDoors(doors, function () {
      window.location.href = href;
    });

    /* Safety fallback — if something breaks and the onComplete never
       fires, force the navigation after 1.5 seconds. */
    setTimeout(function () {
      if (window.location.pathname.indexOf(href.split("?")[0]) === -1) {
        window.location.href = href;
      }
    }, 1500);
  }

  /* Attach the click handler to every internal link on the page. */
  function init() {
    var links = document.querySelectorAll('a[href]');
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!isInternalLink(href)) return;
      link.addEventListener("click", handleLinkClick);
    });

    /* Handle back/forward navigation — nothing to do, but ensure the
       doors are hidden if we arrive via history. */
    window.addEventListener("pageshow", function () {
      var doors = document.getElementById("psaDoors");
      if (doors) doors.style.visibility = "hidden";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();