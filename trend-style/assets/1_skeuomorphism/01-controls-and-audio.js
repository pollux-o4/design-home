// Web Audio API Mechanical Sound Synthesizer
class SkeuoAudio {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  playClick() {
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch(e) {}
  }
  playSwitch() {
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch(e) {}
  }
}
const skeuoAudio = new SkeuoAudio();

// 1. Theme Switcher Logic
const themeSelect = document.getElementById('themeSelect');
themeSelect.addEventListener('change', (e) => {
  skeuoAudio.playSwitch();
  document.body.setAttribute('data-theme', e.target.value);
});

// 2. Accordion Sidebar Logic
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    skeuoAudio.playClick();
    const item = header.parentElement;
    item.classList.toggle('active');
  });
});

// 3. Metallic Toggle Switch Logic
const liveSyncToggle = document.getElementById('liveSyncToggle');
liveSyncToggle.addEventListener('click', () => {
  skeuoAudio.playSwitch();
  liveSyncToggle.classList.toggle('active');
});

// 4. Analog VU Meter Needle Animation
const vuNeedle = document.getElementById('vuNeedle');
const cpuLoadText = document.getElementById('cpuLoadText');
setInterval(() => {
  if (liveSyncToggle.classList.contains('active')) {
    const randomLoad = Math.floor(30 + Math.random() * 35);
    cpuLoadText.textContent = randomLoad + '%';
    const angle = -45 + (randomLoad / 100) * 90;
    vuNeedle.style.transform = `rotate(${angle}deg)`;
  }
}, 2000);
