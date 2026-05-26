// ── Menu mobile ──────────────────────────────
const toggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('aberto'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('aberto')));
}

// ── Link ativo no nav ────────────────────────
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('ativo');
});

// ── Formulário de orçamento ──────────────────
const form = document.getElementById('formOrcamento');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    document.getElementById('formSucesso').style.display = 'block';
  });
}

// ── Animação fade-up ao entrar na viewport ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visivel');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── Vanilla Tilt 3D ──────────────────────────
function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;

  // Cards principais
  VanillaTilt.init(document.querySelectorAll('.card'), {
    max: 14,
    speed: 500,
    glare: true,
    'max-glare': 0.18,
    scale: 1.04,
    perspective: 900,
  });

  // Cards de serviço
  VanillaTilt.init(document.querySelectorAll('.servico-card'), {
    max: 10,
    speed: 500,
    glare: true,
    'max-glare': 0.12,
    scale: 1.03,
    perspective: 900,
  });

  // Cards de projetos
  VanillaTilt.init(document.querySelectorAll('.projeto-card'), {
    max: 10,
    speed: 500,
    glare: true,
    'max-glare': 0.1,
    scale: 1.03,
    perspective: 1000,
  });

  // Depoimentos
  VanillaTilt.init(document.querySelectorAll('.depoimento-card'), {
    max: 8,
    speed: 600,
    glare: true,
    'max-glare': 0.1,
    scale: 1.02,
    perspective: 1000,
  });
}

// Aguarda o script carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTilt);
} else {
  initTilt();
}

// ── Parallax suave no hero visual ────────────
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroVisual.style.transform = `translateY(${scrollY * 0.12}px)`;
  }, { passive: true });
}

// ── Contador animado nos stats ────────────────
function animateCounter(el, target, suffix) {
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 35);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const text = el.textContent.trim();
    if (text === '+5')  animateCounter(el, 5, '+');
    if (text === '4')   animateCounter(el, 4, '');
    if (text === '95%') { el.textContent = '0%'; animateCounter(el, 95, '%'); }
    statsObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card strong').forEach(el => statsObserver.observe(el));
