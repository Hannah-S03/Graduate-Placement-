// Home page panels: weekly goals, calendar and upcoming events, and a small progress update.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store;
  var MOODS = [{ value: "0", label: "Choose how it is going" }, { value: "1", label: "Struggling" }, { value: "2", label: "Tough" }, { value: "3", label: "Okay" }, { value: "4", label: "Good" }, { value: "5", label: "Great" }];
  var moodLabel = Hub.moodLabel;
  function weekLabel(cw) {
    var pl = cw.pl;
    if (pl.status === "during") return "Week " + cw.week + " of " + pl.totalWeeks;
    if (pl.status === "before") return "Plan week 1 (the programme starts in " + Hub.plural(pl.startsIn, "day", "days") + ")";
    if (pl.status === "after") return "Final week (" + cw.week + " of " + pl.totalWeeks + "): the programme is complete";
    return "Week 1";
  }
  function weeklyGoalsFor(week) { return S.state.weeklyGoals[String(week)] || []; }

  // A plain-text progress update the graduate can paste into a message to their manager or mentor.
  Hub.updateText = function () {
    var st = S.state, p = st.profile, cw = Hub.currentWeek(), key = String(cw.week), up = st.updates[key];
    var goals = weeklyGoalsFor(cw.week), done = goals.filter(function (g) { return g.done; }).length;
    var sum = Hub.progressSummary(), L = [];
    L.push("Progress update: " + weekLabel(cw) + (cw.pl.status === "during" ? " (" + cw.pl.pct + "% through the programme)" : ""));
    L.push((p.name || "Graduate") + (p.role ? ", " + p.role : "") + " – " + Hub.fmtDate(S.today()));
    if (up && up.mood) L.push("", "How it is going: " + moodLabel(up.mood));
    if (up && up.note) L.push("Note: " + up.note);
    L.push("", "Weekly goals (" + done + " of " + goals.length + " done):");
    if (!goals.length) L.push("- None set");
    goals.forEach(function (g) { L.push("- [" + (g.done ? "x" : " ") + "] " + g.text); });
    L.push("", "Overall progress: " + (sum.overall === null ? "n/a" : sum.overall + "%") + " (" + sum.parts.map(function (x) { return x.label.toLowerCase() + " " + (x.pct === null ? "none yet" : Math.round(x.pct) + "%"); }).join(", ") + ")");
    var ach = st.achievements.slice().sort(function (a, b) { return (a.date || "") < (b.date || "") ? 1 : -1; });
    L.push("Achievements recorded: " + ach.length + (ach.length ? " (latest: " + ach[0].title + ")" : ""));
    return L.join("\n");
  };

  // ---------- weekly goals ----------
  Hub.homePanels = {};
  Hub.homePanels.weekly = function (status) {
    var sec = Hub.panel("Weekly goals", "weekly");
    var body = el("div");
    sec.appendChild(body);

    function render(focusSel) {
      body.textContent = "";
      var cw = Hub.currentWeek(), goals = weeklyGoalsFor(cw.week), key = String(cw.week);
      body.appendChild(el("p", { class: "muted", text: weekLabel(cw) }));
      if (cw.pl.status === "none") body.appendChild(Hub.needStart());
      var done = goals.filter(function (g) { return g.done; }).length;
      body.appendChild(el("p", { class: "count", text: goals.length ? done + " of " + goals.length + " done" : "No goals set for this week yet" }));
      if (goals.length) body.appendChild(Hub.progress((done / goals.length) * 100, "Weekly goals done"));
      var ul = el("ul", { class: "checklist" });
      goals.forEach(function (g) {
        var id = "wg-" + g.id, cb = el("input", { type: "checkbox", id: id });
        cb.checked = g.done;
        cb.addEventListener("change", function () {
          g.done = cb.checked;
          Hub.save(status, g.done ? "Weekly goal done: " + g.text : "Weekly goal marked not done: " + g.text);
          render("#" + id); Hub.changed(render);
        });
        var rm = el("button", { type: "button", class: "btn small secondary", text: "Remove", "aria-label": "Remove weekly goal: " + g.text });
        rm.addEventListener("click", function () {
          S.state.weeklyGoals[key] = goals.filter(function (x) { return x.id !== g.id; });
          if (!S.state.weeklyGoals[key].length) delete S.state.weeklyGoals[key];
          Hub.save(status, "Weekly goal removed."); render(".weekly-add input"); Hub.changed(render);
        });
        ul.appendChild(el("li", { class: g.done ? "done" : "" }, [cb, el("label", { for: id, text: g.text }), rm]));
      });
      body.appendChild(ul);

      var form = Hub.form({
        fields: [{ name: "text", label: "Add a goal for this week", required: true, maxlength: 200 }],
        submitLabel: "Add goal",
        onSubmit: function (v) {
          var list = S.state.weeklyGoals[key] = S.state.weeklyGoals[key] || [];
          if (list.length >= 50) return { text: "You can have up to 50 goals in a week." };
          list.push({ id: S.id(), text: v.text, done: false });
          Hub.save(status, "Weekly goal added."); render(".weekly-add input"); Hub.changed(render);
        }
      });
      form.classList.add("weekly-add", "inline");
      body.appendChild(form);

      if (cw.week > 1) {
        var have = goals.map(function (g) { return g.text; });
        var carry = weeklyGoalsFor(cw.week - 1).filter(function (g) { return !g.done && have.indexOf(g.text) === -1; });
        if (carry.length) {
          var b = el("button", { type: "button", class: "btn small secondary", text: "Bring forward " + Hub.plural(carry.length, "unfinished goal", "unfinished goals") + " from week " + (cw.week - 1) });
          b.addEventListener("click", function () {
            var list = S.state.weeklyGoals[key] = S.state.weeklyGoals[key] || [];
            carry.forEach(function (g) { if (list.length < 50) list.push({ id: S.id(), text: g.text, done: false }); });
            Hub.save(status, "Brought forward " + Hub.plural(carry.length, "goal", "goals") + " from week " + (cw.week - 1) + "."); render(".weekly-add input"); Hub.changed(render);
          });
          body.appendChild(el("div", { class: "actions" }, [b]));
        }
      }
      if (focusSel) { var f = body.querySelector(focusSel); if (f) f.focus(); }
    }
    render();
    return sec;
  };

  // ---------- progress update ----------
  // One line shown while the Progress update panel is folded.
  Hub.homePanels.updateLine = function () {
    var cw = Hub.currentWeek(), goals = weeklyGoalsFor(cw.week), done = goals.filter(function (g) { return g.done; }).length;
    var sum = Hub.progressSummary(), up = S.state.updates[String(cw.week)], parts = ["Week " + cw.week];
    parts.push(goals.length ? "goals " + done + " of " + goals.length + " done" : "no weekly goals yet");
    if (sum.overall !== null) parts.push("overall " + sum.overall + "%");
    parts.push(up && moodLabel(up.mood) ? "feeling " + moodLabel(up.mood).toLowerCase() : "no update saved yet");
    return parts.join(" · ");
  };
  Hub.homePanels.update = function (status) {
    var sec = Hub.panel("Progress update", "update");
    var summaryHost = el("div"), formHost = el("div"), copyHost = el("div");
    [summaryHost, formHost, copyHost].forEach(function (n) { sec.appendChild(n); });

    function renderSummary() {
      summaryHost.textContent = "";
      var cw = Hub.currentWeek(), goals = weeklyGoalsFor(cw.week), done = goals.filter(function (g) { return g.done; }).length;
      var sum = Hub.progressSummary(), tr = Hub.training();
      var trDone = tr.filter(function (x) { return Hub.trainingStatus(x) === "complete"; }).length;
      var items = [
        ["Weekly goals", goals.length ? done + " of " + goals.length + " done" : "none set yet"],
        ["Reflection", S.state.reflections[String(cw.week)] ? "written" : "not written yet"],
        ["Overall progress", sum.overall === null ? "nothing added yet" : sum.overall + "%"],
        ["Training", trDone + " of " + tr.length + " complete"],
        ["Achievements", String(S.state.achievements.length)]
      ];
      var ul = el("ul", { class: "plain facts-list" });
      items.forEach(function (i) { ul.appendChild(el("li", {}, [el("span", { class: "muted", text: i[0] + ": " }), el("strong", { text: i[1] })])); });
      summaryHost.appendChild(ul);
    }

    function renderForm() {
      formHost.textContent = "";
      var cw = Hub.currentWeek(), key = String(cw.week), up = S.state.updates[key];
      var form = Hub.form({
        fields: [
          { name: "mood", label: "How is this week going?", type: "select", required: true, options: MOODS, validate: function (v) { return v === "0" ? "Choose how this week is going." : ""; } },
          { name: "note", label: "A short note", type: "textarea", rows: 2, maxlength: 280, hint: "Up to 280 characters." }
        ],
        values: { mood: up ? String(up.mood) : "0", note: up ? up.note : "" },
        submitLabel: up ? "Update my update" : "Save my update",
        onSubmit: function (v) {
          S.state.updates[key] = { mood: parseInt(v.mood, 10), note: v.note, updated: S.today() };
          Hub.save(status, "Your progress update for week " + cw.week + " was saved.");
          renderForm(); renderCopy();
        }
      });
      if (up && up.updated) formHost.appendChild(el("p", { class: "muted", text: "Last saved " + Hub.fmtDate(up.updated) + ": " + (moodLabel(up.mood) || "no rating") + "." }));
      form.querySelector(".row").appendChild(copyBtn);
      formHost.appendChild(form);
    }

    var box = el("div");
    var copyBtn = el("button", { type: "button", class: "btn secondary", text: "Copy my update" });
    copyBtn.addEventListener("click", function () {
      var text = Hub.updateText();
      function fallback() {
        box.textContent = "";
        var ta = el("textarea", { readonly: "readonly", rows: "8", "aria-label": "Your progress update, ready to copy" });
        ta.value = text; box.appendChild(ta); ta.focus(); ta.select();
        status.say("Your browser would not copy automatically. The text is selected below: press Ctrl + C to copy it.", true);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { box.textContent = ""; status.say("Your progress update was copied. Paste it into a message to your manager or mentor.", false); }, fallback);
      else fallback();
    });

    function renderCopy() {
      copyHost.textContent = "";
      var det = el("details", {}, [el("summary", { text: "Preview the text that will be copied" })]);
      det.appendChild(el("pre", { class: "update-text", text: Hub.updateText() }));
      copyHost.appendChild(box);
      copyHost.appendChild(det);
    }

    function refresh() { renderSummary(); renderCopy(); }
    Hub.onChange("update", refresh);
    renderSummary(); renderForm(); renderCopy();
    return sec;
  };

  // ---------- calendar and upcoming events ----------
  // ---------- share a progress summary with the programme team (optional, nothing is sent automatically) ----------
  Hub.homePanels.share = function (status) {
    var sec = Hub.panel("Share with the programme team");
    sec.appendChild(el("p", { text: "Sharing is optional. Nothing is sent automatically: you download a small file, look at what is in it, and send it yourself (for example by email) to the programme team." }));
    var basics = el("div", { class: "share-basics" }, [
      el("p", { class: "share-label", text: "Always in the file" }),
      el("p", { class: "muted", text: "Your name and role, your programme dates and week, your progress percentages, and how many goals, tasks and overdue items you have." })
    ]);
    sec.appendChild(basics);
    var goalsId = "share-goals", updId = "share-update";
    var goalsBox = el("input", { type: "checkbox", id: goalsId }), updBox = el("input", { type: "checkbox", id: updId });
    sec.appendChild(el("fieldset", { class: "share-opts" }, [
      el("legend", { text: "Also include (off unless you tick it)" }),
      el("div", { class: "check" }, [goalsBox, el("label", { for: goalsId, text: "My goal titles and how far along each is" })]),
      el("div", { class: "check" }, [updBox, el("label", { for: updId, text: "My weekly progress update (how it is going, and my note)" })])
    ]));
    sec.appendChild(el("p", { class: "muted", text: "Never included, whatever you tick: 1:1 meeting notes, feedback, reflections, contacts, career interests, your email address and achievement details." }));
    var pre = el("pre", { class: "update-text", tabindex: "0", "aria-label": "Exact contents of the summary file" });
    var det = el("details", {}, [el("summary", { text: "Preview exactly what will be in the file" }), pre]);
    sec.appendChild(det);
    function opts() { return { goals: goalsBox.checked, update: updBox.checked }; }
    function fileText() { return JSON.stringify(Hub.buildSummary(opts()), null, 2); }
    function fileName() { return "graduate-hub-summary-" + (Hub.slug(S.state.profile.name) || "me") + "-" + S.today() + ".json"; }
    function refresh() { pre.textContent = fileText(); }
    goalsBox.addEventListener("change", refresh); updBox.addEventListener("change", refresh);
    det.addEventListener("toggle", refresh);
    refresh();
    Hub.onChange("share", refresh);
    var dl = el("button", { type: "button", class: "btn", text: "Download my progress summary" });
    dl.addEventListener("click", function () {
      Hub.download(fileName(), fileText(), "application/json");
      status.say("Your progress summary was downloaded. It stays on your computer until you send it.", false);
    });
    var mail = el("button", { type: "button", class: "btn secondary", text: "Email it to the programme team" });
    mail.addEventListener("click", function () {
      Hub.download(fileName(), fileText(), "application/json");
      window.location.href = Hub.summaryMailto(fileName());
      status.say("The file was downloaded and an email draft opened. Attach the downloaded file to the email before you send it (your email program cannot attach it for you).", false);
    });
    sec.appendChild(el("div", { class: "row" }, [dl, mail]));
    return sec;
  };

  Hub.homePanels.calendar = function (status) {
    var sec = Hub.panel("Calendar and upcoming events", "calendar");
    sec.id = "calendar";
    var viewHost = el("div", { class: "view-switch-row" }), addHost = el("div"), listHost = el("div");
    var today0 = S.today();
    var ui = { adding: false, editing: null, all: false, view: "list", y: parseInt(today0.slice(0, 4), 10), m: parseInt(today0.slice(5, 7), 10) - 1, sel: today0, prefill: "" };
    sec.appendChild(viewHost); sec.appendChild(addHost); sec.appendChild(listHost);
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function ymd(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }
    function longDay(date) { return S.parseDate(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); }

    function icsEvent(i) { return { uid: i.id, date: i.date, time: i.time, minutes: i.minutes, title: i.title, description: i.desc, location: i.where }; }

    function renderView() {
      viewHost.textContent = "";
      var group = el("div", { class: "view-switch", role: "group", "aria-label": "Calendar view" });
      [["list", "List"], ["month", "Month"]].forEach(function (v) {
        var b = el("button", { type: "button", class: "btn small secondary", "aria-pressed": String(ui.view === v[0]), text: v[1] });
        b.addEventListener("click", function () { ui.view = v[0]; renderView(); renderList(); });
        group.appendChild(b);
      });
      viewHost.appendChild(group);
    }

    function renderAdd() {
      addHost.textContent = "";
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn small", text: "Add an event" });
        b.addEventListener("click", function () { ui.adding = true; ui.editing = null; ui.prefill = ui.view === "month" ? ui.sel : ""; renderAdd(); var f = addHost.querySelector("input"); if (f) f.focus(); });
        addHost.appendChild(b);
        return;
      }
      var cur = ui.editing ? S.state.calendar.filter(function (x) { return x.id === ui.editing; })[0] : null;
      addHost.appendChild(Hub.form({
        fields: [
          { name: "title", label: "Event or reminder", required: true, maxlength: 200 },
          { name: "date", label: "Date", type: "date", required: true },
          { name: "time", label: "Time", type: "time", hint: "Leave empty for an all-day event." },
          { name: "where", label: "Place", maxlength: 200, hint: "Optional." },
          { name: "note", label: "Note", type: "textarea", rows: 2 }
        ],
        values: cur || { date: ui.prefill || S.today() }, submitLabel: cur ? "Save event" : "Add event",
        onCancel: function () { ui.adding = false; ui.editing = null; renderAdd(); },
        onSubmit: function (v) {
          if (cur) { cur.title = v.title; cur.date = v.date; cur.time = v.time; cur.where = v.where; cur.note = v.note; }
          else S.state.calendar.push({ id: S.id(), title: v.title, date: v.date, time: v.time, where: v.where, note: v.note });
          var msg = cur ? "Event updated." : "Event added.";
          ui.adding = false; ui.editing = null; Hub.save(status, msg); renderAdd(); renderList(); Hub.changed("calendar");
        }
      }));
    }

    // One row of the agenda: day label, title and tags, and the buttons.
    function itemRow(i) {
      var label = Hub.dayLabel(i.date), relative = /^(Today|Tomorrow|In )/.test(label);
      var when = el("div", { class: "when" }, [el("strong", { text: label }), el("span", { class: "muted", text: (relative ? Hub.fmtDate(i.date) + (i.time ? ", " + i.time : "") : (i.time || "All day")) })]);
      var title = el("div", { class: "title" });
      if (i.href) title.appendChild(el("a", { href: i.href, text: i.title })); else title.appendChild(document.createTextNode(i.title));
      var meta = el("div", { class: "item-meta" }, [Hub.badge(i.kind, i.mine ? "warn" : "info")]);
      if (i.where) meta.appendChild(el("span", { class: "muted", text: i.where }));
      var what = el("div", { class: "what" }, [title, meta]);
      if (i.mine && i.desc) what.appendChild(el("p", { class: "muted", text: i.desc }));
      var actions = el("div", { class: "actions" });
      if (i.ics) {
        var cal = el("button", { type: "button", class: "btn small secondary", text: "Add to calendar", "aria-label": "Add " + i.title + " to your calendar" });
        cal.addEventListener("click", function () {
          Hub.download(Hub.slug(i.title) + ".ics", Hub.buildIcs([icsEvent(i)]), "text/calendar");
          status.say("Calendar file downloaded for " + i.title + ". Open it to add it to your calendar.", false);
        });
        actions.appendChild(cal);
      }
      if (i.mine) {
        var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit event " + i.title });
        ed.addEventListener("click", function () { ui.adding = true; ui.editing = i.id; renderAdd(); var f = addHost.querySelector("input"); if (f) f.focus(); });
        actions.appendChild(ed);
        actions.appendChild(Hub.confirmButton({ label: "Delete", ariaLabel: "Delete event " + i.title, message: "Delete this event?", onConfirm: function () {
          S.state.calendar = S.state.calendar.filter(function (x) { return x.id !== i.id; });
          if (ui.editing === i.id) { ui.adding = false; ui.editing = null; renderAdd(); }
          Hub.save(status, "Event deleted."); renderList(); Hub.changed("calendar");
          var f = addHost.querySelector("button, input"); if (f) f.focus();
        } }));
      }
      return el("li", {}, [when, what, actions]);
    }

    function renderList() {
      listHost.textContent = "";
      if (ui.view === "month") { renderMonth(); return; }
      var all = Hub.agenda(), LIMIT = 5, shown = ui.all ? all.slice(0, 40) : all.slice(0, LIMIT);
      if (!shown.length) { listHost.appendChild(el("p", { text: "Nothing coming up yet. Add an event or reminder, and dates from your goals, training and learning will appear here too." })); return; }
      var ul = el("ul", { class: "agenda" });
      shown.forEach(function (i) { ul.appendChild(itemRow(i)); });
      listHost.appendChild(ul);
      var bar = el("div", { class: "panel-actions" });
      if (all.length > LIMIT) {
        var more = el("button", { type: "button", class: "btn small secondary", text: ui.all ? "Show fewer" : "Show all " + all.length + " upcoming" });
        more.addEventListener("click", function () { ui.all = !ui.all; renderList(); var again = listHost.querySelector(".panel-actions button"); if (again) again.focus(); });
        bar.appendChild(more);
      }
      var withIcs = all.filter(function (i) { return i.ics; });
      if (withIcs.length) {
        var allBtn = el("button", { type: "button", class: "btn small secondary", text: "Add all upcoming events to my calendar" });
        allBtn.addEventListener("click", function () {
          Hub.download("upcoming-events.ics", Hub.buildIcs(withIcs.map(icsEvent)), "text/calendar");
          status.say("Calendar file downloaded with " + Hub.plural(withIcs.length, "event", "events") + ".", false);
        });
        bar.appendChild(allBtn);
      }
      listHost.appendChild(bar);
    }

    // ----- month view: a grid of days (Monday first), with the selected day's items listed underneath -----
    function moveTo(date, focus) {
      ui.sel = date; ui.y = parseInt(date.slice(0, 4), 10); ui.m = parseInt(date.slice(5, 7), 10) - 1;
      renderList();
      if (focus) { var b = listHost.querySelector('.month-grid button[data-date="' + date + '"]'); if (b) b.focus(); }
    }
    function shiftMonth(delta) {
      var d = new Date(ui.y, ui.m + delta, 1), day = Math.min(parseInt(ui.sel.slice(8, 10), 10), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
      return ymd(d.getFullYear(), d.getMonth(), day);
    }
    function renderMonth() {
      var items = Hub.agenda(0, { all: true }), byDate = {};
      items.forEach(function (i) { (byDate[i.date] = byDate[i.date] || []).push(i); });
      var first = new Date(ui.y, ui.m, 1), lead = (first.getDay() + 6) % 7, days = new Date(ui.y, ui.m + 1, 0).getDate();
      if (ui.sel.slice(0, 7) !== ymd(ui.y, ui.m, 1).slice(0, 7)) ui.sel = ymd(ui.y, ui.m, 1);
      var capId = "cal-cap-" + Math.floor(Math.random() * 1e6);
      var bar = el("div", { class: "month-bar" });
      function nav(label, aria, fn) { var b = el("button", { type: "button", class: "btn small secondary", "aria-label": aria, text: label }); b.addEventListener("click", fn); return b; }
      bar.appendChild(nav("‹", "Previous month", function () { moveTo(shiftMonth(-1), false); }));
      bar.appendChild(el("strong", { class: "month-title", id: capId, "aria-live": "polite", text: MONTHS[ui.m] + " " + ui.y }));
      bar.appendChild(nav("›", "Next month", function () { moveTo(shiftMonth(1), false); }));
      bar.appendChild(nav("Today", "Go to today", function () { moveTo(S.today(), true); }));
      listHost.appendChild(bar);
      var table = el("table", { class: "month-grid", role: "grid", "aria-labelledby": capId });
      var hr = el("tr");
      DAYS.forEach(function (d) { hr.appendChild(el("th", { scope: "col", text: d })); });
      table.appendChild(el("thead", {}, [hr]));
      var tbody = el("tbody"), row = el("tr");
      for (var k = 0; k < lead; k++) row.appendChild(el("td", { class: "blank", "aria-hidden": "true" }));
      for (var d = 1; d <= days; d++) {
        var date = ymd(ui.y, ui.m, d), list = byDate[date] || [], isSel = date === ui.sel, isToday = date === S.today();
        var btn = el("button", { type: "button", class: "day" + (isSel ? " is-selected" : "") + (isToday ? " is-today" : ""), "data-date": date, tabindex: isSel ? "0" : "-1", "aria-pressed": String(isSel),
          "aria-label": longDay(date) + (isToday ? ", today" : "") + ", " + (list.length ? Hub.plural(list.length, "item", "items") : "nothing planned") });
        btn.appendChild(el("span", { class: "day-num", text: String(d) }));
        list.slice(0, 2).forEach(function (i) { btn.appendChild(el("span", { class: "cell-item", "aria-hidden": "true", text: i.title })); });
        if (list.length > 2) btn.appendChild(el("span", { class: "cell-more", "aria-hidden": "true", text: "+" + (list.length - 2) + " more" }));
        if (list.length) btn.appendChild(el("span", { class: "cell-count", "aria-hidden": "true", text: String(list.length) }));
        row.appendChild(el("td", { role: "gridcell", class: list.length ? "has-items" : "" }, [btn]));
        if (row.children.length === 7) { tbody.appendChild(row); row = el("tr"); }
      }
      if (row.children.length) { while (row.children.length < 7) row.appendChild(el("td", { class: "blank", "aria-hidden": "true" })); tbody.appendChild(row); }
      table.appendChild(tbody);
      table.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button.day"); if (b) moveTo(b.getAttribute("data-date"), true); });
      table.addEventListener("keydown", function (e) {
        var b = e.target.closest && e.target.closest("button.day"); if (!b) return;
        var cur = S.parseDate(b.getAttribute("data-date")), dow = (cur.getDay() + 6) % 7, n = null;
        if (e.key === "ArrowLeft") n = S.addDays(b.getAttribute("data-date"), -1);
        else if (e.key === "ArrowRight") n = S.addDays(b.getAttribute("data-date"), 1);
        else if (e.key === "ArrowUp") n = S.addDays(b.getAttribute("data-date"), -7);
        else if (e.key === "ArrowDown") n = S.addDays(b.getAttribute("data-date"), 7);
        else if (e.key === "Home") n = S.addDays(b.getAttribute("data-date"), -dow);
        else if (e.key === "End") n = S.addDays(b.getAttribute("data-date"), 6 - dow);
        else if (e.key === "PageUp") { ui.sel = b.getAttribute("data-date"); n = shiftMonth(-1); }
        else if (e.key === "PageDown") { ui.sel = b.getAttribute("data-date"); n = shiftMonth(1); }
        if (n) { e.preventDefault(); moveTo(n, true); }
      });
      listHost.appendChild(table);
      var dayItems = byDate[ui.sel] || [];
      var detail = el("section", { class: "month-day", "aria-label": longDay(ui.sel) });
      detail.appendChild(el("h3", { text: longDay(ui.sel) + (ui.sel === S.today() ? " (today)" : "") }));
      if (!dayItems.length) detail.appendChild(el("p", { class: "muted", text: "Nothing planned for this day." }));
      else { var ul = el("ul", { class: "agenda" }); dayItems.forEach(function (i) { ul.appendChild(itemRow(i)); }); detail.appendChild(ul); }
      var addDay = el("button", { type: "button", class: "btn small secondary", text: "Add an event on " + Hub.fmtDate(ui.sel) });
      addDay.addEventListener("click", function () { ui.adding = true; ui.editing = null; ui.prefill = ui.sel; renderAdd(); var f = addHost.querySelector("input"); if (f) f.focus(); });
      detail.appendChild(addDay);
      listHost.appendChild(detail);
    }
    renderView(); renderAdd(); renderList();
    return sec;
  };
})();
