/* ================================================
   SPIDER-VERSE PORTFOLIO - MAIN JAVASCRIPT
   ================================================ */

'use strict';

// ========== UTILITY ==========
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rand = (min, max) => Math.random() * (max - min) + min;

// ========== LOADING SCREEN ==========
(function initLoader() {
  const loader = $('#loader');
  const loaderCanvas = $('#loaderCanvas');
  const ctx = loaderCanvas?.getContext('2d');

  // Draw spider web on loader canvas
  function drawLoaderWeb() {
    if (!ctx) return;
    loaderCanvas.width = window.innerWidth;
    loaderCanvas.height = window.innerHeight;
    ctx.clearRect(0, 0, loaderCanvas.width, loaderCanvas.height);

    const cx = loaderCanvas.width / 2;
    const cy = loaderCanvas.height / 2;
    const spokes = 12;
    const rings = 8;
    const maxR = Math.min(cx, cy) * 0.9;

    ctx.strokeStyle = '#e23636';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8;

    // Draw spokes
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.stroke();
    }

    // Draw rings
    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= spokes; i++) {
        const angle = (i / spokes) * Math.PI * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  drawLoaderWeb();

  // Hide loader after animation
  setTimeout(() => {
    if (loader) {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      startAllAnimations();
    }
  }, 2800);

  document.body.style.overflow = 'hidden';
})();

// ========== CUSTOM CURSOR ==========
(function initCursor() {
  const spider = $('#cursorSpider');
  const trail = $('#cursorTrail');
  let mx = 0, my = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (spider) {
      spider.style.left = mx + 'px';
      spider.style.top = my + 'px';
    }
  });

  function animTrail() {
    tx += (mx - tx) * 0.15;
    ty += (my - ty) * 0.15;
    if (trail) {
      trail.style.left = tx + 'px';
      trail.style.top = ty + 'px';
    }
    requestAnimationFrame(animTrail);
  }
  animTrail();

  // Scale on hover
  const interactables = 'a, button, .skill-card, .project-panel, .nav-link';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactables) && spider) {
      spider.style.transform = 'translate(-50%, -50%) scale(1.8)';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactables) && spider) {
      spider.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });
})();

// ========== MAIN WEB CANVAS ==========
function initHeroCanvas() {
  const canvas = $('#webCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  const nodes = [];
  const NUM_NODES = 30;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  class Node {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = rand(0, width);
      this.y = rand(0, height);
      this.vx = rand(-0.3, 0.3);
      this.vy = rand(-0.3, 0.3);
      this.r = rand(2, 5);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226,54,54,0.8)';
      ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < NUM_NODES; i++) nodes.push(new Node());

  function drawWeb() {
    ctx.clearRect(0, 0, width, height);

    // Draw web strands
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const alpha = (1 - dist / 180) * 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(226, 54, 54, ${alpha})`;
          ctx.lineWidth = (1 - dist / 180) * 1.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => { n.update(); n.draw(); });
    requestAnimationFrame(drawWeb);
  }

  drawWeb();
}

// ========== SKILL WEB CANVAS ==========
function initSkillWebCanvas() {
  const canvas = $('#skillWebCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const skills = $$('.skill-card');
  let t = 0;

  function drawSkillWeb() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasRect = canvas.getBoundingClientRect();
    const points = skills.map(s => {
      const r = s.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - canvasRect.left,
        y: r.top + r.height / 2 - canvasRect.top
      };
    });

    // Draw web between skill cards
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 500) {
          const alpha = Math.max(0, 0.3 - dist / 2000) * (0.5 + 0.5 * Math.sin(t * 0.02 + i));
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          // Curved web line
          const mx = (points[i].x + points[j].x) / 2 + Math.sin(t * 0.01 + i) * 20;
          const my = (points[i].y + points[j].y) / 2 + Math.cos(t * 0.01 + j) * 20;
          ctx.quadraticCurveTo(mx, my, points[j].x, points[j].y);
          ctx.strokeStyle = `rgba(226, 54, 54, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    t++;
    requestAnimationFrame(drawSkillWeb);
  }
  drawSkillWeb();
}

// ========== FOOTER CANVAS ==========
function initFooterCanvas() {
  const canvas = $('#footerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const spokes = 16, rings = 6;
  const maxR = Math.max(canvas.width, canvas.height);

  ctx.strokeStyle = '#e23636';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.6;

  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.stroke();
  }
  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * maxR;
    ctx.beginPath();
    for (let i = 0; i <= spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

// ========== NAVBAR ==========
function initNavbar() {
  const navbar = $('#navbar');
  const mobileBtn = $('#mobileMenuBtn');
  const mobileMenu = $('#mobileMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  });

  mobileBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
  });

  // Close mobile menu on link click
  $$('.mob-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu?.classList.remove('open'));
  });

  // Active nav link
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.style.color = '';
      link.style.borderColor = 'transparent';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--red)';
        link.style.borderColor = 'var(--red)';
      }
    });
  });
}

