export const PLAN_LIMITS = {
  Personal: 10,
  Professional: 25,
  Concierge: 75,
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


