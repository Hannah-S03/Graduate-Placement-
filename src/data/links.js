// Company systems and resources for the Quick links page.
// These links are built into the site for every graduate. Graduates can pin them but cannot edit or delete them.
// To add another: copy a line, give it a new unique id, and paste the web address between the quote marks.
// Use plain web addresses, never a password. Leave url empty ("") until the address is known: the card then shows "Link to be added".
window.SITE_LINKS = {
  categories: ["People and HR", "IT and tools", "Learning", "Finance", "Company"],
  items: [
    { id: "payslips", name: "Payslips (Moorepay)", category: "People and HR", description: "Sign in to view your payslips.", url: "https://www.moorepay.co.uk/login-moorepay-system/" },
    { id: "hr-portal", name: "HR portal", category: "People and HR", description: "Payslips, holiday requests and personal details.", url: "" },
    { id: "wellbeing", name: "Wellbeing and support", category: "People and HR", description: "Support services, employee assistance and wellbeing resources.", url: "" },
    { id: "staff-directory", name: "Staff directory", category: "People and HR", description: "Find colleagues, teams and contact details.", url: "" },
    { id: "it-help", name: "IT help desk", category: "IT and tools", description: "Report a problem or request equipment and access.", url: "" },
    { id: "intranet", name: "Intranet", category: "Company", description: "Company news, policies and announcements.", url: "" },
    { id: "wiki", name: "Team wiki", category: "IT and tools", description: "How things work in the central team.", url: "" },
    { id: "timesheets", name: "Timesheets", category: "Finance", description: "Record your time and working pattern.", url: "" },
    { id: "expenses", name: "Expenses", category: "Finance", description: "Claim travel and other expenses (Concur).", url: "https://www.concursolutions.com/" },
    { id: "learning-platform", name: "Learning platform", category: "Learning", description: "Courses, required training and certificates.", url: "" },
    { id: "opensesame", name: "OpenSesame course library", category: "Learning", description: "Online courses and training.", url: "https://www.opensesame.com/" },
    { id: "knowbe4", name: "KnowBe4 security training", category: "Learning", description: "Security awareness training and phishing tests.", url: "https://training.knowbe4.com/app/login" },
    { id: "library", name: "Company library", category: "Learning", description: "Books, reports and research subscriptions.", url: "" }
  ]
};
