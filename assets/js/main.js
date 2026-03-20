/* ══════════════════════════════════════════
   assets/js/main.js
   탭 전환 (fetch lazy load) · 햄버거 · 헤더 · 초기화
   + 페이지 진행 바 · Back to Top
══════════════════════════════════════════ */

import { initSlider }               from './slider.js';
import { initCounters }             from './counter.js';
import { observeFadeUps, initTilt } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {

  const header      = document.getElementById('header');
  const hamburger   = document.getElementById('hamburger');
  const nav         = document.getElementById('nav');
  const mainEl      = document.getElementById('mainContent');
  const progressBar = document.getElementById('pageProgressBar');

  let currentTab = null;
  const pageCache = {};       // 로드된 페이지 HTML 캐시

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ════════════════════════════════════════
     페이지 전환 진행 바
  ════════════════════════════════════════ */
  function runProgress(callback) {
    if (!progressBar) { callback(); return; }
    progressBar.style.transition = 'none';
    progressBar.style.width      = '0%';
    progressBar.style.opacity    = '1';

    requestAnimationFrame(() => {
      progressBar.style.transition = 'width 0.15s ease';
      progressBar.style.width = '40%';
      setTimeout(() => {
        progressBar.style.width = '75%';
        setTimeout(() => {
          callback();
          progressBar.style.width = '100%';
          setTimeout(() => {
            progressBar.style.opacity = '0';
            setTimeout(() => {
              progressBar.style.transition = 'none';
              progressBar.style.width = '0%';
            }, 300);
          }, 120);
        }, 100);
      }, 100);
    });
  }

  /* ════════════════════════════════════════
     페이지 fetch + 캐시
  ════════════════════════════════════════ */
  async function loadPage(tabId) {
    if (pageCache[tabId]) return pageCache[tabId];
    try {
      const res = await fetch(`pages/${tabId}.html`);
      if (!res.ok) throw new Error(`${tabId} not found`);
      const html = await res.text();
      pageCache[tabId] = html;
      return html;
    } catch (e) {
      console.warn('Page load failed:', e);
      return `<section class="page" id="page-${tabId}"><div class="empty-page"><h2 class="empty-page__title">${tabId.toUpperCase()}</h2></div></section>`;
    }
  }

  /* ════════════════════════════════════════
     탭 전환
  ════════════════════════════════════════ */
  async function showTab(tabId, subId = null) {

    if (tabId === currentTab && !subId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    runProgress(async () => {
      const html = await loadPage(tabId);

      window.scrollTo(0, 0);
      mainEl.innerHTML = html;
      currentTab = tabId;

      document.querySelectorAll('.nav__link').forEach(link =>
        link.classList.toggle('active', link.dataset.tab === tabId)
      );
      nav.classList.remove('open');
      hamburger.classList.remove('open');

      // data-tab 링크 재바인딩 (새로 삽입된 DOM)
      bindTabLinks();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          observeFadeUps();
          if (tabId === 'home') {
            initSlider();
            initCounters();
            initTilt();
          }
          if (tabId === 'business') initSubNav();
          if (tabId === 'contact' && typeof initContact === 'function') initContact();
          updateBackToTop();
        });
      });

      if (subId) {
        setTimeout(() => {
          const sub = document.getElementById('sub-' + subId);
          if (sub) sub.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    });
  }

  window.showTab = showTab;

  function bindTabLinks() {
    document.querySelectorAll('[data-tab]').forEach(el => {
      if (el.dataset.bound) return;
      el.dataset.bound = '1';
      el.addEventListener('click', e => {
        e.preventDefault();
        e.target.blur();
        showTab(el.dataset.tab, el.dataset.sub || null);
      });
    });
  }

  // 헤더/푸터의 data-tab 링크 (최초 1회)
  bindTabLinks();

  /* ════════════════════════════════════════
     헤더 스크롤 그림자
  ════════════════════════════════════════ */
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ════════════════════════════════════════
     Back to Top + 스크롤 링
  ════════════════════════════════════════ */
  const backToTopEl  = document.getElementById('backToTop');
  const scrollRingEl = document.getElementById('scrollRing');
  const CIRCUMFERENCE = 2 * Math.PI * 19;

  function updateBackToTop() {
    if (!backToTopEl) return;
    const scrollY   = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    backToTopEl.classList.toggle('visible', scrollY > 300);
    if (scrollRingEl) scrollRingEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  }
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTopEl?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ════════════════════════════════════════
     모바일 햄버거
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
     BUSINESS 서브 네비
  ════════════════════════════════════════ */
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

    const sections = document.querySelectorAll('[id^="sub-"]');
    const subIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('sub-', '');
          subBtns.forEach(b => b.classList.toggle('active', b.dataset.sub === id));
        }
      });
    }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(s => subIO.observe(s));
  }

  /* ════════════════════════════════════════
     초기화
  ════════════════════════════════════════ */
  updateBackToTop();

  const hash = window.location.hash.replace('#', '');
  const validTabs = ['home', 'product', 'business', 'contact', 'privacy', 'antiemail'];
  showTab(validTabs.includes(hash) ? hash : 'home');

});
