// Light or dark theme. Loaded in the <head> of every page so the right theme is set before the page is painted.
// The choice is saved in this browser only (key gradHub.theme); without one the device's setting is followed.
(function () {
  "use strict";
  var KEY = "gradHub.theme";
  function read() {
    try { var v = window.localStorage.getItem(KEY); if (v === "light" || v === "dark") return v; } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function apply(t) { document.documentElement.setAttribute("data-theme", t); }
  apply(read());
  window.SiteTheme = {
    get: function () { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; },
    set: function (t) { t = t === "dark" ? "dark" : "light"; apply(t); try { window.localStorage.setItem(KEY, t); } catch (e) {} return t; }
  };
})();
