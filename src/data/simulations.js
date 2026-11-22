// The 12 built-in workplace simulations (2 per career field).
// Each criterion has a weight. Weights in one simulation add up to 100.

export const CATEGORIES = [
  'Software Development',
  'Information Technology',
  'Cybersecurity',
  'Data Analysis',
  'Project Management',
  'Business Communication',
];

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const SIMULATIONS = [
  {
    id: 'slow-website',
    title: 'The website got slow',
    category: 'Software Development',
    difficulty: 'Intermediate',
    from: 'Team lead, web team',
    summary: 'Find why the company website loads slowly and suggest fixes.',
    scenario:
      'Customers are complaining that our online store takes more than 8 seconds to load. The problem started after last week\'s release, which added a new image gallery on the home page and a new product search. Sales from the website dropped 12% this week.',
    task:
      'Explain how you would find the cause of the slow loading. List the tools or checks you would use, the most likely causes, and the fixes you would suggest. Say which fix you would try first and why.',
    criteria: [
      { id: 'c1', name: 'Investigation steps', skill: 'Problem solving', weight: 35, description: 'Uses a clear order of checks, such as browser dev tools, network tab and comparing with the last release.' },
      { id: 'c2', name: 'Likely causes', skill: 'Technical knowledge', weight: 35, description: 'Names realistic causes such as large images, too many requests or a slow search query.' },
      { id: 'c3', name: 'Priority and reasoning', skill: 'Decision making', weight: 30, description: 'Picks a first fix and explains why it gives the fastest result.' },
    ],
  },
  {
    id: 'code-review-feedback',
    title: 'Your first code review',
    category: 'Software Development',
    difficulty: 'Beginner',
    from: 'Senior developer',
    summary: 'Respond to review comments on your first pull request.',
    scenario:
      'You opened your first pull request. A senior developer left 9 comments. She says your function names are unclear, there are no error checks when the API fails, and one function is 120 lines long. She asks you to fix it before the end of the week.',
    task:
      'Write how you would handle this review. Explain how you would reply to the comments, what changes you would make to the code, and what you would do to avoid the same comments next time.',
    criteria: [
      { id: 'c1', name: 'Professional reply', skill: 'Communication', weight: 30, description: 'Accepts feedback politely, asks questions where something is unclear.' },
      { id: 'c2', name: 'Code changes', skill: 'Technical knowledge', weight: 40, description: 'Describes concrete fixes: clear names, error handling, splitting the long function.' },
      { id: 'c3', name: 'Learning plan', skill: 'Self development', weight: 30, description: 'Gives specific habits to improve, such as a checklist or reading the style guide.' },
    ],
  },
  {
    id: 'network-down',
    title: 'An employee cannot connect',
    category: 'Information Technology',
    difficulty: 'Beginner',
    from: 'IT support manager',
    summary: 'Troubleshoot an employee who cannot reach the company network.',
    scenario:
      'An employee in the finance department calls the help desk. Her laptop shows "Connected, no internet". Other people on the same floor are working normally. She has a report due in one hour.',
    task:
      'Explain step by step how you would find and fix the problem. Include what you would ask her, what you would check on the laptop and network, and how you would keep her informed.',
    criteria: [
      { id: 'c1', name: 'Troubleshooting order', skill: 'Problem solving', weight: 40, description: 'Starts with simple checks and moves to harder ones in a logical order.' },
      { id: 'c2', name: 'Technical checks', skill: 'Technical knowledge', weight: 35, description: 'Mentions checks such as IP settings, DNS, cable or Wi-Fi, and drivers.' },
      { id: 'c3', name: 'User communication', skill: 'Communication', weight: 25, description: 'Asks clear questions, explains simply and considers her deadline.' },
    ],
  },
  {
    id: 'new-employee-setup',
    title: 'Ten new laptops by Sunday',
    category: 'Information Technology',
    difficulty: 'Intermediate',
    from: 'Head of IT',
    summary: 'Plan the setup of laptops and accounts for new employees.',
    scenario:
      'Ten new employees start on Sunday. Each needs a laptop, an email account, access to shared folders and the HR system. You have 3 working days and one colleague to help you. Two laptops have not arrived yet.',
    task:
      'Write your plan to get everything ready. Explain how you would split the work, what you would prepare first, and what you would do about the two missing laptops.',
    criteria: [
      { id: 'c1', name: 'Planning', skill: 'Time management', weight: 35, description: 'Breaks the work into steps with a realistic schedule.' },
      { id: 'c2', name: 'Teamwork', skill: 'Teamwork', weight: 25, description: 'Splits the tasks with the colleague in a clear way.' },
      { id: 'c3', name: 'Handling the risk', skill: 'Decision making', weight: 40, description: 'Gives a backup plan for the missing laptops and tells the right people.' },
    ],
  },
  {
    id: 'phishing-email',
    title: 'A suspicious email',
    category: 'Cybersecurity',
    difficulty: 'Beginner',
    from: 'Security team lead',
    summary: 'Respond to a phishing email that some employees clicked.',
    scenario:
      'Twenty employees received an email that looks like it is from the HR department. It asks them to log in to a link to see their new salary. Three employees clicked the link and entered their passwords.',
    task:
      'Explain what you would do in the first hour. Include how you would protect the three accounts, how you would warn the other employees, and how you would reduce the chance of this happening again.',
    criteria: [
      { id: 'c1', name: 'Immediate response', skill: 'Problem solving', weight: 40, description: 'Resets passwords, checks the accounts and blocks the link quickly.' },
      { id: 'c2', name: 'Security knowledge', skill: 'Technical knowledge', weight: 30, description: 'Shows understanding of phishing signs and protections such as two-factor login.' },
      { id: 'c3', name: 'Warning message', skill: 'Communication', weight: 30, description: 'Warns staff clearly without causing panic.' },
    ],
  },
  {
    id: 'weak-passwords',
    title: 'Weak passwords everywhere',
    category: 'Cybersecurity',
    difficulty: 'Intermediate',
    from: 'IT director',
    summary: 'Propose a password policy that people will follow.',
    scenario:
      'An audit found that 60% of staff passwords are weak, and many people share passwords in team chats. Managers worry that strict rules will slow people down and they will complain.',
    task:
      'Propose a password policy for the company. Explain the rules, the tools you would use, and how you would convince managers and staff to accept it.',
    criteria: [
      { id: 'c1', name: 'Policy quality', skill: 'Technical knowledge', weight: 40, description: 'Gives clear and realistic rules, such as length, a password manager and two-factor login.' },
      { id: 'c2', name: 'Balance with usability', skill: 'Critical thinking', weight: 30, description: 'Considers how the rules affect daily work.' },
      { id: 'c3', name: 'Persuasion', skill: 'Communication', weight: 30, description: 'Explains the benefits in simple words for non-technical staff.' },
    ],
  },
  {
    id: 'sales-drop',
    title: 'Why did sales drop?',
    category: 'Data Analysis',
    difficulty: 'Intermediate',
    from: 'Sales manager',
    summary: 'Analyze a sudden drop in monthly sales.',
    scenario:
      'Monthly sales dropped from 500,000 SAR to 380,000 SAR. You have data for each branch, product category, day and payment method for the last 12 months. The manager needs an answer for a meeting in two days.',
    task:
      'Explain how you would analyze the data to find the reason for the drop. Say which comparisons you would make, which charts you would show in the meeting, and how you would present your conclusion.',
    criteria: [
      { id: 'c1', name: 'Analysis approach', skill: 'Critical thinking', weight: 40, description: 'Breaks the drop down by branch, product and time to find where it comes from.' },
      { id: 'c2', name: 'Data tools and charts', skill: 'Technical knowledge', weight: 30, description: 'Picks suitable charts and tools for the comparisons.' },
      { id: 'c3', name: 'Presenting results', skill: 'Communication', weight: 30, description: 'Plans a short, clear message for managers.' },
    ],
  },
  {
    id: 'messy-data',
    title: 'The survey data is messy',
    category: 'Data Analysis',
    difficulty: 'Beginner',
    from: 'Research coordinator',
    summary: 'Clean a survey dataset before analysis.',
    scenario:
      'You received a customer survey file with 2,000 rows. Some ages are empty, some cities are written in different ways (Jeddah, jeddah, JED), there are duplicate rows, and some ratings are 11 on a 1 to 5 scale.',
    task:
      'Explain how you would clean this data before analysis. Describe each problem, how you would fix it, and how you would record what you changed.',
    criteria: [
      { id: 'c1', name: 'Finding problems', skill: 'Critical thinking', weight: 30, description: 'Identifies missing values, duplicates, wrong values and inconsistent text.' },
      { id: 'c2', name: 'Cleaning methods', skill: 'Technical knowledge', weight: 45, description: 'Gives sensible fixes for each problem and explains the choice.' },
      { id: 'c3', name: 'Documentation', skill: 'Professionalism', weight: 25, description: 'Keeps a record of changes so others can trust the results.' },
    ],
  },
  {
    id: 'behind-schedule',
    title: 'The project is behind schedule',
    category: 'Project Management',
    difficulty: 'Advanced',
    from: 'Department manager',
    summary: 'Recover a project that is two weeks late.',
    scenario:
      'You lead a team of five building a mobile app. The launch is in four weeks, but the team is two weeks behind. One developer is on sick leave, and the client added two new features last week.',
    task:
      'Explain how you would get the project back on track. Include how you would prioritize tasks, what you would discuss with the client, and how you would communicate with your team.',
    criteria: [
      { id: 'c1', name: 'Prioritization', skill: 'Decision making', weight: 35, description: 'Separates must-have work from features that can wait.' },
      { id: 'c2', name: 'Client discussion', skill: 'Communication', weight: 30, description: 'Plans an honest talk with the client about scope or dates.' },
      { id: 'c3', name: 'Team management', skill: 'Teamwork', weight: 35, description: 'Supports the team, shares the workload fairly and tracks progress.' },
    ],
  },
  {
    id: 'team-conflict',
    title: 'Two teammates disagree',
    category: 'Project Management',
    difficulty: 'Intermediate',
    from: 'Project director',
    summary: 'Resolve a conflict that is slowing the team down.',
    scenario:
      'Two members of your team argue in every meeting about the design of the system. One wants to build quickly, the other wants a more careful design. Other members have stopped speaking in meetings.',
    task:
      'Explain how you would handle this conflict. Describe what you would say to each person, how you would make the final decision, and how you would bring the team together again.',
    criteria: [
      { id: 'c1', name: 'Conflict handling', skill: 'Teamwork', weight: 40, description: 'Listens to both sides and stays fair and calm.' },
      { id: 'c2', name: 'Decision process', skill: 'Decision making', weight: 30, description: 'Uses clear criteria to reach a decision.' },
      { id: 'c3', name: 'Team climate', skill: 'Communication', weight: 30, description: 'Helps quieter members take part again.' },
    ],
  },
  {
    id: 'critical-feedback',
    title: 'Your manager is not happy',
    category: 'Business Communication',
    difficulty: 'Beginner',
    from: 'Your manager',
    summary: 'Respond professionally to critical feedback on your work.',
    scenario:
      'Your manager tells you that your last report had several mistakes in the numbers and was delivered one day late. The report was shared with the client before anyone noticed the mistakes.',
    task:
      'Explain how you would respond to your manager, both in the meeting and after it. Include what you would say, how you would fix the report, and what you would change in the way you work.',
    criteria: [
      { id: 'c1', name: 'Professional response', skill: 'Communication', weight: 35, description: 'Takes responsibility without excuses and stays calm.' },
      { id: 'c2', name: 'Fixing the problem', skill: 'Problem solving', weight: 35, description: 'Gives clear steps to correct the report and inform the client.' },
      { id: 'c3', name: 'Improvement plan', skill: 'Self development', weight: 30, description: 'Suggests specific changes, such as a review step before sending.' },
    ],
  },
  {
    id: 'client-email',
    title: 'An angry client email',
    category: 'Business Communication',
    difficulty: 'Intermediate',
    from: 'Customer success lead',
    summary: 'Write a reply to a client who is upset about a delay.',
    scenario:
      'A client writes an angry email. Her order was promised in 5 days but it is now day 9. She says she will cancel the contract and write a bad review. The delay was caused by a supplier, and the order will arrive in 2 more days.',
    task:
      'Write the email you would send to the client. After the email, explain in two or three sentences why you chose this tone and what you offered.',
    criteria: [
      { id: 'c1', name: 'Tone and empathy', skill: 'Communication', weight: 35, description: 'Shows understanding and apologizes without blaming others.' },
      { id: 'c2', name: 'Clear information', skill: 'Professionalism', weight: 30, description: 'Gives the new date and the reason in simple words.' },
      { id: 'c3', name: 'Keeping the client', skill: 'Problem solving', weight: 35, description: 'Offers something reasonable to rebuild trust.' },
    ],
  },
];
