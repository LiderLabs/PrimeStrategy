/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // HUB
   Desktop: 3D card carousel.
   Mobile (≤ 900px): vertical full-bleed card stack with dots.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var canvas = document.getElementById("hub-canvas");
  var hub = document.getElementById("hub");
  var mobileContainer = document.getElementById("hubMobile");
  if (!hub) return;

  /* ─── SECTIONS & BRAND PALETTES ─── */
  var SECTIONS = [
    {
      id: "about",
      eyebrow: "OVERVIEW AND LEADERSHIP",
      title: "About PrimeStrategy",
      subtitle: "Executive leadership and corporate principles guiding enterprise transformation.",
      summary: "A premier research and IT advisory consultancy. We partner with forward looking organizations using deep industry expertise in strategy, operations, IT, and research to drive measurable results.",
      href: "about.html",
      accent: "#FFEBD2",
      image: "images/about-bg.jpg",
      washColors: ["rgba(10, 30, 69, 0.84)", "rgba(14, 47, 107, 0.78)", "rgba(6, 18, 42, 0.92)"]
    },
    {
      id: "services",
      eyebrow: "ADVISORY PRACTICE",
      title: "Five Disciplines.\nOne Conviction.",
      subtitle: "Ten targeted practice areas turning research into market advantage.",
      summary: "Full spectrum enterprise solutions including Consumer Research, Focus Group Discussions, Mystery Shopping, Management Consulting, Market Sizing, and Custom Software Engineering.",
      href: "services.html",
      accent: "#FFEBD2",
      image: "images/card-services.jpg",
      washColors: ["rgba(178, 63, 18, 0.86)", "rgba(212, 82, 30, 0.80)", "rgba(140, 48, 12, 0.92)"]
    },
    {
      id: "casestudy",
      eyebrow: "INDUSTRY FOCUS AND BRIEF",
      title: "Sectors Facing\nGrowth and Pressure",
      subtitle: "Empirical market intelligence across Ghana's key sectors.",
      summary: "We specialize in serving clients across all major Ghanaian industries with deep focus in oil and gas, finance, insurance, retail banking, and public sector regulatory landscapes.",
      href: "case-study.html",
      accent: "#E86A34",
      image: "images/card-casestudy.jpg",
      washColors: ["rgba(6, 23, 53, 0.88)", "rgba(10, 30, 69, 0.82)", "rgba(4, 14, 34, 0.94)"]
    },
    {
      id: "careers",
      eyebrow: "FIELD FORCE AND TALENT",
      title: "Careers and Leadership",
      subtitle: "Recruiting analysts, engineers, and strategic consultants.",
      summary: "Join our consulting practice. We seek analysts, field supervisors, software engineers, and consultants passionate about empirical rigor and large scale business transformation.",
      href: "careers.html",
      accent: "#FFEBD2",
      image: "images/card-careers.jpg",
      washColors: ["rgba(14, 47, 107, 0.86)", "rgba(30, 79, 168, 0.78)", "rgba(10, 30, 69, 0.92)"]
    },
    {
      id: "contact",
      eyebrow: "DIRECT CONSULTING DESK",
      title: "Get in Touch with Us",
      subtitle: "Direct desk engagement for executive inquiries and tenders.",
      summary: "Headquartered at Aseda Plaza, Ashalley Botwe, Accra, Ghana, with liaison presence in Washington D.C. Engaging corporate boards, public commissions, and enterprise teams.",
      href: "contact.html",
      accent: "#FFEBD2",
      image: "images/card-contact.jpg",
      washColors: ["rgba(156, 51, 11, 0.88)", "rgba(178, 63, 18, 0.80)", "rgba(115, 36, 7, 0.94)"]
    }
  ];

  var TOTAL = SECTIONS.length;

  /* ═══════════════════════════════════════════════════════════════
     MOBILE PATH — vertical full-bleed card stack
     ═══════════════════════════════════════════════════════════════ */

  function isMobile() {
    return window.innerWidth <= 900;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function renderTitleHTML(raw) {
    // Wrap the text after the first period-ish or after an italic hint.
    // Our titles have no explicit <em> in data, so we italicize the last word
    // when it's short and punchy. Simpler: preserve \n line breaks.
    return escapeHTML(raw).replace(/\n/g, "<br>");
  }

  function buildMobile() {
    if (!mobileContainer) return;

    // Build the cards
    var cardsHTML = SECTIONS.map(function (s, i) {
      var wash0 = s.washColors[0];
      var wash1 = s.washColors[1];
      var wash2 = s.washColors[2];
      return (
        '<a class="hub-mobile__card" href="' + s.href + '" ' +
          'data-index="' + i + '" ' +
          'style="' +
            '--card-image: url(' + s.image + ');' +
            '--wash-0: ' + wash0 + ';' +
            '--wash-1: ' + wash1 + ';' +
            '--wash-2: ' + wash2 + ';' +
          '">' +
          '<span class="hub-mobile__eyebrow">' + escapeHTML(s.eyebrow) + '</span>' +
          '<h2 class="hub-mobile__title">' + renderTitleHTML(s.title) + '</h2>' +
          '<p class="hub-mobile__subtitle">' + escapeHTML(s.subtitle) + '</p>' +
          '<p class="hub-mobile__summary">' + escapeHTML(s.summary) + '</p>' +
          '<span class="hub-mobile__cta">Explore →</span>' +
        '</a>'
      );
    }).join("");

    // Progress dots
    var dotsHTML = SECTIONS.map(function (s, i) {
      return '<span class="hub-mobile__dot' + (i === 0 ? " is-active" : "") + '"></span>';
    }).join("");

    mobileContainer.innerHTML =
      cardsHTML +
      '<div class="hub-mobile__dots" aria-hidden="true">' + dotsHTML + '</div>' +
      '<div class="hub-mobile__hint" id="hubMobileHint" aria-hidden="true">' +
        '<span>Scroll</span><span class="hub-mobile__hint-arrow">↓</span>' +
      '</div>';

    // Update dots on scroll
    var dots = mobileContainer.querySelectorAll(".hub-mobile__dot");
    var cards = mobileContainer.querySelectorAll(".hub-mobile__card");
    var hint = document.getElementById("hubMobileHint");
    var ticking = false;

    function updateActive() {
      var vh = window.innerHeight;
      var scrollTop = mobileContainer.scrollTop;
      var idx = Math.round(scrollTop / vh);
      if (idx < 0) idx = 0;
      if (idx >= dots.length) idx = dots.length - 1;

      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === idx);
      });

      if (hint) {
        if (scrollTop > 40) hint.classList.add("is-hidden");
        else hint.classList.remove("is-hidden");
      }

      ticking = false;
    }

    mobileContainer.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActive);
    }, { passive: true });

    updateActive();
  }

  /* ═══════════════════════════════════════════════════════════════
     DESKTOP PATH — existing 3D carousel (unchanged)
     ═══════════════════════════════════════════════════════════════ */

  function buildDesktop() {
    if (!canvas || typeof THREE === "undefined") return;

    /* ─── DIMENSIONS ─── */
    var CARD_W = 7.6, CARD_H = 4.28, CARD_D = 0.10, FLOOR_Y = -2.9;

    /* ─── CAMERA ─── */
    var BASE_CAM_POS = new THREE.Vector3(0, 0.15, 12.4);
    var BASE_CAM_LOOK = new THREE.Vector3(0, 0.0, 0);

    var width = hub.clientWidth || window.innerWidth;
    var height = hub.clientHeight || window.innerHeight;

    /* ─── RENDERER ─── */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 100);
    camera.position.copy(BASE_CAM_POS);
    camera.lookAt(BASE_CAM_LOOK);

    /* ─── LIGHTS ─── */
    scene.add(new THREE.AmbientLight(0xffffff, 1.35));
    var keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(-4, 8, 7);
    scene.add(keyLight);
    var fillLight = new THREE.DirectionalLight(0xE8EEF8, 0.35);
    fillLight.position.set(6, 3, 5);
    scene.add(fillLight);

    var chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1A2233,
      metalness: 0.15,
      roughness: 0.65
    });

    /* ═══ HELPERS ═══ */
    function wrapLines(ctx, text, maxWidth) {
      if (!text) return [];
      var paragraphs = text.split("\n");
      var allLines = [];
      paragraphs.forEach(function (para) {
        var words = para.split(" "), line = "";
        for (var i = 0; i < words.length; i++) {
          var test = line ? line + " " + words[i] : words[i];
          if (ctx.measureText(test).width > maxWidth && line) {
            allLines.push(line); line = words[i];
          } else line = test;
        }
        if (line) allLines.push(line);
      });
      return allLines;
    }

    /* ═══ CARD TEXTURE ═══ */
    function renderCardCanvas(c, section, index, image) {
      var W = 2200, H = 1237;
      c.width = W; c.height = H;
      var ctx = c.getContext("2d");

      if (image && image.complete && image.naturalWidth > 0) {
        var imgAspect = image.naturalWidth / image.naturalHeight;
        var cardAspect = W / H;
        var drawW, drawH, drawX, drawY;

        if (imgAspect > cardAspect) {
          drawH = H;
          drawW = H * imgAspect;
          drawX = (W - drawW) / 2;
          drawY = 0;
        } else {
          drawW = W;
          drawH = W / imgAspect;
          drawX = 0;
          drawY = (H - drawH) / 2;
        }
        ctx.drawImage(image, drawX, drawY, drawW, drawH);
      } else {
        var fb = ctx.createLinearGradient(0, 0, W, H);
        fb.addColorStop(0, section.washColors[0]);
        fb.addColorStop(1, section.washColors[2]);
        ctx.fillStyle = fb;
        ctx.fillRect(0, 0, W, H);
      }

      var wash = ctx.createLinearGradient(0, 0, W * 0.9, H);
      wash.addColorStop(0.0, section.washColors[0]);
      wash.addColorStop(0.55, section.washColors[1]);
      wash.addColorStop(1.0, section.washColors[2]);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);

      var vig = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.25, W * 0.5, H * 0.5, W * 0.75);
      vig.addColorStop(0.0, "rgba(0, 0, 0, 0.0)");
      vig.addColorStop(0.65, "rgba(0, 0, 0, 0.24)");
      vig.addColorStop(1.0, "rgba(0, 0, 0, 0.62)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      var padX = 140;
      var padRight = W - 140;
      var padTop = 150;

      ctx.fillStyle = section.accent;
      ctx.font = "700 34px 'JetBrains Mono', Menlo, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.letterSpacing = "0.28em";
      ctx.fillText(section.eyebrow, padX, padTop);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 130px 'Fraunces', 'Playfair Display', Georgia, serif";
      ctx.letterSpacing = "-0.035em";

      var titleLines = wrapLines(ctx, section.title, padRight - padX);
      var titleY = padTop + 168;
      var lineHeight = 146;

      for (var i = 0; i < titleLines.length && i < 3; i++) {
        ctx.fillText(titleLines[i], padX, titleY + i * lineHeight);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.font = "600 52px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
      ctx.letterSpacing = "-0.010em";

      var subLines = wrapLines(ctx, section.subtitle, Math.min(1800, padRight - padX));
      var subY = titleY + titleLines.length * lineHeight + 48;
      var subLineHeight = 68;

      for (var j = 0; j < Math.min(subLines.length, 2); j++) {
        ctx.fillText(subLines[j], padX, subY + j * subLineHeight);
      }

      var summaryY = subY + Math.min(subLines.length, 2) * subLineHeight + 84;

      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.font = "500 48px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
      ctx.letterSpacing = "-0.008em";

      var sumLines = wrapLines(ctx, section.summary, padRight - padX);
      var sumLineHeight = 68;
      var maxSumLines = Math.min(sumLines.length, 5);

      for (var m = 0; m < maxSumLines; m++) {
        ctx.fillText(sumLines[m], padX, summaryY + m * sumLineHeight);
      }
    }

    /* ═══ TEXTURES ═══ */
    var textures = [];
    var canvases = [];

    SECTIONS.forEach(function (s, i) {
      var c = document.createElement("canvas");
      renderCardCanvas(c, s, i, null);
      var tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      textures[i] = tex;
      canvases[i] = c;

      if (s.image) {
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
          renderCardCanvas(canvases[i], s, i, img);
          textures[i].needsUpdate = true;
        };
        img.onerror = function () {};
        img.src = s.image;
      }
    });

    /* ─── 3D CARD ARENA ─── */
    var arenaGroup = new THREE.Group();
    scene.add(arenaGroup);

    function buildBezelGeometry() {
      var shape = new THREE.Shape();
      var w = CARD_W / 2, h = CARD_H / 2;
      shape.moveTo(-w, -h);
      shape.lineTo(w, -h);
      shape.lineTo(w, h);
      shape.lineTo(-w, h);
      shape.closePath();
      var geo = new THREE.ExtrudeGeometry(shape, {
        depth: CARD_D,
        bevelEnabled: true,
        bevelThickness: 0.014,
        bevelSize: 0.014,
        bevelSegments: 4
      });
      geo.center();
      return geo;
    }

    var cards = [];
    function buildCard(sectionIndex, idx) {
      var group = new THREE.Group();

      var body = new THREE.Mesh(buildBezelGeometry(), chassisMat);
      group.add(body);

      var screenMat = new THREE.MeshBasicMaterial({
        map: textures[sectionIndex],
        polygonOffset: true,
        polygonOffsetFactor: -1.0,
        polygonOffsetUnits: -4.0
      });

      var screen = new THREE.Mesh(
        new THREE.PlaneGeometry(CARD_W - 0.02, CARD_H - 0.02),
        screenMat
      );
      screen.position.z = CARD_D / 2 + 0.035;
      screen.userData.parentGroup = group;
      group.add(screen);

      var sC = document.createElement("canvas");
      sC.width = 512; sC.height = 128;
      var sctx = sC.getContext("2d");
      var sGrad = sctx.createRadialGradient(256, 64, 0, 256, 64, 200);
      sGrad.addColorStop(0, "rgba(10, 30, 69, 0.28)");
      sGrad.addColorStop(0.5, "rgba(10, 30, 69, 0.06)");
      sGrad.addColorStop(1, "rgba(10, 30, 69, 0)");
      sctx.fillStyle = sGrad;
      sctx.fillRect(0, 0, 512, 128);

      var shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(CARD_W * 1.05, 1.1),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(sC),
          transparent: true,
          opacity: 0.55,
          depthWrite: false
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = FLOOR_Y + 0.005;
      arenaGroup.add(shadow);

      group.userData = {
        index: idx,
        sectionIndex: sectionIndex,
        screenMat: screenMat,
        shadow: shadow
      };

      arenaGroup.add(group);
      cards.push(group);
    }

    for (var i = 0; i < TOTAL; i++) buildCard(i, i);

    /* ─── STATE ─── */
    var activeIndex = 0;
    var currentProgress = 0;
    var targetProgress = 0;
    var isNavigating = false;

    var isUserInteracting = false;
    var idleTimer = null;
    var autoPlayInterval = null;

    function stepCard(dir) {
      if (isNavigating) return;
      targetProgress = Math.round(targetProgress + dir);
      activeIndex = ((targetProgress % TOTAL) + TOTAL) % TOTAL;
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(function () {
        if (!isUserInteracting && !isNavigating) {
          stepCard(1);
        }
      }, 4600);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) clearInterval(autoPlayInterval);
    }

    function markUserInteraction() {
      isUserInteracting = true;
      stopAutoPlay();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        isUserInteracting = false;
        startAutoPlay();
      }, 6000);
    }

    startAutoPlay();

    /* ─── CAROUSEL LAYOUT ─── */
    function layoutCards(prog) {
      for (var i = 0; i < TOTAL; i++) {
        var card = cards[i];
        var diff = i - prog;
        while (diff > TOTAL / 2) diff -= TOTAL;
        while (diff < -TOTAL / 2) diff += TOTAL;

        var absDiff = Math.abs(diff);

        var arcX = diff * 8.4;
        var arcZ = -absDiff * 2.4;
        var arcRotY = -diff * 0.22;
        var arcScale = Math.max(0.78, 1 - absDiff * 0.12);

        card.position.set(arcX, 0, arcZ);
        card.rotation.set(0, arcRotY, 0);
        card.scale.setScalar(arcScale);

        var arcOpacity = Math.max(0, 1 - absDiff * 0.55);
        card.visible = arcOpacity > 0.02;

        card.userData.shadow.position.set(card.position.x, FLOOR_Y + 0.005, card.position.z);
        card.userData.shadow.scale.setScalar(arcScale);
        card.userData.shadow.visible = card.visible;
      }
    }

    /* ─── INPUT ─── */
    var swipeLock = false;
    var swipeLockTimer = null;

    window.addEventListener("wheel", function (e) {
      if (isNavigating) return;
      markUserInteraction();

      var horizontal = Math.abs(e.deltaX) > 16 && Math.abs(e.deltaX) > Math.abs(e.deltaY);
      var vertical = Math.abs(e.deltaY) > 16;

      if (!horizontal && !vertical) return;
      e.preventDefault();

      if (swipeLock) return;
      swipeLock = true;
      clearTimeout(swipeLockTimer);
      swipeLockTimer = setTimeout(function () { swipeLock = false; }, 340);

      if (horizontal) {
        stepCard(e.deltaX > 0 ? 1 : -1);
      } else {
        stepCard(e.deltaY > 0 ? 1 : -1);
      }
    }, { passive: false });

    var dragStartX = 0, dragStartY = 0, isDragging = false;
    hub.addEventListener("mousedown", function (e) {
      markUserInteraction();
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      isDragging = true;
    });
    window.addEventListener("mouseup", function (e) {
      if (!isDragging) return;
      isDragging = false;
      var diffX = dragStartX - e.clientX;
      var diffY = dragStartY - e.clientY;

      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        stepCard(diffX > 0 ? 1 : -1);
      } else if (Math.abs(diffY) > 45) {
        stepCard(diffY > 0 ? 1 : -1);
      }
    });

    window.addEventListener("keydown", function (e) {
      markUserInteraction();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); stepCard(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); stepCard(-1); }
      else if (e.key === "Enter") { e.preventDefault(); navigateToActive(); }
    });

    var raycaster = new THREE.Raycaster();
    var mouseNDC = new THREE.Vector2();

    function updatePointerNDC(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function navigateToActive() {
      if (isNavigating) return;
      var s = SECTIONS[activeIndex];
      if (!s || !s.href) return;
      isNavigating = true;

      var startCam = camera.position.clone();
      var targetCam = new THREE.Vector3(0, 0.05, 5.2);
      var start = performance.now();
      var duration = 520;

      function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
      function camAnim() {
        var t = Math.min((performance.now() - start) / duration, 1);
        camera.position.lerpVectors(startCam, targetCam, easeOut(t));
        if (t < 1) requestAnimationFrame(camAnim);
      }
      camAnim();

      setTimeout(function () {
        window.location.href = s.href;
      }, 480);
    }

    canvas.addEventListener("click", function (e) {
      if (isNavigating) return;
      markUserInteraction();
      updatePointerNDC(e.clientX, e.clientY);
      raycaster.setFromCamera(mouseNDC, camera);

      var hitScreens = [];
      cards.forEach(function (c) { hitScreens.push(c.children[1]); });
      var hits = raycaster.intersectObjects(hitScreens);

      if (hits.length > 0) {
        var clickedCard = hits[0].object.userData.parentGroup;
        var secIndex = clickedCard.userData.sectionIndex;
        if (secIndex === activeIndex) {
          navigateToActive();
        } else {
          targetProgress = secIndex;
          activeIndex = secIndex;
        }
      }
    });

    function loop() {
      requestAnimationFrame(loop);
      currentProgress += (targetProgress - currentProgress) * 0.12;
      layoutCards(currentProgress);
      renderer.render(scene, camera);
    }
    loop();

    window.addEventListener("resize", function () {
      if (!hub.clientWidth || !hub.clientHeight) return;
      renderer.setSize(hub.clientWidth, hub.clientHeight);
      camera.aspect = hub.clientWidth / hub.clientHeight;
      camera.updateProjectionMatrix();
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     BOOT — pick the right path
     ═══════════════════════════════════════════════════════════════ */

  if (isMobile()) {
    buildMobile();
  } else {
    buildDesktop();
  }

})();