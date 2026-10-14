/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // CONTACT PAGE
   Staircase reveal on scroll. Form handling (front-end only).
   Footer year auto-update. Menu toggle handled by js/nav.js.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ STAIRCASE REVEAL — per section, on scroll ═══ */
  function initReveals() {
    var sections = document.querySelectorAll(".ct-section");
    if (!sections.length) return;

    if (reduced || typeof IntersectionObserver === "undefined") {
      document.querySelectorAll("[data-stair]").forEach(function (el) {
        el.classList.add("is-stair");
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var section = entry.target;
          section.querySelectorAll("[data-stair]").forEach(function (el) {
            el.classList.add("is-stair");
          });
          io.unobserve(section);
        }
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.08
    });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ═══ CONTACT FORM — front-end only ═══ */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var msg = document.getElementById("contactMsg");
    if (!form || !msg) return;

    function setMessage(text, type) {
      msg.textContent = text;
      msg.classList.remove("is-error", "is-success");
      if (type) msg.classList.add(type);
    }

    function validate() {
      setMessage("", null);

      var firstName = form.querySelector('[name="firstName"]');
      var lastName  = form.querySelector('[name="lastName"]');
      var email     = form.querySelector('[name="email"]');
      var message   = form.querySelector('[name="message"]');

      if (!firstName || !firstName.value.trim()) {
        setMessage("Please enter your first name.", "is-error");
        firstName.focus();
        return false;
      }
      if (!lastName || !lastName.value.trim()) {
        setMessage("Please enter your last name.", "is-error");
        lastName.focus();
        return false;
      }
      if (!email || !email.value.trim() || email.value.indexOf("@") === -1) {
        setMessage("Please enter a valid email address.", "is-error");
        email.focus();
        return false;
      }
      if (!message || !message.value.trim()) {
        setMessage("Please include a short message.", "is-error");
        message.focus();
        return false;
      }
      return true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      /* ─────────────────────────────────────────────────────────
         FRONT-END ONLY FOR NOW.
         To connect a real backend (Formspree, Netlify Forms, custom
         endpoint), replace this block with a fetch() call:

           var data = new FormData(form);
           fetch("https://formspree.io/f/YOUR_ID", {
             method: "POST",
             body: data,
             headers: { "Accept": "application/json" }
           })
           .then(function (res) {
             if (res.ok) { setMessage("Thank you. ...", "is-success"); form.reset(); }
             else { setMessage("Something went wrong. ...", "is-error"); }
           })
           .catch(function () {
             setMessage("Network error. ...", "is-error");
           });

         For now, simulate success so the experience feels complete.
         ───────────────────────────────────────────────────────── */

      var submitBtn = form.querySelector(".ct-submit");
      var originalHTML = submitBtn ? submitBtn.innerHTML : "Send Message";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending...";
      }
      setMessage("", null);

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }
        setMessage(
          "Thank you. Your message has been received — our team will respond within two working days.",
          "is-success"
        );
        form.reset();
      }, 900);
    });
  }

  /* ═══ FOOTER YEAR ═══ */
  function initFooterYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ═══ BOOT ═══ */
  function boot() {
    initReveals();
    initContactForm();
    initFooterYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();