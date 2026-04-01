/**
 * 303 Creative Studio® — Animation System
 * Stack: Lenis (smooth scroll) + GSAP + ScrollTrigger
 * Philosophy: Luxury = subtle, intentional, elegant. Never bounce. Never shake.
 * Eases allowed: power3.out · power4.out · expo.out only
 */

/* ─────────────────────────────────────────────
   0. REDUCED MOTION GUARD
   ───────────────────────────────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────
   1. GSAP SETUP
   ───────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
  ease: 'power3.out',
  duration: 0.9
});

/* ─────────────────────────────────────────────
   2. LENIS SMOOTH SCROLL
   ───────────────────────────────────────────── */
let lenis;

function initLenis() {
  if (prefersReduced) return;

  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false
  });

  // Integrate Lenis with GSAP ticker
  gsap.ticker.add(time => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Anchor links via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.6 });
      }
    });
  });
}

/* ─────────────────────────────────────────────
   3. LOADING SCREEN
   ───────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  if (prefersReduced) {
    loader.style.display = 'none';
    document.body.classList.add('loaded');
    return;
  }

  // Body locked while loading
  document.body.style.overflow = 'hidden';

  const loaderLogo = document.getElementById('loader-logo');
  const loaderLine = document.getElementById('loader-line');

  const tl = gsap.timeline({
    onComplete: () => {
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
      // Kick off hero animation after loader exits
      if (typeof initHero === 'function') initHero();
    }
  });

  // Logo fades in
  tl.fromTo(loaderLogo,
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }
  );

  // Line expands
  tl.fromTo(loaderLine,
    { scaleX: 0 },
    { scaleX: 1, duration: 1.1, ease: 'expo.out', transformOrigin: 'left center' },
    '-=0.2'
  );

  // Hold briefly then exit
  tl.to(loaderLogo, { autoAlpha: 0, y: -12, duration: 0.5, ease: 'power3.out' }, '+=0.3');
  tl.to(loaderLine, { scaleX: 0, duration: 0.4, ease: 'power3.out', transformOrigin: 'right center' }, '-=0.4');
  tl.to(loader, {
    autoAlpha: 0,
    duration: 0.5,
    ease: 'power3.out',
    onComplete: () => { loader.style.display = 'none'; }
  }, '-=0.1');
}

/* ─────────────────────────────────────────────
   4. HERO ANIMATION (index.html only)
   ───────────────────────────────────────────── */
function initHero() {
  const rh1 = document.querySelector('.rh1');
  if (!rh1) return; // Not on a page with hero

  // Disable CSS animations — GSAP takes over
  document.querySelectorAll('.rh').forEach(el => {
    el.style.animation = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
  });

  const heroScroll = document.querySelector('.hero-scroll');
  if (heroScroll) {
    heroScroll.style.animation = 'none';
    heroScroll.style.opacity = '0';
  }

  const heroTl = gsap.timeline({ delay: prefersReduced ? 0 : 0.1 });

  const heroEls = ['.rh1', '.rh2', '.rh3', '.rh4', '.rh5', '.rh6', '.rh7']
    .map(s => document.querySelector(s)).filter(Boolean);

  if (heroEls.length) {
    heroTl.to(heroEls, { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power4.out', stagger: 0.18 });
  }

  if (heroScroll) {
    heroTl.to(heroScroll, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '+=0.2');
  }
}

/* ─────────────────────────────────────────────
   5. CUSTOM CURSOR (desktop only)
   ───────────────────────────────────────────── */
function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only on hover+fine-pointer devices
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) return;

  document.body.classList.add('cursor-active');

  // Position dot instantly, ring follows with slight lag
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

  // quickTo reuses a single tween per property — no GC thrash on mousemove
  const dotX  = gsap.quickTo(dot,  'x', { duration: 0.06, ease: 'none' });
  const dotY  = gsap.quickTo(dot,  'y', { duration: 0.06, ease: 'none' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.3,  ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.3,  ease: 'power3.out' });

  window.addEventListener('mousemove', e => {
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  });

  // Hover state: dot grows, ring shrinks + fills slightly
  const interactables = 'a, button, [data-cursor], .catalog-card, .pricing-card, .problem-card';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactables)) {
      gsap.to(dot, { scale: 2.5, backgroundColor: 'rgba(200,169,126,0.9)', duration: 0.25 });
      gsap.to(ring, { scale: 0.6, borderColor: 'rgba(200,169,126,0.7)', duration: 0.25 });
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactables)) {
      gsap.to(dot, { scale: 1, backgroundColor: '#c8a97e', duration: 0.3 });
      gsap.to(ring, { scale: 1, borderColor: 'rgba(200,169,126,0.5)', duration: 0.3 });
    }
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });
  });
}

/* ─────────────────────────────────────────────
   6. SCROLL REVEALS (.r elements) via ScrollTrigger.batch
   ───────────────────────────────────────────── */
function initScrollReveals() {
  // Remove the old IntersectionObserver class approach — GSAP handles it
  // Elements start invisible (set in CSS via .r { opacity: 0; transform: translateY(28px) })

  if (prefersReduced) {
    // Just make everything visible instantly
    gsap.set('.r', { autoAlpha: 1, y: 0 });
    return;
  }

  ScrollTrigger.batch('.r', {
    start: 'top 90%',
    once: true,
    interval: 0.08,
    batchMax: 6,
    onEnter: batch => {
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1
      });
    }
  });
}

/* ─────────────────────────────────────────────
   7. PARALLAX — hero image + case hero img
   ───────────────────────────────────────────── */
