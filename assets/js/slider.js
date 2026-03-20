/* ══════════════════════════════════════════
   assets/js/slider.js
   히어로 슬라이더
══════════════════════════════════════════ */

function initSlider() {
  const slides  = document.querySelectorAll('.hero__slide');
  const dots    = document.querySelectorAll('.hero__dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  if (!slides.length) return;

  let current = 0;
  let timer   = null;

  function goSlide(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    timer = setInterval(() => goSlide(current + 1), 5500);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  startAuto();

  prevBtn?.addEventListener('click', () => { goSlide(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goSlide(current + 1); resetAuto(); });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goSlide(i); resetAuto(); });
  });
}
