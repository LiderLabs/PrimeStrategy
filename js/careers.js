/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // CAREERS PAGE
   Staircase reveal on scroll. Front-end form handling.
   Menu toggle handled by js/nav.js.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ STAIRCASE REVEAL — per section, on scroll ═══ */
  function initReveals() {
    var sections = document.querySelectorAll(".cr-section");
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

  /* ═══ CAREERS FORM — front-end only ═══ */
  function initCareersForm() {
    var form = document.getElementById("careersForm");
    var msg = document.getElementById("formMsg");
    if (!form || !msg) return;

    function setMessage(text, type) {
      msg.textContent = text;
      msg.classList.remove("is-error", "is-success");
      if (type) msg.classList.add(type);
    }

    function validate() {
      // Clear previous
      setMessage("", null);

      var role = form.querySelector('[name="role"]');
      var firstName = form.querySelector('[name="firstName"]');
      var lastName = form.querySelector('[name="lastName"]');
      var email = form.querySelector('[name="email"]');
      var phone = form.querySelector('[name="phone"]');

      if (!role || !role.value) {
        setMessage("Please select a job role.", "is-error");
        role.focus();
        return false;
      }
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
      if (!phone || !phone.value.trim()) {
        setMessage("Please enter your phone number.", "is-error");
        phone.focus();
        return false;
      }
      return true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validate()) return;

      // ─────────────────────────────────────────────────────────
      // FRONT-END ONLY FOR NOW
      // To wire this up to a real backend, replace the block
      // below with a fetch() to your endpoint — e.g. Formspree:
      //
      //   var data = new FormData(form);
      //   fetch("https://formspree.io/f/YOUR_ID", {
      //     method: "POST",
      //     body: data,
      //     headers: { "Accept": "application/json" }
      //   })
      //   .then(function (res) { if (res.ok) { ... success ... } })
      //   .catch(function () { ... failure ... });
      //
      // For now, we simulate success after a short delay so the
      // user gets the full experience.
      // ─────────────────────────────────────────────────────────

      var submitBtn = form.querySelector(".cr-submit");
      var originalText = submitBtn ? submitBtn.textContent : "Submit";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
      setMessage("", null);

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        setMessage(
          "Thank you. Your application has been received. Our talent team will respond within two weeks.",
          "is-success"
        );
        form.reset();
      }, 900);
    });
  }

  /* ═══ NEWSLETTER FORM — front-end only ═══ */
  function initNewsletterForm() {
    var form = document.getElementById("newsletterForm");
    var msg = document.getElementById("newsMsg");
    if (!form || !msg) return;

    function setMessage(text, type) {
      msg.textContent = text;
      msg.classList.remove("is-error", "is-success");
      if (type) msg.classList.add(type);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var email = form.querySelector('[name="email"]');
      if (!email || !email.value.trim() || email.value.indexOf("@") === -1) {
        setMessage("Please enter a valid email address.", "is-error");
        if (email) email.focus();
        return;
      }

      // Front-end only for now — same pattern as above.
      var btn = form.querySelector(".cr-news__btn");
      var originalText = btn ? btn.textContent : "Subscribe";
      if (btn) { btn.disabled = true; btn.textContent = "Subscribing..."; }
      setMessage("", null);

      setTimeout(function () {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
        setMessage("You're on the list. We'll be in touch.", "is-success");
        form.reset();
      }, 700);
    });
  }

  /* ═══ BOOT ═══ */
  function boot() {
    initReveals();
    initCareersForm();
    initNewsletterForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();