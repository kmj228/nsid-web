/* ══════════════════════════════════════════
   assets/js/main.js
   탭 전환 (모든 페이지 DOM에 내장) · 햄버거 · 헤더
   + 페이지 진행 바 · Back to Top
   ※ fetch() 제거 — 단일 파일 구조 대응
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const header       = document.getElementById('header');
  const hamburger    = document.getElementById('hamburger');
  const nav          = document.getElementById('nav');
  const progressBar  = document.getElementById('pageProgressBar');
  const backToTopEl  = document.getElementById('backToTop');
  const scrollRingEl = document.getElementById('scrollRing');
  const CIRCUMFERENCE = 2 * Math.PI * 19;

  let currentTab = null;

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
     탭 전환 — DOM에 미리 삽입된 .page 전환
  ════════════════════════════════════════ */
  function showTab(tabId, subId) {
    if (tabId === currentTab && !subId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    runProgress(() => {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const page = document.getElementById('page-' + tabId);
      if (page) page.classList.add('active');

      currentTab = tabId;
      window.scrollTo(0, 0);

      document.querySelectorAll('.nav__link').forEach(link =>
        link.classList.toggle('active', link.dataset.tab === tabId)
      );
      nav.classList.remove('open');
      hamburger.classList.remove('open');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          observeFadeUps();
          if (tabId === 'home') {
            initSlider();
            initCounters();
            initTilt();
          }
          if (tabId === 'business') initSubNav();
          if (tabId === 'company') initSubNav();
          if (tabId === 'product') initProductNav();
          if (tabId === 'contact') initContact();
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

  /* ── data-tab 링크 바인딩 ── */
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
  showTab('home');

});

// initProductNav — 버튼 클릭 시 패널 전환만, 스크롤 없음
function initProductNav() {
  const btns   = document.querySelectorAll('.sub-nav__btn[data-prod]');
  const panels = document.querySelectorAll('.prod-panel');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      _switchProduct(btn.dataset.prod, btns, panels);
    });
  });

  // 첫 패널 fade-up 즉시 실행
  const firstPanel = document.querySelector('.prod-panel.active');
  if (firstPanel) {
    firstPanel.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }
}

// 외부에서도 호출 가능 — 홈 제품 카드 클릭 시 사용
function _switchProduct(prodId, btns, panels) {
  btns   = btns   || document.querySelectorAll('.sub-nav__btn[data-prod]');
  panels = panels || document.querySelectorAll('.prod-panel');

  btns.forEach(b => b.classList.toggle('active', b.dataset.prod === prodId));
  panels.forEach(p => p.classList.remove('active'));

  const panel = document.getElementById(prodId);
  if (panel) {
    panel.classList.add('active');
    panel.querySelectorAll('.fade-up').forEach(el => {
      el.classList.remove('visible');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    });
  }

  // 패널 전환 시 맨 위로
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 홈 → 특정 제품 탭으로 이동
function goToProduct(prodId) {
  window.showTab('product');
  // showTab의 탭 전환 + initProductNav 완료 후 패널 전환
  setTimeout(() => _switchProduct(prodId), 50);
}
