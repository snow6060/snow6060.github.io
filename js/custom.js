// ============================================================
//  BOOT SEQUENCE OVERLAY
//  Runs immediately before DOMContentLoaded so the overlay is
//  visible from the very first paint.
// ============================================================
(function bootSequence() {
  var SESSION_KEY = 'bootSequencePlayed';
  var overlay     = document.getElementById('boot-overlay');

  // Expose a hook so the hero animation block knows when to start.
  // Set to null initially; replaced by actual starter once the hero block runs.
  window.__startHeroAnimation = null;

  // Called once the overlay is gone (or skipped).
  function kickHero() {
    if (typeof window.__startHeroAnimation === 'function') {
      window.__startHeroAnimation();
    } else {
      // Hero block not yet wired up — store a flag; it will read it.
      window.__heroShouldStartNow = true;
    }
  }

  // ── Skip path (flag already set) ────────────────────────────
  if (sessionStorage.getItem(SESSION_KEY)) {
    if (overlay) overlay.remove();
    kickHero();
    return;
  }

  // ── Play path ───────────────────────────────────────────────
  if (!overlay) { kickHero(); return; }

  document.body.classList.add('boot-active');

  var logEl = document.getElementById('boot-log');

  var LINES = [
    { text: 'Initializing kernel...', status: '[OK]' },
    { text: 'Loading system modules...', status: '[OK]' },
    { text: 'Mounting filesystem...', status: '[OK]' },
    { text: 'Establishing connection...', status: '[OK]' },
    { text: 'Authenticating user: inzamam-ul-haque...', status: '[OK]' },
    { text: 'Loading portfolio interface...', status: '[OK]' },
    { text: 'Boot complete.', status: null, cls: 'boot-complete' }
  ];

  // Gap between lines in ms (80–150 range)
  var BASE_GAP = 95;

  var MAX_VISIBLE = 6; // scroll window — keep the log tight
  var lineEls = [];

  function addLine(cfg, onDone) {
    var el = document.createElement('div');
    el.className = 'boot-line' + (cfg.cls ? ' ' + cfg.cls : '');

    if (cfg.status) {
      el.textContent = cfg.text;
      var badge = document.createElement('span');
      badge.className = 'boot-status';
      badge.textContent = ' ' + cfg.status;
      el.appendChild(badge);
    } else {
      el.textContent = cfg.text;
    }

    logEl.appendChild(el);
    lineEls.push(el);

    // Trigger CSS transition on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('visible');
      });
    });

    // Scroll old lines upward by removing those beyond the window
    if (lineEls.length > MAX_VISIBLE) {
      var oldest = lineEls.shift();
      // Fade it out, then remove from DOM
      oldest.style.transition = 'opacity 0.08s ease, max-height 0.12s ease, padding 0.12s ease';
      oldest.style.opacity = '0';
      oldest.style.maxHeight = '0';
      oldest.style.overflow = 'hidden';
      setTimeout(function () { if (oldest.parentNode) oldest.parentNode.removeChild(oldest); }, 140);
    }

    if (onDone) setTimeout(onDone, BASE_GAP + Math.random() * 55);
  }

  function runLines(index) {
    if (index >= LINES.length) {
      // All lines shown — pause, then wipe out
      setTimeout(dismissOverlay, 500);
      return;
    }
    addLine(LINES[index], function () { runLines(index + 1); });
  }

  function dismissOverlay() {
    overlay.classList.add('fade-out');
    setTimeout(function () {
      overlay.parentNode && overlay.parentNode.removeChild(overlay);
      document.body.classList.remove('boot-active');
      sessionStorage.setItem(SESSION_KEY, '1');
      kickHero();
    }, 420); // slightly longer than the 0.4s CSS animation
  }

  // Kick off after a short ramp-up pause
  setTimeout(function () { runLines(0); }, 120);
})();

