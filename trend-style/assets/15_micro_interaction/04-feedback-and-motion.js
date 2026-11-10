/* --------------------------------------------------------------------------
   8. MODAL & SLIDE-OVER DRAWER LOGIC
   -------------------------------------------------------------------------- */
function openModal(e) {
  if (e) createRipple(e);
  document.getElementById("modalBackdrop").classList.add("open");
}

function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("open");
}

function closeModalOnBackdrop(e) {
  if (e.target.id === "modalBackdrop") closeModal();
}

function selectRadioPill(pill) {
  document.querySelectorAll(".radio-pill").forEach((p) => p.classList.remove("active"));
  pill.classList.add("active");
}

function handleProjectSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  btn.classList.add("loading");

  setTimeout(() => {
    btn.classList.remove("loading");
    btn.classList.add("success");
    setTimeout(() => {
      btn.classList.remove("success");
      closeModal();
    }, 1200);
  }, 1200);
}

/* --------------------------------------------------------------------------
   9. LIQUID MORPH BUTTON RIPPLE EFFECT & CUSTOM CURSOR
   -------------------------------------------------------------------------- */
function createRipple(e) {
  const btn = e.currentTarget || e.target;
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const circle = document.createElement("span");
  const diameter = Math.max(rect.width, rect.height);
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - diameter / 2}px`;
  circle.style.top = `${e.clientY - rect.top - diameter / 2}px`;
  circle.classList.add("ripple-effect");

  const existing = btn.querySelector(".ripple-effect");
  if (existing) existing.remove();
  btn.appendChild(circle);
}

document.querySelectorAll(".liquid-btn").forEach((b) => {
  b.addEventListener("click", createRipple);
});

// Custom Cursor Magnetic Follow
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

window.addEventListener("mousemove", (e) => {
  dot.style.left = `${e.clientX}px`;
  dot.style.top = `${e.clientY}px`;
  ring.style.left = `${e.clientX}px`;
  ring.style.top = `${e.clientY}px`;
});

/* --------------------------------------------------------------------------
   10. QUANTUM CANVAS PARTICLE ENGINE (V4)
   -------------------------------------------------------------------------- */
function initQuantumCanvas() {
  const canvas = document.getElementById("quantumCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    radius: Math.random() * 2 + 1,
  }));

  function loop() {
    if (!document.body.classList.contains("theme-v4")) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(56, 189, 248, 0.6)";

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(loop);
  }
  loop();
}
