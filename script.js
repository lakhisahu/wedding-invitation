/**
 * Lakhi Sahu & Arvind Gupta — Wedding Invitation
 * script.js — Vanilla JavaScript, no frameworks
 *
 * Sections:
 *  1. DOM helpers & state
 *  2. Particle system
 *  3. Falling petals
 *  4. Section visibility & scroll observer
 *  5. Dot navigation
 *  6. Back-to-top
 *  7. Palace door opening
 *  8. Countdown timer
 *  9. Scratch-card (Canvas)
 * 10. Gallery lightbox
 * 11. RSVP form
 * 12. Add-to-calendar (ICS)
 * 13. Share / Web Share API
 * 14. Music toggle stub
 * 15. Toast notifications
 * 16. Init
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. DOM HELPERS & STATE
   ═══════════════════════════════════════════════════════════ */

/**
 * Safe querySelector wrapper — returns null without throwing.
 * @param {string} sel CSS selector
 * @param {Element|Document} ctx optional context
 * @returns {Element|null}
 */
function qs(sel, ctx) {
  return (ctx || document).querySelector(sel);
}
function qsa(sel, ctx) {
  return Array.from((ctx || document).querySelectorAll(sel));
}

const state = {
  doorsOpen: false,
  countdownInterval: null,
  scratchCanvas: null,
  scratchCtx: null,
  scratchIsDrawing: false,
  scratchTotalPixels: 0,
  scratchRevealed: false,
  musicPlaying: false,
  lightboxOpen: false,
};

/* ═══════════════════════════════════════════════════════════
   2. PARTICLE SYSTEM (floating golden particles)
   ═══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = qs('#particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H, animId;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.6 + 0.1,
      life: Math.random() * 200 + 100,
      age: 0,
      hue: 40 + Math.random() * 20,
    };
  }

  function initParticlesArr() {
    particles = [];
    const count = Math.min(80, Math.floor((W * H) / 18000));
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.age = Math.random() * p.life;
      particles.push(p);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.age++;
      if (p.age > p.life) {
        particles[i] = createParticle();
        return;
      }
      const progress = p.age / p.life;
      const alpha = p.alpha * (progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
    });
    animId = requestAnimationFrame(draw);
  }

  resize();
  initParticlesArr();
  draw();

  window.addEventListener('resize', () => {
    resize();
    initParticlesArr();
  });
}

/* ═══════════════════════════════════════════════════════════
   3. FALLING PETALS
   ═══════════════════════════════════════════════════════════ */
const PETAL_CHARS = ['🌸', '🌺', '🏵', '✿', '❀', '🌷'];

