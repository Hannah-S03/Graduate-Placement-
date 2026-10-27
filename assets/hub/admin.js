// Programme team view (admin.html): the head of the graduate programme loads the progress summary files that graduates
// chose to send, sees the cohort at a glance, and adds their own notes. Everything is kept in THIS browser only
// (gradHub.admin.v1); nothing is sent anywhere, and the notes are never written back into any graduate's file.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  var KEY = "gradHub.admin.v1", BACKUP_KEY = "gradHub.admin.v1.backup", MAX_FILE = 500 * 1024, MAX_FILES = 100, MAX_GRADS = 500, STALE_DAYS = 14;

  var storage = null;
  try { storage = window.localStorage; storage.setItem("__admin_test", "1"); storage.removeItem("__admin_test"); } catch (e) { storage = null; }

  // ---------- cleaning ----------
  function isObj(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }
  function str(x, max) { return typeof x === "string" ? x.slice(0, max || 2000) : ""; }
  function num(x, lo, hi, dflt) { x = Number(x); return isFinite(x) ? Math.min(hi, Math.max(lo, Math.round(x))) : dflt; }
  function pctOrNull(x) { return x === null || x === undefined ? null : num(x, 0, 100, null); }
  function oneOf(x, list, dflt) { return list.indexOf(x) !== -1 ? x : dflt; }
  function uid() { return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  // Checks one summary object from a file. Only known fields are copied, each cleaned; anything else is dropped.
  function cleanSummary(raw) {
    if (!isObj(raw)) return { error: "This is not a progress summary file." };
    if (raw.kind !== Hub.SUMMARY_KIND) return { error: "This is not a Graduate Hub progress summary." };
    if (raw.version !== 1) return { error: "This summary was made by a different version of the hub, so it cannot be read." };
    var generated = S.dateStr(raw.generated);
    if (!generated) return { error: "The summary has no valid date." };
    var g = isObj(raw.graduate) ? raw.graduate : {}, name = str(g.name, 120).trim();
    if (!name) return { error: "The summary has no graduate name." };
    var pr = isObj(raw.programme) ? raw.programme : {}, pg = isObj(raw.progress) ? raw.progress : {}, ct = isObj(raw.counts) ? raw.counts : {}, sh = isObj(raw.shared) ? raw.shared : {};
    var out = {
      generated: generated,
      graduate: { name: name, role: str(g.role, 200).trim() },
      programme: { start: S.dateStr(pr.start), end: S.dateStr(pr.end), status: oneOf(pr.status, ["none", "before", "during", "after"], "none"), week: num(pr.week, 0, 60, 0), totalWeeks: num(pr.totalWeeks, 1, 60, 12), pct: num(pr.pct, 0, 100, 0) },
      progress: { overall: pctOrNull(pg.overall), goals: pctOrNull(pg.goals), milestones: pctOrNull(pg.milestones), training: pctOrNull(pg.training) },
      counts: { goals: num(ct.goals, 0, 9999, 0), goalsDone: num(ct.goalsDone, 0, 9999, 0), tasks: num(ct.tasks, 0, 9999, 0), tasksDone: num(ct.tasksDone, 0, 9999, 0), overdue: num(ct.overdue, 0, 9999, 0) },
      shared: { goals: sh.goals === true, update: sh.update === true, updates: sh.updates === true, weeklyGoals: sh.weeklyGoals === true, reflections: sh.reflections === true },
      goals: [], update: null, updates: [], weeklyGoals: [], reflections: []
    };
    if (out.shared.goals && Array.isArray(raw.goals)) {
      out.goals = raw.goals.slice(0, 50).map(function (x) {
        return isObj(x) ? { title: str(x.title, 200).trim(), status: oneOf(x.status, ["notstarted", "inprogress", "done"], "notstarted"), target: S.dateStr(x.target), tasksDone: num(x.tasksDone, 0, 999, 0), tasksTotal: num(x.tasksTotal, 0, 999, 0) } : null;
      }).filter(function (x) { return x && x.title; });
    }
    if (out.shared.update && isObj(raw.update)) {
      var u = raw.update, mood = num(u.mood, 0, 5, 0), note = str(u.note, 280).trim();
      if (mood || note) out.update = { week: num(u.week, 0, 60, 0), mood: mood, note: note, updated: S.dateStr(u.updated) };
    }
    // weekly reports: only kept when the graduate ticked that box; one entry per week (1 to 52), sorted by week
    function byWeek(list, build) {
      var seen = {}, out2 = [];
      (Array.isArray(list) ? list.slice(0, 120) : []).forEach(function (x) {
        if (!isObj(x)) return;
        var w = num(x.week, 0, 99, 0); if (w < 1 || w > 52) return;
        var item = build(x, w); if (item) seen["w" + w] = item;
      });
      Object.keys(seen).forEach(function (k) { out2.push(seen[k]); });
      return out2.sort(function (a, b) { return a.week - b.week; });
    }
    if (out.shared.updates) out.updates = byWeek(raw.updates, function (x, w) {
      var mood = num(x.mood, 0, 5, 0), note = str(x.note, 280).trim();
      return mood || note ? { week: w, mood: mood, note: note, updated: S.dateStr(x.updated) } : null;
    });
    if (out.shared.weeklyGoals) out.weeklyGoals = byWeek(raw.weeklyGoals, function (x, w) {
      var goals = (Array.isArray(x.goals) ? x.goals.slice(0, 50) : []).map(function (g) { return isObj(g) ? { text: str(g.text, 200).trim(), done: g.done === true } : null; }).filter(function (g) { return g && g.text; });
      return goals.length ? { week: w, goals: goals } : null;
    });
    if (out.shared.reflections) out.reflections = byWeek(raw.reflections, function (x, w) {
      var r = { week: w, learnt: str(x.learnt, 2000).trim(), wentWell: str(x.wentWell, 2000).trim(), hard: str(x.hard, 2000).trim(), focusNext: str(x.focusNext, 2000).trim(), updated: S.dateStr(x.updated) };
      return r.learnt || r.wentWell || r.hard || r.focusNext ? r : null;
    });
    return { value: out };
  }

  // ---------- storage: { version: 1, grads: { "g:<key>": { latest, history: [...], notes: [...] } } } ----------
  // Keys are prefixed so a name like "__proto__" can never touch an object's prototype.
  function gradKey(s) { return "g:" + s.graduate.name.toLowerCase().replace(/\s+/g, " ").trim() + "|" + s.programme.start; }
  function histEntry(s) { return { generated: s.generated, week: s.programme.week, pct: s.programme.pct, overall: s.progress.overall, overdue: s.counts.overdue }; }
  function emptyState() { return { version: 1, grads: {} }; }
  function sanitizeState(raw) {
    var out = emptyState();
    if (!isObj(raw) || !isObj(raw.grads)) return out;
    Object.keys(raw.grads).slice(0, MAX_GRADS).forEach(function (k) {
      var r = raw.grads[k]; if (!isObj(r)) return;
      var c = cleanSummary(Object.assign({}, r.latest, { kind: Hub.SUMMARY_KIND, version: 1 }));
      if (!c.value) return;
      var hist = Array.isArray(r.history) ? r.history.slice(0, 500).map(function (h) {
        return isObj(h) && S.dateStr(h.generated) ? { generated: h.generated, week: num(h.week, 0, 60, 0), pct: num(h.pct, 0, 100, 0), overall: pctOrNull(h.overall), overdue: num(h.overdue, 0, 9999, 0) } : null;
      }).filter(Boolean) : [];
      var notes = Array.isArray(r.notes) ? r.notes.slice(0, 500).map(function (n) {
        return isObj(n) && str(n.text, 4000).trim() ? { id: str(n.id, 60) || uid(), date: S.dateStr(n.date) || c.value.generated, text: str(n.text, 4000).trim() } : null;
      }).filter(Boolean) : [];
      out.grads[gradKey(c.value)] = { latest: c.value, history: hist, notes: notes, setGoals: Hub.cleanProgGoals(r.setGoals) };
    });
    return out;
  }

  var state = emptyState(), recovered = false;
  (function load() {
    if (!storage) return;
    var raw = null;
    try { raw = storage.getItem(KEY); } catch (e) { return; }
    if (raw === null) return;
    try { var parsed = JSON.parse(raw); if (!isObj(parsed)) throw new Error("bad"); state = sanitizeState(parsed); }
    catch (e) { try { storage.setItem(BACKUP_KEY, raw); } catch (e2) { /* nothing more to do */ } state = emptyState(); recovered = true; }
  })();
  function save() { if (!storage) return false; try { storage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }

  // Adds one cleaned summary. Newer replaces older (the older numbers stay in the history).
  function ingest(s) {
    var k = gradKey(s), rec = state.grads[k], result;
    if (!rec) {
      if (Object.keys(state.grads).length >= MAX_GRADS) return { error: "Too many graduates are loaded (the limit is " + MAX_GRADS + ")." };
      state.grads[k] = { latest: s, history: [histEntry(s)], notes: [], setGoals: [] };
      return { action: "added" };
    }
    var has = rec.history.filter(function (h) { return h.generated === s.generated; })[0];
    if (s.generated >= rec.latest.generated) { rec.latest = s; result = "updated"; }
    else result = "older";
    if (has) { Object.assign(has, histEntry(s)); } else rec.history.push(histEntry(s));
    rec.history.sort(function (a, b) { return a.generated < b.generated ? -1 : a.generated > b.generated ? 1 : 0; });
    return { action: result };
  }

  // ---------- display helpers ----------
  function weekText(p) { return p.status === "during" ? "Week " + p.week + " of " + p.totalWeeks : p.status === "after" ? "Complete" : p.status === "before" ? "Not started" : "No dates"; }
  function pctText(x) { return x === null ? "None yet" : x + "%"; }
  function daysOld(s) { return S.daysBetween(s.generated, S.today()); }
  function staleWeeks(s) { var d = daysOld(s); return d >= STALE_DAYS ? Math.floor(d / 7) : 0; }
  function rows() { return Object.keys(state.grads).map(function (k) { var r = state.grads[k]; return { key: k, rec: r, s: r.latest }; }); }

  var COLS = [
    { id: "name", label: "Name", val: function (r) { return r.s.graduate.name.toLowerCase(); }, text: function (r) { return r.s.graduate.name; } },
    { id: "role", label: "Role", val: function (r) { return r.s.graduate.role.toLowerCase(); }, text: function (r) { return r.s.graduate.role || "—"; } },
    { id: "week", label: "Programme week", val: function (r) { return r.s.programme.status === "after" ? 99 : r.s.programme.status === "during" ? r.s.programme.week : 0; }, text: function (r) { return weekText(r.s.programme); } },
    { id: "pct", label: "Programme %", val: function (r) { return r.s.programme.pct; }, text: function (r) { return r.s.programme.pct + "%"; } },
    { id: "overall", label: "Overall progress", val: function (r) { return r.s.progress.overall === null ? -1 : r.s.progress.overall; }, text: function (r) { return pctText(r.s.progress.overall); } },
    { id: "goals", label: "Goals done", val: function (r) { return r.s.counts.goals ? r.s.counts.goalsDone / r.s.counts.goals : -1; }, text: function (r) { return r.s.counts.goals ? r.s.counts.goalsDone + " of " + r.s.counts.goals : "No goals"; } },
    { id: "overdue", label: "Overdue items", val: function (r) { return r.s.counts.overdue; }, text: function (r) { return String(r.s.counts.overdue); } },
    { id: "last", label: "Last summary", val: function (r) { return r.s.generated; }, text: function (r) { return Hub.fmtDate(r.s.generated); } },
    { id: "mood", label: "Latest mood", val: function (r) { return r.s.update ? r.s.update.mood : -1; }, text: function (r) { return r.s.update && r.s.update.mood ? Hub.moodLabel(r.s.update.mood) : r.s.shared.update ? "No update" : "Not shared"; } }
  ];

  // CSV cells that start with = + - @ (or a tab or return) would run as formulas in a spreadsheet, so they get a leading quote mark.
  function csvCell(v) {
    v = String(v === null || v === undefined ? "" : v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function buildCsv(list) {
    var head = COLS.map(function (c) { return csvCell(c.label); }).concat([csvCell("Programme start"), csvCell("Programme end"), csvCell("Notes")]).join(",");
    var lines = list.map(function (r) {
      return COLS.map(function (c) { return csvCell(c.text(r)); }).concat([csvCell(r.s.programme.start), csvCell(r.s.programme.end), csvCell(r.rec.notes.length)]).join(",");
    });
    return [head].concat(lines).join("\r\n") + "\r\n";
  }

  // ---------- the page ----------
  R.admin = function (t) {
    var status = Hub.status();
    var sort = { id: "name", dir: 1 }, filter = "", selected = null;
    t.appendChild(el("div", { class: "notice", role: "note" }, [el("strong", { text: "Contains personal data. " }), "Use this page on a Vesta-managed device, and clear it when you have finished. Everything here is kept only in this browser. Graduates choose what they send, and your notes are never added to their files."]));
    if (!storage) t.appendChild(el("div", { class: "notice", role: "alert" }, [el("strong", { text: "Saving is turned off in this browser. " }), "What you load here will be lost when you leave the page."]));
    if (recovered) t.appendChild(el("div", { class: "notice", role: "alert" }, ["The saved data on this page could not be read, so it was reset. A copy of the unreadable data was kept in this browser (gradHub.admin.v1.backup)."]));
    t.appendChild(status);

    // ----- 1. load files -----
    var loadSec = el("section", { class: "panel admin-load", "aria-labelledby": "admin-load-h" });
    loadSec.appendChild(el("h2", { id: "admin-load-h", text: "Load progress summaries" }));
    loadSec.appendChild(el("p", { text: "Choose the summary files graduates have sent you (they are named graduate-hub-summary-... .json). You can pick many at once. A newer file for the same graduate replaces the older one, and the older numbers are kept for the trend." }));
    var fileId = "admin-files";
    var input = el("input", { type: "file", id: fileId, accept: ".json,application/json", multiple: "multiple" });
    var drop = el("div", { class: "admin-drop" }, [el("label", { for: fileId, text: "Choose summary files, or drop them here" }), input]);
    var results = el("ul", { class: "plain admin-results", "aria-label": "Results of loading files" });
    loadSec.appendChild(drop); loadSec.appendChild(results);
    t.appendChild(loadSec);

    function readFile(file) {
      return new Promise(function (resolve) {
        if (file.size > MAX_FILE) return resolve({ name: file.name, error: "This file is too large to be a progress summary." });
        var rd = new FileReader();
        rd.onload = function () {
          var parsed;
          try { parsed = JSON.parse(String(rd.result || "")); } catch (e) { return resolve({ name: file.name, error: "This file is not valid." }); }
          var c = cleanSummary(parsed);
          if (c.error) return resolve({ name: file.name, error: c.error });
          resolve({ name: file.name, value: c.value });
        };
        rd.onerror = function () { resolve({ name: file.name, error: "This file could not be read." }); };
        rd.readAsText(file);
      });
    }
    function loadFiles(files) {
      files = Array.prototype.slice.call(files || []);
      if (!files.length) return;
      var skipped = files.length > MAX_FILES ? files.length - MAX_FILES : 0;
      Promise.all(files.slice(0, MAX_FILES).map(readFile)).then(function (list) {
        results.textContent = "";
        var ok = 0, bad = 0;
        list.forEach(function (r) {
          var li = el("li", {});
          if (r.error) { bad++; li.appendChild(Hub.badge("Not loaded", "danger")); li.appendChild(el("span", { text: " " + r.name + ": " + r.error })); }
          else {
            var res = ingest(r.value);
            if (res.error) { bad++; li.appendChild(Hub.badge("Not loaded", "danger")); li.appendChild(el("span", { text: " " + r.name + ": " + res.error })); }
            else {
              ok++;
              var what = res.action === "added" ? "added" : res.action === "older" ? "kept as history (a newer summary is already loaded)" : "updated";
              li.appendChild(Hub.badge("Loaded", "ok")); li.appendChild(el("span", { text: " " + r.name + ": " + r.value.graduate.name + " " + what }));
            }
          }
          results.appendChild(li);
        });
        var saved = save();
        input.value = "";
        status.say(ok + (ok === 1 ? " file loaded" : " files loaded") + (bad ? ", " + bad + " not loaded" : "") + (skipped ? ", " + skipped + " skipped (too many at once)" : "") + "." + (saved ? "" : " Your browser would not save this, so it will be lost when you leave the page."), bad > 0 || !saved);
        renderAll();
      });
    }
    input.addEventListener("change", function () { loadFiles(input.files); });
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
    drop.addEventListener("drop", function (e) { loadFiles(e.dataTransfer && e.dataTransfer.files); });

    // ----- 2. cohort table -----
    var cohortSec = el("section", { class: "panel admin-cohort", "aria-labelledby": "admin-cohort-h" });
    cohortSec.appendChild(el("h2", { id: "admin-cohort-h", text: "Cohort" }));
    var cohortHost = el("div");
    cohortSec.appendChild(cohortHost);
    t.appendChild(cohortSec);

    var detailHost = el("div", { class: "admin-detail", id: "admin-detail" });
    t.appendChild(detailHost);

    function renderCohort() {
      cohortHost.textContent = "";
      var list = rows();
      if (!list.length) { cohortHost.appendChild(el("p", { text: "No graduates loaded yet. Load some summary files above." })); return; }
      var fid = "admin-filter";
      var f = el("input", { type: "search", id: fid, value: filter, autocomplete: "off", placeholder: "Name or role" });
      f.addEventListener("input", function () { filter = f.value; renderTable(); });
      cohortHost.appendChild(el("div", { class: "field admin-filter" }, [el("label", { for: fid, text: "Filter by name or role" }), f]));
      var tableHost = el("div", { class: "admin-table-host" });
      cohortHost.appendChild(tableHost);
      cohortHost.tableHost = tableHost;
      renderTable();
    }
    function renderTable() {
      var host = cohortHost.tableHost; if (!host) return;
      host.textContent = "";
      var q = filter.trim().toLowerCase();
      var col = COLS.filter(function (c) { return c.id === sort.id; })[0];
      var list = rows().filter(function (r) { return !q || r.s.graduate.name.toLowerCase().indexOf(q) !== -1 || r.s.graduate.role.toLowerCase().indexOf(q) !== -1; });
      list.sort(function (a, b) { var x = col.val(a), y = col.val(b); return (x < y ? -1 : x > y ? 1 : a.s.graduate.name.toLowerCase() < b.s.graduate.name.toLowerCase() ? -1 : 1) * sort.dir; });
      host.appendChild(el("p", { class: "muted admin-count", role: "status", "aria-live": "polite", text: Hub.plural(list.length, "graduate", "graduates") + (q ? " match" : " loaded") }));
      if (!list.length) return;
      var table = el("table", { class: "cohort" });
      table.appendChild(el("caption", { class: "visually-hidden", text: "Graduates and their progress. Use the column buttons to sort." }));
      var tr = el("tr");
      COLS.forEach(function (c) {
        var th = el("th", { scope: "col", "aria-sort": sort.id === c.id ? (sort.dir === 1 ? "ascending" : "descending") : "none" });
        var b = el("button", { type: "button", class: "sort-btn", text: c.label });
        b.addEventListener("click", function () { if (sort.id === c.id) sort.dir = -sort.dir; else { sort.id = c.id; sort.dir = 1; } renderTable(); var again = host.querySelector('th[aria-sort] .sort-btn[data-id="' + c.id + '"]'); if (again) again.focus(); });
        b.setAttribute("data-id", c.id);
        th.appendChild(b); tr.appendChild(th);
      });
      table.appendChild(el("thead", {}, [tr]));
      var tb = el("tbody");
      list.forEach(function (r) {
        var row = el("tr", { class: selected === r.key ? "is-selected" : false });
        COLS.forEach(function (c, i) {
          var td = el("td", { "data-label": c.label });
          if (i === 0) {
            var open = el("button", { type: "button", class: "linklike", text: c.text(r), "aria-label": "Open " + r.s.graduate.name, "aria-expanded": String(selected === r.key) });
            open.addEventListener("click", function () { selected = r.key; renderTable(); renderDetail(true); });
            td.appendChild(open);
          } else td.appendChild(document.createTextNode(c.text(r)));
          if (c.id === "last" && staleWeeks(r.s)) { td.appendChild(document.createTextNode(" ")); td.appendChild(Hub.badge("No update for " + Hub.plural(staleWeeks(r.s), "week", "weeks"), "warn")); }
          if (c.id === "overdue" && r.s.counts.overdue) td.classList.add("is-bad");
          row.appendChild(td);
        });
        tb.appendChild(row);
      });
      table.appendChild(tb);
      host.appendChild(el("div", { class: "table-scroll" }, [table]));
    }

    // ----- 3. one graduate -----
    function trend(rec) {
      var pts = rec.history.filter(function (h) { return h.overall !== null; });
      var box = el("div", { class: "admin-trend" });
      box.appendChild(el("h3", { text: "Overall progress over time" }));
      if (pts.length < 2) { box.appendChild(el("p", { class: "muted", text: "Load this graduate's summaries from more than one week to see a trend." })); return box; }
      var W = 560, H = 190, L = 40, Rr = 16, T = 14, B = 34, x0 = L, x1 = W - Rr;
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("class", "trend-svg"); svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Overall progress rose from " + pts[0].overall + "% on " + Hub.fmtDate(pts[0].generated) + " to " + pts[pts.length - 1].overall + "% on " + Hub.fmtDate(pts[pts.length - 1].generated) + ". A table with the same numbers follows.");
      function mk(tag, attrs, text) { var n = document.createElementNS("http://www.w3.org/2000/svg", tag); Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text) n.textContent = text; return n; }
      function y(v) { return T + (H - T - B) * (1 - v / 100); }
      [0, 50, 100].forEach(function (v) { svg.appendChild(mk("line", { x1: x0, x2: x1, y1: y(v), y2: y(v), class: "trend-grid" })); svg.appendChild(mk("text", { x: x0 - 6, y: y(v) + 4, class: "trend-label", "text-anchor": "end" }, v + "%")); });
      var d0 = pts[0].generated, span = Math.max(1, S.daysBetween(d0, pts[pts.length - 1].generated));
      function x(p) { return x0 + (x1 - x0) * (S.daysBetween(d0, p.generated) / span); }
      svg.appendChild(mk("polyline", { points: pts.map(function (p) { return x(p).toFixed(1) + "," + y(p.overall).toFixed(1); }).join(" "), class: "trend-line", fill: "none" }));
      pts.forEach(function (p) { var c = mk("circle", { cx: x(p).toFixed(1), cy: y(p.overall).toFixed(1), r: 4.5, class: "trend-dot" }); c.appendChild(mk("title", {}, Hub.fmtDate(p.generated) + ": " + p.overall + "%")); svg.appendChild(c); });
      svg.appendChild(mk("text", { x: x0, y: H - 10, class: "trend-label", "text-anchor": "start" }, Hub.fmtDate(pts[0].generated)));
      svg.appendChild(mk("text", { x: x1, y: H - 10, class: "trend-label", "text-anchor": "end" }, Hub.fmtDate(pts[pts.length - 1].generated)));
      box.appendChild(svg);
      var det = el("details", {}, [el("summary", { text: "Show as a table" })]);
      var tbl = el("table", { class: "plain-table" }, [el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: "Summary date" }), el("th", { scope: "col", text: "Programme week" }), el("th", { scope: "col", text: "Overall progress" }), el("th", { scope: "col", text: "Overdue items" })])])]);
      var tbody = el("tbody");
      rec.history.forEach(function (h) { tbody.appendChild(el("tr", {}, [el("td", { text: Hub.fmtDate(h.generated) }), el("td", { text: h.week ? String(h.week) : "—" }), el("td", { text: pctText(h.overall) }), el("td", { text: String(h.overdue) })])); });
      tbl.appendChild(tbody); det.appendChild(tbl); box.appendChild(det);
      return box;
    }

    // The weekly reports the graduate chose to share: progress updates, weekly goals and reflections, week by week, newest first.
    function weeklyReports(s) {
      var sh = s.shared, box = el("div", { class: "admin-weekly" });
      box.appendChild(el("h3", { text: "Weekly reports" }));
      var kinds = [{ key: "updates", one: "progress update", many: "progress updates" }, { key: "weeklyGoals", one: "goal set", many: "goal sets" }, { key: "reflections", one: "reflection", many: "reflections" }];
      var shared = kinds.filter(function (k) { return sh[k.key]; }), notShared = kinds.filter(function (k) { return !sh[k.key]; });
      if (!shared.length) { box.appendChild(el("p", { class: "muted", text: "This graduate did not share weekly reports." })); return box; }
      box.appendChild(el("p", { class: "muted", text: "Weekly reports shared: " + shared.map(function (k) { return Hub.plural(s[k.key].length, k.one, k.many); }).join(", ") + (notShared.length ? ". Not shared: " + notShared.map(function (k) { return k.many; }).join(", ") : "") + "." }));
      function find(list, w) { return list.filter(function (x) { return x.week === w; })[0]; }
      var last = 0, toggles = [], serial = 0;
      shared.forEach(function (k) { s[k.key].forEach(function (x) { if (x.week > last) last = x.week; }); });
      if ((s.programme.status === "during" || s.programme.status === "after") && s.programme.week > last) last = s.programme.week;
      // Every week is a row you click to open. Open all and Close all are above the list.
      var tools = el("div", { class: "row week-tools" }), openAll = el("button", { type: "button", class: "btn small secondary", text: "Open all weeks" }), closeAll = el("button", { type: "button", class: "btn small secondary", text: "Close all weeks" });
      function setAll(open) { toggles.forEach(function (t) { t.set(open); }); }
      openAll.addEventListener("click", function () { setAll(true); }); closeAll.addEventListener("click", function () { setAll(false); });
      tools.appendChild(openAll); tools.appendChild(closeAll); box.appendChild(tools);
      for (var w = last; w >= 1; w--) {
        var art = el("article", { class: "week-report" }), body = el("div", { class: "week-body", id: "wk-" + w + "-" + (++serial) + "-" + Math.random().toString(36).slice(2, 6) }), bits = [];
        if (sh.updates) {
          var u = find(s.updates, w), row = el("p", {}, [el("strong", { text: "Progress update: " })]);
          if (u) { var mood = Hub.moodLabel(u.mood) || "No rating"; bits.push(mood); row.appendChild(document.createTextNode(mood + (u.note ? " \u2013 " + u.note : ""))); } else { row.appendChild(el("span", { class: "muted", text: "nothing written" })); }
          body.appendChild(row);
        }
        if (sh.weeklyGoals) {
          var wg = find(s.weeklyGoals, w);
          if (!wg) body.appendChild(el("p", {}, [el("strong", { text: "Weekly goals: " }), el("span", { class: "muted", text: "none set" })]));
          else {
            var done = wg.goals.filter(function (g) { return g.done; }).length;
            bits.push(done + " of " + wg.goals.length + (wg.goals.length === 1 ? " goal done" : " goals done"));
            body.appendChild(el("p", {}, [el("strong", { text: "Weekly goals: " }), done + " of " + wg.goals.length + " done"]));
            var ul = el("ul", { class: "plain wk-goals" });
            wg.goals.forEach(function (g) { ul.appendChild(el("li", { class: g.done ? "is-done" : "" }, [el("span", { class: "visually-hidden", text: g.done ? "Done: " : "Not done: " }), el("span", { "aria-hidden": "true", text: g.done ? "\u2713 " : "\u25CB " }), g.text])); });
            body.appendChild(ul);
          }
        }
        if (sh.reflections) {
          var rf = find(s.reflections, w);
          if (!rf) body.appendChild(el("p", {}, [el("strong", { text: "Reflection: " }), el("span", { class: "muted", text: "nothing written" })]));
          else {
            bits.push("reflection written");
            body.appendChild(el("p", {}, [el("strong", { text: "Reflection" })]));
            var dl = el("dl", { class: "wk-reflection" });
            [["learnt", "What I learnt"], ["wentWell", "What went well"], ["hard", "What was hard"], ["focusNext", "Focus next"]].forEach(function (f) { if (rf[f[0]]) { dl.appendChild(el("dt", { text: f[1] })); dl.appendChild(el("dd", { text: rf[f[0]] })); } });
            body.appendChild(dl);
          }
        }
        var btn = el("button", { type: "button", class: "week-toggle", "aria-controls": body.id }, [el("span", { class: "week-name", text: "Week " + w }), el("span", { class: "week-summary", text: bits.length ? bits.join(" \u00B7 ") : "Nothing shared for this week" }), el("span", { class: "chev", "aria-hidden": "true" })]);
        art.appendChild(el("h4", {}, [btn])); art.appendChild(body);
        (function (btn, body, art) {
          function set(open) { btn.setAttribute("aria-expanded", String(open)); body.hidden = !open; art.classList.toggle("is-open", open); }
          btn.addEventListener("click", function () { set(body.hidden); });
          toggles.push({ set: set });
          set(false);
        })(btn, body, art);
        box.appendChild(art);
      }
      return box;
    }

    // Goals the head sets for this graduate. They reach the graduate's hub only when the graduate imports the goals file.
    function setGoalsBlock(rec) {
      var box = el("div", { class: "admin-setgoals" });
      box.appendChild(el("h3", { text: "Goals set by the programme team" }));
      box.appendChild(el("p", { class: "muted", text: "Add or change goals for this graduate. Send them the goals file: goals reach their hub only when they import it. Goals you remove here are not removed from their hub." }));
      var editing = null, adding = false, host = el("div"), listHost = el("div"), fileHost = el("div");
      box.appendChild(listHost); box.appendChild(host); box.appendChild(fileHost);
      var TYPES = [{ value: "development", label: "Development" }, { value: "career", label: "Career" }, { value: "placement", label: "Placement" }];
      function tasksText(g) { return g.tasks.map(function (t) { return t.text; }).join("\n"); }
      function fields(isNew) {
        var f = [
          { name: "type", label: "Type of goal", type: "select", required: true, options: TYPES },
          { name: "title", label: "Goal", required: true, maxlength: 200, hint: "What should the graduate achieve?" },
          { name: "description", label: "Details", type: "textarea", rows: 3, maxlength: 2000, hint: "Why it matters and how to do it." },
          { name: "target", label: "Target date", type: "date" },
          { name: "tasks", label: "Tasks", type: "textarea", rows: 4, maxlength: 4000, hint: "One task per line. Up to 50." }
        ];
        if (isNew && Object.keys(state.grads).length > 1) f.push({ name: "everyone", label: "Cohort", type: "checks", options: [{ value: "all", label: "Also add this goal for every other graduate" }] });
        return f;
      }
      function buildTasks(text, old) {
        var lines = String(text || "").split(/\r?\n/).map(function (x) { return x.trim().slice(0, 200); }).filter(Boolean).slice(0, 50), used = {}, out = [];
        lines.forEach(function (line) {
          var match = (old || []).filter(function (t) { return t.text === line && !used[t.id]; })[0];
          if (match) { used[match.id] = true; out.push({ id: match.id, text: line }); } else out.push({ id: "pt-" + uid(), text: line });
        });
        return out;
      }
      function draw() {
        listHost.textContent = ""; host.textContent = ""; fileHost.textContent = "";
        if (!rec.setGoals.length) listHost.appendChild(el("p", { class: "muted", text: "No goals set yet." }));
        else {
          var ul = el("ul", { class: "plain" });
          rec.setGoals.forEach(function (g) {
            var li = el("li", { class: "set-goal" });
            li.appendChild(el("strong", { text: g.title }));
            li.appendChild(el("span", { class: "muted", text: " · " + g.type.charAt(0).toUpperCase() + g.type.slice(1) + (g.target ? " · due " + Hub.fmtDate(g.target) : "") + (g.tasks.length ? " · " + Hub.plural(g.tasks.length, "task", "tasks") : "") }));
            if (g.description) li.appendChild(el("div", { class: "note-text", text: g.description }));
            if (g.tasks.length) { var tl = el("ul", { class: "plain" }); g.tasks.forEach(function (t) { tl.appendChild(el("li", { text: "○ " + t.text })); }); li.appendChild(tl); }
            var edit = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit goal " + g.title });
            edit.addEventListener("click", function () { editing = g.id; adding = false; draw(); var f = host.querySelector("input[type=text]"); if (f) f.focus(); });
            var del = Hub.confirmButton({ label: "Remove", ariaLabel: "Remove goal " + g.title, message: "Remove this goal from your list? It stays in the graduate's hub if they have already imported it.", confirmLabel: "Yes, remove", onConfirm: function () {
              rec.setGoals = rec.setGoals.filter(function (x) { return x.id !== g.id; }); save(); status.say("Goal removed.", false); draw();
            } });
            li.appendChild(el("div", { class: "row" }, [edit, del]));
            ul.appendChild(li);
          });
          listHost.appendChild(ul);
        }
        var cur = editing ? rec.setGoals.filter(function (g) { return g.id === editing; })[0] : null;
        if (cur || adding) {
          var panel = el("div", { class: "set-goal-form" });
          panel.appendChild(el("h4", { text: cur ? "Edit goal" : "Add a goal" }));
          panel.appendChild(Hub.form({
            fields: fields(!cur), values: cur ? { type: cur.type, title: cur.title, description: cur.description, target: cur.target, tasks: tasksText(cur) } : { type: "development" },
            submitLabel: cur ? "Save goal" : "Add goal", onCancel: function () { editing = null; adding = false; draw(); },
            onSubmit: function (v) {
              var tasks = buildTasks(v.tasks, cur ? cur.tasks : []);
              if (cur) { cur.type = v.type; cur.title = v.title; cur.description = v.description; cur.target = v.target; cur.tasks = tasks; }
              else {
                var id = "pg-" + uid(), made = { id: id, type: v.type, title: v.title, description: v.description, target: v.target, tasks: tasks };
                rec.setGoals.push(made);
                if (v.everyone && v.everyone.indexOf("all") !== -1) {
                  Object.keys(state.grads).forEach(function (k) {
                    var other = state.grads[k]; if (other === rec || other.setGoals.some(function (x) { return x.id === id; })) return;
                    other.setGoals.push({ id: id, type: made.type, title: made.title, description: made.description, target: made.target, tasks: made.tasks.map(function (t) { return { id: t.id, text: t.text }; }) });
                  });
                }
              }
              editing = null; adding = false; var saved = save();
              status.say(saved ? (cur ? "Goal saved." : "Goal added.") : "Your browser would not save this goal, so it will be lost when you leave the page.", !saved);
              draw();
            }
          }));
          host.appendChild(panel);
        } else {
          var add = el("button", { type: "button", class: "btn small", text: "Add a goal" });
          add.addEventListener("click", function () { adding = true; editing = null; draw(); var f = host.querySelector("input[type=text]"); if (f) f.focus(); });
          host.appendChild(add);
        }
        var dl = el("button", { type: "button", class: "btn secondary", text: "Download goals file for " + rec.latest.graduate.name });
        if (!rec.setGoals.length) { dl.disabled = true; dl.setAttribute("aria-describedby", "goals-file-hint"); }
        dl.addEventListener("click", function () {
          var file = { kind: Hub.GOALS_KIND, version: 1, generated: S.today(), "for": { name: rec.latest.graduate.name }, goals: rec.setGoals };
          Hub.download("graduate-hub-goals-" + (Hub.slug(rec.latest.graduate.name) || "graduate") + "-" + S.today() + ".json", JSON.stringify(file, null, 2), "application/json");
          status.say("The goals file was downloaded. Send it to " + rec.latest.graduate.name + ": the goals reach their hub when they import it on My journey.", false);
        });
        fileHost.appendChild(el("div", { class: "row" }, [dl]));
        if (!rec.setGoals.length) fileHost.appendChild(el("p", { class: "muted", id: "goals-file-hint", text: "Add a goal first." }));
      }
      draw();
      return box;
    }

    function notesBlock(rec) {
      var box = el("div", { class: "admin-notes" });
      box.appendChild(el("h3", { text: "Your notes" }));
      box.appendChild(el("p", { class: "muted", text: "Only you can see these. They are saved in this browser and are not added to the graduate's file." }));
      var editing = null, formHost = el("div"), listHost = el("div");
      box.appendChild(formHost); box.appendChild(listHost);
      function fields() { return [{ name: "date", label: "Date", type: "date", required: true }, { name: "text", label: "Note", type: "textarea", rows: 4, required: true, maxlength: 4000 }]; }
      function draw() {
        formHost.textContent = ""; listHost.textContent = "";
        var cur = editing ? rec.notes.filter(function (n) { return n.id === editing; })[0] : null;
        formHost.appendChild(Hub.form({
          fields: fields(), values: cur ? { date: cur.date, text: cur.text } : { date: S.today(), text: "" }, submitLabel: cur ? "Save note" : "Add note",
          onCancel: cur ? function () { editing = null; draw(); } : null,
          onSubmit: function (v) {
            if (cur) { cur.date = v.date; cur.text = v.text; } else rec.notes.push({ id: uid(), date: v.date, text: v.text });
            editing = null; var saved = save();
            status.say(saved ? "Note saved." : "Your browser would not save this note, so it will be lost when you leave the page.", !saved);
            draw(); renderTable();
          }
        }));
        var sorted = rec.notes.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
        if (!sorted.length) { listHost.appendChild(el("p", { class: "muted", text: "No notes yet." })); return; }
        var ul = el("ul", { class: "plain notes" });
        sorted.forEach(function (n) {
          var li = el("li", { class: "note" });
          li.appendChild(el("div", { class: "muted", text: Hub.fmtDate(n.date) }));
          li.appendChild(el("div", { class: "note-text", text: n.text }));
          var edit = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit note from " + Hub.fmtDate(n.date) });
          edit.addEventListener("click", function () { editing = n.id; draw(); var ta = formHost.querySelector("textarea"); if (ta) ta.focus(); });
          var del = Hub.confirmButton({ label: "Delete", ariaLabel: "Delete note from " + Hub.fmtDate(n.date), message: "Delete this note?", confirmLabel: "Yes, delete", onConfirm: function () {
            rec.notes = rec.notes.filter(function (x) { return x.id !== n.id; }); save(); status.say("Note deleted.", false); draw(); renderTable();
          } });
          li.appendChild(el("div", { class: "row" }, [edit, del]));
          ul.appendChild(li);
        });
        listHost.appendChild(ul);
      }
      draw();
      return box;
    }

    function renderDetail(focus) {
      detailHost.textContent = "";
      var rec = selected && state.grads[selected]; if (!rec) { selected = null; return; }
      var s = rec.latest, sec = el("section", { class: "panel", "aria-labelledby": "admin-detail-h" });
      var h = el("h2", { id: "admin-detail-h", tabindex: "-1", text: s.graduate.name });
      sec.appendChild(h);
      sec.appendChild(el("p", { class: "muted", text: (s.graduate.role ? s.graduate.role + " · " : "") + "Latest summary " + Hub.fmtDate(s.generated) + (staleWeeks(s) ? " (" + Hub.plural(staleWeeks(s), "week", "weeks") + " ago)" : "") }));
      var stats = el("div", { class: "admin-stats" });
      function stat(label, pct, text) { var d = el("div", { class: "admin-stat" }, [el("strong", { text: label }), el("span", { text: text })]); d.appendChild(Hub.progress(pct === null ? 0 : pct, label)); stats.appendChild(d); }
      stat("Programme", s.programme.pct, weekText(s.programme) + " · " + s.programme.pct + "%");
      stat("Overall progress", s.progress.overall, pctText(s.progress.overall));
      stat("Goals", s.progress.goals, pctText(s.progress.goals));
      stat("Milestones", s.progress.milestones, pctText(s.progress.milestones));
      stat("Required training", s.progress.training, pctText(s.progress.training));
      sec.appendChild(stats);
      sec.appendChild(el("p", { text: s.counts.goalsDone + " of " + Hub.plural(s.counts.goals, "goal", "goals") + " done · " + s.counts.tasksDone + " of " + Hub.plural(s.counts.tasks, "task", "tasks") + " done · " + Hub.plural(s.counts.overdue, "overdue item", "overdue items") }));
      sec.appendChild(el("h3", { text: "Goals" }));
      if (!s.shared.goals) sec.appendChild(el("p", { class: "muted", text: "This graduate did not share goal details." }));
      else if (!s.goals.length) sec.appendChild(el("p", { class: "muted", text: "No goals." }));
      else {
        var gl = el("ul", { class: "plain" });
        s.goals.forEach(function (g) {
          gl.appendChild(el("li", {}, [el("strong", { text: g.title }), el("span", { class: "muted", text: " · " + ({ notstarted: "Not started", inprogress: "In progress", done: "Done" })[g.status] + (g.tasksTotal ? " · " + g.tasksDone + " of " + g.tasksTotal + " tasks" : "") + (g.target ? " · due " + Hub.fmtDate(g.target) : "") })]));
        });
        sec.appendChild(gl);
      }
      sec.appendChild(setGoalsBlock(rec));
      sec.appendChild(el("h3", { text: "Weekly progress update" }));
      if (!s.shared.update) sec.appendChild(el("p", { class: "muted", text: "This graduate did not share their weekly update." }));
      else if (!s.update) sec.appendChild(el("p", { class: "muted", text: "No update was saved for this week." }));
      else sec.appendChild(el("p", {}, [el("strong", { text: Hub.moodLabel(s.update.mood) || "No rating" }), s.update.note ? " – " : "", s.update.note || ""]));
      sec.appendChild(weeklyReports(s));
      sec.appendChild(trend(rec));
      sec.appendChild(notesBlock(rec));
      var rm = Hub.confirmButton({ label: "Remove this graduate", message: "This removes their summaries and your notes about them from this browser. Continue?", confirmLabel: "Yes, remove", onConfirm: function () {
        delete state.grads[selected]; selected = null; save(); status.say("Graduate removed.", false); renderAll();
      } });
      sec.appendChild(el("div", { class: "row admin-remove" }, [rm]));
      detailHost.appendChild(sec);
      if (focus) { h.focus(); }
    }

    // ----- 4. data: export, backup, restore, reset -----
    var dataSec = el("section", { class: "panel admin-tools", "aria-labelledby": "admin-data-h" });
    dataSec.appendChild(el("h2", { id: "admin-data-h", text: "Export, backup and clear" }));
    var csvBtn = el("button", { type: "button", class: "btn", text: "Export cohort table (CSV)" });
    csvBtn.addEventListener("click", function () {
      if (!rows().length) { status.say("Nothing to export yet.", true); return; }
      Hub.download("programme-team-cohort-" + S.today() + ".csv", "﻿" + buildCsv(rows()), "text/csv");
      status.say("The cohort table was downloaded as a CSV file.", false);
    });
    var bakBtn = el("button", { type: "button", class: "btn secondary", text: "Download a backup (summaries and notes)" });
    bakBtn.addEventListener("click", function () { Hub.download("programme-team-backup-" + S.today() + ".json", JSON.stringify(state, null, 2), "application/json"); status.say("A backup was downloaded.", false); });
    dataSec.appendChild(el("div", { class: "row" }, [csvBtn, bakBtn]));
    var rid = "admin-restore", rinput = el("input", { type: "file", id: rid, accept: ".json,application/json" }), rconfirm = el("div", { class: "confirm-row" });
    rinput.addEventListener("change", function () {
      rconfirm.textContent = "";
      var file = rinput.files && rinput.files[0]; if (!file) return;
      if (file.size > 20 * 1024 * 1024) { status.say("That file is too large to be a backup.", true); rinput.value = ""; return; }
      var rd = new FileReader();
      rd.onload = function () {
        var yes = el("button", { type: "button", class: "btn small danger", text: "Yes, replace what is loaded" }), no = el("button", { type: "button", class: "btn small secondary", text: "Cancel" });
        yes.addEventListener("click", function () {
          var parsed; try { parsed = JSON.parse(String(rd.result || "")); } catch (e) { status.say("That file is not a valid backup.", true); rconfirm.textContent = ""; return; }
          if (!isObj(parsed) || parsed.version !== 1 || !isObj(parsed.grads)) { status.say("That file does not look like a backup from this page, so nothing was changed.", true); rconfirm.textContent = ""; return; }
          state = sanitizeState(parsed); selected = null; var saved = save(); rconfirm.textContent = ""; rinput.value = "";
          status.say("The backup was restored." + (saved ? "" : " Your browser would not save it, so it will be lost when you leave the page."), !saved); renderAll();
        });
        no.addEventListener("click", function () { rconfirm.textContent = ""; rinput.value = ""; rinput.focus(); });
        rconfirm.appendChild(el("span", { class: "confirm-text", text: "This replaces everything currently loaded, including your notes. Continue?" })); rconfirm.appendChild(yes); rconfirm.appendChild(no); yes.focus();
      };
      rd.onerror = function () { status.say("That file could not be read.", true); };
      rd.readAsText(file);
    });
    dataSec.appendChild(el("div", { class: "restore" }, [el("label", { for: rid, text: "Restore from a backup file" }), rinput, rconfirm]));
    dataSec.appendChild(el("div", { class: "row" }, [Hub.confirmButton({ label: "Clear everything on this page", message: "This deletes every loaded summary and all your notes from this browser. Continue?", confirmLabel: "Yes, clear everything", onConfirm: function () {
      state = emptyState(); selected = null; filter = ""; if (storage) { try { storage.removeItem(KEY); storage.removeItem(BACKUP_KEY); } catch (e) { /* ignore */ } }
      results.textContent = ""; status.say("Everything was cleared from this browser.", false); renderAll();
    } })]));
    t.appendChild(dataSec);

    function renderAll() { renderCohort(); renderDetail(false); }
    renderAll();
  };
})();