// ========== PARTICLES ==========
function initParticles() {
  const container = $('#particles');
  if (!container) return;

  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = rand(3, 8);
    const colors = ['var(--red)', 'var(--yellow)', 'var(--green)', '#fff'];
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${rand(0, 100)}%;
      background: ${colors[Math.floor(rand(0, colors.length))]};
      animation-duration: ${rand(8, 20)}s;
      animation-delay: ${rand(0, 10)}s;
    `;
    container.appendChild(p);
  }
}

// ========== ROLE ROTATOR ==========
function initRoleRotator() {
  const el = $('#roleRotator');
  if (!el) return;
  const roles = ['DATA SCIENTIST', 'FULL STACK DEV', 'PYTHON EXPERT', 'DATA ENGINEER', 'DATA ANALYST', 'VIBE CODER'];
  let idx = 0;

  setInterval(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      idx = (idx + 1) % roles.length;
      el.textContent = roles[idx];
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 400);
  }, 2500);
}

// ========== COUNTER ANIMATION ==========
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + (target === 100 ? '%' : '+');
  }, 16);
}

// ========== SCROLL REVEAL ==========
function initScrollReveal() {
  const elements = $$('[data-aos], .skill-card, .project-panel, .comic-panel, .contact-item, .stat-card');
  const skillProgressBars = $$('.web-progress');
  const counters = $$('.stat-num[data-count]');

  const observed = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !observed.has(entry.target)) {
        observed.add(entry.target);
        const el = entry.target;
        const delay = el.dataset.delay || 0;

        setTimeout(() => {
          el.classList.add('animated');
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));

  // Skill progress bars
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        setTimeout(() => {
          bar.style.width = bar.style.getPropertyValue('--prog');
        }, 200);
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  skillProgressBars.forEach(b => barObserver.observe(b));

  // Counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));
}

// ========== CONTACT FORM ==========
function initContactForm() {
  const form = $('#contactForm');
  const successMsg = $('#formSuccess');
  const sendBtn = $('#sendBtn');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (sendBtn) {
      const btnText = sendBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = '⏳ SENDING...';
      sendBtn.style.pointerEvents = 'none';
    }

    setTimeout(() => {
      form.reset();
      if (successMsg) successMsg.classList.add('show');
      if (sendBtn) {
        const btnText = sendBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = '🕷️ SEND SIGNAL';
        sendBtn.style.pointerEvents = '';
      }
      setTimeout(() => successMsg?.classList.remove('show'), 4000);
    }, 1500);
  });
}

// ========== PANEL HOVER EFFECT ==========
function initPanelTilt() {
  $$('.project-panel, .skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const inner = card.querySelector('.skill-card-inner') || card;
      inner.style.transform = card.classList.contains('skill-card')
        ? `rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`
        : `perspective(500px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.skill-card-inner') || card;
      inner.style.transform = '';
      inner.style.transition = 'transform 0.5s ease';
    });
  });
}

// ========== WEB SHOOT EFFECT ==========
function initWebShoot() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input, textarea, select')) return;
    createWebShot(e.clientX, e.clientY);
  });
}

