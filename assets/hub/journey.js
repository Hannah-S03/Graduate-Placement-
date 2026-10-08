// My journey: development, career and placement goals, with progress updates and history.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  var TYPES = [{ value: "development", label: "Development" }, { value: "career", label: "Career" }, { value: "placement", label: "Placement" }];
  function typeLabel(v) { return (TYPES.filter(function (t) { return t.value === v; })[0] || {}).label || v; }

  R.journey = function (t) {
    var status = Hub.status();
    var summary = el("div"), addHost = el("div"), filterHost = el("div"), list = el("div"), suggest = el("div");
    var ui = { adding: false, editing: null, updating: null, type: "all", status: "all" };
    Hub.notices(t);
    [status, summary, addHost, filterHost, list, suggest].forEach(function (n) { t.appendChild(n); });

    function sorted() {
      return S.state.goals.slice().sort(function (a, b) {
        var x = a.target || "9999-99-99", y = b.target || "9999-99-99";
        return x < y ? -1 : x > y ? 1 : (a.created || "") < (b.created || "") ? -1 : 1;
      });
    }
    function focusGoal(id) {
      var h = list.querySelector('[data-id="' + id + '"] h3');
      if (h) Hub.focus(h);
    }

    function renderSummary() {
      summary.textContent = "";
      var ul = el("ul", { class: "tiles" });
      TYPES.forEach(function (ty) {
        var goals = S.state.goals.filter(function (g) { return g.type === ty.value; });
        var avg = goals.length ? goals.reduce(function (a, g) { return a + g.progress; }, 0) / goals.length : 0;
        var li = el("li", {}, [
          el("span", { text: ty.label + " goals" }),
          el("strong", { text: String(goals.length) }),
          Hub.progress(avg, ty.label + " goals average progress"),
          el("span", { class: "muted", text: goals.length ? Math.round(avg) + "% average progress" : "None yet" })
        ]);
        ul.appendChild(li);
      });
      summary.appendChild(ul);
    }

    function goalFields() {
      return [
        { name: "type", label: "Type of goal", type: "select", required: true, options: TYPES },
        { name: "title", label: "Goal", required: true, maxlength: 200, hint: "What do you want to achieve?" },
        { name: "description", label: "Details", type: "textarea", hint: "Why it matters and how you will do it." },
        { name: "target", label: "Target date", type: "date" }
      ];
    }

    function renderAdd() {
      addHost.textContent = "";
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add a goal" });
        b.addEventListener("click", function () { ui.adding = true; ui.editing = null; renderAdd(); renderList(); });
        addHost.appendChild(b);
        return;
      }
      var panel = Hub.panel("Add a goal");
      panel.appendChild(Hub.form({
        fields: goalFields(), values: { type: "development" }, submitLabel: "Add goal",
        onCancel: function () { ui.adding = false; renderAdd(); },
        onSubmit: function (v) {
          var g = { id: S.id(), type: v.type, title: v.title, description: v.description, target: v.target, progress: 0, created: S.today(), history: [] };
          S.state.goals.push(g);
          ui.adding = false;
          Hub.save(status, "Goal added.");
          renderAll(); focusGoal(g.id);
        }
      }));
      addHost.appendChild(panel);
      Hub.focus(panel.heading);
    }

    function renderFilters() {
      filterHost.textContent = "";
      if (!S.state.goals.length) return;
      var ft = Hub.field({ name: "type", label: "Type", type: "select", required: true, options: [{ value: "all", label: "All types" }].concat(TYPES) }, ui.type);
      var fs = Hub.field({ name: "status", label: "Status", type: "select", required: true, options: [{ value: "all", label: "All" }, { value: "notstarted", label: "Not started" }, { value: "inprogress", label: "In progress" }, { value: "done", label: "Done" }] }, ui.status);
      ft.input.addEventListener("change", function () { ui.type = ft.input.value; renderList(); });
      fs.input.addEventListener("change", function () { ui.status = fs.input.value; renderList(); });
      filterHost.appendChild(el("div", { class: "filters" }, [ft.wrap, fs.wrap]));
    }

    function goalCard(g) {
      var st = Hub.goalStatus(g);
      var card = el("article", { class: "item", "data-id": g.id });
      card.appendChild(el("h3", { text: g.title }));
      var meta = el("div", { class: "item-meta" }, [Hub.badge(typeLabel(g.type), "info"), Hub.badge(Hub.goalStatusLabel[st], st === "done" ? "ok" : st === "inprogress" ? "warn" : "info")]);
      if (g.target) { var db = Hub.dueBadge(g.target, st === "done"); meta.appendChild(Hub.badge(st === "done" ? "Target " + Hub.fmtDate(g.target) : db.text, db.kind)); }
      card.appendChild(meta);
      if (g.description) card.appendChild(el("p", { text: g.description }));
      card.appendChild(Hub.progress(g.progress, g.title + " progress"));
      card.appendChild(el("p", { class: "muted", text: g.progress + "% complete" }));

      if (ui.editing === g.id) {
        card.appendChild(Hub.form({
          fields: goalFields(), values: g, submitLabel: "Save changes",
          onCancel: function () { ui.editing = null; renderList(); focusGoal(g.id); },
          onSubmit: function (v) {
            g.type = v.type; g.title = v.title; g.description = v.description; g.target = v.target;
            ui.editing = null; Hub.save(status, "Goal updated."); renderAll(); focusGoal(g.id);
          }
        }));
        return card;
      }
      if (ui.updating === g.id) {
        card.appendChild(Hub.form({
          fields: [
            { name: "progress", label: "Progress", type: "range", min: 0, max: 100, step: 5 },
            { name: "note", label: "Note about this update", type: "textarea", rows: 2, hint: "What changed since last time?" }
          ],
          values: { progress: g.progress, note: "" }, submitLabel: "Save progress",
          onCancel: function () { ui.updating = null; renderList(); focusGoal(g.id); },
          onSubmit: function (v) {
            if (v.progress !== g.progress || v.note) g.history.push({ date: S.today(), progress: v.progress, note: v.note });
            g.progress = v.progress; ui.updating = null;
            Hub.save(status, "Progress for “" + g.title + "” is now " + v.progress + "%."); renderAll(); focusGoal(g.id);
          }
        }));
        return card;
      }
      if (g.history.length) {
        var det = el("details", {}, [el("summary", { text: "Progress history (" + g.history.length + ")" })]);
        var ul = el("ul", { class: "history" });
        g.history.slice().reverse().forEach(function (h) { ul.appendChild(el("li", { text: Hub.fmtDate(h.date) + ": " + h.progress + "%" + (h.note ? " – " + h.note : "") })); });
        det.appendChild(ul); card.appendChild(det);
      }
      var actions = el("div", { class: "actions" });
      var up = el("button", { type: "button", class: "btn small", text: "Update progress", "aria-label": "Update progress for " + g.title });
      up.addEventListener("click", function () { ui.updating = g.id; ui.editing = null; renderList(); focusGoal(g.id); });
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit " + g.title });
      ed.addEventListener("click", function () { ui.editing = g.id; ui.updating = null; renderList(); focusGoal(g.id); });
      actions.appendChild(up); actions.appendChild(ed);
      actions.appendChild(Hub.confirmButton({
        label: "Delete", ariaLabel: "Delete " + g.title, message: "Delete this goal?",
        onConfirm: function () {
          S.state.goals = S.state.goals.filter(function (x) { return x.id !== g.id; });
          Hub.save(status, "Goal deleted."); renderAll(); Hub.focus(addHost.querySelector("button") || status);
        }
      }));
      card.appendChild(actions);
      return card;
    }

    function renderList() {
      list.textContent = "";
      var all = sorted();
      if (!all.length) {
        list.appendChild(el("p", { text: "You have not added any goals yet. Add your first goal, or start from one of the suggestions below." }));
        return;
      }
      var shown = all.filter(function (g) {
        return (ui.type === "all" || g.type === ui.type) && (ui.status === "all" || Hub.goalStatus(g) === ui.status);
      });
      list.appendChild(el("h2", { text: "Your goals" }));
      if (!shown.length) { list.appendChild(el("p", { text: "No goals match these filters." })); return; }
      shown.forEach(function (g) { list.appendChild(goalCard(g)); });
    }

    function renderSuggest() {
      suggest.textContent = "";
      var have = S.state.goals.map(function (g) { return g.title; });
      var ideas = Hub.skills().map(function (s) { return { title: "Develop skill: " + s.name, skill: s.name }; })
        .filter(function (i) { return have.indexOf(i.title) === -1; }).slice(0, 6);
      if (!ideas.length) return;
      suggest.appendChild(el("h2", { text: "Suggested goals" }));
      suggest.appendChild(el("p", { text: "One click adds a development goal based on the skills in your scheme. You can edit it afterwards." }));
      var ul = el("ul", { class: "plain" });
      ideas.forEach(function (i) {
        var b = el("button", { type: "button", class: "btn small secondary", text: "Add", "aria-label": "Add goal: " + i.title });
        b.addEventListener("click", function () {
          var g = { id: S.id(), type: "development", title: i.title, description: "", target: "", progress: 0, created: S.today(), history: [] };
          S.state.goals.push(g); Hub.save(status, "Goal added: " + i.title + "."); renderAll(); focusGoal(g.id);
        });
        ul.appendChild(el("li", {}, [b, " ", i.title]));
      });
      suggest.appendChild(ul);
    }

    function renderAll() { renderSummary(); renderAdd(); renderFilters(); renderList(); renderSuggest(); }
    renderAll();
  };
})();
