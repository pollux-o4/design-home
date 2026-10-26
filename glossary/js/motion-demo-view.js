const reference =
  "https://developer.mozilla.org/en-US/docs/Web/API/Element/animate";
const objects = {
  fanout: () =>
    Array.from(
      { length: 5 },
      (_, index) =>
        `<span class="motion-object object-${index}">${index ? "" : "+"}</span>`,
    ).join(""),
  radial: () =>
    Array.from(
      { length: 5 },
      (_, index) =>
        `<span class="motion-object object-${index}">${index ? "" : "+"}</span>`,
    ).join(""),
  gooey: () =>
    '<span class="motion-object object-0"></span><span class="motion-object object-1"></span>',
  accordion: () =>
    '<span class="motion-object"></span><span class="motion-object"></span><span class="motion-object"></span>',
  ripple: () =>
    '<span class="motion-object"></span><span class="motion-ripple"></span>',
  shimmer: () =>
    '<span class="motion-object"></span><span class="motion-shine"></span>',
};

function markup(type) {
  return (objects[type] || (() => '<span class="motion-object"></span>'))();
}
function radialFrames(type, index) {
  const angle =
    (type === "fanout" ? -120 : -90) + index * (type === "fanout" ? 60 : 72);
  const distance = index ? 68 : 0;
  return [
    { transform: "scale(.2)", opacity: 0 },
    {
      transform: `translate(${Math.cos((angle * Math.PI) / 180) * distance}px, ${Math.sin((angle * Math.PI) / 180) * distance}px) scale(1)`,
      opacity: 1,
    },
  ];
}
function animationFor(type, index, frames) {
  if (["fanout", "radial"].includes(type))
    return {
      keyframes: radialFrames(type, index),
      options: { delay: index * 65 },
    };
  if (type === "gooey" && index)
    return {
      keyframes: frames.gooey.map(({ transform }) => ({
        transform: transform.replace("-44", "44"),
      })),
    };
  if (type === "ripple" && index) return { keyframes: frames.ripple };
  if (type === "shimmer" && index) return { keyframes: frames.shimmer };
  return {
    keyframes: frames[type] || frames.fade,
    options: type === "accordion" ? { delay: index * 120 } : {},
  };
}

export function createMotionDemo([name, title, term, desc, type], frames) {
  return {
    id: `motion-${name}`,
    category: "motion",
    title,
    term,
    desc,
    visual: `motion-${type}`,
    samples: [`motion-${name}`],
    reference:
      name === "blur"
        ? "https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur"
        : name === "gooey"
          ? "https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix"
          : reference,
    render() {
      const filter =
        type === "gooey"
          ? '<svg class="gooey-filter" aria-hidden="true"><defs><filter id="glossary-gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="8"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter></defs></svg>'
          : "";
      const interactive = ["ripple", "magnetic"].includes(type);
      return `<div class="sample motion-experiment motion-demo-${type}">${filter}<div class="motion-lab" data-motion-lab${interactive ? ' tabindex="0"' : ""} role="${interactive ? "button" : "img"}" aria-label="${interactive ? `${desc} 이 영역을 조작해 보세요.` : desc}"><div class="motion-objects">${markup(type)}</div></div><button type="button" class="ui-btn ui-btn-primary" data-play>재생</button><details class="motion-more"><summary>무엇이 달라지나요?</summary><p>${desc}</p></details><p class="sr-only" role="status" data-motion-status></p></div>`;
    },
    mount(root) {
      let animations = [];
      const play = root.querySelector("[data-play]");
      const lab = root.querySelector("[data-motion-lab]");
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      const cancel = () => {
        animations.forEach((animation) => animation.cancel());
        animations = [];
      };
      const run = () => {
        cancel();
        root
          .querySelectorAll(".motion-object, .motion-ripple, .motion-shine")
          .forEach((object, index) => {
            const animation = animationFor(type, index, frames);
            animations.push(
              object.animate(animation.keyframes, {
                duration: reduced.matches ? 1 : 1200,
                fill: "forwards",
                easing:
                  type === "easing" ? "cubic-bezier(.2,.8,.2,1)" : "ease-out",
                ...animation.options,
              }),
            );
          });
        root.querySelector("[data-motion-status]").textContent = reduced.matches
          ? "움직임 줄이기: 변화 후 상태를 표시합니다."
          : `${title} 재생`;
      };
      play.addEventListener("click", run);
      const startRipple = (event) => {
        const rect = lab.getBoundingClientRect();
        const ripple = root.querySelector(".motion-ripple");
        ripple.style.left = `${event.clientX - rect.left - ripple.offsetWidth / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - ripple.offsetHeight / 2}px`;
        run();
      };
      const followPointer = (event) => {
        const rect = lab.getBoundingClientRect();
        const object = root.querySelector(".motion-object");
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        const distance = Math.hypot(x, y);
        const pull = Math.max(0, 1 - distance / 180) * 24;
        object.style.transform = `translate(${(x / (distance || 1)) * pull}px, ${(y / (distance || 1)) * pull}px)`;
      };
      if (type === "ripple") lab.addEventListener("pointerdown", startRipple);
      if (type === "magnetic") {
        lab.addEventListener("pointermove", followPointer);
        lab.addEventListener("pointerleave", () => {
          root.querySelector(".motion-object").style.transform = "";
        });
      }
      reduced.addEventListener("change", cancel);
      return () => {
        cancel();
        play.removeEventListener("click", run);
        if (type === "ripple")
          lab.removeEventListener("pointerdown", startRipple);
        if (type === "magnetic")
          lab.removeEventListener("pointermove", followPointer);
        reduced.removeEventListener("change", cancel);
      };
    },
  };
}