document.addEventListener("DOMContentLoaded", () => {

    const matrixCanvas = document.getElementById('matrix-canvas');
    if (matrixCanvas) {
        const ctx = matrixCanvas.getContext('2d');

        // Matrix canvas now covers the full viewport for all sections
        function resizeMatrixCanvas() {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
            matrixCanvas.style.width = `${window.innerWidth}px`;
            matrixCanvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        const chars = '01ABCDEFabcdef0123456789';
        const fontSize = 16;
        let columns = 0;
        let drops = [];

        function initMatrix() {
            const width = matrixCanvas.width || window.innerWidth;
            const height = matrixCanvas.height || window.innerHeight;
            columns = Math.floor(width / fontSize);
            drops = Array(columns).fill(0);
            ctx.clearRect(0, 0, width, height);
        }

        function drawMatrix() {
            const width = matrixCanvas.width || window.innerWidth;
            const height = matrixCanvas.height || window.innerHeight;
            ctx.fillStyle = 'rgba(1, 4, 8, 0.12)';
            ctx.fillRect(0, 0, width, height);

            ctx.font = `${fontSize}px monospace`;
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillStyle = '#F09527';
                ctx.globalAlpha = 0.3;
                ctx.fillText(text, x, y);
                ctx.globalAlpha = 1;

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        resizeMatrixCanvas();
        initMatrix();
        window.addEventListener('resize', () => {
            resizeMatrixCanvas();
            initMatrix();
        });
        setInterval(drawMatrix, 80);
    }

    const orbitContainer = document.getElementById('theme-container');
    if (orbitContainer && window.THREE) {
        const REF_W = 520;
        const REF_H = 220;
        const REF_FOV = 48;
        const REF_NEAR = 0.1;
        const REF_FAR = 1000;
        const halfH = REF_NEAR * Math.tan(THREE.MathUtils.degToRad(REF_FOV / 2));
        const halfW = halfH * (REF_W / REF_H);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(REF_FOV, REF_W / REF_H, REF_NEAR, REF_FAR);
        camera.position.set(2.2, 5.8, 6.5);
        camera.lookAt(0.2, -0.8, 0.0);

        function updateProjection() {
            const W = orbitContainer.clientWidth || REF_W;
            const H = orbitContainer.clientHeight || REF_H;
            const extraLeft = Math.max(0, W - REF_W);
            const extraBottom = Math.max(0, H - REF_H);
            const frustumPerPxH = (2 * halfH) / REF_H;
            const frustumPerPxW = (2 * halfW) / REF_W;
            const newLeft = -halfW - extraLeft * frustumPerPxW;
            const newRight = halfW;
            const newTop = halfH;
            const newBottom = -halfH - extraBottom * frustumPerPxH;

            camera.projectionMatrix.makePerspective(newLeft, newRight, newTop, newBottom, REF_NEAR, REF_FAR);
            camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
        }

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        function resizeRenderer() {
            const W = orbitContainer.clientWidth || REF_W;
            const H = orbitContainer.clientHeight || REF_H;
            renderer.setSize(W, H);
            updateProjection();
            planeUniforms.uScreenHeight.value = H * (window.devicePixelRatio || 1);
            planeUniforms.uScreenWidth.value = W * (window.devicePixelRatio || 1);
        }

        orbitContainer.appendChild(renderer.domElement);

        const mainGroup = new THREE.Group();
        mainGroup.position.set(1.85, 0.25, -0.6);
        mainGroup.rotation.x = 0.22;
        mainGroup.rotation.y = -Math.PI * 0.26;
        mainGroup.rotation.z = 0.08;
        scene.add(mainGroup);

        const orbitRadius = 0.58;
        const orbitSpeed = 2.2;
        const sphereGeo = new THREE.SphereGeometry(0.30, 32, 32);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const ball1 = new THREE.Mesh(sphereGeo, sphereMat);
        const ball2 = new THREE.Mesh(sphereGeo, sphereMat);

        const glowGeo = new THREE.SphereGeometry(0.48, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x66e5ff,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending
        });
        ball1.add(new THREE.Mesh(glowGeo, glowMat));
        ball2.add(new THREE.Mesh(glowGeo, glowMat));
        mainGroup.add(ball1);
        mainGroup.add(ball2);

        const planeSize = 42;
        const planeSegments = 120;
        const planeVertexShader = `
            precision mediump float;
            uniform float uTime;
            varying vec2 vUv;
            varying vec2 vXZ;
            varying float vElevation;

            void main() {
              vUv = uv;
              vec3 pos = position;
              vXZ = pos.xz;

              float dist = length(pos.xz);
              float angle = atan(pos.z, pos.x);
              float wave = sin(dist * 2.5 - angle * 2.0 - uTime * 3.5) * exp(-dist * 0.22) * 0.55;
              pos.y = wave;
              vElevation = wave;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const planeFragmentShader = `
            precision mediump float;
            uniform float uScreenHeight;
            uniform float uScreenWidth;
            uniform float uRefWidth;
            uniform float uRefHeight;
            varying vec2 vUv;
            varying vec2 vXZ;
            varying float vElevation;

            float drawSquareGrid(vec2 uv, float gridDensity, float lineWidth) {
              vec2 grid = abs(fract(uv * gridDensity - 0.5) - 0.5) / fwidth(uv * gridDensity);
              float line = min(grid.x, grid.y);
              return 1.0 - min(line * lineWidth, 1.0);
            }

            void main() {
              float dist = length(vXZ);
              vec2 uv = vUv;
              float leftExtend = 1.0 - smoothstep(0.48, 0.92, uv.x);
              float bottomExtend = 1.0 - smoothstep(0.48, 0.92, uv.y);
              uv.x -= 0.18 * leftExtend;
              uv.y -= 0.18 * bottomExtend;

              float gridLine = drawSquareGrid(uv, 66.0, 0.65);
              float radialFade = 1.0 - smoothstep(1.0, 8.0, dist);
              float bottomFade = smoothstep(0.0, uScreenHeight * 0.18, gl_FragCoord.y);
              float leftFade = smoothstep(0.0, uScreenWidth * 0.15, gl_FragCoord.x);
              float finalAlpha = radialFade * bottomFade * leftFade;

              vec3 crestColor = vec3(0.55, 0.95, 1.00);
              vec3 midColor = vec3(0.12, 0.50, 0.85);
              vec3 troughColor = vec3(0.02, 0.18, 0.40);
              vec3 gridColor = mix(troughColor, midColor, smoothstep(-0.3, 0.1, vElevation));
              gridColor = mix(gridColor, crestColor, smoothstep(0.1, 0.45, vElevation));
              gridColor *= 1.45;

              if (gridLine < 0.05 || finalAlpha <= 0.001) discard;
              gl_FragColor = vec4(gridColor, gridLine * finalAlpha * 0.95);
            }
        `;

        const planeUniforms = {
            uTime: { value: 0 },
            uScreenHeight: { value: 1 },
            uScreenWidth: { value: 1 },
            uRefWidth: { value: REF_W },
            uRefHeight: { value: REF_H }
        };

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, planeSegments, planeSegments);
        planeGeo.rotateX(-Math.PI * 0.32);

        const planeMat = new THREE.ShaderMaterial({
            vertexShader: planeVertexShader,
            fragmentShader: planeFragmentShader,
            uniforms: planeUniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const gridMesh = new THREE.Mesh(planeGeo, planeMat);
        mainGroup.add(gridMesh);
        resizeRenderer();

        const clock = new THREE.Clock();
        function animateOrbit() {
            requestAnimationFrame(animateOrbit);
            const t = clock.getElapsedTime();
            planeUniforms.uTime.value = t;
            const x = Math.cos(t * orbitSpeed) * orbitRadius;
            const z = Math.sin(t * orbitSpeed) * orbitRadius;
            ball1.position.set(x, 0.15, z);
            ball2.position.set(-x, 0.15, -z);
            renderer.render(scene, camera);
        }
        animateOrbit();
        window.addEventListener('resize', resizeRenderer);
    }

    // Select the hero title element (we will add the ID to it)
    const titleContainer = document.getElementById("animated-hero-title");
    if (!titleContainer) return;

    // Define the sequence texts
    const codeText = `print("I'm Inzamam-Ul-Haque")`;
    const finalWord1 = "I'm ";
    const finalWord2 = "Inzamam-Ul-Haque";

    // 1. Initial State
    titleContainer.innerHTML = "";
    
    const typingSpan = document.createElement("span");
    typingSpan.className = "typing-text";
    typingSpan.style.color = "#ffffff"; // make code white
    titleContainer.appendChild(typingSpan);

    const cursorSpan = document.createElement("span");
    cursorSpan.className = "cursor";
    cursorSpan.innerText = "|";
    titleContainer.appendChild(cursorSpan);

    let charIndex = 0;
    
    // 2. Typing Animation
    function typeChar() {
        if (charIndex < codeText.length) {
            typingSpan.innerText += codeText.charAt(charIndex);
            charIndex++;
            // Random typing speed
            setTimeout(typeChar, 40 + Math.random() * 60);
        } else {
            // Typing done, show enter button
            setTimeout(showEnterButton, 200);
        }
    }

    // start typing — deferred until the boot overlay hands off control.
    // kickHero() (called by the boot IIFE) sets window.__startHeroAnimation
    // to this function. If the boot was skipped (session flag), the IIFE set
    // window.__heroShouldStartNow = true before DOMContentLoaded fired, so
    // we start right away with a brief settling pause.
    function startHero() {
        setTimeout(typeChar, 300);
    }

    // Register with the boot IIFE's handoff mechanism
    window.__startHeroAnimation = startHero;

    // If boot was already dismissed before this code ran, start now
    if (window.__heroShouldStartNow) {
        startHero();
    }

    let enterBtn;

    // 3. Enter Button Press
    function showEnterButton() {
        enterBtn = document.createElement("kbd");
        enterBtn.className = "enter-btn";
        enterBtn.innerText = "Enter ↵";
        titleContainer.appendChild(enterBtn);

        // Press animation after a short pause
        setTimeout(() => {
            enterBtn.classList.add("pressed");
            setTimeout(() => {
                enterBtn.classList.remove("pressed");
                triggerTerminalRevealSequence();
                // Start crumble animation
                setTimeout(startCrumble, 300);
            }, 150);
        }, 800);
    }

    function triggerTerminalRevealSequence() {
        const terminalFrame = document.querySelector('.terminal-frame');
        const photoWrap = document.querySelector('.photo-glitch-wrap');

        if (!terminalFrame || !photoWrap) return;

        photoWrap.querySelectorAll('.photo-tile').forEach(tile => tile.remove());

        const columns = 18;
        const rows = 14;
        const width = photoWrap.clientWidth || 240;
        const height = photoWrap.clientHeight || 290;
        const tileWidth = width / columns;
        const tileHeight = height / rows;

        const fragment = document.createDocumentFragment();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const tile = document.createElement('span');
                tile.className = 'photo-tile';
                tile.style.width = `${tileWidth}px`;
                tile.style.height = `${tileHeight}px`;
                tile.style.left = `${col * tileWidth}px`;
                tile.style.top = `${row * tileHeight}px`;
                fragment.appendChild(tile);
            }
        }
        photoWrap.appendChild(fragment);

        terminalFrame.classList.remove('is-visible');
        void terminalFrame.offsetWidth;
        terminalFrame.classList.add('is-visible');

        const tiles = Array.from(photoWrap.querySelectorAll('.photo-tile'));
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('is-cleared');
            }, 50 + index * 11);
        });
    }

    // 4. Earthquake / Crumble Animation
    function startCrumble() {
        cursorSpan.remove(); // remove cursor
        
        const textToCrumble = typingSpan.innerText;
        typingSpan.innerText = "";
        
        const pieces = [];

        // Wrap each char in an absolute span so it can fall
        for (let i = 0; i < textToCrumble.length; i++) {
            const charSpan = document.createElement("span");
            charSpan.innerText = textToCrumble[i] === " " ? "\u00A0" : textToCrumble[i];
            charSpan.style.display = "inline-block";
            charSpan.style.color = "#ffffff";
            typingSpan.appendChild(charSpan);
            pieces.push(charSpan);
        }

        // Add the enter button as a piece
        pieces.push(enterBtn);

        // Calculate layout positions before taking them out of flow
        pieces.forEach(piece => {
            const rect = piece.getBoundingClientRect();
            // Store fixed properties
            piece.dataset.left = rect.left;
            piece.dataset.top = rect.top;
            
            // Random physics properties for each piece
            piece.physics = {
                vx: (Math.random() - 0.5) * 15, // horizontal spread
                vy: (Math.random() * -10) - 2,  // initial jump up
                vz: (Math.random() - 0.5) * 20, // rotation speed
                rot: 0,
                gravity: 0.8
            };
        });

        // Take pieces out of normal flow and append to body so they fall globally
        pieces.forEach(piece => {
            piece.style.position = "fixed";
            piece.style.left = piece.dataset.left + "px";
            piece.style.top = piece.dataset.top + "px";
            // Ensure they sit above everything else
            piece.style.zIndex = "9999"; 
            document.body.appendChild(piece);
        });

        // The original container is now empty, let's remove the typing span
        typingSpan.remove();

        // Physics animation loop
        function fall() {
            let active = false;
            pieces.forEach(piece => {
                // If it's already far below the screen, ignore
                if (parseFloat(piece.style.top) > window.innerHeight + 100) return;

                active = true;
                piece.physics.vy += piece.physics.gravity;
                let top = parseFloat(piece.style.top) + piece.physics.vy;
                let left = parseFloat(piece.style.left) + piece.physics.vx;
                piece.physics.rot += piece.physics.vz;
                
                piece.style.top = top + "px";
                piece.style.left = left + "px";
                piece.style.transform = `rotate(${piece.physics.rot}deg)`;
            });

            if (active) {
                requestAnimationFrame(fall);
            } else {
                // Cleanup pieces after they fall off
                pieces.forEach(p => p.remove());
            }
        }

        requestAnimationFrame(fall);

        // Start dropping the final text while the old ones fall
        setTimeout(dropFinalText, 800);
    }

    // 5. Final Text Drop with Bounce
    function dropFinalText() {
        titleContainer.innerHTML = "";

        function createDropSpans(text, isHighlight) {
            const container = document.createElement("span");
            if (isHighlight) container.style.color = "#ffbd39";

            for(let i=0; i<text.length; i++) {
                const charSpan = document.createElement("span");
                charSpan.innerText = text[i];
                charSpan.className = "drop-char";
                
                // Tag the letter "a" in "Haque" for precise alignment later
                // "Inzamam-Ul-Haque" -> index 12 is 'a'
                if (isHighlight && text === "Inzamam-Ul-Haque" && i === 12) {
                    charSpan.id = "anchor-letter";
                }
                
                // Randomize animation properties
                const delay = Math.random() * 0.4; // 0 to 0.4s delay
                const duration = 0.6 + Math.random() * 0.4; // 0.6 to 1.0s duration
                charSpan.style.animationDelay = `${delay}s`;
                charSpan.style.animationDuration = `${duration}s`;
                
                container.appendChild(charSpan);
            }
            return container;
        }

        titleContainer.appendChild(createDropSpans(finalWord1, false));
        titleContainer.appendChild(createDropSpans(finalWord2, true));

        requestAnimationFrame(() => {
            alignHeadingToTerminalFrame();
        });
    }

    function alignHeadingToTerminalFrame() {
        const terminalFrame = document.querySelector('.terminal-frame');
        if (!terminalFrame || !terminalFrame.classList.contains('is-visible')) {
            titleContainer.style.letterSpacing = '';
            return;
        }
        if (window.innerWidth <= 768) {
            titleContainer.style.letterSpacing = '';
            return;
        }

        const titleRect = titleContainer.getBoundingClientRect();
        const terminalRect = terminalFrame.getBoundingClientRect();
        const text = titleContainer.textContent || '';
        if (!text.trim()) return;

        const textLength = Array.from(text).length;
        const currentRightEdge = titleRect.left + titleRect.width;
        const requiredOffset = terminalRect.right - currentRightEdge;
        const desiredLetterSpacing = requiredOffset / Math.max(textLength - 1, 1);

        if (desiredLetterSpacing < -4 || desiredLetterSpacing > 8) {
            console.warn('Hero heading spacing exceeded safe range; leaving normal letter spacing.');
            titleContainer.style.letterSpacing = '';
            return;
        }

        titleContainer.style.letterSpacing = `${desiredLetterSpacing}px`;
    }

    function scheduleHeadingAlignment() {
        const doAlignment = () => {
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(alignHeadingToTerminalFrame);
            } else {
                alignHeadingToTerminalFrame();
            }
        };

        doAlignment();
        window.addEventListener('resize', () => {
            clearTimeout(scheduleHeadingAlignment.resizeTimer);
            scheduleHeadingAlignment.resizeTimer = setTimeout(doAlignment, 150);
        });
    }

    scheduleHeadingAlignment();
    // ============================================================
    //  DECODE / SCRAMBLE REVEAL  —  #typing-animation
    // ============================================================
    const scrambleEl = document.getElementById("typing-animation");

    if (scrambleEl) {
        const words = [
            "Data Scientist",
            "AI Augmented Builder",
            "Full Stack Developer",
            "Perpetual Learner"
        ];

        const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>?/\\|";
        const SCRAMBLE_SPEED   = 40;   // ms between each frame during scramble
        const LOCK_INTERVAL    = 55;   // ms between locking each next character
        const HOLD_DURATION    = 2400; // ms to hold the fully resolved word
        const SCRAMBLE_OUT_MS  = 500;  // total duration of scramble-out phase

        let wordIndex   = 0;
        let running     = true;
        let frameTimer  = null;
        let cycleTimer  = null;

        function randChar() {
            return CHARS[Math.floor(Math.random() * CHARS.length)];
        }

        // Scramble-IN: fill with noise, then lock chars left→right one by one
        function scrambleIn(word, onDone) {
            const len = word.length;
            let lockedCount = 0;

            // Phase 1: pure noise for a couple of frames before locking starts
            let noiseFrames = 5;
            let noiseCount  = 0;

            function noisePhase() {
                if (!running) return;
                let display = "";
                for (let i = 0; i < len; i++) display += randChar();
                scrambleEl.textContent = display;
                noiseCount++;
                if (noiseCount < noiseFrames) {
                    frameTimer = setTimeout(noisePhase, SCRAMBLE_SPEED);
                } else {
                    lockPhase();
                }
            }

            // Phase 2: lock chars one by one from left to right
            function lockPhase() {
                if (!running) return;

                // Lock one more character
                lockedCount++;

                // Render: locked portion is correct, rest is noise
                let display = word.slice(0, lockedCount);
                for (let i = lockedCount; i < len; i++) display += randChar();
                scrambleEl.textContent = display;

                if (lockedCount < len) {
                    // Keep randomising the unlocked tail a few times before locking next char
                    let jitterFrames = 3;
                    let jitterCount  = 0;

                    function jitter() {
                        if (!running) return;
                        let d = word.slice(0, lockedCount);
                        for (let i = lockedCount; i < len; i++) d += randChar();
                        scrambleEl.textContent = d;
                        jitterCount++;
                        if (jitterCount < jitterFrames) {
                            frameTimer = setTimeout(jitter, SCRAMBLE_SPEED);
                        } else {
                            frameTimer = setTimeout(lockPhase, LOCK_INTERVAL);
                        }
                    }
                    jitter();
                } else {
                    // Fully resolved
                    scrambleEl.textContent = word;
                    if (onDone) onDone();
                }
            }

            noisePhase();
        }

        // Scramble-OUT: replace chars with noise, progressively from right→left
        function scrambleOut(word, onDone) {
            const len        = word.length;
            const steps      = len + 4;                  // extra noise frames at the end
            const stepDelay  = SCRAMBLE_OUT_MS / steps;
            let   clearedIdx = len;                      // chars ≥ this index are scrambled

            function step() {
                if (!running) return;
                clearedIdx--;
                let display = "";
                // Chars before clearedIdx stay correct, after are noise
                for (let i = 0; i < len; i++) {
                    display += (i < clearedIdx) ? word[i] : randChar();
                }
                scrambleEl.textContent = display;

                if (clearedIdx > 0) {
                    frameTimer = setTimeout(step, stepDelay);
                } else {
                    // Pure noise for a few extra frames, then hand off
                    let tail = 4;
                    function tailNoise() {
                        if (!running) return;
                        let d = "";
                        for (let i = 0; i < len; i++) d += randChar();
                        scrambleEl.textContent = d;
                        tail--;
                        if (tail > 0) frameTimer = setTimeout(tailNoise, stepDelay);
                        else if (onDone) onDone();
                    }
                    tailNoise();
                }
            }

            step();
        }

        function runCycle() {
            if (!running) return;
            const word = words[wordIndex];

            scrambleIn(word, () => {
                // Hold the resolved word, then scramble it out and move to next
                cycleTimer = setTimeout(() => {
                    scrambleOut(word, () => {
                        wordIndex = (wordIndex + 1) % words.length;
                        // Small gap between words
                        cycleTimer = setTimeout(runCycle, 200);
                    });
                }, HOLD_DURATION);
            });
        }

        cycleTimer = setTimeout(runCycle, 5500);
    }

    // ============================================================
    //  TERMINAL FRAME PRECISE ALIGNMENT & GLITCH
    // ============================================================
    const terminalWrapper = document.querySelector('.hero-bottom-right');
    const taglineWrapper = document.querySelector('.tagline-wrapper');
    const homeSection = document.getElementById('home-section');

    function alignTerminalFrame() {
        if (!terminalWrapper || !taglineWrapper || !homeSection) return;

        if (window.innerWidth <= 768) {
            terminalWrapper.style.position = 'static';
            terminalWrapper.style.left = 'auto';
            terminalWrapper.style.top = 'auto';
            return;
        }

        // Desktop: absolute positioning relative to #home-section
        terminalWrapper.style.position = 'absolute';

        const homeRect = homeSection.getBoundingClientRect();
        const taglineRect = taglineWrapper.getBoundingClientRect();
        
        // Top alignment: perfectly aligned with the top of the tagline wrapper
        const targetTop = taglineRect.top - homeRect.top;
        
        // Left alignment: Fixed static position relative to the left container edge 
        // roughly matching the end of "I'm Inzamam-Ul-Haque" at desktop sizes
        // No longer relying on dynamic text bounding boxes to prevent jumping!
        // Padding is 60px on .hero-left-side, text width is ~500px, so ~560px is a solid fixed mark.
        const targetLeft = 560;

        terminalWrapper.style.top = `${targetTop}px`;
        terminalWrapper.style.left = `${targetLeft}px`;
    }

    // Initial alignment
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        alignTerminalFrame();
    } else {
        window.addEventListener('DOMContentLoaded', alignTerminalFrame);
    }
    // Give it a tiny delay to ensure fonts are loaded
    setTimeout(alignTerminalFrame, 100);

    // Debounced resize listener
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(alignTerminalFrame, 150);
    });

    // IntersectionObserver for terminal reveal replay on scroll re-entry
    const photoGlitchWrap = document.querySelector('.photo-glitch-wrap');
    if (photoGlitchWrap) {
        let hasEnteredView = true;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!hasEnteredView) {
                        hasEnteredView = true;
                        triggerTerminalRevealSequence();
                    }
                } else {
                    hasEnteredView = false;
                }
            });
        }, { threshold: 0.1 });

        observer.observe(photoGlitchWrap);
    }
});

(function initPaperCards() {
    const setup = () => {
        const paperCards = document.querySelectorAll('.paper-card');
        paperCards.forEach((card) => {
            const toggle = card.querySelector('.paper-card-toggle');
            const body = card.querySelector('.paper-card-body');
            const inner = card.querySelector('.paper-card-body-inner');
            if (!toggle || !body || !inner || toggle.dataset.paperBound === '1') return;
            toggle.dataset.paperBound = '1';

            const setOpen = (open) => {
                card.classList.toggle('is-open', open);
                toggle.setAttribute('aria-expanded', String(open));
                body.style.maxHeight = open ? `${inner.scrollHeight}px` : '0px';
            };

            toggle.addEventListener('click', () => {
                setOpen(!card.classList.contains('is-open'));
            });
        });

        window.addEventListener('resize', () => {
            document.querySelectorAll('.paper-card.is-open').forEach((card) => {
                const body = card.querySelector('.paper-card-body');
                const inner = card.querySelector('.paper-card-body-inner');
                if (body && inner) body.style.maxHeight = `${inner.scrollHeight}px`;
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();