function addPetals(containerSel, count) {
  const container = qs(containerSel);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.setAttribute('aria-hidden', 'true');
    const ch = PETAL_CHARS[Math.floor(Math.random() * PETAL_CHARS.length)];
    petal.textContent = ch;
    petal.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${0.8 + Math.random() * 1.2}rem;
      animation-duration: ${6 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: 0;
    `;
    container.appendChild(petal);
  }
}

function initAllPetals() {
  addPetals('.entrance-petals', 18);
  addPetals('.invitation-petals', 14);
  addPetals('.gallery-petals', 10);
  addPetals('.countdown-petals', 12);
  addPetals('.closing-petals', 20);
}

/* ═══════════════════════════════════════════════════════════
   4. SECTION VISIBILITY & SCROLL OBSERVER
   ═══════════════════════════════════════════════════════════ */
const SECTIONS = [
  '#section-entrance',
  '#section-announcement',
  '#section-invitation',
  '#section-scratch',
  '#section-gallery',
  '#section-countdown',
  '#section-events',
  '#section-venue',
  '#section-closing',
];

function initSectionObserver() {
  const sectionEls = SECTIONS.map(s => qs(s)).filter(Boolean);
  const revealEls = qsa('.reveal-on-scroll');

  // Reveal sections
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          updateDotNav(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  sectionEls.forEach(el => {
    if (el.classList.contains('hidden-section')) {
      sectionObserver.observe(el);
    }
  });

  // Reveal on scroll elements
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => revealObserver.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   5. DOT NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function updateDotNav(visibleSection) {
  const sectionEls = SECTIONS.map(s => qs(s)).filter(Boolean);
  const idx = sectionEls.indexOf(visibleSection);
  if (idx === -1) return;

  qsa('.dot-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });
}

function initDotNav() {
  qsa('.dot-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Disallow jumping to sections before opening the doors
      if (!state.doorsOpen) return;
      const idx = parseInt(btn.dataset.section, 10);
      const target = qs(SECTIONS[idx]);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   6. BACK-TO-TOP
   ═══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════════
   7. PALACE DOOR OPENING
   ═══════════════════════════════════════════════════════════ */
function initDoorOpening() {
  const btn = qs('#open-invitation-btn');
  const doorLeft = qs('#door-left');
  const doorRight = qs('#door-right');
  const doorsContainer = qs('#doors-container');
  const entranceSection = qs('#section-entrance');
  const entranceContent = qs('#entrance-content');
  const announcement = qs('#section-announcement');

  if (!btn) return;

  // Guarantee button is active and enabled on load
  btn.disabled = false;
  state.doorsOpen = false;

  // Ensure initial scroll position is locked at the very top
  window.scrollTo(0, 0);
  document.documentElement.classList.add('scroll-locked');
  document.body.classList.add('scroll-locked');

  // Pulse button hint when user tries to scroll before opening
  let pulseTimer = null;
  function pulseButton() {
    if (state.doorsOpen) return;
    btn.classList.add('btn-pulse-hint');
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => {
      btn.classList.remove('btn-pulse-hint');
    }, 800);
  }

  // Prevent scroll gestures before opening
  window.addEventListener('wheel', (e) => {
    if (!state.doorsOpen) {
      e.preventDefault();
      pulseButton();
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!state.doorsOpen) {
      e.preventDefault();
      pulseButton();
    }
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (!state.doorsOpen) {
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
      if (scrollKeys.includes(e.key) && e.target !== btn) {
        e.preventDefault();
        pulseButton();
      }
    }
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDoors();
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDoors();
    }
  });

  function openDoors() {
    if (state.doorsOpen) return;
    state.doorsOpen = true;

    btn.disabled = true;
    btn.setAttribute('aria-label', 'Opening invitation…');

    // Unlock page scrolling for the entire site
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    // Trigger door opening, light seam glow, and content fade simultaneously with zero delay
    if (entranceSection) entranceSection.classList.add('doors-open');
    if (doorLeft) doorLeft.classList.add('open-left');
    if (doorRight) doorRight.classList.add('open-right');
    if (entranceContent) entranceContent.classList.add('doors-fading');

    // Ensure the announcement section is ready and visible before scrolling
    if (announcement) announcement.classList.add('section-visible');

    // After the cinematic door swing completes, smoothly glide to announcement section
    const DOOR_DURATION = 1400; // ms
    setTimeout(() => {
      if (announcement) {
        announcement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (doorsContainer) doorsContainer.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          announcement.setAttribute('tabindex', '-1');
          announcement.focus({ preventScroll: true });
        }, 500);
      }
    }, DOOR_DURATION);
  }
}

/* ═══════════════════════════════════════════════════════════
   8. COUNTDOWN TIMER
   ═══════════════════════════════════════════════════════════ */
function initCountdown() {
  const daysEl = qs('#countdown-days');
  const hoursEl = qs('#countdown-hours');
  const minutesEl = qs('#countdown-minutes');
  const secondsEl = qs('#countdown-seconds');
  const gridEl = qs('#countdown-grid');
  const msgEl = qs('#countdown-message');
  const pastEl = qs('#countdown-past');

  if (!daysEl) return;

  /**
   * Get the current time in Asia/Kolkata timezone,
   * and compare to midnight on 24 November 2026 IST.
   * @returns {{days:number, hours:number, minutes:number, seconds:number, state:'future'|'today'|'past'}}
   */
  function getCountdown() {
    const now = new Date();

    // Target: 24 November 2026 00:00:00 IST (UTC+5:30 = UTC 18:30 on 23 Nov)
    // Using Intl.DateTimeFormat to get Kolkata "today's" date boundaries
    const kolkataFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: '2-digit', day: '2-digit',
    });

    // Get the current Kolkata date string
    const kolkataParts = kolkataFormatter.formatToParts(now);
    const kolkataYear = parseInt(kolkataParts.find(p => p.type === 'year').value, 10);
    const kolkataMonth = parseInt(kolkataParts.find(p => p.type === 'month').value, 10);
    const kolkataDay = parseInt(kolkataParts.find(p => p.type === 'day').value, 10);

    // Wedding date in Kolkata
    const weddingYear = 2026, weddingMonth = 11, weddingDay = 24;

    // Compute target UTC timestamp: 2026-11-24 00:00:00 IST = 2026-11-23 18:30:00 UTC
    // IST = UTC + 5:30 → UTC = IST - 5:30
    const targetUTC = Date.UTC(2026, 10, 23, 18, 30, 0); // months are 0-indexed

    const diff = targetUTC - now.getTime();

    // Determine state
    const isToday =
      kolkataYear === weddingYear &&
      kolkataMonth === weddingMonth &&
      kolkataDay === weddingDay;

    if (isToday) return { state: 'today' };
    if (diff < 0) return { state: 'past' };

    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return { days, hours, minutes, seconds, state: 'future' };
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const cd = getCountdown();

    if (cd.state === 'today') {
      if (gridEl) gridEl.hidden = true;
      if (msgEl) msgEl.hidden = false;
      if (pastEl) pastEl.hidden = true;
      clearInterval(state.countdownInterval);
      return;
    }

    if (cd.state === 'past') {
      if (gridEl) gridEl.hidden = true;
      if (msgEl) msgEl.hidden = true;
      if (pastEl) pastEl.hidden = false;
      clearInterval(state.countdownInterval);
      return;
    }

    // Future
    daysEl.textContent = pad(cd.days);
    hoursEl.textContent = pad(cd.hours);
    minutesEl.textContent = pad(cd.minutes);
    secondsEl.textContent = pad(cd.seconds);
  }

  tick(); // immediate first render
  state.countdownInterval = setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════════════════
   9. SCRATCH-CARD (Canvas)
   ═══════════════════════════════════════════════════════════ */
function initScratchCard() {
  const container = qs('#scratch-card-container');
  const canvas = qs('#scratch-canvas');
  const coverLabel = qs('#scratch-cover-label');
  const resetBtn = qs('#scratch-reset-btn');

  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  let rect;

  function setupCanvas() {
    rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    state.scratchTotalPixels = W * H;
    state.scratchRevealed = false;
    state.scratchIsDrawing = false;

    drawScratchSurface(W, H);
    if (coverLabel) {
      coverLabel.classList.remove('hidden');
      coverLabel.removeAttribute('aria-hidden');
    }
  }

  function drawScratchSurface(W, H) {
    // Rich ornate brown/gold scratch surface
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#2d1505');
    grad.addColorStop(0.3, '#3d1f08');
    grad.addColorStop(0.5, '#4a2510');
    grad.addColorStop(0.7, '#3d1f08');
    grad.addColorStop(1, '#2d1505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Gold border pattern on scratch surface
    ctx.strokeStyle = 'rgba(201,153,61,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    // Decorative diagonal hatching
    ctx.strokeStyle = 'rgba(201,153,61,0.08)';
    ctx.lineWidth = 1;
    for (let i = -H; i < W + H; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
  }

  function getEventPos(e) {
    rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function scratch(e) {
    if (!state.scratchIsDrawing) return;
    const { x, y } = getEventPos(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // Check reveal percentage
    checkRevealPercentage();
  }

  function checkRevealPercentage() {
    if (state.scratchRevealed) return;
    const W = canvas.width / DPR;
    const H = canvas.height / DPR;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    const data = imageData.data;
    // Sample every 4th pixel for performance
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 20) transparent++;
    }
    const sampledTotal = data.length / 16;
    const pct = transparent / sampledTotal;

    if (pct > 0.55) {
      fullyReveal();
    }
  }

  function fullyReveal() {
    state.scratchRevealed = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (coverLabel) {
      coverLabel.classList.add('hidden');
      coverLabel.setAttribute('aria-hidden', 'true');
    }
  }

  function onPointerDown(e) {
    state.scratchIsDrawing = true;
    e.preventDefault();
    scratch(e);
  }
  function onPointerMove(e) {
    if (!state.scratchIsDrawing) return;
    e.preventDefault();
    scratch(e);
  }
  function onPointerUp() {
    state.scratchIsDrawing = false;
  }

  // Mouse events
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  // Touch events — prevent scrolling while scratching
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp, { passive: true });

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ctx.globalCompositeOperation = 'source-over';
      setupCanvas();
    });
  }

  // Initial setup
  setupCanvas();

  // Resize observer to keep canvas in sync
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      ctx.globalCompositeOperation = 'source-over';
      setupCanvas();
    });
    ro.observe(container);
  }
}

/* ═══════════════════════════════════════════════════════════
   10. GALLERY LIGHTBOX
   ═══════════════════════════════════════════════════════════ */
function initGallery() {
  const lightbox = qs('#lightbox');
  const backdrop = qs('#lightbox-backdrop');
  const lightboxImg = qs('#lightbox-img');
  const lightboxCaption = qs('#lightbox-caption');
  const lightboxClose = qs('#lightbox-close');

  if (!lightbox) return;

  const galleryItems = qsa('.gallery-item');

  function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.closest('.gallery-item')?.querySelector('.gallery-caption')?.textContent || '';
    lightbox.hidden = false;
    backdrop.hidden = false;
    state.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    backdrop.hidden = true;
    state.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const img = item.querySelector('img');
        if (img) openLightbox(img);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.lightboxOpen) closeLightbox();
  });
}

/* ═══════════════════════════════════════════════════════════
   11. RSVP FORM
   ═══════════════════════════════════════════════════════════ */
function initRSVP() {
  const form = qs('#rsvp-form');
  const confirmation = qs('#rsvp-confirmation');
  const confirmationText = qs('#rsvp-confirmation-text');
  const resetBtn = qs('#rsvp-reset-btn');

  if (!form) return;

  function validateField(id, errorId, condition, message) {
    const input = qs('#' + id);
    const error = qs('#' + errorId);
    if (!input || !error) return true;
    if (condition(input)) {
      input.classList.remove('input-error');
      error.textContent = '';
      input.removeAttribute('aria-invalid');
      return true;
    } else {
      input.classList.add('input-error');
      error.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      return false;
    }
  }

  function validateForm() {
    let valid = true;

    valid = validateField(
      'rsvp-name', 'name-error',
      (el) => el.value.trim().length >= 2,
      'Please enter your full name.'
    ) && valid;

    valid = validateField(
      'rsvp-contact', 'contact-error',
      (el) => {
        const val = el.value.trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRe = /^[\+\d\s\-\(\)]{7,}$/;
        return emailRe.test(val) || phoneRe.test(val);
      },
      'Please enter a valid phone number or email address.'
    ) && valid;

    // Attendance radio
    const attendanceChecked = qs('input[name="attendance"]:checked');
    const attendanceError = qs('#attendance-error');
    if (!attendanceChecked) {
      if (attendanceError) attendanceError.textContent = 'Please select your attendance.';
      valid = false;
    } else {
      if (attendanceError) attendanceError.textContent = '';
    }

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    const name = qs('#rsvp-name').value.trim();
    const attendance = qs('input[name="attendance"]:checked').value;
    const guests = qs('#rsvp-guests').value;
    const message = qs('#rsvp-message').value.trim();

    const attendanceText = attendance === 'accepts'
      ? 'joyfully accepts'
      : 'regretfully declines';

    let text = `Thank you, ${name}! We have received your RSVP — you ${attendanceText}.`;
    if (attendance === 'accepts') {
      text += ` We look forward to celebrating with you${guests !== '1' ? ' and your guests' : ''}!`;
      if (message) text += ` Your kind message: "${message}"`;
    } else {
      if (message) text += ` Your kind words: "${message}"`;
      text += ' We will miss you and hold you in our hearts on our special day.';
    }

    // Show confirmation (demo only)
    form.hidden = true;
    if (confirmationText) confirmationText.textContent = text;
    if (confirmation) {
      confirmation.hidden = false;
      confirmation.focus();
    }
  });

  // Live validation on input
  ['rsvp-name', 'rsvp-contact'].forEach(id => {
    const el = qs('#' + id);
    if (!el) return;
    el.addEventListener('blur', () => validateForm());
    el.addEventListener('input', () => {
      // Clear error on typing
      const errorId = id + '-error';
      const error = qs('#' + errorId);
      if (error) error.textContent = '';
      el.classList.remove('input-error');
      el.removeAttribute('aria-invalid');
    });
  });

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      if (confirmation) confirmation.hidden = true;
      qs('#rsvp-name').focus();
      // Clear errors
      qsa('.form-error', form).forEach(e => e.textContent = '');
      qsa('.input-error', form).forEach(e => {
        e.classList.remove('input-error');
        e.removeAttribute('aria-invalid');
      });
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   12. ADD-TO-CALENDAR (ICS)
   ═══════════════════════════════════════════════════════════ */
function generateICS() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lakhi & Arvind Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:lakhi-arvind-wedding-20261124@wedding-invitation',
    'DTSTAMP:' + formatICSDate(new Date()),
    'DTSTART;VALUE=DATE:20261124',
    'DTEND;VALUE=DATE:20261125',
    'SUMMARY:Wedding of Lakhi Sahu & Arvind Gupta',
    'DESCRIPTION:You are cordially invited to the wedding of Lakhi Sahu and Arvind Gupta.\\nVenue: Insuriya Bhavan\\, Dibrugarh\\, Assam\\, India\\nDate: Tuesday\\, 24 November 2026',
    'LOCATION:Insuriya Bhavan\\, Dibrugarh\\, Assam\\, India',
    'TRANSP:OPAQUE',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function downloadICS() {
  const content = generateICS();
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Lakhi-Arvind-Wedding-24-November-2026.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('📅 Calendar event downloaded!');
}

function initCalendarButtons() {
  const calBtn1 = qs('#add-to-calendar-btn');
  const calBtn2 = qs('#closing-calendar-btn');

  [calBtn1, calBtn2].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', downloadICS);
  });
}

/* ═══════════════════════════════════════════════════════════
   13. SHARE / WEB SHARE API
   ═══════════════════════════════════════════════════════════ */
async function shareInvitation() {
  const shareData = {
    title: 'Lakhi Sahu & Arvind Gupta — Wedding Invitation',
    text: 'You are cordially invited to the wedding of Lakhi Sahu and Arvind Gupta on 24 November 2026 at Insuriya Bhavan, Dibrugarh, Assam. 💛',
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyToClipboard();
      }
    }
  } else {
    copyToClipboard();
  }
}

function copyToClipboard() {
  const text = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('🔗 Invitation link copied!'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showToast('🔗 Invitation link copied!');
  } catch {
    showToast('📋 Copy this URL to share: ' + text);
  }
  document.body.removeChild(ta);
}

function initShareButtons() {
  const share1 = qs('#share-btn');
  const share2 = qs('#closing-share-btn');

  [share1, share2].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', shareInvitation);
  });
}

/* ═══════════════════════════════════════════════════════════
   14. MUSIC TOGGLE STUB
   ═══════════════════════════════════════════════════════════ */
function initMusicToggle() {
  const btn = qs('#music-toggle');
  const icon = btn?.querySelector('.music-icon');
  if (!btn) return;

  // No audio asset bundled — this is a user-activated stub.
  // Replace the <audio> tag and src once you have a music file.
  let audio = null;

  btn.addEventListener('click', () => {
    if (!audio) {
      // Try to create audio from an asset if one exists
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0.35;
      // Set the src here when you have a music file:
      // audio.src = 'assets/audio/wedding-music.mp3';
      audio.onerror = () => {
        showToast('♪ Add a music file to assets/audio/ to enable music');
        audio = null;
        state.musicPlaying = false;
        btn.classList.remove('playing');
        if (icon) icon.textContent = '♪';
      };
    }

    if (state.musicPlaying) {
      audio.pause();
      state.musicPlaying = false;
      btn.classList.remove('playing');
      if (icon) icon.textContent = '♪';
    } else {
      if (audio.src && audio.src !== window.location.href) {
        audio.play().catch(() => {
          showToast('♪ Add a music file to assets/audio/ to enable music');
        });
        state.musicPlaying = true;
        btn.classList.add('playing');
        if (icon) icon.textContent = '♬';
      } else {
        showToast('♪ Add a music file to assets/audio/ to enable music');
      }
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   15. TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */
let toastTimeout = null;

function showToast(message, duration = 3500) {
  const toast = qs('#toast');
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;

  // Force reflow
  void toast.offsetWidth;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.hidden = true;
    }, 350);
  }, duration);
}

/* ═══════════════════════════════════════════════════════════
   16. INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initAllPetals();
  initSectionObserver();
  initDotNav();
  initBackToTop();
  initDoorOpening();
  initCountdown();
  initScratchCard();
  initGallery();
  initRSVP();
  initCalendarButtons();
  initShareButtons();
  initMusicToggle();

  // Smooth scroll for any anchor links
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    if (!state.doorsOpen) return; // Disallow anchor jumping before opening
    const target = qs(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Handle resize for scratch canvas DPR
  window.addEventListener('resize', () => {
    // Scratch canvas resize is handled by ResizeObserver inside initScratchCard
    // Nothing needed here
  }, { passive: true });

  // Announce to screen readers
  const sr = document.createElement('p');
  sr.className = 'sr-only';
  sr.setAttribute('aria-live', 'polite');
  sr.textContent = 'Wedding invitation loaded for Lakhi Sahu and Arvind Gupta, 24 November 2026, Insuriya Bhavan, Dibrugarh.';
  document.body.appendChild(sr);
  setTimeout(() => sr.remove(), 5000);
});
