/* ═══════════════════════════════════════════════════════════════
   PRIMESTRATEGY // HUB
   Desktop: 3D card carousel.
   Mobile (≤ 900px): vertical stack over the hub background.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var canvas = document.getElementById("hub-canvas");
  var hub = document.getElementById("hub");
  var mobileContainer = document.getElementById("hubMobile");
  if (!hub) return;

  /* ─── SECTIONS ─── */
  var SECTIONS = [
    {
      id: "about",
      eyebrow: "", 
      title: "About Us", 
      subtitle: "What We Do. Dedicated to helping organizations achieve sustainable growth.",
      summary: "We are an indigenous consulting firm providing practical solutions through strategic advisory, market research, and data analytics to public and private sector organizations.",
      href: "about.html",
      ctaLabel: "Learn About Us",
      accent: "#FFEBD2",
      image: "images/about-bg.jpg",
      washColors: ["rgba(20, 32, 58, 0.75)", "rgba(34, 46, 78, 0.60)", "rgba(12, 20, 40, 0.88)"]
    },
    {
      id: "services",
      eyebrow: "", 
      title: "Our Services", 
      subtitle: "Insights. Strategy. Solutions.",
      summary: "We develop practical solutions through research, business intelligence, and industry expertise to improve performance and support sustainable growth.",
      href: "services.html",
      ctaLabel: "Explore Our Services",
      accent: "#FFEBD2",
      image: "images/card-services.jpg",
      washColors: ["rgba(20, 32, 58, 0.75)", "rgba(34, 46, 78, 0.60)", "rgba(12, 20, 40, 0.88)"]
    },
    {
      id: "client-experience",
      eyebrow: "", 
      title: "Client Experience", 
      subtitle: "Our Work. Our Impact.",
      summary: "We measure our success by the value we create for the organizations we serve. Explore our project experiences, client partnerships, and the impact of our work.",
      href: "client-experience.html",
      ctaLabel: "View Our Impact",
      accent: "#FFEBD2",
      image: "images/card-casestudy.jpg",
      washColors: ["rgba(20, 32, 58, 0.75)", "rgba(34, 46, 78, 0.60)", "rgba(12, 20, 40, 0.88)"]
    },
    {
      id: "careers",
      eyebrow: "", 
      title: "Careers & Opportunities", 
      subtitle: "Building Tomorrow's Business Leaders.",
      summary: "We invest in the next generation through practical learning opportunities and professional development to help individuals grow and succeed.",
      href: "careers.html",
      ctaLabel: "View Opportunities",
      accent: "#FFEBD2",
      image: "images/card-careers.jpg",
      washColors: ["rgba(20, 32, 58, 0.75)", "rgba(34, 46, 78, 0.60)", "rgba(12, 20, 40, 0.88)"]
    },
    {
      id: "contact",
      eyebrow: "", 
      title: "Contact Us", 
      subtitle: "Let's Work Together.",
      summary: "Every business challenge presents an opportunity for growth. Connect with us to explore how we can help you achieve your business objectives.",
      href: "contact.html",
      ctaLabel: "Get in Touch",
      accent: "#FFEBD2",
      image: "images/card-contact.jpg",
      mobilePosition: "75% center",
      washColors: ["rgba(20, 32, 58, 0.55)", "rgba(34, 46, 78, 0.42)", "rgba(12, 20, 40, 0.78)"]
    }
  ];

  var TOTAL = SECTIONS.length;

  /* ═══════════════════════════════════════════════════════════════
     MOBILE
     ═══════════════════════════════════════════════════════════════ */

  function isMobile() {
    return window.innerWidth <= 900;
  }

  function buildMobile() {
    if (!mobileContainer) return;

    // Create mobile cards HTML
    var html = SECTIONS.map(function (s, i) {
      return (
        '<a href="' + s.href + '" class="mobile-card" style="background-image: url(\'' + s.image + '\'); animation-delay: ' + (0.1 * i) + 's;">' +
          '<div class="mobile-card-content">' +
            '<span class="mobile-card-subtitle">' + s.subtitle + '</span>' +
            '<h2 class="mobile-card-title">' + s.title + '</h2>' +
            '<p class="mobile-card-summary">' + s.summary + '</p>' +
          '</div>' +
        '</a>'
      );
    }).join("");

    mobileContainer.innerHTML = html;

    // Inject specific CSS for the mobile cards
    var style = document.createElement('style');
    style.innerHTML = `
      .mobile-card {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: 240px;
        border-radius: 12px;
        padding: 2rem;
        text-decoration: none;
        background-size: cover;
        background-position: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        opacity: 0;
        transform: translateY(30px);
        animation: slideUpCard 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        margin-bottom: 1.5rem; /* Spacing between cards */
      }
      .mobile-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(to top, rgba(12,20,40,0.95) 0%, rgba(12,20,40,0.4) 60%, transparent 100%);
        z-index: 1;
      }
      .mobile-card-content {
        position: relative;
        z-index: 2;
      }
      .mobile-card-subtitle {
        display: block;
        font-family: 'Inter', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #E86A34;
        margin-bottom: 0.5rem;
      }
      .mobile-card-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.6rem;
        color: #FFFFFF;
        margin: 0 0 0.5rem 0;
      }
      .mobile-card-summary {
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        color: rgba(255,255,255,0.8);
        margin: 0;
        line-height: 1.5;
      }
      @keyframes slideUpCard {
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════════════════════
     DESKTOP
     ═══════════════════════════════════════════════════════════════ */

  function buildDesktop() {
    if (!canvas || typeof THREE === "undefined") return;

    var CARD_W = 7.6, CARD_H = 4.28, CARD_D = 0.10, FLOOR_Y = -2.9;

    var BASE_CAM_POS = new THREE.Vector3(0, 0.2, 17.0); 
    var BASE_CAM_LOOK = new THREE.Vector3(0, 0.0, 0);

    var width = hub.clientWidth || window.innerWidth;
    var height = hub.clientHeight || window.innerHeight;

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
      var padTop = 160;

      if (section.eyebrow) {
        ctx.fillStyle = section.accent;
        ctx.font = "700 34px 'JetBrains Mono', Menlo, monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.letterSpacing = "0.28em";
        ctx.fillText(section.eyebrow, padX, padTop);
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 130px 'Fraunces', 'Playfair Display', Georgia, serif";
      ctx.letterSpacing = "-0.035em";
      var titleLines = wrapLines(ctx, section.title, padRight - padX);
      var titleHeight = (titleLines.length * 146);

      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.font = "600 52px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
      ctx.letterSpacing = "-0.010em";
      var subLines = wrapLines(ctx, section.subtitle, Math.min(1800, padRight - padX));
      var subHeight = (Math.min(subLines.length, 2) * 68);

      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.font = "500 48px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
      ctx.letterSpacing = "-0.008em";
      var sumLines = wrapLines(ctx, section.summary, padRight - padX);
      var sumHeight = (Math.min(sumLines.length, 5) * 68);

      var gaps = 60; 
      var totalTextHeight = titleHeight + gaps + subHeight + gaps + sumHeight;
      var startY = (H - totalTextHeight) / 2 - 60;
      
      if (section.eyebrow) {
        startY = padTop + 100;
      }

      var currentY = startY;

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 130px 'Fraunces', 'Playfair Display', Georgia, serif";
      ctx.letterSpacing = "-0.035em";
      for (var i = 0; i < titleLines.length && i < 3; i++) {
        ctx.fillText(titleLines[i], padX, currentY + (i * 146));
      }
      currentY += titleHeight + gaps;

      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.font = "600 52px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
      ctx.letterSpacing = "-0.010em";
      for (var j = 0; j < Math.min(subLines.length, 2); j++) {
        ctx.fillText(subLines[j], padX, currentY + (j * 68));
      }
      currentY += subHeight + gaps;

      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.font = "500 48px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
      ctx.letterSpacing = "-0.008em";
      for (var m = 0; m < Math.min(sumLines.length, 5); m++) {
        ctx.fillText(sumLines[m], padX, currentY + (m * 68));
      }
    }

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

        card.position.set(arcX, -0.3, arcZ);
        card.rotation.set(0, arcRotY, 0);
        card.scale.setScalar(arcScale);

        var arcOpacity = Math.max(0, 1 - absDiff * 0.55);
        card.visible = arcOpacity > 0.02;

        card.userData.shadow.position.set(card.position.x, FLOOR_Y + 0.005, card.position.z);
        card.userData.shadow.scale.setScalar(arcScale);
        card.userData.shadow.visible = card.visible;
      }
    }

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
     BOOT & RESIZE HANDLING
     ═══════════════════════════════════════════════════════════════ */

  if (isMobile()) {
    buildMobile();
  } else {
    buildDesktop();
  }

  // Handle window resizing (switching between mobile stack and desktop 3D carousel)
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // Reload the page smoothly if they cross the 900px threshold
      if ((window.innerWidth <= 900 && !mobileContainer.hasChildNodes()) || 
          (window.innerWidth > 900 && mobileContainer.hasChildNodes())) {
        window.location.reload();
      }
    }, 500);
  });

})();