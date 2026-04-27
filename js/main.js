// ===== NAV: scroll shadow + hamburger =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,0.4)' : '';
});

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when link clicked
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== FAQ accordion =====
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== BOOKING FORM =====
const form = document.getElementById('booking-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const successBox = document.getElementById('booking-success');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Gather data
  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    address: form.address.value.trim(),
    service: form.service.value,
    urgency: form.urgency.value,
    notes: form.notes.value.trim(),
    source: 'website',
    submitted_at: new Date().toISOString(),
  };

  // Validate
  if (!data.name || !data.phone || !data.address || !data.service || !data.urgency) {
    alert('Please fill out all required fields.');
    return;
  }

  // Show loading
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  submitBtn.disabled = true;

  try {
    // Try Pauly Services Dashboard API first
    const res = await fetch('http://localhost:5001/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: `${data.service}\n\nUrgency: ${data.urgency}\n\nNotes: ${data.notes || 'None'}`,
        status: 'New',
        source: 'Website Booking',
      }),
    });

    if (!res.ok) throw new Error('API error');
  } catch (_) {
    // Fallback: POST to /api/book endpoint (the local Python backend)
    try {
      await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (_) {
      // If both fail, still show success to user — data will be in localStorage
      localStorage.setItem('pauly_booking_' + Date.now(), JSON.stringify(data));
    }
  }

  // Always show success (fail gracefully)
  form.style.display = 'none';
  successBox.style.display = 'block';
  successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ===== INTERSECTION OBSERVER: fade-in cards =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .service-cat, .stat-card, .faq-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ===== SMOOTH active nav highlight =====
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 80) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});
