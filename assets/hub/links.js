// Quick links: pin company systems and resources, and add your own links.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;

  R.links = function (t) {
    var status = Hub.status();
    var addHost = el("div"), filterHost = el("div"), pinnedHost = el("div"), allHost = el("div");
    var ui = { adding: false, q: "" };
    Hub.notices(t);
    [status, addHost, filterHost, pinnedHost, allHost].forEach(function (n) { t.appendChild(n); });

    function isPinned(id) { return S.state.links.pinned.indexOf(id) !== -1; }
    function matches(l) {
      var q = ui.q.trim().toLowerCase();
      return !q || (l.name + " " + (l.description || "") + " " + l.category).toLowerCase().indexOf(q) !== -1;
    }

    function card(l) {
      var c = el("article", { class: "item link-card", "data-id": l.id });
      c.appendChild(el("h3", { text: l.name }));
      var meta = el("div", { class: "item-meta" }, [el("span", { class: "tag", text: l.category })]);
      // links built into the site (src/data/links.js) are the same for everyone and cannot be edited or deleted here
      if (l.custom) meta.appendChild(el("span", { class: "link-badge own", text: "Added by you" }));
      else meta.appendChild(el("span", { class: "link-badge" }, ["Company link", el("span", { class: "visually-hidden", text: ". Set by the programme, cannot be removed." })]));
      c.appendChild(meta);
      if (l.description) c.appendChild(el("p", { text: l.description }));
      // the big button that takes you to the website (a new tab); without an address yet it is greyed out and does nothing
      if (l.url) {
        var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("viewBox", "0 0 24 24"); icon.setAttribute("width", "20"); icon.setAttribute("height", "20"); icon.setAttribute("aria-hidden", "true"); icon.setAttribute("focusable", "false"); icon.setAttribute("class", "open-icon");
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"); path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "2"); path.setAttribute("stroke-linecap", "round"); path.setAttribute("stroke-linejoin", "round");
        icon.appendChild(path);
        c.appendChild(el("a", { href: l.url, target: "_blank", rel: "noopener noreferrer", class: "btn open-btn" }, [el("span", { text: "Open" }), icon, el("span", { class: "visually-hidden", text: " " + l.name + " (opens in a new tab)" })]));
      } else c.appendChild(el("span", { class: "btn open-btn is-disabled", "aria-disabled": "true", text: "Link to be added" }));
      var actions = el("div", { class: "actions link-actions" });
      var pinned = isPinned(l.id);
      var pin = el("button", { type: "button", class: "btn small" + (pinned ? "" : " secondary"), text: pinned ? "Pinned" : "Pin to My profile", "aria-pressed": pinned ? "true" : "false", "aria-label": pinned ? "Pinned: " + l.name + ". Press to unpin" : "Pin " + l.name + " to My profile" });
      pin.addEventListener("click", function () {
        var list = S.state.links.pinned;
        if (pinned) S.state.links.pinned = list.filter(function (x) { return x !== l.id; }); else list.push(l.id);
        Hub.save(status, l.name + (pinned ? " unpinned." : " pinned."));
        renderLists();
        var again = t.querySelector('[data-id="' + l.id + '"] button[aria-pressed]');
        if (again) again.focus();
      });
      actions.appendChild(pin);
      if (l.custom) {
        actions.appendChild(Hub.confirmButton({
          label: "Delete", ariaLabel: "Delete " + l.name, message: "Delete this link?",
          onConfirm: function () {
            S.state.links.custom = S.state.links.custom.filter(function (x) { return x.id !== l.id; });
            S.state.links.pinned = S.state.links.pinned.filter(function (x) { return x !== l.id; });
            Hub.save(status, "Link deleted."); renderAll(); Hub.focus(addHost.querySelector("button") || status);
          }
        }));
      }
      c.appendChild(actions);
      return c;
    }

    function renderAdd() {
      addHost.textContent = "";
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add your own link" });
        b.addEventListener("click", function () { ui.adding = true; renderAdd(); });
        addHost.appendChild(b);
        return;
      }
      var cats = ((window.SITE_LINKS || {}).categories || []).concat(["My links"]);
      var panel = Hub.panel("Add your own link");
      panel.appendChild(Hub.form({
        fields: [
          { name: "name", label: "Name", required: true, maxlength: 200 },
          { name: "url", label: "Web address", type: "url", required: true, hint: "Starts with http:// or https://", maxlength: 500 },
          { name: "category", label: "Category", type: "select", required: true, options: cats.map(function (c) { return { value: c, label: c }; }) },
          { name: "description", label: "Description", maxlength: 500 }
        ],
        values: { category: "My links" }, submitLabel: "Add link",
        onCancel: function () { ui.adding = false; renderAdd(); },
        onSubmit: function (v) {
          var l = { id: S.id(), name: v.name, url: S.safeUrl(v.url), category: v.category, description: v.description };
          S.state.links.custom.push(l); ui.adding = false;
          Hub.save(status, "Link added."); renderAll();
          var h = allHost.querySelector('[data-id="' + l.id + '"] h3'); if (h) Hub.focus(h);
        }
      }));
      addHost.appendChild(panel);
      Hub.focus(panel.heading);
    }

    function renderFilter() {
      filterHost.textContent = "";
      var f = Hub.field({ name: "q", label: "Search links", type: "text" }, ui.q);
      f.input.setAttribute("type", "search");
      f.input.addEventListener("input", function () { ui.q = f.input.value; renderLists(); });
      filterHost.appendChild(el("div", { class: "filters" }, [f.wrap]));
    }

    function renderLists() {
      var all = Hub.allLinks().filter(matches);
      pinnedHost.textContent = ""; allHost.textContent = "";
      var pinned = Hub.allLinks().filter(function (l) { return isPinned(l.id); });
      pinnedHost.appendChild(el("h2", { class: "link-cat" }, ["Pinned", el("span", { class: "link-count", text: " \u00B7 " + Hub.plural(pinned.length, "link", "links") })]));
      if (!pinned.length) pinnedHost.appendChild(el("p", { text: "Nothing pinned yet. Pin the links you use most and they will also appear on My profile." }));
      else { var pc = el("div", { class: "cols" }); pinned.filter(matches).forEach(function (l) { pc.appendChild(card(l)); }); pinnedHost.appendChild(pc); }
      var cats = {};
      all.forEach(function (l) { (cats[l.category] = cats[l.category] || []).push(l); });
      var names = Object.keys(cats);
      if (!names.length) { allHost.appendChild(el("p", { text: "No links match your search." })); return; }
      var order = ((window.SITE_LINKS || {}).categories || []).concat(["My links"]);
      names.sort(function (a, b) { var x = order.indexOf(a), y = order.indexOf(b); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); });
      names.forEach(function (n) {
        allHost.appendChild(el("h2", { class: "link-cat" }, [n, el("span", { class: "link-count", text: " \u00B7 " + Hub.plural(cats[n].length, "link", "links") })]));
        var cc = el("div", { class: "cols" });
        cats[n].forEach(function (l) { cc.appendChild(card(l)); });
        allHost.appendChild(cc);
      });
    }

    function renderAll() { renderAdd(); renderFilter(); renderLists(); }
    renderAll();
  };
})();
