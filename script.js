/* ════════════════════════════════════════
   TRANSLATIONS — loaded from locales/
════════════════════════════════════════ */
let T = { en: {}, el: {} };

/* ════════════════════════════════════════
   TYPED EFFECT
════════════════════════════════════════ */
let currentLang = 'en';
let typedPI = 0, typedCI = 0, typedDeleting = false, typedTimer = null;
const typedEl = document.getElementById('typed');

function startTyped() {
  clearTimeout(typedTimer);
  typedPI = 0; typedCI = 0; typedDeleting = false;
  typedEl.textContent = '';
  runTyped();
}

function runTyped() {
  const phrases = T[currentLang].hero_typed;
  if (!phrases) return;
  const phrase = phrases[typedPI];
  if (!typedDeleting) {
    typedEl.textContent = phrase.slice(0, ++typedCI);
    if (typedCI === phrase.length) { typedDeleting = true; typedTimer = setTimeout(runTyped, 2000); return; }
  } else {
    typedEl.textContent = phrase.slice(0, --typedCI);
    if (typedCI === 0) { typedDeleting = false; typedPI = (typedPI + 1) % phrases.length; }
  }
  typedTimer = setTimeout(runTyped, typedDeleting ? 38 : 72);
}

/* ════════════════════════════════════════
   LANGUAGE SWITCH
════════════════════════════════════════ */
function applyLang(lang) {
  const dict = T[lang];
  if (!dict) return;
  const textEls = document.querySelectorAll('[data-i18n]');
  const htmlEls = document.querySelectorAll('[data-i18n-html]');
  textEls.forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  htmlEls.forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
}

function setLang(lang) {
  if (lang === currentLang) return;
  currentLang = lang;

  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-el').classList.toggle('active', lang === 'el');
  document.documentElement.lang = lang;

  const allEls = [...document.querySelectorAll('[data-i18n]'), ...document.querySelectorAll('[data-i18n-html]')];
  allEls.forEach(el => el.classList.add('lang-fade'));

  setTimeout(() => {
    applyLang(lang);
    allEls.forEach(el => el.classList.remove('lang-fade'));
    startTyped();
  }, 180);
}

/* ════════════════════════════════════════
   INTERSECTION OBSERVER (scroll reveals)
════════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => {
      el.classList.add('visible');
      const fill = el.querySelector('.skill-fill');
      if (fill) setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 200);
    }, delay);
    observer.unobserve(el);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.timeline-item').forEach((el, i) => { el.dataset.delay = i * 120; observer.observe(el); });
document.querySelectorAll('.card, .achievement-card, .cert-item, .skill-item, .vol-item, .conf-item').forEach((el, i) => { el.dataset.delay = (i % 4) * 90; observer.observe(el); });

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
async function init() {
  try {
    const [en, el] = await Promise.all([
      fetch('locales/en.json').then(r => r.json()),
      fetch('locales/el.json').then(r => r.json())
    ]);
    T = { en, el };
    applyLang('en');
  } catch (e) {
    console.warn('Could not load translations:', e);
  }
  startTyped();
}

init();

/* ════════════════════════════════════════
   PRINT PREPARATION
════════════════════════════════════════ */
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('.skill-fill').forEach(fill => {
    fill.style.width = (fill.dataset.width || 0) + '%';
  });
  const d = new Date();
  const opts = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('print-date').textContent = d.toLocaleDateString(currentLang === 'el' ? 'el-GR' : 'en-GB', opts);
});