function initParallax() {
  if (prefersReduced) return;

  // Case study hero image
  const caseHero = document.querySelector('.case-hero-img');
  if (caseHero) {
    gsap.to(caseHero, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: caseHero,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }

  // About visual image
  const aboutImg = document.querySelector('.about-visual img');
  if (aboutImg) {
    gsap.to(aboutImg, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-visual',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }

  // Hero orbs parallax on scroll (replaces window scroll listener)
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  if (orb1) {
    gsap.to(orb1, {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2
      }
    });
  }
  if (orb2) {
    gsap.to(orb2, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2
      }
    });
  }
}

/* ─────────────────────────────────────────────
   8. COUNTER ANIMATIONS (.after-num)
   ───────────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.after-num');
  if (!counters.length) return;

  counters.forEach(el => {
    const raw = el.textContent.trim();

    // Parse format: "2,840" | "8.4%" | "30x" | "24"
    const hasComma   = raw.includes(',');
    const hasPercent = raw.includes('%');
    const hasX       = raw.toLowerCase().endsWith('x');
    const numStr     = raw.replace(/,/g, '').replace('%', '').replace(/x/i, '');
    const target     = parseFloat(numStr);
    const isFloat    = numStr.includes('.');
    const decimals   = isFloat ? (numStr.split('.')[1] || '').length : 0;

    if (isNaN(target)) return;

    const obj = { v: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: prefersReduced ? 0 : 1.8,
          ease: 'power3.out',
          snap: { v: isFloat ? Math.pow(10, -decimals) : 1 },
          onUpdate: () => {
            let display = isFloat ? obj.v.toFixed(decimals) : Math.round(obj.v).toString();
            if (hasComma && obj.v >= 1000) {
              display = Math.round(obj.v).toLocaleString('en-US');
            }
            if (hasPercent) display += '%';
            if (hasX)       display += 'x';
            el.textContent = display;
          }
        });
      }
    });
  });
}

/* ─────────────────────────────────────────────
   9. CLIP-PATH IMAGE REVEALS (.case-images img)
   ───────────────────────────────────────────── */
function initImageReveals() {
  if (prefersReduced) return;

  const imgs = document.querySelectorAll('.case-images img');
  if (!imgs.length) return;

  gsap.set(imgs, { clipPath: 'inset(100% 0 0 0)', autoAlpha: 1 });

  ScrollTrigger.batch(imgs, {
    start: 'top 88%',
    once: true,
    interval: 0.1,
    batchMax: 4,
    onEnter: batch => {
      gsap.to(batch, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.15
      });
    }
  });
}

/* ─────────────────────────────────────────────
   10. MAGNETIC BUTTONS
   ───────────────────────────────────────────── */
function initMagneticButtons() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover || prefersReduced) return;

  const magneticEls = document.querySelectorAll('.btn-gold, .btn-primary, .nav-cta');

  magneticEls.forEach(el => {
    const strength = 0.35;

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top + rect.height / 2;
      const dx   = (e.clientX - cx) * strength;
      const dy   = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
    });
  });
}

/* ─────────────────────────────────────────────
   11. NAVBAR — scroll state via GSAP ScrollTrigger
   ───────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top+=60 top',
    onEnter:      () => nav.classList.add('scrolled'),
    onLeaveBack:  () => nav.classList.remove('scrolled')
  });
}

/* ─────────────────────────────────────────────
   12. SECTION HEADINGS — staggered word reveal
   ───────────────────────────────────────────── */
function initHeadingReveal() {
  if (prefersReduced) return;

  // Target main section h2 elements that are NOT in the hero (those are .rh)
  const headings = document.querySelectorAll('.sec h2');

  headings.forEach(h2 => {
    // Skip if already handled or contains complex markup (br + spans are fine)
    const text = h2.innerHTML;

    // Split into words, skipping over HTML tags
    const wrapped = text.replace(/(<[^>]+>)|([\w,.!?'"\u00C0-\u024F]+)/g, (match, tag, word) => {
      if (tag) return tag;
      return '<span class="word-wrap"><span class="word">' + word + '</span></span>';
    });
    h2.innerHTML = wrapped;

    const words = h2.querySelectorAll('.word');
    if (!words.length) return;

    gsap.set(words, { y: '105%', autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: h2,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          y: '0%',
          autoAlpha: 1,
          duration: 0.75,
          ease: 'power4.out',
          stagger: 0.04
        });
      }
    });
  });
}

/* ─────────────────────────────────────────────
   13. PRICING CARDS — stagger entrance
   ───────────────────────────────────────────── */
function initPricingReveal() {
  if (prefersReduced) return;

  const cards = document.querySelectorAll('.pricing-card');
  if (!cards.length) return;

  // Remove them from the general .r batch (they have .r class already)
  // Let ScrollTrigger handle them as a group
  gsap.set(cards, { autoAlpha: 0, y: 40 });

  ScrollTrigger.create({
    trigger: '.pricing-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.12
      });
    }
  });
}

/* ─────────────────────────────────────────────
   INIT — run everything
   ───────────────────────────────────────────── */
function init() {
  // Smooth scroll first
  initLenis();

  // Nav scrolled class
  initNav();

  // Cursor (non-blocking)
  initCursor();

  // Scroll reveals
  initScrollReveals();

  // Parallax
  initParallax();

  // Counters
  initCounters();

  // Clip-path reveals
  initImageReveals();

  // Magnetic buttons
  initMagneticButtons();

  // Heading word reveal
  initHeadingReveal();

  // Pricing stagger
  initPricingReveal();

  // Loader starts the chain — hero fires from onComplete callback
  // If no loader exists on this page, fire hero directly
  const loader = document.getElementById('loader');
  if (loader) {
    initLoader();
  } else {
    document.body.classList.add('loaded');
    initHero();
  }
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
