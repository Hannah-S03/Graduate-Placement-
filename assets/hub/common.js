// Shared helpers for the hub sections: forms, status messages, progress maths and reminders.
(function () {
  "use strict";
  var el = window.SiteUtil.el;
  var S = window.HubStore;
  var counter = 0;
  function nextId(p) { counter++; return (p || "f-") + counter; }

  var Hub = { el: el, store: S };

  Hub.slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };

  // The 11 skills from the 12-week overview, used for goals, milestones, learning and achievements.
  Hub.skills = function () {
    var out = [];
    ((window.SITE_OVERVIEW || {}).groups || []).forEach(function (g) {
      (g.skills || []).forEach(function (s) { out.push({ id: Hub.slug(s.name), name: s.name, group: g.title }); });
    });
    return out;
  };
  Hub.skillName = function (id) {
    var f = Hub.skills().filter(function (s) { return s.id === id; })[0];
    return f ? f.name : id;
  };

  Hub.fmtDate = function (str) {
    if (!str) return "";
    return S.parseDate(str).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  Hub.plural = function (n, one, many) { return n + " " + (n === 1 ? one : many); };

  Hub.progress = function (pct, label) {
    pct = Math.max(0, Math.min(100, Math.round(pct)));
    return el("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": label || "Progress" }, [
      el("div", { class: "bar-fill", style: "width:" + pct + "%" })
    ]);
  };
  Hub.badge = function (text, kind) { return el("span", { class: "badge badge-" + (kind || "info"), text: text }); };

  // A polite status line (screen readers announce changes). Use status.say(message, isError).
  Hub.status = function () {
    var p = el("p", { class: "status", role: "status", "aria-live": "polite" });
    p.say = function (msg, isErr) { p.textContent = msg; p.className = "status " + (isErr ? "status-error" : "status-ok"); };
    return p;
  };
  // Saves and reports the result. Returns true if the browser accepted it.
  Hub.save = function (status, okMessage) {
    var ok = S.save();
    if (status) {
      if (ok) status.say(okMessage || "Saved.", false);
      else status.say("Your browser would not save this, so it will be lost when you leave the page.", true);
    }
    return ok;
  };

  // Warnings shown at the top of hub pages when saving is off or stored data had to be reset.
  Hub.notices = function (t) {
    if (!S.available) {
      t.appendChild(el("div", { class: "notice", role: "alert" }, [
        el("strong", { text: "Saving is turned off in this browser. " }),
        "You can look around, but nothing you enter will be kept. Try a normal (not private) window, or check your browser's site data settings."
      ]));
    }
    if (S.recovered) {
      t.appendChild(el("div", { class: "notice", role: "alert" }, [
        el("strong", { text: "We could not read your saved information. " }),
        "A copy of it was kept in this browser and you are starting fresh. Contact the programme team if you need help recovering it."
      ]));
    }
  };
  Hub.needStart = function () {
    return el("div", { class: "notice", role: "note" }, [
      "Add your placement start date on ", el("a", { href: "index.html", text: "My profile" }), " to see dates, reminders and your week number."
    ]);
  };
  Hub.focus = function (node) {
    if (!node) return;
    if (!node.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(node.tagName)) node.setAttribute("tabindex", "-1");
    node.focus();
  };

  // ----- form fields -----
  // def: { name, label, type: text|email|url|date|textarea|select|range|checks, required, hint, options, rows, maxlength, min, max, step, validate }
  Hub.field = function (def, value) {
    var id = nextId("f-"), hintId = id + "-hint", errId = id + "-err";
    var wrap = el("div", { class: "field" });
    var input, getter, setter, focusTarget;
    var type = def.type || "text";
    var labelText = def.label + (def.required || type === "range" || type === "checks" ? "" : " (optional)");

    if (type === "checks") {
      var fs = el("fieldset", { class: "checks", "aria-describedby": errId });
      fs.appendChild(el("legend", { text: labelText }));
      var boxes = [];
      (def.options || []).forEach(function (o) {
        var cid = nextId("c-");
        var cb = el("input", { type: "checkbox", id: cid, value: o.value });
        boxes.push(cb);
        fs.appendChild(el("div", { class: "check" }, [cb, el("label", { for: cid, text: o.label })]));
      });
      wrap.appendChild(fs);
      getter = function () { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }); };
      setter = function (v) { var a = Array.isArray(v) ? v : []; boxes.forEach(function (b) { b.checked = a.indexOf(b.value) !== -1; }); };
      focusTarget = function () { if (boxes[0]) boxes[0].focus(); };
      input = boxes[0];
    } else {
      wrap.appendChild(el("label", { for: id, text: labelText }));
      if (def.hint) wrap.appendChild(el("p", { class: "hint", id: hintId, text: def.hint }));
      if (type === "textarea") {
        input = el("textarea", { id: id, rows: String(def.rows || 3), maxlength: String(def.maxlength || 2000) });
      } else if (type === "select") {
        input = el("select", { id: id });
        (def.options || []).forEach(function (o) { input.appendChild(el("option", { value: o.value, text: o.label })); });
      } else if (type === "range") {
        input = el("input", { type: "range", id: id, min: String(def.min || 0), max: String(def.max || 100), step: String(def.step || 5) });
      } else {
        input = el("input", { type: type, id: id, maxlength: String(def.maxlength || 200), autocomplete: def.autocomplete || "off" });
        if (def.placeholder) input.setAttribute("placeholder", def.placeholder);
      }
      if (def.required) input.setAttribute("aria-required", "true");
      var out = null;
      if (type === "range") {
        out = el("output", { for: id, class: "range-out" });
        var syncOut = function () { out.textContent = input.value + "%"; };
        input.addEventListener("input", syncOut);
        var row = el("div", { class: "range-row" }, [input, out]);
        wrap.appendChild(row);
        setTimeout(syncOut, 0);
        input._sync = syncOut;
      } else wrap.appendChild(input);
      getter = function () { return type === "range" ? Number(input.value) : input.value.trim(); };
      setter = function (v) { input.value = v === undefined || v === null ? "" : String(v); if (input._sync) input._sync(); };
      focusTarget = function () { input.focus(); };
    }
    var err = el("p", { class: "field-error", id: errId, role: "alert" });
    wrap.appendChild(err);
    var describedBy = (def.hint ? hintId + " " : "") + errId;
    if (type !== "checks") input.setAttribute("aria-describedby", describedBy);

    if (value !== undefined) setter(value); else if (def.default !== undefined) setter(def.default);

    var f = {
      def: def, wrap: wrap, input: input, get: getter, set: setter, focus: focusTarget,
      setError: function (m) {
        err.textContent = m || "";
        if (type !== "checks" && input) { if (m) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
      },
      validate: function (v) {
        var empty = Array.isArray(v) ? v.length === 0 : (v === "" || v === null || v === undefined);
        if (def.required && empty) return def.label + " is required.";
        if (empty) return "";
        if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
        if (type === "url" && !S.safeUrl(v)) return "Enter a full web address starting with http:// or https://";
        if (type === "date" && !S.dateStr(v)) return "Enter a valid date.";
        if (def.validate) return def.validate(v) || "";
        return "";
      }
    };
    return f;
  };

  // opts: { fields, values, submitLabel, cancelLabel, onSubmit(values) -> {name: message}|undefined, onCancel }
  Hub.form = function (opts) {
    var form = el("form", { class: "hub-form", novalidate: "novalidate" });
    var fields = opts.fields.map(function (d) { return Hub.field(d, opts.values ? opts.values[d.name] : undefined); });
    fields.forEach(function (f) { form.appendChild(f.wrap); });
    var row = el("div", { class: "row" });
    row.appendChild(el("button", { type: "submit", class: "btn", text: opts.submitLabel || "Save" }));
    if (opts.onCancel) {
      var c = el("button", { type: "button", class: "btn secondary", text: opts.cancelLabel || "Cancel" });
      c.addEventListener("click", opts.onCancel);
      row.appendChild(c);
    }
    form.appendChild(row);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var values = {}, first = null;
      fields.forEach(function (f) {
        var v = f.get(); values[f.def.name] = v;
        var msg = f.validate(v); f.setError(msg);
        if (msg && !first) first = f;
      });
      if (first) { first.focus(); return; }
      var res = opts.onSubmit(values);
      if (res) {
        fields.forEach(function (f) { if (res[f.def.name]) { f.setError(res[f.def.name]); if (!first) first = f; } });
        if (first) first.focus();
      }
    });
    form.fields = fields;
    return form;
  };

  // A delete (or other risky) button that asks "Are you sure?" on the page. opts: { label, ariaLabel, message, confirmLabel, onConfirm }
  Hub.confirmButton = function (opts) {
    var holder = el("span", { class: "confirm-holder" });
    var btn = el("button", { type: "button", class: "btn small danger", text: opts.label, "aria-label": opts.ariaLabel || opts.label });
    function showBtn() { holder.textContent = ""; holder.appendChild(btn); }
    btn.addEventListener("click", function () {
      holder.textContent = "";
      var yes = el("button", { type: "button", class: "btn small danger", text: opts.confirmLabel || "Yes, delete" });
      var no = el("button", { type: "button", class: "btn small secondary", text: "Cancel" });
      yes.addEventListener("click", opts.onConfirm);
      no.addEventListener("click", function () { showBtn(); btn.focus(); });
      holder.appendChild(el("span", { class: "confirm-text", text: opts.message || "Are you sure?" }));
      holder.appendChild(yes); holder.appendChild(no);
      yes.focus();
    });
    showBtn();
    return holder;
  };

  Hub.download = function (name, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  Hub.link = function (url, text, cls) {
    return el("a", { href: url, target: "_blank", rel: "noopener noreferrer", class: cls || false, text: text });
  };

  Hub.goalStatus = function (g) { return g.progress >= 100 ? "done" : g.progress > 0 ? "inprogress" : "notstarted"; };
  Hub.goalStatusLabel = { notstarted: "Not started", inprogress: "In progress", done: "Done" };

  // ----- training, progress and reminders -----
  Hub.training = function () { return (window.SITE_LEARNING || {}).training || []; };
  Hub.trainingDue = function (t) {
    var sd = S.state.profile.startDate;
    return sd ? S.addDays(sd, t.dueDays) : "";
  };
  Hub.trainingStatus = function (t) { var r = S.state.learning.training[t.id]; return r ? r.status : "notstarted"; };
  Hub.dueBadge = function (due, done) {
    if (done) return { text: "Done", kind: "ok" };
    if (!due) return { text: "No date yet", kind: "info" };
    var d = S.daysBetween(S.today(), due);
    if (d < 0) return { text: "Overdue by " + Hub.plural(-d, "day", "days"), kind: "danger" };
    if (d === 0) return { text: "Due today", kind: "warn" };
    if (d <= 7) return { text: "Due in " + Hub.plural(d, "day", "days"), kind: "warn" };
    return { text: "Due " + Hub.fmtDate(due), kind: "info" };
  };

  // Overall progress: the average of the parts that have something in them (goals, milestones, required training).
  Hub.progressSummary = function () {
    var st = S.state, parts = [];
    var goalsPct = st.goals.length ? st.goals.reduce(function (a, g) { return a + g.progress; }, 0) / st.goals.length : null;
    var achieved = st.milestones.filter(function (m) { return m.status === "achieved"; }).length;
    var msPct = st.milestones.length ? (achieved / st.milestones.length) * 100 : null;
    var tr = Hub.training();
    var trDone = tr.filter(function (t) { return Hub.trainingStatus(t) === "complete"; }).length;
    var trPct = tr.length ? (trDone / tr.length) * 100 : null;
    parts.push({ key: "goals", label: "Goals", pct: goalsPct, detail: st.goals.length ? Hub.plural(st.goals.length, "goal", "goals") + ", average progress" : "Nothing added yet", href: "journey.html" });
    parts.push({ key: "milestones", label: "Milestones", pct: msPct, detail: st.milestones.length ? achieved + " of " + st.milestones.length + " achieved" : "Nothing added yet", href: "development.html" });
    parts.push({ key: "training", label: "Required training", pct: trPct, detail: tr.length ? trDone + " of " + tr.length + " complete" : "Nothing added yet", href: "learning.html" });
    var have = parts.filter(function (p) { return p.pct !== null; });
    var overall = have.length ? Math.round(have.reduce(function (a, p) { return a + p.pct; }, 0) / have.length) : null;
    return { parts: parts, overall: overall };
  };

  // Things that need attention, most urgent first.
  Hub.reminders = function () {
    var st = S.state, out = [], today = S.today();
    var pl = S.placement(st.profile.startDate);
    Hub.training().forEach(function (t) {
      if (Hub.trainingStatus(t) === "complete") return;
      var due = Hub.trainingDue(t); if (!due) return;
      var d = S.daysBetween(today, due);
      if (d < 0) out.push({ level: 0, kind: "danger", text: t.title + " training is overdue by " + Hub.plural(-d, "day", "days") + ".", href: "learning.html" });
      else if (d <= 7) out.push({ level: 1, kind: "warn", text: t.title + " training is due " + (d === 0 ? "today" : "in " + Hub.plural(d, "day", "days")) + ".", href: "learning.html" });
    });
    st.goals.forEach(function (g) {
      if (g.progress >= 100 || !g.target) return;
      var d = S.daysBetween(today, g.target);
      if (d < 0) out.push({ level: 0, kind: "danger", text: "Goal “" + g.title + "” was due " + Hub.fmtDate(g.target) + ".", href: "journey.html" });
      else if (d <= 14) out.push({ level: 2, kind: "warn", text: "Goal “" + g.title + "” is due " + (d === 0 ? "today" : "in " + Hub.plural(d, "day", "days")) + ".", href: "journey.html" });
    });
    st.milestones.forEach(function (m) {
      if (m.status === "achieved" || !m.date) return;
      var d = S.daysBetween(today, m.date);
      if (d < 0) out.push({ level: 0, kind: "danger", text: "Milestone “" + m.title + "” is past its date (" + Hub.fmtDate(m.date) + ").", href: "development.html" });
      else if (d <= 14) out.push({ level: 2, kind: "warn", text: "Milestone “" + m.title + "” is on " + Hub.fmtDate(m.date) + ".", href: "development.html" });
    });
    var cat = ((window.SITE_LEARNING || {}).catalogue || []);
    var planned = Object.keys(st.learning.saved).map(function (id) {
      var rec = st.learning.saved[id], item = cat.filter(function (c) { return c.id === id; })[0];
      return item ? { title: item.title, planned: rec.planned, status: rec.status } : null;
    }).filter(Boolean).concat(st.learning.custom.map(function (c) { return { title: c.title, planned: c.planned, status: c.status }; }));
    planned.forEach(function (p) {
      if (p.status === "completed" || !p.planned) return;
      var d = S.daysBetween(today, p.planned);
      if (d >= 0 && d <= 7) out.push({ level: 2, kind: "warn", text: "Planned learning \u201C" + p.title + "\u201D is " + (d === 0 ? "today" : "in " + Hub.plural(d, "day", "days")) + ".", href: "learning.html" });
    });
    if (pl.status === "during" && !st.reflections[String(pl.week)]) {
      out.push({ level: 3, kind: "info", text: "Write your reflection for week " + pl.week + ".", href: "reflection.html" });
    }
    out.sort(function (a, b) { return a.level - b.level; });
    return out;
  };

  // Library of company links (from src/data/links.js) plus the graduate's own links.
  Hub.allLinks = function () {
    var base = ((window.SITE_LINKS || {}).items || []).map(function (l) { return { id: l.id, name: l.name, category: l.category, description: l.description, url: S.safeUrl(l.url), custom: false }; });
    var mine = S.state.links.custom.map(function (l) { return { id: l.id, name: l.name, category: l.category || "My links", description: l.description, url: l.url, custom: true }; });
    return base.concat(mine);
  };
  Hub.panel = function (title, cls) {
    var sec = el("section", { class: "panel" + (cls ? " " + cls : "") });
    var h = el("h2", { text: title });
    sec.appendChild(h);
    sec.heading = h;
    return sec;
  };

  window.Hub = Hub;
})();
