/* ══════════════════════════════════════════
   assets/js/main.js
   탭 전환 · 햄버거 · 헤더 스크롤 · 초기화
══════════════════════════════════════════ */

import { initSlider }      from './slider.js';
import { initCounters }    from './counter.js';
import { observeFadeUps, initTilt } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {

  const header    = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');
  const pages     = document.querySelectorAll('.page');

  /* ── 탭 전환 ─────────────────────────── */
  function showTab(tabId, subId = null) {
    pages.forEach(p => p.classList.remove('active'));

    const target = document.getElementById('page-' + tabId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav__link').forEach(link =>
      link.classList.toggle('active', link.dataset.tab === tabId)
    );

    nav.classList.remove('open');
    hamburger.classList.remove('open');

    if (subId) {
      const sub = document.getElementById('sub-' + subId);
      if (sub) setTimeout(() => sub.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 탭 전환 후 새 페이지 fade-up 요소 관찰
    observeFadeUps();
  }

  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showTab(el.dataset.tab, el.dataset.sub || null);
    });
  });

  /* ── 헤더 스크롤 그림자 ──────────────── */
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── 모바일 햄버거 ───────────────────── */
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    nav.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!header.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });

  /* ── 초기화 ──────────────────────────── */
  initSlider();
  initCounters();
  observeFadeUps();
  initTilt();

  // URL 해시로 초기 탭 결정
  const hash = window.location.hash.replace('#', '');
  if (['home', 'product', 'business', 'contact'].includes(hash)) {
    showTab(hash);
  } else {
    showTab('home');
  }

});
