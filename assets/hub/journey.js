// My journey: development, career and placement goals. Each goal holds tasks (not started, in progress, completed) with comments.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  var TYPES = [{ value: "development", label: "Development" }, { value: "career", label: "Career" }, { value: "placement", label: "Placement" }];
  function typeLabel(v) { return (TYPES.filter(function (t) { return t.value === v; })[0] || {}).label || v; }

  R.journey = function (t) {
    var status = Hub.status();
    var summary = el("div"), addHost = el("div"), filterHost = el("div"), list = el("div"), suggest = el("div");
    var ui = { adding: false, editing: null, editTask: null, openComments: {}, type: "all", status: "all" };
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
        var avg = goals.length ? goals.reduce(function (a, g) { return a + Hub.goalProgress(g); }, 0) / goals.length : 0;
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
          var g = { id: S.id(), type: v.type, title: v.title, description: v.description, target: v.target, progress: 0, created: S.today(), tasks: [] };
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

    function focusTask(id, sel) {
      var n = list.querySelector('[data-task="' + id + '"] ' + sel);
      if (n) n.focus();
    }
    function findTask(g, id) { return g.tasks.filter(function (t) { return t.id === id; })[0]; }

    function commentsPanel(g, t, panel) {
      panel.textContent = "";
      if (t.comments.length) {
        var ul = el("ul", { class: "comments" });
        t.comments.forEach(function (c) {
          var li = el("li", {}, [el("span", { class: "comment-date", text: c.date ? Hub.fmtDate(c.date) : "" }), el("span", { class: "comment-text", text: c.text })]);
          li.appendChild(Hub.confirmButton({
            label: "Delete", ariaLabel: "Delete comment: " + c.text.slice(0, 40), message: "Delete this comment?",
            onConfirm: function () { t.comments = t.comments.filter(function (x) { return x.id !== c.id; }); Hub.save(status, "Comment deleted."); renderList(); focusTask(t.id, ".comments-toggle"); }
          }));
          ul.appendChild(li);
        });
        panel.appendChild(ul);
      }
      panel.appendChild(Hub.form({
        fields: [{ name: "text", label: "Add a comment", type: "textarea", rows: 2, required: true, maxlength: 500 }],
        values: {}, submitLabel: "Add comment",
        onSubmit: function (v) {
          t.comments.push({ id: S.id(), date: S.today(), text: v.text });
          ui.openComments[t.id] = true;
          Hub.save(status, "Comment added."); renderList(); focusTask(t.id, ".comments-toggle");
        }
      }));
    }

    function taskRow(g, t) {
      var li = el("li", { class: "task task-" + t.status, "data-task": t.id });
      if (ui.editTask === t.id) {
        li.appendChild(Hub.form({
          fields: [{ name: "text", label: "Task", required: true, maxlength: 200 }], values: { text: t.text }, submitLabel: "Save task",
          onCancel: function () { ui.editTask = null; renderList(); focusTask(t.id, "button"); },
          onSubmit: function (v) { t.text = v.text; ui.editTask = null; Hub.save(status, "Task updated."); renderList(); focusTask(t.id, "select"); }
        }));
        return li;
      }
      var sel = el("select", { class: "task-status", "aria-label": "Status of task: " + t.text });
      Object.keys(Hub.taskStatusLabel).forEach(function (k) { var o = el("option", { value: k, text: Hub.taskStatusLabel[k] }); if (k === t.status) o.selected = true; sel.appendChild(o); });
      sel.addEventListener("change", function () {
        t.status = sel.value; Hub.save(status, "Task marked " + Hub.taskStatusLabel[t.status].toLowerCase() + ".");
        renderAll(); focusTask(t.id, "select");
      });
      li.appendChild(el("div", { class: "task-main" }, [el("span", { class: "task-text", text: t.text }), sel]));
      var acts = el("div", { class: "task-actions" });
      var panel = el("div", { class: "task-comments", id: "tc-" + t.id });
      var tog = el("button", { type: "button", class: "btn small secondary comments-toggle", "aria-controls": panel.id, "aria-label": "Comments for task " + t.text + " (" + t.comments.length + ")", text: "Comments (" + t.comments.length + ")" });
      function setOpen(open) { tog.setAttribute("aria-expanded", String(open)); panel.hidden = !open; ui.openComments[t.id] = open; if (open) commentsPanel(g, t, panel); }
      tog.addEventListener("click", function () { setOpen(panel.hidden); if (!panel.hidden) { var f = panel.querySelector("textarea"); if (f) f.focus(); } });
      acts.appendChild(tog);
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit task " + t.text });
      ed.addEventListener("click", function () { ui.editTask = t.id; renderList(); var f = list.querySelector('[data-task="' + t.id + '"] input'); if (f) f.focus(); });
      acts.appendChild(ed);
      acts.appendChild(Hub.confirmButton({
        label: "Delete", ariaLabel: "Delete task " + t.text, message: "Delete this task?",
        onConfirm: function () { g.tasks = g.tasks.filter(function (x) { return x.id !== t.id; }); Hub.save(status, "Task deleted."); renderAll(); focusGoal(g.id); }
      }));
      li.appendChild(acts);
      li.appendChild(panel);
      setOpen(!!ui.openComments[t.id]);
      return li;
    }

    function taskList(g) {
      var box = el("div", { class: "tasks" });
      if (g.tasks.length) {
        var ul = el("ul", { class: "task-list" });
        g.tasks.forEach(function (t) { ul.appendChild(taskRow(g, t)); });
        box.appendChild(ul);
      }
      box.appendChild(Hub.form({
        fields: [{ name: "text", label: "Add a task", required: true, maxlength: 200, hint: g.tasks.length >= 50 ? "You have reached the limit of 50 tasks for this goal." : "" }],
        values: {}, submitLabel: "Add task", extraClass: "inline",
        onSubmit: function (v) {
          if (g.tasks.length >= 50) { status.say("A goal can hold up to 50 tasks.", true); return; }
          var t = { id: S.id(), text: v.text, status: "notstarted", comments: [] };
          g.tasks.push(t); Hub.save(status, "Task added."); renderAll(); focusTask(t.id, "select");
        }
      }));
      return box;
    }

    function goalCard(g) {
      var st = Hub.goalStatus(g);
      var card = el("article", { class: "item", "data-id": g.id });
      card.appendChild(el("h3", { text: g.title }));
      var meta = el("div", { class: "item-meta" }, [Hub.badge(typeLabel(g.type), "info"), Hub.badge(Hub.goalStatusLabel[st], st === "done" ? "ok" : st === "inprogress" ? "warn" : "info")]);
      if (g.target) { var db = Hub.dueBadge(g.target, st === "done"); meta.appendChild(Hub.badge(st === "done" ? "Target " + Hub.fmtDate(g.target) : db.text, db.kind)); }
      card.appendChild(meta);
      if (g.description) card.appendChild(el("p", { text: g.description }));
      var counts = Hub.taskCounts(g);
      card.appendChild(el("p", { class: "muted task-count", text: counts.total ? counts.completed + " of " + Hub.plural(counts.total, "task", "tasks") + " completed" : "No tasks yet. Add a task to start tracking this goal." }));

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
      card.appendChild(taskList(g));
      var actions = el("div", { class: "actions goal-actions" });
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit goal", "aria-label": "Edit " + g.title });
      ed.addEventListener("click", function () { ui.editing = g.id; renderList(); focusGoal(g.id); });
      actions.appendChild(ed);
      actions.appendChild(Hub.confirmButton({
        label: "Delete goal", ariaLabel: "Delete " + g.title, message: "Delete this goal?",
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
      var wrap = el("div", { class: "cols" });
      shown.forEach(function (g) { wrap.appendChild(goalCard(g)); });
      list.appendChild(wrap);
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
          var g = { id: S.id(), type: "development", title: i.title, description: "", target: "", progress: 0, created: S.today(), tasks: [] };
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
