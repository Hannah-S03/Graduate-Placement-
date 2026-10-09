// My journey: development, career and placement goals. Each goal holds tasks (not started, in progress, completed) with comments.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  var TYPES = [{ value: "development", label: "Development" }, { value: "career", label: "Career" }, { value: "placement", label: "Placement" }];
  function typeLabel(v) { return (TYPES.filter(function (t) { return t.value === v; })[0] || {}).label || v; }

  R.journey = function (t) {
    var status = Hub.status();
    var summary = el("div"), addHost = el("div"), filterHost = el("div"), list = el("div"), suggest = el("div");
    var ui = { adding: false, editing: null, editTask: null, openComments: {}, openGoals: {}, addingTask: {}, suggestOpen: false, type: "all", status: "all" };
    Hub.notices(t);
    [status, summary, addHost, filterHost, list, suggest].forEach(function (n) { t.appendChild(n); });

    function sorted() {
      return S.state.goals.slice().sort(function (a, b) {
        var x = a.target || "9999-99-99", y = b.target || "9999-99-99";
        return x < y ? -1 : x > y ? 1 : (a.created || "") < (b.created || "") ? -1 : 1;
      });
    }
    function focusGoal(id) {
      var b = list.querySelector('[data-id="' + id + '"] .goal-toggle');
      if (b) b.focus();
    }

    // One plain line instead of tiles: how many goals, and how many tasks are completed.
    function renderSummary() {
      summary.textContent = "";
      var goals = S.state.goals; if (!goals.length) return;
      var total = 0, done = 0;
      goals.forEach(function (g) { var c = Hub.taskCounts(g); total += c.total; done += c.completed; });
      summary.appendChild(el("p", { class: "goal-summary", text: Hub.plural(goals.length, "goal", "goals") + " \u00B7 " + (total ? done + " of " + Hub.plural(total, "task", "tasks") + " completed" : "no tasks yet") }));
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
          S.state.goals.push(g); ui.openGoals[g.id] = true;
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

    function icon() {
      var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", "0 0 16 16"); svg.setAttribute("width", "14"); svg.setAttribute("height", "14"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", "M2 2.5h12v8H7.5L4 13.5v-3H2z"); path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "1.4"); path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path); return svg;
    }

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
          Hub.save(status, "Comment added."); renderAll(); focusTask(t.id, ".comments-toggle");
        }
      }));
    }

    function taskRow(g, t) {
      var li = el("li", { class: "task task-" + t.status, "data-task": t.id });
      if (ui.editTask === t.id) {
        li.appendChild(Hub.form({
          fields: [{ name: "text", label: "Task", required: true, maxlength: 200 }], values: { text: t.text }, submitLabel: "Save task",
          onCancel: function () { ui.editTask = null; renderList(); focusTask(t.id, ".more-btn"); },
          onSubmit: function (v) { t.text = v.text; ui.editTask = null; Hub.save(status, "Task updated."); renderList(); focusTask(t.id, "select"); }
        }));
        return li;
      }
      var line = el("div", { class: "task-line" });
      line.appendChild(el("span", { class: "task-text", text: t.text }));
      var sel = el("select", { class: "task-status s-" + t.status, "aria-label": "Status of task: " + t.text });
      Object.keys(Hub.taskStatusLabel).forEach(function (k) { var o = el("option", { value: k, text: Hub.taskStatusLabel[k] }); if (k === t.status) o.selected = true; sel.appendChild(o); });
      sel.addEventListener("change", function () {
        t.status = sel.value; Hub.save(status, "Task marked " + Hub.taskStatusLabel[t.status].toLowerCase() + ".");
        renderAll(); focusTask(t.id, "select");
      });
      line.appendChild(sel);
      var panel = el("div", { class: "task-comments", id: "tc-" + t.id });
      var tog = el("button", { type: "button", class: "btn small secondary comments-toggle", "aria-controls": panel.id, "aria-label": "Comments for task " + t.text + " (" + t.comments.length + ")" }, [icon(), el("span", { text: String(t.comments.length) })]);
      function setOpen(open) { tog.setAttribute("aria-expanded", String(open)); panel.hidden = !open; ui.openComments[t.id] = open; if (open) commentsPanel(g, t, panel); }
      tog.addEventListener("click", function () { setOpen(panel.hidden); if (!panel.hidden) { var f = panel.querySelector("textarea"); if (f) f.focus(); } });
      line.appendChild(tog);
      var menu = Hub.moreMenu("More actions for task " + t.text);
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit task", "aria-label": "Edit task " + t.text });
      ed.addEventListener("click", function () { menu.close(false); ui.editTask = t.id; renderList(); var f = list.querySelector('[data-task="' + t.id + '"] input'); if (f) f.focus(); });
      menu.panel.appendChild(ed);
      menu.panel.appendChild(Hub.confirmButton({
        label: "Delete task", ariaLabel: "Delete task " + t.text, message: "Delete this task?",
        onConfirm: function () { menu.close(false); g.tasks = g.tasks.filter(function (x) { return x.id !== t.id; }); Hub.save(status, "Task deleted."); renderAll(); focusGoal(g.id); }
      }));
      line.appendChild(menu.wrap);
      li.appendChild(line);
      li.appendChild(panel);
      setOpen(!!ui.openComments[t.id]);
      return li;
    }

    // "+ Add task" reveals a one-line form that stays open so several tasks can be added in a row.
    function addTask(g) {
      var box = el("div", { class: "add-task" });
      if (!ui.addingTask[g.id]) {
        var b = el("button", { type: "button", class: "btn small secondary", text: "+ Add task", "aria-label": "Add a task to " + g.title });
        b.addEventListener("click", function () { ui.addingTask[g.id] = true; renderList(); var f = list.querySelector('[data-id="' + g.id + '"] .add-task input'); if (f) f.focus(); });
        box.appendChild(b); return box;
      }
      var form = Hub.form({
        fields: [{ name: "text", label: "New task", required: true, maxlength: 200 }],
        values: {}, submitLabel: "Add task", extraClass: "inline",
        onCancel: function () { ui.addingTask[g.id] = false; renderList(); var b2 = list.querySelector('[data-id="' + g.id + '"] .add-task button'); if (b2) b2.focus(); },
        onSubmit: function (v) {
          if (g.tasks.length >= 50) { status.say("A goal can hold up to 50 tasks.", true); return; }
          g.tasks.push({ id: S.id(), text: v.text, status: "notstarted", comments: [] });
          Hub.save(status, "Task added."); renderAll();
          var f = list.querySelector('[data-id="' + g.id + '"] .add-task input'); if (f) f.focus();
        }
      });
      form.addEventListener("keydown", function (e) { if (e.key === "Escape") { ui.addingTask[g.id] = false; renderList(); var b3 = list.querySelector('[data-id="' + g.id + '"] .add-task button'); if (b3) b3.focus(); } });
      box.appendChild(form); return box;
    }

    function goalCard(g, startsOpen) {
      var st = Hub.goalStatus(g), counts = Hub.taskCounts(g);
      var card = el("article", { class: "item goal", "data-id": g.id });
      var open = ui.editing === g.id ? true : (ui.openGoals[g.id] !== undefined ? ui.openGoals[g.id] : startsOpen);
      var body = el("div", { class: "goal-body", id: "gb-" + g.id });

      // header: title button, type / status / due badges, task count, and the goal's own actions
      var head = el("div", { class: "goal-head" });
      var toggle = el("button", { type: "button", class: "goal-toggle", "aria-controls": body.id }, [el("span", { text: g.title }), el("span", { class: "chev", "aria-hidden": "true" })]);
      function setOpen(o) { toggle.setAttribute("aria-expanded", String(o)); body.hidden = !o; card.classList.toggle("is-collapsed", !o); }
      toggle.addEventListener("click", function () { var o = body.hidden; ui.openGoals[g.id] = o; setOpen(o); });
      head.appendChild(el("h3", {}, [toggle]));
      var menu = Hub.moreMenu("More actions for goal " + g.title);
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit goal", "aria-label": "Edit " + g.title });
      ed.addEventListener("click", function () { menu.close(false); ui.editing = g.id; renderList(); var f = list.querySelector('[data-id="' + g.id + '"] input'); if (f) f.focus(); });
      menu.panel.appendChild(ed);
      menu.panel.appendChild(Hub.confirmButton({
        label: "Delete goal", ariaLabel: "Delete " + g.title, message: "Delete this goal and its tasks?",
        onConfirm: function () {
          menu.close(false); S.state.goals = S.state.goals.filter(function (x) { return x.id !== g.id; });
          Hub.save(status, "Goal deleted."); renderAll(); Hub.focus(addHost.querySelector("button") || status);
        }
      }));
      head.appendChild(menu.wrap);
      card.appendChild(head);
      var meta = el("div", { class: "item-meta" }, [Hub.badge(typeLabel(g.type), "info"), Hub.badge(Hub.goalStatusLabel[st], st === "done" ? "ok" : st === "inprogress" ? "warn" : "info")]);
      if (g.target) { var db = Hub.dueBadge(g.target, st === "done"); meta.appendChild(Hub.badge(st === "done" ? "Target " + Hub.fmtDate(g.target) : db.text, db.kind)); }
      meta.appendChild(el("span", { class: "muted task-count", text: counts.total ? counts.completed + " of " + Hub.plural(counts.total, "task", "tasks") + " completed" : "No tasks yet" }));
      card.appendChild(meta);

      if (ui.editing === g.id) {
        body.appendChild(Hub.form({
          fields: goalFields(), values: g, submitLabel: "Save changes",
          onCancel: function () { ui.editing = null; renderList(); focusGoal(g.id); },
          onSubmit: function (v) {
            g.type = v.type; g.title = v.title; g.description = v.description; g.target = v.target;
            ui.editing = null; Hub.save(status, "Goal updated."); renderAll(); focusGoal(g.id);
          }
        }));
      } else {
        if (g.description) body.appendChild(el("p", { class: "goal-desc", text: g.description }));
        if (counts.total) {
          var ul = el("ul", { class: "task-list" });
          g.tasks.forEach(function (t) { ul.appendChild(taskRow(g, t)); });
          body.appendChild(ul);
        } else body.appendChild(el("p", { class: "muted", text: "Add a task to start tracking this goal." }));
        body.appendChild(addTask(g));
      }
      card.appendChild(body);
      setOpen(open);
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
      var wrap = el("div", { class: "goal-list" });
      // the first goal that is not finished starts open; the rest start folded
      var first = shown.filter(function (g) { return Hub.goalStatus(g) !== "done"; })[0] || shown[0];
      shown.forEach(function (g) { wrap.appendChild(goalCard(g, g === first)); });
      list.appendChild(wrap);
    }

    function renderSuggest() {
      suggest.textContent = "";
      var have = S.state.goals.map(function (g) { return g.title; });
      var ideas = Hub.skills().map(function (s) { return { title: "Develop skill: " + s.name, skill: s.name }; })
        .filter(function (i) { return have.indexOf(i.title) === -1; }).slice(0, 6);
      if (!ideas.length) return;
      var det = el("details", { class: "suggest-box" }, [el("summary", { text: "Need ideas? Suggested goals" })]);
      if (ui.suggestOpen) det.open = true;
      det.addEventListener("toggle", function () { ui.suggestOpen = det.open; });
      det.appendChild(el("p", { text: "One click adds a development goal based on the skills in your scheme. You can edit it afterwards." }));
      var ul = el("ul", { class: "plain" });
      ideas.forEach(function (i) {
        var b = el("button", { type: "button", class: "btn small secondary", text: "Add", "aria-label": "Add goal: " + i.title });
        b.addEventListener("click", function () {
          var g = { id: S.id(), type: "development", title: i.title, description: "", target: "", progress: 0, created: S.today(), tasks: [] };
          S.state.goals.push(g); ui.openGoals[g.id] = true; Hub.save(status, "Goal added: " + i.title + "."); renderAll(); focusGoal(g.id);
        });
        ul.appendChild(el("li", {}, [b, " ", i.title]));
      });
      det.appendChild(ul);
      suggest.appendChild(det);
    }

    function renderAll() { renderSummary(); renderAdd(); renderFilters(); renderList(); renderSuggest(); }
    renderAll();
  };
})();
