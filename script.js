// =============================================
//  CAFE 1010 — script.js
// =============================================

// ── HERO FADE-IN ON LOAD ──
window.addEventListener('load', function () {
  var heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    heroContent.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    setTimeout(function () {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 100);
  }
});

// ── SMOOTH SCROLL FOR ALL ANCHOR LINKS ──
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = this.getAttribute('href');
    if (target !== '#') {
      e.preventDefault();
      var el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── ACTIVE NAV LINK HIGHLIGHT ON SCROLL ──
var sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', function () {
  var current = '';
  sections.forEach(function (sec) {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
});

// ── MENU TAB FILTER ──
function filterMenu(btn, cat) {
  document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('on'); });
  btn.classList.add('on');
  document.querySelectorAll('.mcard').forEach(function (card) {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'block' : 'none';
  });
}

// ── CONTACT FORM SUBMIT ──
function handleFormSubmit() {
  var name    = document.getElementById('contactName').value.trim();
  var email   = document.getElementById('contactEmail').value.trim();
  var message = document.getElementById('contactMessage').value.trim();

  if (!name)    { alert('Please enter your name.'); return; }
  if (!email)   { alert('Please enter your email or phone number.'); return; }
  if (!message) { alert('Please enter a message.'); return; }

  alert('Thank you, ' + name + '! We will get back to you soon. ☕');
  document.getElementById('contactName').value    = '';
  document.getElementById('contactEmail').value   = '';
  document.getElementById('contactMessage').value = '';
}

// ── GALLERY ITEM CLICK ──
document.querySelectorAll('.gitem').forEach(function (item) {
  item.addEventListener('click', function () {
    console.log('Gallery item clicked — connect your lightbox here!');
  });
});

// ── NAV SCROLL SHADOW ──
window.addEventListener('scroll', function () {
  var nav = document.querySelector('nav');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 40 ? '0 2px 16px rgba(0,0,0,0.25)' : 'none';
  }
});
