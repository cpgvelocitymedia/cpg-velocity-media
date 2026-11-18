/* CPG Velocity — interactions */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'hello@cpgvelocitymedia.com';

  /* ---------- Client reel: accessible, user-controlled motion ---------- */
  var brandReelTrack = document.getElementById('brandReelTrack');
  var brandReelToggle = document.getElementById('brandReelToggle');
  if (brandReelTrack && brandReelToggle) {
    var brandReelClone = brandReelTrack.querySelector('ul').cloneNode(true);
    brandReelClone.setAttribute('aria-hidden', 'true');
    brandReelClone.setAttribute('inert', '');
    brandReelClone.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
    brandReelTrack.appendChild(brandReelClone);
    brandReelToggle.addEventListener('click', function () {
      var paused = brandReelToggle.getAttribute('aria-pressed') !== 'true';
      brandReelToggle.setAttribute('aria-pressed', String(paused));
      brandReelToggle.textContent = paused ? 'Play reel' : 'Pause reel';
      brandReelTrack.closest('.brand-reel').classList.toggle('is-paused', paused);
    });
  }

  /* ---------- Rail menu + overlay ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var overlay = document.getElementById('overlay');
  var overlayOpen = false;
  var overlayTimer = null;

  function setOverlay(open) {
    overlayOpen = open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (overlayTimer) { clearTimeout(overlayTimer); overlayTimer = null; }
    if (open) {
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add('overlay--open'); overlay.querySelector('a').focus({preventScroll:true}); });
    } else {
      overlay.classList.remove('overlay--open');
      overlayTimer = setTimeout(function () {
        if (!overlayOpen) overlay.hidden = true;
        overlayTimer = null;
      }, 320);
    }
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuToggle.addEventListener('click', function () { setOverlay(!overlayOpen); });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.closest('a')) setOverlay(false);
  });
  document.querySelectorAll('.site-header a').forEach(function (link) {
    link.addEventListener('click', function () { if (overlayOpen) setOverlay(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlayOpen) { setOverlay(false); menuToggle.focus(); }
    if (e.key === 'Tab' && overlayOpen) {
      var focusables = [menuToggle].concat(Array.from(overlay.querySelectorAll('a,button,input,select,textarea')).filter(function (el) { return !el.disabled; }));
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Visible section toolbar ---------- */
  var railLinks = Array.from(document.querySelectorAll('.rail__link, .overlay__nav a[href^="#"]'));
  var railTargets = Array.from(document.querySelectorAll('main>section[id]'));
  var railCurrent = '';
  var railTick = false;
  function updateRailLocation() {
    railTick = false;
    var id = 'overview';
    var marker = window.innerHeight * .3;
    railTargets.forEach(function (target) {
      if (target && target.getBoundingClientRect().top <= marker) id = target.id;
    });
    if (id === railCurrent) return;
    railCurrent = id;
    railLinks.forEach(function (link) {
      var active = link.getAttribute('href') === '#' + id;
      if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (!railTick) { railTick = true; requestAnimationFrame(updateRailLocation); }
  }, {passive:true});
  window.addEventListener('resize', function () {
    updateRailLocation();
  });
  updateRailLocation();

  /* ---------- Marquee: duplicate list for seamless loop ---------- */
  var track = document.getElementById('marqueeTrack');
  if (track) {
    var list = track.querySelector('ul');
    var clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  /* ---------- Count-up numbers ---------- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1400;
    var start = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = (target * easeOut(p)).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counted = new WeakSet();
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !counted.has(entry.target)) {
        counted.add(entry.target);
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.count').forEach(function (el) { countObserver.observe(el); });

  /* ---------- Comparison bars ---------- */
  var barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var fills = entry.target.querySelectorAll('.bar__fill');
        fills.forEach(function (fill, i) {
          setTimeout(function () { fill.style.width = fill.dataset.width + '%'; }, i * 180);
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.compare').forEach(function (c) { barObserver.observe(c); });

  /* ---------- Brand identity wizard ---------- */
  var STYLES = {
    editorial: { name: 'Editorial & warm', palette: ['#f2ead9', '#d9c7a7', '#6b4f3a', '#2a2118'] },
    bold: { name: 'Bold & loud', palette: ['#111111', '#f5f30f', '#ff3b1f', '#ffffff'] },
    minimal: { name: 'Minimal & premium', palette: ['#ffffff', '#e8e8e8', '#b9b9b9', '#1a1a1a'] },
    playful: { name: 'Playful & punchy', palette: ['#ffd23f', '#ff6b5e', '#1f41bb', '#ffffff'] },
    dark: { name: 'Dark & cinematic', palette: ['#120d0a', '#8a5a2e', '#d99a4e', '#f3e2c7'] },
    clean: { name: 'Clean & clinical', palette: ['#eef1f4', '#c6cfd8', '#5d7185', '#1c2733'] },
  };

  var wizardEl = document.getElementById('wizard');
  var wizState = { step: 1, style: null, identityBrief: null, imageName: null };
  var identitySummary = ''; // feeds into the intake brief
  var importedColors = [];
  var urlField = document.getElementById('wUrl');
  var importBtn = document.getElementById('importBrand');
  var importStatus = document.getElementById('importStatus');
  var importTimer;
  var importController;
  var importedURL = '';
  var importSequence = 0;
  var websiteVisual = '';
  var selectedProductSource = '';
  // Some brand sites refuse to let other websites show their photos; retry those through our image relay.
  function relayImageURL(src) {
    return /^https?:\/\//i.test(src) ? String(window.__API_BASE__ || '').replace(/\/$/, '') + '/api/image?u=' + encodeURIComponent(src) : '';
  }
  var visualSequence = 0;
  function showWebsiteVisual(data) {
    var visualRequest = ++visualSequence;
    websiteVisual = '';
    selectedProductSource = data.product_source || '';
    var container = document.getElementById('websiteProduct');
    container.hidden = true;
    if (!data.image) {
      updateProductPreviews();
      renderProductLook();
      return;
    }
    var productImage = document.getElementById('websiteProductImage');
    productImage.onload = function () {
      if (visualRequest !== visualSequence) return;
      websiteVisual = productImage.dataset.relayed ? productImage.src : data.image;
      container.hidden = false;
      productImage.alt = (data.product || 'Product') + ' selected product image';
      document.getElementById('websiteProductLabel').textContent = data.image_kind === 'product' ? data.product || 'Product found' : 'Website visual found';
      document.getElementById('websiteProductNote').textContent = 'This product image is used in your style previews. Upload a different product-only photo below if needed.';
      document.getElementById('websiteProductSource').href = data.product_source || data.url;
      updateProductPreviews();
      renderProductLook();
    };
    productImage.onerror = function () {
      if (visualRequest !== visualSequence) return;
      var relayed = relayImageURL(data.image);
      if (!productImage.dataset.relayed && relayed) { productImage.dataset.relayed = '1'; productImage.src = relayed; return; }
      websiteVisual = '';
      container.hidden = true;
      importStatus.textContent = 'Product found, but its image could not load. Choose another product or upload a product photo.';
      updateProductPreviews();
      renderProductLook();
    };
    delete productImage.dataset.relayed;
    productImage.src = data.image;
  }
  function useProductImage(images, data) {
    var image = data.image_kind === 'product' ? data.image || images[0] || '' : '';
    showWebsiteVisual(Object.assign({}, data, {image: image}));
  }
  function renderDetectedProducts(products, selectedName) {
    var panel = document.getElementById('detectedProducts');
    var grid = document.getElementById('detectedProductsGrid');
    grid.replaceChildren();
    document.getElementById('productSearch').value = '';
    document.getElementById('productSearchEmpty').hidden = true;
    panel.hidden = !products.length;
    document.getElementById('detectedProductsLabel').textContent = products.length + ' product' + (products.length === 1 ? '' : 's') + ' found. Choose one for your creative.';
    products.forEach(function (product) {
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'product-choice';
      button.dataset.productName = product.name.toLowerCase();
      button.setAttribute('aria-pressed', String(product.name === selectedName));
      if (product.image) {
        var image = document.createElement('img'); image.src = product.image; image.alt = product.name; image.loading = 'lazy';
        image.onerror = function () { var r = relayImageURL(product.image); if (!image.dataset.relayed && r) { image.dataset.relayed = '1'; image.src = r; } else image.hidden = true; };
        button.appendChild(image);
      }
      var label = document.createElement('span'); label.textContent = product.name; button.appendChild(label);
      var imageCount = document.createElement('small');
      var count = (product.images || (product.image ? [product.image] : [])).length;
      imageCount.textContent = count ? 'Select this product' : 'Product photo needed';
      button.appendChild(imageCount);
      button.addEventListener('click', function () {
        grid.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        button.setAttribute('aria-pressed', 'true');
        document.getElementById('wProduct').value = product.name;
        wImage.value = ''; uploadPreview.hidden = true; wizState.imageName = null;
        useProductImage(product.images || [product.image], {image_kind: 'product', product: product.name, product_source: product.url});
        importStatus.textContent = count ? 'Product selected. Its product image will be used in your visual styles.' : 'Product selected. No clear product image was identified; upload a product-only photo below.';
      });
      grid.appendChild(button);
    });
  }
  document.getElementById('productSearch').addEventListener('input', function () {
    var query = this.value.trim().toLowerCase();
    var matches = 0;
    document.querySelectorAll('.product-choice').forEach(function (button) {
      button.hidden = !button.dataset.productName.includes(query);
      if (!button.hidden) matches++;
    });
    document.getElementById('productSearchEmpty').hidden = matches !== 0;
  });
  function productVisual() {
    return (uploadPreview && !uploadPreview.hidden && uploadPreview.querySelector('img').src) || websiteVisual || '';
  }
  function updateProductPreviews() {
    var visual = productVisual();
    document.querySelectorAll('.template-image').forEach(function (img) {
      img.hidden = !visual;
      if (visual) img.src = visual; else img.removeAttribute('src');
    });
  }
  function selectedPalette() {
    var mode = document.getElementById('aestheticPalette').value;
    if (mode === 'mono') return ['#f2ede2', '#d9d5cc', '#6a6861', '#171715'];
    if (mode === 'brand' && document.getElementById('useImportedColors').checked && importedColors.length) return importedColors;
    return STYLES[wizState.style || 'editorial'].palette;
  }
  function renderProductLook() {
    if (!wizState.style) return;
    var holder = document.getElementById('aestheticSequence');
    holder.replaceChildren();
    var palette = selectedPalette();
    var brand = document.getElementById('wBrand').value || 'Your brand';
    var product = document.getElementById('wProduct').value || 'Your product';
    var type = document.getElementById('aestheticType').value;
    if (type === 'template') type = ['editorial', 'dark'].includes(wizState.style) ? 'serif' : ['minimal', 'clean'].includes(wizState.style) ? 'sans' : 'display';
    var lighting = document.getElementById('aestheticLighting').value;
    var texture = document.getElementById('aestheticTexture').value;
    var composition = document.getElementById('aestheticComposition').value;
    var captions = [product];
    palette = palette.concat(palette, palette);
    captions.forEach(function (caption, index) {
      var frame = document.createElement('article');
      frame.className = 'sequence-frame product-look';
      frame.dataset.type = type; frame.dataset.light = lighting;
      frame.dataset.texture = texture; frame.dataset.composition = composition;
      var background = palette[index];
      frame.style.backgroundColor = background;
      var rgb = background.slice(1).match(/.{2}/g).map(function (part) { return parseInt(part, 16) / 255; });
      var luminance = rgb.map(function (value) { return value <= .04045 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4); });
      var light = .2126*luminance[0] + .7152*luminance[1] + .0722*luminance[2];
      frame.style.color = light > .179 ? '#111111' : '#ffffff';
      var label = document.createElement('span'); label.className = 'sequence-label'; label.textContent = brand;
      var image = document.createElement('img'); image.alt = product + ' in ' + STYLES[wizState.style].name + ' style'; image.className = 'sequence-image';
      if (productVisual()) image.src = productVisual(); else image.hidden = true;
      var heading = document.createElement('h4'); heading.textContent = caption;
      var footer = document.createElement('span'); footer.className = 'sequence-footer'; footer.textContent = productVisual() ? STYLES[wizState.style].name : 'Upload a product photo to preview your item';
      frame.append(label, image, heading, footer);
      holder.appendChild(frame);
    });
  }
  document.querySelectorAll('.direction-controls select').forEach(function (control) {
    control.addEventListener('change', function () {
      if (control.id === 'aestheticPalette') document.getElementById('useImportedColors').checked = control.value === 'brand';
      renderProductLook();
    });
  });
  document.getElementById('useImportedColors').addEventListener('change', function () {
    document.getElementById('aestheticPalette').value = this.checked ? 'brand' : 'template';
    renderProductLook();
  });
  function resetImportedColors() {
    importedColors = [];
    document.getElementById('importColors').hidden = true;
    document.getElementById('importSwatches').replaceChildren();
  }
  // Browser-side Shopify reader: storefronts allow cross-origin reads of their public
  // catalog, and requests from the visitor's browser are not rate-limited like shared hosting.
  async function shopifyImport(parsed, signal) {
    var origin = parsed.protocol + '//' + parsed.hostname;
    var ctrl = new AbortController();
    var stop = setTimeout(function () { ctrl.abort(); }, 9000);
    var onAbort = function () { ctrl.abort(); };
    signal.addEventListener('abort', onAbort);
    function getJSON(path) {
      return fetch(origin + path, { signal: ctrl.signal, credentials: 'omit', mode: 'cors' })
        .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    try {
      var results = await Promise.all([getJSON('/products.json?limit=60'), getJSON('/meta.json')]);
      var list = results[0] && Array.isArray(results[0].products) ? results[0].products : null;
      if (!list || !list.length) return null;
      var meta = results[1] || {};
      var seen = {};
      var products = list.filter(function (p) {
        var key = (p.title || '').trim().toLowerCase();
        if (!key || seen[key] || /gift card|e-?gift|shipping protection|route package|insurance|\b(hats?|caps?|beanies?|tees?|t-shirts?|shirts?|hoodies?|sweatshirts?|crewnecks?|quarter zip|qtr zip|long sleeve|socks?|bras?|scrunchies?|stickers?|totes?|tote bag|mugs?|tumblers?|keychains?|key chains?|luggage tags?|pins?|patch|apparel|merch|swag|poster|bandana|jacket|shorts|leggings|candle|sweaters?|sunglasses|floaties?|ice trays?|towels?|blankets?|umbrellas?|lanyards?|koozies?|coozies?|can coolers?|notebooks?)\b/i.test(key)) return false;
        seen[key] = true; return true;
      }).slice(0, 24).map(function (p) {
        var images = (p.images || []).map(function (i) { return i.src; }).filter(Boolean).slice(0, 6);
        return { name: p.title.trim(), image: images[0] || '', images: images, url: origin + '/products/' + p.handle, handle: p.handle };
      });
      if (!products.length) return null;
      products = products.filter(function (p) { return p.image; }).concat(products.filter(function (p) { return !p.image; }));
      var handleMatch = parsed.pathname.match(/\/products\/([^\/?#]+)/);
      var chosen = handleMatch ? products.find(function (p) { return p.handle === decodeURIComponent(handleMatch[1]); }) : null;
      return {
        brand: (meta.name || '').trim() || parsed.hostname.replace(/^www\./, '').split('.')[0],
        product: chosen ? chosen.name : '',
        description: (meta.description || '').trim(),
        colors: [],
        products: products,
        images: chosen ? chosen.images : [],
        image: chosen ? chosen.image : '',
        image_kind: 'product',
        product_source: chosen ? chosen.url : '',
        url: origin
      };
    } finally {
      clearTimeout(stop);
      signal.removeEventListener('abort', onAbort);
    }
  }
  async function importWebsite(force) {
    var url = urlField.value.trim();
    if (!force && (!url || url === importedURL)) return;
    try {
      var parsed = new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url);
      if (!parsed.hostname.includes('.') || !/^https?:$/.test(parsed.protocol)) throw new Error('Invalid URL');
    } catch (e) {
      if (force) {
        importStatus.textContent = 'Enter a public website address, such as yourbrand.com, then try again.';
        importStatus.dataset.state = 'error';
        urlField.focus();
      }
      return;
    }
    if (importController) importController.abort();
    var sequence = ++importSequence;
    importController = new AbortController();
    var timedOut = false;
    var importTimeout = setTimeout(function () {
      if (sequence === importSequence) { timedOut = true; importController.abort(); }
    }, 45000);
    importBtn.disabled = true;
    importBtn.textContent = 'Reading…';
    importStatus.textContent = 'Reading your website. You can keep editing while we work.';
    importStatus.dataset.state = 'loading';
    if (url !== importedURL) {
      renderDetectedProducts([], '');
      useProductImage([], {});
    }
    var before = {};
    ['wBrand', 'wProduct', 'wDescription'].forEach(function (id) { before[id] = document.getElementById(id).value; });
    try {
      var base = typeof window.__API_BASE__ === 'string' ? window.__API_BASE__ : '';
      if (base.startsWith('__PORT_')) {
        if (!['127.0.0.1', 'localhost'].includes(location.hostname)) throw new Error('Website import is temporarily unavailable. Please enter your details manually.');
        base = 'http://127.0.0.1:8000';
      }
      var data = await shopifyImport(new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url), importController.signal);
      if (!data) {
        var response = await fetch(base.replace(/\/$/, '') + '/api/import-brand', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url }), signal: importController.signal,
          credentials: 'same-origin'
        });
        var contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('The website reader is temporarily unavailable. Try again, or add your product details manually.');
        data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'We could not read that website.');
      }
      if (sequence !== importSequence || urlField.value.trim() !== url) return;
      [['wBrand', data.brand], ['wProduct', data.product], ['wDescription', data.description]].forEach(function (pair) {
        var field = document.getElementById(pair[0]);
        if (pair[1] && field.value === before[pair[0]]) field.value = pair[1];
      });
      resetImportedColors();
      importedColors = data.colors || [];
      if (importedColors.length) {
        document.getElementById('importColors').hidden = false;
        importedColors.forEach(function (color) {
          var swatch = document.createElement('i');
          swatch.style.background = color;
          swatch.style.border = '1px solid rgba(0,0,0,.16)';
          swatch.title = color;
          document.getElementById('importSwatches').appendChild(swatch);
        });
      }
      importedURL = url;
      renderDetectedProducts(data.products || [], data.product);
      useProductImage(data.images || (data.image ? [data.image] : []), data);
      if (data.products && data.products.length && !data.product && document.getElementById('wProduct').value === before.wProduct) document.getElementById('wProduct').value = '';
      var checked = data._import && data._import.from_cache
        ? 'Website info checked ' + new Date(data._import.checked_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + '. '
        : '';
      var refreshNote = data._import && data._import.live_refresh_failed ? 'Live update unavailable. ' : '';
      importStatus.textContent = refreshNote + checked + (data.products && data.products.length && !data.product ? 'Website imported. Choose the product you want to use below.' : data.product ? 'Product found. Its product photo will be used for your style previews.' : 'Brand details imported. No identifiable products were found. Try a product-page URL or upload a product-only photo.');
      importStatus.dataset.state = 'success';
      document.querySelectorAll('.template-brand').forEach(function (el) { el.textContent = document.getElementById('wBrand').value || 'Your brand'; });
    } catch (error) {
      if (error.name === 'AbortError' && !timedOut) return;
      importStatus.textContent = timedOut ? 'This website is taking too long to respond. Try a direct product-page address, or add your product manually.' : error instanceof TypeError ? 'Could not connect to the website reader. Try again, or add your product details manually.' : error.message || 'Could not read this website. You can still enter your details manually.';
      importStatus.dataset.state = 'error';
    } finally {
      clearTimeout(importTimeout);
      if (sequence === importSequence) { importBtn.disabled = false; importBtn.textContent = 'Find your products'; }
    }
  }
  importBtn.addEventListener('click', function () { importWebsite(true); });
  urlField.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); clearTimeout(importTimer); importWebsite(true); }
  });
  document.getElementById('wBrand').addEventListener('input', function () {
    var name = this.value || 'Your brand';
    document.querySelectorAll('.template-brand').forEach(function (el) { el.textContent = name; });
    renderProductLook();
  });
  urlField.addEventListener('input', function () {
    clearTimeout(importTimer);
    if (importController) importController.abort();
    importTimer = setTimeout(function () { importWebsite(false); }, 1200);
  });
  urlField.addEventListener('change', function () { clearTimeout(importTimer); importWebsite(false); });

  // The same sample content is art-directed six ways so the layout is comparable.
  document.querySelectorAll('.style-card__preview').forEach(function (preview) {
    var image = document.createElement('img');
    image.hidden = true; image.alt = ''; image.loading = 'lazy';
    image.className = 'template-image';
    preview.prepend(image);
    var brand = document.createElement('span');
    brand.className = 'template-brand'; brand.textContent = 'Your brand';
    preview.prepend(brand);
    var footer = document.createElement('span');
    footer.className = 'template-footer'; footer.textContent = 'A fresh point of view. / Discover more ↗';
    preview.appendChild(footer);
  });

  // Product image upload preview
  var wImage = document.getElementById('wImage');
  var uploadPreview = document.getElementById('uploadPreview');
  if (wImage) {
    wImage.addEventListener('change', function () {
      var file = wImage.files && wImage.files[0];
      if (!file) { uploadPreview.hidden = true; wizState.imageName = null; return; }
      wizState.imageName = file.name;
      var reader = new FileReader();
      reader.onload = function () {
        uploadPreview.querySelector('img').src = reader.result;
        uploadPreview.hidden = false;
        updateProductPreviews();
        renderProductLook();
      };
      reader.readAsDataURL(file);
    });
    document.getElementById('uploadRemove').addEventListener('click', function () {
      wImage.value = '';
      wizState.imageName = null;
      uploadPreview.hidden = true;
      updateProductPreviews();
      updateProductPreviews();
      renderProductLook();
    });
  }

  if (wizardEl) {
    // One onboarding journey: project/contact details finish the identity flow.
    var intakeSection = document.getElementById('intake');
    wizardEl.querySelector('[data-panel="4"]').appendChild(intakeSection);
    intakeSection.hidden = false;
    var intakeForm = document.getElementById('intakeForm');
    intakeForm.insertBefore(intakeForm.querySelector('.onboarding-contact-fields'), intakeForm.querySelector('#intakeError'));
    var panels = Array.prototype.slice.call(wizardEl.querySelectorAll('.wizard__panel'));
    var progressItems = Array.prototype.slice.call(wizardEl.querySelectorAll('.wizard__progress li'));
    var backBtn = document.getElementById('wizBack');
    var nextBtn = document.getElementById('wizNext');
    var wizErr = document.getElementById('wizErr');

    function chipValues(group) {
      return Array.prototype.slice.call(group.querySelectorAll('.chip[aria-pressed="true"]')).map(function (c) {
        return c.textContent.trim();
      });
    }

    function showStep(n) {
      wizState.step = n;
      wizardEl.querySelector('.wizard__nav').hidden = false;
      wizardEl.querySelector('.onboarding-finish').hidden = false;
      document.getElementById('templateDetail').hidden = n !== 3 || !wizState.style;
      if (n === 3) document.querySelectorAll('.template-brand').forEach(function (el) { el.textContent = document.getElementById('wBrand').value || 'Your brand'; });
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== String(n); });
      progressItems.forEach(function (li) {
        var s = parseInt(li.dataset.step, 10);
        li.classList.toggle('is-current', s === n);
        li.classList.toggle('is-done', s < n);
      });
      backBtn.hidden = n === 1 || n === 4;
      nextBtn.hidden = n === 4;
      nextBtn.textContent = 'Continue';
      if (n === 4) {
        document.getElementById('fBrand').value = document.getElementById('wBrand').value.trim();
        document.getElementById('fCategory').value = document.getElementById('wCategory2').value;
        document.getElementById('intakeForm').hidden = false;
        document.getElementById('intakeResult').hidden = true;
      }
      backBtn.textContent = n === 4 ? 'Edit your look' : 'Back';
      wizErr.hidden = true;
    }

    function buildKit() {
      var brand = document.getElementById('wBrand').value.trim() || 'Your Brand';
      var url = document.getElementById('wUrl').value.trim();
      var product = document.getElementById('wProduct').value.trim();
      var category = document.getElementById('wCategory2').value;
      var audience = document.getElementById('wAudience').value.trim();
      var tone = chipValues(document.querySelector('[aria-label="Tone of voice"]'));
      var keywords = chipValues(document.querySelector('[aria-label="Style keywords"]'));
      var style = STYLES[wizState.style];
      var palette = selectedPalette();
      var description = document.getElementById('wDescription').value.trim();
      var directionRows = Array.prototype.map.call(document.querySelectorAll('.direction-controls select'), function (select) {
        return [document.querySelector('label[for="' + select.id + '"]').textContent, select.options[select.selectedIndex].textContent];
      });

      // Brief text
      var brief = 'BRAND IDENTITY KIT — ' + brand + '\n\n' +
        'Website: ' + (url || '—') + '\n' +
        'Featured product: ' + (product || '—') + '\n' +
        'Brand overview: ' + (description || '—') + '\n' +
        'Product image: ' + (wizState.imageName || websiteVisual || 'No product image supplied') + '\n' +
        'Product page: ' + (selectedProductSource || 'Not supplied') + '\n' +
        'Category: ' + category + '\n' +
        'Audience: ' + (audience || '—') + '\n' +
        'Tone of voice: ' + (tone.length ? tone.join(', ') : '—') + '\n' +
        'Style keywords: ' + (keywords.length ? keywords.join(', ') : '—') + '\n' +
        'Design style: ' + style.name + '\n' +
        'Palette: ' + palette.join(' · ') + '\n' +
        directionRows.map(function (row) { return row[0] + ': ' + row[1]; }).join('\n');

      identitySummary = brief;

    }

    nextBtn.addEventListener('click', function () {
      wizErr.hidden = true;
      if (wizState.step === 1) {
        if (!document.getElementById('wBrand').value.trim()) {
          wizErr.textContent = 'Please add your brand name to continue.';
          wizErr.hidden = false;
          document.getElementById('wBrand').focus();
          return;
        }
        showStep(2);
      } else if (wizState.step === 2) {
        showStep(3);
      } else if (wizState.step === 3) {
        if (!wizState.style) {
          wizErr.textContent = 'Pick a design style to continue.';
          wizErr.hidden = false;
          return;
        }
        buildKit();
        showStep(4);
      } else {
        // Start over — reset fields manually (container is a div, not a form)
        ['wUrl', 'wBrand', 'wProduct', 'wAudience', 'wDescription'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = '';
        });
        var imgInput = document.getElementById('wImage');
        if (imgInput) imgInput.value = '';
        if (uploadPreview) uploadPreview.hidden = true;
        wizState.style = null;
        wizState.imageName = null;
        document.querySelectorAll('.style-card').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        document.querySelectorAll('#wizard .chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        identitySummary = '';
        resetImportedColors();
        websiteVisual = '';
        selectedProductSource = '';
        renderDetectedProducts([], '');
        useProductImage([], {});
        document.getElementById('websiteProduct').hidden = true;
        document.querySelectorAll('.direction-controls select').forEach(function (select) { select.selectedIndex = 0; });
        document.querySelectorAll('.template-image').forEach(function (img) { img.src = 'assets/pizza-case.webp'; });
        importedURL = '';
        importStatus.textContent = 'Enter your website to identify its products. Select the item you want to use for your creative.';
        showStep(1);
      }
    });
    backBtn.addEventListener('click', function () { showStep(wizState.step - 1); });
    document.getElementById('editProject').addEventListener('click', function () {
      showStep(1);
      wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.querySelectorAll('.style-card').forEach(function (card) {
      card.addEventListener('click', function () {
        document.querySelectorAll('.style-card').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        card.setAttribute('aria-pressed', 'true');
        wizState.style = card.dataset.style;
        var selected = document.getElementById('templateDetail');
        selected.hidden = false;
        selected.querySelector('h3').textContent = STYLES[wizState.style].name;
        selected.querySelector('.template-detail__note').textContent = 'Adjust the look of your selected product below. This is a style reference for your brand direction.';
        renderProductLook();
      });
    });

  }

  /* ---------- Direct, private website submission ---------- */
  var form = document.getElementById('intakeForm');
  var resultPanel = document.getElementById('intakeResult');
  var requestKey = crypto.randomUUID();
  var submissionLocked = false;

  document.querySelectorAll('.chips--select .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var group = chip.closest('.chips--select');
      var pressed = chip.getAttribute('aria-pressed') === 'true';
      var max = parseInt((group && group.dataset.max) || '0', 10);
      if (!pressed && max) {
        var count = group.querySelectorAll('.chip[aria-pressed="true"]').length;
        if (count >= max) {
          var err = document.getElementById('wizErr');
          if (err) {
            err.textContent = 'Choose up to ' + max + ' here.';
            err.hidden = false;
          }
          return;
        }
      }
      chip.setAttribute('aria-pressed', String(!pressed));
    });
  });

  function selectedChips(group) {
    return Array.prototype.slice.call(group.querySelectorAll('.chip[aria-pressed="true"]')).map(function (c) {
      return c.textContent.trim();
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (submissionLocked) return;
    var brand = document.getElementById('fBrand').value.trim();
    var name = document.getElementById('fName').value.trim();
    var email = document.getElementById('fEmail').value.trim();
    var error = document.getElementById('intakeError');
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!brand || !name || !validEmail) {
      error.textContent = 'Please fill in your brand name, your name, and a valid email.';
      error.hidden = false;
      var firstBad = !brand ? document.getElementById('wizBack') : (!name ? document.getElementById('fName') : document.getElementById('fEmail'));
      firstBad.focus();
      return;
    }
    error.hidden = true;

    var goals = selectedChips(form.querySelector('[aria-label="Goals"]'));
    var services = selectedChips(form.querySelector('[aria-label="Services"]'));
    var category = document.getElementById('fCategory').value;
    var timeline = document.getElementById('fTimeline').value;
    var notes = document.getElementById('fNotes').value.trim();

    var brief = 'CPG VELOCITY — PROJECT OVERVIEW\n\n' +
      'Brand: ' + brand + '\n' +
      'Category: ' + category + '\n' +
      'Contact: ' + name + ' <' + email + '>\n' +
      'Timeline: ' + timeline + '\n\n' +
      'Goals:\n' + (goals.length ? goals.map(function (g) { return '  - ' + g; }).join('\n') : '  (not specified)') + '\n\n' +
      'Interested in:\n' + (services.length ? services.map(function (s) { return '  - ' + s; }).join('\n') : '  (not specified)') + '\n\n' +
      (notes ? 'Notes:\n  ' + notes + '\n' : '') +
      (identitySummary ? '\n--- Attached brand identity kit ---\n' + identitySummary : '');

    var submit = form.querySelector('[type="submit"]');
    var imageFile = wImage && wImage.files[0];
    var photoData = '';
    submissionLocked = true;
    submit.disabled = true; submit.textContent = 'Submitting…';
    document.getElementById('editProject').disabled = true;
    try {
      if (imageFile) {
        if (imageFile.size > 2000000 || !['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) throw new Error('Choose a PNG, JPEG, or WebP product photo under 2 MB.');
        photoData = await new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onload = function () { resolve(reader.result); };
          reader.onerror = function () { reject(new Error('Your photo could not be read. Please choose it again.')); };
          reader.readAsDataURL(imageFile);
        });
      }
      var ref = requestKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      var payload = {
        access_key: '5431057e-cacc-46f7-b2e0-cc0689a3621b',
        subject: 'New CPG Velocity intake — ' + brand,
        from_name: 'CPG Velocity website',
        reference: ref,
        brand: brand, name: name, email: email,
        category: category, timeline: timeline,
        goals: goals.join(', '), services: services.join(', '),
        notes: notes, overview: brief,
        website: document.getElementById('wUrl').value.trim(),
        product: document.getElementById('wProduct').value.trim(),
        productPage: selectedProductSource || '',
        productImage: imageFile ? '' : (websiteVisual || ''),
        style: wizState.style || '',
        imageName: imageFile ? imageFile.name : ''
      };
      if (photoData && photoData.length <= 400000) payload.photo = photoData;
      else if (photoData) payload.photo_note = 'The sender attached a product photo on the site; it was too large to forward here — ask them to email it to hello@cpgvelocitymedia.com.';
      var response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(35000)
      });
      var result = await response.json();
      if (!response.ok || !result.success) throw new Error('Your submission could not be sent. Please email hello@cpgvelocitymedia.com and we will pick it up from there.');
      document.documentElement.classList.add('submission-complete');
      document.getElementById('receiptReference').textContent = 'Reference: ' + ref;
      form.hidden = true; resultPanel.hidden = false;
      wizardEl.querySelector('.onboarding-finish').hidden = true;
      wizardEl.querySelector('.wizard__nav').hidden = true;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.getElementById('briefReadyTitle').focus({ preventScroll: true });
          resultPanel.scrollIntoView({ behavior: 'instant', block: 'center' });
        });
      });
    } catch (err) {
      error.textContent = err.name === 'TimeoutError' || err.name === 'TypeError' ? 'We could not send your brief just now. Your answers are still here — try Submit again, or email hello@cpgvelocitymedia.com and we will take it from there.' : err.message;
      error.hidden = false;
    } finally {
      submissionLocked = false; submit.disabled = false; submit.textContent = 'Submit';
      document.getElementById('editProject').disabled = false;
    }
  });

  /* ---------- Newsletter (opens email app) ---------- */
  var newsForm = document.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('newsEmail').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('newsEmail').focus();
        return;
      }
      var href = 'mailto:' + CONTACT_EMAIL + '?subject=' +
        encodeURIComponent('Join the mix — newsletter request') + '&body=' +
        encodeURIComponent('Please add me to the CPG Velocity newsletter.\n\nEmail: ' + email);
      window.location.href = href;
      document.getElementById('newsHint').textContent = 'Opened your email app — send the message to finish signing up.';
    });
  }
})();
