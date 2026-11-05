const { trainedModelService } = require('./ExpenseTrack1/trainedModelService');

const trainingDataset = [
  {
    merchant: 'redBus (MakeMyTrip India Limited)',
    gstin: '33AADCM5146R1Z2',
    location: 'Chennai - 600040, Tamil Nadu / Reg: Gurugram, Haryana - 122002',
    category: 'Travel & Transit',
    amount: 1186.50,
  },
  {
    merchant: 'Ramraj Cotton',
    gstin: '33AAHFR2641F1ZI',
    location: 'No. 620/4, Vellore Road, Near Chittoor Bus Stand, Katpadi - 632007, Tamil Nadu',
    category: 'Clothing & Apparel',
    amount: 1050.00,
  },
  {
    merchant: 'Masha Pharmacy',
    gstin: '33ACEFM3457F1Z0',
    location: '50, Vallimalai Road, Katpadi, Vellore - 632007, Tamil Nadu',
    category: 'Health & Medical',
    amount: 417.00,
  },
  {
    merchant: 'Katpadi Kitchen',
    location: '3rd Street Opposite VIT Main Gate, Vellakalmedu, Katpadi, Vellore - 632007, Tamil Nadu',
    category: 'Dining & Restaurant',
    amount: 510.00,
  },
  {
    merchant: 'Hotel Roopali',
    gstin: '27ADNPS1534J1ZF',
    location: 'F.C. Road, Shivajinagar, Pune - 411005, Maharashtra',
    category: 'Dining & Restaurant',
    amount: 200.00,
  },
  {
    merchant: 'Hotel Dhruvathare',
    gstin: '29AADCL1430Q1Z2',
    location: 'Kalinganahalli Grama, Bellur Hobli, Nagamangala, Mandya, Karnataka - 572142',
    category: 'Dining & Restaurant',
    amount: 305.00,
  },
  {
    merchant: 'Odisha Hotel',
    gstin: '21FZPPS1850H1Z4',
    location: 'F-19, Chandrasekharpur, Behind Trident College, Infocity, Bhubaneswar - 751024, Odisha',
    category: 'Dining & Restaurant',
    amount: 740.00,
  },
  {
    merchant: 'The Lake Hill',
    gstin: '05AEBFS0701F1ZP',
    location: 'Near Main Boat Stand, Bhimtal Daant, Bhimtal, Uttarakhand - 263136',
    category: 'Hotel & Lodging',
    amount: 1398.31,
  },
  {
    merchant: 'Classik Family Restaurant',
    gstin: '27AAGFH4645G2ZB',
    location: 'Manpada Kalyan Sheel Rd, Dombivli, Maharashtra - 421204',
    category: 'Dining & Restaurant',
    amount: 165.00,
  },
  {
    merchant: 'Hotel Saravana Bhavan',
    location: 'Vadapalani, Chennai - 600026, Tamil Nadu',
    category: 'Dining & Restaurant',
    amount: 50.00,
  },
  {
    merchant: 'Grandview Hotel Mumbai',
    gstin: '19AAACT7896K1Z8',
    location: 'Marine Drive, Mumbai - 400020, Maharashtra',
    category: 'Hotel & Lodging',
    amount: 53100.00,
  },
  {
    merchant: 'Hotel Bawee',
    gstin: '20ASNPK8100J1ZN',
    location: 'Jamshedpur, Jharkhand - 831001',
    category: 'Hotel & Lodging',
  },
  {
    merchant: 'Hotel City Palace',
    gstin: '20ADFPB1250K1ZE',
    location: 'Ranchi, Jharkhand - 834001',
    category: 'Hotel & Lodging',
  },
  {
    merchant: 'Sleek Bill',
    gstin: '27AAFCV2419G1ZT',
    location: 'Panchsheel Square, Tapovan Road, Amravati, Maharashtra - 444601',
    category: 'General',
  },
  {
    merchant: 'Indish The Veg Treat',
    location: 'Kharadi Magarpatta Road, Opp Radisson Blu Hotel, Pune - 411014',
    category: 'Dining & Restaurant',
  },
  {
    merchant: 'Mahamaya Hotel',
    location: 'Oakland Bldgs, Shillong - 793001, Meghalaya',
    category: 'Hotel & Lodging',
    amount: 230.00,
  },
  {
    merchant: 'The Ajit Bhawan',
    location: 'Jodhpur, Rajasthan - 342006',
    category: 'Hotel & Lodging',
  },
  {
    merchant: 'Nath Traders',
    location: 'Main Market, Guwahati, Assam',
    category: 'Groceries & Supplies',
  },
];

console.log(`Starting reinforcement learning on ${trainingDataset.length} verified bill profiles...`);
trainingDataset.forEach((bill) => {
  trainedModelService.learnBill(bill);
});

console.log('Trained Model Stats:', trainedModelService.getStats());
