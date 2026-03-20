/* ══════════════════════════════════════════
   assets/js/main.js
   탭 전환 · 햄버거 · 헤더 스크롤 · 초기화
══════════════════════════════════════════ */

import { initSlider }               from './slider.js';
import { initCounters }             from './counter.js';
import { observeFadeUps, initTilt } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {

  const header    = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');
  const curtain   = document.getElementById('pageCurtain');
  const pages     = document.querySelectorAll('.page');

  let currentTab = 'home';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ════════════════════════════════════════
     탭 전환 (커튼 방식 — 깜빡임 방지)
  ════════════════════════════════════════ */
  function showTab(tabId, subId = null) {

    // 같은 탭 클릭 시 부드럽게 맨 위로
    if (tabId === currentTab && !subId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.getElementById('page-' + tabId);
    if (!target) return;

    // 커튼 올리기
    curtain.classList.add('show');

    // 커튼이 완전히 덮인 후 페이지 전환
    const onCovered = () => {
      curtain.removeEventListener('transitionend', onCovered);

      window.scrollTo(0, 0);

      pages.forEach(p => p.classList.remove('active'));
      target.classList.add('active');
      currentTab = tabId;

      document.querySelectorAll('.nav__link').forEach(link =>
        link.classList.toggle('active', link.dataset.tab === tabId)
      );

      nav.classList.remove('open');
      hamburger.classList.remove('open');

      requestAnimationFrame(() => {
        curtain.classList.remove('show');
        observeFadeUps();
        if (tabId === 'home') initCounters();
      });
    };

    curtain.addEventListener('transitionend', onCovered);

    if (subId) {
      const sub = document.getElementById('sub-' + subId);
      if (sub) setTimeout(() => sub.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }

  window.showTab = showTab;

  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      e.target.blur();
      showTab(el.dataset.tab, el.dataset.sub || null);
    });
  });

  /* ════════════════════════════════════════
     헤더 스크롤 그림자
  ════════════════════════════════════════ */
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ════════════════════════════════════════
     모바일 햄버거 메뉴
  ════════════════════════════════════════ */
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

  /* ════════════════════════════════════════
     BUSINESS 서브 네비게이션
  ════════════════════════════════════════ */
  function initSubNav() {
    const subBtns     = document.querySelectorAll('.sub-nav__btn');
    const subSections = document.querySelectorAll('[id^="sub-"]');
    if (!subBtns.length) return;

    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sec = document.getElementById('sub-' + btn.dataset.sub);
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('sub-', '');
          subBtns.forEach(b => b.classList.toggle('active', b.dataset.sub === id));
        }
      });
    }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' });

    subSections.forEach(s => io.observe(s));
  }

  initSubNav();

  /* ════════════════════════════════════════
     초기화
  ════════════════════════════════════════ */
  initSlider();
  initCounters();
  observeFadeUps();
  initTilt();

  const hash = window.location.hash.replace('#', '');
  const validTabs = ['home', 'product', 'business', 'contact', 'privacy', 'antiemail'];
  showTab(validTabs.includes(hash) ? hash : 'home');

});
