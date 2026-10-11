(function(window) {
  // Carousel Slider Data & Handler
  let currentCarouselIdx = 0;
  const carouselSlides = [
    { badge: 'NEW 1/3', title: 'V2.5 업데이트 출시', desc: '더욱 빨라진 피그마 캔버스 시스템을 경험해보세요.', bg: 'linear-gradient(135deg, #4f46e5, #9333ea)' },
    { badge: 'HOT 2/3', title: '신규 UI 컴포넌트 팩', desc: '인터랙티브 모달 및 드롭다운 컨트롤이 추가되었습니다.', bg: 'linear-gradient(135deg, #059669, #0d99ff)' },
    { badge: 'GUIDE 3/3', title: '디자인 시스템 가이드', desc: '브랜드 가이드라인에 맞춘 토큰 설정을 확인하세요.', bg: 'linear-gradient(135deg, #ea580c, #e11d48)' }
  ];

  window.stepCarousel = function(direction) {
    currentCarouselIdx = (currentCarouselIdx + direction + carouselSlides.length) % carouselSlides.length;
    const slide = carouselSlides[currentCarouselIdx];

    const box = document.getElementById('carousel-slide-box');
    const badge = document.getElementById('carousel-badge');
    const title = document.getElementById('carousel-title');
    const desc = document.getElementById('carousel-desc');
    const dotsContainer = document.getElementById('carousel-dots');

    if (box) box.style.background = slide.bg;
    if (badge) badge.textContent = slide.badge;
    if (title) title.textContent = slide.title;
    if (desc) desc.textContent = slide.desc;

    if (dotsContainer) {
      dotsContainer.querySelectorAll('span').forEach((dot, idx) => {
        dot.style.background = idx === currentCarouselIdx ? '#6366f1' : 'rgba(255,255,255,0.2)';
      });
    }

    if (window.showToast) {
      window.showToast(`[캐러셀] 슬라이드 #${currentCarouselIdx + 1} 전환`);
    }
  };

  // Pagination Handler
  let currentDemoPage = 1;
  window.switchPage = function(target, btnEl) {
    if (target === 'prev') {
      currentDemoPage = Math.max(1, currentDemoPage - 1);
    } else if (target === 'next') {
      currentDemoPage = Math.min(3, currentDemoPage + 1);
    } else {
      currentDemoPage = target;
    }

    const container = document.querySelector('.ui-pagination-demo');
    if (container) {
      const numBtns = container.querySelectorAll('.page-num-btn');
      numBtns.forEach((b, idx) => {
        if (idx + 1 === currentDemoPage) {
          b.className = 'page-num-btn ui-btn ui-btn-primary';
        } else {
          b.className = 'page-num-btn ui-btn ui-btn-secondary';
        }
      });
    }

    if (window.showToast) {
      window.showToast(`[페이지네이션] ${currentDemoPage} 페이지 선택`);
    }
  };

})(window);
