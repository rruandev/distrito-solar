// ── Scroll progress bar ───────────────────────
const progressBar = document.getElementById('scroll-progress');
const stickyCta   = document.getElementById('stickyCta');
const heroSection = document.querySelector('.hero');

window.addEventListener('scroll', () => {
  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;

  // progress bar
  if (progressBar) {
    progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + '%' : '0%';
  }

  // sticky CTA — aparece depois do hero
  if (stickyCta && heroSection) {
    const heroBottom = heroSection.getBoundingClientRect().bottom + scrollTop;
    stickyCta.classList.toggle('visivel', scrollTop > heroBottom);
  }
}, { passive: true });

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

// ── Contador animado via data-counter ─────────
function animateCounter2(el, target, prefix, suffix) {
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = prefix + current + suffix;
    if (current >= target) clearInterval(timer);
  }, 35);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    animateCounter2(el, +el.dataset.counter, el.dataset.prefix || '', el.dataset.suffix || '');
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObs.observe(el));

// ── Calculadora de Economia ───────────────────
const slider = document.getElementById('calcSlider');
if (slider) {
  const fmt = v => 'R$ ' + v.toLocaleString('pt-BR');

  function updateCalc() {
    const conta = +slider.value;
    const economia = Math.round(conta * 0.95);
    const anual = economia * 12;
    const custoEstimado = conta * 18;
    const retornoAnos = Math.round(custoEstimado / anual * 10) / 10;
    const co2 = (economia * 12 * 0.09 / 1000).toFixed(1);

    document.getElementById('calcContaLabel').textContent = fmt(conta);
    document.getElementById('calcEconomia').textContent = fmt(economia);
    document.getElementById('calcAnual').textContent = fmt(anual);
    document.getElementById('calcRetorno').textContent = '~' + retornoAnos + ' anos';
    document.getElementById('calcCo2').textContent =
      'Você evitaria ~' + co2 + ' toneladas de CO₂ por ano';

    const pct = ((conta - 100) / (5000 - 100)) * 100;
    slider.style.background =
      `linear-gradient(90deg, var(--azul) ${pct}%, #dde3f0 ${pct}%)`;
  }

  slider.addEventListener('input', updateCalc);
  updateCalc();
}

// ── Formulário 2 etapas ───────────────────────
const btnProximo = document.getElementById('btnProximo');
const btnVoltar  = document.getElementById('btnVoltar');
if (btnProximo) {
  btnProximo.addEventListener('click', () => {
    const pag1 = document.getElementById('formPag1');
    const pag2 = document.getElementById('formPag2');
    const s1 = document.getElementById('stepItem1');
    const s2 = document.getElementById('stepItem2');
    const linha = document.getElementById('stepLinha');
    // validação básica da etapa 1
    const nome = document.getElementById('nome');
    const tel  = document.getElementById('telefone');
    const mail = document.getElementById('email');
    if (!nome.value.trim() || !tel.value.trim() || !mail.value.trim()) {
      [nome, tel, mail].forEach(f => {
        if (!f.value.trim()) f.style.borderColor = '#e53e3e';
        else f.style.borderColor = '';
      });
      return;
    }
    pag1.classList.remove('ativa');
    pag2.classList.add('ativa');
    s1.classList.remove('ativo'); s1.classList.add('feito');
    s2.classList.add('ativo');
    if (linha) linha.classList.add('ativa');
  });
}
if (btnVoltar) {
  btnVoltar.addEventListener('click', () => {
    document.getElementById('formPag1').classList.add('ativa');
    document.getElementById('formPag2').classList.remove('ativa');
    document.getElementById('stepItem1').classList.remove('feito');
    document.getElementById('stepItem1').classList.add('ativo');
    document.getElementById('stepItem2').classList.remove('ativo');
    const linha = document.getElementById('stepLinha');
    if (linha) linha.classList.remove('ativa');
  });
}

// ── FAQ Accordion ─────────────────────────────
document.querySelectorAll('.faq-pergunta').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const jaAberto = item.classList.contains('aberto');
    document.querySelectorAll('.faq-item.aberto').forEach(i => i.classList.remove('aberto'));
    if (!jaAberto) item.classList.add('aberto');
  });
});

// ── Filtro de projetos ────────────────────────
const filtrosBtns = document.querySelectorAll('.filtro-btn');
const projetoCards = document.querySelectorAll('#projetosGrid .projeto-card');
const projetosVazio = document.getElementById('projetosVazio');

if (filtrosBtns.length) {
  filtrosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filtrosBtns.forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');

      const filtro = btn.dataset.filtro;
      let visiveis = 0;

      projetoCards.forEach((card, i) => {
        const cat = card.dataset.categoria;
        const mostrar = filtro === 'todos' || cat === filtro;
        if (mostrar) {
          card.classList.remove('oculto');
          card.style.transitionDelay = `${i * 0.05}s`;
          visiveis++;
        } else {
          card.classList.add('oculto');
          card.style.transitionDelay = '0s';
        }
      });

      if (projetosVazio) projetosVazio.style.display = visiveis === 0 ? 'block' : 'none';
    });
  });
}

// ── LGPD Banner ───────────────────────────────
const lgpdBanner = document.getElementById('lgpdBanner');
const lgpdBtn    = document.getElementById('lgpdAceitar');
if (lgpdBanner) {
  if (!localStorage.getItem('lgpd_ok')) {
    setTimeout(() => lgpdBanner.classList.add('visivel'), 900);
  }
  if (lgpdBtn) {
    lgpdBtn.addEventListener('click', () => {
      localStorage.setItem('lgpd_ok', '1');
      lgpdBanner.classList.remove('visivel');
    });
  }
}

// ── FAQ accordion
function toggleFaq(btn) {
  var item = btn.closest('.faq-item');
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function(el) { el.classList.remove('open'); });
  if (!isOpen) item.classList.add('open');
}
