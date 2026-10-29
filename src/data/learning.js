// Required training and a catalogue of courses and development opportunities (draft: check before launch).
// "dueDays" = the training is due that many days after the graduate's placement start date.
// "skill" matches a skill from src/data/overview.js (its name in lower case with dashes).
window.SITE_LEARNING = {
  // Required training. Empty for now: the note below is shown instead. To add items later, put one per line, for example:
  // { id: "t-example", title: "Module name", description: "What it covers.", dueDays: 14 },
  // (dueDays = how many days after a graduate's start date it is due.) Items get due dates, reminders and a progress bar.
  training: [],
  trainingNote: "All training modules complete, or equivalent.",
  types: ["Course", "Workshop", "Shadowing", "Event", "Mentoring", "Stretch project"],
  // Courses and development opportunities shown on the Learning page. Empty for now: add your own, one per line.
  // For example (remove the // to use it):
  // { id: "c-example", title: "Course name", type: "Course", skill: "presentation-skills", duration: "2 hours", description: "What it covers.", url: "https://..." },
  catalogue: []
};
