// Company hub: placement details, and key contacts plus your own network.
(function () {
  "use strict";
  var Hub = window.Hub, el = Hub.el, S = Hub.store, R = window.SiteRenderers;
  var STRICT_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  // The Company hub is a long reference page, so each section can be folded. On a laptop every section starts open;
  // on a phone only the first does. The "On this page" links open the section they point to.
  document.addEventListener("DOMContentLoaded", Hub.foldSections);

  R.placement = function (t) {
    var P = window.SITE_PLACEMENT || { atAGlance: [], keyMoments: [] };
    var p = S.state.profile;
    t.appendChild(el("h3", { text: "Your placement at a glance" }));
    var items = P.atAGlance.slice();
    var pr = S.programme();
    items.push({ label: "Programme dates", value: pr.status === "none" ? "To be confirmed" : Hub.fmtDate(pr.startDate) + " to " + Hub.fmtDate(pr.endDate) });
    if (p.manager) items.push({ label: "Your manager", value: p.manager });
    if (p.mentor) items.push({ label: "Your mentor", value: p.mentor });
    var ul = el("ul", { class: "tiles" });
    items.forEach(function (i) { ul.appendChild(el("li", {}, [el("span", { class: "muted", text: i.label }), el("strong", { text: i.value })])); });
    t.appendChild(ul);
    t.appendChild(el("h3", { text: "Key moments" }));
    var g = el("div", { class: "grid" });
    P.keyMoments.forEach(function (m) {
      g.appendChild(el("article", { class: "card" }, [el("h4", { text: m.title }), el("p", { class: "covers-label", text: m.when }), el("p", { text: m.text })]));
    });
    t.appendChild(g);
  };

  R.network = function (t) {
    var status = Hub.status();
    var keyHost = el("div"), mineHost = el("div");
    var ui = { adding: false, editing: null, q: "" };
    Hub.notices(t);
    [status, keyHost, mineHost].forEach(function (n) { t.appendChild(n); });

    function renderKey() {
      keyHost.textContent = "";
      keyHost.appendChild(el("h3", { text: "Key contacts" }));
      keyHost.appendChild(el("p", { text: "The people to go to, and what to ask them about." }));
      var g = el("div", { class: "grid" });
      (window.SITE_TEAM || []).forEach(function (p) {
        var has = p.name || p.email || p.phone;
        var card = el("article", { class: "card" + (has ? "" : " is-blank") });
        card.appendChild(el("div", { class: "avatar", "aria-hidden": "true", text: p.name ? window.SiteUtil.initials(p.name) : "?" }));
        card.appendChild(el("h4", { text: p.name || p.role }));
        if (p.name && p.role) card.appendChild(el("p", { class: "tag", text: p.role }));
        if (p.bio) card.appendChild(el("p", { text: p.bio }));
        if (p.why || p.with) card.appendChild(el("p", {}, [el("strong", { text: "Contact them about: " }), p.why || p.with]));
        if (p.email && STRICT_EMAIL.test(p.email)) card.appendChild(el("p", {}, [el("strong", { text: "Email: " }), el("a", { href: "mailto:" + p.email, text: p.email })]));
        if (p.phone) card.appendChild(el("p", {}, [el("strong", { text: "Phone: " }), p.phone]));
        if (!has) card.appendChild(el("p", { class: "muted", text: "Contact details to be added" }));
        g.appendChild(card);
      });
      keyHost.appendChild(g);
    }

    function fields() {
      return [
        { name: "name", label: "Name", required: true, maxlength: 200 },
        { name: "role", label: "Role or team", maxlength: 200 },
        { name: "how", label: "How you know them", maxlength: 500, hint: "For example: my mentor's colleague, met at the induction." },
        { name: "email", label: "Email", type: "email", maxlength: 200 },
        { name: "last", label: "Last contacted", type: "date" },
        { name: "notes", label: "Notes and next step", type: "textarea" }
      ];
    }
    function focusContact(id) { var h = mineHost.querySelector('[data-id="' + id + '"] h4'); if (h) Hub.focus(h); }

    function card(c) {
      var a = el("article", { class: "item", "data-id": c.id });
      a.appendChild(el("h4", { text: c.name }));
      var meta = el("div", { class: "item-meta" });
      if (c.role) meta.appendChild(el("span", { class: "tag", text: c.role }));
      if (c.last) meta.appendChild(el("span", { class: "muted", text: "Last contacted " + Hub.fmtDate(c.last) }));
      a.appendChild(meta);
      if (c.how) a.appendChild(el("p", {}, [el("strong", { text: "How I know them: " }), c.how]));
      if (c.email) a.appendChild(el("p", {}, [el("strong", { text: "Email: " }), STRICT_EMAIL.test(c.email) ? el("a", { href: "mailto:" + c.email, text: c.email }) : c.email]));
      if (c.notes) a.appendChild(el("p", { text: c.notes }));
      if (ui.editing === c.id) {
        a.appendChild(Hub.form({
          fields: fields(), values: c, submitLabel: "Save changes",
          onCancel: function () { ui.editing = null; renderMine(); focusContact(c.id); },
          onSubmit: function (v) { Object.keys(v).forEach(function (k) { c[k] = v[k]; }); ui.editing = null; Hub.save(status, "Contact updated."); renderMine(); focusContact(c.id); }
        }));
        return a;
      }
      var actions = el("div", { class: "actions" });
      var ed = el("button", { type: "button", class: "btn small secondary", text: "Edit", "aria-label": "Edit " + c.name });
      ed.addEventListener("click", function () { ui.editing = c.id; ui.adding = false; renderMine(); focusContact(c.id); });
      actions.appendChild(ed);
      actions.appendChild(Hub.confirmButton({
        label: "Delete", ariaLabel: "Delete " + c.name, message: "Delete this contact?",
        onConfirm: function () { S.state.contacts = S.state.contacts.filter(function (x) { return x.id !== c.id; }); Hub.save(status, "Contact deleted."); renderMine(); Hub.focus(mineHost.querySelector("h3")); }
      }));
      a.appendChild(actions);
      return a;
    }

    function renderMine() {
      mineHost.textContent = "";
      mineHost.appendChild(el("h3", { text: "My contacts" }));
      mineHost.appendChild(el("p", { text: "Keep track of the people you meet and want to stay in touch with. These details are saved only in your browser." }));
      if (!ui.adding) {
        var b = el("button", { type: "button", class: "btn", text: "Add a contact" });
        b.addEventListener("click", function () { ui.adding = true; ui.editing = null; renderMine(); });
        mineHost.appendChild(b);
      } else {
        var panel = Hub.panel("Add a contact");
        panel.appendChild(Hub.form({
          fields: fields(), submitLabel: "Add contact",
          onCancel: function () { ui.adding = false; renderMine(); },
          onSubmit: function (v) {
            var c = { id: S.id(), name: v.name, role: v.role, how: v.how, email: v.email, last: v.last, notes: v.notes };
            S.state.contacts.push(c); ui.adding = false; Hub.save(status, "Contact added."); renderMine(); focusContact(c.id);
          }
        }));
        mineHost.appendChild(panel);
        Hub.focus(panel.heading);
      }
      if (!S.state.contacts.length) { mineHost.appendChild(el("p", { text: "You have not added any contacts yet." })); return; }
      var f = Hub.field({ name: "q", label: "Search my contacts", type: "text" }, ui.q);
      f.input.setAttribute("type", "search");
      f.input.addEventListener("input", function () { ui.q = f.input.value; renderMineList(); });
      mineHost.appendChild(el("div", { class: "filters" }, [f.wrap]));
      var listHost = el("div", { class: "contact-list" });
      mineHost.appendChild(listHost);
      renderMineList();
      function renderMineList() {
        listHost.textContent = "";
        var q = ui.q.trim().toLowerCase();
        var list = S.state.contacts.filter(function (c) { return !q || (c.name + " " + c.role + " " + c.how + " " + c.notes).toLowerCase().indexOf(q) !== -1; })
          .sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
        if (!list.length) { listHost.appendChild(el("p", { text: "No contacts match your search." })); return; }
        var ccols = el("div", { class: "cols" });
        list.forEach(function (c) { ccols.appendChild(card(c)); });
        listHost.appendChild(ccols);
      }
    }

    renderKey(); renderMine();
  };
})();
