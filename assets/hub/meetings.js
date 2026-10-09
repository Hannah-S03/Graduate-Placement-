// Meetings and feedback: 1:1 meeting notes (agenda, notes, actions) and a log of feedback you receive.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }
  function para(label, text) {
    if (!text) return null;
    return el("div", { class: "note-block" }, [el("h4", { text: label }), el("p", { class: "note-text", text: text })]);
  }
  function goalOptions(noneLabel) {
    return [{ value: "", label: noneLabel }].concat(S.state.goals.map(function (g) { return { value: g.id, label: g.title }; }));
  }

  // ---------------------------------------------------------------- 1:1 meetings
  R.meetings = function (t) {
    var status = Hub.status();
    var summary = el("p", { class: "goal-summary" }), addHost = el("div"), list = el("div");
    var ui = { adding: false, editing: null, open: {}, addingAction: {}, turning: null };
    [status, summary, addHost, list].forEach(function (n) { t.appendChild(n); });

    function sorted() { return S.state.meetings.slice().sort(byDateDesc); }
    function focusMeeting(id) { var b = list.querySelector('[data-id="' + id + '"] .goal-toggle'); if (b) b.focus(); }
    function focusAction(id, sel) { var n = list.querySelector('[data-action="' + id + '"] ' + sel); if (n) n.focus(); }
    function counts(m) { return { total: m.actions.length, done: m.actions.filter(function (a) { return a.done; }).length }; }

    function renderSummary() {
      var ms = S.state.meetings, open = 0;
      ms.forEach(function (m) { open += m.actions.filter(function (a) { return !a.done; }).length; });
      summary.textContent = ms.length ? Hub.plural(ms.length, "meeting", "meetings") + " · " + (open ? Hub.plural(open, "open action", "open actions") : "no open actions") : "";
      summary.hidden = !ms.length;
    }

    function fields() {
      return [
        { name: "date", label: "Date", type: "date", required: true },
        { name: "withWho", label: "Who with", maxlength: 120, hint: "For example your manager or mentor." },
        { name: "title", label: "Topic", maxlength: 200, hint: "Optional, for example Mid-point check-in." },
        { name: "agenda", label: "Agenda", type: "textarea", rows: 3, hint: "What you want to talk about. Write it before the meeting." },
        { name: "notes", label: "Notes", type: "textarea", rows: 4, hint: "What was said and decided." },
        { name: "next", label: "Next 1:1 date", type: "date", hint: "Optional. It will appear in your calendar." }
      ];
    }
    function renderAdd() {
      addHost.textContent = "";
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add a meeting" });
        b.addEventListener("click", function () { ui.adding = true; ui.editing = null; renderAdd(); var f = addHost.querySelector("input"); if (f) f.focus(); });
        addHost.appendChild(b); return;
      }
      var p = Hub.panel("Add a meeting");
      p.appendChild(Hub.form({
        fields: fields(), values: { date: S.today(), withWho: S.state.profile.manager || "" }, submitLabel: "Add meeting",
        onCancel: function () { ui.adding = false; renderAdd(); },
        onSubmit: function (v) {
          var m = { id: S.id(), date: v.date, withWho: v.withWho, title: v.title, agenda: v.agenda, notes: v.notes, next: v.next, actions: [] };
          S.state.meetings.push(m); ui.open[m.id] = true; ui.adding = false;
          Hub.save(status, "Meeting added."); renderAll(); focusMeeting(m.id);
        }
      }));
      addHost.appendChild(p); Hub.focus(p.heading);
    }

    function actionRow(m, a) {
      var li = el("li", { class: "task action" + (a.done ? " task-completed" : ""), "data-action": a.id });
      var line = el("div", { class: "task-line" });
      var id = "act-" + a.id;
      var cb = el("input", { type: "checkbox", id: id, "aria-label": "Done: " + a.text });
      cb.checked = a.done;
      cb.addEventListener("change", function () { a.done = cb.checked; Hub.save(status, a.done ? "Action done." : "Action reopened."); renderAll(); focusAction(a.id, "input[type=checkbox]"); });
      line.appendChild(el("span", { class: "action-main" }, [cb, el("label", { for: id, class: "task-text", text: a.text })]));
      var menu = Hub.moreMenu("More actions for: " + a.text);
      var panel = menu.panel;
      function showMenu() {
        panel.textContent = "";
        var turn = el("button", { type: "button", class: "btn small secondary", text: "Turn into a task", "aria-label": "Turn into a task: " + a.text });
        turn.addEventListener("click", showTurn);
        panel.appendChild(turn);
        panel.appendChild(Hub.confirmButton({
          label: "Delete action", ariaLabel: "Delete action: " + a.text, message: "Delete this action?",
          onConfirm: function () { menu.close(false); m.actions = m.actions.filter(function (x) { return x.id !== a.id; }); Hub.save(status, "Action deleted."); renderAll(); focusMeeting(m.id); }
        }));
      }
      function showTurn() {
        panel.textContent = "";
        if (!S.state.goals.length) { panel.appendChild(el("p", { class: "muted", text: "Add a goal on My journey first, then you can turn actions into tasks." })); return; }
        var f = Hub.field({ name: "goal", label: "Add as a task to", type: "select", required: true, options: goalOptions("Choose a goal") }, "");
        var add = el("button", { type: "button", class: "btn small", text: "Add to goal" });
        add.addEventListener("click", function () {
          var gid = f.input.value;
          if (!gid) { f.setError("Choose a goal."); f.input.focus(); return; }
          var g = S.state.goals.filter(function (x) { return x.id === gid; })[0];
          if (!g) return;
          if (g.tasks.length >= 50) { f.setError("That goal already has 50 tasks."); return; }
          g.tasks.push({ id: S.id(), text: a.text, status: "notstarted", comments: [] });
          a.goalTitle = g.title; menu.close(false);
          Hub.save(status, "Added to goal “" + g.title + "” as a task."); renderAll(); focusAction(a.id, ".more-btn");
        });
        panel.appendChild(f.wrap); panel.appendChild(add);
        f.input.focus();
      }
      menu.button.addEventListener("click", function () { if (!panel.hidden) showMenu(); });
      showMenu();
      var actions = el("span", { class: "action-tools" });
      if (a.goalTitle) actions.appendChild(el("span", { class: "muted action-goal", text: "Task in “" + a.goalTitle + "”" }));
      actions.appendChild(menu.wrap);
      line.appendChild(actions);
      li.appendChild(line);
      return li;
    }

    function addAction(m) {
      var box = el("div", { class: "add-task" });
      if (!ui.addingAction[m.id]) {
        var b = el("button", { type: "button", class: "btn small secondary", text: "+ Add action", "aria-label": "Add an action to the meeting on " + Hub.fmtDate(m.date) });
        b.addEventListener("click", function () { ui.addingAction[m.id] = true; renderList(); var f = list.querySelector('[data-id="' + m.id + '"] .add-task input'); if (f) f.focus(); });
        box.appendChild(b); return box;
      }
      var form = Hub.form({
        fields: [{ name: "text", label: "New action", required: true, maxlength: 300 }], values: {}, submitLabel: "Add action", extraClass: "inline",
        onCancel: function () { ui.addingAction[m.id] = false; renderList(); var b2 = list.querySelector('[data-id="' + m.id + '"] .add-task button'); if (b2) b2.focus(); },
        onSubmit: function (v) {
          if (m.actions.length >= 30) { status.say("A meeting can hold up to 30 actions.", true); return; }
          m.actions.push({ id: S.id(), text: v.text, done: false, goalTitle: "" });
          Hub.save(status, "Action added."); renderAll();
          var f = list.querySelector('[data-id="' + m.id + '"] .add-task input'); if (f) f.focus();
        }
      });
      form.addEventListener("keydown", function (e) { if (e.key === "Escape") { ui.addingAction[m.id] = false; renderList(); var b3 = list.querySelector('[data-id="' + m.id + '"] .add-task button'); if (b3) b3.focus(); } });
      box.appendChild(form); return box;
    }

    function meetingCard(m, index) {
      var c = counts(m);
      var card = el("article", { class: "item goal meeting", "data-id": m.id });
      var open = ui.editing === m.id ? true : (ui.open[m.id] !== undefined ? ui.open[m.id] : index === 0);
      var body = el("div", { class: "goal-body", id: "mb-" + m.id });
      var head = el("div", { class: "goal-head" });
      var label = Hub.fmtDate(m.date) + (m.withWho ? " · " + m.withWho : "") + (m.title ? " – " + m.title : "");
      var toggle = el("button", { type: "button", class: "goal-toggle", "aria-controls": body.id }, [el("span", { text: label }), el("span", { class: "chev", "aria-hidden": "true" })]);
      function setOpen(o) { toggle.setAttribute("aria-expanded", String(o)); body.hidden = !o; card.classList.toggle("is-collapsed", !o); }
      toggle.addEventListener("click", function () { var o = body.hidden; ui.open[m.id] = o; setOpen(o); });
      head.appendChild(el("h3", {}, [toggle]));
      var menu = Hub.moreMenu("More actions for the meeting on " + Hub.fmtDate(m.date));
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit meeting", "aria-label": "Edit the meeting on " + Hub.fmtDate(m.date) });
      ed.addEventListener("click", function () { menu.close(false); ui.editing = m.id; renderList(); var f = list.querySelector('[data-id="' + m.id + '"] input'); if (f) f.focus(); });
      menu.panel.appendChild(ed);
      menu.panel.appendChild(Hub.confirmButton({
        label: "Delete meeting", ariaLabel: "Delete the meeting on " + Hub.fmtDate(m.date), message: "Delete this meeting and its notes?",
        onConfirm: function () { menu.close(false); S.state.meetings = S.state.meetings.filter(function (x) { return x.id !== m.id; }); Hub.save(status, "Meeting deleted."); renderAll(); Hub.focus(addHost.querySelector("button") || status); }
      }));
      head.appendChild(menu.wrap);
      card.appendChild(head);
      var meta = el("div", { class: "item-meta" });
      meta.appendChild(el("span", { class: "muted task-count", text: c.total ? c.done + " of " + Hub.plural(c.total, "action", "actions") + " done" : "No actions yet" }));
      if (m.next) meta.appendChild(Hub.badge("Next 1:1: " + Hub.fmtDate(m.next), S.daysBetween(S.today(), m.next) < 0 ? "info" : "warn"));
      card.appendChild(meta);
      if (ui.editing === m.id) {
        body.appendChild(Hub.form({
          fields: fields(), values: m, submitLabel: "Save changes",
          onCancel: function () { ui.editing = null; renderList(); focusMeeting(m.id); },
          onSubmit: function (v) {
            m.date = v.date; m.withWho = v.withWho; m.title = v.title; m.agenda = v.agenda; m.notes = v.notes; m.next = v.next;
            ui.editing = null; Hub.save(status, "Meeting updated."); renderAll(); focusMeeting(m.id);
          }
        }));
      } else {
        [para("Agenda", m.agenda), para("Notes", m.notes)].forEach(function (n) { if (n) body.appendChild(n); });
        body.appendChild(el("h4", { text: "Actions" }));
        if (m.actions.length) { var ul = el("ul", { class: "task-list" }); m.actions.forEach(function (a) { ul.appendChild(actionRow(m, a)); }); body.appendChild(ul); }
        else body.appendChild(el("p", { class: "muted", text: "Add the things you agreed to do." }));
        body.appendChild(addAction(m));
      }
      card.appendChild(body);
      setOpen(open);
      return card;
    }

    function renderList() {
      list.textContent = "";
      var all = sorted();
      if (!all.length) { list.appendChild(el("p", { text: "No meetings yet. Add one before your next catch-up to write the agenda, then add notes and actions afterwards." })); return; }
      var wrap = el("div", { class: "goal-list" });
      all.forEach(function (m, i) { wrap.appendChild(meetingCard(m, i)); });
      list.appendChild(wrap);
    }
    function renderAll() { renderSummary(); renderAdd(); renderList(); }
    renderAll();
  };

  // ---------------------------------------------------------------- feedback log
  var KINDS = [{ value: "positive", label: "Positive" }, { value: "develop", label: "To develop" }];
  function kindLabel(k) { return k === "develop" ? "To develop" : "Positive"; }

  R.feedbackLog = function (t) {
    var status = Hub.status();
    var summary = el("p", { class: "goal-summary" }), addHost = el("div"), filterHost = el("div"), list = el("div");
    var ui = { adding: false, editing: null, kind: "all" };
    [status, summary, addHost, filterHost, list].forEach(function (n) { t.appendChild(n); });

    function sorted() { return S.state.feedback.slice().sort(byDateDesc); }
    function focusItem(id) { var h = list.querySelector('[data-id="' + id + '"] h3'); if (h) Hub.focus(h); }
    function renderSummary() {
      var f = S.state.feedback, pos = f.filter(function (x) { return x.kind === "positive"; }).length;
      summary.textContent = f.length ? Hub.plural(f.length, "piece of feedback", "pieces of feedback") + " · " + pos + " positive" : "";
      summary.hidden = !f.length;
    }
    function fields() {
      return [
        { name: "date", label: "Date", type: "date", required: true },
        { name: "from", label: "From", maxlength: 120, hint: "Who gave you the feedback." },
        { name: "kind", label: "Type", type: "select", required: true, options: KINDS },
        { name: "text", label: "Feedback", type: "textarea", rows: 3, required: true, maxlength: 3000, hint: "What they said, in your own words." },
        { name: "action", label: "What I will do about it", type: "textarea", rows: 2, maxlength: 1000 },
        { name: "goalId", label: "Linked goal", type: "select", options: goalOptions("Not linked to a goal"), hint: "Optional." }
      ];
    }
    function renderAdd() {
      addHost.textContent = "";
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add feedback" });
        b.addEventListener("click", function () { ui.adding = true; ui.editing = null; renderAdd(); var f = addHost.querySelector("input"); if (f) f.focus(); });
        addHost.appendChild(b); return;
      }
      var p = Hub.panel("Add feedback");
      p.appendChild(Hub.form({
        fields: fields(), values: { date: S.today(), kind: "positive" }, submitLabel: "Add feedback",
        onCancel: function () { ui.adding = false; renderAdd(); },
        onSubmit: function (v) {
          var f = { id: S.id(), date: v.date, from: v.from, kind: v.kind, text: v.text, action: v.action, goalId: v.goalId };
          S.state.feedback.push(f); ui.adding = false; Hub.save(status, "Feedback added."); renderAll(); focusItem(f.id);
        }
      }));
      addHost.appendChild(p); Hub.focus(p.heading);
    }
    function renderFilter() {
      filterHost.textContent = "";
      if (!S.state.feedback.length) return;
      var fk = Hub.field({ name: "kind", label: "Show", type: "select", required: true, options: [{ value: "all", label: "All feedback" }].concat(KINDS) }, ui.kind);
      fk.input.addEventListener("change", function () { ui.kind = fk.input.value; renderList(); });
      filterHost.appendChild(el("div", { class: "filters" }, [fk.wrap]));
    }
    function card(f) {
      var c = el("article", { class: "item", "data-id": f.id });
      var head = el("div", { class: "goal-head" });
      head.appendChild(el("h3", { text: Hub.fmtDate(f.date) + (f.from ? " · from " + f.from : "") }));
      var menu = Hub.moreMenu("More actions for the feedback on " + Hub.fmtDate(f.date));
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit feedback", "aria-label": "Edit the feedback on " + Hub.fmtDate(f.date) });
      ed.addEventListener("click", function () { menu.close(false); ui.editing = f.id; renderList(); var i = list.querySelector('[data-id="' + f.id + '"] input'); if (i) i.focus(); });
      menu.panel.appendChild(ed);
      var save = el("button", { type: "button", class: "btn small secondary", text: "Save to achievements", "aria-label": "Save the feedback on " + Hub.fmtDate(f.date) + " to your achievements" });
      save.addEventListener("click", function () {
        menu.close(false);
        var title = "Feedback" + (f.from ? " from " + f.from : "");
        if (S.state.achievements.some(function (a) { return a.type === "feedback" && a.title === title && a.date === f.date && a.did === f.text; })) { status.say("That feedback is already in your achievements.", false); return; }
        S.state.achievements.push({ id: S.id(), title: title, type: "feedback", date: f.date, skills: [], did: f.text, impact: "", evidence: "", learnt: f.action });
        Hub.save(status, "Saved to your achievements."); menu.button.focus();
      });
      menu.panel.appendChild(save);
      menu.panel.appendChild(Hub.confirmButton({
        label: "Delete feedback", ariaLabel: "Delete the feedback on " + Hub.fmtDate(f.date), message: "Delete this feedback?",
        onConfirm: function () { menu.close(false); S.state.feedback = S.state.feedback.filter(function (x) { return x.id !== f.id; }); Hub.save(status, "Feedback deleted."); renderAll(); Hub.focus(addHost.querySelector("button") || status); }
      }));
      head.appendChild(menu.wrap);
      c.appendChild(head);
      c.appendChild(el("div", { class: "item-meta" }, [Hub.badge(kindLabel(f.kind), f.kind === "develop" ? "warn" : "ok")]));
      if (ui.editing === f.id) {
        c.appendChild(Hub.form({
          fields: fields(), values: f, submitLabel: "Save changes",
          onCancel: function () { ui.editing = null; renderList(); focusItem(f.id); },
          onSubmit: function (v) {
            f.date = v.date; f.from = v.from; f.kind = v.kind; f.text = v.text; f.action = v.action; f.goalId = v.goalId;
            ui.editing = null; Hub.save(status, "Feedback updated."); renderAll(); focusItem(f.id);
          }
        }));
        return c;
      }
      c.appendChild(el("p", { class: "note-text", text: f.text }));
      if (f.action) c.appendChild(el("p", {}, [el("strong", { text: "What I will do: " }), el("span", { class: "note-text", text: f.action })]));
      var g = f.goalId ? S.state.goals.filter(function (x) { return x.id === f.goalId; })[0] : null;
      if (g) c.appendChild(el("p", { class: "muted" }, ["Linked goal: ", el("a", { href: "journey.html", text: g.title })]));
      return c;
    }
    function renderList() {
      list.textContent = "";
      var all = sorted();
      if (!all.length) { list.appendChild(el("p", { text: "No feedback logged yet. When someone gives you feedback, add it here with what you will do about it. It is useful evidence for your reviews." })); return; }
      var shown = all.filter(function (f) { return ui.kind === "all" || f.kind === ui.kind; });
      if (!shown.length) { list.appendChild(el("p", { text: "No feedback of that type." })); return; }
      var wrap = el("div", { class: "cols" });
      shown.forEach(function (f) { wrap.appendChild(card(f)); });
      list.appendChild(wrap);
    }
    function renderAll() { renderSummary(); renderAdd(); renderFilter(); renderList(); }
    renderAll();
  };

  document.addEventListener("DOMContentLoaded", Hub.foldSections);
})();
