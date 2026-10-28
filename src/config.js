// Site settings. Edit this file to change the names and contact details shown across the hub.
window.SITE_CONFIG = {
  companyName: "Vesta Software Group",
  hubName: "Graduate Hub",
  logo: "assets/vesta-logo-white.png", // white version of the logo for the navy header (the original is assets/vesta-logo.png). Use "" for no logo
  logoAlt: "Vesta Software Group", // read out by screen readers
  logoShowsName: true, // true = the logo already contains the company name, so the header only adds "Graduate Hub" beside it
  favicon: "assets/vesta-icon.png", // small icon in the browser tab; use "" for none
  programmeName: "Graduate Placement Programme",
  usingDummyData: false, // set to true to show the yellow "sample content" banner on every page
  // The dates of your graduate programme. They drive the progress bar at the top of My profile until a graduate
  // enters their own dates there. Format: YYYY-MM-DD.
  programmeStart: "2026-09-01",
  programmeEnd: "2026-11-20",
  placementWeeks: 12, // used only if no end date is known
  hubUrl: "", // optional: the web address graduates open the hub at. If filled in, it is added to the Monday reminder in their calendar
  programmeTeamEmail: "", // optional: where the "Email it to the programme team" draft is addressed (falls back to contactEmail)
  contactEmail: "" // the programme team's email address: add it here when you have it (the Help page shows "Contact details will be added here" until then)
};
