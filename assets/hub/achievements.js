// Achievements: a portfolio of projects and accomplishments, plus a printable / downloadable scheme record.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  var TYPES = [
    { value: "project", label: "Project" }, { value: "accomplishment", label: "Accomplishment" }, { value: "presentation", label: "Presentation" },
    { value: "recognition", label: "Recognition or award" }, { value: "certificate", label: "Certificate or qualification" }, { value: "feedback", label: "Feedback received" }
  ];
  function typeLabel(v) { return (TYPES.filter(function (t) { return t.value === v; })[0] || {}).label || v; }
  function byDateDesc(a, b) { return (a.date || "") < (b.date || "") ? 1 : (a.date || "") > (b.date || "") ? -1 : 0; }

  // A readable text (Markdown) version of the whole scheme. Contacts are left out because they are other people's details.
  Hub.schemeRecordMarkdown = function () {
    var st = S.state, p = st.profile, pl = S.programme(), L = [];
    var cfg = window.SITE_CONFIG || {};
    L.push("# My graduate scheme record", "");
    L.push("**" + (p.name || "Graduate") + "**" + (p.role ? ", " + p.role : "") + " – " + (cfg.companyName || ""));
    if (p.startDate) L.push("Placement: " + Hub.fmtDate(p.startDate) + (pl.endDate ? " to " + Hub.fmtDate(pl.endDate) : ""));
    if (p.manager) L.push("Manager: " + p.manager);
    if (p.mentor) L.push("Mentor: " + p.mentor);
    if (p.interests) L.push("", "Career interests: " + p.interests);
    L.push("", "Generated on " + Hub.fmtDate(S.today()) + ".", "");
    L.push("## Goals", "");
    if (!st.goals.length) L.push("None recorded.");
    st.goals.forEach(function (g) {
      L.push("- **" + g.title + "** (" + g.type + ", " + g.progress + "% complete" + (g.target ? ", target " + Hub.fmtDate(g.target) : "") + ")" + (g.description ? ": " + g.description : ""));
      g.history.forEach(function (h) { L.push("  - " + Hub.fmtDate(h.date) + ": " + h.progress + "%" + (h.note ? " – " + h.note : "")); });
    });
    L.push("", "## Milestones", "");
    if (!st.milestones.length) L.push("None recorded.");
    st.milestones.slice().sort(function (a, b) { return (a.date || "") < (b.date || "") ? -1 : 1; }).forEach(function (m) {
      L.push("- " + Hub.fmtDate(m.date) + ": **" + m.title + "** (" + m.status + (m.skill ? ", " + Hub.skillName(m.skill) : "") + ")" + (m.notes ? " – " + m.notes : ""));
    });
    L.push("", "## Skills self-assessment (1 to 5)", "");
    var rated = Hub.skills().filter(function (s) { return st.skills[s.id] && (st.skills[s.id].start || st.skills[s.id].now); });
    if (!rated.length) L.push("None recorded.");
    rated.forEach(function (s) { var r = st.skills[s.id]; L.push("- " + s.name + ": start " + (r.start || "not rated") + ", now " + (r.now || "not rated")); });
    L.push("", "## Required training", "");
    Hub.training().forEach(function (tr) {
      var rec = st.learning.training[tr.id], s = Hub.trainingStatus(tr);
      L.push("- " + tr.title + ": " + (s === "complete" ? "complete" + (rec && rec.completedOn ? " (" + Hub.fmtDate(rec.completedOn) + ")" : "") : s === "inprogress" ? "in progress" : "not started"));
    });
    L.push("", "## Learning", "");
    var cat = (window.SITE_LEARNING || {}).catalogue || [], any = false;
    Object.keys(st.learning.saved).forEach(function (id) { var c = cat.filter(function (x) { return x.id === id; })[0]; if (c) { any = true; L.push("- " + c.title + " (" + c.type + "): " + st.learning.saved[id].status); } });
    st.learning.custom.forEach(function (c) { any = true; L.push("- " + c.title + " (" + (c.type || "Other") + "): " + c.status); });
    if (!any) L.push("None recorded.");
    L.push("", "## Achievements", "");
    if (!st.achievements.length) L.push("None recorded.");
    st.achievements.slice().sort(byDateDesc).forEach(function (a) {
      L.push("### " + a.title, "", typeLabel(a.type) + (a.date ? " – " + Hub.fmtDate(a.date) : "") + (a.skills.length ? " – Skills: " + a.skills.map(Hub.skillName).join(", ") : ""), "");
      if (a.did) L.push("What I did: " + a.did, "");
      if (a.impact) L.push("Result or impact: " + a.impact, "");
      if (a.learnt) L.push("What I learnt: " + a.learnt, "");
      if (a.evidence) L.push("Evidence: " + a.evidence, "");
    });
    L.push("## Weekly goals", "");
    var wgs = Object.keys(st.weeklyGoals).map(Number).sort(function (a, b) { return a - b; });
    if (!wgs.length) L.push("None recorded.", "");
    wgs.forEach(function (n) {
      L.push("### Week " + n, "");
      st.weeklyGoals[String(n)].forEach(function (g) { L.push("- [" + (g.done ? "x" : " ") + "] " + g.text); });
      L.push("");
    });
    L.push("## Weekly progress updates", "");
    var moods = ["", "Struggling", "Tough", "Okay", "Good", "Great"];
    var ups = Object.keys(st.updates).map(Number).sort(function (a, b) { return a - b; });
    if (!ups.length) L.push("None recorded.", "");
    ups.forEach(function (n) {
      var u = st.updates[String(n)];
      L.push("- Week " + n + (u.updated ? " (" + Hub.fmtDate(u.updated) + ")" : "") + ": " + (moods[u.mood] || "no rating") + (u.note ? " – " + u.note : ""));
    });
    if (ups.length) L.push("");
    L.push("## Weekly reflections", "");
    var weeks = Object.keys(st.reflections).map(Number).sort(function (a, b) { return a - b; });
    if (!weeks.length) L.push("None recorded.");
    weeks.forEach(function (n) {
      var r = st.reflections[String(n)];
      L.push("### Week " + n, "", "What I learnt: " + r.learnt);
      if (r.wentWell) L.push("", "What went well: " + r.wentWell);
      if (r.hard) L.push("", "What was hard: " + r.hard);
      if (r.focusNext) L.push("", "Focus for next week: " + r.focusNext);
      L.push("");
    });
    return L.join("\n") + "\n";
  };

  R.achievements = function (t) {
    var status = Hub.status();
    var summary = el("div"), addHost = el("div"), filterHost = el("div"), listHost = el("div"), recordHost = el("div");
    var ui = { adding: false, editing: null, type: "all", skill: "all" };
    Hub.notices(t);
    [status, summary, recordHost, addHost, filterHost, listHost].forEach(function (n) { t.appendChild(n); });

    function renderSummary() {
      summary.textContent = "";
      var a = S.state.achievements, skills = {};
      a.forEach(function (x) { x.skills.forEach(function (s) { skills[s] = true; }); });
      summary.appendChild(el("ul", { class: "tiles" }, [
        el("li", {}, [el("span", { text: "Entries" }), el("strong", { text: String(a.length) })]),
        el("li", {}, [el("span", { text: "Projects" }), el("strong", { text: String(a.filter(function (x) { return x.type === "project"; }).length) })]),
        el("li", {}, [el("span", { text: "Skills shown" }), el("strong", { text: Object.keys(skills).length + " of " + Hub.skills().length })])
      ]));
    }

    function renderRecord() {
      recordHost.textContent = "";
      var p = S.state.profile;
      var panel = Hub.panel("Your scheme record");
      var pl = S.programme();
      var st = S.state;
      var bits = [];
      if (p.name) bits.push(p.name + (p.role ? ", " + p.role : ""));
      if (p.startDate) bits.push("Placement " + Hub.fmtDate(p.startDate) + (pl.endDate ? " to " + Hub.fmtDate(pl.endDate) : ""));
      bits.push(Hub.plural(st.goals.filter(function (g) { return g.progress >= 100; }).length, "goal", "goals") + " done, " + Hub.plural(st.milestones.filter(function (m) { return m.status === "achieved"; }).length, "milestone", "milestones") + " achieved, " + Hub.plural(Object.keys(st.reflections).length, "weekly reflection", "weekly reflections") + ", " + Hub.plural(st.achievements.length, "achievement", "achievements"));
      panel.appendChild(el("p", { class: "print-only", text: "Graduate scheme record: " + bits.join(" · ") }));
      panel.appendChild(el("p", { text: "Your goals, milestones, skills, learning, reflections and achievements make up a record of your whole scheme. Print it, save it as a PDF, or download it as a text file to share or keep. Your contacts are not included." }));
      var print = el("button", { type: "button", class: "btn", text: "Print / save as PDF" });
      print.addEventListener("click", function () { window.print(); });
      var dl = el("button", { type: "button", class: "btn secondary", text: "Download my scheme record" });
      dl.addEventListener("click", function () { Hub.download("my-graduate-scheme-record.md", Hub.schemeRecordMarkdown(), "text/markdown"); status.say("Your scheme record was downloaded.", false); });
      panel.appendChild(el("div", { class: "actions" }, [print, dl]));
      recordHost.appendChild(panel);
    }

    function fields() {
      return [
        { name: "title", label: "Title", required: true, maxlength: 200, hint: "For example: Built a dashboard for the events team." },
        { name: "type", label: "Type", type: "select", required: true, options: TYPES },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "skills", label: "Skills this shows", type: "checks", options: Hub.skills().map(function (s) { return { value: s.id, label: s.name }; }) },
        { name: "did", label: "What I did", type: "textarea", rows: 4, required: true },
        { name: "impact", label: "Result or impact", type: "textarea", rows: 3 },
        { name: "learnt", label: "What I learnt", type: "textarea", rows: 3 },
        { name: "evidence", label: "Link to evidence", type: "url", maxlength: 500, hint: "A document, slide deck or page. Starts with http:// or https://" }
      ];
    }
    function focusCard(id) { var h = listHost.querySelector('[data-id="' + id + '"] h3'); if (h) Hub.focus(h); }

    function renderAdd() {
      addHost.textContent = "";
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add an achievement" });
        b.addEventListener("click", function () { ui.adding = true; ui.editing = null; renderAdd(); renderList(); });
        addHost.appendChild(b);
        return;
      }
      var panel = Hub.panel("Add an achievement");
      panel.appendChild(Hub.form({
        fields: fields(), values: { type: "project", date: S.today() }, submitLabel: "Add to my portfolio",
        onCancel: function () { ui.adding = false; renderAdd(); },
        onSubmit: function (v) {
          var a = { id: S.id(), title: v.title, type: v.type, date: v.date, skills: v.skills, did: v.did, impact: v.impact, learnt: v.learnt, evidence: S.safeUrl(v.evidence) };
          S.state.achievements.push(a); ui.adding = false; Hub.save(status, "Achievement added."); renderAll(); focusCard(a.id);
        }
      }));
      addHost.appendChild(panel);
      Hub.focus(panel.heading);
    }

    function renderFilters() {
      filterHost.textContent = "";
      if (!S.state.achievements.length) return;
      var ft = Hub.field({ name: "t", label: "Type", type: "select", required: true, options: [{ value: "all", label: "All types" }].concat(TYPES) }, ui.type);
      var fs = Hub.field({ name: "s", label: "Skill", type: "select", required: true, options: [{ value: "all", label: "All skills" }].concat(Hub.skills().map(function (s) { return { value: s.id, label: s.name }; })) }, ui.skill);
      ft.input.addEventListener("change", function () { ui.type = ft.input.value; renderList(); });
      fs.input.addEventListener("change", function () { ui.skill = fs.input.value; renderList(); });
      filterHost.appendChild(el("div", { class: "filters" }, [ft.wrap, fs.wrap]));
    }

    function card(a) {
      var c = el("article", { class: "item", "data-id": a.id });
      c.appendChild(el("h3", { text: a.title }));
      var meta = el("div", { class: "item-meta" }, [Hub.badge(typeLabel(a.type), "info")]);
      if (a.date) meta.appendChild(el("span", { text: Hub.fmtDate(a.date) }));
      a.skills.forEach(function (s) { meta.appendChild(el("span", { class: "tag skill", text: Hub.skillName(s) })); });
      c.appendChild(meta);
      if (a.did) c.appendChild(el("p", {}, [el("strong", { text: "What I did: " }), a.did]));
      if (a.impact) c.appendChild(el("p", {}, [el("strong", { text: "Result or impact: " }), a.impact]));
      if (a.learnt) c.appendChild(el("p", {}, [el("strong", { text: "What I learnt: " }), a.learnt]));
      if (a.evidence) c.appendChild(el("p", {}, [Hub.link(a.evidence, "View evidence")]));
      if (ui.editing === a.id) {
        c.appendChild(Hub.form({
          fields: fields(), values: a, submitLabel: "Save changes",
          onCancel: function () { ui.editing = null; renderList(); focusCard(a.id); },
          onSubmit: function (v) {
            Object.keys(v).forEach(function (k) { a[k] = k === "evidence" ? S.safeUrl(v[k]) : v[k]; });
            ui.editing = null; Hub.save(status, "Achievement updated."); renderAll(); focusCard(a.id);
          }
        }));
        return c;
      }
      var actions = el("div", { class: "actions" });
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit " + a.title });
      ed.addEventListener("click", function () { ui.editing = a.id; ui.adding = false; renderList(); focusCard(a.id); });
      actions.appendChild(ed);
      actions.appendChild(Hub.confirmButton({
        label: "Delete", ariaLabel: "Delete " + a.title, message: "Delete this achievement?",
        onConfirm: function () { S.state.achievements = S.state.achievements.filter(function (x) { return x.id !== a.id; }); Hub.save(status, "Achievement deleted."); renderAll(); Hub.focus(addHost.querySelector("button") || status); }
      }));
      c.appendChild(actions);
      return c;
    }

    function renderList() {
      listHost.textContent = "";
      var all = S.state.achievements.slice().sort(byDateDesc);
      listHost.appendChild(el("h2", { text: "Your portfolio" }));
      if (!all.length) { listHost.appendChild(el("p", { text: "Nothing here yet. Add your first project or accomplishment, and keep adding as the scheme goes on." })); return; }
      var shown = all.filter(function (a) { return (ui.type === "all" || a.type === ui.type) && (ui.skill === "all" || a.skills.indexOf(ui.skill) !== -1); });
      if (!shown.length) { listHost.appendChild(el("p", { text: "No entries match these filters." })); return; }
      var wrap = el("div", { class: "cols" });
      shown.forEach(function (a) { wrap.appendChild(card(a)); });
      listHost.appendChild(wrap);
    }

    function renderAll() { renderSummary(); renderRecord(); renderAdd(); renderFilters(); renderList(); }
    renderAll();
  };
})();
