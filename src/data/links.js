// Company systems and resources for the Quick links page.
// These links are built into the site for every graduate. Graduates can pin them but cannot edit or delete them.
// To add another: copy a line, give it a new unique id, and paste the web address between the quote marks.
// Use plain web addresses, never a password. Only links that are in this list are shown. (An item with url: "" would show a greyed "Link to be added" button.)
window.SITE_LINKS = {
  categories: ["Key tools", "People and HR", "IT and tools", "Learning", "Finance", "Company"],
  items: [
    { id: "salesforce", name: "Salesforce", category: "Key tools", description: "Sign in to Salesforce (customer and sales records).", url: "https://login.salesforce.com/?locale=eu" },
    { id: "payslips", name: "Payslips (Moorepay)", category: "People and HR", description: "Sign in to view your payslips.", url: "https://www.moorepay.co.uk/login-moorepay-system/" },
    { id: "expenses", name: "Expenses", category: "Finance", description: "Claim travel and other expenses (Concur).", url: "https://www.concursolutions.com/" },
    { id: "opensesame", name: "OpenSesame course library", category: "Learning", description: "Online courses and training.", url: "https://www.opensesame.com/" },
    { id: "knowbe4", name: "KnowBe4 security training", category: "Learning", description: "Security awareness training and phishing tests.", url: "https://training.knowbe4.com/app/login" }
  ]
};
