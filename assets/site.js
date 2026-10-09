(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var COMPANY = window.SITE_COMPANY || {};
  var FEEDBACK = window.SITE_FEEDBACK || { quotes: [], results: [] };
  var CONTENT = window.SITE_CONTENT || {};
  var OVERVIEW = window.SITE_OVERVIEW || { groups: [] };

  var NAV = [
    ["index.html", "My profile", "profile"],
    ["journey.html", "My journey", "journey"],
    ["development.html", "My development", "development"],
    ["links.html", "Quick links", "links"],
    ["learning.html", "Learning", "learning"],
    ["company.html", "Company hub", "company"],
    ["reflection.html", "Reflection", "reflection"],
    ["achievements.html", "Achievements", "achievements"]
  ];
  // Small line icons (24 x 24 grid). Drawn inline so no icon library or image files are needed.
  var ICONS = {
    profile: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4.5 20.5c0-4 3.5-6 7.5-6s7.5 2 7.5 6"],
    journey: ["M5 21V4", "M5 4h12l-2.5 4L17 12H5"],
    development: ["M4 20h16", "M6 16l4-5 3 3 5-7"],
    links: ["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1", "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"],
    learning: ["M3.5 4.5H9a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5h-6z", "M20.5 4.5H15a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5h6z"],
    company: ["M4 21V7l8-3.5L20 7v14", "M9.5 21v-5h5v5", "M8 10h2M14 10h2M8 13h2M14 13h2"],
    reflection: ["M4 20l4.2-1L19 8.2 15.8 5 5 15.8z", "M13.5 7.3l3.2 3.2"],
    achievements: ["M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 16.9 6.8 19.8l1-5.9L3.5 9.7l5.9-.8z"],
    search: ["M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z", "M20 20l-4.8-4.8"],
    moon: ["M20 14.2A8 8 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2z"],
    sun: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"]
  };
  function icon(name) {
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", "17"); svg.setAttribute("height", "17");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false"); svg.setAttribute("class", "icon");
    svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    (ICONS[name] || []).forEach(function (d) { var p = document.createElementNS(ns, "path"); p.setAttribute("d", d); svg.appendChild(p); });
    return svg;
  }
  var FOOTER = [["help.html", "Help"], ["privacy.html", "Privacy notice"], ["accessibility.html", "Accessibility statement"]];

  // Builds elements with text set safely (never innerHTML).
  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (attrs[k] !== false && attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (kid) {
      if (kid) node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return node;
  }
  function initials(name) {
    return (name || "").trim().split(/\s+/).map(function (p) { return p.charAt(0); }).slice(0, 2).join("").toUpperCase();
  }
  function currentFile() { var f = location.pathname.split("/").pop(); return f || "index.html"; }

  function buildChrome() {
    var page = currentFile();
    var h = document.getElementById("site-header");
    if (h) {
      if (CFG.usingDummyData) {
        h.appendChild(el("div", { class: "banner", role: "note" }, [
          el("div", { class: "wrap", text: "Sample content: the company, people, resources and programme details on this site are invented placeholders for layout review." })
        ]));
      }
      var header = el("header", { class: "site" });
      var wrap = el("div", { class: "wrap" });
      var brand = el("a", { class: "brand" + (CFG.logo && CFG.logoShowsName ? " has-logo-name" : ""), href: "index.html" });
      if (CFG.logo) brand.appendChild(el("img", { class: "brand-logo", src: CFG.logo, alt: CFG.logoAlt || "", height: "40" }));
      // when the logo already shows the company name, only the hub name is written beside it
      brand.appendChild(el("span", { text: CFG.logo && CFG.logoShowsName ? (CFG.hubName || "Graduate Hub") : (COMPANY.name || "") + " " + (CFG.hubName || "Graduate Hub") }));
      if (CFG.favicon && !document.querySelector("link[rel~='icon']")) document.head.appendChild(el("link", { rel: "icon", type: "image/png", href: CFG.favicon }));
      wrap.appendChild(brand);
      // top-right tools: search, dark mode, and (on phones) the menu button
      var tools = el("div", { class: "head-tools" });
      if (window.SiteSearch) {
        var sbtn = el("button", { class: "icon-btn search-btn", type: "button", "aria-expanded": "false", "aria-controls": "search-panel", "aria-label": "Search the hub", title: "Search (press /)" }, [icon("search")]);
        tools.appendChild(sbtn);
        window.SiteSearch.attach(sbtn, header);
      }
      if (window.SiteTheme) {
        var tbtn = el("button", { class: "icon-btn theme-btn", type: "button", "aria-pressed": String(window.SiteTheme.get() === "dark"), "aria-label": "Dark mode", title: "Dark mode" });
        var paint = function () { tbtn.textContent = ""; tbtn.appendChild(icon(window.SiteTheme.get() === "dark" ? "sun" : "moon")); tbtn.setAttribute("aria-pressed", String(window.SiteTheme.get() === "dark")); };
        tbtn.addEventListener("click", function () { window.SiteTheme.set(window.SiteTheme.get() === "dark" ? "light" : "dark"); paint(); });
        paint(); tools.appendChild(tbtn);
      }
      var btn = el("button", { class: "menu-btn", type: "button", "aria-expanded": "false", "aria-controls": "main-nav", text: "Menu" });
      tools.appendChild(btn);
      wrap.appendChild(tools);
      var nav = el("nav", { id: "main-nav", "aria-label": "Main" });
      var ul = el("ul");
      NAV.forEach(function (n) {
        var a = el("a", { href: n[0] }, [icon(n[2]), el("span", { text: n[1] })]);
        if (n[0] === page) a.setAttribute("aria-current", "page");
        ul.appendChild(el("li", {}, [a]));
      });
      nav.appendChild(ul);
      wrap.appendChild(nav);
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
      header.appendChild(wrap);
      h.appendChild(header);
    }
    var f = document.getElementById("site-footer");
    if (f) {
      var footer = el("footer", { class: "site" });
      var fw = el("div", { class: "wrap" });
      var links = el("ul");
      FOOTER.forEach(function (l) {
        var a = el("a", { href: l[0], text: l[1] });
        if (l[0] === page) a.setAttribute("aria-current", "page");
        links.appendChild(el("li", {}, [a]));
      });
      fw.appendChild(links);
      fw.appendChild(el("p", { text: "© " + new Date().getFullYear() + " " + (COMPANY.name || "") + ". " + (CFG.programmeName || "") + ". What you enter in this hub is saved only in your own browser." }));
      footer.appendChild(fw);
      f.appendChild(footer);
    }
  }

  var R = {};

  // About the company (mission, values, culture, size).
  R.aboutCompany = function (t) {
    t.appendChild(el("p", { class: "lead", text: COMPANY.tagline || "" }));
    t.appendChild(el("p", { text: COMPANY.about || "" }));
    var g = el("div", { class: "grid" });
    [["Mission", COMPANY.mission], ["Size and locations", COMPANY.size], ["Culture", COMPANY.culture], ["Why join us", COMPANY.whyJoin]].forEach(function (c) {
      g.appendChild(el("div", { class: "card" }, [el("h3", { text: c[0] }), el("p", { text: c[1] || "" })]));
    });
    t.appendChild(g);
    t.appendChild(el("h3", { text: "Our values" }));
    var v = el("p");
    (COMPANY.values || []).forEach(function (x) { v.appendChild(el("span", { class: "tag", text: x })); });
    t.appendChild(v);
  };

  R.centralTeam = function (t) {
    var ct = COMPANY.centralTeam;
    if (!ct) return;
    t.appendChild(el("p", { text: ct.intro || "" }));
    var ag = el("div", { class: "grid" });
    (ct.areas || []).forEach(function (a) {
      ag.appendChild(el("article", { class: "card" }, [el("h3", { text: a.name }), el("p", { text: a.text })]));
    });
    t.appendChild(ag);
  };

  R.objectives = function (t) {
    t.appendChild(el("h3", { text: "What the scheme is for" }));
    var ol = el("ol");
    (CONTENT.programmeObjectives || []).forEach(function (o) { ol.appendChild(el("li", { text: o })); });
    t.appendChild(ol);
    t.appendChild(el("h3", { text: "By week 12, you will be able to" }));
    var ul = el("ul");
    (CONTENT.graduateObjectives || []).forEach(function (o) { ul.appendChild(el("li", { text: o })); });
    t.appendChild(ul);
  };

  R.overview = function (t) {
    if (OVERVIEW.lead) t.appendChild(el("p", { text: OVERVIEW.lead }));
    (OVERVIEW.groups || []).forEach(function (g) {
      var section = el("section", { class: "skill-group" });
      section.appendChild(el("h4", { text: g.title }));
      if (g.intro) section.appendChild(el("p", { text: g.intro }));
      var grid = el("div", { class: "grid" });
      (g.skills || []).forEach(function (sk) {
        var ul = el("ul");
        (sk.covers || []).forEach(function (c) { ul.appendChild(el("li", { text: c })); });
        grid.appendChild(el("article", { class: "card" }, [
          el("h5", { text: sk.name }),
          el("p", { class: "covers-label", text: "What we'll cover" }),
          ul
        ]));
      });
      section.appendChild(grid);
      t.appendChild(section);
    });
    if (OVERVIEW.note) t.appendChild(el("p", { class: "note", text: OVERVIEW.note }));
  };

  R.feedback = function (t) {
    var q = FEEDBACK.quotes || [];
    if (!q.length) {
      t.appendChild(el("p", { text: "Feedback from previous graduates will appear here once we have our first cohort." }));
      return;
    }
    var wrap = el("div", { class: "quotes" });
    q.forEach(function (x) {
      wrap.appendChild(el("blockquote", {}, [
        el("p", { text: "“" + x.quote + "”" }),
        el("footer", { text: x.name + ", " + x.cohort + ", " + x.team })
      ]));
    });
    t.appendChild(wrap);
    if ((FEEDBACK.results || []).length) {
      var ul = el("ul", { class: "facts" });
      FEEDBACK.results.forEach(function (r) { ul.appendChild(el("li", {}, [el("strong", { text: r.value }), el("span", { text: r.label })])); });
      t.appendChild(ul);
    }
  };

  R.faqs = function (t) {
    t.classList.add("faq");
    (CONTENT.faqs || []).forEach(function (f) {
      t.appendChild(el("details", {}, [el("summary", { text: f.q }), el("p", { text: f.a })]));
    });
  };

  R.contact = function (t) {
    t.appendChild(el("p", {}, ["Email: ", el("a", { href: "mailto:" + CFG.contactEmail, text: CFG.contactEmail })]));
    t.appendChild(el("p", { text: "We aim to reply within 2 working days." }));
  };

  // Shared with the hub scripts (assets/hub/*.js), which add their own renderers before the page is built.
  window.SiteUtil = { el: el, initials: initials };
  window.SiteRenderers = R;

  // Every page except My profile (which has its own greeting card) gets its title and summary in a navy banner.
  function addBanner() {
    var h1 = document.querySelector("main h1");
    if (!h1 || h1.closest(".page-banner") || currentFile() === "index.html") return;
    var lead = h1.nextElementSibling && h1.nextElementSibling.classList.contains("lead") ? h1.nextElementSibling : null;
    var banner = el("div", { class: "page-banner" });
    h1.parentNode.insertBefore(banner, h1);
    banner.appendChild(h1);
    if (lead) banner.appendChild(lead);
  }

  function run() {
    buildChrome();
    addBanner();
    document.querySelectorAll("[data-render]").forEach(function (t) {
      var fn = R[t.getAttribute("data-render")];
      if (fn) fn(t);
    });
    var title = document.querySelector("title");
    if (title && COMPANY.name && title.textContent.indexOf(COMPANY.name) === -1) title.textContent += " | " + COMPANY.name + " " + (CFG.hubName || "");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
