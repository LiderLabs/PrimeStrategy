/* ═══════════════════════════════════════════════════════════════════
   PRIMESTRATEGY // SECTIONS & PARALLEL SWIPES ENGINE
   - Alternating parallel swipe page transitions
   - About section is now HTML-owned (see index.html #about-section)
   - About injection functions REMOVED (buildCeoDeck, buildAboutBands,
     animateAboutBands) so the hand-authored About markup is the only
     source of truth.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var mobile = window.innerWidth < 900;

  var LOGO_SRC = "images/ps-logo.png";

  /* ═══ CONTENT ═══ */
  var SERVICES_LEAD = "Ten targeted practice areas turning empirical data, strategy, and technology into measurable growth.";
  var SERVICES = [
    { name: "Consumer Research", text: "Tailored consumer studies uncovering preferences, loyalty, and brand equity to strengthen strategic market positioning." },
    { name: "Focus Group Discussion (FGD)", text: "Full-service focus group moderation in modern facilities, delivering critical qualitative insights with strategic recommendations." },
    { name: "Management Consulting", text: "Business advisory and organizational implementation services designed to refine strategy, operational workflows, and executive performance." },
    { name: "Mystery Shopping", text: "Trained field evaluators collecting digital audio-visual telemetry, transformed into actionable service-level enhancement reports." },
    { name: "Market Sizing", text: "Determining addressable market volume, segment opportunities, and barriers to arm leadership with competitive entry solutions." },
    { name: "Market Analysis", text: "Comprehensive assessments covering consumer trends, distribution channels, competitor positioning, and demographic segmentation." },
    { name: "Market Research", text: "Quantitative and qualitative primary market studies helping corporations defend competitive advantage and achieve category leadership." },
    { name: "Data Analytics", text: "Cutting-edge data science pipelines identifying client characteristics to support informed, transformative enterprise decisions." },
    { name: "Software Development", text: "Customized enterprise IT engineering that leverages digital tools to minimize operating costs and raise productivity." },
    { name: "Data Capture and Entry", text: "Structured, quality-controlled capture of field, survey, and legacy document data ensuring reliable analytics foundations." }
  ];

  /* Legacy CEO copy — no longer injected into the DOM (About is HTML-owned).
     Kept here for reference only. */
  var CEO_WORDS = [
    { tag: "Execution and Strategy", title: "Partnerships that execute", text: "Today, corporations must execute projects and achieve goals with greater sophistication and speed. Meeting these demands is no easy task. While business execution naturally requires strategy, it can only be fully realized through partnerships that leverage skilled resources to plan and execute goals." },
    { tag: "Our Greatest Strength", title: "The conviction behind every engagement", text: "Our greatest strength as a business is the firm conviction that we can contribute to the realization of our clients’ goals through all the various stages of their growth and business cycle. PrimeStrategy delivers quality solutions and meaningful results to support our client’s long term strategic objectives." },
    { tag: "Our Professionals", title: "Deep industry knowledge", text: "Our professionals use deep industry knowledge and expertise in strategy, business operations, project management, information technology, research and data analytics to drive sustainable and measurable results." },
    { tag: "Industry Focus and Growth", title: "Sectors facing growth and pressure", text: "We specialize in serving clients in all industries with deep focus in the oil and gas, finance, service, real estate, insurance, banking, manufacturing, government and non-profit sectors. As these sectors face significant growth and pressure from today’s dynamic market environment, we provide key strategies and resources to ensure successful operations in Ghana and globally." }
  ];

  var CASE_PARTS = [
    { title: "Introduction", text: "An overview of the insurance industry in Ghana, its economic purpose, and systemic role in risk management across enterprise and household segments." },
    { title: "Industry Structure", text: "The landscape of 139 regulated insurance entities, brokers, loss adjusters, and intermediaries operating under the National Insurance Commission." },
    { title: "Regulation", text: "Supervisory frameworks, solvency benchmarks, and capital requirements shaping the stability and governance of operating underwriters." },
    { title: "Market Performance", text: "Premium growth trajectories, gross underwriting volumes, penetration benchmarks, and retention metrics across recent financial years." },
    { title: "Challenges", text: "Low consumer awareness, public trust deficits, informal economy distribution barriers, and manual claim processing bottlenecks." },
    { title: "Outlook & Growth", text: "Opportunities unlocked through mobile micro-insurance, digital aggregators, regulatory capital consolidation, and mandatory compliance lines." }
  ];

  /* Legacy About copy — no longer injected into the DOM. Kept for reference. */
  var ABOUT_BLOCKS = [
    { label: "Who we are", text: "PrimeStrategy Ghana Limited is a premier research and IT consulting firm that partners with diverse organizations to support their immediate priorities and future strategic goals." },
    { label: "What drives results", text: "We deliver quality solutions and meaningful results to support our clients’ long-term objectives. Our professionals leverage deep industry expertise in business operations, project management, IT, research, and data analytics to drive measurable outcomes." },
    { label: "Our conviction", text: "Our greatest strength as a business is the firm conviction that we can contribute to the realization of our clients’ goals through genuine strategic partnership across every stage of their business cycle." }
  ];

  var OFFER_LEAD = "We deliver targeted, customized solutions for our clients, creating measurable value throughout every phase of our engagement.";
  var OFFER_CARDS = [
    { title: "Value-added results", text: "Customized solutions engineered to generate tangible return on investment at every milestone of strategic execution." },
    { title: "Value-based pricing", text: "A transparent value-based model that aligns our fees directly with the performance and measurable success of the engagement." },
    { title: "Cutting-edge technology", text: "Leveraging empirical research pipelines and contemporary analytics to accelerate institutional transformation and operational speed." }
  ];
  var OFFER_TAGS = ["Data Analytics", "Customized IT Solutions", "Business Intelligence", "Project Management", "Consumer Research", "Market Sizing"];

  var COUNTRIES = ["Ghana", "Nigeria", "Togo", "Benin", "Burkina Faso", "Cote d'Ivoire", "Senegal", "Liberia", "Sierra Leone", "Kenya", "Uganda", "Tanzania", "Rwanda", "Ethiopia", "Egypt", "South Africa", "United States", "Canada", "United Kingdom", "Germany", "France", "Other"];

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function toArr(list) { return Array.prototype.slice.call(list); }

  function scrollToY(y) {
    if (window.PS && window.PS.lenis) window.PS.lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }

  function tilt(el, max) {
    if (!hasGsap || !fine || reduced) return;
    var rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    var ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ry((x - 0.5) * max);
      rx((y - 0.5) * -max);
    });
    el.addEventListener("pointerleave", function () { rx(0); ry(0); });
  }

  /* ═════════════════════════════════════════════════════════════════
     ABOUT — REMOVED
     The About section is now hand-authored in index.html and styled
     by css/brand.css. The old runtime-injection functions
     (buildCeoDeck, buildAboutBands, animateAboutBands) have been
     deleted so nothing competes with the HTML-owned markup.
     ═════════════════════════════════════════════════════════════════ */

  /* ═══════════════ SERVICES GALLERY ═══════════════ */
  function buildServices() {
    var sec = document.getElementById("services-section");
    if (!sec) return null;
    var stack = mobile || reduced || !hasGsap;
    sec.classList.toggle("svx--stack", stack);
    sec.innerHTML =
      '<div class="container">' +
        '<div class="svx-intro" style="text-align: center; margin-bottom: 50px;">' +
          '<span class="section-eyebrow" style="color: var(--ps-light-orange);">What we do</span>' +
          '<h2 class="section-main-heading">Our Services</h2>' +
          '<p style="max-width: 640px; margin: 0 auto; color: var(--ps-grey); font-size: 1.05rem; line-height: 1.65;">' + esc(SERVICES_LEAD) + '</p>' +
        '</div>' +
        '<div class="svx-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 26px;">' +
          SERVICES.map(function (s, i) {
            var num = (i + 1 < 10 ? "0" : "") + (i + 1);
            return '<article class="svx-card" style="background: #FFFFFF; border: 1px solid rgba(255,160,77,0.22); border-radius: 22px; padding: 34px; box-shadow: 0 16px 36px -12px rgba(5,13,51,0.06); transition: transform 0.3s ease, border-color 0.3s ease;">' +
              '<span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--ps-light-orange); display: block; margin-bottom: 12px;">' + num + ' // PRACTICE</span>' +
              '<h3 style="font-size: 1.38rem; font-weight: 700; color: var(--ps-ink); margin-bottom: 14px;">' + esc(s.name) + '</h3>' +
              '<p style="color: var(--ps-grey); line-height: 1.65; margin: 0; font-size: 0.94rem;">' + esc(s.text) + '</p>' +
            '</article>';
          }).join("") +
        '</div>' +
      '</div>';
    return { sec: sec, stack: stack };
  }

  function animateServices(built) {
    if (!built || !hasGsap || reduced) return;
    document.querySelectorAll(".svx-card").forEach(function (c) {
      tilt(c, 10);
      c.addEventListener("mouseenter", function () {
        c.style.borderColor = "var(--ps-light-orange)";
        c.style.transform = "translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () {
        c.style.borderColor = "rgba(255,160,77,0.22)";
        c.style.transform = "translateY(0)";
      });
    });
  }

  /* ═══════════════ PARALLEL ALTERNATING SWIPE TRANSITIONS ═══════════════ */
  var SWIPES = [
    ["#services-section",   { xPercent: 100,  y: 0,    rotation: 6,  scale: 1 }],
    ["#case-study-section", { xPercent: -75,  y: 0.3,  rotation: -7, scale: 1 }],
    ["#careers-section",    { xPercent: -100, y: 0,    rotation: -6, scale: 1 }],
    ["#contact-section",    { xPercent: 75,   y: 0.3,  rotation: 7,  scale: 1 }],
    ["#login-section",      { xPercent: 100,  y: 0,    rotation: 0,  scale: 0.75 }]
  ];

  function initSwipes() {
    if (!hasGsap || reduced) return;
    var k = mobile ? 0.45 : 1;
    SWIPES.forEach(function (s) {
      var el = document.querySelector(s[0]);
      if (!el) return;
      var f = s[1];
      el.classList.add("ps-swipe");
      gsap.fromTo(el,
        {
          xPercent: f.xPercent,
          y: function () { return f.y * window.innerHeight; },
          rotation: f.rotation * k,
          scale: f.scale,
          borderRadius: 48,
          transformOrigin: "50% 0%"
        },
        {
          xPercent: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          borderRadius: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 12%",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    });
  }

  /* ═══════════════ FOOTER ═══════════════ */
  function buildFooter() {
    var footer = document.querySelector(".ps-glass-footer");
    if (!footer) return;
    footer.innerHTML =
      '<div class="container" style="padding-top: 70px; padding-bottom: 60px;">' +
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 40px; align-items: start;">' +
          '<div>' +
            '<img src="' + LOGO_SRC + '" alt="PrimeStrategy Logo" style="height: 42px; width: auto; margin-bottom: 16px;">' +
            '<p style="color: #A6B4C9; font-size: 0.95rem; line-height: 1.65; max-width: 320px;">The Business Transformation Experts. Enterprise research, analytics and advisory consulting.</p>' +
          '</div>' +
          '<div>' +
            '<h5 style="color: var(--ps-light-orange); font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 16px;">Headquarters</h5>' +
            '<p style="color: #E2E8F0; font-size: 0.95rem; line-height: 1.65; margin: 0;">Aseda Plaza, D537 Ashalley Botwe<br>School Junction, Accra, Ghana</p>' +
          '</div>' +
          '<div>' +
            '<h5 style="color: var(--ps-light-orange); font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 16px;">Direct Enquiries</h5>' +
            '<p style="color: #E2E8F0; font-size: 0.95rem; line-height: 1.65; margin: 0;">' +
              'Helpline: <a href="tel:+233303973874" style="color: #FFF; text-decoration: none;">(030) 3973 874</a><br>' +
              'Email: <a href="mailto:info@primestrategygh.com" style="color: #FFF; text-decoration: none;">info@primestrategygh.com</a>' +
            '</p>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top: 50px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.12); text-align: center; color: #8E9AB0; font-size: 12.5px;">' +
          '&copy; ' + new Date().getFullYear() + ' PrimeStrategy Limited. All rights reserved. Accra · Washington D.C.' +
        '</div>' +
      '</div>';
  }

  /* ═══════════════ CASE STUDY ACCORDION & COUNTERS ═══════════════ */
  function buildCaseStudy() {
    var rail = document.getElementById("csRail");
    var panels = document.getElementById("csPanels");
    if (!rail || !panels) return;

    CASE_PARTS.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = p.title;
      btn.style.cssText = "display: block; width: 100%; text-align: left; padding: 12px 18px; font-size: 14px; font-weight: 600; color: var(--ps-grey); background: none; border: none; border-left: 2px solid rgba(255,160,77,0.2); cursor: pointer; transition: all 0.25s ease;";
      rail.appendChild(btn);

      var panel = document.createElement("div");
      panel.className = "cs__panel";
      panel.id = "cs-part-" + i;
      panel.style.cssText = "padding: 18px 0 34px;";
      panel.innerHTML = '<h3 style="font-size: 1.45rem; font-weight: 700; color: var(--ps-ink); margin-bottom: 12px;">' + esc(p.title) + '</h3><p style="color: var(--ps-grey); line-height: 1.7; font-size: 0.98rem; max-width: 640px;">' + esc(p.text) + '</p>';
      panels.appendChild(panel);

      btn.addEventListener("click", function () {
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setActive(i);
      });
    });

    function setActive(idx) {
      toArr(rail.children).forEach(function (b, j) {
        b.style.color = j === idx ? "var(--ps-light-orange)" : "var(--ps-grey)";
        b.style.borderLeftColor = j === idx ? "var(--ps-light-orange)" : "rgba(255,160,77,0.2)";
        b.style.paddingLeft = j === idx ? "24px" : "18px";
      });
    }
    setActive(0);

    /* Stat Counters */
    document.querySelectorAll(".cs__stat b").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (!hasGsap || reduced) { el.textContent = end.toFixed(dec) + suffix; return; }
      var o = { v: 0 };
      gsap.to(o, {
        v: end, duration: 2, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: function () { el.textContent = o.v.toFixed(dec) + suffix; }
      });
    });
  }

  /* ═══════════════ COUNTRY SELECT & FORMS ═══════════════ */
  var select = document.getElementById("countrySelect");
  if (select) {
    COUNTRIES.forEach(function (c) {
      var o = document.createElement("option");
      o.textContent = c;
      select.appendChild(o);
    });
  }

  function wireForm(id, message) {
    var f = document.getElementById(id);
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = f.querySelector(".ps-form__msg");
      if (msg) msg.textContent = message;
    });
  }
  wireForm("careerForm", "Thank you. Your application has been logged.");
  wireForm("contactForm", "Thank you. Your message has been received.");
  wireForm("loginForm", "Institutional login portal active.");

  /* ═══════════════ BOOT ═══════════════ */
  /* About is HTML-owned now — nothing to build or animate from JS.
     Removed: buildAboutBands(); buildCeoDeck(); animateAboutBands(); */
  var services = buildServices();
  initSwipes();
  animateServices(services);
  buildFooter();
  buildCaseStudy();

  if (hasGsap) {
    document.addEventListener("ps:site-enter", function () {
      setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    });
  }
})();