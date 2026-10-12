/**
 * Design Home - i18n (Internationalization) Engine
 */
(function () {
  const dictionary = {
    ko: {
      nav_home: "홈",
      nav_trends: "트렌드 스타일",
      nav_components: "UI 컴포넌트",
      nav_github: "GitHub 저장소",
      
      hero_badge: "디자인 시스템 & UX 아키텍처 허브",
      hero_title: "모던 웹 인터페이스 & <br /><span>디자인 트렌드 아키텍처</span>",
      hero_subtitle: "스큐어모피즘부터 글래스모피즘, 인터랙티브 캔버스 컴포넌트까지.<br />최신 웹 UI/UX 모듈 아키텍처와 트렌드 디자인을 한곳에서 탐색하세요.",
      hero_btn_primary: "15가지 트렌드 탐색",
      hero_btn_secondary: "컴포넌트 캔버스",

      card1_tag: "컬렉션",
      card1_title: "15가지 디자인 트렌드",
      card1_desc: "스큐어모피즘, 글래스모피즘, 네오브루탈리즘, 키네틱 타이포그래피 등 15가지 핵심 디자인 트렌드 라이브 데모.",
      card1_action: "15가지 스타일 둘러보기",

      card2_tag: "인터랙티브 라이브러리",
      card2_title: "UI 컴포넌트 캔버스",
      card2_desc: "피그마(Figma) 캔버스 인터페이스 스타일의 인터랙티브 버튼, 토글, 모달, 네비게이션 컴포넌트 플레이그라운드.",
      card2_action: "컴포넌트 캔버스 실행",

      card3_tag: "디자인 라이브러리",
      card3_title: "Design Library",
      card3_desc: "용도와 태그로 디자인을 찾고, 실제 동작과 구현 설명을 확인하세요.",
      card3_action: "Design Library 열기",

      stat1_label: "UI 디자인 트렌드",
      stat2_label: "재사용 컴포넌트",
      stat3_label: "순수 HTML/CSS/JS",
      stat4_label: "초고속 렌더링 타임",

      footer_text: "© 2026 Design Home. 높은 시각적 완성도와 WCAG 2.2 웹 접근성을 준수하여 제작되었습니다.",

      trend_header_title: "15가지 모던 디자인 트렌드",
      trend_header_subtitle: "스큐어모피즘부터 키네틱 타이포그래피까지 UI 디자인 트렌드의 정수를 라이브 데모로 탐색하세요.",
      trend_card_explore: "스타일 탐색"
    },
    en: {
      nav_home: "Home",
      nav_trends: "Trend Styles",
      nav_components: "UI Components",
      nav_github: "GitHub Repository",

      hero_badge: "Design System & UX Architecture Hub",
      hero_title: "Crafting Modern Web <br /><span>Interfaces & Trends</span>",
      hero_subtitle: "Explore 15 curated UI design trends, interactive component canvas systems, and modular CSS architecture guidelines built for high visual excellence.",
      hero_btn_primary: "Explore 15 Trends",
      hero_btn_secondary: "Component Canvas",

      card1_tag: "Collection",
      card1_title: "15 Design Trends",
      card1_desc: "Live demos of 15 key design trends including Skeuomorphism, Glassmorphism, Neo-Brutalism, and Kinetic Typography.",
      card1_action: "Explore 15 Styles",

      card2_tag: "Interactive Library",
      card2_title: "UI Components Canvas",
      card2_desc: "Interactive playground featuring buttons, toggles, modals, and navigation components in a Figma-canvas layout.",
      card2_action: "Launch Component Canvas",

      card3_tag: "Design Library",
      card3_title: "Design Library",
      card3_desc: "Find designs by purpose and tags, then explore working previews and implementation guidance.",
      card3_action: "Open Design Library",

      stat1_label: "UI Design Trends",
      stat2_label: "Reusable Components",
      stat3_label: "Pure HTML/CSS/JS",
      stat4_label: "Sub-millisecond Render",

      footer_text: "© 2026 Design Home. Built for GitHub Pages with High Visual Excellence & WCAG 2.2 Compliance.",

      trend_header_title: "15 Modern Design Trends",
      trend_header_subtitle: "Explore live interactive demonstrations of 15 iconic UI design trends from Skeuomorphism to Kinetic Typography.",
      trend_card_explore: "Explore Style"
    }
  };

  // Get current language preference (Default: 'ko')
  let currentLang = localStorage.getItem('dh_lang') || 'ko';

  function applyLanguage(lang) {
    if (!Object.hasOwn(dictionary, lang)) return;
    currentLang = lang;
    localStorage.setItem('dh_lang', lang);
    document.documentElement.lang = lang;

    // Update text content for elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dictionary[lang] && dictionary[lang][key]) {
        el.innerHTML = dictionary[lang][key];
      }
    });

    // Update active state on language toggle button
    const btnKo = document.getElementById('dh-lang-ko');
    const btnEn = document.getElementById('dh-lang-en');
    if (btnKo && btnEn) {
      if (lang === 'ko') {
        btnKo.classList.add('active');
        btnEn.classList.remove('active');
        btnKo.setAttribute('aria-current', 'true');
        btnEn.removeAttribute('aria-current');
      } else {
        btnEn.classList.add('active');
        btnKo.classList.remove('active');
        btnEn.setAttribute('aria-current', 'true');
        btnKo.removeAttribute('aria-current');
      }
    }
  }

  window.setLanguage = applyLanguage;
  document.addEventListener('dh:navigation-ready', () => applyLanguage(currentLang));

  document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
  });
})();
