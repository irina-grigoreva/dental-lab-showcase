// Client behaviour for the Elident site. Ported from the Component class of the original Main.dc.html.
// Pages are static (Astro); this script adds the interaction, scroll and GSAP motion on top of the markup.
/* eslint-disable @typescript-eslint/no-explicit-any */

const W = window as any;
const root = document.querySelector<HTMLElement>('[data-root]');

const $ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document): T | null => scope.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document): T[] => Array.from(scope.querySelectorAll<T>(sel));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const fine = () => { try { return matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced(); } catch (e) { return false; } };
const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const gsapLib = (): any => (W.gsap && W.ScrollTrigger ? W.gsap : null);

if (root) {
  boot(root);
}

function boot(root: HTMLElement) {
  const page = root.dataset.page || 'home';
  const lenisMode = { lenis: null as any };
  const hdr = $<HTMLElement>('[data-hdr]')!;
  const main = $<HTMLElement>('[data-main]')!;

  /* ---------- Scroll helpers ---------- */
  const elTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
  const scrollToY = (y: number, instant = false) => {
    const top = Math.max(0, y);
    if (lenisMode.lenis) { lenisMode.lenis.scrollTo(top, { immediate: instant || reduced(), duration: 1.1, force: true }); return; }
    window.scrollTo({ top, behavior: instant || reduced() ? 'auto' : 'smooth' });
  };

  /* ---------- Intro: the curtain plays on every full page load (never with reduced motion) ---------- */
  const introEl = $<HTMLElement>('[data-intro]');
  const introTimers: number[] = [];
  const endIntro = () => {
    introTimers.forEach((t) => clearTimeout(t));
    root.removeAttribute('data-intro-on');
    document.documentElement.style.background = '';
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((t) => window.removeEventListener(t, endIntro, { capture: true } as any));
    introEl?.remove();
    W.__elidentIntro = false;
  };
  // The logo curtain plays once per browser tab (first open of the site). Later pages skip it and
  // use the pixel transition instead.
  const store = {
    get: (k: string) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
    del: (k: string) => { try { sessionStorage.removeItem(k); } catch (e) { /* storage blocked */ } },
  };
  const INTRO_KEY = 'elident-intro-seen', PIXEL_KEY = 'elident-px-in';
  let introOn = false;
  if (introEl) {
    if (reduced() || store.get(INTRO_KEY)) {
      endIntro();
    } else {
      introOn = true;
      store.set(INTRO_KEY, '1');
      W.__elidentIntroT0 = performance.now();
      root.setAttribute('data-intro-on', '');
      introTimers.push(window.setTimeout(() => root.removeAttribute('data-intro-on'), 1500));
      introTimers.push(window.setTimeout(endIntro, 2450));
      ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((t) => window.addEventListener(t, endIntro, { capture: true, passive: true } as any));
    }
  }
  const introPlaying = () => introOn;

  /* ---------- Header: dark over dark sections; the to-top button; hero depth; statement ---------- */
  const totop = $<HTMLButtonElement>('[data-totop]');
  const darkSel = page === 'home' ? ['.hero', '.how', '.proof-sec'] : null;
  const updateTop = () => {
    const y = window.scrollY;
    const showTop = y > window.innerHeight * 0.9;
    if (totop) {
      totop.classList.toggle('is-on', showTop);
      totop.tabIndex = showTop ? 0 : -1;
      totop.setAttribute('aria-hidden', showTop ? 'false' : 'true');
    }
    let dark = false;
    const darks = darkSel ? darkSel.map((q) => $(q)) : $$('.x-dark');
    darks.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = el.nextElementSibling as HTMLElement | null;
      const covered = !!nx && nx.getBoundingClientRect().top <= 36;
      if (r.top <= 110 && r.bottom > 36 && !covered) dark = true;
    });
    hdr.classList.toggle('is-dark', dark);
    if (!reduced()) {
      const hp = clamp(y / 700, 0, 1);
      root.style.setProperty('--hp', hp.toFixed(3));
    }
    scrubStatement();
    syncHow();
  };
  const scrubStatement = () => {
    const el = $<HTMLElement>('[data-stmt]');
    if (!el) return;
    const words = $$<HTMLElement>('.sw', el);
    if (reduced()) { words.forEach((w) => (w.style.opacity = '1')); return; }
    const vh = window.innerHeight, r = el.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
    const lit = p * words.length * 1.15;
    words.forEach((w, i) => (w.style.opacity = clamp(lit - i, 0.45, 1).toFixed(2)));
  };
  let rafId = 0;
  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => { rafId = 0; updateTop(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { updateTop(); placeSeg(); sizeSheet(); if (menuOpen && window.innerWidth >= 1024) setMenu(false); });
  totop?.addEventListener('click', (e) => { e.preventDefault(); scrollToY(0); main?.focus({ preventScroll: true } as any); });

  /* ---------- Mobile menu sheet ---------- */
  const menuBtn = $<HTMLButtonElement>('[data-menu-btn]');
  const sheet = $<HTMLElement>('[data-sheet]');
  let menuOpen = false;
  const sizeSheet = () => {
    if (!sheet) return;
    sheet.style.height = Math.max(320, window.innerHeight - hdr.offsetHeight) + 'px';
  };
  const setMenu = (open: boolean, focusBtn = false) => {
    if (!sheet || !menuBtn) return;
    menuOpen = open;
    sheet.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    ($<SVGElement>('[data-icon-open]', menuBtn)!).style.display = open ? 'none' : '';
    ($<SVGElement>('[data-icon-close]', menuBtn)!).style.display = open ? '' : 'none';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      if (hdr.hasAttribute('data-hide')) showHeader();
      sizeSheet();
      $<HTMLElement>('[data-first]', sheet)?.focus({ preventScroll: true } as any);
    } else if (focusBtn) menuBtn.focus({ preventScroll: true } as any);
  };
  menuBtn?.addEventListener('click', () => setMenu(!menuOpen));
  hdr.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false, true); });

  /* ---------- In-page anchors: smooth scroll with the sticky header offset ---------- */
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.target === '_blank') return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    scrollToY(elTop(target) - (url.hash === '#contact' ? 104 : 72));
    history.replaceState(null, '', url.hash);
    // Move focus to the target too, so keyboard users continue from the section they jumped to.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- How It Works: three frames, driven by scroll on wide screens ---------- */
  const track = $<HTMLElement>('[data-how-track]');
  const howTexts = $$<HTMLElement>('[data-text]');
  const tabs = $$<HTMLButtonElement>('[data-tab]');
  const stages = $$<HTMLElement>('[data-stage-item]');
  const nums = $$<HTMLElement>('[data-num]');
  const progress = $<HTMLElement>('[data-progress]');
  const stageCaption = $<HTMLElement>('[data-stage-caption]');
  // Keep the caption in sync with the initial markup (first frame) before any scroll.
  let step = 0, prevStep = -1, lockUntilSync = false, lockT = 0;
  const setStep = (n: number) => {
    if (n === step) return;
    prevStep = step; step = n;
    nums.forEach((el, i) => { el.className = i === step ? 'is-on' : i < step ? 'is-above' : 'is-below'; });
    howTexts.forEach((el, i) => {
      el.classList.toggle('is-on', i === step);
      el.classList.toggle('is-prev', i !== step && i === prevStep);
      el.setAttribute('aria-hidden', String(i !== step));
    });
    tabs.forEach((el, i) => {
      el.classList.toggle('is-on', i === step);
      el.setAttribute('aria-pressed', String(i === step));
      el.tabIndex = i === step ? 0 : -1;
    });
    stages.forEach((el, i) => {
      el.classList.toggle('is-on', i === step);
      el.setAttribute('aria-hidden', String(i !== step));
    });
    if (stageCaption) stageCaption.textContent = `Fig. 0${step + 1} — ${stages[step]?.dataset.caption ?? ''}`;
    if (!trackRange() && progress) progress.style.transform = `scaleX(${((step + 1) / 3).toFixed(4)})`;
  };
  const isPinned = () => {
    if (!track) return false;
    const wide = root.getBoundingClientRect().width >= 768;
    const vh = window.innerHeight;
    const pin = wide && vh >= 560 && vh <= 1300;
    root.style.setProperty('--vh', Math.min(vh, 1300) + 'px');
    track.classList.toggle('is-pinned', pin);
    return pin;
  };
  const trackRange = () => {
    if (!track || track.offsetHeight === 0 || !isPinned()) return null;
    const start = elTop(track) - hdr.offsetHeight;
    const end = elTop(track) + track.offsetHeight - window.innerHeight;
    return end > start ? { start, end } : null;
  };
  const syncHow = () => {
    if (!track) return;
    const r = trackRange();
    if (!r) return;
    const p = clamp((window.scrollY - r.start) / (r.end - r.start), 0, 1);
    if (progress) progress.style.transform = `scaleX(${p.toFixed(4)})`;
    if (lockUntilSync) return;
    const n = Math.min(2, Math.floor(p * 3));
    setStep(n);
  };
  const pickStep = (i: number, focusTab: boolean) => {
    const n = clamp(i, 0, 2);
    setStep(n);
    if (focusTab) tabs[n]?.focus();
    const r = trackRange();
    if (!r) return;
    lockUntilSync = true;
    clearTimeout(lockT);
    lockT = window.setTimeout(() => { lockUntilSync = false; syncHow(); }, reduced() ? 60 : 1000);
    scrollToY(r.start + ((n + 0.5) / 3) * (r.end - r.start));
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => pickStep(i, false)));
  $('[data-tabs]')?.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    let n: number | null = null;
    if (k === 'ArrowRight' || k === 'ArrowDown') n = (step + 1) % 3;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (step + 2) % 3;
    else if (k === 'Home') n = 0;
    else if (k === 'End') n = 2;
    if (n === null) return;
    e.preventDefault();
    pickStep(n, true);
  });
  setStep(0);
  isPinned();

  /* ---------- FAQ accordion ---------- */
  const faqList = $('[data-faq-list]');
  $$<HTMLButtonElement>('[data-faq]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item')!;
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  faqList?.addEventListener('keydown', (e) => {
    const ke = e as KeyboardEvent;
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    const t = ke.target as HTMLElement;
    if (keys.indexOf(ke.key) < 0 || !t.classList.contains('faq-q')) return;
    const btns = $$<HTMLButtonElement>('.faq-q', faqList);
    const i = btns.indexOf(t as HTMLButtonElement);
    if (i < 0) return;
    const n = ke.key === 'Home' ? 0 : ke.key === 'End' ? btns.length - 1 : (i + (ke.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length;
    ke.preventDefault();
    btns[n].focus();
  });

  /* ---------- Product gallery: thumbnails, arrows, zoom ---------- */
  const gallery = $('[data-gallery]');
  if (gallery) {
    const slides = $$<HTMLElement>('[data-slide]', gallery);
    const thumbs = $$<HTMLButtonElement>('[data-thumb]', gallery);
    const stage = $<HTMLElement>('[data-stage]', gallery)!;
    const zoomBtn = $<HTMLButtonElement>('[data-zoom]', gallery);
    const countEl = $('[data-gal-now]', gallery);
    const capEl = $('[data-gal-cap]', gallery);
    const N = slides.length;
    let g = 0;
    const setZoom = (on: boolean, x?: number, y?: number) => {
      stage.classList.toggle('is-zoom', on);
      if (on) { stage.style.setProperty('--zx', (x ?? 50) + '%'); stage.style.setProperty('--zy', (y ?? 50) + '%'); }
      if (zoomBtn) { zoomBtn.setAttribute('aria-pressed', String(on)); zoomBtn.setAttribute('aria-label', on ? 'Zoom out' : 'Zoom photo'); }
    };
    const unzoom = () => { if (stage.classList.contains('is-zoom')) setZoom(false); };
    const setG = (i: number, focus: boolean) => {
      const n = ((i % N) + N) % N;
      unzoom();
      g = n;
      slides.forEach((s, k) => { s.classList.toggle('is-on', k === n); s.setAttribute('aria-hidden', String(k !== n)); });
      thumbs.forEach((t, k) => { t.classList.toggle('is-on', k === n); t.setAttribute('aria-pressed', String(k === n)); t.tabIndex = k === n ? 0 : -1; });
      if (countEl) countEl.textContent = `0${n + 1} / 0${N}`;
      if (capEl) capEl.textContent = `Fig. 0${n + 1} — ${slides[n].dataset.label ?? ''}`;
      if (focus) thumbs[n]?.focus();
    };
    thumbs.forEach((t, i) => t.addEventListener('click', () => setG(i, false)));
    $('[data-gal-prev]', gallery)?.addEventListener('click', () => setG(g - 1, false));
    $('[data-gal-next]', gallery)?.addEventListener('click', () => setG(g + 1, false));
    zoomBtn?.addEventListener('click', (e) => { e.stopPropagation(); setZoom(!stage.classList.contains('is-zoom')); });
    stage.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-zoom]')) return;
      const r = stage.getBoundingClientRect();
      setZoom(!stage.classList.contains('is-zoom'), (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
    });
    stage.addEventListener('pointermove', (e) => {
      if (!stage.classList.contains('is-zoom') || e.pointerType === 'touch') return;
      const r = stage.getBoundingClientRect();
      stage.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%');
      stage.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
    });
    stage.addEventListener('pointerleave', unzoom);
    gallery.addEventListener('keydown', (e) => {
      const ke = e as KeyboardEvent;
      if (N < 2) { if (ke.key === 'Escape') unzoom(); return; }
      if (ke.key === 'ArrowRight' || ke.key === 'ArrowDown') { ke.preventDefault(); setG(g + 1, true); }
      else if (ke.key === 'ArrowLeft' || ke.key === 'ArrowUp') { ke.preventDefault(); setG(g - 1, true); }
      else if (ke.key === 'Home') { ke.preventDefault(); setG(0, true); }
      else if (ke.key === 'End') { ke.preventDefault(); setG(N - 1, true); }
      else if (ke.key === 'Escape') unzoom();
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') unzoom(); });
  }

  /* ---------- Shop: segmented filter with a sliding indicator and a FLIP re-layout ---------- */
  const seg = $('[data-seg]');
  const list = $('[data-list]');
  const countText = $('[data-count]');
  const placeSeg = () => {
    if (!seg) return;
    const on = $<HTMLElement>('.xseg-btn.is-on', seg), ind = $<HTMLElement>('.xseg-ind', seg);
    if (!on || !ind) return;
    ind.style.width = on.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + on.offsetLeft + 'px)';
  };
  const applyFilter = (id: string, flipFirst?: Map<string, number>) => {
    if (!list || !seg) return;
    const rows = $$<HTMLElement>(':scope > .xprod', list);
    const keep = (r: HTMLElement) => id === 'all' || r.dataset.id === id;
    rows.forEach((r) => r.classList.toggle('is-hidden', !keep(r)));
    const visible = rows.filter((r) => keep(r));
    visible.forEach((r, i) => r.classList.toggle('is-flip', i % 2 === 1));
    $$<HTMLButtonElement>('[data-filter]', seg).forEach((b) => {
      const on = b.dataset.filter === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (countText) countText.textContent = `Showing ${visible.length} ${visible.length === 1 ? 'product' : 'products'}`;
    placeSeg();
    const g = gsapLib();
    if (g && flipFirst && !reduced()) {
      visible.forEach((r, k) => {
        const id2 = r.dataset.id!;
        const top = r.getBoundingClientRect().top;
        if (flipFirst.has(id2)) { const dy = flipFirst.get(id2)! - top; if (Math.abs(dy) > 1) g.fromTo(r, { y: dy }, { y: 0, duration: 0.7, ease: 'power3.inOut', clearProps: 'transform' }); }
        else g.fromTo(r, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.08 * k, ease: 'power3.out', clearProps: 'opacity,transform' });
      });
      W.ScrollTrigger?.refresh();
    }
  };
  let currentFilter = 'all';
  const filterTo = (id: string) => {
    if (id === currentFilter || !list) return;
    currentFilter = id;
    const g = gsapLib();
    const rows = $$<HTMLElement>(':scope > .xprod', list);
    const visible = rows.filter((r) => !r.classList.contains('is-hidden'));
    const flipFirst = new Map(visible.map((r) => [r.dataset.id!, r.getBoundingClientRect().top]));
    const leaving = visible.filter((r) => !(id === 'all' || r.dataset.id === id));
    if (g && leaving.length && !reduced()) {
      g.to(leaving, { opacity: 0, y: -24, duration: 0.28, ease: 'power2.in', onComplete: () => { g.set(leaving, { clearProps: 'opacity,transform' }); applyFilter(id, flipFirst); } });
    } else applyFilter(id, flipFirst);
  };
  seg?.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b) => b.addEventListener('click', () => filterTo(b.dataset.filter!)));
  seg?.addEventListener('keydown', (e) => {
    const ke = e as KeyboardEvent;
    const ids = ['all', 'reusable', 'disposable', 'kit'];
    const i = ids.indexOf(currentFilter);
    let n: number | null = null;
    if (ke.key === 'ArrowRight' || ke.key === 'ArrowDown') n = (i + 1) % ids.length;
    else if (ke.key === 'ArrowLeft' || ke.key === 'ArrowUp') n = (i - 1 + ids.length) % ids.length;
    else if (ke.key === 'Home') n = 0;
    else if (ke.key === 'End') n = ids.length - 1;
    if (n === null) return;
    ke.preventDefault();
    filterTo(ids[n]);
    seg.querySelectorAll<HTMLButtonElement>('[data-filter]')[n].focus();
  });

  /* ---------- Disposable cost estimate ---------- */
  const calc = $('[data-calc]');
  if (calc) {
    const range = $<HTMLInputElement>('[data-calc-range]', calc)!;
    const update = () => {
      const cases = parseInt(range.value, 10) || 60;
      const bags = Math.ceil(cases / 50), left = bags * 50 - cases;
      range.style.setProperty('--fill', ((cases - 10) / 390 * 100).toFixed(1) + '%');
      $('[data-calc-out]', calc)!.textContent = String(cases);
      $('[data-calc-sets]', calc)!.textContent = `${cases} sets × $2.00 per set`;
      $('[data-calc-used]', calc)!.textContent = money(cases * 2);
      $('[data-calc-bags]', calc)!.textContent = `${bags} × $100.00 per bag of 50 · ${left} sets left over`;
      $('[data-calc-bought]', calc)!.textContent = money(bags * 100);
    };
    range.addEventListener('input', update);
    range.addEventListener('change', update);
    const toggle = $<HTMLButtonElement>('[data-calc-toggle]', calc)!;
    const panel = $('#calc2-panel');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      panel?.classList.toggle('is-open', open);
    });
  }

  /* ---------- Quantity ---------- */
  const qtyOut = $('[data-qty]');
  const qtyDone = $('[data-qty-done]');
  let qty = 1;
  const setQty = (n: number) => {
    qty = clamp(n, 1, 99);
    if (qtyOut) qtyOut.textContent = String(qty);
    if (qtyDone) qtyDone.textContent = String(qty);
  };
  $('[data-qty-up]')?.addEventListener('click', () => setQty(qty + 1));
  $('[data-qty-down]')?.addEventListener('click', () => setQty(qty - 1));

  /* ---------- Order request form: inline validation, a short sending state, on-page confirmation ---------- */
  const form = $<HTMLFormElement>('[data-order]');
  if (form) {
    const checkField = (inp: HTMLInputElement) => {
      if (!inp.validity) return true;
      const ok = inp.validity.valid;
      const err = inp.parentElement?.querySelector<HTMLElement>('.field-err');
      if (ok) { inp.removeAttribute('aria-invalid'); if (err) err.textContent = ''; }
      else { inp.setAttribute('aria-invalid', 'true'); if (err) err.textContent = inp.dataset.err || 'Check this field.'; }
      return ok;
    };
    form.addEventListener('focusout', (e) => {
      const t = e.target as HTMLInputElement;
      if (t.tagName === 'INPUT' && (t.value || t.hasAttribute('aria-invalid'))) checkField(t);
    });
    form.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement;
      if (t.tagName === 'INPUT' && t.hasAttribute('aria-invalid') && t.validity.valid) checkField(t);
    });
    let sending = false, sendT = 0;
    const btn = $<HTMLButtonElement>('[data-order-btn]', form)!;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (sending) return;
      const inputs = $$<HTMLInputElement>('input', form);
      for (const inp of inputs) {
        if (!checkField(inp)) { inp.focus(); return; }
      }
      sending = true;
      btn.setAttribute('aria-busy', 'true');
      if (btn.firstChild) btn.firstChild.textContent = 'Sending request…';
      clearTimeout(sendT);
      sendT = window.setTimeout(() => {
        sending = false;
        btn.setAttribute('aria-busy', 'false');
        if (btn.firstChild) btn.firstChild.textContent = btn.dataset.label ?? '';
        $('[data-order-open]', form)?.setAttribute('hidden', '');
        const done = $<HTMLElement>('[data-order-done]', form);
        if (done) done.style.display = '';
        done?.focus?.();
      }, 650);
    });
  }

  /* ---------- Reveal on scroll (only when motion is allowed) ---------- */
  const revealSel = '.proof-item, .sec-head, .sys-grid > .card, .faq-head, .faq-item, .faq-more, .t-card, .logos, .founder-media, .founder-copy, .kit-copy, .kit-media, .calc2, .hints, .flow-item, .xfilter-bar, .xprod-info, .xsec-t, .xcmp-col, .xrel-item, .xnote, .xfeat-copy, .xab-copy, .xab-ch-copy, .xct-left, .xct-right, .xart-body, .xart-cta, .xprod, .bench-item, .badges, .x-index, .ftr-top, .ftr-word';
  const countUp = (scope: Element) => {
    $$<HTMLElement>('[data-to]', scope).forEach((n) => {
      const to = parseFloat(n.dataset.to!), dec = parseInt(n.dataset.dec || '0', 10), t0 = performance.now(), dur = 1400;
      const step2 = (now: number) => { const k = Math.min(1, (now - t0) / dur); const v = 1 - Math.pow(1 - k, 4); n.textContent = (to * v).toFixed(dec); if (k < 1) requestAnimationFrame(step2); };
      n.textContent = (0).toFixed(dec);
      requestAnimationFrame(step2);
    });
  };
  if (!reduced() && 'IntersectionObserver' in window) {
    root.setAttribute('data-reveal-ready', '');
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      el.setAttribute('data-shown', '');
      if (el.querySelector('[data-to]')) countUp(el);
      const step2 = el.classList.contains('bench-item') ? 160 : 90;
      const delay = (parseInt(el.style.getPropertyValue('--i'), 10) || 0) * step2 + 950;
      window.setTimeout(() => el.setAttribute('data-done', ''), delay);
    }), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    $$<HTMLElement>(revealSel, root).forEach((el) => {
      if (el.hasAttribute('data-reveal')) return;
      const sibs = Array.from(el.parentElement?.children ?? []).filter((c) => c.matches(revealSel));
      el.style.setProperty('--i', String(Math.min(4, Math.max(0, sibs.indexOf(el)))));
      el.setAttribute('data-reveal', '');
      io.observe(el);
    });
  }

  /* ---------- Card tilt (fine pointers only) ---------- */
  if (fine()) {
    let lastCard: HTMLElement | null = null;
    root.addEventListener('mousemove', (e) => {
      const card = (e.target as HTMLElement).closest?.('.card') as HTMLElement | null;
      if (lastCard && lastCard !== card) { lastCard.style.removeProperty('--mx'); lastCard.style.removeProperty('--my'); }
      if (card) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--mx', (x * -14).toFixed(1) + 'px');
        card.style.setProperty('--my', (y * -10).toFixed(1) + 'px');
      }
      lastCard = card;
    });
    root.addEventListener('mouseleave', () => { if (lastCard) { lastCard.style.removeProperty('--mx'); lastCard.style.removeProperty('--my'); } });
  }

  /* ---------- Sticky header: slides away on scroll down, back on scroll up (GSAP only) ---------- */
  let hdrHidden = false, hdrAnim: any = null;
  const showHeader = () => {
    const g = gsapLib();
    if (!g || !hdrHidden) return;
    hdrHidden = false;
    hdr.removeAttribute('data-hide');
    if (hdrAnim) hdrAnim.kill();
    const it = $$<HTMLElement>('.logo, .nav-link, .hdr-cta, .menu-btn', hdr).filter((e) => e.offsetParent);
    g.set(it, { y: -50 });
    hdrAnim = g.timeline()
      .to(hdr, { yPercent: 0, duration: 0.45, ease: 'power3.out' })
      .to(it, { y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }, '<');
  };
  const hideHeader = () => {
    const g = gsapLib();
    if (!g || hdrHidden || menuOpen) return;
    hdrHidden = true;
    hdr.setAttribute('data-hide', '');
    if (hdrAnim) hdrAnim.kill();
    hdrAnim = g.to(hdr, { yPercent: -110, duration: 0.45, ease: 'power3.inOut' });
  };

  /* ---------- GSAP motion: split headings, art reveals, pinned stacks, pixel strips, Lenis ---------- */
  const g = gsapLib();
  const ST = W.ScrollTrigger;
  const Split = W.SplitText;
  if (g && !reduced()) {
    g.registerPlugin(ST, ...(Split ? [Split] : []));
    root.setAttribute('data-gs', '');
    if (fine() && W.Lenis) {
      const l = new W.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
      W.__elidentLenis = lenisMode.lenis = l;
      l.on('scroll', ST.update);
      g.ticker.add((t: number) => l.raf(t * 1000));
      g.ticker.lagSmoothing(0);
    }
    ST.create({
      start: 0,
      end: 'max',
      onUpdate: (self: any) => {
        if (self.scroll() <= hdr.offsetHeight) return showHeader();
        if (self.direction === 1) hideHeader(); else if (self.direction === -1) showHeader();
      },
    });
    hdr.addEventListener('focusin', showHeader);

    // Hide headings until the fonts are in, so the lines are measured once with the final type.
    root.setAttribute('data-gs-pending', '');
    let ready = false;
    const go = () => {
      if (ready) return;
      ready = true;
      scanMotion();
      root.removeAttribute('data-gs-pending');
    };
    const fontT = window.setTimeout(go, 1400);
    if (document.fonts?.ready) document.fonts.ready.then(() => { clearTimeout(fontT); go(); });
  }

  function scanMotion() {
    if (!g) return;
    const scroller = window as any;
    // Headings: each line rises from under a mask.
    if (Split) {
      $$<HTMLElement>('[data-split]:not([data-gs-done])').forEach((el) => {
        el.setAttribute('data-gs-done', '');
        Split.create(el, {
          type: 'lines', mask: 'lines', linesClass: 'gs-line', autoSplit: true, aria: el.tagName === 'P' ? 'none' : 'auto',
          onSplit: (self: any) => g.from(self.lines, { yPercent: 118, duration: 1.15, ease: 'expo.out', stagger: 0.085, scrollTrigger: { trigger: el, scroller, start: 'top 90%', once: true } }),
        });
      });
      // Footer wordmark: letter by letter.
      $$<HTMLElement>('[data-split-chars]:not([data-gs-done])').forEach((el) => {
        el.setAttribute('data-gs-done', '');
        const sp = Split.create(el, { type: 'chars', charsClass: 'ftr-char', aria: 'none' });
        g.set(sp.chars, { yPercent: 100, opacity: 0 });
        g.to(sp.chars, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: el, scroller, start: 'top 95%', once: true } });
      });
    }
    setupArt(scroller);
    setupInner(scroller);
    setupStack(scroller);
    $$<HTMLElement>('[data-px]:not([data-gs-done])').forEach((w) => { w.setAttribute('data-gs-done', ''); pixelTransition(w, scroller); });
    // Slow photo drift inside its frame.
    $$<HTMLElement>('.founder-media .ph, .about-media .ph, .story-media .ph').forEach((ph) => {
      const img = ph.querySelector('img'); if (!img || ph.hasAttribute('data-gs-par')) return;
      ph.setAttribute('data-gs-par', ''); ph.classList.add('gs-par');
      g.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: ph, scroller, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    ST.refresh();
  }

  // Hero: after the intro curtain the articulator is "lit"; on scroll it sinks back slower than the page.
  function setupArt(scroller: any) {
    const hero = $('.hero');
    if (hero && !hero.hasAttribute('data-gs-art')) {
      hero.setAttribute('data-gs-art', '');
      const img = $<HTMLElement>('.hero-media img', hero), frame = $<HTMLElement>('.hero-media .ph', hero), light = $<HTMLElement>('.hero-light', hero);
      let wait = 0.15;
      if (introPlaying()) wait = Math.max(0, 1500 - (performance.now() - (W.__elidentIntroT0 || 0))) / 1000;
      if (img) {
        const f = (b: string) => 'brightness(' + b + ')';
        g.timeline({ delay: wait })
          .fromTo(img, { scale: 1.16, filter: f('0.25') }, { scale: 1.04, filter: f('1'), duration: 2.4, ease: 'expo.out', clearProps: 'filter' })
          .fromTo(light, { opacity: 1, backgroundPosition: '120% 0' }, { backgroundPosition: '-40% 0', duration: 1.8, ease: 'power2.inOut' }, 0.35)
          .to(light, { opacity: 0, duration: 0.6 }, '>-0.3');
        if (frame) g.to(frame, { yPercent: 10, scale: 1.06, ease: 'none', scrollTrigger: { trigger: hero, scroller, start: 'top top', end: 'bottom top', scrub: true } });
      }
      const head = $<HTMLElement>('.hero-head', hero);
      if (head) g.to(head, { yPercent: -18, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, scroller, start: 'top top', end: 'bottom top', scrub: true } });
    }
    $$<HTMLElement>('.sys-grid, .kit-media').forEach((grp) => {
      if (grp.hasAttribute('data-gs-art')) return;
      grp.setAttribute('data-gs-art', '');
      const phs = $$<HTMLElement>('.ph', grp);
      if (!phs.length) return;
      const imgs = phs.map((ph) => ph.querySelector('img')).filter(Boolean);
      const tl = g.timeline({ scrollTrigger: { trigger: grp, scroller, start: 'top 82%', once: true } });
      tl.fromTo(phs, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut', stagger: 0.14, clearProps: 'clipPath' })
        .fromTo(imgs, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'expo.out', stagger: 0.14, clearProps: 'transform' }, 0.1);
    });
  }

  // Inner pages: product plates and photos open from the bottom like a photograph being uncovered.
  function setupInner(scroller: any) {
    $$<HTMLElement>('.x-mask:not([data-gs-art])').forEach((ph) => {
      ph.setAttribute('data-gs-art', '');
      const img = ph.querySelector('img');
      const tl = g.timeline({ scrollTrigger: { trigger: ph, scroller, start: 'top 82%', once: true } });
      tl.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut', clearProps: 'clipPath' });
      if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, 0.1);
    });
    $$<HTMLElement>('.x-scrub:not([data-gs-art])').forEach((ph) => {
      ph.setAttribute('data-gs-art', '');
      const img = ph.querySelector('img');
      const tl = g.timeline({ scrollTrigger: { trigger: ph, scroller, start: 'top 95%', end: 'top 30%', scrub: 0.6 } });
      tl.fromTo(ph, { clipPath: 'inset(9% 7% 9% 7%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0);
      if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none' }, 0);
    });
  }

  // Stacked sections: the section before a light one holds still while the light one slides over it.
  function setupStack(scroller: any) {
    const pairsByPage: Record<string, string[][]> = {
      home: [['.hero', '.statement'], ['.statement', '.how'], ['.kit', '.faq'], ['.faq', '.founder']],
      shop: [['.xhero', '.xcat']],
      product: [['.xbench', '.xcmp']],
      notes: [['.xfeat', '.xnotes-listw']],
      note: [['.xart-cover', '.xart-main']],
      about: [['.xab-hero', '.xab-story'], ['.xab-story', '.xcontact']],
    };
    const pairs = pairsByPage[page] || [];
    const pageEl = $<HTMLElement>('main .page');
    if (!pageEl || !pairs.length || pageEl.hasAttribute('data-stack')) return;
    pageEl.setAttribute('data-stack', '');
    const kids = Array.from(pageEl.children) as HTMLElement[];
    kids.forEach((k, i) => { k.style.position = k.style.position || 'relative'; k.style.zIndex = String(i + 1); });
    const holds: HTMLElement[] = [];
    pairs.forEach(([a, b]) => {
      const hold = pageEl.querySelector<HTMLElement>(':scope > ' + a), over = pageEl.querySelector<HTMLElement>(':scope > ' + b);
      if (!hold || !over) return;
      hold.setAttribute('data-stack-hold', ''); holds.push(hold);
      if (over.previousElementSibling === hold) over.setAttribute('data-stack-over', '');
      over.setAttribute('data-stack-cover', '');
      hold.style.position = 'sticky';
      const inner = (hold.querySelector(':scope > .wrap') as HTMLElement) || (hold.classList.contains('wrap') || hold.classList.contains('xart-cover') ? hold : null);
      if (inner && hold.nextElementSibling) {
        g.fromTo(inner, { opacity: 1, scale: 1, yPercent: 0 }, { opacity: 0.35, scale: 0.96, yPercent: 4, ease: 'none',
          scrollTrigger: { trigger: hold.nextElementSibling, scroller, start: 'top bottom', end: 'top top', scrub: true } });
      }
    });
    if (holds.length) {
      const firstHold = kids.indexOf(holds[0]);
      kids.slice(firstHold + 1).forEach((k) => k.setAttribute('data-stack-cover', ''));
    }
    const place = () => { const vh = window.innerHeight; holds.forEach((h) => { h.style.top = Math.min(0, vh - h.offsetHeight) + 'px'; }); };
    place();
    ST.addEventListener('refreshInit', place);
  }

  // Pixel strip between two sections: cells flip from the upper section's colour to the lower one's on scroll.
  function pixelTransition(wrapper: HTMLElement, scroller: any) {
    const bgOf = (el: Element) => {
      let e: Element | null = el;
      while (e) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)/.test(c)) return c; e = e.parentElement; }
      return '#F5F7FA';
    };
    const bg = (sel: string | null) => { const e = sel ? $(sel) : null; return e ? bgOf(e) : '#FFFFFF'; };
    const from = bg(wrapper.getAttribute('data-px-from')), to = bg(wrapper.getAttribute('data-px-to'));
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#4BB7E8';
    const narrow = root.getBoundingClientRect().width < 768;
    const cols = narrow ? 12 : 24, rows = 4;
    const probabilities = narrow ? [0.15, 0.45, 1, 1] : [0.12, 0.4, 1, 1];
    const accentCount = narrow ? 3 : 6;
    wrapper.style.setProperty('--px-cols', String(cols));
    wrapper.style.setProperty('--px-rows', String(rows));
    // The seam between strip and footer takes the footer colour, so no light line shows at the join.
    wrapper.style.backgroundColor = wrapper.getAttribute('data-px-to') === '.ftr' ? to : from;
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    wrapper.style.gridTemplateRows = `repeat(${rows},1fr)`;
    const cells: HTMLElement[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const d = document.createElement('div');
      d.className = 'px-cell';
      d.style.backgroundColor = from;
      wrapper.appendChild(d);
      cells.push(d);
    }
    const targets: { el: HTMLElement; color: string }[] = [];
    const accentCandidates: { el: HTMLElement; color: string }[] = [];
    cells.forEach((cell, k) => {
      const row = Math.floor(k / cols);
      if (Math.random() < probabilities[row]) {
        const d = { el: cell, color: to };
        targets.push(d);
        if (row < rows - 2) accentCandidates.push(d);
      }
    });
    const accents = [accent, '#1453C7'];
    g.utils.shuffle(accentCandidates).slice(0, accentCount).forEach((d: any, k: number) => { d.color = accents[k % 2]; });
    g.to(targets.map((d) => d.el), {
      backgroundColor: (i: number) => targets[i].color, duration: 0.05, ease: 'none',
      stagger: { each: 0.003, from: 'random' },
      scrollTrigger: { trigger: wrapper, scroller, start: 'top bottom', end: 'top 20%', scrub: true },
    });
  }

  /* ---------- Page change: a grid of coloured squares covers the screen, the new page is loaded
     under it and the squares clear. Only with GSAP and without reduced motion. ---------- */
  const PX_PALETTE = ['#0B0F17', '#0B0F17', '#0B0F17', '#101828', '#101828', '#1453C7', '#4BB7E8', '#000000', '#F5F7FA'];
  const pixelOverlay = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const size = Math.ceil(vw / (vw < 768 ? 6 : 14));
    const cols = Math.ceil(vw / size), rows = Math.ceil(vh / size);
    const ov = document.createElement('div');
    ov.className = 'px-overlay';
    ov.setAttribute('aria-hidden', 'true');
    ov.style.cssText = `position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;display:grid;grid-template-columns:repeat(${cols},${size}px);grid-template-rows:repeat(${rows},${size}px)`;
    const cells: HTMLElement[] = [];
    for (let i = 0; i < cols * rows; i++) {
      const c = document.createElement('div');
      c.style.margin = '0 -1px -1px 0';
      c.style.backgroundColor = PX_PALETTE[Math.floor(Math.random() * PX_PALETTE.length)];
      ov.appendChild(c);
      cells.push(c);
    }
    document.body.appendChild(ov);
    return { ov, cells };
  };
  // Leaving: a click on an internal link covers the page, then the browser follows the link.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
    const g0 = gsapLib();
    if (!g0 || reduced()) return;
    e.preventDefault();
    store.set(PIXEL_KEY, '1');
    const { cells } = pixelOverlay();
    g0.set(cells, { scale: 0 });
    g0.timeline({ onComplete: () => { window.location.href = url.href; } })
      .to(cells, { scale: 1, duration: 0.2, ease: 'power2.out', stagger: { each: 0.0025, from: 'random' } });
  });
  // Arriving: if the previous page started a transition, the squares start covered and clear.
  const arriving = store.get(PIXEL_KEY);
  store.del(PIXEL_KEY);
  const gEnter = gsapLib();
  if (arriving && gEnter && !reduced()) {
    const { ov, cells } = pixelOverlay();
    gEnter.set(cells, { scale: 1 });
    gEnter.to(cells, { scale: 0, duration: 0.26, ease: 'power2.in', stagger: { each: 0.003, from: 'random' },
      onComplete: () => ov.remove() });
  }

  /* ---------- Initial paint ---------- */
  updateTop();
  placeSeg();
  sizeSheet();
  if (page === 'shop') { /* filter starts on "all" */ }
  if (page === 'product') {
    // Product-page photo count and caption are rendered for the first photo; nothing else to sync.
  }
}
