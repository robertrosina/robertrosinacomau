const header = document.querySelector('[data-site-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-site-nav]');

const setHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 18);
};
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('is-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
  });
});

const revealTargets = document.querySelectorAll('.work-card, .sector-list article, .value-grid article, .process-list li, .founder-card, .contact-card, .signal-card');
revealTargets.forEach((el) => el.setAttribute('data-reveal', ''));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealTargets.forEach((el) => revealObserver.observe(el));
