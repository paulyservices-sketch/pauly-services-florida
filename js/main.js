// ===== NAV: scroll shadow =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== ANIMATED COUNTERS =====
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    if (!isNaN(target)) animateCounter(el, target);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count[data-target]').forEach(el => counterObserver.observe(el));

// ===== FADE-IN ON SCROLL =====
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.card, .service-cat, .stat-box, .faq-item, .area-card, .sidebar-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.55s ease ${i * 0.05}s, transform 0.55s ease ${i * 0.05}s`;
  el.classList.add('fade-target');
  fadeObserver.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = '.fade-target.visible { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);
});

// ===== BOOKING FORM =====
const form = document.getElementById('booking-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const successBox = document.getElementById('booking-success');

// Dashboard endpoints — tries tunnel (port 5001 via Cloudflare) then localhost fallback
const DASHBOARD_URLS = [
  'https://pauly-dashboard.trycloudflare.com/api/book', // stable tunnel (when configured)
  'http://localhost:5001/api/book',
];

async function submitToDashboard(payload) {
  for (const url of DASHBOARD_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return true;
    } catch (_) { /* try next */ }
  }
  return false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const worryFreeEl = form.querySelector('[name="worry_free"]');
  const payload = {
    name:         form.name.value.trim(),
    phone:        form.phone.value.trim(),
    email:        form.email.value.trim(),
    address:      form.address.value.trim(),
    service:      form.service.value,
    description:  `Service: ${form.service.value}\nUrgency: ${form.urgency.value}\nNotes: ${form.notes.value.trim() || 'None'}`,
    urgent:       form.urgency.value,
    worry_free:   worryFreeEl && worryFreeEl.checked ? 'yes' : 'no',
    source:       'website',
    submitted_at: new Date().toISOString(),
  };

  if (!payload.name || !payload.phone || !payload.address || !payload.service || !payload.urgent) {
    alert('Please fill out all required fields.');
    return;
  }

  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  submitBtn.disabled = true;

  const sent = await submitToDashboard(payload);
  if (!sent) {
    // Offline fallback — save locally so Paul can recover it
    localStorage.setItem('pauly_booking_' + Date.now(), JSON.stringify(payload));
  }

  form.style.display = 'none';
  successBox.style.display = 'block';
  successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 90) current = sec.id; });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current ? 'var(--blue2)' : '';
  });
}, { passive: true });
