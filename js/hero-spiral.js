/* ═══════════════════════════════════════════════════════════════════
   PRIMESTRATEGY // BULLETPROOF 3D HERO SPIRAL
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  function initSpiral() {
    var canvas = document.getElementById("spiral-hero-canvas");
    var wrap = document.getElementById("spiralHeroWrap");

    if (!canvas || !wrap) return;

    if (typeof THREE === "undefined") {
      console.error("[PS Spiral] Three.js is not loaded! Ensure three.min.js is placed BEFORE hero-spiral.js.");
      return;
    }

    var width = wrap.clientWidth || window.innerWidth;
    var height = wrap.clientHeight || window.innerHeight;
    if (height < 400) height = window.innerHeight;

    /* 1. RENDERER & CAMERA */
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 14);

    /* 2. LIGHTS */
    scene.add(new THREE.AmbientLight(0xfff6ea, 0.95));

    var sunLight = new THREE.DirectionalLight(0xffeed8, 1.6);
    sunLight.position.set(-6, 12, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    var fillLight = new THREE.DirectionalLight(0xf5d8bf, 0.6);
    fillLight.position.set(8, -2, 6);
    scene.add(fillLight);

    var rimLight = new THREE.DirectionalLight(0xff8a3c, 0.8);
    rimLight.position.set(0, 8, -10);
    scene.add(rimLight);

    /* 3. DUST PARTICLES */
    var dustCount = 150;
    var dustGeo = new THREE.BufferGeometry();
    var dustPos = new Float32Array(dustCount * 3);
    for (var i = 0; i < dustCount; i++) {
      dustPos[i * 3]     = (Math.random() - 0.5) * 30;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    var dustMat = new THREE.PointsMaterial({
      color: 0xC85A17,
      size: 0.08,
      transparent: true,
      opacity: 0.45
    });
    scene.add(new THREE.Points(dustGeo, dustMat));

    /* 4. PRIMESTRATEGY 3D GEAR */
    var gearGroup = new THREE.Group();
    scene.add(gearGroup);

    function createGear() {
      var shape = new THREE.Shape();
      var teeth = 18;
      var outerR = 2.1;
      var rootR = 1.68;
      var step = (Math.PI * 2) / teeth;
      var halfB = step * 0.25;

      for (var t = 0; t < teeth; t++) {
        var a = t * step;
        var p0 = [Math.cos(a - halfB * 1.3) * rootR, Math.sin(a - halfB * 1.3) * rootR];
        var p1 = [Math.cos(a - halfB * 0.7) * outerR, Math.sin(a - halfB * 0.7) * outerR];
        var p2 = [Math.cos(a + halfB * 0.7) * outerR, Math.sin(a + halfB * 0.7) * outerR];
        var p3 = [Math.cos(a + halfB * 1.3) * rootR, Math.sin(a + halfB * 1.3) * rootR];

        if (t === 0) shape.moveTo(p0[0], p0[1]);
        else shape.lineTo(p0[0], p0[1]);
        shape.lineTo(p1[0], p1[1]);
        shape.lineTo(p2[0], p2[1]);
        shape.lineTo(p3[0], p3[1]);
      }
      shape.closePath();

      var hole = new THREE.Path();
      hole.absarc(0, 0, 0.65, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      var geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.32,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 3
      });
      geo.center();
      return geo;
    }

    var gearMesh = new THREE.Mesh(
      createGear(),
      new THREE.MeshStandardMaterial({
        color: 0xEAE5DC,
        metalness: 0.85,
        roughness: 0.24,
        emissive: 0x4a2410,
        emissiveIntensity: 0.12
      })
    );
    gearMesh.castShadow = true;
    gearGroup.add(gearMesh);

    /* 5. 3D DOMINO SPIRAL */
    var DOMINO_COUNT = 70;
    var dominoesGroup = new THREE.Group();
    scene.add(dominoesGroup);

    var curvePoints = [];
    for (var c = 0; c <= 80; c++) {
      var progress = c / 80;
      var theta = progress * Math.PI * 2 * 1.35 - Math.PI * 0.5;
      var radius = 3.6 + progress * 2.8;
      var x = Math.cos(theta) * radius * 1.35;
      var y = Math.sin(theta) * radius * 0.95 - progress * 1.8;
      var z = (1 - progress) * 2.2 - progress * 3.8;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    var spiralCurve = new THREE.CatmullRomCurve3(curvePoints);

    var slabGeo = new THREE.BoxGeometry(0.18, 0.96, 0.52);
    slabGeo.translate(0, 0.48, 0);

    var slabMat = new THREE.MeshStandardMaterial({ color: 0xFAF8F5, roughness: 0.22, metalness: 0.15 });
    var dominoMeshes = [];

    for (var d = 0; d < DOMINO_COUNT; d++) {
      var slab = new THREE.Mesh(slabGeo, slabMat);
      slab.castShadow = true;
      dominoesGroup.add(slab);
      dominoMeshes.push(slab);
    }

    function updateDominoes(twist) {
      for (var i = 0; i < DOMINO_COUNT; i++) {
        var t = i / (DOMINO_COUNT - 1);
        var pt = spiralCurve.getPointAt(t);
        var tangent = spiralCurve.getTangentAt(t).normalize();
        var mesh = dominoMeshes[i];
        mesh.position.copy(pt);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        mesh.rotateZ(Math.PI * 0.5);
        mesh.rotateX((t * 2.2 + twist) * 0.85);
      }
    }
    updateDominoes(0);

    /* 6. SPHERE */
    var rollingSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xC85A17, emissive: 0xE06F28, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.2 })
    );
    rollingSphere.castShadow = true;
    scene.add(rollingSphere);

    /* 7. SCROLL CHOREOGRAPHY */
    var heroSection = document.getElementById("spiral-hero-section");
    var scrollProgress = 0;

    function onScroll() {
      if (!heroSection) return;
      var rect = heroSection.getBoundingClientRect();
      var maxScroll = heroSection.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      scrollProgress = Math.max(0, Math.min(1, -rect.top / maxScroll));

      camera.position.z = 14 - scrollProgress * 4.5;
      camera.position.y = 1.2 - scrollProgress * 1.8;
      camera.position.x = Math.sin(scrollProgress * Math.PI) * 1.4;
      camera.lookAt(0, -scrollProgress * 0.8, 0);

      gearGroup.rotation.z = scrollProgress * Math.PI * 2.2;
      gearGroup.scale.setScalar(Math.max(0.001, 1 - scrollProgress * 1.15));

      updateDominoes(scrollProgress * 1.4);

      var sphereT = (scrollProgress * 0.92) % 1;
      var spherePt = spiralCurve.getPointAt(sphereT);
      rollingSphere.position.copy(spherePt);
      rollingSphere.position.y += 0.42;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    /* 8. ANIMATION LOOP */
    var clock = new THREE.Clock();
    function loop() {
      requestAnimationFrame(loop);
      var time = clock.getElapsedTime();

      if (scrollProgress < 0.08) {
        gearMesh.rotation.z = time * 0.25;
      }

      if (scrollProgress < 0.02) {
        var pt = spiralCurve.getPointAt((time * 0.04) % 1);
        rollingSphere.position.copy(pt);
        rollingSphere.position.y += 0.42;
      }

      renderer.render(scene, camera);
    }
    loop();

    window.addEventListener("resize", function () {
      var w = wrap.clientWidth || window.innerWidth;
      var h = wrap.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSpiral);
  } else {
    initSpiral();
  }
})();