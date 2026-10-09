(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var COMPANY = window.SITE_COMPANY || {};
  var FEEDBACK = window.SITE_FEEDBACK || { quotes: [], results: [] };
  var CONTENT = window.SITE_CONTENT || {};
  var OVERVIEW = window.SITE_OVERVIEW || { groups: [] };

  var NAV = [
    ["index.html", "My profile"],
    ["journey.html", "My journey"],
    ["development.html", "My development"],
    ["links.html", "Quick links"],
    ["learning.html", "Learning"],
    ["company.html", "Company hub"],
    ["reflection.html", "Reflection"],
    ["achievements.html", "Achievements"]
  ];
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
      var btn = el("button", { class: "menu-btn", type: "button", "aria-expanded": "false", "aria-controls": "main-nav", text: "Menu" });
      wrap.appendChild(btn);
      var nav = el("nav", { id: "main-nav", "aria-label": "Main" });
      var ul = el("ul");
      NAV.forEach(function (n) {
        var a = el("a", { href: n[0], text: n[1] });
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

  function run() {
    buildChrome();
    document.querySelectorAll("[data-render]").forEach(function (t) {
      var fn = R[t.getAttribute("data-render")];
      if (fn) fn(t);
    });
    var title = document.querySelector("title");
    if (title && COMPANY.name && title.textContent.indexOf(COMPANY.name) === -1) title.textContent += " | " + COMPANY.name + " " + (CFG.hubName || "");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
