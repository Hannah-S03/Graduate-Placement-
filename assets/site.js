(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var COMPANY = window.SITE_COMPANY || {};
  var TEAM = window.SITE_TEAM || [];
  var FEEDBACK = window.SITE_FEEDBACK || { quotes: [], results: [] };
  var CONTENT = window.SITE_CONTENT || {};
  var OVERVIEW = window.SITE_OVERVIEW || { groups: [] };

  var NAV = [
    ["index.html", "Home"],
    ["about-company.html", "About us"],
    ["meet-the-team.html", "Meet the team"],
    ["about-placement.html", "The placement"],
    ["overview.html", "12-week overview"],
    ["how-to-apply.html", "How to apply"],
    ["graduate-feedback.html", "Graduate feedback"],
    ["faqs.html", "FAQs"],
    ["contact.html", "Contact"]
  ];

  // Small helper: builds elements with text set safely (never innerHTML).
  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (kid) {
      if (kid) node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return node;
  }
  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p.charAt(0); }).slice(0, 2).join("").toUpperCase();
  }
  function currentFile() {
    var f = location.pathname.split("/").pop();
    return f || "index.html";
  }

  function buildChrome() {
    var page = currentFile();
    var h = document.getElementById("site-header");
    if (h) {
      h.className = "site-chrome";
      if (CFG.usingDummyData) {
        h.appendChild(el("div", { class: "banner", role: "note" }, [
          el("div", { class: "wrap", text: "Sample content: the company, people, quotes and programme details on this site are invented placeholders for layout review." })
        ]));
      }
      var header = el("header", { class: "site" });
      var wrap = el("div", { class: "wrap" });
      wrap.appendChild(el("a", { class: "brand", href: "index.html", text: COMPANY.name || "Graduate Placement" }));
      var btn = el("button", { class: "menu-btn", type: "button", "aria-expanded": "false", "aria-controls": "main-nav", text: "Menu" });
      wrap.appendChild(btn);
      var nav = el("nav", { id: "main-nav", "aria-label": "Main" });
      var ul = el("ul");
      NAV.forEach(function (n) {
        var a = el("a", { href: n[0], text: n[1] });
        if (n[0] === page) a.setAttribute("aria-current", "page");
        ul.appendChild(el("li", {}, [a]));
      });
      var apply = el("a", { href: "apply.html", class: "cta", text: "Apply" });
      if (page === "apply.html") apply.setAttribute("aria-current", "page");
      ul.appendChild(el("li", {}, [apply]));
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
      [["looking-for.html", "What we're looking for"], ["privacy.html", "Privacy notice"], ["accessibility.html", "Accessibility statement"], ["contact.html", "Contact"]].forEach(function (l) {
        links.appendChild(el("li", {}, [el("a", { href: l[0], text: l[1] })]));
      });
      fw.appendChild(links);
      fw.appendChild(el("p", { text: "© " + new Date().getFullYear() + " " + (COMPANY.name || "") + ". " + (CFG.programmeName || "") + "." }));
      footer.appendChild(fw);
      f.appendChild(footer);
    }
  }

  var R = {};

  R.facts = function (t) {
    var items = [
      ["12 weeks", "full-time placement"],
      ["3 teams", "rotations across the business"],
      ["1 mentor", "with you throughout"],
      [CFG.nextStartDate || "TBC", "next start date"]
    ];
    var ul = el("ul", { class: "facts" });
    items.forEach(function (i) { ul.appendChild(el("li", {}, [el("strong", { text: i[0] }), el("span", { text: i[1] })])); });
    t.appendChild(ul);
  };

  R.company = function (t) {
    t.appendChild(el("p", { class: "lead", text: COMPANY.tagline || "" }));
    t.appendChild(el("p", { text: COMPANY.about || "" }));
    var g = el("div", { class: "grid" });
    [["Mission", COMPANY.mission], ["Size and locations", COMPANY.size], ["Culture", COMPANY.culture], ["Why join us", COMPANY.whyJoin]].forEach(function (c) {
      g.appendChild(el("div", { class: "card" }, [el("h3", { text: c[0] }), el("p", { text: c[1] || "" })]));
    });
    t.appendChild(g);
    t.appendChild(el("h2", { text: "Our values" }));
    var v = el("p");
    (COMPANY.values || []).forEach(function (x) { v.appendChild(el("span", { class: "tag", text: x })); });
    t.appendChild(v);
    t.appendChild(el("h2", { text: "Teams graduates may work in" }));
    var tv = el("p");
    (COMPANY.teams || []).forEach(function (x) { tv.appendChild(el("span", { class: "tag", text: x })); });
    t.appendChild(tv);
  };

  R.companySummary = function (t) {
    t.appendChild(el("h2", { text: "About " + (COMPANY.name || "us") }));
    t.appendChild(el("p", { text: COMPANY.about || "" }));
    t.appendChild(el("p", {}, [el("a", { href: "about-company.html", text: "More about the company" })]));
  };

  R.team = function (t) {
    var g = el("div", { class: "grid" });
    TEAM.forEach(function (p) {
      g.appendChild(el("article", { class: "card" }, [
        el("div", { class: "avatar", "aria-hidden": "true", text: initials(p.name) }),
        el("h3", { text: p.name }),
        el("p", { class: "tag", text: p.role }),
        el("p", { text: p.bio }),
        el("p", {}, [el("strong", { text: "With graduates: " }), p.with])
      ]));
    });
    t.appendChild(g);
  };

  R.objectives = function (t) {
    t.appendChild(el("h2", { text: "Programme objectives" }));
    var ol = el("ol");
    (CONTENT.programmeObjectives || []).forEach(function (o) { ol.appendChild(el("li", { text: o })); });
    t.appendChild(ol);
    t.appendChild(el("h2", { text: "By week 12, you will be able to" }));
    var ul = el("ul");
    (CONTENT.graduateObjectives || []).forEach(function (o) { ul.appendChild(el("li", { text: o })); });
    t.appendChild(ul);
  };

  R.overview = function (t) {
    if (OVERVIEW.lead) t.appendChild(el("p", { class: "lead", text: OVERVIEW.lead }));
    (OVERVIEW.groups || []).forEach(function (g) {
      var section = el("section", { class: "skill-group", "aria-labelledby": "grp-" + g.title.toLowerCase().replace(/\s+/g, "-") });
      section.appendChild(el("h2", { id: "grp-" + g.title.toLowerCase().replace(/\s+/g, "-"), text: g.title }));
      if (g.intro) section.appendChild(el("p", { text: g.intro }));
      var grid = el("div", { class: "grid" });
      (g.skills || []).forEach(function (sk) {
        var ul = el("ul");
        (sk.covers || []).forEach(function (c) { ul.appendChild(el("li", { text: c })); });
        grid.appendChild(el("article", { class: "card" }, [
          el("h3", { text: sk.name }),
          el("p", { class: "covers-label", text: "What we'll cover" }),
          ul
        ]));
      });
      section.appendChild(grid);
      t.appendChild(section);
    });
    if (OVERVIEW.note) t.appendChild(el("p", { class: "note", text: OVERVIEW.note }));
  };

  R.eligibility = function (t) {
    var ul = el("ul");
    (CONTENT.eligibility || []).forEach(function (x) { ul.appendChild(el("li", { text: x })); });
    t.appendChild(ul);
  };
  R.criteria = function (t) {
    var g = el("div", { class: "grid" });
    (CONTENT.criteria || []).forEach(function (c) { g.appendChild(el("div", { class: "card" }, [el("h3", { text: c.name }), el("p", { text: c.text })])); });
    t.appendChild(g);
  };
  R.process = function (t) {
    var ol = el("ol", { class: "steps" });
    (CONTENT.process || []).forEach(function (s) { ol.appendChild(el("li", {}, [el("strong", { text: s.title }), s.text])); });
    t.appendChild(ol);
  };
  R.dates = function (t) {
    var ul = el("ul");
    ul.appendChild(el("li", { text: "Applications: " + (CFG.applicationsOpen ? "open" : "closed") }));
    ul.appendChild(el("li", { text: "Closing date: " + (CFG.closingDate || "To be confirmed") }));
    ul.appendChild(el("li", { text: "Placement start date: " + (CFG.nextStartDate || "To be confirmed") }));
    t.appendChild(ul);
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
  R.feedbackHighlight = function (t) {
    var q = (FEEDBACK.quotes || [])[0];
    if (!q) { t.hidden = true; return; }
    t.appendChild(el("h2", { text: "What past graduates say" }));
    t.appendChild(el("blockquote", {}, [
      el("p", { text: "“" + q.quote + "”" }),
      el("footer", { text: q.name + ", " + q.cohort + ", " + q.team })
    ]));
    t.appendChild(el("p", {}, [el("a", { href: "graduate-feedback.html", text: "Read more graduate feedback" })]));
  };

  R.faqs = function (t) {
    t.classList.add("faq");
    (CONTENT.faqs || []).forEach(function (f) {
      t.appendChild(el("details", {}, [el("summary", { text: f.q }), el("p", { text: f.a })]));
    });
  };

  R.apply = function (t) {
    var url = CFG.googleFormUrl;
    if (!CFG.applicationsOpen) {
      t.appendChild(el("div", { class: "notice", role: "status" }, [
        el("strong", { text: "Applications are closed. " }),
        "Closing date was " + (CFG.closingDate || "not set") + ". Check back for the next intake or contact us."
      ]));
      return;
    }
    if (!url) {
      t.appendChild(el("div", { class: "notice", role: "status" }, [
        el("strong", { text: "The application form is not connected yet. " }),
        "Create the Google Form using docs/application-form.md, then paste its link into src/config.js (googleFormUrl)."
      ]));
      return;
    }
    t.appendChild(el("p", {}, [
      "Having trouble with the form below? ",
      el("a", { href: url.replace("?embedded=true", ""), target: "_blank", rel: "noopener", text: "Open the form in a new tab" }), "."
    ]));
    t.appendChild(el("iframe", { class: "form-frame", src: url, title: "Graduate placement application form", loading: "lazy" }, ["Loading…"]));
  };

  R.contact = function (t) {
    t.appendChild(el("p", {}, ["Email: ", el("a", { href: "mailto:" + CFG.contactEmail, text: CFG.contactEmail })]));
    t.appendChild(el("p", { text: "We aim to reply within 2 working days." }));
  };

  function run() {
    buildChrome();
    document.querySelectorAll("[data-render]").forEach(function (t) {
      var fn = R[t.getAttribute("data-render")];
      if (fn) fn(t);
    });
    var title = document.querySelector("title");
    if (title && COMPANY.name && title.textContent.indexOf(COMPANY.name) === -1) title.textContent += " | " + COMPANY.name;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
