// Learning: required training (with due-date reminders and calendar files), saved courses and your own items.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  var LRN = window.SITE_LEARNING || { training: [], catalogue: [], types: [] };
  var STATUS = [{ value: "saved", label: "Saved" }, { value: "inprogress", label: "In progress" }, { value: "completed", label: "Completed" }];
  var TSTATUS = [{ value: "notstarted", label: "Not started" }, { value: "inprogress", label: "In progress" }, { value: "complete", label: "Complete" }];

  R.learning = function (t) {
    var status = Hub.status();
    var trainHost = el("div"), savedHost = el("div"), browseHost = el("div"), customHost = el("div");
    var ui = { type: "all", skill: "all", adding: false };
    Hub.notices(t);
    [status, trainHost, savedHost, browseHost, customHost].forEach(function (n) { t.appendChild(n); });

    // ----- required training -----
    function trainingEvent(tr) {
      return { uid: tr.id, date: Hub.trainingDue(tr), title: "Required training due: " + tr.title, description: tr.description + " (Graduate Hub reminder)", alert: "-P3D" };
    }
    function renderTraining() {
      trainHost.textContent = "";
      var tr = LRN.training;
      var done = tr.filter(function (x) { return Hub.trainingStatus(x) === "complete"; }).length;
      trainHost.appendChild(el("h2", { text: "Required training" }));
      trainHost.appendChild(el("p", { text: done + " of " + tr.length + " complete. Due dates are worked out from your placement start date." }));
      trainHost.appendChild(Hub.progress(tr.length ? (done / tr.length) * 100 : 0, "Required training complete"));
      var hasStart = !!S.state.profile.startDate;
      if (!hasStart) trainHost.appendChild(Hub.needStart());
      var tcols = el("div", { class: "cols" });
      trainHost.appendChild(tcols);
      tr.forEach(function (x) {
        var st = Hub.trainingStatus(x), rec = S.state.learning.training[x.id] || {};
        var due = Hub.trainingDue(x), badge = Hub.dueBadge(due, st === "complete");
        var card = el("article", { class: "item", "data-id": x.id });
        card.appendChild(el("h3", { text: x.title }));
        var meta = el("div", { class: "item-meta" }, [Hub.badge(badge.text, badge.kind)]);
        if (st === "complete" && rec.completedOn) meta.appendChild(el("span", { class: "muted", text: "Completed " + Hub.fmtDate(rec.completedOn) }));
        else meta.appendChild(el("span", { class: "muted", text: "Due within " + Hub.plural(x.dueDays, "day", "days") + " of your start date" }));
        card.appendChild(meta);
        card.appendChild(el("p", { text: x.description }));
        var actions = el("div", { class: "actions" });
        var f = Hub.field({ name: "s", label: "Status", type: "select", required: true, options: TSTATUS }, st);
        f.input.setAttribute("aria-label", x.title + " status");
        f.input.addEventListener("change", function () {
          S.state.learning.training[x.id] = { status: f.input.value, completedOn: f.input.value === "complete" ? S.today() : "" };
          Hub.save(status, x.title + " marked " + TSTATUS.filter(function (o) { return o.value === f.input.value; })[0].label.toLowerCase() + ".");
          renderTraining();
          var again = trainHost.querySelector('[data-id="' + x.id + '"] select'); if (again) again.focus();
        });
        actions.appendChild(f.input);
        var cal = el("button", { type: "button", class: "btn small secondary", text: "Add to calendar", "aria-label": "Add " + x.title + " due date to your calendar" });
        if (!hasStart) { cal.disabled = true; cal.title = "Add your start date on My profile first"; }
        cal.addEventListener("click", function () {
          Hub.download("training-" + Hub.slug(x.title) + ".ics", Hub.buildIcs([trainingEvent(x)]), "text/calendar");
          status.say("Calendar file downloaded for " + x.title + ". Open it to add the reminder to your calendar.", false);
        });
        actions.appendChild(cal);
        card.appendChild(actions);
        tcols.appendChild(card);
      });
      var all = el("button", { type: "button", class: "btn secondary", text: "Add all outstanding training to calendar" });
      if (!hasStart) all.disabled = true;
      all.addEventListener("click", function () {
        var pending = tr.filter(function (x) { return Hub.trainingStatus(x) !== "complete"; });
        if (!pending.length) { status.say("All required training is complete, so there is nothing to add.", false); return; }
        Hub.download("required-training.ics", Hub.buildIcs(pending.map(trainingEvent)), "text/calendar");
        status.say("Calendar file downloaded with " + Hub.plural(pending.length, "reminder", "reminders") + ".", false);
      });
      trainHost.appendChild(el("div", { class: "actions" }, [all]));
    }

    // ----- saved learning -----
    function savedItems() {
      var out = [];
      Object.keys(S.state.learning.saved).forEach(function (id) {
        var item = LRN.catalogue.filter(function (c) { return c.id === id; })[0];
        if (item) out.push({ id: id, title: item.title, type: item.type, url: S.safeUrl(item.url), rec: S.state.learning.saved[id], custom: false, skill: item.skill });
      });
      S.state.learning.custom.forEach(function (c) { out.push({ id: c.id, title: c.title, type: c.type || "Other", url: c.url, rec: { status: c.status, planned: c.planned }, custom: true, notes: c.notes }); });
      return out;
    }
    function setRec(item, key, value) {
      if (item.custom) { var c = S.state.learning.custom.filter(function (x) { return x.id === item.id; })[0]; if (c) c[key] = value; }
      else S.state.learning.saved[item.id][key] = value;
    }
    function renderSaved() {
      savedHost.textContent = "";
      var items = savedItems();
      savedHost.appendChild(el("h2", { text: "My saved learning" }));
      if (!items.length) { savedHost.appendChild(el("p", { text: "Nothing saved yet. Save a course or development opportunity below, or add your own." })); return; }
      var counts = { saved: 0, inprogress: 0, completed: 0 };
      items.forEach(function (i) { counts[i.rec.status]++; });
      savedHost.appendChild(el("p", { text: counts.saved + " saved \u00B7 " + counts.inprogress + " in progress \u00B7 " + counts.completed + " completed" }));
      var scols = el("div", { class: "cols" });
      savedHost.appendChild(scols);
      items.forEach(function (i) {
        var card = el("article", { class: "item", "data-id": i.id });
        var h = el("h3"); if (i.url) h.appendChild(Hub.link(i.url, i.title)); else h.appendChild(document.createTextNode(i.title));
        card.appendChild(h);
        var meta = el("div", { class: "item-meta" }, [el("span", { class: "tag", text: i.type })]);
        if (i.skill) meta.appendChild(el("span", { class: "tag skill", text: Hub.skillName(i.skill) }));
        if (i.custom) meta.appendChild(el("span", { class: "muted", text: "Added by you" }));
        if (i.rec.planned && i.rec.status !== "completed") { var d = Hub.dueBadge(i.rec.planned, false); meta.appendChild(Hub.badge("Planned: " + Hub.fmtDate(i.rec.planned), d.kind === "info" ? "info" : d.kind)); }
        card.appendChild(meta);
        if (i.notes) card.appendChild(el("p", { text: i.notes }));
        var actions = el("div", { class: "actions" });
        var sf = Hub.field({ name: "s", label: "Status", type: "select", required: true, options: STATUS }, i.rec.status);
        sf.input.setAttribute("aria-label", i.title + " status");
        sf.input.addEventListener("change", function () { setRec(i, "status", sf.input.value); Hub.save(status, "Status updated."); renderSaved(); var a = savedHost.querySelector('[data-id="' + i.id + '"] select'); if (a) a.focus(); });
        var pf = Hub.field({ name: "p", label: "Planned date", type: "date" }, i.rec.planned);
        pf.input.setAttribute("aria-label", i.title + " planned date");
        pf.input.addEventListener("change", function () { var v = pf.input.value; if (v && !S.dateStr(v)) return; setRec(i, "planned", v); Hub.save(status, "Planned date saved."); renderSaved(); var a = savedHost.querySelector('[data-id="' + i.id + '"] input[type=date]'); if (a) a.focus(); });
        actions.appendChild(sf.input); actions.appendChild(pf.input);
        if (i.custom) {
          actions.appendChild(Hub.confirmButton({ label: "Delete", ariaLabel: "Delete " + i.title, message: "Delete this item?", onConfirm: function () {
            S.state.learning.custom = S.state.learning.custom.filter(function (x) { return x.id !== i.id; });
            Hub.save(status, "Item deleted."); renderAll(); Hub.focus(savedHost.querySelector("h2"));
          } }));
        } else {
          var rm = el("button", { type: "button", class: "btn small secondary", text: "Remove", "aria-label": "Remove " + i.title + " from saved" });
          rm.addEventListener("click", function () { delete S.state.learning.saved[i.id]; Hub.save(status, "Removed from your saved learning."); renderAll(); Hub.focus(savedHost.querySelector("h2")); });
          actions.appendChild(rm);
        }
        card.appendChild(actions);
        scols.appendChild(card);
      });
    }

    // ----- browse the catalogue -----
    function renderBrowse() {
      browseHost.textContent = "";
      browseHost.appendChild(el("h2", { text: "Courses and development opportunities" }));
      var ft = Hub.field({ name: "t", label: "Type", type: "select", required: true, options: [{ value: "all", label: "All types" }].concat((LRN.types || []).map(function (x) { return { value: x, label: x }; })) }, ui.type);
      var fs = Hub.field({ name: "k", label: "Skill", type: "select", required: true, options: [{ value: "all", label: "All skills" }].concat(Hub.skills().map(function (s) { return { value: s.id, label: s.name }; })) }, ui.skill);
      ft.input.addEventListener("change", function () { ui.type = ft.input.value; renderBrowse(); ft.input.focus(); });
      fs.input.addEventListener("change", function () { ui.skill = fs.input.value; renderBrowse(); fs.input.focus(); });
      browseHost.appendChild(el("div", { class: "filters" }, [ft.wrap, fs.wrap]));
      var shown = LRN.catalogue.filter(function (c) { return (ui.type === "all" || c.type === ui.type) && (ui.skill === "all" || c.skill === ui.skill); });
      if (!shown.length) { browseHost.appendChild(el("p", { text: "Nothing matches these filters." })); return; }
      var bcols = el("div", { class: "cols" });
      browseHost.appendChild(bcols);
      shown.forEach(function (c) {
        var saved = !!S.state.learning.saved[c.id], url = S.safeUrl(c.url);
        var card = el("article", { class: "item", "data-id": "cat-" + c.id });
        var h = el("h3"); if (url) h.appendChild(Hub.link(url, c.title)); else h.appendChild(document.createTextNode(c.title));
        card.appendChild(h);
        card.appendChild(el("div", { class: "item-meta" }, [el("span", { class: "tag", text: c.type }), el("span", { class: "tag skill", text: Hub.skillName(c.skill) }), el("span", { class: "muted", text: c.duration }), !url ? el("span", { class: "muted", text: "Link to be added" }) : null]));
        card.appendChild(el("p", { text: c.description }));
        var b = el("button", { type: "button", class: "btn small" + (saved ? "" : " secondary"), text: saved ? "Saved" : "Save", "aria-pressed": saved ? "true" : "false", "aria-label": (saved ? "Remove from saved: " : "Save: ") + c.title });
        b.addEventListener("click", function () {
          if (saved) delete S.state.learning.saved[c.id]; else S.state.learning.saved[c.id] = { status: "saved", planned: "" };
          Hub.save(status, saved ? "Removed from your saved learning." : "Saved to your learning.");
          renderSaved(); renderBrowse();
          var again = browseHost.querySelector('[data-id="cat-' + c.id + '"] button'); if (again) again.focus();
        });
        card.appendChild(el("div", { class: "actions" }, [b]));
        bcols.appendChild(card);
      });
    }

    // ----- add your own -----
    function renderCustom() {
      customHost.textContent = "";
      customHost.appendChild(el("h2", { text: "Add your own" }));
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add a course or opportunity" });
        b.addEventListener("click", function () { ui.adding = true; renderCustom(); });
        customHost.appendChild(b);
        return;
      }
      var types = (LRN.types || []).concat(["Other"]);
      var panel = Hub.panel("Add a course or opportunity");
      panel.appendChild(Hub.form({
        fields: [
          { name: "title", label: "Title", required: true, maxlength: 200 },
          { name: "type", label: "Type", type: "select", required: true, options: types.map(function (x) { return { value: x, label: x }; }) },
          { name: "url", label: "Web address", type: "url", hint: "Starts with http:// or https://", maxlength: 500 },
          { name: "planned", label: "Planned date", type: "date" },
          { name: "notes", label: "Notes", type: "textarea" }
        ],
        values: { type: "Course" }, submitLabel: "Add to my learning",
        onCancel: function () { ui.adding = false; renderCustom(); },
        onSubmit: function (v) {
          var c = { id: S.id(), title: v.title, type: v.type, url: S.safeUrl(v.url), planned: v.planned, notes: v.notes, status: "saved" };
          S.state.learning.custom.push(c); ui.adding = false;
          Hub.save(status, "Added to your learning."); renderAll();
          var h = savedHost.querySelector('[data-id="' + c.id + '"] h3'); if (h) Hub.focus(h);
        }
      }));
      customHost.appendChild(panel);
      Hub.focus(panel.heading);
    }

    function renderAll() { renderTraining(); renderSaved(); renderBrowse(); renderCustom(); }
    renderAll();
  };
})();
