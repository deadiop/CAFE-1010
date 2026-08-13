/**
  Cafe 1010 - Live Admin Dashboard Controller
*/

(function () {
  'use strict';

  const STORAGE_KEY_PHOTOS = 'cafe1010_live_photos_v1';
  const STORAGE_KEY_AUTH = 'cafe1010_admin_auth_session';
  const STORAGE_KEY_PIN = 'cafe1010_admin_pin_v1';
  const DEFAULT_PIN = '1010';
  const SYNC_CHANNEL_NAME = 'cafe1010_live_sync';

  function getAdminPin() {
    return localStorage.getItem(STORAGE_KEY_PIN) || DEFAULT_PIN;
  }

  // Real-time broadcast channel
  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL_NAME) : null;

  // DOM Elements
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const adminPinInput = document.getElementById('admin-pin');
  const btnLogout = document.getElementById('btn-logout');
  const btnChangePin = document.getElementById('btn-change-pin');
  const pinModalOverlay = document.getElementById('pin-modal-overlay');
  const pinModalClose = document.getElementById('pin-modal-close');
  const changePinForm = document.getElementById('change-pin-form');
  const currentPinInput = document.getElementById('current-pin');
  const newPinInput = document.getElementById('new-pin');
  const confirmNewPinInput = document.getElementById('confirm-new-pin');

  // Stats
  const statTotal = document.getElementById('stat-total-photos');
  const statGallery = document.getElementById('stat-gallery-photos');
  const statZone = document.getElementById('stat-zone-photos');

  // Upload Form Elements
  const uploadForm = document.getElementById('upload-photo-form');
  const segFile = document.getElementById('seg-file');
  const segUrl = document.getElementById('seg-url');
  const groupFileInput = document.getElementById('group-file-input');
  const groupUrlInput = document.getElementById('group-url-input');
  const dropZone = document.getElementById('drop-zone');
  const photoFileInput = document.getElementById('photo-file');
  const fileSelectedName = document.getElementById('file-selected-name');
  const photoUrlInput = document.getElementById('photo-url');
  const photoPlacement = document.getElementById('photo-placement');
  const photoTitle = document.getElementById('photo-title');
  const photoDesc = document.getElementById('photo-desc');
  const previewBox = document.getElementById('preview-box');
  const imgPreview = document.getElementById('img-preview');

  // Manager Elements
  const filterTabs = document.getElementById('filter-tabs');
  const photosGrid = document.getElementById('photos-grid');
  const emptyState = document.getElementById('empty-state');
  const btnReset = document.getElementById('btn-reset-photos');

  let currentSourceType = 'file'; // 'file' or 'url'
  let pendingImageDataUrl = '';
  let activeFilter = 'all';

  // --- INITIAL DEFAULT PHOTOS REGISTRY ---
  const DEFAULT_PHOTOS = [
    // Top Hero Banner
    { id: 'def-h1', placement: 'hero', title: 'Garden Courtyard Hero', desc: 'Jodhpur garden escape & signature signpost', src: 'assets/hero_bg.jpg', isCustom: false },

    // Main Gallery
    { id: 'def-g1', placement: 'gallery', title: 'Garden Pathway', desc: 'Cascading pink bougainvillea shade', src: 'assets/garden_bougainvillea.jpg', isCustom: false },
    { id: 'def-g2', placement: 'gallery', title: 'Blue City Courtyard', desc: 'Brick-paved courtyard with blue arches', src: 'assets/courtyard_1.jpg', isCustom: false },
    { id: 'def-g3', placement: 'gallery', title: 'The Signpost to Discovery', desc: 'Vintage direction sign to zones', src: 'assets/signpost.jpg', isCustom: false },
    { id: 'def-g4', placement: 'gallery', title: 'Bougainvillea Canopy', desc: 'Pink blossoms against blue Jodhpur sky', src: 'assets/bougainvillea_close.jpg', isCustom: false },
    { id: 'def-g5', placement: 'gallery', title: 'Sunset Golden Hour', desc: 'Soft sunbeams lighting courtyard seating', src: 'assets/courtyard_2.jpg', isCustom: false },
    { id: 'def-g6', placement: 'gallery', title: 'Heritage Dining Room', desc: 'Atrium dining space with glass roof', src: 'assets/restaurant_3.jpg', isCustom: false },

    // Zones
    { id: 'def-z1', placement: 'rooftop', title: 'Maadi Roof Top', desc: 'Lush greenery, bougainvillea terrace, & outdoor seating', src: 'assets/rooftop_1.jpg', isCustom: false },
    { id: 'def-z2', placement: 'dorms', title: 'Bandi Street Dorm Room Entrance View', desc: 'Full dorm room view showing bed, AC, coffee table & sofa chair', src: 'assets/dorms_1.jpg', isCustom: false },
    { id: 'def-z2b', placement: 'dorms', title: 'Bandi Street Dorm Room Window View', desc: 'Reverse angle showing dorm bed & window curtain', src: 'assets/dorms_2.jpg', isCustom: false },
    { id: 'def-z3', placement: 'restaurant', title: 'Main Restaurant Interior', desc: 'Warm booth seating, wooden dining table, & ambient spotlights', src: 'assets/restaurant_cover.jpg', isCustom: false },
    { id: 'def-z4', placement: 'restaurant', title: 'Cozy Table Seating', desc: 'Warm ceiling lamps & wooden tables', src: 'assets/restaurant_1.jpg', isCustom: false },
    { id: 'def-z5', placement: 'restaurant', title: 'Bamboo Ceiling Dining', desc: 'Traditional rustic bamboo architecture', src: 'assets/restaurant_2.jpg', isCustom: false },
    { id: 'def-z6', placement: 'restaurant', title: 'Glass Roof Atrium', desc: 'Warm ambient globes and white brick walls', src: 'assets/restaurant_3.jpg', isCustom: false },
    { id: 'def-z7', placement: 'restaurant', title: 'Garden View Dining Table', desc: 'Air-conditioned dining facing courtyard', src: 'assets/restaurant_4.jpg', isCustom: false },
    { id: 'def-z8', placement: 'gazebo', title: 'Gajibo Bamboo Canopy View', desc: 'Geometric bamboo ceiling, warm lamps, & bougainvillea garden', src: 'assets/gazebo_1.jpg', isCustom: false },
    { id: 'def-z8b', placement: 'gazebo', title: 'Gajibo Outdoor Table Seating', desc: 'Wooden table seating with pink bougainvillea backdrop', src: 'assets/gazebo_2.jpg', isCustom: false },
    { id: 'def-z8c', placement: 'gazebo', title: 'Gajibo Roof Structure & Garden View', desc: 'Angled bamboo gazebo roof & garden vista', src: 'assets/gazebo_3.jpg', isCustom: false },
    { id: 'def-z9', placement: 'work', title: 'Work From Cafe Co-working Desk', desc: 'Co-working counter desk, laptop setup & charging outlets', src: 'assets/work_1.jpg', isCustom: false },
    { id: 'def-z10', placement: 'troposphere', title: 'Troposphere Snooker Table Focus', desc: 'Green felt, white cue ball, & ambient spotlight wall', src: 'assets/troposphere_cover.jpg', isCustom: false },
    { id: 'def-z11', placement: 'troposphere', title: 'Snooker Table Close-Up', desc: 'Green felt, white cue ball, & rack focus', src: 'assets/troposphere_2.jpg', isCustom: false },
    { id: 'def-z12', placement: 'troposphere', title: 'Cue Ball & Ball Rack Focus', desc: 'Arranged snooker balls & wall frames', src: 'assets/troposphere_3.jpg', isCustom: false },
    { id: 'def-z13', placement: 'troposphere', title: 'Vibrant Wall Artwork Collage', desc: 'Color block wall & snooker arena', src: 'assets/troposphere_4.jpg', isCustom: false },
    { id: 'def-z14', placement: 'troposphere', title: 'Snooker Room Overview', desc: 'Full-sized snooker table flight room', src: 'assets/snooker.png', isCustom: false }
  ];

  function isValidImgSrc(src) {
    if (!src || typeof src !== 'string') return false;
    const s = src.trim();
    return s.startsWith('assets/') || s.startsWith('data:image/') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:');
  }

  // Initialize Data Store with self-healing migration
  function getPhotosStore() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PHOTOS);
      if (stored) {
        let photos = JSON.parse(stored);
        if (Array.isArray(photos) && photos.length > 0) {
          const defaultMap = new Map(DEFAULT_PHOTOS.map(p => [p.id, p]));
          let updated = false;

          // Remove any broken/invalid custom items or old hero custom drafts
          const initialLength = photos.length;
          photos = photos.filter(p => isValidImgSrc(p.src) && !(p.placement === 'hero' && p.isCustom));
          if (photos.length !== initialLength) updated = true;

          photos = photos.map(photo => {
            if (photo.id && (photo.id.startsWith('def-') || defaultMap.has(photo.id))) {
              const latestDef = defaultMap.get(photo.id);
              if (latestDef) {
                updated = true;
                return { ...photo, src: latestDef.src, placement: latestDef.placement, isCustom: false };
              }
            }
            return photo;
          });

          // Ensure all default photos exist if missing
          DEFAULT_PHOTOS.forEach(defItem => {
            if (!photos.some(p => p.id === defItem.id)) {
              photos.push(defItem);
              updated = true;
            }
          });

          if (updated) {
            localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
          }
          return photos;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    // Return default if empty
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(DEFAULT_PHOTOS));
    return DEFAULT_PHOTOS;
  }

  function savePhotosStore(photos) {
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
      notifyLiveSync();
    } catch (e) {
      console.error('Error saving localStorage:', e);
      showToast('Storage limit exceeded. Try using Image URLs instead of large raw files.', 'error');
    }
  }

  function notifyLiveSync() {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'PHOTOS_UPDATED', timestamp: Date.now() });
    }
  }

  // --- AUTHENTICATION & SECURITY ---
  function checkAuth() {
    const session = sessionStorage.getItem(STORAGE_KEY_AUTH);
    if (session === 'authenticated') {
      loginOverlay.classList.add('hidden');
      initDashboard();
    } else {
      loginOverlay.classList.remove('hidden');
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredPin = adminPinInput.value.trim();
    if (enteredPin === getAdminPin()) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'authenticated');
      loginOverlay.classList.add('hidden');
      showToast('Authenticated successfully. Welcome Admin!', 'success');
      initDashboard();
    } else {
      showToast('Invalid Security PIN. Please try again.', 'error');
      adminPinInput.value = '';
      adminPinInput.focus();
    }
  });

  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    loginOverlay.classList.remove('hidden');
    adminPinInput.value = '';
    showToast('Logged out of Admin Dashboard.', 'success');
  });

  // CHANGE PIN MODAL LOGIC
  if (btnChangePin) {
    btnChangePin.addEventListener('click', () => {
      pinModalOverlay.classList.remove('d-none');
      currentPinInput.value = '';
      newPinInput.value = '';
      confirmNewPinInput.value = '';
      currentPinInput.focus();
    });
  }

  if (pinModalClose) {
    pinModalClose.addEventListener('click', () => {
      pinModalOverlay.classList.add('d-none');
    });
  }

  if (changePinForm) {
    changePinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentPin = currentPinInput.value.trim();
      const newPin = newPinInput.value.trim();
      const confirmPin = confirmNewPinInput.value.trim();

      if (currentPin !== getAdminPin()) {
        showToast('Current PIN is incorrect. Please try again.', 'error');
        currentPinInput.value = '';
        currentPinInput.focus();
        return;
      }

      if (newPin.length < 4) {
        showToast('New PIN must be at least 4 characters long.', 'error');
        newPinInput.focus();
        return;
      }

      if (newPin !== confirmPin) {
        showToast('New PIN and Confirm PIN do not match.', 'error');
        confirmNewPinInput.value = '';
        confirmNewPinInput.focus();
        return;
      }

      localStorage.setItem(STORAGE_KEY_PIN, newPin);
      pinModalOverlay.classList.add('d-none');
      changePinForm.reset();
      showToast('Security PIN updated successfully! Your new passcode is active.', 'success');
    });
  }

  // --- DASHBOARD CONTROLLER ---
  function initDashboard() {
    updateStats();
    renderPhotosGrid();
  }

  // Stats Renderer
  function updateStats() {
    const photos = getPhotosStore();
    const total = photos.length;
    const galleryCount = photos.filter(p => p.placement === 'gallery').length;
    const zoneCount = total - galleryCount;

    statTotal.textContent = total;
    statGallery.textContent = galleryCount;
    statZone.textContent = zoneCount;
  }

  // Crop Controls & Mockup DOM Elements
  const cropPositionInput = document.getElementById('crop-position');
  const cropZoomInput = document.getElementById('crop-zoom');
  const zoomValDisplay = document.getElementById('zoom-val-display');
  const mockupBadgeText = document.getElementById('mockup-badge-text');
  const mockupTitle = document.getElementById('mockup-title');
  const mockupDesc = document.getElementById('mockup-desc');
  const previewModeTag = document.getElementById('preview-mode-tag');

  const placementLabels = {
    hero: 'Homepage Top Hero Banner',
    gallery: 'Main Gallery Slider',
    rooftop: 'Maadi Roof Top',
    dorms: 'Bandi Street Dorms',
    restaurant: 'Main Restaurant',
    gazebo: 'Gajibo (Gazebo)',
    work: 'Work From Cafe',
    troposphere: 'Troposphere'
  };

  if (imgPreview) {
    imgPreview.onerror = () => {
      imgPreview.src = 'assets/garden_bougainvillea.jpg';
    };
  }

  // Crop Controls Listeners
  if (cropPositionInput) {
    cropPositionInput.addEventListener('change', () => {
      imgPreview.style.objectPosition = cropPositionInput.value;
    });
  }

  if (cropZoomInput) {
    cropZoomInput.addEventListener('input', () => {
      const zoomVal = cropZoomInput.value;
      zoomValDisplay.textContent = `${zoomVal}%`;
      imgPreview.style.transform = `scale(${zoomVal / 100})`;
    });
  }

  function updateMockupText() {
    const titleVal = photoTitle.value.trim() || 'Cozy Sunset Corner';
    const descVal = photoDesc.value.trim() || 'Warm ambient lighting during golden hour';
    const placementVal = photoPlacement.value;

    if (mockupTitle) mockupTitle.textContent = titleVal;
    if (mockupDesc) mockupDesc.textContent = descVal;
    if (mockupBadgeText) mockupBadgeText.textContent = placementLabels[placementVal] || placementVal;
    if (previewModeTag) {
      previewModeTag.textContent = placementVal === 'gallery' ? 'Gallery Slider Preview' : 'Zone Card Preview';
    }
  }

  [photoTitle, photoDesc, photoPlacement].forEach(el => {
    if (el) el.addEventListener('input', updateMockupText);
    if (el) el.addEventListener('change', updateMockupText);
  });

  // Source Type Switcher
  segFile.addEventListener('click', () => {
    currentSourceType = 'file';
    segFile.classList.add('active');
    segUrl.classList.remove('active');
    groupFileInput.classList.remove('d-none');
    groupUrlInput.classList.add('d-none');
    checkPreview();
  });

  segUrl.addEventListener('click', () => {
    currentSourceType = 'url';
    segUrl.classList.add('active');
    segFile.classList.remove('active');
    groupUrlInput.classList.remove('d-none');
    groupFileInput.classList.add('d-none');
    checkPreview();
  });

  // File Upload Reader
  photoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image file is too large. Please select an image under 8MB.', 'error');
        photoFileInput.value = '';
        return;
      }
      fileSelectedName.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      const reader = new FileReader();
      reader.onload = (event) => {
        const tempImg = new Image();
        tempImg.onload = () => {
          const maxDim = 1600;
          let width = tempImg.width;
          let height = tempImg.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(tempImg, 0, 0, width, height);

          pendingImageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          imgPreview.src = pendingImageDataUrl;
          updateMockupText();
          previewBox.classList.remove('d-none');
        };
        tempImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      fileSelectedName.textContent = '';
      pendingImageDataUrl = '';
      previewBox.classList.add('d-none');
    }
  });

  // URL Input Change
  photoUrlInput.addEventListener('input', () => {
    checkPreview();
  });

  function checkPreview() {
    let src = '';
    if (currentSourceType === 'file' && pendingImageDataUrl) {
      src = pendingImageDataUrl;
    } else if (currentSourceType === 'url' && photoUrlInput.value.trim()) {
      src = photoUrlInput.value.trim();
    }
    
    if (src) {
      imgPreview.src = src;
    } else {
      // Sample site image so the card mockup preview is never blank
      imgPreview.src = 'assets/garden_bougainvillea.jpg';
    }
    updateMockupText();
    previewBox.classList.remove('d-none');
  }

  // Auto-trigger initial preview on load
  checkPreview();

  // Submit New Photo Form
  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let imageSrc = '';
    if (currentSourceType === 'file') {
      if (!pendingImageDataUrl) {
        showToast('Please select an image file to upload.', 'error');
        return;
      }
      imageSrc = pendingImageDataUrl;
    } else {
      const urlVal = photoUrlInput.value.trim();
      if (!urlVal) {
        showToast('Please paste a valid image URL.', 'error');
        return;
      }
      imageSrc = urlVal;
    }

    const titleVal = photoTitle.value.trim();
    const descVal = photoDesc.value.trim();
    const placementVal = photoPlacement.value;

    if (!titleVal) {
      showToast('Please provide a title for the photo.', 'error');
      return;
    }

    const newPhoto = {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      placement: placementVal,
      title: titleVal,
      desc: descVal || titleVal,
      src: imageSrc,
      cropPosition: cropPositionInput ? cropPositionInput.value : 'center center',
      cropZoom: cropZoomInput ? parseInt(cropZoomInput.value, 10) : 100,
      isCustom: true,
      timestamp: Date.now()
    };

    const photos = getPhotosStore();
    photos.unshift(newPhoto); // Add to beginning
    savePhotosStore(photos);

    // Reset Form & Crop Inputs
    uploadForm.reset();
    if (cropPositionInput) cropPositionInput.value = 'center center';
    if (cropZoomInput) cropZoomInput.value = 100;
    if (zoomValDisplay) zoomValDisplay.textContent = '100%';
    imgPreview.style.objectPosition = 'center center';
    imgPreview.style.transform = 'none';

    pendingImageDataUrl = '';
    fileSelectedName.textContent = '';
    previewBox.classList.add('d-none');

    showToast(`Published "${titleVal}" live! Dynamic site updated.`, 'success');
    updateStats();
    renderPhotosGrid();
  });

  // Filter Tabs Handler
  filterTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      const tabs = filterTabs.querySelectorAll('.tab-btn');
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      renderPhotosGrid();
    }
  });

  // Render Photos Grid
  function renderPhotosGrid() {
    const photos = getPhotosStore();
    let filtered = photos;
    if (activeFilter !== 'all') {
      filtered = photos.filter(p => p.placement === activeFilter);
    }

    photosGrid.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('d-none');
    } else {
      emptyState.classList.add('d-none');
      filtered.forEach(photo => {
        const card = createPhotoCard(photo);
        photosGrid.appendChild(card);
      });
    }
  }

  // Create Photo Card DOM Element
  function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const placementNames = {
      hero: 'Hero Banner',
      gallery: 'Main Gallery',
      rooftop: 'Rooftop',
      dorms: 'Dorms',
      restaurant: 'Restaurant',
      gazebo: 'Gazebo',
      work: 'Work',
      troposphere: 'Troposphere'
    };

    const placementLabel = placementNames[photo.placement] || photo.placement;
    const allPhotos = getPhotosStore();
    const sameZonePhotos = allPhotos.filter(p => p.placement === photo.placement);
    const isFrontCover = (sameZonePhotos.length > 0 && sameZonePhotos[0].id === photo.id && photo.placement !== 'gallery');

    card.innerHTML = `
      <div class="photo-thumb-wrap">
        <img src="${photo.src}" alt="${escapeHtml(photo.title)}" loading="lazy">
        <span class="placement-tag">${placementLabel}</span>
        ${photo.isCustom ? '<span class="custom-badge">NEW</span>' : ''}
        ${isFrontCover ? '<span class="cover-badge">FRONT COVER</span>' : ''}
      </div>
      <div class="photo-card-body">
        <div>
          <h3 class="photo-card-title">${escapeHtml(photo.title)}</h3>
          <p class="photo-card-date">${photo.desc ? escapeHtml(photo.desc) : 'No description'}</p>
        </div>
        <div class="photo-card-actions">
          ${photo.placement !== 'gallery' ? `
            <button class="btn-cover-photo ${isFrontCover ? 'active' : ''}" data-id="${photo.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${isFrontCover ? '✓ Main Cover Photo' : 'Make Front Cover'}
            </button>
          ` : ''}
          <button class="btn-delete-photo" data-id="${photo.id}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete Photo
          </button>
        </div>
      </div>
    `;

    const cardImg = card.querySelector('.photo-thumb-wrap img');
    if (cardImg) {
      cardImg.onerror = function() {
        this.onerror = null;
        this.src = 'assets/courtyard_1.jpg';
      };
    }

    const btnCover = card.querySelector('.btn-cover-photo');
    if (btnCover) {
      btnCover.addEventListener('click', () => {
        setAsFrontCover(photo.id, photo.placement, photo.title);
      });
    }

    const btnDelete = card.querySelector('.btn-delete-photo');
    btnDelete.addEventListener('click', () => {
      deletePhoto(photo.id, photo.title);
    });

    return card;
  }

  // Set as Front Cover Photo
  function setAsFrontCover(id, placement, title) {
    let photos = getPhotosStore();
    const photoIndex = photos.findIndex(p => p.id === id);
    if (photoIndex > -1) {
      const [targetPhoto] = photos.splice(photoIndex, 1);
      // Find index of first photo with same placement
      const firstSamePlacementIndex = photos.findIndex(p => p.placement === placement);
      if (firstSamePlacementIndex > -1) {
        photos.splice(firstSamePlacementIndex, 0, targetPhoto);
      } else {
        photos.unshift(targetPhoto);
      }
      savePhotosStore(photos);
      showToast(`Set "${title}" as front cover picture! Live site updated.`, 'success');
      renderPhotosGrid();
    }
  }

  // Delete Photo Action
  function deletePhoto(id, title) {
    if (confirm(`Are you sure you want to remove "${title}" from the live website?`)) {
      let photos = getPhotosStore();
      photos = photos.filter(p => p.id !== id);
      savePhotosStore(photos);
      showToast(`Removed "${title}" from live website.`, 'success');
      updateStats();
      renderPhotosGrid();
    }
  }

  // Reset to Defaults
  btnReset.addEventListener('click', () => {
    if (confirm('Reset all photos to original site defaults? Any custom added photos will be removed.')) {
      savePhotosStore(DEFAULT_PHOTOS);
      showToast('Photos reset to default site assets.', 'success');
      updateStats();
      renderPhotosGrid();
    }
  });

  // Helper Toast Alerts
  function showToast(message, type = 'info') {
    const container = document.getElementById('admin-toast-container');
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initialize Check on Script Execution
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
  });

})();
