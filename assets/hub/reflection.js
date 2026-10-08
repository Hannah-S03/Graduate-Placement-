// Reflection: a note on what you learnt in each of the 12 weeks.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;

  R.reflection = function (t) {
    var status = Hub.status();
    var summary = el("div"), grid = el("div"), formHost = el("div"), listHost = el("div");
    var pl = S.programme();
    var total = pl.totalWeeks;
    var selected = pl.status === "during" ? pl.week : (function () {
      for (var i = 1; i <= total; i++) if (!S.state.reflections[String(i)]) return i;
      return 1;
    })();
    Hub.notices(t);
    if (pl.status === "none") t.appendChild(Hub.needStart());
    if (pl.status === "before") t.appendChild(el("p", { class: "notice", role: "note", text: "Your placement has not started yet. You can still write notes, and week 1 will be marked once you begin." }));
    [status, summary, grid, formHost, listHost].forEach(function (n) { t.appendChild(n); });

    function written() { return Object.keys(S.state.reflections).length; }
    function soFar() { return pl.status === "during" ? pl.week : pl.status === "after" ? total : pl.status === "before" ? 0 : total; }

    function renderSummary() {
      summary.textContent = "";
      var done = Object.keys(S.state.reflections).filter(function (k) { return parseInt(k, 10) <= soFar(); }).length;
      var denom = soFar();
      summary.appendChild(el("p", { class: "big", text: pl.status === "none" || pl.status === "before" ? written() + " of " + total + " weeks written" : done + " of " + denom + " weeks reflected so far" }));
      summary.appendChild(Hub.progress(total ? (written() / total) * 100 : 0, "Weeks with a reflection"));
    }

    function renderGrid() {
      grid.textContent = "";
      grid.appendChild(el("h2", { text: "Choose a week" }));
      var ul = el("ul", { class: "weekgrid" });
      for (var n = 1; n <= total; n++) (function (n) {
        var has = !!S.state.reflections[String(n)];
        var isNow = pl.status === "during" && pl.week === n;
        var b = el("button", { type: "button", "aria-pressed": selected === n ? "true" : "false", "aria-label": "Week " + n + (has ? ", reflection written" : ", no reflection yet") + (isNow ? ", current week" : "") });
        b.appendChild(document.createTextNode("Week " + n));
        if (isNow) b.appendChild(el("span", { class: "wk-now", text: "This week" }));
        if (has) b.appendChild(el("span", { class: "wk-done", text: "✓ written" }));
        b.addEventListener("click", function () { selected = n; renderGrid(); renderForm(); var h = formHost.querySelector("h2"); if (h) Hub.focus(h); });
        ul.appendChild(el("li", {}, [b]));
      })(n);
      grid.appendChild(ul);
    }

    function renderForm() {
      formHost.textContent = "";
      var existing = S.state.reflections[String(selected)];
      var panel = Hub.panel("Week " + selected + " reflection");
      if (existing && existing.updated) panel.appendChild(el("p", { class: "muted", text: "Last saved " + Hub.fmtDate(existing.updated) + "." }));
      var form = Hub.form({
        fields: [
          { name: "learnt", label: "What I learnt this week", type: "textarea", rows: 5, required: true, maxlength: 4000, hint: "New skills, ideas, things that surprised you." },
          { name: "wentWell", label: "What went well", type: "textarea", rows: 3 },
          { name: "hard", label: "What was hard", type: "textarea", rows: 3 },
          { name: "focusNext", label: "My focus for next week", type: "textarea", rows: 2 }
        ],
        values: existing || {}, submitLabel: existing ? "Save changes" : "Save reflection",
        onSubmit: function (v) {
          S.state.reflections[String(selected)] = { learnt: v.learnt, wentWell: v.wentWell, hard: v.hard, focusNext: v.focusNext, updated: S.today() };
          Hub.save(status, "Week " + selected + " reflection saved.");
          renderSummary(); renderGrid(); renderForm(); renderList();
        }
      });
      panel.appendChild(form);
      if (existing) {
        panel.appendChild(el("div", { class: "actions" }, [Hub.confirmButton({
          label: "Delete this reflection", ariaLabel: "Delete week " + selected + " reflection", message: "Delete this week's reflection?",
          onConfirm: function () {
            delete S.state.reflections[String(selected)];
            Hub.save(status, "Week " + selected + " reflection deleted.");
            renderSummary(); renderGrid(); renderForm(); renderList(); var h = formHost.querySelector("h2"); if (h) Hub.focus(h);
          }
        })]));
      }
      formHost.appendChild(panel);
    }

    function renderList() {
      listHost.textContent = "";
      var weeks = Object.keys(S.state.reflections).map(Number).sort(function (a, b) { return b - a; });
      listHost.appendChild(el("h2", { text: "Your reflections" }));
      if (!weeks.length) { listHost.appendChild(el("p", { text: "Nothing written yet. Choose a week above to start." })); return; }
      var rcols = el("div", { class: "cols" });
      listHost.appendChild(rcols);
      weeks.forEach(function (n) {
        var r = S.state.reflections[String(n)];
        var card = el("article", { class: "item" });
        card.appendChild(el("h3", { text: "Week " + n }));
        card.appendChild(el("p", {}, [el("strong", { text: "What I learnt: " }), r.learnt]));
        if (r.wentWell) card.appendChild(el("p", {}, [el("strong", { text: "What went well: " }), r.wentWell]));
        if (r.hard) card.appendChild(el("p", {}, [el("strong", { text: "What was hard: " }), r.hard]));
        if (r.focusNext) card.appendChild(el("p", {}, [el("strong", { text: "Focus for next week: " }), r.focusNext]));
        var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit week " + n + " reflection" });
        ed.addEventListener("click", function () { selected = n; renderGrid(); renderForm(); var h = formHost.querySelector("h2"); if (h) Hub.focus(h); });
        card.appendChild(el("div", { class: "actions" }, [ed]));
        rcols.appendChild(card);
      });
    }

    renderSummary(); renderGrid(); renderForm(); renderList();
  };
})();
