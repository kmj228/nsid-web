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
    if (subIO) subIO.disconnect();

    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + tabId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav__link').forEach(link =>
      link.classList.toggle('active', link.dataset.tab === tabId)
    );

    nav.classList.remove('open');
    hamburger.classList.remove('open');

    // 브라우저가 새 페이지 렌더링한 직후에 스크롤
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    if (subId) {
      const sub = document.getElementById('sub-' + subId);
      if (sub) setTimeout(() => sub.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    setTimeout(() => {
      observeFadeUps();
      if (tabId === 'business' && subIO) {
        const sections = document.querySelectorAll('[id^="sub-"]');
        sections.forEach(s => subIO.observe(s));
      }
    }, 200);
  }

  // 전역 노출 (footer onclick에서 사용)
  window.showTab = showTab;

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

  /* ── BUSINESS 서브 네비 ─────────────── */
  let subIO = null;

  function initSubNav() {
    const subBtns = document.querySelectorAll('.sub-nav__btn');
    if (!subBtns.length) return;

    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById('sub-' + btn.dataset.sub);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // 스크롤 시 서브네비 active 자동 갱신
    const sections = document.querySelectorAll('[id^="sub-"]');

    subIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('sub-', '');
          subBtns.forEach(b => b.classList.toggle('active', b.dataset.sub === id));
        }
      });
    }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(s => subIO.observe(s));
  }

  initSubNav();

  /* ── 초기화 ──────────────────────────── */
  initSlider();
  initCounters();
  observeFadeUps();
  initTilt();

  // URL 해시로 초기 탭 결정
  const hash = window.location.hash.replace('#', '');
  if (['home', 'product', 'business', 'contact', 'privacy', 'antiemail'].includes(hash)) {
    showTab(hash);
  } else {
    showTab('home');
  }

});
