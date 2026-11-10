const frames = {
  trends: ["trends", "glassmorphism", "claymorphism"],
  patterns: ["patterns", "modal", "toggle"],
  glossary: ["glossary", "glossary-ux", "glossary-motion"],
  tools: ["tools", "tools-kits", "tools-motion"],
};

export function previewSlides(entry) {
  // shortcut: 실제 화면의 정적 스냅샷 사용, 목적지의 주요 화면이 바뀌면 previews 이미지를 함께 갱신.
  const screen = document.createElement("span");
  screen.className = "preview-screen";
  screen.hidden = true;
  screen.setAttribute("aria-hidden", "true");
  const stage = document.createElement("span");
  stage.className = "preview-slides";
  const footer = document.createElement("span");
  footer.className = "preview-footer";
  const indicators = document.createElement("span");
  indicators.className = "preview-dots";
  const caption = document.createElement("span");
  caption.className = "preview-screen-caption";
  footer.append(indicators, caption);
  screen.append(stage, footer);
  const dots = [],
    images = frames[entry.dataset.preview].map(() => {
      const image = document.createElement("img");
      image.alt = "";
      image.decoding = "async";
      image.className = "preview-slide";
      stage.append(image);
      const dot = document.createElement("span");
      indicators.append(dot);
      dots.push(dot);
      return image;
    });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const loads = [];
  let active = false,
    autoplay = false,
    current = 0,
    timer,
    generation = 0,
    firstTransition = true;
  function select(index) {
    current = index;
    screen.dataset.slide = String(index);
    images.forEach((image, i) => image.classList.toggle("is-current", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-current", i === index));
  }
  function load(index) {
    return (loads[index] ??= new Promise((resolve) => {
      images[index].addEventListener(
        "load",
        async () => {
          try {
            await images[index].decode();
            resolve(true);
          } catch {
            resolve(false);
          }
        },
        { once: true },
      );
      images[index].addEventListener("error", () => resolve(false), { once: true });
      images[index].src = new URL(
        `./previews/${frames[entry.dataset.preview][index]}.png`,
        import.meta.url,
      ).href;
    }));
  }
  function cancel() {
    clearTimeout(timer);
    generation++;
  }
  function schedule() {
    if (!active || !autoplay || reduced.matches) return;
    const version = generation;
    timer = setTimeout(
      async () => {
        for (let offset = 1; offset < images.length; offset++) {
          const next = (current + offset) % images.length;
          const ready = await load(next);
          if (!active || version !== generation) return;
          if (ready) {
            select(next);
            firstTransition = false;
            break;
          }
        }
        schedule();
      },
      firstTransition ? 900 : 2600,
    );
  }
  select(0);
  reduced.addEventListener("change", () => {
    cancel();
    schedule();
  });
  return {
    screen,
    show(show, rotate) {
      if (active === show && autoplay === rotate) return;
      cancel();
      active = show;
      autoplay = rotate;
      if (!show) {
        firstTransition = true;
        select(0);
        return;
      }
      const version = generation;
      load(0).then((ready) => {
        if (!ready) return;
        entry.classList.add("is-preview-ready");
        if (active && version === generation) {
          schedule();
        }
      });
    },
  };
}
