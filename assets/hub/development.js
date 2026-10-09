// My development: milestones (planned or achieved) and a start-versus-now skills self-assessment.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;

  R.development = function (t) {
    var status = Hub.status();
    var summary = el("div"), msHost = el("div"), skillsHost = el("div");
    var ui = { adding: false, editing: null, chart: (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) ? "bars" : "radar" };
    Hub.notices(t);
    [status, summary, msHost, skillsHost].forEach(function (n) { t.appendChild(n); });

    function growth() {
      var diffs = [];
      Hub.skills().forEach(function (s) {
        var r = S.state.skills[s.id];
        if (r && r.start > 0 && r.now > 0) diffs.push(r.now - r.start);
      });
      return { n: diffs.length, avg: diffs.length ? diffs.reduce(function (a, b) { return a + b; }, 0) / diffs.length : 0 };
    }
    function renderSummary() {
      summary.textContent = "";
      var ms = S.state.milestones, done = ms.filter(function (m) { return m.status === "achieved"; }).length;
      var rated = Hub.skills().filter(function (s) { var r = S.state.skills[s.id]; return r && r.now > 0; }).length;
      var g = growth();
      var avgText = g.n ? (g.avg > 0 ? "+" : g.avg < 0 ? "−" : "") + Math.abs(Math.round(g.avg * 10) / 10) : "–";
      summary.appendChild(el("ul", { class: "tiles" }, [
        el("li", {}, [el("span", { text: "Milestones achieved" }), el("strong", { text: done + " of " + ms.length }), Hub.progress(ms.length ? (done / ms.length) * 100 : 0, "Milestones achieved")]),
        el("li", {}, [el("span", { text: "Skills rated" }), el("strong", { text: rated + " of " + Hub.skills().length })]),
        el("li", {}, [el("span", { text: "Average skill growth" }), el("strong", { text: avgText }), el("span", { class: "muted", text: g.n ? "across " + Hub.plural(g.n, "skill", "skills") + " rated at start and now" : "Rate a skill at the start and now" })])
      ]));
    }

    // ----- milestones -----
    function msFields() {
      var skillOpts = [{ value: "", label: "No specific skill" }].concat(Hub.skills().map(function (s) { return { value: s.id, label: s.name }; }));
      var goalOpts = [{ value: "", label: "Not linked to a goal" }].concat(S.state.goals.map(function (g) { return { value: g.id, label: g.title }; }));
      return [
        { name: "title", label: "Milestone", required: true, maxlength: 200, hint: "For example: Gave my first team presentation." },
        { name: "date", label: "Date", type: "date", required: true, hint: "When you reached it, or when you plan to." },
        { name: "status", label: "Status", type: "select", required: true, options: [{ value: "planned", label: "Planned" }, { value: "achieved", label: "Achieved" }] },
        { name: "skill", label: "Skill it shows", type: "select", options: skillOpts },
        { name: "goalId", label: "Linked goal", type: "select", options: goalOpts },
        { name: "notes", label: "Notes", type: "textarea" }
      ];
    }
    function focusMs(id) { var h = msHost.querySelector('[data-id="' + id + '"] h3'); if (h) Hub.focus(h); }

    function msCard(m) {
      var card = el("article", { class: "item", "data-id": m.id });
      card.appendChild(el("h3", { text: m.title }));
      var meta = el("div", { class: "item-meta" }, [Hub.badge(m.status === "achieved" ? "Achieved" : "Planned", m.status === "achieved" ? "ok" : "info")]);
      if (m.date) meta.appendChild(el("span", { text: Hub.fmtDate(m.date) }));
      if (m.status === "planned" && m.date) { var d = Hub.dueBadge(m.date, false); if (d.kind !== "info") meta.appendChild(Hub.badge(d.text, d.kind)); }
      if (m.skill) meta.appendChild(el("span", { class: "tag skill", text: Hub.skillName(m.skill) }));
      var goal = S.state.goals.filter(function (g) { return g.id === m.goalId; })[0];
      if (goal) meta.appendChild(el("span", { class: "muted", text: "Goal: " + goal.title }));
      card.appendChild(meta);
      if (m.notes) card.appendChild(el("p", { text: m.notes }));
      if (ui.editing === m.id) {
        card.appendChild(Hub.form({
          fields: msFields(), values: m, submitLabel: "Save changes",
          onCancel: function () { ui.editing = null; renderMs(); focusMs(m.id); },
          onSubmit: function (v) {
            Object.keys(v).forEach(function (k) { m[k] = v[k]; });
            ui.editing = null; Hub.save(status, "Milestone updated."); renderAll(); focusMs(m.id);
          }
        }));
        return card;
      }
      var actions = el("div", { class: "actions" });
      var toggle = el("button", { type: "button", class: "btn small", text: m.status === "achieved" ? "Mark as planned" : "Mark achieved", "aria-label": (m.status === "achieved" ? "Mark as planned: " : "Mark achieved: ") + m.title });
      toggle.addEventListener("click", function () {
        m.status = m.status === "achieved" ? "planned" : "achieved";
        Hub.save(status, m.status === "achieved" ? "Milestone achieved. Well done!" : "Milestone marked as planned."); renderAll(); focusMs(m.id);
        if (m.status === "achieved") Hub.celebrateOnce("milestone:" + m.id, "Milestone achieved", "\u201C" + m.title + "\u201D is done. Well done!", document.querySelector('[data-id="' + m.id + '"]'));
      });
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit " + m.title });
      ed.addEventListener("click", function () { ui.editing = m.id; ui.adding = false; renderMs(); focusMs(m.id); });
      actions.appendChild(toggle); actions.appendChild(ed);
      actions.appendChild(Hub.confirmButton({
        label: "Delete", ariaLabel: "Delete " + m.title, message: "Delete this milestone?",
        onConfirm: function () {
          S.state.milestones = S.state.milestones.filter(function (x) { return x.id !== m.id; });
          Hub.save(status, "Milestone deleted."); renderAll(); Hub.focus(msHost.querySelector("button") || status);
        }
      }));
      card.appendChild(actions);
      return card;
    }

    function renderMs() {
      msHost.textContent = "";
      msHost.appendChild(el("h2", { text: "Milestones" }));
      msHost.appendChild(el("p", { text: "Record the moments that matter: finishing a project, getting feedback, completing training. Mark them achieved as you go." }));
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add a milestone" });
        b.addEventListener("click", function () { ui.adding = true; ui.editing = null; renderMs(); });
        msHost.appendChild(b);
      } else {
        var panel = Hub.panel("Add a milestone");
        panel.appendChild(Hub.form({
          fields: msFields(), values: { status: "planned", date: S.today() }, submitLabel: "Add milestone",
          onCancel: function () { ui.adding = false; renderMs(); },
          onSubmit: function (v) {
            var m = { id: S.id(), title: v.title, date: v.date, status: v.status, skill: v.skill, goalId: v.goalId, notes: v.notes };
            S.state.milestones.push(m); ui.adding = false; Hub.save(status, "Milestone added."); renderAll(); focusMs(m.id);
          }
        }));
        msHost.appendChild(panel);
        Hub.focus(panel.heading);
      }
      var list = S.state.milestones.slice().sort(function (a, b) { return (a.date || "9999") < (b.date || "9999") ? -1 : 1; });
      if (!list.length) { msHost.appendChild(el("p", { text: "No milestones yet." })); return; }
      var wrap = el("div", { class: "cols timeline" });
      list.forEach(function (m) { wrap.appendChild(msCard(m)); });
      msHost.appendChild(wrap);
    }

    // ----- skills self-assessment -----
    function ratingOptions() {
      var o = [{ value: "0", label: "Not rated" }];
      for (var i = 1; i <= 5; i++) o.push({ value: String(i), label: String(i) });
      return o;
    }
    function changeText(r) {
      if (!r || r.start < 1 || r.now < 1) return "–";
      var d = r.now - r.start;
      return d > 0 ? "+" + d : d < 0 ? "−" + Math.abs(d) : "0";
    }
    // ----- skills chart: "at the start" versus "now" (radar or paired bars), with a table version -----
    var NS = "http://www.w3.org/2000/svg";
    function svgEl(tag, attrs, text) {
      var n = document.createElementNS(NS, tag);
      Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (text !== undefined) n.textContent = text;
      return n;
    }
    function skillData() {
      return Hub.skills().map(function (sk) {
        var r = S.state.skills[sk.id] || { start: 0, now: 0 };
        return { id: sk.id, name: sk.name, group: sk.group, start: r.start || 0, now: r.now || 0 };
      });
    }
    function chartSummary(d) {
      var st = d.filter(function (x) { return x.start > 0; }), nw = d.filter(function (x) { return x.now > 0; });
      function avg(a, k) { return a.length ? Math.round(a.reduce(function (t, x) { return t + x[k]; }, 0) / a.length * 10) / 10 : null; }
      var both = d.filter(function (x) { return x.start > 0 && x.now > 0; }), best = null;
      both.forEach(function (x) { if (!best || x.now - x.start > best.now - best.start) best = x; });
      return { avgStart: avg(st, "start"), avgNow: avg(nw, "now"), best: best && best.now - best.start > 0 ? best : null, unrated: d.filter(function (x) { return x.now === 0 && x.start === 0; }).length, rated: nw.length };
    }
    function chartLabel(d, sm) {
      if (!sm.rated && !d.some(function (x) { return x.start > 0; })) return "Skills chart: no skills rated yet.";
      return "Skills chart. Average rating at the start " + (sm.avgStart === null ? "not rated" : sm.avgStart) + " out of 5, now " + (sm.avgNow === null ? "not rated" : sm.avgNow) + " out of 5" + (sm.best ? ". Biggest growth: " + sm.best.name + ", up " + (sm.best.now - sm.best.start) : "") + ". A table version follows.";
    }
    function wrapLabel(name) {
      if (name.length <= 20) return [name];
      var words = name.split(" "), best = [name, ""], bestMax = 999;
      for (var k = 1; k < words.length; k++) { var x = words.slice(0, k).join(" "), y = words.slice(k).join(" "), m = Math.max(x.length, y.length); if (m < bestMax) { bestMax = m; best = [x, y]; } }
      return best;
    }
    function drawRadar(d, host, tip) {
      var W = 700, H = 440, cx = W / 2, cy = H / 2 + 4, R = 140, n = d.length;
      var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "viz-radar", role: "img", "aria-label": chartLabel(d, chartSummary(d)), focusable: "false" });
      function pt(i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v / 5, cy + Math.sin(a) * R * v / 5]; }
      function ring(v) { return d.map(function (x, i) { return pt(i, v).map(function (c) { return Math.round(c * 10) / 10; }).join(","); }).join(" "); }
      for (var v = 1; v <= 5; v++) svg.appendChild(svgEl("polygon", { points: ring(v), class: "viz-grid" + (v === 5 ? " viz-grid-outer" : "") }));
      d.forEach(function (x, i) { var p = pt(i, 5); svg.appendChild(svgEl("line", { x1: cx, y1: cy, x2: p[0], y2: p[1], class: "viz-grid" })); });
      for (var rv = 1; rv <= 5; rv++) svg.appendChild(svgEl("text", { x: cx + 4, y: cy - R * rv / 5 + 3, class: "viz-axis-num" }, String(rv)));
      function shape(key, cls) {
        var pts = d.map(function (x, i) { return pt(i, x[key]).join(","); }).join(" ");
        svg.appendChild(svgEl("polygon", { points: pts, class: "viz-shape " + cls }));
      }
      shape("start", "viz-start"); shape("now", "viz-now");
      d.forEach(function (x, i) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / n, lx = cx + Math.cos(a) * (R + 16), ly = cy + Math.sin(a) * (R + 16), cosA = Math.cos(a);
        var anchor = Math.abs(cosA) < 0.25 ? "middle" : cosA > 0 ? "start" : "end";
        var lines = wrapLabel(x.name), t = svgEl("text", { x: lx, y: ly - (lines.length - 1) * 7 + 4, "text-anchor": anchor, class: "viz-label" });
        lines.forEach(function (ln, k) { var ts = svgEl("tspan", { x: lx, dy: k ? 14 : 0 }, ln); t.appendChild(ts); });
        svg.appendChild(t);
      });
      d.forEach(function (x, i) {
        if (x.start > 0) { var p = pt(i, x.start); svg.appendChild(svgEl("circle", { cx: p[0], cy: p[1], r: 4.5, class: "viz-dot viz-start-dot" })); }
        if (x.now > 0) { var q = pt(i, x.now); svg.appendChild(svgEl("circle", { cx: q[0], cy: q[1], r: 4.5, class: "viz-dot viz-now-dot" })); }
      });
      // invisible, larger hit areas (one per skill) carry the hover and keyboard tooltip
      d.forEach(function (x, i) {
        var p = pt(i, 5), hit = svgEl("circle", { cx: p[0], cy: p[1], r: 17, class: "viz-hit", tabindex: "0", "aria-hidden": "true", "data-i": String(i) });
        hit.appendChild(svgEl("title", {}, tipText(x)));
        function show() { showTip(tip, host, hit, x); }
        hit.addEventListener("mouseenter", show); hit.addEventListener("focus", show);
        hit.addEventListener("mouseleave", function () { tip.hidden = true; }); hit.addEventListener("blur", function () { tip.hidden = true; });
        hit.addEventListener("keydown", function (e) { if (e.key === "Escape") tip.hidden = true; });
        svg.appendChild(hit);
      });
      return svg;
    }
    function tipText(x) {
      var ch = x.start > 0 && x.now > 0 ? " (" + changeText(x) + ")" : "";
      return x.name + ": at the start " + (x.start || "not rated") + ", now " + (x.now || "not rated") + ch;
    }
    function showTip(tip, host, target, x) {
      tip.textContent = ""; tip.appendChild(el("strong", { text: x.name }));
      tip.appendChild(el("span", { text: "At the start: " + (x.start || "not rated") })); tip.appendChild(el("span", { text: "Now: " + (x.now || "not rated") + (x.start > 0 && x.now > 0 ? " (" + changeText(x) + ")" : "") }));
      tip.hidden = false;
      var hr = host.getBoundingClientRect(), tr = target.getBoundingClientRect();
      var left = tr.left - hr.left + tr.width / 2 - tip.offsetWidth / 2, top = tr.top - hr.top - tip.offsetHeight - 8;
      if (top < 0) top = tr.bottom - hr.top + 8;
      tip.style.left = Math.max(0, Math.min(left, hr.width - tip.offsetWidth)) + "px"; tip.style.top = top + "px";
    }
    function drawBars(d) {
      var ul = el("ul", { class: "viz-bars" });
      var groups = {};
      d.forEach(function (x) { (groups[x.group] = groups[x.group] || []).push(x); });
      Object.keys(groups).forEach(function (g) {
        ul.appendChild(el("li", { class: "viz-bars-group", text: g }));
        groups[g].forEach(function (x) {
          function bar(cls, v) { return el("span", { class: "viz-track" }, [el("span", { class: "viz-fill " + cls, style: "width:" + (v / 5 * 100) + "%" })]); }
          ul.appendChild(el("li", { class: "viz-row" }, [
            el("span", { class: "viz-row-name", text: x.name }),
            el("span", { class: "viz-pair" }, [bar("viz-now", x.now), bar("viz-start", x.start)]),
            el("span", { class: "viz-row-num", text: (x.start || "–") + " → " + (x.now || "–") })
          ]));
        });
      });
      return ul;
    }
    function drawTable(d) {
      var det = el("details", { class: "viz-table" }, [el("summary", { text: "Show as a table" })]);
      var tb = el("table", { class: "viz-data" });
      tb.appendChild(el("thead", {}, [el("tr", {}, ["Skill", "Group", "At the start", "Now", "Change"].map(function (h) { return el("th", { scope: "col", text: h }); }))]));
      var body = el("tbody");
      d.forEach(function (x) { body.appendChild(el("tr", {}, [el("th", { scope: "row", text: x.name }), el("td", { text: x.group }), el("td", { text: x.start ? String(x.start) : "Not rated" }), el("td", { text: x.now ? String(x.now) : "Not rated" }), el("td", { text: changeText(x) })])); });
      tb.appendChild(body); det.appendChild(tb); return det;
    }
    function drawChart(host) {
      var open = host.querySelector("details") && host.querySelector("details").open;
      host.textContent = "";
      var d = skillData(), sm = chartSummary(d);
      host.appendChild(el("h3", { text: "Your skills at a glance" }));
      var top = el("div", { class: "viz-top" });
      var legend = el("ul", { class: "viz-legend", "aria-label": "Chart key" }, [
        el("li", {}, [el("span", { class: "viz-key viz-key-start", "aria-hidden": "true" }), "At the start"]),
        el("li", {}, [el("span", { class: "viz-key viz-key-now", "aria-hidden": "true" }), "Now"])
      ]);
      var group = el("div", { class: "view-switch", role: "group", "aria-label": "Chart type" });
      [["radar", "Radar"], ["bars", "Bars"]].forEach(function (v) {
        var b = el("button", { type: "button", class: "btn small secondary", "aria-pressed": String(ui.chart === v[0]), text: v[1] });
        b.addEventListener("click", function () { ui.chart = v[0]; drawChart(host); });
        group.appendChild(b);
      });
      top.appendChild(legend); top.appendChild(group); host.appendChild(top);
      var line = !sm.rated && !d.some(function (x) { return x.start > 0; }) ? "Rate your skills below and they will appear here." :
        "Average at the start: " + (sm.avgStart === null ? "not rated" : sm.avgStart) + " · Average now: " + (sm.avgNow === null ? "not rated" : sm.avgNow) + (sm.best ? " · Biggest growth: " + sm.best.name + " (+" + (sm.best.now - sm.best.start) + ")" : "") + (sm.unrated ? " · " + Hub.plural(sm.unrated, "skill", "skills") + " not rated yet" : "");
      host.appendChild(el("p", { class: "viz-summary", text: line }));
      var stage = el("div", { class: "viz-stage" }), tip = el("div", { class: "viz-tip", role: "presentation" }); tip.hidden = true;
      if (ui.chart === "radar") { var wrap = el("div", { class: "viz-scroll" }); wrap.appendChild(drawRadar(d, stage, tip)); stage.appendChild(wrap); stage.appendChild(tip); }
      else { stage.appendChild(el("div", { class: "viz-labelled", role: "img", "aria-label": chartLabel(d, sm) }, [drawBars(d)])); }
      host.appendChild(stage);
      var tbl = drawTable(d); if (open) tbl.open = true; host.appendChild(tbl);
    }

    function renderSkills() {
      skillsHost.textContent = "";
      skillsHost.appendChild(el("h2", { text: "Skills self-assessment" }));
      var chartHost = el("div", { class: "viz-card" }); drawChart(chartHost); skillsHost.appendChild(chartHost);
      skillsHost.appendChild(el("p", { text: "Rate how confident you feel in each skill, from 1 (just starting) to 5 (very confident). Rate your starting point now, then update “Now” as you grow. Changes save automatically." }));
      var groups = {};
      Hub.skills().forEach(function (s) { (groups[s.group] = groups[s.group] || []).push(s); });
      Object.keys(groups).forEach(function (gn) {
        skillsHost.appendChild(el("h3", { text: gn }));
        skillsHost.appendChild(el("div", { class: "skillrow head", "aria-hidden": "true" }, [el("span", { text: "Skill" }), el("span", { text: "At the start" }), el("span", { text: "Now" }), el("span", { text: "Change" })]));
        groups[gn].forEach(function (s) {
          var rec = S.state.skills[s.id] || { start: 0, now: 0 };
          var row = el("div", { class: "skillrow" });
          row.appendChild(el("span", { class: "name", text: s.name }));
          function sel(kind, label) {
            var select = el("select", { "aria-label": s.name + ": confidence " + label });
            ratingOptions().forEach(function (o) { select.appendChild(el("option", { value: o.value, text: o.label })); });
            select.value = String(rec[kind]);
            select.addEventListener("change", function () {
              var cur = S.state.skills[s.id] || { start: 0, now: 0 };
              cur[kind] = parseInt(select.value, 10);
              S.state.skills[s.id] = cur;
              Hub.save(status, s.name + ": " + (kind === "start" ? "starting" : "current") + " rating saved.");
              change.textContent = changeText(cur); renderSummary(); drawChart(chartHost);
            });
            return el("div", { class: "sel" }, [el("span", { class: "sel-label", "aria-hidden": "true", text: kind === "start" ? "At the start" : "Now" }), select]);
          }
          var change = el("span", { class: "change", text: changeText(rec) });
          row.appendChild(sel("start", "at the start"));
          row.appendChild(sel("now", "now"));
          row.appendChild(change);
          skillsHost.appendChild(row);
        });
      });
    }

    function renderAll() { renderSummary(); renderMs(); renderSkills(); }
    renderAll();
  };
})();
