// Applies the saved settings (config.js, or a newer draft from the admin page) to index.html.
(function () {
  "use strict";
  var KEY = "uraviCardDraft", DB = "uraviCardMedia";
  var FONTS = ["Plus Jakarta Sans", "Poppins", "Inter", "Nunito", "Montserrat", "Playfair Display", "DM Sans", "Outfit", "Lora", "Space Grotesk"];
  var TEMPLATES = {
    classic:  { name: "Classic",  theme: { primary: "#1c5fc0", secondary: "#2878df", light: "#4b9cff", accent: "#ffb020", radius: 28, font: "Plus Jakarta Sans", align: "center", photo: "circle",  buttons: "filled",  heroH: 168 } },
    minimal:  { name: "Minimal",  theme: { primary: "#0d9488", secondary: "#14b8a6", light: "#5eead4", accent: "#f59e0b", radius: 14, font: "Inter",              align: "center", photo: "circle",  buttons: "outline", heroH: 130, plane: false } },
    aurora:   { name: "Aurora",   theme: { primary: "#7c3aed", secondary: "#db2777", light: "#38bdf8", accent: "#fbbf24", radius: 32, font: "Outfit",             align: "center", photo: "circle",  buttons: "filled",  heroH: 168 } },
    poster:   { name: "Poster",   theme: { primary: "#e11d48", secondary: "#be123c", light: "#fb7185", accent: "#facc15", radius: 8,  font: "Montserrat",         align: "center", photo: "square",  buttons: "filled",  heroH: 150, plane: false } },
    business: { name: "Business", theme: { primary: "#0f766e", secondary: "#14b8a6", light: "#5eead4", accent: "#f97316", radius: 18, font: "DM Sans",            align: "left",   photo: "rounded", buttons: "soft",    heroH: 140 } },
    ticket:    { name: "Ticket",    theme: { primary: "#0f4c81", secondary: "#1d6fb8", light: "#5aa9e6", accent: "#ff6b35", radius: 18, font: "Space Grotesk", align: "left",   photo: "rounded", buttons: "soft",    heroH: 120 } },
    sunset:    { name: "Sunset",    theme: { primary: "#f43f5e", secondary: "#fb923c", light: "#fbbf24", accent: "#7c3aed", radius: 36, font: "Outfit",        align: "center", photo: "circle",  buttons: "filled",  heroH: 230 } },
    editorial: { name: "Editorial", theme: { primary: "#c2410c", secondary: "#9a3412", light: "#fb923c", accent: "#b45309", radius: 8,  font: "Playfair Display", align: "left", photo: "square",  buttons: "outline", heroH: 120, plane: false } }
  };

  // ---- media storage (IndexedDB) used for files uploaded in the admin page ----
  var store = {
    db: function () {
      return this._d || (this._d = new Promise(function (ok, no) {
        var r = indexedDB.open(DB, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore("f"); };
        r.onsuccess = function () { ok(r.result); };
        r.onerror = function () { no(r.error); };
      }));
    },
    tx: function (mode, fn) {
      return this.db().then(function (d) {
        return new Promise(function (ok, no) {
          var t = d.transaction("f", mode), q = fn(t.objectStore("f"));
          t.oncomplete = function () { ok(q && q.result); };
          t.onerror = function () { no(t.error); };
        });
      });
    },
    put: function (id, rec) { return this.tx("readwrite", function (s) { return s.put(rec, id); }); },
    get: function (id) { return this.tx("readonly", function (s) { return s.get(id); }); },
    del: function (id) { return this.tx("readwrite", function (s) { return s["delete"](id); }); }
  };

  function load(force) {
    var pub = window.CARD_PUBLISHED || {}, d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    // A draft only wins while it is newer than the published file.
    // Drafts only apply in the admin page / its preview (?preview=1) - never for real visitors.
    return (force || /[?&]preview=1/.test(location.search)) && d && (force || (d.savedAt || 0) > (pub.savedAt || 0)) ? d : pub;
  }

  function url(ref) {
    if (!ref) return Promise.resolve("");
    if (ref.indexOf("idb:") !== 0) return Promise.resolve(ref);
    return store.get(ref.slice(4)).then(function (r) { return r ? URL.createObjectURL(r.blob) : ""; })["catch"](function () { return ""; });
  }

  window.CardStore = { store: store, KEY: KEY, load: load, url: url, TEMPLATES: TEMPLATES, fonts: FONTS };
  if (document.documentElement.hasAttribute("data-admin")) return;

  // ---- apply settings ----
  var c = window.CARD = load();
  var $ = function (s) { return document.querySelector(s); };
  var T = function (s, v) { var e = $(s); if (e && v != null) e.textContent = v; };
  var col = function (v, d) { return /^#[0-9a-f]{3,8}$/i.test(v || "") ? v : d; };

  document.title = (c.name || "") + " | " + (c.badge || "Digital ID");
  T("#profileName", c.name);
  T(".role", c.tagline);
  T(".bio", c.bio);
  T(".top p", c.badge);
  T(".about-me p", c.about);
  T(".feedback-heading h2", c.feedbackTitle);
  T(".feedback-heading p", c.feedbackSub);

  var ah = $(".about-me .block__title");
  if (ah && c.aboutTitle != null && ah.lastChild) ah.lastChild.textContent = " " + c.aboutTitle;

  var call = $(".save-btn");
  if (call && c.phone) call.href = "tel:" + c.phone;

  var soc = c.social || {};
  [["instagram", ".tile--instagram"], ["facebook", ".tile--facebook"], ["linkedin", ".tile--linkedin"]].forEach(function (p) {
    var a = $(p[1]);
    if (!a || soc[p[0]] == null) return;
    if (soc[p[0]]) a.href = soc[p[0]]; else a.style.display = "none";
  });
  if (c.whatsapp === "") { var w = $(".tile--whatsapp"); if (w) w.style.display = "none"; }

  document.querySelectorAll(".info-box").forEach(function (b, i) {
    var s = (c.stats || [])[i];
    if (!s) return;
    if (s.value != null) b.querySelector(".info-number").textContent = s.value;
    if (s.label != null) b.querySelector(".info-label").textContent = s.label;
  });

  var sh = c.show || {};
  function hide(sel, on) { if (on === false) document.querySelectorAll(sel).forEach(function (e) { e.style.display = "none"; }); }
  hide('[aria-labelledby="socialTitle"]', sh.social);
  hide('[aria-labelledby="toolsTitle"]', sh.tools);
  hide(".about-me", sh.about);
  hide(".info-boxes", sh.stats);
  hide("#feedback, .feedback-jump", sh.feedback);

  // ---- theme ----
  var t = c.theme || {};
  var B = document.body.dataset;
  B.template = TEMPLATES[c.template] ? c.template : "classic";
  B.align = t.align === "left" ? "left" : "center";
  B.photo = t.photo || "circle";
  B.btn = t.buttons || "filled";
  if (TEMPLATES[B.template].dark || B.template === "night") B.dark = ""; else delete B.dark;
  var font = FONTS.indexOf(t.font) > -1 ? t.font : FONTS[0];
  var primary = col(t.primary, "#1c5fc0");
  var radius = Math.max(8, Math.min(40, Number(t.radius) || 28));
  if (font !== FONTS[0]) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/ /g, "+") + ":wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
  var meta = $('meta[name="theme-color"]');
  if (meta) meta.content = primary;

  var css =
    ':root{--blue-deep:' + primary + ';--blue:' + col(t.secondary, "#2878df") + ';--sky:' + col(t.light, "#4b9cff") +
    ';--sun:' + col(t.accent, "#ffb020") + ';--r-card:' + radius + 'px;--font:"' + font + '",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;' +
    '--ice:color-mix(in srgb,var(--sky) 16%,#fff);--mist:color-mix(in srgb,var(--sky) 7%,#fff);' +
    '--line:color-mix(in srgb,var(--sky) 28%,#fff);--navy:color-mix(in srgb,var(--blue-deep) 30%,#000)}' +
    'body{background:radial-gradient(900px 520px at 90% -10%,color-mix(in srgb,var(--sky) 30%,#fff) 0,transparent 60%),' +
    'radial-gradient(700px 520px at -10% 45%,color-mix(in srgb,var(--sky) 18%,#fff) 0,transparent 60%),' +
    'linear-gradient(180deg,color-mix(in srgb,var(--sky) 10%,#fff),color-mix(in srgb,var(--sky) 3%,#fff));background-attachment:fixed}' +
    '.hero,.feedback-heading{background:linear-gradient(135deg,var(--blue-deep) 0%,var(--blue) 50%,var(--sky) 100%)}' +
    '.plane__fold{fill:color-mix(in srgb,var(--blue-deep) 30%,transparent)}' +
    (t.plane === false ? '.plane,.route{display:none}' : '') +
    '.gal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gal figure{margin:0;text-align:left}' +
    '.gal figure:only-child,.gal .v{grid-column:1/-1}' +
    '.gal img,.gal video{width:100%;display:block;aspect-ratio:1/1;object-fit:cover;border-radius:var(--r-tile);border:1px solid var(--line);background:#000}' +
    '.gal .v video{aspect-ratio:16/9;object-fit:contain}.gal img{cursor:zoom-in}' +
    '.gal figcaption{margin:6px 4px 0;font-size:12px;color:var(--muted)}' +
    '.lb{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;background:rgba(0,0,0,.88);cursor:zoom-out}' +
    '.lb img{max-width:94vw;max-height:90vh;border-radius:12px}' +
    '.hero{min-height:' + Math.max(120, Math.min(300, Number(t.heroH) || 168)) + 'px}' + String(c.customCss || "");
  var st = document.createElement("style");
  st.id = "cardTheme";
  st.textContent = css;
  document.head.appendChild(st);

  // ---- uploaded logo / profile photo ----
  var im = c.images || {};
  [[im.logo, ".brand-logo img"], [im.profile, "#profileImage"]].forEach(function (p) {
    if (!p[0]) return;
    url(p[0]).then(function (u) { var e = $(p[1]); if (u && e) e.src = u; });
  });

  // ---- photo / logo position: zoom + left-right + up-down ----
  var nm = function (v, d) { v = Number(v); return isNaN(v) ? d : v; };
  [[im.logoFit, ".brand-logo img"], [im.profileFit, "#profileImage"]].forEach(function (p) {
    var e = $(p[1]), f = p[0];
    if (!e || !f) return;
    var x = nm(f.x, 50), y = nm(f.y, 50), z = Math.max(1, Math.min(3, nm(f.z, 1)));
    e.style.objectPosition = x + "% " + y + "%";
    e.style.transformOrigin = x + "% " + y + "%";
    e.style.transform = "scale(" + z + ")";
    if (z > 1 && e.parentNode) e.parentNode.style.overflow = "hidden";
  });

  // ---- quick links: only appear when links were added ----
  var ql = (c.links || []).filter(function (l) { return l && l.label && /^(https?:|tel:|mailto:)/i.test(l.url || ""); });
  if (ql.length && sh.links !== false) {
    var qs = document.createElement("section");
    qs.className = "block reveal";
    qs.id = "customLinks";
    qs.innerHTML = '<h2 class="block__title"><i class="fa-solid fa-link" aria-hidden="true"></i> <span></span></h2><div class="qlinks"></div>';
    qs.querySelector("span").textContent = c.linksTitle || "Quick Links";
    ql.forEach(function (l) {
      var a = document.createElement("a"), i = document.createElement("i"), sp = document.createElement("span");
      a.className = "qlink"; a.href = l.url;
      if (!/^(tel|mailto):/i.test(l.url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      i.className = "fa-solid " + (/^fa-[a-z0-9-]+$/.test(l.icon || "") ? l.icon : "fa-link");
      sp.textContent = l.label;
      a.appendChild(i); a.appendChild(sp);
      qs.querySelector(".qlinks").appendChild(a);
    });
    var ln = $(".line");
    if (ln) ln.parentNode.insertBefore(qs, ln.nextSibling);
  }

  // ---- optional gallery: only appears when media was added ----
  function lightbox(u) {
    var o = document.createElement("div"), i = document.createElement("img");
    o.className = "lb"; i.src = u; i.alt = "";
    o.appendChild(i);
    o.onclick = function () { o.remove(); };
    document.body.appendChild(o);
  }

  var list = (c.media || []).filter(function (m) { return m && m.src; });
  if (!list.length || sh.gallery === false) return;

  Promise.all(list.map(function (m) { return url(m.src).then(function (u) { return { m: m, u: u }; }); })).then(function (all) {
    all = all.filter(function (x) { return x.u; });
    var anchor = $(".about-me");
    if (!all.length || !anchor) return;

    var sec = document.createElement("section");
    sec.className = "block reveal is-in";
    sec.id = "gallery";
    sec.innerHTML = '<h2 class="block__title"><i class="fa-solid fa-images" aria-hidden="true"></i> <span></span></h2><div class="gal"></div>';
    sec.querySelector("span").textContent = c.galleryTitle || "Gallery";
    var g = sec.querySelector(".gal");

    all.forEach(function (x) {
      var f = document.createElement("figure"), el;
      if (x.m.type === "video") {
        f.className = "v";
        el = document.createElement("video");
        el.controls = true; el.playsInline = true; el.preload = "metadata"; el.src = x.u;
      } else {
        el = document.createElement("img");
        el.src = x.u; el.alt = x.m.caption || ""; el.loading = "lazy";
        el.onclick = function () { lightbox(x.u); };
      }
      f.appendChild(el);
      if (x.m.caption) { var k = document.createElement("figcaption"); k.textContent = x.m.caption; f.appendChild(k); }
      g.appendChild(f);
    });
    anchor.parentNode.insertBefore(sec, anchor);
  });
})();
