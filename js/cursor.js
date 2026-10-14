/* PrimeStrategy // Custom cursor
   Load on every page that has the cursor DOM nodes:
     <div class="ps-cursor-dot"></div>
     <div class="ps-cursor-ring"></div>
   Respects prefers-reduced-motion and disables on coarse pointers. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  if (!fine || reduced) return;

  function init() {
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
      var hit = !!e.target.closest("a, button, input, select, textarea, label, [data-cursor-hover]");
      if (hit === hovering) return;
      hovering = hit;
      document.body.classList.toggle("ps-cursor-hover", hit);
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();