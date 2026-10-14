/* PrimeStrategy // Nav
   Mobile toggle + active link highlight for the .ps-nav component.
   Load on every sub-page. */
(function () {
  "use strict";

  function initMobileToggle() {
    var nav = document.querySelector(".ps-nav");
    if (!nav) return;
    var toggle = nav.querySelector(".ps-nav__toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      nav.classList.toggle("ps-nav--open");
    });

    // Close menu when a nav link is clicked
    nav.querySelectorAll(".ps-nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("ps-nav--open");
      });
    });

    // Close menu on resize to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) nav.classList.remove("ps-nav--open");
    });
  }

  function highlightActiveLink() {
    var path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (path === "") path = "index.html";

    document.querySelectorAll(".ps-nav__links a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path) a.classList.add("is-active");
    });
  }

  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  onReady(function () {
    initMobileToggle();
    highlightActiveLink();
  });
})();