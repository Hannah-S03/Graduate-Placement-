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
  // An optional email address, only used to fill in the "email me this" draft. Anything that does not look like an address is dropped.
  function emailOf(x) { x = str(x, 200).trim(); return /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/.test(x) ? x : ""; }
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

  // Where the graduate is in the programme. With an end date the length is worked out from the dates
  // (a partial last week counts as a week); without one it is placementWeeks (12) weeks from the start.
  // Progress (pct) is the current week out of the total weeks, for example week 6 of 12 = 50%.
  function placement(startDate, endDate) {
    var cfgWeeks = (window.SITE_CONFIG && window.SITE_CONFIG.placementWeeks) || 12;
    if (!startDate) return { status: "none", totalWeeks: cfgWeeks };
    var totalDays = cfgWeeks * 7;
    if (endDate && daysBetween(startDate, endDate) >= 0) totalDays = daysBetween(startDate, endDate) + 1;
    var totalWeeks = Math.ceil(totalDays / 7);
    var daysIn = daysBetween(startDate, today());
    var last = addDays(startDate, totalDays - 1);
    if (daysIn < 0) return { status: "before", startsIn: -daysIn, totalWeeks: totalWeeks, totalDays: totalDays, endDate: last, daysIn: daysIn, pct: 0 };
    if (daysIn >= totalDays) return { status: "after", totalWeeks: totalWeeks, totalDays: totalDays, endDate: last, daysIn: daysIn, week: totalWeeks, pct: 100 };
    var week = Math.floor(daysIn / 7) + 1;
    return { status: "during", week: week, totalWeeks: totalWeeks, totalDays: totalDays, endDate: last, daysIn: daysIn, pct: Math.round((week / totalWeeks) * 100) };
  }
  // The dates in use: the graduate's own if they have entered a start date, otherwise the programme dates from config.
  function activeDates() {
    var p = state.profile, cfg = window.SITE_CONFIG || {};
    if (p.startDate) return { start: p.startDate, end: p.endDate || "", own: true };
    return { start: dateStr(cfg.programmeStart), end: dateStr(cfg.programmeEnd), own: false };
  }
  function programme() {
    var d = activeDates(), pl = placement(d.start, d.end);
    pl.startDate = d.start; pl.own = d.own;
    return pl;
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
      profile: { name: "", role: "", email: "", manager: "", mentor: "", startDate: "", endDate: "", interests: "" },
      goals: [], milestones: [], skills: {},
      links: { pinned: [], custom: [] },
      learning: { saved: {}, custom: [], training: {} },
      contacts: [], reflections: {}, achievements: [],
      weeklyGoals: {}, calendar: [], updates: {}, celebrated: {}, meetings: [], feedback: []
    };
  }

  // Rebuilds a clean state from anything (stored data or an imported file), dropping anything invalid.
  function sanitize(raw) {
    var s = emptyState();
    if (!isObj(raw)) return s;
    var p = isObj(raw.profile) ? raw.profile : {};
    s.profile = { name: str(p.name, 120), role: str(p.role, 200), email: emailOf(p.email), manager: str(p.manager, 120), mentor: str(p.mentor, 120), startDate: dateStr(p.startDate), endDate: dateStr(p.endDate), interests: str(p.interests) };
    s.goals = mapList(raw.goals, function (g) {
      return {
        id: idOf(g), type: oneOf(g.type, ["development", "career", "placement"], "development"),
        title: str(g.title, 200), description: str(g.description), target: dateStr(g.target),
        progress: Math.round(num(g.progress, 0, 100, 0)), created: dateStr(g.created),
        // tasks: each has a status and a list of dated comments. With tasks, a goal's progress is the share completed.
        tasks: mapList(g.tasks, function (t) {
          return {
            id: idOf(t), text: str(t.text, 200).trim(), status: oneOf(t.status, ["notstarted", "inprogress", "completed"], "notstarted"),
            comments: mapList(t.comments, function (c) { return { id: idOf(c), date: dateStr(c.date), text: str(c.text, 500).trim() }; }).filter(function (c) { return c.text; }).slice(0, 100)
          };
        }).filter(function (t) { return t.text; }).slice(0, 50)
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
    if (isObj(raw.weeklyGoals)) Object.keys(raw.weeklyGoals).forEach(function (k) {
      var n = parseInt(k, 10), list = raw.weeklyGoals[k];
      if (!isFinite(n) || n < 1 || n > 52 || !Array.isArray(list)) return;
      var goals = mapList(list, function (g) { return { id: idOf(g), text: str(g.text, 200).trim(), done: g.done === true }; }).filter(function (g) { return g.text; }).slice(0, 50);
      if (goals.length) s.weeklyGoals[String(n)] = goals;
    });
    s.calendar = mapList(raw.calendar, function (c) {
      var time = typeof c.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(c.time) ? c.time : "";
      return { id: idOf(c), title: str(c.title, 200).trim(), date: dateStr(c.date), time: time, where: str(c.where, 200), note: str(c.note, 1000) };
    }).filter(function (c) { return c.title && c.date; }).slice(0, 500);
    if (isObj(raw.updates)) Object.keys(raw.updates).forEach(function (k) {
      var n = parseInt(k, 10), v = raw.updates[k];
      if (!isFinite(n) || n < 1 || n > 52 || !isObj(v)) return;
      var mood = Math.round(num(v.mood, 0, 5, 0));
      if (mood >= 1 || str(v.note, 280).trim()) s.updates[String(n)] = { mood: mood, note: str(v.note, 280), updated: dateStr(v.updated) };
    });
    // 1:1 meetings: notes are private to this browser (and are left out of the scheme record)
    s.meetings = mapList(raw.meetings, function (m) {
      return {
        id: idOf(m), date: dateStr(m.date), withWho: str(m.withWho, 120), title: str(m.title, 200), agenda: str(m.agenda, 4000), notes: str(m.notes, 8000), next: dateStr(m.next),
        actions: mapList(m.actions, function (a) { return { id: idOf(a), text: str(a.text, 300).trim(), done: a.done === true, goalTitle: str(a.goalTitle, 200) }; }).filter(function (a) { return a.text; }).slice(0, 30)
      };
    }).filter(function (m) { return m.date; }).slice(0, 300);
    // feedback received
    s.feedback = mapList(raw.feedback, function (f) {
      return { id: idOf(f), date: dateStr(f.date), from: str(f.from, 120), kind: oneOf(f.kind, ["positive", "develop"], "positive"), text: str(f.text, 3000).trim(), action: str(f.action, 1000), goalId: str(f.goalId, 60) };
    }).filter(function (f) { return f.text; }).slice(0, 500);
    // celebrations already shown (so each one appears once): { "goal:<id>": true, "half": true, ... }
    if (isObj(raw.celebrated)) Object.keys(raw.celebrated).slice(0, 1000).forEach(function (k) { if (raw.celebrated[k] === true && str(k, 80)) s.celebrated[str(k, 80)] = true; });
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
    placement: placement, programme: programme, safeUrl: safeUrl, dateStr: dateStr, sanitize: sanitize, emptyState: emptyState
  };
})();
