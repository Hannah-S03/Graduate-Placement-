// My profile (home page): setup, profile card, overall progress tracker, reminders, pinned links, data backup.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;

  R.profile = function (t) {
    var status = Hub.status();
    var hello = el("p", { class: "hello" });
    var top = el("div", { class: "stat-row" });
    var body = el("div");
    var editing = false;
    var cfg = window.SITE_CONFIG || {};
    Hub.notices(t);
    t.appendChild(hello);
    t.appendChild(top);
    t.appendChild(status);
    t.appendChild(body);

    function profileForm(first) {
      var p = S.state.profile;
      var form = Hub.form({
        fields: [
          { name: "name", label: "Your name", required: true, autocomplete: "name", maxlength: 120 },
          { name: "role", label: "Your role or area", hint: "For example: Graduate, central team.", maxlength: 200 },
          { name: "startDate", label: "Placement start date", type: "date", required: true, hint: "Used to work out your week number and training due dates." },
          { name: "endDate", label: "Placement end date", type: "date", hint: "Leave empty to use 12 weeks from your start date." },
          { name: "manager", label: "Your manager", maxlength: 120 },
          { name: "mentor", label: "Your mentor", maxlength: 120 },
          { name: "interests", label: "Career interests", type: "textarea", hint: "What would you like to learn or become? Only you can see this." }
        ],
        values: first ? Object.assign({}, p, { startDate: p.startDate || cfg.programmeStart || "", endDate: p.endDate || cfg.programmeEnd || "" }) : p,
        submitLabel: first ? "Set up my hub" : "Save profile",
        onCancel: first ? null : function () { editing = false; render(); },
        onSubmit: function (v) {
          if (v.endDate && v.endDate < v.startDate) return { endDate: "The end date must be after the start date." };
          Object.keys(v).forEach(function (k) { S.state.profile[k] = v[k]; });
          editing = false;
          Hub.save(status, first ? "Your hub is ready." : "Profile saved.");
          render();
        }
      });
      return form;
    }

    function setup() {
      var card = Hub.panel("Set up your hub", "setup");
      card.appendChild(el("p", { text: "Tell us a little about you. Your answers are saved only in this browser, and nobody else can see them." }));
      card.appendChild(profileForm(true));
      body.appendChild(card);
    }

    // The progress bar shown first on the page. Uses the graduate's own dates, or the programme dates from config.
    // One small block per programme week: done, this week, still to come.
    function weekStrip(pl) {
      var n = pl.totalWeeks, now = pl.status === "during" ? pl.week : pl.status === "after" ? n + 1 : 0;
      var done = Math.min(n, Math.max(0, now - (pl.status === "during" ? 1 : 0)));
      var ul = el("ul", { class: "weekstrip" + (n > 20 ? " dense" : ""), role: "img", "aria-label": pl.status === "during" ? "Week " + pl.week + " of " + n + ": " + done + " finished, this week in progress, " + (n - pl.week) + " still to come" : pl.status === "after" ? "All " + n + " weeks finished" : "Programme not started: " + n + " weeks to come" });
      for (var i = 1; i <= n; i++) ul.appendChild(el("li", { class: i < now ? "done" : i === now ? "now" : "", text: String(i) }));
      return ul;
    }

    function programmePanel() {
      var pl = S.programme();
      var sec = Hub.panel("Programme progress", "programme");
      if (pl.status === "none") { sec.appendChild(Hub.needStart()); return sec; }
      var dates = Hub.fmtDate(pl.startDate) + " to " + Hub.fmtDate(pl.endDate);
      if (pl.status === "before") {
        sec.appendChild(el("p", { class: "big", text: "Starts in " + Hub.plural(pl.startsIn, "day", "days") }));
      } else if (pl.status === "during") {
        sec.appendChild(el("p", { class: "big", text: "Week " + pl.week + " of " + pl.totalWeeks + " \u00B7 " + pl.pct + "% through" }));
      } else {
        sec.appendChild(el("p", { class: "big", text: "Programme complete \u00B7 100%" }));
      }
      sec.appendChild(Hub.progress(pl.pct, "Programme progress"));
      sec.appendChild(weekStrip(pl));
      sec.appendChild(el("p", { class: "muted", text: dates + (pl.status === "after" ? ". Well done!" : "") + (pl.own ? "" : " (programme dates; you can enter your own dates in your profile)") }));
      return sec;
    }

    function progressPanel() {
      var sum = Hub.progressSummary();
      var sec = Hub.panel("Your progress tracker");
      if (sum.overall === null) {
        sec.appendChild(el("p", { text: "Add a goal or a milestone, or start your required training, and your overall progress will appear here." }));
      } else {
        sec.appendChild(el("p", { class: "big", text: sum.overall + "% overall" }));
        sec.appendChild(Hub.progress(sum.overall, "Overall progress"));
      }
      if (!S.state.goals.length && !S.state.milestones.length) {
        sec.appendChild(el("p", {}, ["Add goals on ", el("a", { href: "journey.html", text: "My journey" }), " and milestones on ", el("a", { href: "development.html", text: "My development" }), " to bring them into your progress."]));
      }
      var list = el("ul", { class: "parts" });
      sum.parts.forEach(function (p) {
        var li = el("li");
        li.appendChild(el("div", { class: "part-head" }, [el("a", { href: p.href, text: p.label }), el("span", { class: "muted", text: p.pct === null ? p.detail : Math.round(p.pct) + "% · " + p.detail })]));
        li.appendChild(Hub.progress(p.pct === null ? 0 : p.pct, p.label + " progress"));
        list.appendChild(li);
      });
      sec.appendChild(list);
      sec.appendChild(el("details", {}, [
        el("summary", { text: "How is this worked out?" }),
        el("p", { text: "Overall progress is the average of three parts: your goals (the share of tasks completed, averaged across all your goals), your milestones (the share you have achieved) and your required training (the share you have completed). A part with nothing in it yet is left out. Your week number is shown separately." })
      ]));
      return sec;
    }

    function remindersPanel() {
      var sec = Hub.panel("Reminders");
      sec.id = "reminders";
      var host = el("div"), all = false;
      sec.appendChild(host);
      function refresh() {
        host.textContent = "";
        var items = Hub.reminders();
        if (!items.length) { host.appendChild(el("p", { text: "Nothing needs your attention right now." })); return; }
        var rank = { danger: 0, warn: 1 }, names = { danger: "Overdue", warn: "Coming up", info: "To do" };
        items = items.map(function (r, i) { return { r: r, i: i }; }).sort(function (a, b) { return ((rank[a.r.kind] === undefined ? 2 : rank[a.r.kind]) - (rank[b.r.kind] === undefined ? 2 : rank[b.r.kind])) || a.i - b.i; }).map(function (x) { return x.r; });
        var counts = {};
        items.forEach(function (r) { counts[r.kind] = (counts[r.kind] || 0) + 1; });
        var ul = null, last = null;
        (all ? items : items.slice(0, 5)).forEach(function (r) {
          if (r.kind !== last) {
            last = r.kind;
            host.appendChild(el("h3", { class: "rem-group rem-" + r.kind, text: (names[r.kind] || "To do") + " (" + counts[r.kind] + ")" }));
            ul = el("ul", { class: "plain" }); host.appendChild(ul);
          }
          ul.appendChild(el("li", {}, [el("a", { href: r.href, text: r.text })]));
        });
        if (items.length > 5) {
          var b = el("button", { type: "button", class: "btn small secondary", text: all ? "Show fewer" : "Show " + (items.length - 5) + " more" });
          b.addEventListener("click", function () { all = !all; refresh(); var again = host.querySelector("button"); if (again) again.focus(); });
          host.appendChild(el("div", { class: "panel-actions" }, [b]));
        }
      }
      Hub.onChange("reminders", refresh);
      refresh();
      return sec;
    }

    function pinnedPanel() {
      var sec = Hub.panel("Pinned links");
      var pinned = S.state.links.pinned;
      var all = Hub.allLinks().filter(function (l) { return pinned.indexOf(l.id) !== -1; });
      if (!all.length) {
        sec.appendChild(el("p", {}, ["Nothing pinned yet. ", el("a", { href: "links.html", text: "Pin company systems and resources" }), "."]));
        return sec;
      }
      var ul = el("ul", { class: "chips" });
      all.slice(0, 10).forEach(function (l) {
        ul.appendChild(el("li", {}, [l.url ? Hub.link(l.url, l.name, "chip") : el("span", { class: "chip", text: l.name + " (link to be added)" })]));
      });
      sec.appendChild(ul);
      sec.appendChild(el("p", {}, [el("a", { href: "links.html", text: "All quick links" })]));
      return sec;
    }

    function taskLine(g) { var c = Hub.taskCounts(g); return c.total ? c.completed + " of " + Hub.plural(c.total, "task", "tasks") + " completed" : "No tasks yet"; }
    function goalsPanel() {
      var sec = Hub.panel("Next goals");
      var open = S.state.goals.filter(function (g) { return Hub.goalStatus(g) !== "done"; });
      open.sort(function (a, b) { return (a.target || "9999") < (b.target || "9999") ? -1 : 1; });
      if (!open.length) {
        sec.appendChild(el("p", {}, [S.state.goals.length ? "All your goals are done. " : "You have not added any goals yet. ", el("a", { href: "journey.html", text: "Go to My journey" }), "."]));
        return sec;
      }
      var ul = el("ul", { class: "plain" });
      open.slice(0, 3).forEach(function (g) {
        ul.appendChild(el("li", {}, [el("strong", { text: g.title }), el("span", { class: "muted", text: g.target ? " · due " + Hub.fmtDate(g.target) : "" }), el("div", { class: "muted", text: taskLine(g) })]));
      });
      sec.appendChild(ul);
      return sec;
    }

    function achievementsPanel() {
      var sec = Hub.panel("Latest achievements");
      var list = S.state.achievements.slice().sort(function (a, b) { return (a.date || "") < (b.date || "") ? 1 : -1; }).slice(0, 2);
      if (!list.length) { sec.appendChild(el("p", {}, ["Nothing recorded yet. ", el("a", { href: "achievements.html", text: "Add a project or accomplishment" }), "."])); return sec; }
      var ul = el("ul", { class: "plain" });
      list.forEach(function (a) { ul.appendChild(el("li", {}, [el("strong", { text: a.title }), el("span", { class: "muted", text: a.date ? " · " + Hub.fmtDate(a.date) : "" })])); });
      sec.appendChild(ul);
      return sec;
    }

    function dataPanel() {
      var sec = Hub.panel("My data");
      var local = Hub.status();
      sec.appendChild(el("p", { text: "Everything you enter is saved only in this browser on this device. Download a copy now and then so you can restore it if browser data is cleared, or load it on another device." }));
      sec.appendChild(local);
      var row = el("div", { class: "row" });
      var dl = el("button", { type: "button", class: "btn", text: "Download my data" });
      dl.addEventListener("click", function () {
        Hub.download("graduate-hub-" + S.today() + ".json", S.exportJSON(), "application/json");
        local.say("Your data was downloaded as a file.", false);
      });
      row.appendChild(dl);
      sec.appendChild(row);

      var restoreBox = el("div", { class: "restore" });
      var fid = "restore-file";
      restoreBox.appendChild(el("label", { for: fid, text: "Restore from a file you downloaded" }));
      var fileInput = el("input", { type: "file", id: fid, accept: ".json,application/json" });
      var confirmBox = el("div", { class: "confirm-row" });
      fileInput.addEventListener("change", function () {
        confirmBox.textContent = "";
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var text = String(reader.result || "");
          var yes = el("button", { type: "button", class: "btn small danger", text: "Yes, replace my data" });
          var no = el("button", { type: "button", class: "btn small secondary", text: "Cancel" });
          yes.addEventListener("click", function () {
            var res = S.importJSON(text);
            if (res.ok) { status.say("Your data was restored from the file.", false); editing = false; render(); }
            else { confirmBox.textContent = ""; local.say(res.error, true); fileInput.value = ""; }
          });
          no.addEventListener("click", function () { confirmBox.textContent = ""; fileInput.value = ""; fileInput.focus(); });
          confirmBox.appendChild(el("span", { class: "confirm-text", text: "This replaces everything currently in the hub. Continue?" }));
          confirmBox.appendChild(yes); confirmBox.appendChild(no);
          yes.focus();
        };
        reader.onerror = function () { local.say("That file could not be read.", true); };
        reader.readAsText(file);
      });
      restoreBox.appendChild(fileInput);
      restoreBox.appendChild(confirmBox);
      sec.appendChild(restoreBox);

      sec.appendChild(el("div", { class: "row" }, [Hub.confirmButton({
        label: "Reset everything", message: "This deletes all your hub information from this browser. Continue?", confirmLabel: "Yes, delete everything",
        onConfirm: function () { S.reset(); editing = false; status.say("Everything was deleted from this browser.", false); render(); }
      })]));
      return sec;
    }

    // Three summary tiles beside the programme card: tasks completed, the next thing coming up, and overdue items.
    function statTiles() {
      function tile(cls, href, label) {
        var a = el("a", { class: "tile " + cls, href: href });
        a.appendChild(el("small", { text: label }));
        var value = el("b"), sub = el("span");
        a.appendChild(value); a.appendChild(sub);
        a.set = function (v, sb) { value.textContent = v; sub.textContent = sb; };
        return a;
      }
      var tasks = tile("tile-light", "journey.html", "Tasks completed");
      var next = tile("tile-tint", "index.html#calendar", "Next up");
      var attention = tile("tile-navy", "index.html#reminders", "Needs attention");
      function refresh() {
        var total = 0, done = 0;
        S.state.goals.forEach(function (g) { var c = Hub.taskCounts(g); total += c.total; done += c.completed; });
        if (total) tasks.set(done + " / " + total, "across " + Hub.plural(S.state.goals.length, "goal", "goals")); else tasks.set("0", S.state.goals.length ? "No tasks yet" : "Add goals on My journey");
        var n = Hub.agenda(1)[0];
        if (n) next.set(n.title, Hub.dayLabel(n.date) + (n.time ? " \u00B7 " + n.time : "")); else next.set("Nothing yet", "Add an event to your calendar");
        var overdue = Hub.reminders().filter(function (r) { return r.kind === "danger"; }).length;
        attention.set(String(overdue), overdue ? (overdue === 1 ? "overdue item" : "overdue items") : "Nothing overdue");
        next.classList.toggle("tile-empty", !n);
      }
      refresh();
      Hub.onChange("stats", refresh);
      return [tasks, next, attention];
    }

    function greetingText() {
      var h = new Date().getHours(), part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
      var first = S.state.profile.name.trim().split(/\s+/)[0];
      return part + ", " + first + " \u00B7 " + S.parseDate(S.today()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    }

    function dashboard() {
      Hub.clearListeners();
      hello.textContent = greetingText(); hello.hidden = false;
      statTiles().forEach(function (n) { top.appendChild(n); });
      var p = S.state.profile;
      var card = Hub.panel(p.name, "profile-card");
      card.heading.setAttribute("tabindex", "-1");
      card.insertBefore(el("div", { class: "avatar", "aria-hidden": "true", text: window.SiteUtil.initials(p.name) }), card.firstChild);
      var meta = [];
      if (p.role) meta.push(p.role);
      if (p.manager) meta.push("Manager: " + p.manager);
      if (p.mentor) meta.push("Mentor: " + p.mentor);
      if (meta.length) card.appendChild(el("p", { class: "muted", text: meta.join(" · ") }));
      if (p.interests) card.appendChild(el("p", {}, [el("strong", { text: "Career interests: " }), p.interests]));
      var edit = el("button", { type: "button", class: "btn secondary small", text: "Edit profile" });
      edit.addEventListener("click", function () { editing = true; render(); });
      card.appendChild(edit);
      body.appendChild(card);
      var grid = el("div", { class: "home-grid" });
      function add(sec, start, cls, opts) { opts = opts || {}; opts.start = start; Hub.collapsible(sec, opts); if (cls) sec.classList.add(cls); grid.appendChild(sec); }
      add(Hub.homePanels.weekly(status), "open");
      add(Hub.homePanels.update(status), "closed", "", { summary: Hub.homePanels.updateLine, openLabel: "Write my update" });
      add(remindersPanel(), "open", "span-2");
      add(Hub.homePanels.calendar(status), "open", "span-3");
      add(progressPanel(), "closed-on-phone", "tile-navy");
      add(pinnedPanel(), "closed-on-phone");
      add(goalsPanel(), "closed-on-phone");
      add(achievementsPanel(), "closed-on-phone", "span-2");
      body.appendChild(grid);
      var data = dataPanel();
      Hub.collapsible(data, { start: "closed" });
      body.appendChild(data);
    }

    function render() {
      top.textContent = ""; hello.hidden = true;
      top.appendChild(programmePanel());
      body.textContent = "";
      if (!S.state.profile.name) setup();
      else if (editing) {
        var card = Hub.panel("Edit your profile");
        card.appendChild(profileForm(false));
        body.appendChild(card);
        Hub.focus(card.heading);
      } else dashboard();
    }
    render();
  };
})();
