// My development: milestones (planned or achieved) and a start-versus-now skills self-assessment.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;

  R.development = function (t) {
    var status = Hub.status();
    var summary = el("div"), msHost = el("div"), skillsHost = el("div");
    var ui = { adding: false, editing: null };
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
    function renderSkills() {
      skillsHost.textContent = "";
      skillsHost.appendChild(el("h2", { text: "Skills self-assessment" }));
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
              change.textContent = changeText(cur); renderSummary();
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
