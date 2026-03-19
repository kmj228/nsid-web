/* ══════════════════════════════════════════
   assets/js/counter.js
   숫자 카운터 애니메이션
══════════════════════════════════════════ */

/**
 * easeOutSine 커브로 숫자 카운팅
 * — easeOutCubic과 달리 마지막에 급격히 느려지지 않아 끊김 없음
 * @param {HTMLElement} el        - .stats__number 요소
 * @param {number}      target    - 목표 숫자
 * @param {number}      duration  - 애니메이션 시간(ms)
 */
function animateCounter(el, target, duration = 1600) {
  const startTime = performance.now();

  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // easeOutSine: sin 곡선 — 끝까지 부드럽게 감속, 마지막 점프 없음
    const eased = Math.sin((progress * Math.PI) / 2);

    // Math.round 사용 — 작은 숫자(8, 10)에서 마지막 프레임 점프 방지
    el.textContent = Math.round(eased * target);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target; // 정확한 최종값 보장
    }
  }

  requestAnimationFrame(update);
}

export function initCounters() {
  const counterEls = document.querySelectorAll('.stats__number');
  if (!counterEls.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, parseInt(entry.target.dataset.target));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counterEls.forEach(el => {
    // 새로고침 시 이미 뷰포트 안에 있는 경우 즉시 실행
    const rect   = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      setTimeout(() => animateCounter(el, parseInt(el.dataset.target)), 300);
    } else {
      io.observe(el);
    }
  });
}
