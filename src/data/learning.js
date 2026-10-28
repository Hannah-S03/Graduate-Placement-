// Required training and a catalogue of courses and development opportunities (draft: check before launch).
// "dueDays" = the training is due that many days after the graduate's placement start date.
// "skill" matches a skill from src/data/overview.js (its name in lower case with dashes).
window.SITE_LEARNING = {
  training: [
    { id: "t-health-safety", title: "Health and safety", description: "Keeping yourself and others safe at work.", dueDays: 7 },
    { id: "t-security", title: "Information security", description: "Passwords, phishing and protecting company information.", dueDays: 14 },
    { id: "t-data-protection", title: "Data protection", description: "How we handle personal data responsibly.", dueDays: 14 },
    { id: "t-code-of-conduct", title: "Code of conduct", description: "The standards we expect from everyone.", dueDays: 21 },
    { id: "t-equality", title: "Equality, diversity and inclusion", description: "Building an inclusive workplace.", dueDays: 30 }
  ],
  types: ["Course", "Workshop", "Shadowing", "Event", "Mentoring", "Stretch project"],
  // Courses and development opportunities shown on the Learning page. Empty for now: add your own, one per line.
  // For example (remove the // to use it):
  // { id: "c-example", title: "Course name", type: "Course", skill: "presentation-skills", duration: "2 hours", description: "What it covers.", url: "https://..." },
  catalogue: []
};
