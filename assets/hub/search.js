// Search box in the header: finds your goals, tasks, comments, events, reflections, achievements, learning, links, people and
// company or help text. Everything is searched in this browser only. Text is always added with textContent, never as HTML.
(function () {
  "use strict";
  var el = window.SiteUtil.el;
  var MAX_GROUP = 6, MAX_TOTAL = 30;

  function norm(s) { return String(s || "").toLowerCase(); }
  function clip(s, n) { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  // Everything that can be searched, as { group, title, hay, snippet, href }.
  function buildIndex() {
    var S = window.HubStore, Hub = window.Hub, out = [], st = S ? S.state : null;
    function add(group, title, parts, snippet, href) { out.push({ group: group, title: title, hay: norm([title].concat(parts).join(" • ")), parts: parts, snippet: snippet || "", href: href }); }
    var statusLabel = (Hub && Hub.taskStatusLabel) || {};
    if (st) {
      st.goals.forEach(function (g) {
        add("Goals", g.title, [g.description, g.type], g.description || "Goal", "journey.html");
        (g.tasks || []).forEach(function (t) {
          add("Tasks", t.text, [g.title].concat(t.comments.map(function (c) { return c.text; })), "In goal “" + g.title + "” · " + (statusLabel[t.status] || t.status), "journey.html");
        });
      });
      st.milestones.forEach(function (m) { add("Milestones", m.title, [m.notes, m.skill], m.notes || (m.status === "achieved" ? "Achieved" : "Planned"), "development.html"); });
      Object.keys(st.weeklyGoals).forEach(function (wk) { st.weeklyGoals[wk].forEach(function (g) { add("Weekly goals", g.text, [], "Week " + wk, "index.html"); }); });
      st.calendar.forEach(function (c) { add("Calendar", c.title, [c.where, c.note], (Hub ? Hub.fmtDate(c.date) : c.date) + (c.time ? ", " + c.time : "") + (c.where ? " · " + c.where : ""), "index.html#calendar"); });
      Object.keys(st.reflections).forEach(function (wk) { var r = st.reflections[wk]; add("Reflections", "Week " + wk + " reflection", [r.learnt, r.wentWell, r.hard, r.focusNext], r.learnt || r.wentWell || "", "reflection.html"); });
      st.achievements.forEach(function (a) { add("Achievements", a.title, [a.did, a.impact, a.learnt].concat(a.skills || []), a.did || a.impact || a.type, "achievements.html"); });
      st.learning.custom.forEach(function (c) { add("Learning", c.title, [c.notes, c.type], c.notes || c.type || "Your own item", "learning.html"); });
      st.meetings.forEach(function (m) {
        add("Meetings", (m.title || "1:1") + " \u00B7 " + (Hub ? Hub.fmtDate(m.date) : m.date), [m.withWho, m.agenda, m.notes].concat(m.actions.map(function (x) { return x.text; })), m.withWho ? "With " + m.withWho : "1:1 meeting", "meetings.html#meetings");
      });
      st.feedback.forEach(function (f) { add("Feedback", "Feedback" + (f.from ? " from " + f.from : "") + " \u00B7 " + (Hub ? Hub.fmtDate(f.date) : f.date), [f.text, f.action], f.text, "meetings.html#feedback"); });
      st.contacts.forEach(function (c) { add("People and networks", c.name, [c.role, c.how, c.notes, c.email], c.role || "Your contact", "company.html#network"); });
    }
    var L = window.SITE_LEARNING || {};
    (L.training || []).forEach(function (t) { add("Learning", t.title, [t.description, "required training"], t.description || "Required training", "learning.html"); });
    (L.catalogue || []).forEach(function (c) { add("Learning", c.title, [c.description, c.type, c.skill], c.description || c.type, "learning.html"); });
    var links = Hub && Hub.allLinks ? Hub.allLinks() : ((window.SITE_LINKS || {}).items || []);
    links.forEach(function (l) { add("Quick links", l.name, [l.description, l.category], l.description || l.category, "links.html"); });
    (window.SITE_TEAM || []).forEach(function (p) { if (p.name) add("People and networks", p.name, [p.role, p.bio, p.why], p.role || "", "company.html#network"); });
    ((window.SITE_RESOURCES || {}).items || []).forEach(function (r) { if (r && r.title) add("Key information", r.title, [r.description], r.description || "", "company.html#resources"); });
    var C = window.SITE_COMPANY || {};
    [["Portfolios", C.portfolios ? C.name + " works across " + C.portfolios + " portfolios" : ""], ["Our mission", C.mission], ["About the company", C.about], ["Size and locations", C.size], ["Culture", C.culture], ["Why join us", C.whyJoin], ["Our values", (C.values || []).join(", ")]].forEach(function (x) {
      if (x[1]) add("Company and help", x[0], [x[1]], x[1], "company.html#about");
    });
    var K = window.SITE_CONTENT || {};
    (K.faqs || []).forEach(function (f) { add("Company and help", f.q, [f.a], f.a, "help.html"); });
    (K.programmeObjectives || []).concat(K.graduateObjectives || []).forEach(function (o) { add("Company and help", "Programme objective", [o], o, "company.html#placement"); });
    return out;
  }

  // Text with the matched words wrapped in <mark> (built from DOM nodes).
  function highlight(text, tokens) {
    var span = el("span"), lower = norm(text), pos = 0;
    while (pos < text.length) {
      var best = -1, len = 0;
      tokens.forEach(function (t) { var i = lower.indexOf(t, pos); if (i !== -1 && (best === -1 || i < best)) { best = i; len = t.length; } });
      if (best === -1) break;
      if (best > pos) span.appendChild(document.createTextNode(text.slice(pos, best)));
      span.appendChild(el("mark", { text: text.slice(best, best + len) }));
      pos = best + len;
    }
    if (pos < text.length) span.appendChild(document.createTextNode(text.slice(pos)));
    return span;
  }
  // A short piece of the first part of the item that contains a search word.
  function snippetFor(item, tokens) {
    var from = [item.snippet].concat(item.parts);
    for (var i = 0; i < from.length; i++) {
      var t = String(from[i] || "").replace(/\s+/g, " ").trim(), lower = norm(t);
      for (var j = 0; j < tokens.length; j++) {
        var k = lower.indexOf(tokens[j]);
        if (k !== -1) { var start = Math.max(0, k - 30); return (start > 0 ? "…" : "") + clip(t.slice(start), 110); }
      }
    }
    return clip(item.snippet, 110);
  }

  function search(q) {
    var tokens = norm(q).split(/\s+/).filter(Boolean);
    if (!tokens.length || norm(q).trim().length < 2) return null;
    var groups = {}, order = [], total = 0, shown = 0;
    buildIndex().forEach(function (it) {
      if (!tokens.every(function (t) { return it.hay.indexOf(t) !== -1; })) return;
      total++;
      if (!groups[it.group]) { groups[it.group] = []; order.push(it.group); }
      groups[it.group].push(it);
    });
    var res = [];
    order.forEach(function (g) {
      var list = groups[g].slice(0, MAX_GROUP).slice(0, Math.max(0, MAX_TOTAL - shown));
      shown += list.length;
      if (list.length) res.push({ name: g, items: list, count: groups[g].length });
    });
    return { tokens: tokens, groups: res, total: total, shown: shown };
  }

  window.SiteSearch = {
    search: search,
    attach: function (button, header) {
      var panel = el("div", { class: "search-panel", id: "search-panel", role: "search", "aria-label": "Search the hub" });
      panel.hidden = true;
      header.appendChild(panel);
      // the field and results are built the first time the panel opens, so other pages are not affected until then
      var input, closeBtn, status, results;
      function build() {
        if (input) return;
        input = el("input", { type: "search", id: "search-input", class: "search-input", placeholder: "Search goals, tasks, links, learning, people\u2026", autocomplete: "off", spellcheck: "false" });
        closeBtn = el("button", { type: "button", class: "btn small secondary search-close", text: "Close" });
        status = el("p", { class: "visually-hidden", role: "status", "aria-live": "polite" });
        results = el("div", { class: "search-results" });
        var form = el("form", { class: "search-form" }, [el("label", { for: "search-input", class: "visually-hidden", text: "Search the hub" }), input, closeBtn]);
        form.addEventListener("submit", function (e) { e.preventDefault(); });
        panel.appendChild(el("div", { class: "wrap" }, [form, status, results]));
        closeBtn.addEventListener("click", function () { close(true); });
        input.addEventListener("input", render);
      }

      function show(hint) { results.textContent = ""; results.appendChild(el("p", { class: "muted search-hint", text: hint })); }
      function render() {
        var r = search(input.value);
        if (!r) { show("Type at least two letters to search your goals, tasks, comments, events, reflections, achievements, learning, links, people and help."); status.textContent = ""; return; }
        results.textContent = "";
        if (!r.total) { show("No results for “" + input.value.trim() + "”. Try a different word."); status.textContent = "No results"; return; }
        r.groups.forEach(function (g) {
          var sec = el("section", { class: "search-group" }, [el("h2", { text: g.name + (g.count > g.items.length ? " (" + g.items.length + " of " + g.count + ")" : "") })]);
          var ul = el("ul");
          g.items.forEach(function (it) {
            var a = el("a", { href: it.href }, [el("span", { class: "sr-title" }, [highlight(it.title, r.tokens)]), el("span", { class: "sr-snippet" }, [highlight(snippetFor(it, r.tokens), r.tokens)])]);
            a.addEventListener("click", function () { close(false); });
            ul.appendChild(el("li", {}, [a]));
          });
          sec.appendChild(ul); results.appendChild(sec);
        });
        if (r.total > r.shown) results.appendChild(el("p", { class: "muted search-hint", text: "Showing " + r.shown + " of " + r.total + " results. Add another word to narrow it down." }));
        status.textContent = r.total + (r.total === 1 ? " result" : " results");
      }
      function open() {
        build(); panel.hidden = false; button.setAttribute("aria-expanded", "true");
        input.focus(); input.select(); render();
      }
      function close(refocus) {
        if (panel.hidden) return;
        panel.hidden = true; button.setAttribute("aria-expanded", "false");
        if (refocus) button.focus();
      }
      button.addEventListener("click", function () { if (panel.hidden) open(); else close(true); });
      panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); close(true); } });
      document.addEventListener("keydown", function (e) {
        if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.target, tag = t && t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
        e.preventDefault(); open();
      });
      document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && !button.contains(e.target)) close(false); });
    }
  };
})();
