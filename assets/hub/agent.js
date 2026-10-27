// The "AI agent" button on My profile: a round button that can be dragged anywhere on the screen. Clicking it opens
// the week-ahead overview (priorities, meetings and events, deadlines). It is rule based: it reads the hub's own saved
// data in this browser, nothing is sent to an AI service. Position is remembered in this browser (gradHub.agentPos).
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store;
  var POS_KEY = "gradHub.agentPos", SIZE = 72, MARGIN = 16, STEP = 24, DRAG_PX = 6;
  var current = null;

  function readPos() {
    try {
      var p = JSON.parse(window.localStorage.getItem(POS_KEY));
      if (p && typeof p.x === "number" && typeof p.y === "number" && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1) return { x: p.x, y: p.y };
    } catch (e) { /* unreadable: use the default */ }
    return { x: 1, y: 1 };
  }
  function writePos(p) { try { window.localStorage.setItem(POS_KEY, JSON.stringify({ x: Math.round(p.x * 10000) / 10000, y: Math.round(p.y * 10000) / 10000 })); } catch (e) { /* not saved */ } }
  function isPhone() { return !!(window.matchMedia && window.matchMedia("(max-width: 600px)").matches); }

  // The area the circle may sit in: inside the visible screen with a margin, and below the sticky header.
  function bounds() {
    var vw = document.documentElement.clientWidth, vh = window.innerHeight, header = document.querySelector("header.site");
    var b = { vw: vw, vh: vh, minL: MARGIN, maxL: vw - SIZE - MARGIN, minT: (header ? header.offsetHeight : 0) + 8, maxT: vh - SIZE - MARGIN };
    if (b.maxL < b.minL) b.maxL = b.minL;
    if (b.maxT < b.minT) b.maxT = b.minT;
    return b;
  }

  Hub.unmountAgent = function () { if (current) { current.destroy(); current = null; } };

  Hub.mountAgent = function () {
    Hub.unmountAgent();
    var week = Hub.weekAhead();
    var pos = readPos(), open = false, dragging = false, justDragged = false;
    var teaseKey = "week:" + S.today();
    var isMonday = S.parseDate(S.today()).getDay() === 1;
    var teaser = isMonday && !S.state.celebrated[teaseKey];

    var wrap = el("div", { class: "agent", "data-agent": "" });
    var hint = el("span", { class: "visually-hidden", id: "agent-hint", text: "Press Enter to open your week ahead. To move this button, drag it, or hold Alt or Shift and press an arrow key." });
    var btn = el("button", { type: "button", class: "agent-btn", id: "agent-btn", "aria-expanded": "false", "aria-controls": "agent-card", "aria-describedby": "agent-hint" }, [
      el("span", { class: "agent-ai", "aria-hidden": "true", text: "AI" }), el("span", { class: "agent-word", "aria-hidden": "true", text: "agent" })
    ]);
    var dot = el("span", { class: "agent-dot", "aria-hidden": "true" });
    var bubble = el("span", { class: "agent-bubble", "aria-hidden": "true", text: "Your Monday overview is ready" });
    var live = el("p", { class: "visually-hidden", role: "status", "aria-live": "polite" });
    var card = el("div", { class: "agent-card", id: "agent-card", role: "region", "aria-labelledby": "agent-title" });
    card.hidden = true;
    wrap.appendChild(hint); wrap.appendChild(btn); wrap.appendChild(dot); wrap.appendChild(bubble); wrap.appendChild(live); wrap.appendChild(card);

    function say(msg) { live.textContent = ""; window.setTimeout(function () { live.textContent = msg; }, 30); }
    function syncLabel() {
      btn.setAttribute("aria-label", "AI agent: open your week ahead" + (teaser ? ". Your Monday overview is ready." : ""));
      dot.hidden = bubble.hidden = !teaser;
      wrap.classList.toggle("has-teaser", teaser);
    }

    // ----- position -----
    function place() {
      var b = bounds(), l = b.minL + pos.x * (b.maxL - b.minL), t = b.minT + pos.y * (b.maxT - b.minT);
      wrap.style.left = Math.round(l) + "px"; wrap.style.top = Math.round(t) + "px";
      wrap.classList.toggle("tease-left", l + SIZE / 2 > b.vw / 2);
      if (open) placeCard();
    }
    function moveTo(l, t, save) {
      var b = bounds();
      l = Math.min(b.maxL, Math.max(b.minL, l)); t = Math.min(b.maxT, Math.max(b.minT, t));
      pos = { x: b.maxL > b.minL ? (l - b.minL) / (b.maxL - b.minL) : 1, y: b.maxT > b.minT ? (t - b.minT) / (b.maxT - b.minT) : 1 };
      wrap.style.left = Math.round(l) + "px"; wrap.style.top = Math.round(t) + "px";
      wrap.classList.toggle("tease-left", l + SIZE / 2 > b.vw / 2);
      if (open) placeCard();
      if (save) writePos(pos);
    }
    function nudge(dx, dy) {
      var r = wrap.getBoundingClientRect(), b = bounds(), l = r.left, t = r.top;
      var nl = Math.min(b.maxL, Math.max(b.minL, l + dx)), nt = Math.min(b.maxT, Math.max(b.minT, t + dy));
      if (nl === l && nt === t) { say("The button is at the edge of the screen."); return; }
      moveTo(nl, nt, true);
      say("AI agent button moved " + (dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down") + ".");
    }

    // Opens the card on the side of the circle that has room: above, below, or beside it. On a phone it is a sheet along the bottom.
    function placeCard() {
      ["left", "top", "width", "maxHeight"].forEach(function (k) { card.style[k] = ""; });
      card.classList.remove("sheet");
      if (isPhone()) { card.classList.add("sheet"); card.setAttribute("data-side", "sheet"); return; }
      var b = bounds(), r = btn.getBoundingClientRect(), gap = 10, m = 8, cw = Math.min(400, b.vw - 2 * m), top0 = b.minT - 8 + m;
      card.style.width = cw + "px";
      var ch = card.offsetHeight, above = r.top - top0 - gap, below = b.vh - r.bottom - m - gap, side, left, top, maxH = 0;
      var fits = Math.min(ch, 260);
      if (above >= fits && above >= below) side = "above"; else if (below >= fits) side = "below"; else if (above >= fits) side = "above"; else side = "";
      var cap = Math.floor(b.vh * 0.7);
      if (side) {
        maxH = Math.min(cap, side === "above" ? above : below);
        var h = Math.min(ch, maxH);
        top = side === "above" ? r.top - gap - h : r.bottom + gap;
        left = r.left + r.width / 2 > b.vw / 2 ? r.right - cw : r.left;
        left = Math.min(b.vw - cw - m, Math.max(m, left));
      } else {
        var roomL = r.left - m - gap, roomR = b.vw - r.right - m - gap;
        if (Math.max(roomL, roomR) < cw) { card.classList.add("sheet"); card.setAttribute("data-side", "sheet"); card.style.width = ""; return; }
        side = roomL >= roomR ? "left" : "right";
        maxH = Math.min(cap, b.vh - top0 - m);
        var hh = Math.min(ch, maxH);
        left = side === "left" ? r.left - gap - cw : r.right + gap;
        top = Math.min(b.vh - m - hh, Math.max(top0, r.top + r.height / 2 - hh / 2));
      }
      card.style.left = Math.round(left) + "px"; card.style.top = Math.round(top) + "px"; card.style.maxHeight = Math.floor(maxH) + "px";
      card.setAttribute("data-side", side);
    }

    // ----- the overview card -----
    function greeting() {
      var h = new Date().getHours(), part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
      var first = (S.state.profile.name || "").trim().split(/\s+/)[0];
      return part + (first ? ", " + first : "") + ". Here is " + (week.isNextWeek ? "next week" : "your week ahead") + ".";
    }

    function section(title, node) { var s = el("section", { class: "agent-sec" }, [el("h3", { text: title })]); s.appendChild(node); return s; }
    function itemLine(a, text) { return a.href ? el("a", { href: a.href, text: text }) : el("span", { text: text }); }

    function buildCard() {
      week = Hub.weekAhead();
      card.textContent = "";
      var close = el("button", { type: "button", class: "agent-close", "aria-label": "Close your week ahead", text: "×" });
      close.addEventListener("click", function () { setOpen(false, true); });
      var title = el("h2", { id: "agent-title", tabindex: "-1", text: "Your week ahead" });
      card.appendChild(el("div", { class: "agent-head" }, [title, close]));

      var msg = el("div", { class: "agent-msg" });
      msg.appendChild(el("p", { class: "agent-hello", text: greeting() }));
      msg.appendChild(el("p", { class: "muted", text: week.rangeLabel + (week.programmeWeek ? " · Week " + week.programmeWeek.week + " of " + week.programmeWeek.total : "") }));
      var counts = Hub.weekAheadCounts(week);
      if (counts) msg.appendChild(el("p", { class: "agent-counts", text: counts }));
      card.appendChild(msg);

      if (week.empty) card.appendChild(el("p", { class: "agent-empty", text: "A quiet week. Add a goal or an event to plan it." }));

      if (week.priorities.length) {
        var ol = el("ol", { class: "agent-list" });
        week.priorities.forEach(function (p) {
          ol.appendChild(el("li", {}, [el("a", { href: p.href, text: p.title }), el("span", { class: "muted", text: p.reason })]));
        });
        if (week.morePriorities) ol.appendChild(el("li", { class: "muted", text: "and " + week.morePriorities + " more in the hub" }));
        card.appendChild(section("Priorities", ol));
      }

      var busy = week.days.filter(function (d) { return d.items.length; });
      if (busy.length) {
        var days = el("div", { class: "agent-days" });
        busy.forEach(function (d) {
          var ul = el("ul", { class: "agent-list" });
          d.items.forEach(function (a) {
            var li = el("li", {});
            if (a.time) li.appendChild(el("span", { class: "agent-time", text: a.time }));
            li.appendChild(itemLine(a, a.title));
            var extra = (a.where ? a.where : "") + (a.kind === "Learning" ? (a.where ? " · " : "") + "Planned learning" : "");
            if (extra) li.appendChild(el("span", { class: "muted", text: extra }));
            ul.appendChild(li);
          });
          days.appendChild(el("h4", { text: d.label + (d.date === S.today() ? " (today)" : "") }));
          days.appendChild(ul);
        });
        card.appendChild(section("Meetings and events", days));
      }

      if (week.deadlines.length) {
        var dl = el("ul", { class: "agent-list" });
        week.deadlines.forEach(function (a) { dl.appendChild(el("li", {}, [el("span", { class: "agent-time", text: Hub.shortDate(a.date) }), itemLine(a, a.title)])); });
        card.appendChild(section("Deadlines", dl));
      }
      if (week.overdue.length) {
        var od = el("ul", { class: "agent-list" });
        week.overdue.forEach(function (a) { od.appendChild(el("li", {}, [itemLine(a, a.title), el("span", { class: "muted", text: "was due " + Hub.shortDate(a.date) })])); });
        card.appendChild(section("Overdue", od));
      }

      var tline = Hub.trainingLine(week);
      if (tline) card.appendChild(el("p", { class: "agent-training" }, [el("a", { href: "learning.html", text: tline })]));
      card.appendChild(el("p", { class: "muted agent-honest", text: "Made from your own hub data, on this device. Nothing is sent to an AI service." }));

      // actions
      var status = Hub.status(), box = el("div");
      var mail = el("a", { class: "btn small", href: Hub.weekAheadMailto(week, S.state.profile.email), text: "Email me this" });
      var copy = el("button", { type: "button", class: "btn secondary small", text: "Copy text" });
      copy.addEventListener("click", function () {
        var text = Hub.weekAheadText(week);
        function fallback() {
          box.textContent = "";
          var ta = el("textarea", { readonly: "readonly", rows: "8", "aria-label": "Your week ahead, ready to copy" });
          ta.value = text; box.appendChild(ta); ta.focus(); ta.select();
          status.say("Your browser would not copy automatically. The text is selected below: press Ctrl + C to copy it.", true);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { box.textContent = ""; status.say("Your week ahead was copied.", false); }, fallback);
        else fallback();
      });
      var remind = el("button", { type: "button", class: "btn secondary small", text: "Add a Monday reminder to my calendar" });
      remind.addEventListener("click", function () {
        Hub.download("graduate-hub-monday-reminder.ics", Hub.mondayReminderIcs(), "text/calendar");
        status.say("A repeating Monday 8:30 reminder was downloaded. Open the file to add it to your calendar.", false);
      });
      card.appendChild(el("div", { class: "agent-actions" }, [mail, copy, remind]));
      card.appendChild(status); card.appendChild(box);

      // moving the button without a mouse
      var move = el("div", { class: "agent-move", role: "group", "aria-label": "Move the AI agent button" }, [el("span", { class: "muted", text: "Move this button:" })]);
      [["Up", "↑", 0, -STEP], ["Down", "↓", 0, STEP], ["Left", "←", -STEP, 0], ["Right", "→", STEP, 0]].forEach(function (d) {
        var b = el("button", { type: "button", class: "btn secondary small agent-step", "aria-label": "Move button " + d[0].toLowerCase(), text: d[1] });
        b.addEventListener("click", function () { nudge(d[2], d[3]); });
        move.appendChild(b);
      });
      var reset = el("button", { type: "button", class: "btn secondary small", text: "Reset position" });
      reset.addEventListener("click", function () { pos = { x: 1, y: 1 }; writePos(pos); place(); say("The button is back at the bottom right."); });
      move.appendChild(reset);
      card.appendChild(move);
    }

    function setOpen(next, returnFocus) {
      if (next === open) return;
      open = next;
      btn.setAttribute("aria-expanded", String(open));
      wrap.classList.toggle("is-open", open);
      if (open) {
        buildCard(); card.hidden = false; placeCard();
        if (teaser) { teaser = false; S.state.celebrated[teaseKey] = true; S.save(); syncLabel(); }
        card.querySelector("#agent-title").focus();
      } else {
        card.hidden = true;
        if (returnFocus) btn.focus();
      }
    }

    // ----- events -----
    var drag = null;
    btn.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var r = wrap.getBoundingClientRect();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, l: r.left, t: r.top, moved: false };
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* not supported: moves are still tracked */ }
    });
    btn.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.sqrt(dx * dx + dy * dy) <= DRAG_PX) return;
      if (!drag.moved) { drag.moved = true; dragging = true; wrap.classList.add("is-dragging"); }
      moveTo(drag.l + dx, drag.t + dy, false);
    });
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var moved = drag.moved; drag = null; dragging = false; wrap.classList.remove("is-dragging");
      if (moved) { justDragged = true; writePos(pos); window.setTimeout(function () { justDragged = false; }, 0); }
    }
    btn.addEventListener("pointerup", endDrag);
    btn.addEventListener("pointercancel", endDrag);
    btn.addEventListener("click", function (e) {
      if (justDragged) { justDragged = false; e.preventDefault(); return; }
      setOpen(!open, false);
    });
    btn.addEventListener("keydown", function (e) {
      if (!(e.altKey || e.shiftKey)) return;
      var d = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }[e.key];
      if (d) { e.preventDefault(); nudge(d[0], d[1]); }
    });
    function onKey(e) { if (open && e.key === "Escape") { e.preventDefault(); setOpen(false, true); } }
    function onClick(e) { if (open && document.body.contains(e.target) && !wrap.contains(e.target)) setOpen(false, false); }
    function onResize() { place(); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    document.body.appendChild(wrap);
    document.body.classList.add("has-agent");
    syncLabel(); place();

    current = {
      destroy: function () {
        document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); window.removeEventListener("resize", onResize);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        document.body.classList.remove("has-agent");
      }
    };
  };
})();
