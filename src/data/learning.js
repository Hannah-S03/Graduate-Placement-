// DUMMY DATA: required training and a catalogue of courses and development opportunities.
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
  catalogue: [
    { id: "c-present", title: "Presenting with confidence", type: "Workshop", skill: "presentation-skills", duration: "Half day", description: "Structure a talk, design clear slides and handle questions.", url: "" },
    { id: "c-ai-intro", title: "Introduction to AI tools at work", type: "Course", skill: "creating-your-own-ai-tool", duration: "2 hours", description: "What AI tools can and can't do, and how to use them responsibly.", url: "" },
    { id: "c-ai-build", title: "Build your first AI tool", type: "Workshop", skill: "creating-your-own-ai-tool", duration: "1 day", description: "Spot a task worth automating and build a simple tool of your own.", url: "" },
    { id: "c-research", title: "Research and analysis basics", type: "Course", skill: "research-and-analysis", duration: "3 hours", description: "Frame a question, judge sources and draw clear conclusions.", url: "" },
    { id: "c-market", title: "Market research in practice", type: "Course", skill: "market-research", duration: "3 hours", description: "Customers, competitors and simple surveys.", url: "" },
    { id: "c-portfolio", title: "Shadow the portfolio planning team", type: "Shadowing", skill: "business-and-portfolio-mapping", duration: "2 days", description: "See how products, services and customers are mapped.", url: "" },
    { id: "c-audiences", title: "Communicating with different audiences", type: "Workshop", skill: "communicating-with-different-audiences", duration: "Half day", description: "Adapt your tone, detail and format.", url: "" },
    { id: "c-events", title: "Help run a company event", type: "Stretch project", skill: "helping-plan-and-deliver-events", duration: "Several weeks", description: "Plan and deliver part of an event with the events team.", url: "" },
    { id: "c-prof-comms", title: "Writing clear emails and updates", type: "Course", skill: "professional-communication", duration: "1 hour", description: "Short, clear and professional written communication.", url: "" },
    { id: "c-organisation", title: "Planning your time and priorities", type: "Course", skill: "organisation", duration: "2 hours", description: "Prioritise work and keep track of what is next.", url: "" },
    { id: "c-commercial", title: "How the business makes money", type: "Event", skill: "building-commercial-awareness", duration: "1 hour", description: "A talk from finance on revenue, costs and value.", url: "" },
    { id: "c-problem", title: "Problem solving toolkit", type: "Workshop", skill: "problem-solving", duration: "Half day", description: "Break problems down and test ideas.", url: "" },
    { id: "c-mentor", title: "Monthly mentoring circle", type: "Mentoring", skill: "professional-communication", duration: "1 hour a month", description: "Small-group mentoring with senior colleagues.", url: "" },
    { id: "c-leaders", title: "Lunch with a senior leader", type: "Event", skill: "building-commercial-awareness", duration: "1 hour", description: "Ask a senior leader about their career and the business.", url: "" }
  ]
};
