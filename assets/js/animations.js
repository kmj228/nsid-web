/* ══════════════════════════════════════════
   assets/js/animations.js
   스크롤 fade-up · 제품 카드 3D 틸트
══════════════════════════════════════════ */

/** 스크롤 진입 시 .fade-up 요소에 .visible 클래스 추가 */
let fadeIO = null;

export function observeFadeUps() {
  // 기존 observer 해제 (탭 전환 시 재사용)
  if (fadeIO) fadeIO.disconnect();

  fadeIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeIO.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.fade-up:not(.visible)')
          .forEach(el => fadeIO.observe(el));
}

/** 제품 카드 마우스 3D 틸트 효과 */
export function initTilt() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform =
        `translateY(-6px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
