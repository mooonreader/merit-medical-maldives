/* Merit Medical Maldives — app
   Plain ES5-compatible JavaScript, no dependencies, hash routing (works on
   any static host incl. GitHub Pages). Every risky call is guarded. */
(function () {
  "use strict";

  var CFG = window.MM_CONFIG || {};
  var CATS = window.MM_CATEGORIES || [];
  var PRODUCTS = window.MM_PRODUCTS || [];
  var app = document.getElementById("app");

  /* ---------------- utilities ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function clampQty(n) { n = parseInt(n, 10); if (!isFinite(n) || n < 1) return 1; return Math.min(n, 99999); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

  // Storage that never throws (private mode, quota, disabled cookies).
  var store = (function () {
    var mem = {}, ok = false;
    try { var k = "__mm_t"; localStorage.setItem(k, "1"); localStorage.removeItem(k); ok = true; } catch (e) {}
    return {
      get: function (key, fallback) {
        try {
          var raw = ok ? localStorage.getItem(key) : mem[key];
          return raw == null ? fallback : JSON.parse(raw);
        } catch (e) { return fallback; }
      },
      set: function (key, val) {
        var raw = JSON.stringify(val);
        mem[key] = raw;
        if (ok) { try { localStorage.setItem(key, raw); } catch (e) {} }
      },
      persistent: ok
    };
  })();

  var ICONS = {
    glove: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 58V36l-6-9c-1.6-2.4 1.6-5 3.6-3l4.4 4.6V12a3 3 0 0 1 6 0v16V8a3 3 0 0 1 6 0v20V11a3 3 0 0 1 6 0v19-13a3 3 0 0 1 6 0v21c0 8-3 13-7 16v4"/><path d="M22 50h26"/></svg>',
    mask: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 24c6-4 12-6 18-6s12 2 18 6v14c-5 7-11 10-18 10s-13-3-18-10z"/><path d="M14 27H8c0 8 3 12 8 13M50 27h6c0 8-3 12-8 13M22 30h20M22 37h20"/></svg>',
    lungs: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8v22M32 30l-6-5M32 30l6-5"/><path d="M24 20c-6 0-12 10-13 22-.6 7 3 12 9 10 4-1 6-4 6-9V24c0-2-1-4-2-4zM40 20c6 0 12 10 13 22 .6 7-3 12-9 10-4-1-6-4-6-9V24c0-2 1-4 2-4z"/></svg>',
    pulse: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="12" width="48" height="36" rx="6"/><path d="M14 32h8l4-8 6 16 4-10 3 2h11M24 56h16M32 48v8"/></svg>',
    syringe: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M44 8l12 12M50 14l-8 8M40 16l8 8-24 24-8-8zM16 40l-8 8 8 8 8-8M28 28l4 4M24 32l4 4M32 24l4 4"/></svg>',
    plus: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="20" width="48" height="24" rx="12" transform="rotate(-35 32 32)"/><path d="M28 28l8 8M36 28l-8 8"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.5-4A8 8 0 1 1 9 19z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    boat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l2 3h14l2-3zM12 3v11M12 4l6 9h-6"/><path d="M2 21c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3L5 13h6l-1 8 8-10h-6z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>'
  };
  function catIcon(catId) { var c = byId(CATS, catId); return ICONS[(c && c.icon) || "plus"] || ICONS.plus; }

  /* ---------------- quote list ---------------- */
  var QKEY = "mm_quote_v1";
  var quote = store.get(QKEY, []);
  if (!Array.isArray(quote)) quote = [];
  quote = quote.filter(function (l) { return l && typeof l.sku === "string" && l.productId; });

  function saveQuote() { store.set(QKEY, quote); updateBadges(); }
  function quoteCount() { return quote.length; }
  function addLine(product, variant, qty, note) {
    qty = clampQty(qty);
    note = String(note || "").slice(0, 300);
    for (var i = 0; i < quote.length; i++) {
      if (quote[i].sku === variant.sku) {
        quote[i].qty = clampQty(quote[i].qty + qty);
        if (note) quote[i].note = note;
        saveQuote(); return;
      }
    }
    quote.push({ sku: variant.sku, productId: product.id, name: product.name, attrs: variant.attrs || {}, qty: qty, note: note });
    saveQuote();
  }
  function updateBadges() {
    var n = quoteCount();
    var b = byIdEl("qBadge"); if (b) { b.textContent = n; b.hidden = n === 0; }
    var f = byIdEl("fabN"); if (f) f.textContent = n;
    var fab = byIdEl("fab");
    if (fab) { var r = currentRoute().name; fab.classList.toggle("show", n > 0 && r !== "quote" && r !== "request"); }
  }
  function byIdEl(id) { return document.getElementById(id); }
  function attrText(attrs) {
    var vals = []; for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) vals.push(attrs[k]);
    return vals.join(" · ");
  }

  /* ---------------- toast ---------------- */
  var toastTimer;
  function toast(html) {
    var t = byIdEl("toast"); if (!t) return;
    t.innerHTML = ICONS.check + "<span>" + html + "</span>";
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  /* ---------------- router ---------------- */
  function currentRoute() {
    var h = (location.hash || "#/").replace(/^#/, "");
    if (h.charAt(0) !== "/") h = "/" + h;
    var qi = h.indexOf("?");
    var path = qi > -1 ? h.slice(0, qi) : h;
    var qs = {};
    if (qi > -1) h.slice(qi + 1).split("&").forEach(function (p) {
      if (!p) return; var kv = p.split("=");
      try { qs[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " ")); } catch (e) {}
    });
    var parts = path.split("/").filter(Boolean);
    return { name: parts[0] || "home", arg: parts[1] ? safeDecode(parts[1]) : "", qs: qs };
  }
  function safeDecode(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }

  var ROUTES = {
    home: viewHome, catalogue: viewCatalogue, category: viewCatalogue, product: viewProduct,
    quote: viewQuote, request: viewRequest, done: viewDone, about: viewAbout, contact: viewContact
  };

  var lastRouteName = null;
  function render() {
    var r = currentRoute();
    var view = ROUTES[r.name] || viewNotFound;
    try {
      app.innerHTML = '<div class="page-enter">' + view(r) + "</div>";
      if (view.after) view.after(r);
    } catch (err) {
      if (window.console) console.error(err);
      app.innerHTML = '<div class="wrap section"><div class="panel empty"><h2>Something went wrong</h2><p>Please reload the page. Your quote list is safe.</p><a class="btn primary" href="#/">Back to home</a></div></div>';
    }
    $$(".nav a").forEach(function (a) {
      var key = a.getAttribute("data-nav");
      var on = key === r.name || (key === "catalogue" && (r.name === "category" || r.name === "product"));
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    closeDrawer();
    if (lastRouteName !== null && !(r.name === "catalogue" && lastRouteName === "catalogue")) {
      window.scrollTo(0, 0);
      try { app.focus({ preventScroll: true }); } catch (e) {}
    }
    lastRouteName = r.name;
    document.title = (view.title ? view.title(r) + " — " : "") + "Merit Medical Maldives";
    updateBadges();
    reveal();
  }
  window.addEventListener("hashchange", render);

  /* ---------------- reveal on scroll ---------------- */
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -40px 0px" }) : null;
  function reveal() {
    var els = $$(".reveal:not(.in)");
    els.forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); });
    // Safety net: never leave content hidden if the observer misbehaves.
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 1800);
  }

  /* ---------------- shared bits ---------------- */
  function productCard(p) {
    var cfg = p.steps && p.steps.length;
    return '<a class="pcard panel reveal" href="#/product/' + encodeURIComponent(p.id) + '">' +
      '<div class="pimg">' + catIcon(p.category) + (cfg ? '<span class="tag">' + p.variants.length + " variants</span>" : "") + "</div>" +
      '<div class="pbody"><span class="brand">' + esc(p.brand) + "</span><h3>" + esc(p.name) + "</h3><p>" + esc(p.summary) + "</p>" +
      '<div class="foot"><span>' + (cfg ? "CONFIGURE" : "ADD TO LIST") + "</span>" + ICONS.arrow.replace("<svg", '<svg width="18" height="18"') + "</div></div></a>";
  }
  function ctaBand() {
    return '<section class="section"><div class="wrap"><div class="panel glow cta-band reveal"><div><span class="eyebrow">Bulk & recurring orders</span><h2>Supplying a hospital, clinic or resort?</h2><p class="muted" style="margin:6px 0 0">Send us your list. We reply with pricing and delivery times, usually the same working day.</p></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#/catalogue">Start a quote ' + ICONS.arrow + '</a><a class="btn" href="#/contact">Talk to sales</a></div></div></div></section>';
  }

  /* ---------------- HOME ---------------- */
  function viewHome() {
    var variants = PRODUCTS.reduce(function (n, p) { return n + p.variants.length; }, 0);
    var html = '<section class="hero"><div class="wrap hero-grid"><div>' +
      '<span class="eyebrow">Medical supply · Maldives</span>' +
      '<h1>Medical supplies,<br><span class="grad-text">quoted fast.</span></h1>' +
      '<p class="lead">Browse gloves, PPE, respiratory equipment, diagnostics and consumables. Pick exactly what you need and send one quotation request. We deliver to every atoll.</p>' +
      '<form class="hero-search panel" id="heroSearch" role="search"><label class="sr-only" for="hq">Search products</label><input id="hq" type="search" placeholder="Search products or SKU…" autocomplete="off" enterkeyhint="search"><button class="btn primary sm" type="submit">Search</button></form>' +
      '<div class="hero-cta"><a class="btn primary" href="#/catalogue">Browse products ' + ICONS.arrow + '</a><a class="btn" href="#/contact">Contact sales</a></div>' +
      '<div class="stats"><div class="stat panel"><b class="grad-text">' + PRODUCTS.length + '+</b><span>Product lines</span></div><div class="stat panel"><b class="grad-text">' + variants + '+</b><span>Configurations</span></div><div class="stat panel"><b class="grad-text">20</b><span>Atolls served</span></div></div>' +
      "</div>" + heroVisual() + "</div></section>";

    html += '<section class="section" style="padding-top:24px"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Categories</span><h2>What we supply</h2></div><p class="muted">Everything a ward, clinic or island health centre goes through every week.</p></div><div class="grid cats">' +
      CATS.map(function (c) {
        var n = PRODUCTS.filter(function (p) { return p.category === c.id; }).length;
        return '<a class="cat panel reveal" href="#/catalogue?cat=' + c.id + '"><div class="ico">' + (ICONS[c.icon] || "") + "</div><h3>" + esc(c.name) + "</h3><p>" + esc(c.blurb) + '</p><span class="go">' + n + " PRODUCTS →</span></a>";
      }).join("") + "</div></div></section>";

    html += '<section class="section"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">How it works</span><h2>From browsing to a quote in minutes</h2></div><p class="muted">No account, no checkout. Just tell us what you need.</p></div><div class="grid steps">' +
      [["Browse", "Open a category or search by name or SKU."], ["Configure", "Choose material, size and pack, one step at a time. Only options we actually stock can be picked."], ["Build your list", "Add as many items as you need, with quantities and notes. The list stays saved on this device."], ["Request a quote", "Send your list. You get a reference number straight away, and our team replies with pricing."]]
        .map(function (s) { return '<div class="step panel reveal"><h3>' + s[0] + "</h3><p>" + s[1] + "</p></div>"; }).join("") + "</div></div></section>";

    var featured = ["nitrile-exam-gloves", "oxygen-concentrator", "surgical-masks", "bp-monitor"].map(function (id) { return byId(PRODUCTS, id); }).filter(Boolean);
    html += '<section class="section"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Popular</span><h2>Most requested</h2></div><a class="link" href="#/catalogue">View all products →</a></div><div class="grid products">' + featured.map(productCard).join("") + "</div></div></section>";

    html += '<section class="section" style="padding-top:0"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Brands & partners</span><h2>Sourced from trusted manufacturers</h2></div></div><div class="partners">' +
      (window.MM_PARTNERS || []).map(function (b) { return '<div class="partner panel reveal">' + esc(b) + "</div>"; }).join("") + "</div></div></section>";
    return html + ctaBand();
  }
  viewHome.after = function () {
    var f = byIdEl("heroSearch");
    if (f) f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = byIdEl("hq").value.trim();
      location.hash = "#/catalogue" + (v ? "?q=" + encodeURIComponent(v) : "");
    });
  };
  function heroVisual() {
    return '<div class="hero-vis" aria-hidden="true"><svg viewBox="0 0 400 400"><defs>' +
      '<linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2ee6ff"/><stop offset="1" stop-color="#22f0b0"/></linearGradient>' +
      '<radialGradient id="hc" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2ee6ff" stop-opacity=".25"/><stop offset="1" stop-color="#2ee6ff" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="200" cy="200" r="190" fill="url(#hc)"/>' +
      '<g class="ring"><circle cx="200" cy="200" r="168" fill="none" stroke="url(#hg)" stroke-width="1.5" stroke-dasharray="4 10" opacity=".7"/><circle cx="200" cy="32" r="5" fill="#22f0b0"/></g>' +
      '<g class="ring r2"><circle cx="200" cy="200" r="132" fill="none" stroke="#7b8cff" stroke-width="1" stroke-dasharray="60 20 4 20" opacity=".55"/><circle cx="332" cy="200" r="4" fill="#2ee6ff"/></g>' +
      '<circle cx="200" cy="200" r="96" fill="rgba(13,24,40,.8)" stroke="rgba(120,200,255,.25)"/>' +
      '<path d="M182 140h36v42h42v36h-42v42h-36v-42h-42v-36h42z" fill="url(#hg)" opacity=".95"/>' +
      '<path class="pulse-line" d="M60 300h70l14-26 18 52 16-40 12 14h150" fill="none" stroke="url(#hg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg><div class="float-card panel f1"><span class="dot"></span><div><b>Quote requested</b><span class="muted">MMQ-2611-7K3P</span></div></div>' +
      '<div class="float-card panel f2"><span class="dot" style="background:#2ee6ff;box-shadow:0 0 14px #2ee6ff"></span><div><b>Nitrile · M · 1,000</b><span class="muted">GLV-NIT-PF-M-1000</span></div></div></div>';
  }

  /* ---------------- CATALOGUE ---------------- */
  function searchProducts(q, cat) {
    var nq = norm(q), terms = nq ? nq.split(" ") : [];
    var rawQ = String(q || "").trim().toUpperCase();
    return PRODUCTS.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (!terms.length) return true;
      var catObj = byId(CATS, p.category);
      var hay = norm([p.name, p.brand, p.summary, (p.tags || []).join(" "), catObj ? catObj.name : ""].join(" "));
      var skuHit = rawQ.length >= 3 && p.variants.some(function (v) { return v.sku.toUpperCase().indexOf(rawQ) > -1; });
      return skuHit || terms.every(function (t) { return hay.indexOf(t) > -1; });
    });
  }
  function viewCatalogue(r) {
    var cat = r.name === "category" ? r.arg : (r.qs.cat || "");
    if (cat && !byId(CATS, cat)) cat = "";
    var q = r.qs.q || "";
    var catObj = byId(CATS, cat);
    var html = '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span class="sep">/</span>' +
      (catObj ? '<a href="#/catalogue">Products</a><span class="sep">/</span><span>' + esc(catObj.name) + "</span>" : "<span>Products</span>") + "</nav>" +
      '<div class="sec-head" style="margin-bottom:20px"><div><h1 style="font-size:clamp(30px,5vw,48px)">' + (catObj ? esc(catObj.name) : "All products") + '</h1><p class="muted" style="margin:0">' + (catObj ? esc(catObj.blurb) : "Search, filter and configure. Every item can be added to your quote list.") + "</p></div></div>" +
      '<div class="cat-layout"><aside class="filters panel" aria-label="Filter by category"><h3>Category</h3><div class="chips" id="chips">' +
      '<button class="chip' + (!cat ? " on" : "") + '" data-cat="">All <span class="n">' + PRODUCTS.length + "</span></button>" +
      CATS.map(function (c) {
        var n = PRODUCTS.filter(function (p) { return p.category === c.id; }).length;
        return '<button class="chip' + (cat === c.id ? " on" : "") + '" data-cat="' + c.id + '">' + esc(c.name) + ' <span class="n">' + n + "</span></button>";
      }).join("") + '</div></aside><div><div class="search-bar panel">' + ICONS.search +
      '<label class="sr-only" for="cq">Search products</label><input id="cq" type="search" placeholder="Search by name, brand or SKU" value="' + esc(q) + '" autocomplete="off" enterkeyhint="search"></div>' +
      '<div id="results"></div></div></div></div><div style="height:64px"></div>';
    return html;
  }
  viewCatalogue.title = function (r) { var c = byId(CATS, r.qs.cat || r.arg); return c ? c.name : "Products"; };
  viewCatalogue.after = function (r) {
    var cat = r.name === "category" ? r.arg : (r.qs.cat || "");
    if (cat && !byId(CATS, cat)) cat = "";
    var input = byIdEl("cq");
    function draw() {
      var list = searchProducts(input.value, cat);
      var box = byIdEl("results");
      box.innerHTML = '<div class="result-meta"><span>' + list.length + " product" + (list.length === 1 ? "" : "s") + (input.value.trim() ? " for “" + esc(input.value.trim()) + "”" : "") + "</span>" +
        (input.value.trim() || cat ? '<a class="link" href="#/catalogue">Clear filters</a>' : "") + "</div>" +
        (list.length ? '<div class="grid products">' + list.map(productCard).join("") + "</div>"
          : '<div class="panel empty">' + ICONS.search + "<h3>No products match</h3><p>Try a different word, or ask us directly. We stock far more than is listed here.</p><a class=\"btn\" href=\"#/contact\">Ask sales</a></div>");
      reveal();
    }
    var t;
    input.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        draw();
        var v = input.value.trim();
        var h = "#/catalogue" + buildQs({ cat: cat, q: v });
        if (history.replaceState) history.replaceState(null, "", h);
      }, 160);
    });
    $$("#chips .chip").forEach(function (b) {
      b.addEventListener("click", function () {
        location.hash = "#/catalogue" + buildQs({ cat: b.getAttribute("data-cat"), q: input.value.trim() });
      });
    });
    draw();
    if (r.qs.focus) setTimeout(function () { input.focus(); }, 50);
  };
  function buildQs(o) {
    var p = []; for (var k in o) if (o[k]) p.push(k + "=" + encodeURIComponent(o[k]));
    return p.length ? "?" + p.join("&") : "";
  }

  /* ---------------- PRODUCT + CONFIGURATOR ---------------- */
  var cfgState = null;
  function viewProduct(r) {
    var p = byId(PRODUCTS, r.arg);
    if (!p) return viewNotFound();
    var c = byId(CATS, p.category);
    var specs = p.specs || {};
    var specRows = Object.keys(specs).map(function (k) { return "<tr><th>" + esc(k) + "</th><td>" + esc(specs[k]) + "</td></tr>"; }).join("");
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/catalogue">Products</a><span class="sep">/</span>' +
      (c ? '<a href="#/catalogue?cat=' + c.id + '">' + esc(c.name) + '</a><span class="sep">/</span>' : "") + "<span>" + esc(p.name) + "</span></nav>" +
      '<div class="prod"><div class="p-gal"><div class="gallery panel glow"><div class="pimg">' + catIcon(p.category) + '</div><div class="thumbs"><div class="on">' + catIcon(p.category) + "</div><div>" + catIcon(p.category) + "</div><div>" + catIcon(p.category) + "</div></div></div></div>" +
      '<div class="prod-info p-info"><span class="brand">' + esc(p.brand) + "</span><h1>" + esc(p.name) + '</h1><p class="muted" style="font-size:17px">' + esc(p.summary) + "</p>" +
      '<div class="cfg panel glow" id="cfg"></div></div>' +
      '<div class="p-specs">' + (specRows ? '<div class="panel" style="padding:8px 20px 12px"><h3 style="margin:14px 0 4px;font-size:15px">Specifications</h3><table class="specs">' + specRows + "</table></div>" : "") +
      (p.datasheet ? '<a class="btn" style="margin-top:12px" href="' + esc(p.datasheet) + '" target="_blank" rel="noopener">Download datasheet</a>' : "") + '</div></div></div>';
  }
  viewProduct.title = function (r) { var p = byId(PRODUCTS, r.arg); return p ? p.name : "Not found"; };
  viewProduct.after = function (r) {
    var p = byId(PRODUCTS, r.arg); if (!p) return;
    cfgState = { product: p, sel: {}, qty: 1, note: "" };
    autoSelect();
    drawCfg();
    injectProductLd(p);
  };
  function matching(p, sel, uptoIndex) {
    var steps = p.steps || [];
    return p.variants.filter(function (v) {
      for (var i = 0; i < uptoIndex; i++) {
        var k = steps[i].key;
        if (sel[k] != null && v.attrs[k] !== sel[k]) return false;
      }
      return true;
    });
  }
  function uniq(arr) { var o = [], s = {}; arr.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  // After any change: drop later choices that are no longer valid, auto-pick steps with a single option.
  function autoSelect() {
    var p = cfgState.product, steps = p.steps || [], sel = cfgState.sel;
    for (var i = 0; i < steps.length; i++) {
      var k = steps[i].key;
      var avail = uniq(matching(p, sel, i).map(function (v) { return v.attrs[k]; }));
      if (sel[k] != null && avail.indexOf(sel[k]) === -1) delete sel[k];
      if (sel[k] == null && avail.length === 1) sel[k] = avail[0];
      if (sel[k] == null) { for (var j = i + 1; j < steps.length; j++) delete sel[steps[j].key]; break; }
    }
  }
  function resolvedVariant() {
    var p = cfgState.product, steps = p.steps || [];
    if (!steps.length) return p.variants[0] || null;
    var m = matching(p, cfgState.sel, steps.length);
    for (var i = 0; i < steps.length; i++) if (cfgState.sel[steps[i].key] == null) return null;
    return m.length === 1 ? m[0] : null;
  }
  function drawCfg() {
    var box = byIdEl("cfg"); if (!box || !cfgState) return;
    var p = cfgState.product, steps = p.steps || [], sel = cfgState.sel;
    var done = steps.filter(function (s) { return sel[s.key] != null; }).length;
    var v = resolvedVariant();
    var html = '<div class="cfg-head"><h2>' + (steps.length ? "Configure" : "Add to quote list") + "</h2>" +
      (steps.length ? '<span class="muted" style="font:600 12px var(--mono)">' + done + " / " + steps.length + "</span>" : "") + "</div>";
    if (steps.length) {
      html += '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(done / steps.length * 100) + '%"></i></div>';
      var locked = false;
      steps.forEach(function (s, i) {
        var allVals = uniq(p.variants.map(function (x) { return x.attrs[s.key]; }));
        var avail = locked ? [] : uniq(matching(p, sel, i).map(function (x) { return x.attrs[s.key]; }));
        var isDone = sel[s.key] != null;
        html += '<div class="cstep' + (isDone ? " done" : "") + (locked ? " locked" : "") + '" role="group" aria-labelledby="sl' + i + '">' +
          '<div class="cstep-label" id="sl' + i + '"><span class="num">' + (isDone ? "✓" : i + 1) + "</span>" + esc(s.label) +
          (isDone ? '<span class="val">' + esc(sel[s.key]) + "</span>" : "") + '</div><div class="opts">' +
          allVals.map(function (val) {
            var en = avail.indexOf(val) > -1;
            var on = sel[s.key] === val;
            return '<button type="button" class="opt' + (on ? " on" : "") + '" data-k="' + esc(s.key) + '" data-v="' + esc(val) + '"' + (en ? "" : " disabled") +
              ' aria-pressed="' + on + '"' + (en ? "" : ' title="Not available with your earlier choices"') + ">" + esc(val) + "</button>";
          }).join("") + "</div></div>";
        if (!isDone) locked = true;
      });
    }
    html += v ? '<div class="resolved"><span>' + (steps.length ? "Your configuration" : "Item code") + '</span><span class="sku">' + esc(v.sku) + "</span></div>"
      : '<div class="resolved pending"><span>Complete every step to see the item code</span><span class="sku" style="color:var(--dim)">— — —</span></div>';
    html += '<div class="add-row"><div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><input id="qtyIn" type="number" inputmode="numeric" min="1" max="99999" value="' + cfgState.qty + '" aria-label="Quantity"><button type="button" data-q="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn primary" id="addBtn" type="button"' + (v ? "" : " disabled") + ">Add to quote list</button></div>" +
      '<label class="sr-only" for="noteIn">Note for this line</label><input class="in note-in" id="noteIn" maxlength="300" placeholder="Optional note (e.g. preferred brand, delivery date)" value="' + esc(cfgState.note) + '">' +
      '<p class="muted" style="font-size:13px;margin:14px 0 0">Prices are shared in your quotation. ' + (steps.length ? "Greyed-out options aren't available with your earlier choices." : "") + "</p>";
    box.innerHTML = html;

    $$(".opt", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-k"), val = b.getAttribute("data-v");
        if (cfgState.sel[k] === val) {
          delete cfgState.sel[k];
          var idx = steps.map(function (s) { return s.key; }).indexOf(k);
          for (var j = idx + 1; j < steps.length; j++) delete cfgState.sel[steps[j].key];
        } else {
          cfgState.sel[k] = val;
        }
        autoSelect(); drawCfg();
        var next = $(".cstep:not(.done) .opt:not(:disabled)", box) || byIdEl("addBtn");
        if (next && next.focus) { try { next.focus({ preventScroll: true }); } catch (e) {} }
      });
    });
    var qIn = byIdEl("qtyIn");
    qIn.addEventListener("change", function () { cfgState.qty = clampQty(qIn.value); qIn.value = cfgState.qty; });
    $$("[data-q]", box).forEach(function (b) {
      b.addEventListener("click", function () { cfgState.qty = clampQty(clampQty(qIn.value) + parseInt(b.getAttribute("data-q"), 10)); qIn.value = cfgState.qty; });
    });
    byIdEl("noteIn").addEventListener("input", function (e) { cfgState.note = e.target.value; });
    byIdEl("addBtn").addEventListener("click", function () {
      var vv = resolvedVariant(); if (!vv) return;
      cfgState.qty = clampQty(qIn.value);
      addLine(p, vv, cfgState.qty, cfgState.note);
      toast("Added <b>" + esc(vv.sku) + "</b> × " + cfgState.qty + ' · <a class="link" href="#/quote">View list</a>');
      cfgState.note = ""; cfgState.qty = 1;
      if ((p.steps || []).length) { cfgState.sel = {}; autoSelect(); }
      drawCfg();
    });
  }
  function injectProductLd(p) {
    var old = byIdEl("prodLd"); if (old) old.parentNode.removeChild(old);
    var s = document.createElement("script");
    s.type = "application/ld+json"; s.id = "prodLd";
    s.text = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, brand: { "@type": "Brand", name: p.brand }, description: p.summary, sku: p.variants[0] && p.variants[0].sku, category: (byId(CATS, p.category) || {}).name });
    document.head.appendChild(s);
  }

  /* ---------------- QUOTE LIST ---------------- */
  function viewQuote() {
    var html = '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Quote list</span></nav>' +
      '<div class="sec-head" style="margin-bottom:20px"><div><h1 style="font-size:clamp(30px,5vw,48px)">Your quote list</h1><p class="muted" style="margin:0">Saved on this device' + (store.persistent ? "" : " for this visit only (your browser blocks saving)") + ". Edit quantities and notes, then request your quotation.</p></div></div>";
    if (!quote.length) {
      return html + '<div class="panel empty" style="margin-bottom:64px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 11h6M9 15h4"/></svg><h3>Your list is empty</h3><p>Browse the catalogue and add what you need.</p><a class="btn primary" href="#/catalogue">Browse products ' + ICONS.arrow + "</a></div></div>";
    }
    var units = quote.reduce(function (n, l) { return n + l.qty; }, 0);
    html += '<div class="q-layout"><div class="panel" id="qItems">' + quote.map(function (l, i) {
      var p = byId(PRODUCTS, l.productId);
      return '<div class="q-item" data-i="' + i + '"><div class="q-thumb">' + catIcon(p ? p.category : "") + '</div><div class="q-main">' +
        '<h3><a href="#/product/' + encodeURIComponent(l.productId) + '">' + esc(l.name) + '</a></h3><div class="sku" style="font-size:12px">' + esc(l.sku) + "</div>" +
        (attrText(l.attrs) ? '<div class="q-attrs">' + esc(attrText(l.attrs)) + "</div>" : "") +
        '<div class="q-ctrls"><div class="qty sm"><button type="button" data-d="-1" aria-label="Decrease">−</button><input type="number" inputmode="numeric" min="1" value="' + l.qty + '" aria-label="Quantity for ' + esc(l.sku) + '"><button type="button" data-d="1" aria-label="Increase">+</button></div>' +
        '<input class="in qnote" maxlength="300" placeholder="Note (optional)" value="' + esc(l.note || "") + '" aria-label="Note for ' + esc(l.sku) + '">' +
        '<button class="rm" type="button" aria-label="Remove ' + esc(l.sku) + '">' + ICONS.trash + "Remove</button></div></div></div>";
    }).join("") + "</div>" +
      '<aside class="summary panel glow"><h3>Summary</h3><div class="row"><span>Line items</span><b id="sLines">' + quote.length + '</b></div><div class="row"><span>Total units</span><b id="sUnits">' + units + '</b></div><div class="row" style="border:0"><span>Pricing</span><b>In your quotation</b></div>' +
      '<a class="btn primary block" style="margin-top:16px" href="#/request">Request quotation ' + ICONS.arrow + '</a><a class="btn block" style="margin-top:10px" href="#/catalogue">Add more products</a>' +
      '<button class="rm" id="clearAll" type="button" style="margin:12px auto 0;display:flex">' + ICONS.trash + "Clear list</button></aside></div></div>";
    return html;
  }
  viewQuote.title = function () { return "Quote list"; };
  viewQuote.after = function () {
    function refreshSummary() {
      var a = byIdEl("sLines"), b = byIdEl("sUnits");
      if (a) a.textContent = quote.length;
      if (b) b.textContent = quote.reduce(function (n, l) { return n + l.qty; }, 0);
    }
    $$(".q-item").forEach(function (row) {
      var i = parseInt(row.getAttribute("data-i"), 10);
      var line = quote[i]; if (!line) return;
      var qIn = $("input[type=number]", row);
      function setQ(n) { line.qty = clampQty(n); qIn.value = line.qty; saveQuote(); refreshSummary(); }
      qIn.addEventListener("change", function () { setQ(qIn.value); });
      $$("[data-d]", row).forEach(function (b) { b.addEventListener("click", function () { setQ(clampQty(qIn.value) + parseInt(b.getAttribute("data-d"), 10)); }); });
      $(".qnote", row).addEventListener("input", function (e) { line.note = e.target.value.slice(0, 300); saveQuote(); });
      $(".rm", row).addEventListener("click", function () {
        var idx = quote.indexOf(line); if (idx > -1) quote.splice(idx, 1);
        saveQuote(); render(); toast("Removed " + esc(line.sku));
      });
    });
    var c = byIdEl("clearAll");
    if (c) c.addEventListener("click", function () {
      if (c.getAttribute("data-armed")) { quote = []; saveQuote(); render(); toast("List cleared"); return; }
      c.setAttribute("data-armed", "1"); c.innerHTML = ICONS.trash + "Tap again to clear";
      setTimeout(function () { if (c) { c.removeAttribute("data-armed"); c.innerHTML = ICONS.trash + "Clear list"; } }, 3000);
    });
  };

  /* ---------------- REQUEST FORM ---------------- */
  var formOpenedAt = 0;
  var DRAFT = "mm_contact_v1";
  function viewRequest() {
    if (!quote.length) { setTimeout(function () { location.replace("#/quote"); }, 0); return ""; }
    var d = store.get(DRAFT, {}) || {};
    var f = function (id, label, type, req, extra, full) {
      return '<div class="field' + (full ? " full" : "") + '"><label for="' + id + '">' + label + (req ? ' <span class="req">*</span>' : "") + "</label>" +
        '<input class="in" id="' + id + '" name="' + id + '" type="' + type + '"' + (req ? " required" : "") + ' value="' + esc(d[id] || "") + '" ' + (extra || "") + '><span class="err-msg" id="' + id + 'Err"></span></div>';
    };
    var units = quote.reduce(function (n, l) { return n + l.qty; }, 0);
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/quote">Quote list</a><span class="sep">/</span><span>Request quotation</span></nav>' +
      '<div class="sec-head" style="margin-bottom:20px"><div><h1 style="font-size:clamp(30px,5vw,48px)">Request quotation</h1><p class="muted" style="margin:0">Tell us where to send your quote. We usually reply the same working day.</p></div></div>' +
      '<div class="q-layout"><form class="panel" id="reqForm" novalidate style="padding:22px">' +
      '<div class="form-grid">' +
      f("name", "Full name", "text", true, 'autocomplete="name" maxlength="100"') +
      f("org", "Organisation", "text", true, 'autocomplete="organization" maxlength="120" placeholder="Hospital, clinic, resort, pharmacy…"') +
      f("phone", "Phone", "tel", true, 'autocomplete="tel" inputmode="tel" maxlength="30" placeholder="+960"') +
      f("email", "Email", "email", true, 'autocomplete="email" inputmode="email" maxlength="120"') +
      '<div class="field full"><label for="island">Delivery island <span class="req">*</span></label><select class="in" id="island" name="island" required><option value="">Select island…</option>' +
      (window.MM_ISLANDS || []).map(function (x) { return "<option" + (d.island === x ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("") + '</select><span class="err-msg" id="islandErr"></span></div>' +
      '<div class="field full"><label for="msg">Message</label><textarea class="in" id="msg" name="msg" maxlength="2000" placeholder="Delivery timing, alternatives you would accept, anything else">' + esc(d.msg || "") + "</textarea></div>" +
      '<div class="hp" aria-hidden="true"><label for="website">Leave empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>' +
      '</div><div id="formNotice"></div><button class="btn primary block" id="sendBtn" type="submit" style="margin-top:18px">Send request</button>' +
      '<p class="muted" style="font-size:12px;margin:12px 0 0;text-align:center">We use your details only to reply to this request.</p></form>' +
      '<aside class="summary panel"><h3>' + quote.length + " item" + (quote.length === 1 ? "" : "s") + " · " + units + ' units</h3><div style="max-height:360px;overflow:auto;margin:0 -6px;padding:0 6px">' +
      quote.map(function (l) { return '<div class="row"><span style="min-width:0"><span style="color:var(--text)">' + esc(l.name) + '</span><br><span class="sku" style="font-size:11px">' + esc(l.sku) + "</span></span><b>× " + l.qty + "</b></div>"; }).join("") +
      '</div><a class="link" href="#/quote" style="display:inline-block;margin-top:12px">Edit list</a></aside></div></div>';
  }
  viewRequest.title = function () { return "Request quotation"; };
  viewRequest.after = function () {
    var form = byIdEl("reqForm"); if (!form) return;
    formOpenedAt = Date.now();
    var fields = ["name", "org", "phone", "email", "island", "msg"];
    fields.forEach(function (id) {
      var el = byIdEl(id);
      el.addEventListener("input", function () {
        var d = {}; fields.forEach(function (k) { d[k] = byIdEl(k).value; }); store.set(DRAFT, d);
        if (el.classList.contains("bad")) validateField(id);
      });
      el.addEventListener("blur", function () { if (el.value) validateField(id); });
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); submitRequest(); });
  };
  function validateField(id) {
    var el = byIdEl(id), v = el.value.trim(), msg = "";
    if (el.required && !v) msg = "Required";
    else if (id === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Enter a valid email address";
    else if (id === "phone" && v && v.replace(/\D/g, "").length < 7) msg = "Enter a valid phone number";
    el.classList.toggle("bad", !!msg);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    var err = byIdEl(id + "Err"); if (err) err.textContent = msg;
    return !msg;
  }
  function makeRef() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = "";
    var rnd = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(4)) : [0, 0, 0, 0].map(function () { return Math.floor(Math.random() * 1e9); });
    for (var i = 0; i < 4; i++) r += chars[rnd[i] % chars.length];
    return "MMQ-" + ymd + "-" + r;
  }
  function requestText(req) {
    var lines = req.items.map(function (l, i) {
      return (i + 1) + ". " + l.sku + "  ×" + l.qty + "  —  " + l.name + (attrText(l.attrs) ? " (" + attrText(l.attrs) + ")" : "") + (l.note ? "\n     Note: " + l.note : "");
    }).join("\n");
    return "Quotation request " + req.ref + "\n\n" +
      "Name: " + req.name + "\nOrganisation: " + req.org + "\nPhone: " + req.phone + "\nEmail: " + req.email + "\nDelivery island: " + req.island + "\n" +
      (req.msg ? "\nMessage:\n" + req.msg + "\n" : "") + "\nItems (" + req.items.length + "):\n" + lines + "\n\nSubmitted: " + req.when;
  }
  function submitRequest() {
    var notice = byIdEl("formNotice"); notice.innerHTML = "";
    var okAll = ["name", "org", "phone", "email", "island"].map(validateField).every(Boolean);
    if (!okAll) {
      var first = $(".in.bad"); if (first) first.focus();
      notice.innerHTML = '<div class="notice err">Please fix the highlighted fields.</div>';
      return;
    }
    // Spam protection: honeypot + minimum time on form.
    if (byIdEl("website").value || Date.now() - formOpenedAt < 2500) {
      notice.innerHTML = '<div class="notice err">That was quick. Please wait a moment and try again.</div>';
      return;
    }
    var req = {
      ref: makeRef(),
      name: byIdEl("name").value.trim(), org: byIdEl("org").value.trim(), phone: byIdEl("phone").value.trim(),
      email: byIdEl("email").value.trim(), island: byIdEl("island").value, msg: byIdEl("msg").value.trim(),
      items: quote.map(function (l) { return { sku: l.sku, name: l.name, attrs: l.attrs, qty: l.qty, note: l.note || "" }; }),
      when: new Date().toISOString()
    };
    var btn = byIdEl("sendBtn");
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending…';

    deliver(req, function (method, error) {
      req.method = method;
      // Keep a local record so the confirmation page and a resend always work.
      var log = store.get("mm_requests_v1", []); if (!Array.isArray(log)) log = [];
      log.unshift(req); store.set("mm_requests_v1", log.slice(0, 20));
      if (method === "failed") {
        btn.disabled = false; btn.textContent = "Send request";
        notice.innerHTML = '<div class="notice err">We couldn\'t send your request (' + esc(error || "network error") + '). Your list is safe. <a class="link" href="' + mailtoHref(req) + '">Send it by email instead</a>.</div>';
        return;
      }
      quote = []; saveQuote();
      location.hash = "#/done/" + req.ref;
    });
  }
  function mailtoHref(req) {
    var body = requestText(req);
    if (body.length > 1800) body = body.slice(0, 1750) + "\n…(list continues — full list in the copied text)";
    return "mailto:" + encodeURIComponent(CFG.email || "") + "?subject=" + encodeURIComponent("Quotation request " + req.ref + " — " + req.org) + "&body=" + encodeURIComponent(body);
  }
  function deliver(req, cb) {
    var text = requestText(req);
    var url = null, payload = null;
    if (CFG.web3formsKey) {
      url = "https://api.web3forms.com/submit";
      payload = { access_key: CFG.web3formsKey, subject: "Quotation request " + req.ref + " — " + req.org, from_name: "Merit Medical website", replyto: req.email, name: req.name, email: req.email, message: text, ccemail: req.email };
    } else if (CFG.formEndpoint) {
      url = CFG.formEndpoint; payload = { request: req, text: text };
    }
    if (!url || !window.fetch) {
      // No backend configured: hand over to the visitor's email app.
      try { window.location.href = mailtoHref(req); } catch (e) {}
      setTimeout(function () { cb("email-app"); }, 400);
      return;
    }
    var finished = false;
    var timer = setTimeout(function () { if (!finished) { finished = true; cb("failed", "timed out"); } }, 15000);
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.success !== false, j: j }; }); })
      .then(function (res) { if (finished) return; finished = true; clearTimeout(timer); cb(res.ok ? "sent" : "failed", res.ok ? null : (res.j && res.j.message) || "server error"); })
      .catch(function (e) { if (finished) return; finished = true; clearTimeout(timer); cb("failed", e && e.message); });
  }

  /* ---------------- CONFIRMATION ---------------- */
  function viewDone(r) {
    var log = store.get("mm_requests_v1", []) || [];
    var req = null; for (var i = 0; i < log.length; i++) if (log[i].ref === r.arg) { req = log[i]; break; }
    if (!req) return '<div class="wrap"><div class="panel confirm"><h2>Request not found on this device</h2><p class="muted">If you sent a request, keep your reference number and contact us.</p><a class="btn primary" href="#/">Back to home</a></div></div>';
    var viaApp = req.method === "email-app";
    return '<div class="wrap"><div class="panel glow confirm"><div class="check">' + ICONS.check + "</div>" +
      "<h1 style=\"font-size:clamp(28px,5vw,40px)\">" + (viaApp ? "Almost there" : "Request sent") + "</h1>" +
      '<p class="muted">' + (viaApp ? "Your email app should have opened with the request ready. <b>Press send</b> to deliver it to our sales team." : "Thank you, " + esc(req.name.split(" ")[0]) + ". Our sales team has your list and will reply to <b>" + esc(req.email) + "</b> with pricing.") + "</p>" +
      '<div>Your reference</div><div class="ref">' + esc(req.ref) + "</div>" +
      "<table>" + req.items.map(function (l) { return "<tr><td>" + esc(l.name) + (attrText(l.attrs) ? '<br><span class="muted" style="font-size:12px">' + esc(attrText(l.attrs)) + "</span>" : "") + "</td><td>" + esc(l.sku) + " × " + l.qty + "</td></tr>"; }).join("") + "</table>" +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:20px">' +
      (viaApp ? '<a class="btn primary" href="' + mailtoHref(req) + '">Open email again</a>' : "") +
      '<button class="btn" id="copyReq" type="button">Copy request</button><button class="btn" type="button" onclick="window.print()">Print</button><a class="btn' + (viaApp ? "" : " primary") + '" href="#/catalogue">Continue browsing</a></div>' +
      (CFG.whatsapp ? '<p class="muted" style="font-size:13px;margin-top:20px">Urgent? <a class="link" target="_blank" rel="noopener" href="https://wa.me/' + esc(CFG.whatsapp) + "?text=" + encodeURIComponent("Hi, about quotation " + req.ref) + '">Message us on WhatsApp</a> with your reference.</p>' : "") +
      "</div></div>";
  }
  viewDone.title = function () { return "Request received"; };
  viewDone.after = function (r) {
    var b = byIdEl("copyReq"); if (!b) return;
    b.addEventListener("click", function () {
      var log = store.get("mm_requests_v1", []) || [], req = null;
      for (var i = 0; i < log.length; i++) if (log[i].ref === r.arg) req = log[i];
      if (!req) return;
      var txt = requestText(req);
      function fallback() {
        var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); toast("Request copied"); } catch (e) { toast("Copy not supported"); }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("Request copied"); }, fallback);
      else fallback();
    });
  };

  /* ---------------- ABOUT ---------------- */
  function viewAbout() {
    return '<section class="hero" style="padding-bottom:16px"><div class="wrap"><span class="eyebrow">About us</span><h1 style="max-width:900px">Supplying care across <span class="grad-text">every atoll.</span></h1>' +
      '<p class="lead" style="color:var(--muted);font-size:clamp(17px,2.2vw,20px);max-width:680px">Merit Medical Maldives supplies medical consumables, protective equipment and devices to hospitals, clinics, resorts, pharmacies and island health centres. We are based in Malé and deliver nationwide.</p></div></section>' +
      '<section class="section" style="padding-top:24px"><div class="wrap two"><div class="panel glow reveal" style="padding:28px"><h2 style="font-size:28px">Why we exist</h2><p class="muted">In an island nation, getting the right supplies to the right place on time is part of patient care. A missing box of gloves or a late oxygen concentrator matters more when the next boat is days away.</p><p class="muted" style="margin:0">We keep core items in stock in Malé, source the rest from trusted manufacturers, and give every customer a clear quote before anything ships.</p></div>' +
      '<div class="grid values">' +
      [["shield", "Quality first", "Products sourced to recognised international standards, with documentation on request."], ["boat", "Nationwide reach", "Sea and air freight coordination to islands, resorts and regional hospitals."], ["bolt", "Fast quotes", "Clear, itemised quotations, usually the same working day."], ["users", "Real people", "A sales team that knows the products and answers the phone."]]
        .map(function (v) { return '<div class="value panel reveal">' + ICONS[v[0]] + "<h3>" + v[1] + "</h3><p>" + v[2] + "</p></div>"; }).join("") +
      "</div></div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Who we serve</span><h2>Built for Maldivian healthcare</h2></div></div><div class="grid steps">' +
      [["Hospitals", "Regional and atoll hospitals with high-volume consumables."], ["Clinics", "Private clinics and diagnostic centres."], ["Resorts", "Resort clinics and first-aid stations."], ["Pharmacies", "Retail pharmacies and home-care suppliers."]]
        .map(function (s) { return '<div class="step panel reveal"><h3>' + s[0] + "</h3><p>" + s[1] + "</p></div>"; }).join("") + "</div></div></section>" + ctaBand();
  }
  viewAbout.title = function () { return "About"; };

  /* ---------------- CONTACT ---------------- */
  function contactItems() {
    var tel = String(CFG.phone || "").replace(/[^\d+]/g, "");
    return [
      ["phone", "Phone", CFG.phone, "tel:" + tel],
      ["chat", "WhatsApp", CFG.whatsapp ? "Message us" : "", CFG.whatsapp ? "https://wa.me/" + CFG.whatsapp : ""],
      ["mail", "Email", CFG.email, "mailto:" + CFG.email],
      ["pin", "Office", CFG.address, "https://maps.google.com/?q=" + encodeURIComponent(CFG.mapQuery || CFG.address || "")],
      ["clock", "Hours", CFG.hours, ""]
    ].filter(function (x) { return x[2]; });
  }
  function viewContact() {
    return '<section class="hero" style="padding-bottom:16px"><div class="wrap"><span class="eyebrow">Contact</span><h1>Talk to our <span class="grad-text">sales team.</span></h1><p class="lead" style="color:var(--muted);max-width:620px">Questions about a product, bulk pricing or delivery to your island? Get in touch, or build a quote list and send it in one go.</p></div></section>' +
      '<section class="section" style="padding-top:24px"><div class="wrap two"><div class="contact-list">' +
      contactItems().map(function (c) {
        var inner = '<span class="ico">' + ICONS[c[0]] + "</span><span><small>" + c[1] + "</small>" + esc(c[2]) + "</span>";
        return c[3] ? '<a class="contact-item panel reveal" href="' + esc(c[3]) + '"' + (/^https?:/.test(c[3]) ? ' target="_blank" rel="noopener"' : "") + ">" + inner + "</a>" : '<div class="contact-item panel reveal">' + inner + "</div>";
      }).join("") +
      '<a class="btn primary" href="#/catalogue" style="margin-top:8px">Start a quote list ' + ICONS.arrow + "</a></div>" +
      '<div class="map panel reveal"><iframe title="Map showing our office in Malé" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(CFG.mapQuery || "Male, Maldives") + '&z=14&output=embed"></iframe></div></div></section>';
  }
  viewContact.title = function () { return "Contact"; };

  function viewNotFound() {
    return '<div class="wrap section"><div class="panel empty glow"><h1 style="font-size:64px" class="grad-text">404</h1><h2>Page not found</h2><p>The page you are looking for has moved or does not exist.</p><a class="btn primary" href="#/">Back to home</a> <a class="btn" href="#/catalogue">Browse products</a></div></div>';
  }
  viewNotFound.title = function () { return "Not found"; };

  /* ---------------- chrome: drawer, footer ---------------- */
  var drawer = byIdEl("drawer"), menuBtn = byIdEl("menuBtn");
  function closeDrawer() { if (drawer) { drawer.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; } }
  if (menuBtn) menuBtn.addEventListener("click", function () {
    var open = !drawer.classList.contains("open");
    drawer.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 900) closeDrawer(); });

  var fc = byIdEl("ftrCats");
  if (fc) fc.innerHTML = CATS.map(function (c) { return '<a href="#/catalogue?cat=' + c.id + '">' + esc(c.name) + "</a>"; }).join("");
  var fco = byIdEl("ftrContact");
  if (fco) fco.innerHTML = contactItems().slice(0, 4).map(function (c) { return c[3] ? '<a href="' + esc(c[3]) + '">' + esc(c[2]) + "</a>" : "<span>" + esc(c[2]) + "</span>"; }).join("");
  var df = byIdEl("drawerFoot");
  if (df) df.innerHTML = esc(CFG.phone || "") + "<br>" + esc(CFG.email || "");
  var yr = byIdEl("yr"); if (yr) yr.textContent = new Date().getFullYear();

  // Keep the badge in sync if the list changes in another tab.
  window.addEventListener("storage", function (e) {
    if (e.key === QKEY) { quote = store.get(QKEY, []) || []; updateBadges(); if (currentRoute().name === "quote") render(); }
  });

  render();
})();
