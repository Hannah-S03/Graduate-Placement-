// Graduate Hub storage. Everything a graduate enters is saved in THIS browser only (localStorage).
// Nothing is sent anywhere. All reads and writes go through this file.
(function () {
  "use strict";
  var KEY = "gradHub.v1";
  var BACKUP_KEY = "gradHub.v1.backup";
  var MAXLEN = 8000;

  var storage = null;
  var available = false;
  try {
    storage = window.localStorage;
    storage.setItem("__hub_test", "1");
    storage.removeItem("__hub_test");
    available = true;
  } catch (e) { storage = null; available = false; }

  // ---------- small helpers ----------
  function isObj(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }
  function str(x, max) { return typeof x === "string" ? x.slice(0, max || MAXLEN) : ""; }
  function num(x, lo, hi, dflt) { x = Number(x); return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt; }
  function oneOf(x, list, dflt) { return list.indexOf(x) !== -1 ? x : dflt; }
  function mapList(x, fn) { return Array.isArray(x) ? x.map(function (i) { return isObj(i) ? fn(i) : null; }).filter(Boolean).slice(0, 2000) : []; }
  function dateStr(x) {
    if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return "";
    var p = x.split("-").map(Number), d = new Date(p[0], p[1] - 1, p[2]);
    return d.getFullYear() === p[0] && d.getMonth() === p[1] - 1 && d.getDate() === p[2] ? x : "";
  }
  function idOf(i) { return str(i.id, 60) || uid(); }
  function uid() { return "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function parseDate(s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function fmt(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function today() { return fmt(new Date()); }
  function addDays(s, n) { var d = parseDate(s); d.setDate(d.getDate() + n); return fmt(d); }
  function daysBetween(a, b) { // whole days from a to b (b - a), unaffected by daylight saving
    var x = parseDate(a), y = parseDate(b);
    return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 86400000);
  }

  // Where the graduate is in the placement. totalWeeks defaults to the config value (12).
  function placement(startDate, totalWeeks) {
    totalWeeks = totalWeeks || (window.SITE_CONFIG && window.SITE_CONFIG.placementWeeks) || 12;
    if (!startDate) return { status: "none", totalWeeks: totalWeeks };
    var totalDays = totalWeeks * 7, daysIn = daysBetween(startDate, today());
    var endDate = addDays(startDate, totalDays - 1);
    if (daysIn < 0) return { status: "before", startsIn: -daysIn, totalWeeks: totalWeeks, totalDays: totalDays, endDate: endDate, daysIn: daysIn };
    if (daysIn >= totalDays) return { status: "after", totalWeeks: totalWeeks, totalDays: totalDays, endDate: endDate, daysIn: daysIn, week: totalWeeks, pct: 100 };
    return { status: "during", week: Math.floor(daysIn / 7) + 1, totalWeeks: totalWeeks, totalDays: totalDays, endDate: endDate, daysIn: daysIn, pct: Math.round((daysIn / totalDays) * 100) };
  }

  // Only http and https addresses are accepted. Returns the cleaned address or "".
  function safeUrl(u) {
    if (typeof u !== "string") return "";
    u = u.trim();
    if (!u || /\s/.test(u)) return "";
    try {
      var x = new URL(u);
      return x.protocol === "http:" || x.protocol === "https:" ? x.href : "";
    } catch (e) { return ""; }
  }

  // ---------- state shape ----------
  function emptyState() {
    return {
      version: 1,
      profile: { name: "", role: "", manager: "", mentor: "", startDate: "", interests: "" },
      goals: [], milestones: [], skills: {},
      links: { pinned: [], custom: [] },
      learning: { saved: {}, custom: [], training: {} },
      contacts: [], reflections: {}, achievements: []
    };
  }

  // Rebuilds a clean state from anything (stored data or an imported file), dropping anything invalid.
  function sanitize(raw) {
    var s = emptyState();
    if (!isObj(raw)) return s;
    var p = isObj(raw.profile) ? raw.profile : {};
    s.profile = { name: str(p.name, 120), role: str(p.role, 200), manager: str(p.manager, 120), mentor: str(p.mentor, 120), startDate: dateStr(p.startDate), interests: str(p.interests) };
    s.goals = mapList(raw.goals, function (g) {
      return {
        id: idOf(g), type: oneOf(g.type, ["development", "career", "placement"], "development"),
        title: str(g.title, 200), description: str(g.description), target: dateStr(g.target),
        progress: Math.round(num(g.progress, 0, 100, 0)), created: dateStr(g.created),
        history: mapList(g.history, function (h) { return { date: dateStr(h.date), progress: Math.round(num(h.progress, 0, 100, 0)), note: str(h.note, 1000) }; })
      };
    }).filter(function (g) { return g.title; });
    s.milestones = mapList(raw.milestones, function (m) {
      return { id: idOf(m), title: str(m.title, 200), date: dateStr(m.date), status: oneOf(m.status, ["planned", "achieved"], "planned"), skill: str(m.skill, 80), goalId: str(m.goalId, 60), notes: str(m.notes) };
    }).filter(function (m) { return m.title; });
    if (isObj(raw.skills)) Object.keys(raw.skills).slice(0, 200).forEach(function (k) {
      var v = raw.skills[k]; if (isObj(v)) s.skills[str(k, 80)] = { start: Math.round(num(v.start, 0, 5, 0)), now: Math.round(num(v.now, 0, 5, 0)) };
    });
    if (isObj(raw.links)) {
      s.links.pinned = Array.isArray(raw.links.pinned) ? raw.links.pinned.filter(function (x) { return typeof x === "string"; }).map(function (x) { return str(x, 60); }).slice(0, 500) : [];
      s.links.custom = mapList(raw.links.custom, function (l) {
        return { id: idOf(l), name: str(l.name, 200), url: safeUrl(l.url), category: str(l.category, 80), description: str(l.description, 500) };
      }).filter(function (l) { return l.name && l.url; });
    }
    if (isObj(raw.learning)) {
      if (isObj(raw.learning.saved)) Object.keys(raw.learning.saved).slice(0, 500).forEach(function (k) {
        var v = raw.learning.saved[k]; if (isObj(v)) s.learning.saved[str(k, 80)] = { status: oneOf(v.status, ["saved", "inprogress", "completed"], "saved"), planned: dateStr(v.planned) };
      });
      s.learning.custom = mapList(raw.learning.custom, function (c) {
        return { id: idOf(c), title: str(c.title, 200), type: str(c.type, 40), url: safeUrl(c.url), planned: dateStr(c.planned), notes: str(c.notes), status: oneOf(c.status, ["saved", "inprogress", "completed"], "saved") };
      }).filter(function (c) { return c.title; });
      if (isObj(raw.learning.training)) Object.keys(raw.learning.training).slice(0, 200).forEach(function (k) {
        var v = raw.learning.training[k]; if (isObj(v)) s.learning.training[str(k, 80)] = { status: oneOf(v.status, ["notstarted", "inprogress", "complete"], "notstarted"), completedOn: dateStr(v.completedOn) };
      });
    }
    s.contacts = mapList(raw.contacts, function (c) {
      return { id: idOf(c), name: str(c.name, 200), role: str(c.role, 200), how: str(c.how, 500), email: str(c.email, 200), notes: str(c.notes), last: dateStr(c.last) };
    }).filter(function (c) { return c.name; });
    if (isObj(raw.reflections)) Object.keys(raw.reflections).forEach(function (k) {
      var n = parseInt(k, 10), v = raw.reflections[k];
      if (isFinite(n) && n >= 1 && n <= 52 && isObj(v) && str(v.learnt).trim()) {
        s.reflections[String(n)] = { learnt: str(v.learnt), wentWell: str(v.wentWell), hard: str(v.hard), focusNext: str(v.focusNext), updated: dateStr(v.updated) };
      }
    });
    s.achievements = mapList(raw.achievements, function (a) {
      return {
        id: idOf(a), title: str(a.title, 200), type: oneOf(a.type, ["project", "accomplishment", "presentation", "recognition", "certificate", "feedback"], "accomplishment"),
        date: dateStr(a.date), skills: Array.isArray(a.skills) ? a.skills.filter(function (x) { return typeof x === "string"; }).map(function (x) { return str(x, 80); }).slice(0, 30) : [],
        did: str(a.did), impact: str(a.impact), evidence: safeUrl(a.evidence), learnt: str(a.learnt)
      };
    }).filter(function (a) { return a.title; });
    return s;
  }

  // ---------- load / save ----------
  var state = emptyState();
  var recovered = false;

  function load() {
    if (!storage) return;
    var raw = null;
    try { raw = storage.getItem(KEY); } catch (e) { return; }
    if (raw === null) return;
    try {
      var parsed = JSON.parse(raw);
      if (!isObj(parsed)) throw new Error("not an object");
      state = sanitize(parsed);
    } catch (e) {
      // Keep a copy of the unreadable data so nothing is destroyed, then start fresh.
      try { storage.setItem(BACKUP_KEY, raw); } catch (e2) {}
      state = emptyState();
      recovered = true;
    }
  }
  load();

  function save() {
    if (!storage) return false;
    try { storage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
  }

  function exportJSON() { return JSON.stringify(state, null, 2); }

  function importJSON(text) {
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) { return { ok: false, error: "That file is not valid. Choose a file you downloaded from this hub." }; }
    if (!isObj(parsed) || parsed.version !== 1 || !isObj(parsed.profile)) return { ok: false, error: "That file does not look like a Graduate Hub backup, so nothing was changed." };
    var next = sanitize(parsed), previous = state;
    state = next;
    if (!save()) { state = previous; return { ok: false, error: "Your browser would not save the restored data, so nothing was changed." }; }
    return { ok: true };
  }

  function reset() {
    state = emptyState();
    if (storage) { try { storage.removeItem(KEY); storage.removeItem(BACKUP_KEY); } catch (e) {} }
    recovered = false;
  }

  window.HubStore = {
    available: available,
    get recovered() { return recovered; },
    get state() { return state; },
    save: save, exportJSON: exportJSON, importJSON: importJSON, reset: reset,
    id: uid, today: today, addDays: addDays, daysBetween: daysBetween, parseDate: parseDate,
    placement: placement, safeUrl: safeUrl, dateStr: dateStr, sanitize: sanitize, emptyState: emptyState
  };
})();
