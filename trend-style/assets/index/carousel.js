export function mountCarousel(carousel) {
  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const dots = [...carousel.querySelectorAll("[data-slide-to]")];
  const play = carousel.querySelector(".carousel-play");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0,
    timer,
    paused = reduced.matches,
    visible = true;

  function schedule() {
    clearTimeout(timer);
    if (
      paused ||
      reduced.matches ||
      !visible ||
      document.hidden ||
      carousel.matches(":hover, :focus-within")
    )
      return;
    timer = setTimeout(() => select((current + 1) % slides.length), 5000);
  }
  function select(index) {
    current = index;
    slides.forEach((slide, i) => {
      slide.hidden = i !== index;
    });
    dots.forEach((dot, i) =>
      dot.setAttribute("aria-pressed", String(i === index)),
    );
    schedule();
  }
  function updatePlay() {
    play.setAttribute("aria-pressed", String(paused));
    play.setAttribute(
      "aria-label",
      paused ? "Play slideshow" : "Pause slideshow",
    );
    play.textContent = paused ? "▷" : "Ⅱ";
  }
  dots.forEach((dot, i) => dot.addEventListener("click", () => select(i)));
  play.addEventListener("click", () => {
    paused = !paused;
    updatePlay();
    schedule();
  });
  carousel.addEventListener("mouseenter", schedule);
  carousel.addEventListener("mouseleave", schedule);
  carousel.addEventListener("focusin", (event) => {
    if (event.target === play) return;
    paused = true;
    updatePlay();
    schedule();
  });
  document.addEventListener("visibilitychange", schedule);
  reduced.addEventListener("change", () => {
    paused = reduced.matches;
    updatePlay();
    schedule();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(carousel);
  updatePlay();
  schedule();
}
