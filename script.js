// =============================================
//  CAFE 1010 — FIXED script.js
// =============================================

document.addEventListener("DOMContentLoaded", function () {

  // ── HERO FADE-IN ──
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    heroContent.style.transition = 'opacity 0.9s ease, transform 0.9s ease';

    setTimeout(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 100);
  }

  // ── SMOOTH SCROLL ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = this.getAttribute('href');
      if (target !== '#') {
        e.preventDefault();
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── ACTIVE NAV LINK ON SCROLL ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = "";

    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === "#" + current) {
        a.classList.add('active');
      }
    });

    // NAV SHADOW
    const nav = document.querySelector('nav');
    if (nav) {
      nav.style.boxShadow = window.scrollY > 40
        ? '0 2px 16px rgba(0,0,0,0.25)'
        : 'none';
    }
  });

  // ── GALLERY CLICK ──
  document.querySelectorAll('.gitem').forEach(item => {
    item.addEventListener('click', () => {
      console.log("Gallery clicked — add lightbox later");
    });
  });

});

// ── MENU FILTER (GLOBAL FUNCTION FOR BUTTONS) ──
function filterMenu(btn, cat) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');

  document.querySelectorAll('.mcard').forEach(card => {
    card.style.display =
      (cat === 'all' || card.dataset.cat === cat)
        ? 'block'
        : 'none';
  });
}

// ── CONTACT FORM ──
function handleFormSubmit() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name) return alert('Please enter your name.');
  if (!email) return alert('Please enter your email or phone.');
  if (!message) return alert('Please enter a message.');

  alert(`Thank you, ${name}! We will get back to you soon ☕`);

  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMessage').value = '';
}
