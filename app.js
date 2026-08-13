/**
  Cafe 1010 Website Interactivity
  Logic implemented:
    1. Sticky header and scroll spy active navigation highlights.
    2. Analog clock toggle (10:10 brand time vs local ticking time).
    3. Mobile nav drawer toggle.
    4. Auto-playing and manual photo gallery carousel slider.
    5. Blueprint SVG map click interactions.
    6. Dynamic Booking Modal for zones.
    7. Online Ordering system (Cart Drawer, item addition/subtraction, totals, checkout).
    8. Custom Toast Alerts.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE VARIABLES ---
  let cart = [];
  let currentSlide = 0;
  let isLiveTimeMode = false; // Default: 10:10 brand time
  let clockInterval = null;
  let sliderInterval = null;

  // --- DOM ELEMENTS ---
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Clock
  const modeBtn = document.getElementById('clock-mode-btn');
  const digitalTime = document.getElementById('clock-digital');
  const hrHand = document.getElementById('hour-hand');
  const minHand = document.getElementById('minute-hand');
  const secHand = document.getElementById('second-hand');

  // Slider
  let slides = document.querySelectorAll('.slide');
  let indicators = document.querySelectorAll('.indicator');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  // --- LIVE DASHBOARD CONTENT SYNC ENGINE ---
  const STORAGE_KEY_PHOTOS = 'cafe1010_live_photos_v1';
  const SYNC_CHANNEL_NAME = 'cafe1010_live_sync';
  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL_NAME) : null;

    const DEFAULT_PHOTOS_APP = [
      { id: 'def-h1', placement: 'hero', title: 'Garden Courtyard Hero', desc: 'Jodhpur garden escape & signature signpost', src: 'assets/hero_bg.jpg', isCustom: false },
      { id: 'def-g1', placement: 'gallery', title: 'Garden Pathway', desc: 'Cascading pink bougainvillea shade', src: 'assets/garden_bougainvillea.jpg', isCustom: false },
      { id: 'def-g2', placement: 'gallery', title: 'Blue City Courtyard', desc: 'Brick-paved courtyard with blue arches', src: 'assets/courtyard_1.jpg', isCustom: false },
      { id: 'def-g3', placement: 'gallery', title: 'The Signpost to Discovery', desc: 'Vintage direction sign to zones', src: 'assets/signpost.jpg', isCustom: false },
      { id: 'def-g4', placement: 'gallery', title: 'Bougainvillea Canopy', desc: 'Pink blossoms against blue Jodhpur sky', src: 'assets/bougainvillea_close.jpg', isCustom: false },
      { id: 'def-g5', placement: 'gallery', title: 'Sunset Golden Hour', desc: 'Soft sunbeams lighting courtyard seating', src: 'assets/courtyard_2.jpg', isCustom: false },
      { id: 'def-g6', placement: 'gallery', title: 'Heritage Dining Room', desc: 'Atrium dining space with glass roof', src: 'assets/restaurant_3.jpg', isCustom: false },

      { id: 'def-z1', placement: 'rooftop', title: 'Maadi Roof Top', desc: 'Lush greenery, bougainvillea terrace, & outdoor seating', src: 'assets/rooftop_1.jpg', isCustom: false },
      { id: 'def-z2', placement: 'dorms', title: 'Bandi Street Dorms', desc: 'Hostel dorm environment with local art', src: 'assets/dorms.png', isCustom: false },
      { id: 'def-z3', placement: 'restaurant', title: 'Main Restaurant Interior', desc: 'Heritage dining space with fresh brews', src: 'assets/restaurant.png', isCustom: false },
      { id: 'def-z4', placement: 'restaurant', title: 'Cozy Table Seating', desc: 'Warm ceiling lamps & wooden tables', src: 'assets/restaurant_1.jpg', isCustom: false },
      { id: 'def-z5', placement: 'restaurant', title: 'Bamboo Ceiling Dining', desc: 'Traditional rustic bamboo architecture', src: 'assets/restaurant_2.jpg', isCustom: false },
      { id: 'def-z6', placement: 'restaurant', title: 'Glass Roof Atrium', desc: 'Warm ambient globes and white brick walls', src: 'assets/restaurant_3.jpg', isCustom: false },
      { id: 'def-z7', placement: 'restaurant', title: 'Garden View Dining Table', desc: 'Air-conditioned dining facing courtyard', src: 'assets/restaurant_4.jpg', isCustom: false },
      { id: 'def-z8', placement: 'gazebo', title: 'Gajibo Bamboo Canopy View', desc: 'Geometric bamboo ceiling, warm lamps, & bougainvillea garden', src: 'assets/gazebo_1.jpg', isCustom: false },
      { id: 'def-z8b', placement: 'gazebo', title: 'Gajibo Outdoor Table Seating', desc: 'Wooden table seating with pink bougainvillea backdrop', src: 'assets/gazebo_2.jpg', isCustom: false },
      { id: 'def-z8c', placement: 'gazebo', title: 'Gajibo Roof Structure & Garden View', desc: 'Angled bamboo gazebo roof & garden vista', src: 'assets/gazebo_3.jpg', isCustom: false },
      { id: 'def-z9', placement: 'work', title: 'Work From Cafe Spot', desc: 'High-speed internet & charging outlets', src: 'assets/hero.png', isCustom: false },
      { id: 'def-z10', placement: 'troposphere', title: 'Troposphere Full Room View', desc: 'Snooker table & vibrant artwork wall', src: 'assets/troposphere_1.jpg', isCustom: false },
      { id: 'def-z11', placement: 'troposphere', title: 'Snooker Table Close-Up', desc: 'Green felt, white cue ball, & rack focus', src: 'assets/troposphere_2.jpg', isCustom: false },
      { id: 'def-z12', placement: 'troposphere', title: 'Cue Ball & Ball Rack Focus', desc: 'Arranged snooker balls & wall frames', src: 'assets/troposphere_3.jpg', isCustom: false },
      { id: 'def-z13', placement: 'troposphere', title: 'Vibrant Wall Artwork Collage', desc: 'Color block wall & snooker arena', src: 'assets/troposphere_4.jpg', isCustom: false },
      { id: 'def-z14', placement: 'troposphere', title: 'Snooker Room Overview', desc: 'Full-sized snooker table flight room', src: 'assets/snooker.png', isCustom: false }
    ];

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PHOTOS);
      if (stored) {
        photos = JSON.parse(stored);
        if (Array.isArray(photos) && photos.length > 0) {
          const defaultMap = new Map(DEFAULT_PHOTOS_APP.map(p => [p.id, p]));
          let updated = false;

          // Clear any old custom hero items to ensure the new hero image displays
          const beforeHeroClear = photos.length;
          photos = photos.filter(photo => !(photo.placement === 'hero' && photo.isCustom));
          if (photos.length !== beforeHeroClear) updated = true;

          photos = photos.map(photo => {
            if (photo.id && defaultMap.has(photo.id)) {
              const latestDef = defaultMap.get(photo.id);
              if (photo.src !== latestDef.src || photo.placement !== latestDef.placement) {
                updated = true;
                return { ...photo, src: latestDef.src, placement: latestDef.placement, isCustom: false };
              }
            }
            return photo;
          });

          // Self-heal and insert any missing default photos
          DEFAULT_PHOTOS_APP.forEach(defItem => {
            if (!photos.some(p => p.id === defItem.id)) {
              photos.push(defItem);
              updated = true;
            }
          });

          if (updated) {
            localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
          }
        }
      } else {
        photos = DEFAULT_PHOTOS_APP;
        localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
      }
    } catch(e) {
      console.error('Error reading live photos store:', e);
      photos = DEFAULT_PHOTOS_APP;
    }

    if (!photos || photos.length === 0) return;

    // 1. Update Zone Lightbox Galleries & Front Card Cover Images
    const zones = ['rooftop', 'dorms', 'restaurant', 'gazebo', 'work', 'troposphere'];
    zones.forEach(zoneKey => {
      const matching = photos.filter(p => p.placement === zoneKey);
      if (matching.length > 0) {
        zoneGalleries[zoneKey] = matching.map(p => ({
          src: p.src,
          alt: p.title || p.desc || zoneKey
        }));

        // Dynamically update front card cover image on homepage
        const coverImg = document.querySelector(`img[data-zone-cover="${zoneKey}"]`);
        if (coverImg) {
          coverImg.src = matching[0].src;
          if (matching[0].title) {
            coverImg.alt = matching[0].title;
          }
          if (matching[0].cropPosition) {
            coverImg.style.objectPosition = matching[0].cropPosition;
          }
          if (matching[0].cropZoom && matching[0].cropZoom !== 100) {
            coverImg.style.transform = `scale(${matching[0].cropZoom / 100})`;
          } else {
            coverImg.style.transform = 'none';
          }
        }
      }
    });

    // 2. Update Homepage Main Gallery Carousel Slider
    const galleryPhotos = photos.filter(p => p.placement === 'gallery');
    if (galleryPhotos.length > 0) {
      const galleryTrack = document.getElementById('gallery-track');
      const galleryIndicators = document.getElementById('gallery-indicators');

      if (galleryTrack && galleryIndicators) {
        galleryTrack.innerHTML = '';
        galleryIndicators.innerHTML = '';

        galleryPhotos.forEach((photo, idx) => {
          // Slide element
          const slideDiv = document.createElement('div');
          slideDiv.className = `slide ${idx === 0 ? 'active' : ''}`;

          const cropPosStyle = photo.cropPosition ? `object-position: ${photo.cropPosition};` : '';
          const cropZoomStyle = photo.cropZoom && photo.cropZoom !== 100 ? `transform: scale(${photo.cropZoom / 100});` : '';

          slideDiv.innerHTML = `
            <img src="${photo.src}" alt="${photo.title || 'Gallery Photo'}" style="${cropPosStyle} ${cropZoomStyle}" ${idx > 0 ? 'loading="lazy"' : ''}>
            <div class="slide-caption">
              <h3>${photo.title || 'Gallery View'}</h3>
              <p>${photo.desc || ''}</p>
            </div>
          `;
          galleryTrack.appendChild(slideDiv);

          // Indicator button element
          const indBtn = document.createElement('button');
          indBtn.className = `indicator ${idx === 0 ? 'active' : ''}`;
          indBtn.type = 'button';
          indBtn.setAttribute('data-slide', idx);
          indBtn.setAttribute('aria-label', `Go to slide ${idx + 1}`);
          indBtn.addEventListener('click', () => {
            showSlide(idx);
            resetSliderTimer();
          });
          galleryIndicators.appendChild(indBtn);
        });

        // Refresh DOM node lists
        slides = document.querySelectorAll('.slide');
        indicators = document.querySelectorAll('.indicator');
        currentSlide = 0;
      }
    }

    // Helper to validate image sources
    function isValidImgSrc(src) {
      if (!src || typeof src !== 'string') return false;
      const s = src.trim();
      return s.startsWith('assets/') || s.startsWith('data:image/') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:');
    }

    // 3. Update Homepage Top Hero Banner Background Image
    const validHeroPhotos = photos.filter(p => p.placement === 'hero' && isValidImgSrc(p.src));
    const customHero = validHeroPhotos.find(p => p.isCustom);
    const topHero = customHero || validHeroPhotos[0];

    const heroSection = document.getElementById('home');
    if (heroSection) {
      const heroSrc = (topHero && isValidImgSrc(topHero.src)) ? topHero.src : 'assets/hero_bg.jpg';
      const cropPos = (topHero && topHero.cropPosition) ? topHero.cropPosition : 'center 35%';
      const zoomVal = (topHero && topHero.cropZoom && topHero.cropZoom !== 100) ? topHero.cropZoom / 100 : 1;
      
      heroSection.style.backgroundImage = `linear-gradient(180deg, rgba(9, 26, 46, 0.4) 0%, rgba(9, 26, 46, 0.55) 60%, rgba(9, 26, 46, 0.75) 100%), url('${heroSrc}')`;
      heroSection.style.backgroundPosition = cropPos;
      heroSection.style.backgroundSize = zoomVal > 1 ? `${zoomVal * 100}%` : 'cover';
    }
  }

  // Listen for storage events across windows & live broadcast channel
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_PHOTOS) {
      loadLivePhotos();
    }
  });

  if (syncChannel) {
    syncChannel.onmessage = (e) => {
      if (e.data && e.data.type === 'PHOTOS_UPDATED') {
        loadLivePhotos();
      }
    };
  }

  // Booking Modal
  const bookingModal = document.getElementById('booking-modal');
  const bookingModalClose = document.getElementById('booking-modal-close');
  const bookingModalTitle = document.getElementById('booking-modal-title');
  const bookingZoneInput = document.getElementById('booking-zone-name');
  const bookingForm = document.getElementById('booking-form');

  // Cart Drawer
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerClose = document.getElementById('cart-drawer-close');
  const cartTriggerBtns = document.querySelectorAll('.btn-order-trigger');
  const cartEmptyMsg = document.getElementById('cart-empty');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartFooter = document.getElementById('cart-footer');
  const cartItemCount = document.getElementById('cart-item-count');
  const cartStatusBox = document.getElementById('menu-cart-status');
  const subtotalPriceEl = document.getElementById('cart-subtotal');
  const taxPriceEl = document.getElementById('cart-tax');
  const grandTotalPriceEl = document.getElementById('cart-grand-total');
  const diningStyleSelect = document.getElementById('order-dining-type');
  const tableGroup = document.getElementById('table-number-group');
  const btnCheckout = document.getElementById('btn-checkout');

  // Forms
  const contactForm = document.getElementById('visit-planner-form');


  // --- 1. STICKY HEADER & SCROLL SPY ---
  window.addEventListener('scroll', () => {
    // Header shrink
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy active navigation highlight
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth scroll offsets for header
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      navbar.classList.remove('open');
      mobileToggle.classList.remove('open');

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- SECRET ADMIN PORTAL SHORTCUT (5 Rapid Clicks on Logo) ---
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    let logoClickCount = 0;
    let logoClickTimer = null;

    logoLink.addEventListener('click', (e) => {
      logoClickCount++;
      
      clearTimeout(logoClickTimer);
      logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
      }, 2500); // Reset count if pause is > 2.5 seconds

      if (logoClickCount >= 5) {
        e.preventDefault();
        logoClickCount = 0;
        showToast('Opening Admin Portal...', 'info');
        window.open('admin.html', '_blank');
      }
    });
  }


  // --- 2. MOBILE MENU ---
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('open');
    navbar.classList.toggle('open');
  });


  // --- 3. TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add success checkmark icon
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 4s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }


  // --- 4. ANALOG CLOCK WIDGET ---
  function updateClock() {
    if (isLiveTimeMode) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Digital display
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHrs = hours % 12 || 12;
      const displayMins = minutes < 10 ? '0' + minutes : minutes;
      digitalTime.textContent = `${displayHrs}:${displayMins}:${seconds < 10 ? '0' + seconds : seconds} ${ampm}`;

      // Angles (subtracting offset of hands initial SVG drawing angles)
      // Hour hand: drawn at 45 deg (1:30 position). So we rotate (TargetAngle - 45)
      // Minute hand: drawn at -45 deg (10:30 position). So we rotate (TargetAngle + 45)
      // Second hand: drawn at 0 deg (12:00 position). So we rotate (TargetAngle)
      const hrAngle = ((hours % 12) * 30) + (minutes * 0.5);
      const minAngle = minutes * 6;
      const secAngle = seconds * 6;

      hrHand.setAttribute('transform', `rotate(${hrAngle - 45}, 100, 100)`);
      minHand.setAttribute('transform', `rotate(${minAngle + 45}, 100, 100)`);
      secHand.setAttribute('transform', `rotate(${secAngle}, 100, 100)`);
    } else {
      // 10:10 Brand mode
      digitalTime.textContent = '10:10 PM';
      // Clear any rotations to default pre-drawn SVG angles which represent 10:10
      hrHand.removeAttribute('transform');
      minHand.removeAttribute('transform');
      secHand.removeAttribute('transform');
    }
  }

  modeBtn.addEventListener('click', () => {
    isLiveTimeMode = !isLiveTimeMode;
    if (isLiveTimeMode) {
      modeBtn.textContent = 'Set Brand Time';
      modeBtn.classList.remove('btn-outline');
      modeBtn.classList.add('btn-primary');
      updateClock();
      clockInterval = setInterval(updateClock, 1000);
      showToast('Clock switched to live local time.');
    } else {
      modeBtn.textContent = 'Toggle Live Time';
      modeBtn.classList.remove('btn-primary');
      modeBtn.classList.add('btn-outline');
      clearInterval(clockInterval);
      updateClock();
      showToast('Clock locked back to Cafe brand time: 10:10.');
    }
  });


  // --- 5. GALLERY FEAST SLIDER ---
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
  }

  function startSliderAutoPlay() {
    sliderInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5500);
  }

  function resetSliderTimer() {
    clearInterval(sliderInterval);
    startSliderAutoPlay();
  }

  prevBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
    resetSliderTimer();
  });

  nextBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
    resetSliderTimer();
  });

  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const targetIndex = parseInt(indicator.getAttribute('data-slide'));
      showSlide(targetIndex);
      resetSliderTimer();
    });
  });

  // Start slider auto run
  startSliderAutoPlay();


  // --- 6. BOOKING RESERVATION SYSTEM ---
  function openBookingModal(zoneName) {
    bookingZoneInput.value = zoneName;
    bookingModalTitle.textContent = `RESERVE: ${zoneName.toUpperCase()}`;
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    bookingModal.classList.remove('open');
    document.body.style.overflow = 'auto';
    bookingForm.reset();
  }

  // Hook up explore cards buttons
  document.querySelectorAll('.btn-reserve').forEach(btn => {
    btn.addEventListener('click', () => {
      const zone = btn.getAttribute('data-zone');
      openBookingModal(zone);
    });
  });

  bookingModalClose.addEventListener('click', closeBookingModal);

  // Close modal when clicking backdrop
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      closeBookingModal();
    }
  });

  // Submit Booking Form
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const zone = bookingZoneInput.value;
    const name = document.getElementById('booking-name').value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const guests = document.getElementById('booking-guests').value;
    const contact = document.getElementById('booking-contact').value;
    const requests = document.getElementById('booking-requests').value.trim();

    closeBookingModal();
    
    // Format WhatsApp message for facility availability and reservation
    let message = `*Cafe 1010 - Facility Reservation Request*\n\n` +
                  `*Facility/Zone:* ${zone}\n` +
                  `*Visitor Name:* ${name}\n` +
                  `*WhatsApp No:* ${contact}\n` +
                  `*Date:* ${date}\n` +
                  `*Time Slot:* ${time}\n` +
                  `*Guests:* ${guests} Pax\n`;
                  
    if (requests) {
      message += `*Special Notes:* ${requests}\n`;
    }
    
    message += `\nHello! I would like to check the availability and confirm my reservation for this slot. Please let me know!`;
                    
    const whatsappUrl = `https://wa.me/917414001010?text=${encodeURIComponent(message)}`;
    
    // Redirect to WhatsApp
    window.open(whatsappUrl, '_blank');
    
    showToast(`Inquiring availability for ${zone} via WhatsApp...`);
  });


  // --- 7. BLUEPRINT MAP INTERACTIVE CLICKS ---
  const mapZones = document.querySelectorAll('.map-zone-path');
  mapZones.forEach(zone => {
    zone.addEventListener('click', () => {
      const zoneId = zone.getAttribute('data-zone-id');
      if (zoneId) {
        openBookingModal(zoneId);
      }
    });
    
    // Accessibility keyboard support (Enter/Space keys)
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const zoneId = zone.getAttribute('data-zone-id');
        if (zoneId) {
          openBookingModal(zoneId);
        }
      }
    });
  });


  // --- 8. ONLINE ORDER BASKET & CART DRAWER ---
  function toggleCartDrawer(open) {
    if (open) {
      cartDrawer.classList.add('open');
    } else {
      cartDrawer.classList.remove('open');
    }
  }

  cartTriggerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleCartDrawer(true);
    });
  });

  cartDrawerClose.addEventListener('click', () => {
    toggleCartDrawer(false);
  });

  // Handle Dining Style toggle table input
  diningStyleSelect.addEventListener('change', () => {
    if (diningStyleSelect.value === 'table-service') {
      tableGroup.style.display = 'block';
    } else {
      tableGroup.style.display = 'none';
    }
  });

  // Adding menu items to basket
  document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));

      // Check if item exists in basket
      const existingItem = cart.find(item => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }

      updateCart();
      showToast(`Added ${name} to your order basket.`);
    });
  });

  function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update bottom basket notification on menu section
    if (totalItems > 0) {
      cartItemCount.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''} in your basket`;
      cartStatusBox.style.display = 'block';
    } else {
      cartStatusBox.style.display = 'none';
    }

    // Toggle Empty state in Drawer
    if (cart.length === 0) {
      cartEmptyMsg.style.display = 'flex';
      cartItemsList.style.display = 'none';
      cartFooter.style.display = 'none';
    } else {
      cartEmptyMsg.style.display = 'none';
      cartItemsList.style.display = 'flex';
      cartFooter.style.display = 'block';

      // Populate list
      cartItemsList.innerHTML = '';
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
          <div>
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-price">₹${item.price} x ${item.quantity}</p>
          </div>
          <div class="cart-item-qty-wrap">
            <button class="qty-btn btn-minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
          </div>
        `;
        cartItemsList.appendChild(row);
      });

      // Hook plus/minus buttons inside drawer
      document.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const item = cart.find(i => i.id === id);
          if (item) {
            item.quantity += 1;
            updateCart();
          }
        });
      });

      document.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const item = cart.find(i => i.id === id);
          if (item) {
            item.quantity -= 1;
            if (item.quantity <= 0) {
              cart = cart.filter(i => i.id !== id);
            }
            updateCart();
          }
        });
      });

      // Totals calculation
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = Math.round(subtotal * 0.05);
      const grandTotal = subtotal + tax;

      subtotalPriceEl.textContent = `₹${subtotal}`;
      taxPriceEl.textContent = `₹${tax}`;
      grandTotalPriceEl.textContent = `₹${grandTotal}`;
    }
  }

  // WhatsApp Checkout order submit
  btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) return;

    const diningStyle = diningStyleSelect.value;
    let diningDetails = '';
    let detailsStr = '';

    if (diningStyle === 'table-service') {
      const tableNum = document.getElementById('order-table-num').value || 'Unspecified';
      diningDetails = `Table Service (Table: ${tableNum})`;
      detailsStr = `serving directly to Table: ${tableNum}`;
    } else if (diningStyle === 'dine-in') {
      diningDetails = 'Dine-In';
      detailsStr = 'preparing for Dine-In arrival';
    } else {
      diningDetails = 'Takeaway';
      detailsStr = 'preparing for quick Takeaway pickup';
    }

    // Format WhatsApp Message
    let message = `*New Order from Cafe 1010 Website!*\n`;
    message += `---------------------------------\n`;
    message += `*Dining Option:* ${diningDetails}\n\n`;
    message += `*Order Items:*\n`;
    
    cart.forEach(item => {
      message += `• ${item.quantity} x ${item.name} (₹${item.price * item.quantity})\n`;
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + tax;

    message += `\n`;
    message += `*Subtotal:* ₹${subtotal}\n`;
    message += `*GST (5%):* ₹${tax}\n`;
    message += `*Grand Total:* ₹${grandTotal}\n`;
    message += `---------------------------------\n`;
    message += `Please confirm my order. Thank you!`;

    // Construct WhatsApp link
    const whatsappNum = '917414001010'; // Indian country code prefix + owner's number
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    toggleCartDrawer(false);
    showToast(`Redirecting to WhatsApp to send your order...`, 'success');
    
    // Clear cart
    cart = [];
    updateCart();
  });


  // --- 9. CATEGORIES MENU FILTER ---
  const catTabs = document.querySelectorAll('.category-tab');
  const menuItems = document.querySelectorAll('.menu-item-card');

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-category');

      menuItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filter === 'all' || itemCategory === filter) {
          item.style.display = 'flex';
          item.style.animation = 'fadeIn 0.3s ease-out';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });


  // --- 10. CONTACT / VISIT PLANNER MESSAGE ---
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const phone = document.getElementById('contact-phone').value || 'Not provided';
      const userMessage = document.getElementById('contact-message').value;

      // Format WhatsApp Message
      let msgText = `*New Inquiry from Cafe 1010 Website!*\n`;
      msgText += `---------------------------------\n`;
      msgText += `*Name:* ${name}\n`;
      msgText += `*Email:* ${email}\n`;
      msgText += `*Phone:* ${phone}\n\n`;
      msgText += `*Message:*\n${userMessage}\n`;
      msgText += `---------------------------------\n`;

      const whatsappNum = '917414001010';
      const encodedMsg = encodeURIComponent(msgText);
      const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodedMsg}`;

      // Open WhatsApp chat in a new tab
      window.open(whatsappUrl, '_blank');

      contactForm.reset();
      showToast(`Redirecting to WhatsApp to send your message to Cafe 1010...`, 'success');
    });
  }

  // --- ZONE GALLERY LIGHTBOX ---
  const zoneGalleries = {
    rooftop: [
      { src: 'assets/rooftop_1.jpg', alt: 'Maadi Roof Top Terrace Garden View' }
    ],
    dorms: [
      { src: 'assets/dorms.png', alt: 'Bandi Street Dorms' }
    ],
    restaurant: [
      { src: 'assets/restaurant.png', alt: 'Main Restaurant Interior' },
      { src: 'assets/restaurant_1.jpg', alt: 'Cozy Table Seating & Ceiling Lamps' },
      { src: 'assets/restaurant_2.jpg', alt: 'Traditional Bamboo Ceiling Space' },
      { src: 'assets/restaurant_3.jpg', alt: 'Glass Ceiling Dining Archway' },
      { src: 'assets/restaurant_4.jpg', alt: 'Garden View Dining Table' }
    ],
    gazebo: [
      { src: 'assets/gazebo_1.jpg', alt: 'Gajibo - Bamboo Canopy Ceiling & Bougainvillea Garden View' },
      { src: 'assets/gazebo_2.jpg', alt: 'Gajibo Outdoor Wooden Table Seating' },
      { src: 'assets/gazebo_3.jpg', alt: 'Gajibo Roof Structure & Garden View' },
      { src: 'assets/gazebo.png', alt: 'Garden Gazebo Overview' }
    ],
    work: [
      { src: 'assets/hero.png', alt: 'Work from Cafe Spot' }
    ],
    troposphere: [
      { src: 'assets/troposphere_1.jpg', alt: 'Kalpana Chawla Troposphere - Snooker Arena Full Room' },
      { src: 'assets/troposphere_2.jpg', alt: 'Snooker Table & Cue Ball Shot' },
      { src: 'assets/troposphere_3.jpg', alt: 'Close-up Snooker Ball Rack Focus' },
      { src: 'assets/troposphere_4.jpg', alt: 'Vibrant Artwork & Snooker Table Angle' },
      { src: 'assets/snooker.png', alt: 'Snooker Room Overview' }
    ]
  };

  // Trigger initial live photos load
  loadLivePhotos();

  const galleryModal = document.getElementById('gallery-preview-modal');
  const galleryClose = document.getElementById('gallery-preview-close');
  const galleryTitle = document.getElementById('gallery-preview-title');
  const mainImg = document.getElementById('lightbox-main-img');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');
  const thumbContainer = document.getElementById('lightbox-thumbnails');
  
  let currentGallery = [];
  let currentIndex = 0;

  function openGallery(zoneKey, zoneTitle) {
    // Merge all default zone photos to guarantee complete gallery listing
    const defaultZoneItems = DEFAULT_PHOTOS_APP.filter(p => p.placement === zoneKey).map(p => ({
      src: p.src,
      alt: p.title || p.desc || zoneKey
    }));

    if (!zoneGalleries[zoneKey] || zoneGalleries[zoneKey].length < defaultZoneItems.length) {
      const existing = zoneGalleries[zoneKey] || [];
      const uniqueDefaults = defaultZoneItems.filter(d => !existing.some(e => e.src === d.src));
      zoneGalleries[zoneKey] = [...existing, ...uniqueDefaults];
    }
    
    currentGallery = zoneGalleries[zoneKey];
    currentIndex = 0;
    
    galleryTitle.textContent = `${zoneTitle.toUpperCase()} GALLERY`;
    
    // Toggle Next/Prev buttons visibility based on photo count
    if (currentGallery.length > 1) {
      if (lightboxPrevBtn) lightboxPrevBtn.style.display = 'flex';
      if (lightboxNextBtn) lightboxNextBtn.style.display = 'flex';
    } else {
      if (lightboxPrevBtn) lightboxPrevBtn.style.display = 'none';
      if (lightboxNextBtn) lightboxNextBtn.style.display = 'none';
    }

    // Build thumbnails
    thumbContainer.innerHTML = '';
    currentGallery.forEach((photo, idx) => {
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.className = `lightbox-thumb ${idx === 0 ? 'active' : ''}`;
      
      // Accessibility features for thumbnails
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `View image ${idx + 1} of ${currentGallery.length}`);
      
      // Click interaction
      img.addEventListener('click', () => {
        setLightboxPhoto(idx);
      });
      
      // Keyboard interaction (Enter/Space keys)
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setLightboxPhoto(idx);
        }
      });
      
      thumbContainer.appendChild(img);
    });
    
    setLightboxPhoto(0);
    
    galleryModal.classList.add('open');
  }

  function setLightboxPhoto(idx) {
    if (!currentGallery || currentGallery.length === 0) return;
    if (idx < 0) idx = currentGallery.length - 1;
    if (idx >= currentGallery.length) idx = 0;

    currentIndex = idx;
    
    // Instant image update
    mainImg.src = currentGallery[currentIndex].src;
    mainImg.alt = currentGallery[currentIndex].alt;
    mainImg.style.opacity = '1';
    
    // Update thumbnail active state
    const thumbs = thumbContainer.querySelectorAll('.lightbox-thumb');
    thumbs.forEach((thumb, i) => {
      if (i === idx) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  function nextPhoto() {
    let nextIdx = currentIndex + 1;
    if (nextIdx >= currentGallery.length) nextIdx = 0;
    setLightboxPhoto(nextIdx);
  }

  function prevPhoto() {
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = currentGallery.length - 1;
    setLightboxPhoto(prevIdx);
  }

  // Event Listeners for Zone Gallery Buttons
  document.querySelectorAll('.zone-view-gallery-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent triggering parent zone-card clicks
      const zoneKey = btn.getAttribute('data-zone');
      const titleEl = btn.closest('.zone-card').querySelector('h3, h4');
      const zoneTitle = titleEl ? titleEl.textContent : zoneKey;
      openGallery(zoneKey, zoneTitle);
    });
  });

  if (galleryClose) {
    galleryClose.addEventListener('click', () => {
      galleryModal.classList.remove('open');
    });
  }

  if (galleryModal) {
    galleryModal.addEventListener('click', (e) => {
      if (e.target === galleryModal) {
        galleryModal.classList.remove('open');
      }
    });
  }

  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextPhoto);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevPhoto);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (galleryModal && galleryModal.classList.contains('open')) {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') galleryModal.classList.remove('open');
    }
  });

});