function createWebShot(x, y) {
  const web = document.createElement('div');
  web.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 9000;
    transform: translate(-50%, -50%);
  `;

  // Create SVG web burst
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '120');
  svg.setAttribute('viewBox', '-60 -60 120 120');
  svg.style.cssText = 'position: absolute; transform: translate(-50%, -50%); opacity: 0; transition: opacity 0.1s;';

  const spokes = 8;
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '0');
    line.setAttribute('x2', Math.cos(angle) * 55);
    line.setAttribute('y2', Math.sin(angle) * 55);
    line.setAttribute('stroke', '#e23636');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '60');
    line.setAttribute('stroke-dashoffset', '60');
    line.style.transition = `stroke-dashoffset 0.3s ease ${i * 0.03}s`;
    svg.appendChild(line);
  }

  // Circles
  [20, 35, 50].forEach((r, idx) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#e23636');
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('stroke-dasharray', `${2 * Math.PI * r}`);
    circle.setAttribute('stroke-dashoffset', `${2 * Math.PI * r}`);
    circle.style.transition = `stroke-dashoffset 0.4s ease ${idx * 0.1 + 0.1}s`;
    svg.appendChild(circle);
  });

  web.appendChild(svg);
  document.body.appendChild(web);

  requestAnimationFrame(() => {
    svg.style.opacity = '1';
    svg.querySelectorAll('line').forEach(l => l.setAttribute('stroke-dashoffset', '0'));
    svg.querySelectorAll('circle').forEach(c => c.setAttribute('stroke-dashoffset', '0'));
  });

  // SFX text
  const sfxTexts = ['THWIP!', 'ZAP!', 'POW!', 'WHOOSH!', 'CRACK!'];
  const sfx = document.createElement('div');
  sfx.textContent = sfxTexts[Math.floor(rand(0, sfxTexts.length))];
  sfx.style.cssText = `
    position: fixed;
    left: ${x + 30}px;
    top: ${y - 30}px;
    font-family: 'Bangers', cursive;
    font-size: ${rand(20, 32)}px;
    color: ${['#e23636','#FFD700','#00ff88'][Math.floor(rand(0,3))]};
    pointer-events: none;
    z-index: 9001;
    text-shadow: 2px 2px 0 #000;
    transform: rotate(${rand(-15, 15)}deg);
    animation: sfxPop 0.8s ease forwards;
  `;
  document.body.appendChild(sfx);

  // Cleanup
  setTimeout(() => {
    svg.style.opacity = '0';
    sfx.style.opacity = '0';
    setTimeout(() => {
      web.remove();
      sfx.remove();
    }, 300);
  }, 700);
}

// Add sfxPop keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes sfxPop {
    0% { transform: scale(0) rotate(var(--r, 0deg)); opacity: 1; }
    60% { transform: scale(1.3) rotate(var(--r, 0deg)); opacity: 1; }
    100% { transform: scale(1.1) rotate(var(--r, 0deg)) translateY(-20px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ========== WEB TRAIL ON DRAG ==========
function initWebTrail() {
  let isDown = false;
  let lastX = 0, lastY = 0;

  document.addEventListener('mousedown', (e) => { isDown = true; lastX = e.clientX; lastY = e.clientY; });
  document.addEventListener('mouseup', () => { isDown = false; });
  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 30) {
      createTrailStrand(lastX, lastY, e.clientX, e.clientY);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
}

function createTrailStrand(x1, y1, x2, y2) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = `
    position: fixed;
    left: 0; top: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 8999;
  `;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('stroke', '#e23636');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-linecap', 'round');
  line.style.transition = 'opacity 0.5s ease';
  svg.appendChild(line);
  document.body.appendChild(svg);
  setTimeout(() => { svg.style.opacity = '0'; setTimeout(() => svg.remove(), 500); }, 400);
}

// ========== PARALLAX ==========
function initParallax() {
  const heroBg = $('.halftone-overlay');
  const bgPanels = $$('.bg-panel');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.2}px)`;
    bgPanels.forEach((p, i) => {
      p.style.transform = `translateY(${scrollY * (0.05 + i * 0.03)}px) rotate(${i % 2 ? 2 : -3}deg)`;
    });
  });
}

// ========== TYPEWRITER ==========
function initTypewriter() {
  const el = $('.loader-text .glitch');
  // No-op here; handled by CSS animation
}

// ========== EASTER EGG - KONAMI CODE ==========
(function initKonami() {
  const code = [38,38,40,40,37,39,37,39,66,65];
  let idx = 0;
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === code[idx]) {
      idx++;
      if (idx === code.length) {
        idx = 0;
        activateSpiderMode();
      }
    } else {
      idx = 0;
    }
  });
})();

function activateSpiderMode() {
  const msg = document.createElement('div');
  msg.innerHTML = '🕷️ SPIDER-MODE ACTIVATED! 🕷️<br><small>You found the secret!</small>';
  msg.style.cssText = `
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: var(--red); color: white;
    font-family: 'Bangers', cursive; font-size: 36px;
    padding: 30px 50px; border: 5px solid #FFD700;
    box-shadow: 10px 10px 0 #000; z-index: 99999;
    text-align: center; letter-spacing: 3px;
    transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  `;
  document.body.appendChild(msg);
  requestAnimationFrame(() => { msg.style.transform = 'translate(-50%, -50%) scale(1)'; });
  setTimeout(() => {
    msg.style.transform = 'translate(-50%, -50%) scale(0)';
    setTimeout(() => msg.remove(), 500);
  }, 3000);

  // Rain of spiders
  for (let i = 0; i < 20; i++) {
    const sp = document.createElement('div');
    sp.textContent = '🕷️';
    sp.style.cssText = `
      position: fixed;
      left: ${rand(0, 100)}%;
      top: -50px;
      font-size: ${rand(20, 50)}px;
      pointer-events: none;
      z-index: 99998;
      animation: spiderRain ${rand(1, 3)}s ease-in forwards;
      animation-delay: ${rand(0, 2)}s;
    `;
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 5000);
  }
  const rain = document.createElement('style');
  rain.textContent = `@keyframes spiderRain { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`;
  document.head.appendChild(rain);
}

// ========== START ALL ANIMATIONS ==========
function startAllAnimations() {
  initHeroCanvas();
  initSkillWebCanvas();
  initFooterCanvas();
  initNavbar();
  initParticles();
  initRoleRotator();
  initScrollReveal();
  initContactForm();
  initPanelTilt();
  initWebShoot();
  initWebTrail();
  initParallax();
}
