// Menu mobile
const toggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('aberto'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('aberto')));
}

// Marca link ativo no nav
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('ativo');
});

// Formulário de orçamento
const form = document.getElementById('formOrcamento');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    document.getElementById('formSucesso').style.display = 'block';
  });
}

// Animação ao entrar na viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visivel');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .servico-card, .projeto-card, .valor').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .4s ease, transform .4s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.visivel').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});

// Aplicar visibilidade quando observado
const styleSheet = document.createElement('style');
styleSheet.textContent = '.visivel { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(styleSheet);
