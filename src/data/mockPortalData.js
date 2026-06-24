const now = new Date()
const daysAgo = (n) => {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const daysFromNow = (n) => {
  const d = new Date(now)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export const PLAN_LIMITS = {
  Personal: 10,
  Professional: 25,
  Concierge: 60,
}

export const PLAN_PRICES = {
  Personal: { monthly: 10, extraTask: 2 },
  Professional: { monthly: 20, extraTask: 1.5 },
  Concierge: { monthly: 49, extraTask: null },
}

export const REQUEST_STATUSES = ['Submitted', 'Assigned', 'Researching', 'Waiting for Customer', 'Approved', 'In Progress', 'Completed', 'Cancelled']

export const OUTCOME_TYPES = [
  'Solution Found',
  'Alternative Suggested',
  'Need Budget Increase',
  'Need Date Change',
  'Need Customer Decision',
  'Not Available',
  'Completed',
]

export const REQUEST_TEMPLATES = {
  'Flight Booking': {
    fields: [
      { name: 'departureCity', label: 'Departure City', type: 'text', placeholder: 'e.g. Dubai' },
      { name: 'destinationCity', label: 'Destination City', type: 'text', placeholder: 'e.g. Mumbai' },
      { name: 'departureDate', label: 'Departure Date', type: 'date' },
      { name: 'returnDate', label: 'Return Date', type: 'date' },
      { name: 'passengers', label: 'Number of Passengers', type: 'number', placeholder: '1' },
      { name: 'preferredAirline', label: 'Preferred Airline', type: 'text', placeholder: 'e.g. Emirates' },
      { name: 'budget', label: 'Budget (USD)', type: 'text', placeholder: 'e.g. 3000' },
      { name: 'class', label: 'Class', type: 'select', options: ['Economy', 'Premium Economy', 'Business', 'First'] },
    ],
  },
  'Appointment Scheduling': {
    fields: [
      { name: 'doctorName', label: 'Doctor / Specialist Name', type: 'text', placeholder: 'e.g. Dr. Mehta' },
      { name: 'clinicName', label: 'Clinic / Hospital Name', type: 'text', placeholder: 'e.g. Apollo Clinic' },
      { name: 'preferredDate', label: 'Preferred Date', type: 'date' },
      { name: 'preferredTime', label: 'Preferred Time', type: 'text', placeholder: 'e.g. Morning / Afternoon' },
      { name: 'patientName', label: 'Patient Name(s)', type: 'text', placeholder: 'e.g. Self, Spouse, Child' },
      { name: 'reason', label: 'Reason for Visit', type: 'text', placeholder: 'e.g. Annual checkup' },
    ],
  },
  'Subscription Reminder': {
    fields: [
      { name: 'serviceName', label: 'Service Name', type: 'text', placeholder: 'e.g. Netflix' },
      { name: 'currentPlan', label: 'Current Plan', type: 'text', placeholder: 'e.g. Premium' },
      { name: 'renewalDate', label: 'Renewal Date', type: 'date' },
      { name: 'currentCost', label: 'Current Monthly Cost (USD)', type: 'text', placeholder: 'e.g. 22.99' },
      { name: 'action', label: 'Desired Action', type: 'select', options: ['Review & Optimize', 'Cancel', 'Renew', 'Downgrade'] },
    ],
  },
  'Gift Delivery': {
    fields: [
      { name: 'recipientName', label: 'Recipient Name', type: 'text', placeholder: 'e.g. Mother' },
      { name: 'recipientAddress', label: 'Delivery Address', type: 'text', placeholder: 'Full address' },
      { name: 'occasion', label: 'Occasion', type: 'text', placeholder: 'e.g. Birthday, Anniversary' },
      { name: 'deliveryDate', label: 'Delivery Date', type: 'date' },
      { name: 'budget', label: 'Budget (USD)', type: 'text', placeholder: 'e.g. 100' },
      { name: 'preferences', label: 'Recipient Preferences', type: 'textarea', placeholder: 'e.g. Likes sweets, flowers, sarees' },
    ],
  },
  'Travel Planning': {
    fields: [
      { name: 'destination', label: 'Destination', type: 'text', placeholder: 'e.g. Singapore' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'travelers', label: 'Number of Travelers', type: 'number', placeholder: '1' },
      { name: 'budget', label: 'Total Budget (USD)', type: 'text', placeholder: 'e.g. 5000' },
      { name: 'preferences', label: 'Preferences', type: 'textarea', placeholder: 'e.g. Hotels, flights, activities' },
    ],
  },
}

export const demoUsers = [
  {
    id: 'user-personal',
    name: 'Rajesh Sharma',
    email: 'client@nripa.com',
    password: 'nripa2024',
    avatar: 'RS',
    subscriptionPlan: 'Personal',
    taskUsage: 3,
    extraTasksPurchased: 0,
  },
  {
    id: 'user-professional',
    name: 'Ananya Patel',
    email: 'premium@nripa.com',
    password: 'premium2024',
    avatar: 'AP',
    subscriptionPlan: 'Professional',
    taskUsage: 12,
    extraTasksPurchased: 5,
  },
  {
    id: 'user-concierge',
    name: 'Vikram Singh',
    email: 'enterprise@nripa.com',
    password: 'enterprise2024',
    avatar: 'VS',
    subscriptionPlan: 'Concierge',
    taskUsage: 47,
    extraTasksPurchased: 0,
  },
  {
    id: 'user-admin',
    name: 'Admin Team',
    email: 'admin@nripa.com',
    password: 'admin2024',
    avatar: 'AT',
    subscriptionPlan: 'Concierge',
    taskUsage: 0,
    extraTasksPurchased: 0,
    role: 'Admin',
  },
]

const makeMsg = (sender, text, ts) => ({ id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, sender, text, timestamp: ts })

export const initialRequests = [
  {
    id: 'REQ-001',
    title: 'Flight Booking for Diwali trip to Mumbai',
    category: 'Travel Assistance',
    description: 'Need to book flights for family of 4 (2 adults, 2 kids) from Dubai to Mumbai. Dates: Oct 30 - Nov 5. Prefer Emirates or Air India. Business class if within budget ($3000 total).',
    priority: 'High',
    status: 'Assigned',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    userId: 'user-professional',
    userName: 'Ananya Patel',
    userPlan: 'Professional',
    actionRequired: false,
    actionRequiredNote: '',
    proposedSolution: null,
    outcome: null,
    timeline: [
      { status: 'Submitted', date: daysAgo(3) },
      { status: 'Assigned', date: daysAgo(2) },
    ],
    conversation: [
      makeMsg('customer', 'Hi team! I need help booking flights for our Diwali trip to Mumbai. Family of 4 from Dubai.', daysAgo(3)),
      makeMsg('admin', 'Hello Ananya! We would be happy to help with your flight booking. Let me check the best options for Emirates and Air India business class within your $3000 budget.', daysAgo(3)),
      makeMsg('admin', 'We have reviewed the options and accepted your request. We will prepare a shortlist shortly.', daysAgo(2)),
    ],
  },
  {
    id: 'REQ-002',
    title: 'Doctor Appointment Scheduling',
    category: 'Family Assistance',
    description: 'Please schedule annual checkups for myself and my wife at Apollo Clinic. Prefer weekend slots. Also need to book pediatrician for kids - Dr. Mehta at Children\'s Hospital.',
    priority: 'High',
    status: 'Waiting for Customer',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    userId: 'user-personal',
    userName: 'Rajesh Sharma',
    userPlan: 'Personal',
    actionRequired: true,
    actionRequiredNote: 'Please confirm your preferred weekend time slots and which Apollo Clinic location you prefer.',
    proposedSolution: null,
    outcome: null,
    timeline: [
      { status: 'Submitted', date: daysAgo(2) },
      { status: 'Assigned', date: daysAgo(2) },
      { status: 'Waiting for Customer', date: daysAgo(1) },
    ],
    conversation: [
      makeMsg('customer', 'Hi, I need to schedule annual checkups for myself and my wife at Apollo Clinic. Also need pediatrician for kids.', daysAgo(2)),
      makeMsg('admin', 'Hello Rajesh! We would be happy to help schedule these appointments. We have accepted your request and will start working on it.', daysAgo(2)),
      makeMsg('admin', 'We need some additional information to proceed. Could you please confirm your preferred time slots for the weekend? Also, do you have a specific location preference for Apollo Clinic?', daysAgo(1)),
    ],
  },
  {
    id: 'REQ-003',
    title: 'Subscription Renewal - Netflix & Spotify',
    category: 'Subscription Management',
    description: 'My Netflix subscription is renewing on the 15th and Spotify on the 20th. Please review the plans and suggest if there are better options available. Currently on Netflix Premium and Spotify Family.',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    userId: 'user-concierge',
    userName: 'Vikram Singh',
    userPlan: 'Concierge',
    actionRequired: false,
    actionRequiredNote: '',
    proposedSolution: null,
    outcome: null,
    timeline: [
      { status: 'Submitted', date: daysAgo(4) },
      { status: 'Assigned', date: daysAgo(4) },
      { status: 'Waiting for Customer', date: daysAgo(3) },
      { status: 'Assigned', date: daysAgo(1) },
    ],
    conversation: [
      makeMsg('customer', 'My Netflix is renewing on 15th and Spotify on 20th. Can you review if there are better plans available?', daysAgo(4)),
      makeMsg('admin', 'Hello Vikram! We have accepted your request. Let us review your current subscriptions and compare with available options.', daysAgo(4)),
      makeMsg('admin', 'We noticed you are on Netflix Premium ($22.99/mo) and Spotify Family ($16.99/mo). Do you use the full Netflix 4K benefit? Also, how many family members are on your Spotify plan? This will help us suggest the best alternatives.', daysAgo(3)),
      makeMsg('customer', 'Yes I use 4K on Netflix. Spotify Family has 5 members including me. Please check if there are annual plans that could save money.', daysAgo(1)),
    ],
  },
  {
    id: 'REQ-004',
    title: 'Credit Card Payment Issue',
    category: 'Personal Finance Management',
    description: 'My credit card payment of $2,450 was declined yesterday. The due date is in 3 days. I have sufficient funds. Please help resolve this urgently and arrange payment before the due date to avoid late fees.',
    priority: 'High',
    status: 'In Progress',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
    userId: 'user-personal',
    userName: 'Rajesh Sharma',
    userPlan: 'Personal',
    actionRequired: false,
    actionRequiredNote: '',
    proposedSolution: null,
    outcome: null,
    timeline: [
      { status: 'Submitted', date: daysAgo(1) },
      { status: 'Assigned', date: daysAgo(1) },
      { status: 'Waiting for Customer', date: daysAgo(1) },
      { status: 'Assigned', date: daysAgo(1) },
      { status: 'In Progress', date: daysAgo(0) },
    ],
    conversation: [
      makeMsg('customer', 'URGENT: My credit card payment of $2,450 was declined. Due in 3 days. Please help!', daysAgo(1)),
      makeMsg('admin', 'We have received your urgent request and accepted it. Let us look into this right away, Rajesh.', daysAgo(1)),
      makeMsg('admin', 'We see the payment was declined. Could you please confirm which credit card issuer this is with, and whether you received any specific error message or notification from the bank?', daysAgo(1)),
      makeMsg('customer', 'It is HDFC Bank credit card. The message just said "transaction declined - please contact issuer." I called them and they said I need to authorize the payment through their portal.', daysAgo(1)),
      makeMsg('admin', 'Thank you for the details. We are now working on resolving this with HDFC Bank. Please bear with us while we arrange the payment.', daysAgo(0)),
    ],
  },
  {
    id: 'REQ-005',
    title: 'Gift Delivery for Mother\'s Birthday',
    category: 'Lifestyle Assistance',
    description: 'Need to send a birthday gift to my mother in Pune. She lives at: 42, Green Park Society, Koregaon Park, Pune. Budget $100-150. She likes sweets, flowers, and sarees. Need delivery on her birthday - June 25th.',
    priority: 'Medium',
    status: 'Approved',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    userId: 'user-concierge',
    userName: 'Vikram Singh',
    userPlan: 'Concierge',
    actionRequired: true,
    actionRequiredNote: 'Please review and approve the proposed gift package.',
    proposedSolution: {
      title: 'Birthday Gift Package for Mother',
      description: 'A curated gift combination including a Banarasi silk saree, premium sweets, fresh roses, and a personalized card, delivered to her doorstep in Pune.',
      options: [
        { name: 'Banarasi Silk Saree - Nalli', cost: 75 },
        { name: 'Premium Sweet Box - Monginis', cost: 25 },
        { name: 'Fresh Rose Bouquet', cost: 20 },
        { name: 'Personalized Greeting Card', cost: 10 },
      ],
      estimatedCost: 130,
    },
    outcome: null,
    timeline: [
      { status: 'Submitted', date: daysAgo(5) },
      { status: 'Assigned', date: daysAgo(5) },
      { status: 'Waiting for Customer', date: daysAgo(4) },
      { status: 'Assigned', date: daysAgo(3) },
      { status: 'In Progress', date: daysAgo(3) },
      { status: 'Approved', date: daysAgo(1) },
    ],
    conversation: [
      makeMsg('customer', 'I want to send a birthday gift to my mother in Pune. She lives in Koregaon Park. Budget $100-150. She likes sweets, flowers, and sarees. Her birthday is June 25th.', daysAgo(5)),
      makeMsg('admin', 'Hello Vikram! What a thoughtful gesture. We have accepted your request and will find the perfect gift combination for your mother.', daysAgo(5)),
      makeMsg('admin', 'We have a few options for you. For the saree, we recommend a lovely Kanchipuram silk from Nalli\'s Pune store ($65). Combined with a premium sweet box from Monginis ($25) and a bouquet of roses ($20), the total would be around $110. Does this work for you? Also, should we include a personalized card?', daysAgo(4)),
      makeMsg('customer', 'That sounds perfect! Yes please include a personalized card. For the saree, could you go with a Banarasi silk instead? She loves those. Budget can go up to $150 for everything.', daysAgo(3)),
      makeMsg('admin', 'Great choices! We found a beautiful Banarasi silk saree ($75) at the same store. Updated package: Banarasi saree ($75) + Sweet box ($25) + Roses ($20) + Premium card ($10) = $130. We can proceed if you approve this selection.', daysAgo(1)),
    ],
  },
  {
    id: 'REQ-006',
    title: 'Organize Tax Documents for FY 2025-26',
    category: 'Personal Finance Management',
    description: 'Need help organizing all tax-related documents: Form 16, investment proofs, rental agreements, and bank statements. Please create a folder structure and checklist.',
    priority: 'Medium',
    status: 'Completed',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(6),
    userId: 'user-personal',
    userName: 'Rajesh Sharma',
    userPlan: 'Personal',
    actionRequired: false,
    actionRequiredNote: '',
    proposedSolution: null,
    outcome: 'Solution Found',
    timeline: [
      { status: 'Submitted', date: daysAgo(10) },
      { status: 'Assigned', date: daysAgo(9) },
      { status: 'In Progress', date: daysAgo(8) },
      { status: 'Approved', date: daysAgo(7) },
      { status: 'Completed', date: daysAgo(6) },
    ],
    conversation: [
      makeMsg('customer', 'Please help organize my tax documents for this year. I have Form 16, investment proofs, and bank statements.', daysAgo(10)),
      makeMsg('admin', 'Hello Rajesh! We have accepted your request. We will create a comprehensive folder structure and checklist for you.', daysAgo(9)),
      makeMsg('admin', 'We have organized your documents into the following structure:\n1. Income Proof (Form 16, Bank Statements)\n2. Investment Proofs (PPF, ELSS, NPS)\n3. Deductions (Home Loan, Insurance)\n4. Rental Documents\nA complete checklist is ready for your review.', daysAgo(8)),
      makeMsg('admin', 'Please review the checklist we prepared and let us know if you need any additional categories or if everything looks good.', daysAgo(7)),
      makeMsg('customer', 'This looks perfect! Thank you for the thorough organization. Everything is in order.', daysAgo(6)),
      makeMsg('admin', 'You are welcome, Rajesh! Your tax documents are now fully organized and ready for filing. Let us know if you need any further assistance.', daysAgo(6)),
    ],
  },
  {
    id: 'REQ-007',
    title: 'Research International Schools in Singapore',
    category: 'Research Services',
    description: 'Looking for top international schools for my two children. Budget around SGD 30-50k/year. Prefer IB curriculum. Need shortlist of 5 schools with fee structure and admission deadlines.',
    priority: 'Medium',
    status: 'Completed',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(10),
    userId: 'user-professional',
    userName: 'Ananya Patel',
    userPlan: 'Professional',
    actionRequired: false,
    actionRequiredNote: '',
    proposedSolution: null,
    outcome: 'Solution Found',
    timeline: [
      { status: 'Submitted', date: daysAgo(15) },
      { status: 'Assigned', date: daysAgo(14) },
      { status: 'In Progress', date: daysAgo(13) },
      { status: 'Approved', date: daysAgo(12) },
      { status: 'Completed', date: daysAgo(10) },
    ],
    conversation: [
      makeMsg('customer', 'I need help researching international schools in Singapore for my two children. IB curriculum preferred.', daysAgo(15)),
      makeMsg('admin', 'Hello Ananya! We have accepted this research request. Let us compile a comprehensive shortlist of the best IB schools in Singapore within your budget.', daysAgo(14)),
      makeMsg('admin', 'We have completed our research. Here is your shortlist:\n\n1. Singapore American School - SGD 45k/yr - IB & AP\n2. UWCSEA - SGD 42k/yr - Full IB\n3. Tanglin Trust School - SGD 38k/yr - IB\n4. Canadian International School - SGD 35k/yr - IB\n5. Nexus International School - SGD 32k/yr - IB\n\nDetailed fee breakdowns and admission deadlines are attached. Would you like us to proceed with arranging school tours?', daysAgo(12)),
      makeMsg('customer', 'Excellent research! Please proceed with arranging virtual tours for UWCSEA, Tanglin Trust, and Nexus. Thank you!', daysAgo(11)),
      makeMsg('admin', 'We have contacted all three schools and virtual tours are being scheduled. You will receive calendar invites shortly. Task completed!', daysAgo(10)),
    ],
  },
  {
    id: 'REQ-008',
    title: 'Set Up NPS Account',
    category: 'Personal Finance Management',
    description: 'Need help opening a National Pension System (NPS) account. Already have PAN and Aadhaar. Please research the best Tier 1 and Tier 2 options and help with the application.',
    priority: 'Low',
    status: 'Cancelled',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(5),
    userId: 'user-professional',
    userName: 'Ananya Patel',
    userPlan: 'Professional',
    actionRequired: false,
    actionRequiredNote: '',
    proposedSolution: {
      title: 'Alternative: Self-Service NPS Registration',
      description: 'NPS regulations require in-person e-Sign verification. We recommend completing it directly on the NSDL portal.',
      options: [
        { name: 'Visit NSDL eGov portal', cost: 0 },
        { name: 'Use Aadhaar OTP verification', cost: 0 },
      ],
      estimatedCost: 0,
    },
    outcome: 'Not Available',
    timeline: [
      { status: 'Submitted', date: daysAgo(7) },
      { status: 'Assigned', date: daysAgo(6) },
      { status: 'Waiting for Customer', date: daysAgo(6) },
      { status: 'Assigned', date: daysAgo(6) },
      { status: 'In Progress', date: daysAgo(5) },
      { status: 'Cancelled', date: daysAgo(5) },
    ],
    conversation: [
      makeMsg('customer', 'I want to open an NPS account. I have PAN and Aadhaar ready. Please guide me through the process.', daysAgo(7)),
      makeMsg('admin', 'Hello Ananya! We have accepted your request and will help you set up your NPS account.', daysAgo(6)),
      makeMsg('admin', 'To proceed with the NPS application, we need your bank account details and nominee information. Could you please provide these?', daysAgo(6)),
      makeMsg('customer', 'Yes, bank account is HDFC Savings (XXXX1234). Nominee: Arjun Patel (my husband).', daysAgo(6)),
      makeMsg('admin', 'Thank you for the details. We attempted to proceed with the application but unfortunately, NPS regulations require the account holder to complete the e-Sign process in person through Aadhaar OTP verification on the official portal. This cannot be done through a third party. We recommend visiting the NSDL eGov portal directly to complete your registration. We apologize for the inconvenience.', daysAgo(5)),
      makeMsg('customer', 'I understand, thank you for looking into it.', daysAgo(5)),
    ],
  },
]

export const initialReminders = [
  { id: 'REM-001', title: 'Credit Card Bill Due - $2,450', date: daysFromNow(4), time: '10:00', type: 'monthly', preference: 'both', completed: false },
  { id: 'REM-002', title: 'Insurance Renewal - HDFC Life', date: daysFromNow(24), time: '09:00', type: 'yearly', preference: 'email', completed: false },
  { id: 'REM-003', title: 'Netflix Subscription Renewal', date: daysFromNow(14), time: '12:00', type: 'monthly', preference: 'app', completed: false },
  { id: 'REM-004', title: "Mother's Birthday Gift", date: daysFromNow(7), time: '08:00', type: 'yearly', preference: 'both', completed: false },
  { id: 'REM-005', title: 'Doctor Appointment - Annual Checkup', date: daysFromNow(10), time: '14:30', type: 'one-time', preference: 'both', completed: false },
  { id: 'REM-006', title: 'Quarterly Investment Portfolio Review', date: daysFromNow(10), time: '11:00', type: 'quarterly', preference: 'email', completed: false },
  { id: 'REM-007', title: 'Car Registration Renewal', date: daysFromNow(50), time: '09:00', type: 'yearly', preference: 'app', completed: false },
  { id: 'REM-008', title: 'Property Tax Payment Deadline', date: daysFromNow(40), time: '17:00', type: 'quarterly', preference: 'both', completed: false },
  { id: 'REM-009', title: 'Visa Renewal Deadline', date: daysFromNow(9), time: '23:59', type: 'one-time', preference: 'email', completed: false },
  { id: 'REM-010', title: 'Annual Health Checkup - Self', date: daysFromNow(29), time: '10:00', type: 'yearly', preference: 'both', completed: false },
  { id: 'REM-011', title: "Birthday Reminder - Ananya's Birthday", date: daysFromNow(21), time: '09:00', type: 'yearly', preference: 'both', completed: false },
  { id: 'REM-012', title: 'Doctor Appointment - Dental Cleaning', date: daysFromNow(15), time: '15:00', type: 'one-time', preference: 'app', completed: false },
]

export const initialNotifications = [
  { id: 'NOT-001', title: 'New Request: Flight Booking', message: 'Ananya Patel has submitted a new flight booking request.', type: 'new_request', read: false, createdAt: daysAgo(3) },
  { id: 'NOT-002', title: 'Request Accepted: Doctor Appointment', message: 'Your doctor appointment request has been accepted and is being processed.', type: 'request_accepted', read: false, createdAt: daysAgo(2) },
  { id: 'NOT-003', title: 'Action Required: Appointment Scheduling', message: 'We need your decision on preferred time slots for the doctor appointments.', type: 'action_required', read: true, createdAt: daysAgo(1) },
  { id: 'NOT-004', title: 'Alternative Suggested: Subscription Renewal', message: 'We have found alternative plans that could save you money on Netflix & Spotify.', type: 'alternative_suggested', read: false, createdAt: daysAgo(1) },
  { id: 'NOT-005', title: 'Approval Requested: Gift Delivery', message: 'Your gift delivery proposal is ready for your approval.', type: 'approval_requested', read: false, createdAt: daysAgo(1) },
  { id: 'NOT-006', title: 'Outcome Added: Tax Documents', message: 'Your tax organization request has been resolved with outcome: Solution Found.', type: 'outcome_added', read: true, createdAt: daysAgo(6) },
  { id: 'NOT-007', title: 'Request Rejected: NPS Account', message: 'Your NPS account setup request has been rejected due to regulatory requirements.', type: 'rejected', read: true, createdAt: daysAgo(5) },
]

export const categories = [
  'Personal Assistant',
  'Calendar & Scheduling',
  'Email Assistance',
  'Subscription Management',
  'Lifestyle Assistance',
  'Research Services',
  'Administrative Support',
  'Travel Assistance',
  'Family Assistance',
  'Property & Relocation Assistance',
  'Concierge Services',
  'Personal Finance Management',
]

export const ROLES = ['Owner', 'Family Member', 'Assistant', 'Viewer']

export const DEFAULT_PERMISSIONS = {
  Owner: { canManageUsers: true, canManageRequests: true, canManageBilling: true, canAccessAll: true },
  'Family Member': { canManageUsers: false, canManageRequests: true, canManageBilling: false, canAccessAll: false },
  Assistant: { canManageUsers: false, canManageRequests: true, canManageBilling: false, canAccessAll: false },
  Viewer: { canManageUsers: false, canManageRequests: false, canManageBilling: false, canAccessAll: false },
}

export const upgradeHistoryData = [
  { userId: 'user-personal', from: 'Personal', to: 'Professional', date: '2026-07-15', revenue: 20 },
  { userId: 'user-professional', from: 'Personal', to: 'Professional', date: '2026-06-01', revenue: 20 },
  { userId: 'user-concierge', from: 'Professional', to: 'Concierge', date: '2026-05-20', revenue: 49 },
]
