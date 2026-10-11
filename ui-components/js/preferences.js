// Sidebar Accordion Toggle Handler
window.toggleSidebarAccordion = function(headerEl) {
  const accordion = headerEl.closest('.sidebar-accordion');
  if (!accordion) return;
  accordion.classList.toggle('collapsed');
  const arrow = headerEl.querySelector('.accordion-arrow');
  if (arrow) {
    arrow.textContent = accordion.classList.contains('collapsed') ? '▼' : '▲';
  }
};

// Global Font Family Change Handler
window.changeFontFamily = function(fontFamily, showToastMsg = false) {
  document.body.style.fontFamily = fontFamily;
  document.documentElement.style.setProperty('--font-sans', fontFamily);
  localStorage.setItem('ui_canvas_font', fontFamily);

  // Sync Select UI Dropdown
  const selectEl = document.getElementById('font-family-select');
  if (selectEl) selectEl.value = fontFamily;

  if (showToastMsg && window.showToast) {
    const fontName = fontFamily.split(',')[0].replace(/'/g, '').trim();
    window.showToast(`폰트 변경 완료: ${fontName}`);
  }
};

// Global Min Font Size Change Handler (Slider Supported, Default: 12px)
window.changeMinFontSize = function(fontSize, showToastMsg = false) {
  document.documentElement.style.setProperty('--min-font-size', fontSize);
  localStorage.setItem('ui_canvas_min_size', fontSize);

  // Sync Slider UI and Display Value Text
  const numericVal = parseInt(fontSize, 10) || 12;
  const sliderEl = document.getElementById('min-font-size-slider');
  const valueDisplayEl = document.getElementById('min-font-size-value');

  if (sliderEl) sliderEl.value = numericVal;
  if (valueDisplayEl) valueDisplayEl.textContent = `${numericVal}px`;

  if (showToastMsg && window.showToast) {
    window.showToast(`최소 글자 크기 변경 완료: ${numericVal}px`);
  }
};

// Initialize Font (Noto Sans KR Default + Saved Font) & Min Font Size (12px Default)
document.addEventListener('DOMContentLoaded', function() {
  // Load saved font or default to Noto Sans KR
  const savedFont = localStorage.getItem('ui_canvas_font') || "'Noto Sans KR', sans-serif";
  changeFontFamily(savedFont, false);

  // Load saved min font size or default to 12px
  const savedMinSize = localStorage.getItem('ui_canvas_min_size') || '12px';
  changeMinFontSize(savedMinSize, false);
});
