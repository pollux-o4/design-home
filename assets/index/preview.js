const image = document.querySelector('#stage-image');
const buttons = [...document.querySelectorAll('[data-style]')];
const preloads = new Map(buttons.map(button => {
  const preload = new Image();
  preload.src = `./design-library/previews/${button.dataset.style}.png`;
  return [button.dataset.style, preload];
}));
let request = 0;

function labelPreview(button) {
  image.alt = `${button.textContent.trim()} — ${button.dataset.title}`;
}

for (const button of buttons) {
  button.addEventListener('click', async () => {
    const version = ++request;
    const preload = preloads.get(button.dataset.style);
    image.style.opacity = '.4';
    try {
      await preload.decode();
    } catch {
      if (version === request) image.style.opacity = '1';
      return;
    }
    // Commit the visible selection atomically; stale success/failure cannot overwrite it.
    if (version !== request) return;
    for (const option of buttons) option.setAttribute('aria-pressed', String(option === button));
    image.src = preload.src;
    labelPreview(button);
    document.querySelector('#stage-label').textContent = button.dataset.title;
    document.querySelector('#stage-link').href = `./design-library/#/trends/${button.dataset.style}`;
    image.style.opacity = '1';
  });
}
document.addEventListener('dh:language-change', () => {
  labelPreview(buttons.find(button => button.getAttribute('aria-pressed') === 'true'));
});

const initial = buttons.find(button => button.getAttribute('aria-pressed') === 'true');
document.querySelector('#stage-label').textContent = initial.dataset.title;
labelPreview(initial);
