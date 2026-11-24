/* Merit Medical Maldives: app
   Plain JavaScript, no dependencies. Pages are addressed with simple hash
   names (#catalogue, #p-<id>, #quote ...) so every link works on any static
   host, inside previews, and when copied. Every risky call is guarded. */
(function () {
  "use strict";

  var CFG = window.MM_CONFIG || {};
  var CATS = window.MM_CATEGORIES || [];
  var PRODUCTS = window.MM_PRODUCTS || [];
  var BRANDS = window.MM_BRANDS || [];
  var app = document.getElementById("app");

  /* ---------- utilities ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(id) { return document.getElementById(id); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function clampQty(n) { n = parseInt(n, 10); if (!isFinite(n) || n < 1) return 1; return Math.min(n, 99999); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  var store = (function () {
    var mem = {}, ok = false;
    try { localStorage.setItem("__mm", "1"); localStorage.removeItem("__mm"); ok = true; } catch (e) {}
    return {
      get: function (k, d) { try { var r = ok ? localStorage.getItem(k) : mem[k]; return r == null ? d : JSON.parse(r); } catch (e) { return d; } },
      set: function (k, v) { var r = JSON.stringify(v); mem[k] = r; if (ok) { try { localStorage.setItem(k, r); } catch (e) {} } },
      raw: function (k, v) { if (ok) { try { localStorage.setItem(k, v); } catch (e) {} } },
      persistent: ok
    };
  })();

  /* One icon set: 24px grid, 2px stroke, round caps. */
  var P = {
    glove: '<path d="M8 22v-6.5L5.3 12c-.8-1 .6-2.3 1.6-1.4L8 11.8V5.5a1.5 1.5 0 0 1 3 0V11V3.5a1.5 1.5 0 0 1 3 0V11V5a1.5 1.5 0 0 1 3 0v6.5-3a1.5 1.5 0 0 1 3 0V14c0 3.5-1.5 5.5-3.5 6.8V22"/>',
    mask: '<path d="M4 9c2.6-1.6 5.3-2.4 8-2.4s5.4.8 8 2.4v5.5c-2.2 3-4.9 4.5-8 4.5s-5.8-1.5-8-4.5z"/><path d="M4 10.5H2.5c0 3 1.2 4.6 3 5M20 10.5h1.5c0 3-1.2 4.6-3 5M8 11.5h8M8 14.5h8"/>',
    lungs: '<path d="M12 3v8M12 11l-2.5-2M12 11l2.5-2"/><path d="M8.5 7C6 7 4 11 3.6 15.6c-.2 2.6 1.2 4.3 3.4 3.7 1.5-.4 2.5-1.6 2.5-3.5V8.5C9.5 7.6 9 7 8.5 7zM15.5 7c2.5 0 4.5 4 4.9 8.6.2 2.6-1.2 4.3-3.4 3.7-1.5-.4-2.5-1.6-2.5-3.5V8.5c0-.9.5-1.5 1-1.5z"/>',
    pulse: '<rect x="3" y="4" width="18" height="13" rx="2.5"/><path d="M6.5 11h2.5l1.5-3 2.5 6 1.5-3.5 1 .5h2M9 21h6M12 17v4"/>',
    syringe: '<path d="M17 2.5l4.5 4.5M19.2 4.8l-3 3M15 6l3 3-9.5 9.5-3-3zM5.5 15.5L2.5 18.5l3 3 3-3M10.5 10.5l1.5 1.5M8.5 12.5l1.5 1.5M12.5 8.5l1.5 1.5"/>',
    bandage: '<rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-40 12 12)"/><path d="M10.5 10.5l3 3M13.5 10.5l-3 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chat: '<path d="M4 20l1.5-4A8 8 0 1 1 9 19z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    boat: '<path d="M3 17l2 3h14l2-3zM12 3v11M12 4l6 9h-6"/>',
    list: '<path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 11h6M9 15h4"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    building: '<path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18M8 8h0M8 12h0M8 16h0M16 13h0M16 17h0"/>',
    fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z"/>',
    li: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v0M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>'
  };
  function icon(name, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : "") + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || "") + "</svg>";
  }
  var CAT_ICON = { gloves: "glove", masks: "mask", respiratory: "lungs", diagnostics: "pulse", injection: "syringe", wound: "bandage" };
  function catIcon(c) { return icon(CAT_ICON[c] || "list"); }
  function productVisual(p, alt) {
    if (p && p.image) return '<img src="' + esc(p.image) + '" alt="' + esc(alt || p.name) + '" loading="lazy" decoding="async" onerror="this.replaceWith(document.createRange().createContextualFragment(this.dataset.fb))" data-fb="' + esc(catIcon(p.category)) + '">';
    return catIcon(p ? p.category : "");
  }

  /* ---------- theme ---------- */
  var themeBtn = el("themeBtn");
  function setTheme(t, save) {
    document.documentElement.setAttribute("data-theme", t);
    if (save) store.raw("mm_theme", t);
    if (themeBtn) themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    var m = $$('meta[name="theme-color"]'); m.forEach(function (x) { x.setAttribute("content", t === "dark" ? "#0d151d" : "#f5f6f4"); });
  }
  setTheme(document.documentElement.getAttribute("data-theme") || "light", false);
  if (themeBtn) themeBtn.addEventListener("click", function () {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });

  /* ---------- quote list (the cart) ---------- */
  var QKEY = "mm_quote_v1";
  var quote = store.get(QKEY, []);
  if (!Array.isArray(quote)) quote = [];
  quote = quote.filter(function (l) { return l && typeof l.sku === "string" && l.productId; });
  function saveQuote() { store.set(QKEY, quote); updateCount(); }
  function units() { return quote.reduce(function (n, l) { return n + l.qty; }, 0); }
  function addLine(product, variant, qty, note) {
    qty = clampQty(qty); note = String(note || "").slice(0, 300);
    for (var i = 0; i < quote.length; i++) if (quote[i].sku === variant.sku) {
      quote[i].qty = clampQty(quote[i].qty + qty); if (note) quote[i].note = note; saveQuote(); return;
    }
    quote.push({ sku: variant.sku, productId: product.id, name: product.name, attrs: variant.attrs || {}, qty: qty, note: note });
    saveQuote();
  }
  function attrText(a) { var v = []; for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) v.push(a[k]); return v.join(", "); }
  function updateCount() {
    var n = quote.length, c = el("cartCount"), b = el("cartBtn");
    if (c) c.textContent = n;
    if (b) b.setAttribute("aria-label", "Quote list, " + plural(n, "item"));
    var tc = el("tabCount"); if (tc) { tc.textContent = n; tc.hidden = n === 0; }
  }

  /* ---------- cart drawer ---------- */
  var cart = el("cart"), scrim = el("scrim"), lastFocus = null;
  function openCart() {
    renderCart();
    lastFocus = document.activeElement;
    cart.hidden = false; scrim.hidden = false;
    requestAnimationFrame(function () { cart.classList.add("open"); scrim.classList.add("show"); });
    document.body.style.overflow = "hidden";
    setTimeout(function () { var f = el("cartClose"); if (f) f.focus(); }, 60);
  }
  function closeCart() {
    if (cart.hidden) return;
    cart.classList.remove("open"); scrim.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(function () { cart.hidden = true; scrim.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function lineHtml(l, i, compact) {
    var p = byId(PRODUCTS, l.productId);
    return '<div class="q-item" data-i="' + i + '"><div class="q-thumb">' + productVisual(p, "") + '</div><div class="q-main">' +
      '<h3><a href="#p-' + esc(l.productId) + '">' + esc(l.name) + "</a></h3>" +
      '<div class="sku">' + esc(l.sku) + "</div>" + (attrText(l.attrs) ? '<div class="q-attrs">' + esc(attrText(l.attrs)) + "</div>" : "") +
      '<div class="q-ctrls"><div class="qty sm"><button type="button" data-d="-1" aria-label="Decrease quantity">−</button><input type="number" inputmode="numeric" min="1" value="' + l.qty + '" aria-label="Quantity for ' + esc(l.sku) + '"><button type="button" data-d="1" aria-label="Increase quantity">+</button></div>' +
      (compact ? "" : '<input class="in qnote" maxlength="300" placeholder="Note (optional)" value="' + esc(l.note || "") + '" aria-label="Note for ' + esc(l.sku) + '">') +
      '<button class="textbtn" type="button" data-rm aria-label="Remove ' + esc(l.sku) + '">' + icon("trash") + "Remove</button></div></div></div>";
  }
  function bindLines(root, onChange) {
    $$(".q-item", root).forEach(function (row) {
      var line = quote[parseInt(row.getAttribute("data-i"), 10)]; if (!line) return;
      var qIn = $('input[type="number"]', row);
      function setQ(n) { line.qty = clampQty(n); qIn.value = line.qty; saveQuote(); onChange(false); }
      qIn.addEventListener("change", function () { setQ(qIn.value); });
      $$("[data-d]", row).forEach(function (b) { b.addEventListener("click", function () { setQ(clampQty(qIn.value) + parseInt(b.getAttribute("data-d"), 10)); }); });
      var note = $(".qnote", row); if (note) note.addEventListener("input", function () { line.note = note.value.slice(0, 300); saveQuote(); });
      $("[data-rm]", row).addEventListener("click", function () {
        var idx = quote.indexOf(line); if (idx > -1) quote.splice(idx, 1); saveQuote(); onChange(true); toast("Removed " + line.sku);
      });
    });
  }
  function renderCart() {
    var body = el("cartBody"), foot = el("cartFoot");
    if (!quote.length) {
      body.innerHTML = '<div class="cart-empty">' + icon("list") + '<h3>Your quote list is empty</h3><p>Add products from the catalogue and they will collect here.</p></div>';
      foot.innerHTML = '<a class="btn primary block" href="#catalogue">Browse products</a>';
      return;
    }
    body.innerHTML = quote.map(function (l, i) { return lineHtml(l, i, true); }).join("");
    foot.innerHTML = '<div class="tot"><span>' + plural(quote.length, "item") + '</span><b class="num">' + plural(units(), "unit") + "</b></div>" +
      '<a class="btn primary block" href="#request">Request quotation</a><a class="btn block" href="#quote">Edit list and add notes</a>';
    bindLines(body, function (structural) {
      if (structural) renderCart(); else { var t = $(".tot b", foot); if (t) t.textContent = plural(units(), "unit"); }
      if (currentRoute().name === "quote") render();
    });
  }
  el("cartBtn").addEventListener("click", openCart);
  el("cartClose").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  cart.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[href^='#']"); if (a) closeCart(); });
  cart.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = $$('a[href],button:not([disabled]),input', cart); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- quick add from cards ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-quick]"); if (!b) return;
    e.preventDefault();
    var p = byId(PRODUCTS, b.getAttribute("data-quick")); if (!p) return;
    if (p.steps && p.steps.length) { location.hash = "p-" + p.id; return; }
    addLine(p, p.variants[0], 1, "");
    b.classList.add("added"); setTimeout(function () { b.classList.remove("added"); }, 900);
    toast("Added " + p.name + " to your quote");
  });

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(text) {
    var t = el("toast"); if (!t) return;
    t.textContent = text; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- router ---------- */
  var state = { q: "" };
  function currentRoute() {
    var h = (location.hash || "").replace(/^#\/?/, "");
    try { h = decodeURIComponent(h); } catch (e) {}
    if (!h || h === "home") return { name: "home" };
    var m;
    if ((m = /^c-(.+)$/.exec(h))) return { name: "catalogue", cat: m[1] };
    if ((m = /^p-(.+)$/.exec(h))) return { name: "product", id: m[1] };
    if ((m = /^done-(.+)$/.exec(h))) return { name: "done", ref: m[1] };
    // Old-style links (#/product/x, #/catalogue?cat=y) still resolve.
    if ((m = /^product\/(.+)$/.exec(h))) return { name: "product", id: m[1] };
    if ((m = /^catalogue\?.*cat=([^&]+)/.exec(h))) return { name: "catalogue", cat: m[1] };
    if (/^catalogue/.test(h)) return { name: "catalogue", cat: "" };
    return { name: h.split(/[/?]/)[0] };
  }
  var ROUTES = { home: viewHome, catalogue: viewCatalogue, product: viewProduct, quote: viewQuote, request: viewRequest, done: viewDone, about: viewAbout, contact: viewContact };
  var lastHash = null;
  function render() {
    var r = currentRoute(), view = ROUTES[r.name] || viewNotFound;
    try {
      app.innerHTML = '<div class="page">' + view(r) + "</div>";
      if (view.after) view.after(r);
    } catch (err) {
      if (window.console) console.error(err);
      app.innerHTML = '<div class="wrap section"><div class="empty"><h3>Something went wrong</h3><p>Please reload the page. Your quote list is saved.</p><a class="btn primary" href="#home">Back to home</a></div></div>';
    }
    $$(".nav a").forEach(function (a) {
      var k = a.getAttribute("data-nav"), on = k === r.name || (k === "catalogue" && r.name === "product");
      a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $$(".tabbar a").forEach(function (t) {
      var k = t.getAttribute("data-tab"), on = k === r.name || (k === "catalogue" && r.name === "product") || (k === "quote" && (r.name === "request" || r.name === "done"));
      t.classList.toggle("on", on); if (on) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    closeDrawer();
    if (lastHash !== null && lastHash !== location.hash) { window.scrollTo(0, 0); try { app.focus({ preventScroll: true }); } catch (e) {} }
    lastHash = location.hash;
    document.title = (view.title ? view.title(r) + " | " : "") + "Merit Medical Maldives";
    updateCount();
  }
  window.addEventListener("hashchange", function () { closeCart(); render(); });

  /* ---------- shared pieces ---------- */
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>' + items.map(function (it) {
      return '<span class="sep" aria-hidden="true">/</span>' + (it[1] ? '<a href="' + it[1] + '">' + esc(it[0]) + "</a>" : '<span aria-current="page">' + esc(it[0]) + "</span>");
    }).join("") + "</nav>";
  }
  function productCard(p) {
    var cfg = p.steps && p.steps.length;
    return '<article class="pcard"><a class="pcard-link" href="#p-' + esc(p.id) + '"><div class="pimg">' + productVisual(p, p.name) +
      (cfg ? '<span class="tag">' + plural(p.variants.length, "option") + "</span>" : "") + "</div>" +
      '<div class="pbody"><h3>' + esc(p.name) + '</h3><span class="brandline">' + esc(p.brand) + '</span><span class="meta">' + (cfg ? "Choose size &amp; pack" : "Ready to add") + "</span></div></a>" +
      '<button class="quick" type="button" data-quick="' + esc(p.id) + '" aria-label="' + (cfg ? "Choose options for " : "Add to quote: ") + esc(p.name) + '">' + icon(cfg ? "sliders" : "plus") + "</button></article>";
  }
  function band() {
    return '<section class="section"><div class="wrap"><div class="band"><div><h2>Ordering for a hospital, clinic or resort?</h2><p>Send your full list. We reply with pricing and delivery for your island.</p></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#catalogue">Start a quote</a><a class="btn ghost" href="tel:' + esc(tel()) + '">Call ' + esc(CFG.phone) + "</a></div></div></div></section>";
  }
  function tel() { return String(CFG.phone || "").replace(/[^\d+]/g, ""); }
  function searchBox(id, cls, val, ph) {
    return '<form class="search ' + (cls || "") + '" role="search" data-search>' + icon("search") + '<label class="sr-only" for="' + id + '">Search products</label><input id="' + id + '" type="search" placeholder="' + esc(ph || "Search by product name or item code") + '" autocomplete="off" enterkeyhint="search" value="' + esc(val || "") + '">' + (cls === "cat-search" ? "" : '<button class="btn primary sm" type="submit">Search</button>') + "</form>";
  }

  /* ---------- HOME ---------- */
  function viewHome() {
    var h = '<div class="home">' +
      '<div class="home-search wrap">' + searchBox("hq", "", "", "Search gloves, masks, oxygen…") + "</div>" +
      '<nav class="circles wrap" aria-label="Categories">' + CATS.map(function (c) {
        var first = PRODUCTS.filter(function (p) { return p.category === c.id && p.image; })[0];
        return '<a class="circle" href="#c-' + c.id + '"><span class="circle-img">' + (first ? '<img src="' + esc(first.image) + '" alt="" loading="lazy">' : catIcon(c.id)) + "</span><span>" + esc(c.name.split(" & ")[0].replace(" Equipment", "").replace(" Monitoring", "")) + "</span></a>";
      }).join("") + "</nav>" +
      '<section class="wrap"><div class="promo"><div><b>Medical supplies for every island</b><span>Build one list, get one quotation. No account needed.</span></div><a class="btn primary sm" href="#catalogue">Shop all</a></div>' +
      '<div class="perks"><span>' + icon("shield") + "MFDA authorised importer</span><span>" + icon("boat") + "Delivery across the atolls</span><span>" + icon("send") + "Quote in minutes</span></div></section>";

    var featured = ["nitrile-exam-gloves", "oxygen-concentrator", "surgical-masks", "bp-monitor"].map(function (id) { return byId(PRODUCTS, id); }).filter(Boolean);
    h += '<section class="wrap shelf"><div class="shelf-head"><h2>Most requested</h2><a href="#catalogue">See all ' + icon("arrow") + '</a></div><div class="rail">' + featured.map(productCard).join("") + "</div></section>";

    h += '<section class="wrap shelf"><div class="shelf-head"><h2>All products</h2><span class="muted">' + PRODUCTS.length + ' lines</span></div><div class="grid-products">' + PRODUCTS.map(productCard).join("") + "</div></section>";

    h += '<section class="wrap shelf"><div class="how">' +
      [["sliders", "Pick", "Exact size and pack"], ["list", "List", "Saved on this device"], ["send", "Send", "We reply with prices"]]
        .map(function (s) { return "<div>" + icon(s[0]) + "<span><b>" + s[1] + "</b><small>" + s[2] + "</small></span></div>"; }).join("") + "</div></section>";

    if (BRANDS.length) h += '<section class="wrap shelf"><div class="shelf-head"><h2>Brands we supply</h2></div><div class="brands">' + BRANDS.map(brandCell).join("") + "</div></section>";
    return h + band() + "</div>";
  }
  viewHome.after = bindSearchForms;
  function brandCell(b) {
    var inner = b.logo ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" loading="lazy">' :
      '<span class="wordmark"><i aria-hidden="true">' + esc(b.name.charAt(0)) + "</i>" + esc(b.name) + "</span>";
    return '<div class="brand-cell">' + inner + "</div>";
  }
  function bindSearchForms() {
    $$("[data-search]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault(); state.q = $("input", f).value.trim();
        if (currentRoute().name === "catalogue") drawResults(); else location.hash = "catalogue";
      });
    });
  }

  /* ---------- CATALOGUE ---------- */
  function searchProducts(q, cat) {
    var terms = norm(q) ? norm(q).split(" ") : [], raw = String(q || "").trim().toUpperCase();
    return PRODUCTS.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (!terms.length) return true;
      var c = byId(CATS, p.category);
      var hay = norm([p.name, p.brand, p.summary, (p.tags || []).join(" "), c ? c.name : ""].join(" "));
      var skuHit = raw.length >= 3 && p.variants.some(function (v) { return v.sku.toUpperCase().indexOf(raw) > -1; });
      return skuHit || terms.every(function (t) { return hay.indexOf(t) > -1; });
    });
  }
  var curCat = "";
  function viewCatalogue(r) {
    curCat = byId(CATS, r.cat) ? r.cat : "";
    var c = byId(CATS, curCat);
    return '<div class="wrap">' + crumbs(c ? [["Products", "#catalogue"], [c.name]] : [["Products"]]) +
      '<div class="page-head"><h1>' + (c ? esc(c.name) : "All products") + "</h1><p>" + (c ? esc(c.blurb) : "Search or filter, then open a product to choose options and add it to your quote.") + "</p></div>" +
      '<div class="cat-layout"><aside class="filters" aria-label="Categories"><h2>Category</h2><div class="chips">' +
      '<a class="chip' + (!curCat ? " on" : "") + '" href="#catalogue"' + (!curCat ? ' aria-current="page"' : "") + '>All products <span class="n">' + PRODUCTS.length + "</span></a>" +
      CATS.map(function (x) {
        var n = PRODUCTS.filter(function (p) { return p.category === x.id; }).length, on = curCat === x.id;
        return '<a class="chip' + (on ? " on" : "") + '" href="#c-' + x.id + '"' + (on ? ' aria-current="page"' : "") + ">" + esc(x.name) + ' <span class="n">' + n + "</span></a>";
      }).join("") + "</div></aside><div>" + searchBox("cq", "cat-search", state.q, "Search by name, brand or item code") + '<div id="results"></div></div></div></div>';
  }
  viewCatalogue.title = function (r) { var c = byId(CATS, r.cat); return c ? c.name : "Products"; };
  viewCatalogue.after = function () {
    var input = el("cq"), t;
    input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = input.value.trim(); drawResults(); }, 140); });
    bindSearchForms(); drawResults();
  };
  function drawResults() {
    var box = el("results"); if (!box) return;
    var list = searchProducts(state.q, curCat);
    box.innerHTML = '<div class="result-meta"><span>' + plural(list.length, "product") + (state.q ? " matching “" + esc(state.q) + "”" : "") + "</span>" +
      (state.q ? '<button class="textbtn" type="button" id="clearQ" style="color:var(--brand)">Clear search</button>' : "") + "</div>" +
      (list.length ? '<div class="grid-products">' + list.map(productCard).join("") + "</div>" :
        '<div class="empty">' + icon("search") + "<h3>No products match</h3><p>Try another word or item code, or ask us. We stock more than is listed here.</p><a class=\"btn\" href=\"#contact\">Ask our sales team</a></div>");
    var c = el("clearQ"); if (c) c.addEventListener("click", function () { state.q = ""; el("cq").value = ""; drawResults(); el("cq").focus(); });
  }

  /* ---------- PRODUCT + CONFIGURATOR ---------- */
  var cfgState = null;
  function viewProduct(r) {
    var p = byId(PRODUCTS, r.id); if (!p) return viewNotFound();
    var c = byId(CATS, p.category), specs = p.specs || {};
    var rows = Object.keys(specs).map(function (k) { return "<tr><th scope=\"row\">" + esc(k) + "</th><td>" + esc(specs[k]) + "</td></tr>"; }).join("");
    return '<div class="wrap">' + crumbs([["Products", "#catalogue"]].concat(c ? [[c.name, "#c-" + c.id]] : []).concat([[p.name]])) +
      '<div class="prod"><div class="p-gal"><div class="gallery"><div class="pimg">' + productVisual(p, p.name) + "</div></div></div>" +
      '<div class="p-info"><span class="brandline">' + esc(p.brand) + "</span><h1>" + esc(p.name) + '</h1><p class="lead">' + esc(p.summary) + '</p><div class="cfg" id="cfg"></div></div>' +
      '<div class="p-specs">' + (rows ? '<div class="specs-box"><h2>Specifications</h2><table class="specs">' + rows + "</table></div>" : "") +
      (p.datasheet ? '<a class="btn" style="margin-top:14px" href="' + esc(p.datasheet) + '" target="_blank" rel="noopener">Download datasheet</a>' : "") + "</div></div></div>";
  }
  viewProduct.title = function (r) { var p = byId(PRODUCTS, r.id); return p ? p.name : "Not found"; };
  viewProduct.after = function (r) {
    var p = byId(PRODUCTS, r.id); if (!p) return;
    cfgState = { product: p, sel: {}, qty: 1, note: "" }; autoSelect(); drawCfg(); productLd(p);
  };
  function matching(p, sel, upto) {
    var steps = p.steps || [];
    return p.variants.filter(function (v) { for (var i = 0; i < upto; i++) { var k = steps[i].key; if (sel[k] != null && v.attrs[k] !== sel[k]) return false; } return true; });
  }
  function uniq(a) { var o = [], s = {}; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function autoSelect() {
    var p = cfgState.product, steps = p.steps || [], sel = cfgState.sel;
    for (var i = 0; i < steps.length; i++) {
      var k = steps[i].key, avail = uniq(matching(p, sel, i).map(function (v) { return v.attrs[k]; }));
      if (sel[k] != null && avail.indexOf(sel[k]) === -1) delete sel[k];
      if (sel[k] == null && avail.length === 1) sel[k] = avail[0];
      if (sel[k] == null) { for (var j = i + 1; j < steps.length; j++) delete sel[steps[j].key]; break; }
    }
  }
  function resolved() {
    var p = cfgState.product, steps = p.steps || [];
    if (!steps.length) return p.variants[0] || null;
    for (var i = 0; i < steps.length; i++) if (cfgState.sel[steps[i].key] == null) return null;
    var m = matching(p, cfgState.sel, steps.length); return m.length === 1 ? m[0] : null;
  }
  function drawCfg() {
    var box = el("cfg"); if (!box || !cfgState) return;
    var p = cfgState.product, steps = p.steps || [], sel = cfgState.sel;
    var done = steps.filter(function (s) { return sel[s.key] != null; }).length, v = resolved();
    var h = '<div class="cfg-head"><h2>' + (steps.length ? "Choose options" : "Add to your quote") + "</h2>" + (steps.length ? "<span>" + done + " of " + steps.length + " chosen</span>" : "") + "</div>";
    if (steps.length) {
      h += '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(done / steps.length * 100) + '%"></i></div>';
      var locked = false;
      steps.forEach(function (s, i) {
        var all = uniq(p.variants.map(function (x) { return x.attrs[s.key]; }));
        var avail = locked ? [] : uniq(matching(p, sel, i).map(function (x) { return x.attrs[s.key]; }));
        var isDone = sel[s.key] != null;
        h += '<div class="cstep' + (isDone ? " done" : "") + (locked ? " locked" : "") + '" role="group" aria-labelledby="sl' + i + '"><div class="cstep-label" id="sl' + i + '"><span class="dot">' + icon("check") + "</span>" + esc(s.label) +
          (isDone ? '<span class="val">' + esc(sel[s.key]) + "</span>" : "") + '</div><div class="opts">' +
          all.map(function (val) {
            var en = avail.indexOf(val) > -1, on = sel[s.key] === val;
            return '<button type="button" class="opt' + (on ? " on" : "") + '" data-k="' + esc(s.key) + '" data-v="' + esc(val) + '"' + (en ? "" : " disabled") + ' aria-pressed="' + on + '"' + (en || locked ? "" : ' title="Not available with your earlier choices"') + ">" + esc(val) + "</button>";
          }).join("") + "</div></div>";
        if (!isDone) locked = true;
      });
    }
    h += v ? '<div class="resolved"><span>' + (steps.length ? "Your item" : "Item code") + '</span><span class="sku">' + esc(v.sku) + "</span></div>"
      : '<div class="resolved pending">Finish the steps above to see your item code.</div>';
    h += '<div class="add-row"><div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><input id="qtyIn" type="number" inputmode="numeric" min="1" max="99999" value="' + cfgState.qty + '" aria-label="Quantity"><button type="button" data-q="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn primary" id="addBtn" type="button"' + (v ? "" : " disabled") + ">Add to quote</button></div>" +
      '<label class="sr-only" for="noteIn">Note for this item</label><input class="in note-in" id="noteIn" maxlength="300" placeholder="Note, e.g. preferred brand or delivery date (optional)" value="' + esc(cfgState.note) + '">' +
      '<p class="fine">Prices are given in your quotation.' + (steps.length ? " Dashed options are not stocked with your earlier choices." : "") + "</p>";
    box.innerHTML = h;

    $$(".opt", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-k"), val = b.getAttribute("data-v");
        if (cfgState.sel[k] === val) {
          delete cfgState.sel[k];
          var idx = steps.map(function (s) { return s.key; }).indexOf(k);
          for (var j = idx + 1; j < steps.length; j++) delete cfgState.sel[steps[j].key];
        } else cfgState.sel[k] = val;
        autoSelect(); drawCfg();
        var next = $(".cstep:not(.done) .opt:not(:disabled)", box) || el("addBtn");
        if (next) { try { next.focus({ preventScroll: true }); } catch (e) {} }
      });
    });
    var qIn = el("qtyIn");
    qIn.addEventListener("change", function () { cfgState.qty = clampQty(qIn.value); qIn.value = cfgState.qty; });
    $$("[data-q]", box).forEach(function (b) { b.addEventListener("click", function () { cfgState.qty = clampQty(clampQty(qIn.value) + parseInt(b.getAttribute("data-q"), 10)); qIn.value = cfgState.qty; }); });
    el("noteIn").addEventListener("input", function (e) { cfgState.note = e.target.value; });
    el("addBtn").addEventListener("click", function () {
      var vv = resolved(); if (!vv) return;
      addLine(p, vv, clampQty(qIn.value), cfgState.note);
      var b = el("cartBtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
      cfgState.note = ""; cfgState.qty = 1; if (steps.length) { cfgState.sel = {}; autoSelect(); }
      drawCfg(); openCart();
    });
  }
  function productLd(p) {
    var o = el("prodLd"); if (o) o.parentNode.removeChild(o);
    var s = document.createElement("script"); s.type = "application/ld+json"; s.id = "prodLd";
    s.text = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, brand: { "@type": "Brand", name: p.brand }, description: p.summary, sku: p.variants[0] && p.variants[0].sku, category: (byId(CATS, p.category) || {}).name });
    document.head.appendChild(s);
  }

  /* ---------- QUOTE PAGE ---------- */
  function viewQuote() {
    var h = '<div class="wrap">' + crumbs([["Quote list"]]) + '<div class="page-head"><h1>Your quote list</h1><p>' +
      (store.persistent ? "Saved on this device." : "Your browser is not saving data, so this list lasts for this visit only.") + " Adjust quantities, add notes, then send it to us.</p></div>";
    if (!quote.length) return h + '<div class="empty" style="margin-bottom:72px">' + icon("list") + '<h3>Your quote list is empty</h3><p>Browse the catalogue and add the items you need.</p><a class="btn primary" href="#catalogue">Browse products</a></div></div>';
    return h + '<div class="q-layout"><div class="q-list" id="qList">' + quote.map(function (l, i) { return lineHtml(l, i, false); }).join("") + "</div>" +
      '<aside class="summary"><h2>Summary</h2><div class="row"><span>Items</span><b class="num" id="sLines">' + quote.length + '</b></div><div class="row"><span>Total units</span><b class="num" id="sUnits">' + units() + '</b></div><div class="row"><span>Pricing</span><b>In your quotation</b></div>' +
      '<a class="btn primary block" style="margin-top:16px" href="#request">Request quotation</a><a class="btn block" style="margin-top:10px" href="#catalogue">Add more products</a>' +
      '<div style="text-align:center;margin-top:10px"><button class="textbtn" id="clearAll" type="button">' + icon("trash") + "Clear list</button></div></aside></div></div>";
  }
  viewQuote.title = function () { return "Quote list"; };
  viewQuote.after = function () {
    var list = el("qList");
    if (list) bindLines(list, function (structural) {
      if (structural) render(); else { el("sLines").textContent = quote.length; el("sUnits").textContent = units(); }
    });
    var c = el("clearAll");
    if (c) c.addEventListener("click", function () {
      if (c.getAttribute("data-armed")) { quote = []; saveQuote(); render(); toast("Quote list cleared"); return; }
      c.setAttribute("data-armed", "1"); c.innerHTML = icon("trash") + "Click again to clear";
      setTimeout(function () { if (c.isConnected) { c.removeAttribute("data-armed"); c.innerHTML = icon("trash") + "Clear list"; } }, 3000);
    });
  };

  /* ---------- REQUEST ---------- */
  var formOpenedAt = 0, DRAFT = "mm_contact_v1";
  function viewRequest() {
    if (!quote.length) { setTimeout(function () { location.replace("#quote"); }, 0); return ""; }
    var d = store.get(DRAFT, {}) || {};
    function f(id, label, type, req, extra) {
      return '<div class="field"><label for="' + id + '">' + label + (req ? ' <span class="req" aria-hidden="true">*</span>' : "") + '</label><input class="in" id="' + id + '" name="' + id + '" type="' + type + '"' + (req ? " required" : "") + ' value="' + esc(d[id] || "") + '" ' + (extra || "") + ' aria-describedby="' + id + 'Err"><span class="err-msg" id="' + id + 'Err"></span></div>';
    }
    return '<div class="wrap">' + crumbs([["Quote list", "#quote"], ["Request quotation"]]) + '<div class="page-head"><h1>Request quotation</h1><p>Tell us where to send your quotation. Fields marked * are required.</p></div>' +
      '<div class="q-layout"><form class="summary" id="reqForm" novalidate style="position:static"><div class="form-grid">' +
      f("name", "Full name", "text", true, 'autocomplete="name" maxlength="100"') +
      f("org", "Organisation", "text", true, 'autocomplete="organization" maxlength="120" placeholder="Hospital, clinic, resort or pharmacy"') +
      f("phone", "Phone", "tel", true, 'autocomplete="tel" inputmode="tel" maxlength="30" placeholder="+960"') +
      f("email", "Email", "email", true, 'autocomplete="email" inputmode="email" maxlength="120"') +
      '<div class="field full"><label for="island">Delivery island <span class="req" aria-hidden="true">*</span></label><select class="in" id="island" required aria-describedby="islandErr"><option value="">Choose an island</option>' +
      (window.MM_ISLANDS || []).map(function (x) { return "<option" + (d.island === x ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("") + '</select><span class="err-msg" id="islandErr"></span></div>' +
      '<div class="field full"><label for="msg">Message</label><textarea class="in" id="msg" maxlength="2000" placeholder="Delivery timing, acceptable alternatives, anything else">' + esc(d.msg || "") + "</textarea></div>" +
      '<div class="hp" aria-hidden="true"><label for="website">Leave this empty</label><input id="website" tabindex="-1" autocomplete="off"></div></div>' +
      '<div id="formNotice"></div><button class="btn primary block" id="sendBtn" type="submit" style="margin-top:20px">Send request</button>' +
      '<p class="muted" style="font-size:.85rem;margin:12px 0 0;text-align:center">We use these details only to reply to this request.</p></form>' +
      '<aside class="summary"><h2>' + plural(quote.length, "item") + ", " + plural(units(), "unit") + "</h2>" +
      quote.map(function (l) { return '<div class="row"><span style="min-width:0"><span style="color:var(--ink)">' + esc(l.name) + '</span><br><span class="sku">' + esc(l.sku) + '</span></span><b class="num">× ' + l.qty + "</b></div>"; }).join("") +
      '<a class="link" href="#quote" style="display:inline-block;margin-top:12px">Edit list</a></aside></div></div>';
  }
  viewRequest.title = function () { return "Request quotation"; };
  viewRequest.after = function () {
    var form = el("reqForm"); if (!form) return;
    formOpenedAt = Date.now();
    var fields = ["name", "org", "phone", "email", "island", "msg"];
    fields.forEach(function (id) {
      var x = el(id);
      x.addEventListener("input", function () { var d = {}; fields.forEach(function (k) { d[k] = el(k).value; }); store.set(DRAFT, d); if (x.classList.contains("bad")) validate(id); });
      x.addEventListener("blur", function () { if (x.value) validate(id); });
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); submitRequest(); });
  };
  function validate(id) {
    var x = el(id), v = x.value.trim(), m = "";
    if (x.required && !v) m = "Please fill this in";
    else if (id === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = "Enter an email address like name@example.com";
    else if (id === "phone" && v && v.replace(/\D/g, "").length < 7) m = "Enter a phone number with at least 7 digits";
    x.classList.toggle("bad", !!m); x.setAttribute("aria-invalid", m ? "true" : "false");
    var e = el(id + "Err"); if (e) e.textContent = m; return !m;
  }
  function makeRef() {
    var d = new Date(), ymd = String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = "", rnd = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(4)) : [1, 2, 3, 4].map(function () { return Math.floor(Math.random() * 1e9); });
    for (var i = 0; i < 4; i++) r += ch[rnd[i] % ch.length];
    return "MMQ-" + ymd + "-" + r;
  }
  function requestText(q) {
    return "Quotation request " + q.ref + "\n\nName: " + q.name + "\nOrganisation: " + q.org + "\nPhone: " + q.phone + "\nEmail: " + q.email + "\nDelivery island: " + q.island + "\n" +
      (q.msg ? "\nMessage:\n" + q.msg + "\n" : "") + "\nItems (" + q.items.length + "):\n" +
      q.items.map(function (l, i) { return (i + 1) + ". " + l.sku + "  x" + l.qty + "  " + l.name + (attrText(l.attrs) ? " (" + attrText(l.attrs) + ")" : "") + (l.note ? "\n   Note: " + l.note : ""); }).join("\n") + "\n\nSent: " + q.when;
  }
  function mailto(q) {
    var body = requestText(q); if (body.length > 1800) body = body.slice(0, 1750) + "\n(list continues: use Copy request on the confirmation page)";
    return "mailto:" + encodeURIComponent(CFG.email || "") + "?subject=" + encodeURIComponent("Quotation request " + q.ref + ", " + q.org) + "&body=" + encodeURIComponent(body);
  }
  function submitRequest() {
    var notice = el("formNotice"); notice.innerHTML = "";
    var ok = ["name", "org", "phone", "email", "island"].map(validate).every(Boolean);
    if (!ok) { var b = $(".in.bad"); if (b) b.focus(); notice.innerHTML = '<div class="notice" role="alert">Some fields need attention. They are marked in red.</div>'; return; }
    if (el("website").value || Date.now() - formOpenedAt < 2500) { notice.innerHTML = '<div class="notice" role="alert">That was very quick. Please wait a moment and send again.</div>'; return; }
    var q = { ref: makeRef(), name: el("name").value.trim(), org: el("org").value.trim(), phone: el("phone").value.trim(), email: el("email").value.trim(), island: el("island").value, msg: el("msg").value.trim(),
      items: quote.map(function (l) { return { sku: l.sku, name: l.name, attrs: l.attrs, qty: l.qty, note: l.note || "" }; }), when: new Date().toISOString() };
    var btn = el("sendBtn"); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending';
    deliver(q, function (method, err) {
      q.method = method;
      var log = store.get("mm_requests_v1", []); if (!Array.isArray(log)) log = []; log.unshift(q); store.set("mm_requests_v1", log.slice(0, 20));
      if (method === "failed") {
        btn.disabled = false; btn.textContent = "Send request";
        notice.innerHTML = '<div class="notice" role="alert">We could not send your request (' + esc(err || "network error") + '). Your list is safe. <a class="link" href="' + mailto(q) + '">Send it by email instead</a> or call ' + esc(CFG.phone) + ".</div>";
        return;
      }
      quote = []; saveQuote(); location.hash = "done-" + q.ref;
    });
  }
  function deliver(q, cb) {
    var text = requestText(q), url = null, payload = null;
    if (CFG.web3formsKey) { url = "https://api.web3forms.com/submit"; payload = { access_key: CFG.web3formsKey, subject: "Quotation request " + q.ref + ", " + q.org, from_name: "Merit Medical website", replyto: q.email, name: q.name, email: q.email, message: text, ccemail: q.email }; }
    else if (CFG.formEndpoint) { url = CFG.formEndpoint; payload = { request: q, text: text }; }
    if (!url || !window.fetch) { try { window.location.href = mailto(q); } catch (e) {} setTimeout(function () { cb("email-app"); }, 400); return; }
    var done = false, timer = setTimeout(function () { if (!done) { done = true; cb("failed", "timed out"); } }, 15000);
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.success !== false, j: j }; }); })
      .then(function (res) { if (done) return; done = true; clearTimeout(timer); cb(res.ok ? "sent" : "failed", res.ok ? null : (res.j && res.j.message) || "server error"); })
      .catch(function (e) { if (done) return; done = true; clearTimeout(timer); cb("failed", e && e.message); });
  }

  /* ---------- CONFIRMATION ---------- */
  function findReq(ref) { var log = store.get("mm_requests_v1", []) || []; for (var i = 0; i < log.length; i++) if (log[i].ref === ref) return log[i]; return null; }
  function viewDone(r) {
    var q = findReq(r.ref);
    if (!q) return '<div class="wrap"><div class="confirm"><h1 style="font-size:1.6rem">This request is not on this device</h1><p class="muted">If you sent a request, keep your reference number and contact us on ' + esc(CFG.phone) + '.</p><a class="btn primary" href="#home">Back to home</a></div></div>';
    var viaApp = q.method === "email-app";
    return '<div class="wrap"><div class="confirm"><div class="check">' + icon("check") + "</div>" +
      '<h1 style="font-size:clamp(1.6rem,4vw,2.2rem)">' + (viaApp ? "One more step: press send" : "Request sent") + "</h1>" +
      '<p class="muted">' + (viaApp ? "Your email app should have opened with the request filled in. Press send to deliver it to our sales team. If it did not open, use Copy request and email it to " + esc(CFG.email) + "." :
        "Thank you, " + esc(q.name.split(" ")[0]) + ". Our sales team has your list and will reply to " + esc(q.email) + " with pricing.") + "</p>" +
      '<div class="muted" style="font-size:.9rem">Your reference</div><div class="ref">' + esc(q.ref) + "</div>" +
      "<table>" + q.items.map(function (l) { return "<tr><td>" + esc(l.name) + (attrText(l.attrs) ? '<br><span class="muted" style="font-size:.85rem">' + esc(attrText(l.attrs)) + "</span>" : "") + '</td><td><span class="sku">' + esc(l.sku) + '</span> <b class="num">× ' + l.qty + "</b></td></tr>"; }).join("") + "</table>" +
      '<div class="actions">' + (viaApp ? '<a class="btn primary" href="' + mailto(q) + '">Open email again</a>' : "") +
      '<button class="btn" id="copyReq" type="button">Copy request</button><button class="btn" id="printReq" type="button">Print</button><a class="btn' + (viaApp ? "" : " primary") + '" href="#catalogue">Continue browsing</a></div></div></div>';
  }
  viewDone.title = function () { return "Request received"; };
  viewDone.after = function (r) {
    var p = el("printReq"); if (p) p.addEventListener("click", function () { try { window.print(); } catch (e) {} });
    var b = el("copyReq"); if (!b) return;
    b.addEventListener("click", function () {
      var q = findReq(r.ref); if (!q) return; var txt = requestText(q);
      function fb() { var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("Request copied"); } catch (e) { toast("Copy is not available in this browser"); } document.body.removeChild(ta); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("Request copied"); }, fb); else fb();
    });
  };

  /* ---------- ABOUT ---------- */
  function viewAbout() {
    return '<div class="wrap">' + crumbs([["About"]]) + '<div class="two" style="padding-bottom:56px"><div class="prose">' +
      '<svg class="about-logo" viewBox="0 0 1000 919" role="img" aria-label="Merit Medical Maldives logo"><use href="logo-full.svg#m"/></svg>' +
      "<h1>About Merit Medical Maldives</h1>" +
      "<p>Merit Medical Maldives is the first subsidiary of VIYANA Pvt Ltd. We import, distribute, maintain and support medical devices, equipment and disposables for the healthcare and commercial sectors across the Maldives.</p>" +
      "<p>We supply medical consumables and pharmaceuticals to hospitals, clinics, resorts and pharmacies. Our office is at Carpenter Villa in Malé.</p>" +
      '<p><a class="btn primary" href="#catalogue">Browse the catalogue</a></p></div>' +
      '<div class="facts">' +
      [["shield", "MFDA authorised importer", "Listed by the Maldives Food and Drug Authority as an authorised importer."],
       ["boat", "Import and distribution", "Sourcing from manufacturers abroad and delivering to islands and resorts."],
       ["wrench", "Maintenance and support", "Support for the medical devices and equipment we supply."],
       ["building", "Part of VIYANA Pvt Ltd", "A Maldivian company, based in Malé."]]
        .map(function (f) { return "<div>" + icon(f[0]) + "<span><h3>" + f[1] + "</h3><p>" + f[2] + "</p></span></div>"; }).join("") +
      "</div></div></div>" + band();
  }
  viewAbout.title = function () { return "About"; };

  /* ---------- CONTACT ---------- */
  function contactItems() {
    var items = [
      ["phone", "Phone", CFG.phone, "tel:" + tel()],
      ["chat", "WhatsApp", CFG.whatsapp ? CFG.phone : "", CFG.whatsapp ? "https://wa.me/" + CFG.whatsapp : ""],
      ["mail", "Email", CFG.email, "mailto:" + CFG.email],
      ["pin", "Office", CFG.address, "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CFG.mapQuery || CFG.address || "")],
      ["clock", "Hours", CFG.hours, ""],
      ["fb", "Facebook", CFG.facebook ? "Merit Medical Maldives" : "", CFG.facebook],
      ["li", "LinkedIn", CFG.linkedin ? "Merit Medical Maldives" : "", CFG.linkedin]
    ];
    return items.filter(function (x) { return x[2]; });
  }
  function viewContact() {
    return '<div class="wrap">' + crumbs([["Contact"]]) + '<div class="page-head"><h1>Contact our sales team</h1><p>Questions about a product, bulk pricing or delivery to your island? Call or email us, or build a quote list and send it in one go.</p></div>' +
      '<div class="two" style="padding-bottom:72px"><div><div class="contact-list">' +
      contactItems().map(function (c) {
        var inner = '<span class="ico">' + icon(c[0]) + "</span><span><small>" + c[1] + "</small><b>" + esc(c[2]) + "</b></span>";
        return c[3] ? '<a class="contact-item" href="' + esc(c[3]) + '"' + (/^https?:/.test(c[3]) ? ' target="_blank" rel="noopener"' : "") + ">" + inner + "</a>" : '<div class="contact-item">' + inner + "</div>";
      }).join("") + '</div><a class="btn primary" href="#catalogue" style="margin-top:20px">Start a quote list</a></div>' +
      '<div class="map"><iframe title="Map of our office at Carpenter Villa, Malé" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(CFG.mapQuery || "Male, Maldives") + '&z=16&output=embed"></iframe></div></div></div>';
  }
  viewContact.title = function () { return "Contact"; };

  function viewNotFound() {
    return '<div class="wrap section"><div class="empty"><h1 style="font-size:1.8rem;color:var(--ink)">Page not found</h1><p>This page has moved or does not exist.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn primary" href="#home">Back to home</a><a class="btn" href="#catalogue">Browse products</a></div></div></div>';
  }
  viewNotFound.title = function () { return "Not found"; };

  /* ---------- chrome ---------- */
  var drawer = el("drawer"), menuBtn = el("menuBtn");
  function closeDrawer() { if (drawer && drawer.classList.contains("open")) { drawer.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Open menu"); document.body.style.overflow = ""; } }
  menuBtn.addEventListener("click", function () {
    var open = !drawer.classList.contains("open");
    drawer.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });
  drawer.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) closeDrawer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCart(); closeDrawer(); } });
  window.addEventListener("resize", function () { if (window.innerWidth >= 900) closeDrawer(); });

  el("ftrCats").innerHTML = CATS.map(function (c) { return '<li><a href="#c-' + c.id + '">' + esc(c.name) + "</a></li>"; }).join("");
  el("ftrContact").innerHTML = contactItems().filter(function (c) { return c[0] !== "clock"; }).map(function (c) {
    return "<li>" + (c[3] ? '<a href="' + esc(c[3]) + '"' + (/^https?:/.test(c[3]) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(c[0] === "fb" || c[0] === "li" ? c[1] : c[2]) + "</a>" : esc(c[2])) + "</li>";
  }).join("");
  el("drawerFoot").innerHTML = '<a href="tel:' + esc(tel()) + '">' + esc(CFG.phone) + '</a><br><a href="mailto:' + esc(CFG.email) + '">' + esc(CFG.email) + "</a>";
  el("yr").textContent = new Date().getFullYear();

  window.addEventListener("storage", function (e) {
    if (e.key === QKEY) { quote = store.get(QKEY, []) || []; updateCount(); if (currentRoute().name === "quote") render(); }
  });

  render();
})();
