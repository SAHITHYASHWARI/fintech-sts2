import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    native: 'English',
    subtitle: 'Default International',
    flag: '🌐',
    greeting: 'Welcome to STS FINTECH Ledger',
  },
  {
    code: 'ta',
    label: 'Tamil',
    native: 'தமிழ்',
    subtitle: 'தமிழ்நாடு • Tamil Nadu',
    flag: '🇮🇳',
    greeting: 'எஸ்.டி.எஸ் ஃபின்டெக்-க்கு நல்வரவு!',
  },
  {
    code: 'hi',
    label: 'Hindi',
    native: 'हिन्दी',
    subtitle: 'भारत • National Language',
    flag: '🇮🇳',
    greeting: 'एसटीएस फिनटेक में आपका हार्दिक स्वागत है!',
  },
  {
    code: 'te',
    label: 'Telugu',
    native: 'తెలుగు',
    subtitle: 'ఆంధ్రప్రదేశ్ & తెలంగాణ',
    flag: '🇮🇳',
    greeting: 'STS ఫిన్‌టెక్‌కు స్వాగతం!',
  },
  {
    code: 'kn',
    label: 'Kannada',
    native: 'ಕನ್ನಡ',
    subtitle: 'ಕರ್ನಾಟಕ • Karnataka',
    flag: '🇮🇳',
    greeting: 'STS ಫಿನ್‌ಟೆಕ್‌ಗೆ ಸುಸ್ವಾಗತ!',
  },
  {
    code: 'ml',
    label: 'Malayalam',
    native: 'മലയാളം',
    subtitle: 'കേരളം • Kerala',
    flag: '🇮🇳',
    greeting: 'STS ഫിൻടെക്കിലേക്ക് സ്വാഗതം!',
  },
];

export const TRANSLATIONS = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    segregation: 'Segregation',
    split_collect: 'Split & Collect',
    goal_target: 'Goal Target',
    bills_reminders: 'Bill & Reminder',
    income_streams: 'Income Streams',
    wallets: 'Wallets',
    contact_us: 'Contact Us',
    contact: 'Contact',
    settings: 'Settings',

    // Dashboard KPIs
    total_income: 'Total Income',
    total_expenses: 'Total Expenses',
    monthly_savings: 'Monthly Savings',
    net_worth: 'Net Worth',

    // Actions
    add: 'Add',
    edit: 'Edit',
    sign_out: 'Sign Out',
    manage_account: 'Manage Account',
    delete: 'Delete',
    save_changes: 'Save Changes',
    cancel: 'Cancel',

    // Headers & Sections
    sync_ledger: 'Sync Ledger',
    additional_source: 'Additional Source',
    additional_income: 'Additional Income',
    additional_expense: 'Additional Expense',
    fixed_source: 'Fixed Source',
    fixed_income: 'Fixed Income',
    fixed_expense: 'Fixed Expense',
    name: 'Name',
    description: 'Description',
    date: 'Date',
    time: 'Time',
    amount: 'Amount',
    actions: 'Actions',
    schedule: 'Schedule',

    // Settings Page
    settings_title: 'Settings & Preferences',
    settings_desc: 'Configure your personal profile identity, workspace visual theme, and mother tongue language.',
    profile_info: 'Profile Information',
    profile_desc: 'View and update your personal credentials and ledger account',
    edit_profile: 'Edit Profile',
    full_name: 'Full Name',
    age: 'Age',
    email: 'Gmail / Email',
    password: 'Password',
    theme_preference: 'Theme Preference',
    theme_desc: 'Toggle dynamically between clean light canvas and dark obsidian mode',
    light_mode: 'Light Mode',
    dark_mode: 'Dark Mode',
    language_selector: 'Language Selector (Mother Tongue Support)',
    language_desc: 'Choose your mother tongue language for native script recognition and localization',
    localized_greeting: 'Localized Greeting',
    quick_select_lang: 'Quick Select Mother Tongue',
  },
  ta: {
    // Sidebar
    dashboard: 'டாஷ்போர்டு',
    segregation: 'பிரித்தெடுத்தல்',
    split_collect: 'பகிர்ந்து வசூலி',
    goal_target: 'இலக்கு நோக்கம்',
    bills_reminders: 'ரசீது & நினைவூட்டல்',
    income_streams: 'வருமான வழிகள்',
    wallets: 'பணப்பைகள்',
    contact_us: 'எங்களை தொடர்பு கொள்ள',
    contact: 'தொடர்பு',
    settings: 'அமைப்புகள்',

    // Dashboard KPIs
    total_income: 'மொத்த வருமானம்',
    total_expenses: 'மொத்த செலவுகள்',
    monthly_savings: 'மாதாந்திர சேமிப்பு',
    net_worth: 'நிகர மதிப்பு',

    // Actions
    add: 'சேர்க்க',
    edit: 'திருத்த',
    sign_out: 'வெளியேறு',
    manage_account: 'கணக்கை நிர்வகி',
    delete: 'நீக்கு',
    save_changes: 'மாற்றங்களைச் சேமி',
    cancel: 'ரத்து செய்',

    // Headers & Sections
    sync_ledger: 'ஒத்திசைக்க',
    additional_source: 'கூடுதல் ஆதாரம்',
    additional_income: 'கூடுதல் வருமானம்',
    additional_expense: 'கூடுதல் செலவு',
    fixed_source: 'நிலையான ஆதாரம்',
    fixed_income: 'நிலையான வருமானம்',
    fixed_expense: 'நிலையான செலவு',
    name: 'பெயர்',
    description: 'விவரம்',
    date: 'தேதி',
    time: 'நேரம்',
    amount: 'தொகை',
    actions: 'செயல்கள்',
    schedule: 'அட்டவணை',

    // Settings Page
    settings_title: 'அமைப்புகள் & விருப்பங்கள்',
    settings_desc: 'சுயவிவர அடையாளம், காட்சி தீம் மற்றும் தாய்மொழி விருப்பங்களை அமைக்கவும்.',
    profile_info: 'சுயவிவர தகவல்',
    profile_desc: 'உங்கள் தனிப்பட்ட சான்றுகள் மற்றும் கணக்கு தகவல்களைப் பார்க்கவும் திருத்தவும்',
    edit_profile: 'சுயவிவரத்தை திருத்து',
    full_name: 'முழு பெயர்',
    age: 'வயது',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    theme_preference: 'தீம் தேர்வு',
    theme_desc: 'பகல் முறை மற்றும் இரவு முறைக்கிடையே உடனடியாக மாற்றவும்',
    light_mode: 'பகல் முறை (Light)',
    dark_mode: 'இரவு முறை (Dark)',
    language_selector: 'மொழி தேர்வு (தாய்மொழி ஆதரவு)',
    language_desc: 'பயன்பாட்டுக்கான தாய்மொழி மற்றும் பிராந்திய மொழி விருப்பத்தை தேர்வு செய்யவும்',
    localized_greeting: 'உள்ளூர் வாழ்த்து',
    quick_select_lang: 'தாய்மொழியை விரைவாகத் தேர்ந்தெடுங்கள்',
  },
  hi: {
    // Sidebar
    dashboard: 'डैशबोर्ड',
    segregation: 'व्यय पृथक्करण',
    split_collect: 'बांटें और वसूलें',
    goal_target: 'लक्ष्य निर्धारण',
    bills_reminders: 'बिल और अनुस्मारक',
    income_streams: 'आय के स्रोत',
    wallets: 'वॉलेट्स',
    contact_us: 'संपर्क करें',
    contact: 'संपर्क',
    settings: 'सेटिंग्स',

    // Dashboard KPIs
    total_income: 'कुल आय',
    total_expenses: 'कुल व्यय',
    monthly_savings: 'मासिक बचत',
    net_worth: 'कुल संपत्ति',

    // Actions
    add: 'जोड़ें',
    edit: 'संपादित करें',
    sign_out: 'साइन आउट',
    manage_account: 'खाता प्रबंधित करें',
    delete: 'हटाएं',
    save_changes: 'परिवर्तन सहेजें',
    cancel: 'रद्द करें',

    // Headers & Sections
    sync_ledger: 'लेज़र सिंक करें',
    additional_source: 'अतिरिक्त स्रोत',
    additional_income: 'अतिरिक्त आय',
    additional_expense: 'अतिरिक्त व्यय',
    fixed_source: 'निश्चित स्रोत',
    fixed_income: 'निश्चित आय',
    fixed_expense: 'निश्चित व्यय',
    name: 'नाम',
    description: 'विवरण',
    date: 'तारीख',
    time: 'समय',
    amount: 'राशि',
    actions: 'कार्रवाई',
    schedule: 'शेड्यूल',

    // Settings Page
    settings_title: 'सेटिंग्स और प्राथमिकताएं',
    settings_desc: 'अपनी प्रोफ़ाइल पहचान, विज़ुअल थीम और मातृभाषा प्राथमिकताओं को कॉन्फ़िगर करें।',
    profile_info: 'प्रोफ़ाइल जानकारी',
    profile_desc: 'अपने व्यक्तिगत क्रेडेंशियल्स और लेज़र खाते को देखें और अपडेट करें',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    full_name: 'पूरा नाम',
    age: 'उम्र',
    email: 'जीमेल / ईमेल',
    password: 'पासवर्ड',
    theme_preference: 'थीम प्राथमिकता',
    theme_desc: 'लाइट कैनवास और डार्क ओब्सीडियन मोड के बीच गतिशील रूप से टॉगल करें',
    light_mode: 'लाइट मोड',
    dark_mode: 'डार्क मोड',
    language_selector: 'भाषा चयन (मातृभाषा समर्थन)',
    language_desc: 'अपनी पसंदीदा मातृभाषा और क्षेत्रीय लिपि का चयन करें',
    localized_greeting: 'स्थानीय अभिवादन',
    quick_select_lang: 'मातृभाषा का त्वरित चयन',
  },
  te: {
    // Sidebar
    dashboard: 'డాష్‌బోర్డ్',
    segregation: 'విభజన',
    split_collect: 'స్ప్లిట్ & కలెక్ట్',
    goal_target: 'లక్ష్య టార్గెట్',
    bills_reminders: 'బిల్లు & రిమైండర్',
    income_streams: 'ఆదాయ మార్గాలు',
    wallets: 'వాలెట్లు',
    contact_us: 'మమ్మల్ని సంప్రదించండి',
    contact: 'సంప్రదించండి',
    settings: 'సెట్టింగులు',

    // Dashboard KPIs
    total_income: 'మొత్తం ఆదాయం',
    total_expenses: 'మొత్తం ఖర్చులు',
    monthly_savings: 'నెలవారీ పొదుపు',
    net_worth: 'నికర విలువ',

    // Actions
    add: 'జోడించు',
    edit: 'సవరించు',
    sign_out: 'సైన్ అవుట్',
    manage_account: 'ఖాతాను నిర్వహించండి',
    delete: 'తొలగించు',
    save_changes: 'మార్పులను సేవ్ చేయండి',
    cancel: 'రద్దు చేయి',

    // Headers & Sections
    sync_ledger: 'లెడ్జర్ సింక్ చేయండి',
    additional_source: 'అదనపు మూలం',
    additional_income: 'అదనపు ఆదాయం',
    additional_expense: 'అదనపు ఖర్చు',
    fixed_source: 'స్థిర మూలం',
    fixed_income: 'స్థిర ఆదాయం',
    fixed_expense: 'స్థిర ఖర్చు',
    name: 'పేరు',
    description: 'వివరణ',
    date: 'తేదీ',
    time: 'సమయం',
    amount: 'మొత్తం',
    actions: 'చర్యలు',
    schedule: 'షెడ్యూల్',

    // Settings Page
    settings_title: 'సెట్టింగ్‌లు & ప్రాధాన్యతలు',
    settings_desc: 'మీ వ్యక్తిగత ప్రొఫైల్ గుర్తింపు, థీమ్ మరియు మాతృభాషను కాన్ఫిగర్ చేయండి.',
    profile_info: 'ప్రొఫైల్ సమాచారం',
    profile_desc: 'మీ వ్యక్తిగత ఆధారాలు మరియు ఖాతాను వీక్షించండి మరియు నవీకరించండి',
    edit_profile: 'ప్రొఫైల్‌ను సవరించండి',
    full_name: 'పూర్తి పేరు',
    age: 'వయస్సు',
    email: 'జీమెయిల్ / ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    theme_preference: 'థీమ్ ప్రాధాన్యత',
    theme_desc: 'లైట్ మోడ్ మరియు డార్క్ మోడ్ మధ్య మారండి',
    light_mode: 'లైట్ మోడ్',
    dark_mode: 'డార్క్ మోడ్',
    language_selector: 'భాష ఎంపిక (మాతృభాష మద్దతు)',
    language_desc: 'మీకు కావలసిన మాతృభాషను ఎంచుకోండి',
    localized_greeting: 'స్థానిక శుభాకాంక్షలు',
    quick_select_lang: 'మాతృభాషను త్వరగా ఎంచుకోండి',
  },
  kn: {
    // Sidebar
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    segregation: 'ವರ್ಗೀಕರಣ',
    split_collect: 'ವಿಭಜಿಸಿ & ಸಂಗ್ರಹಿಸಿ',
    goal_target: 'ಗುರಿ ಗುರಿ',
    bills_reminders: 'ಬಿಲ್ ಮತ್ತು ಜ್ಞಾಪನೆ',
    income_streams: 'ಆದಾಯದ ಮೂಲಗಳು',
    wallets: 'ವಾಲೆಟ್‌ಗಳು',
    contact_us: 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
    contact: 'ಸಂಪರ್ಕಿಸಿ',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',

    // Dashboard KPIs
    total_income: 'ಒಟ್ಟು ಆದಾಯ',
    total_expenses: 'ಒಟ್ಟು ವೆಚ್ಚಗಳು',
    monthly_savings: 'ಮಾಸಿಕ ಉಳಿತಾಯ',
    net_worth: 'ನಿವ್ವಳ ಮೌಲ್ಯ',

    // Actions
    add: 'ಸೇರಿಸಿ',
    edit: 'ತಿದ್ದು',
    sign_out: 'ಸೈನ್ ಔಟ್',
    manage_account: 'ಖಾತೆಯನ್ನು ನಿರ್ವಹಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    save_changes: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',

    // Headers & Sections
    sync_ledger: 'ಲೆಡ್ಜರ್ ಸಿಂಕ್ ಮಾಡಿ',
    additional_source: 'ಹೆಚ್ಚುವರಿ ಮೂಲ',
    additional_income: 'ಹೆಚ್ಚುವರಿ ಆದಾಯ',
    additional_expense: 'ಹೆಚ್ಚುವರಿ ವೆಚ್ಚ',
    fixed_source: 'ಸ್ಥಿರ ಮೂಲ',
    fixed_income: 'ಸ್ಥಿರ ಆದಾಯ',
    fixed_expense: 'ಸ್ಥಿರ ವೆಚ್ಚ',
    name: 'ಹೆಸರು',
    description: 'ವಿವರಣೆ',
    date: 'ದಿನಾಂಕ',
    time: 'ಸಮಯ',
    amount: 'ಮೊತ್ತ',
    actions: 'ಕ್ರಿಯೆಗಳು',
    schedule: 'ವೇಳಾಪಟ್ಟಿ',

    // Settings Page
    settings_title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳು',
    settings_desc: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಗುರುತು, ದೃಶ್ಯ ಥೀಮ್ ಮತ್ತು ಮಾತೃಭಾಷೆಯನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ.',
    profile_info: 'ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ',
    profile_desc: 'ನಿಮ್ಮ ವಿವರಗಳು ಮತ್ತು ಖಾತೆಯನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನವೀಕರಿಸಿ',
    edit_profile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
    full_name: 'ಪೂರ್ಣ ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    email: 'ಜಿಮೇಲ್ / ಇಮೇಲ್',
    password: 'ಪಾಸ್ವರ್ಡ್',
    theme_preference: 'ಥೀಮ್ ಆದ್ಯತೆ',
    theme_desc: 'ಲೈಟ್ ಮೋಡ್ ಮತ್ತು ಡಾರ್ಕ್ ಮೋಡ್ ನಡುವೆ ಬದಲಿಸಿ',
    light_mode: 'ಲೈಟ್ ಮೋಡ್',
    dark_mode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    language_selector: 'ಭಾಷಾ ಆಯ್ಕೆ (ಮಾತೃಭಾಷೆ ಬೆಂಬಲ)',
    language_desc: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಮಾತೃಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    localized_greeting: 'ಸ್ಥಳೀಯ ಶುಭಾಶಯ',
    quick_select_lang: 'ಮಾತೃಭಾಷೆಯನ್ನು ತ್ವರಿತವಾಗಿ ಆಯ್ಕೆಮಾಡಿ',
  },
  ml: {
    // Sidebar
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    segregation: 'തരംതിരിക്കൽ',
    split_collect: 'വിഭജിച്ചു ശേഖരിക്കുക',
    goal_target: 'ലക്ഷ്യസ്ഥാനം',
    bills_reminders: 'ബില്ലും ഓർമ്മപ്പെടുത്തലും',
    income_streams: 'വരുമാന സ്രോതസ്സുകൾ',
    wallets: 'വാലറ്റുകൾ',
    contact_us: 'ഞങ്ങളെ ബന്ധപ്പെടുക',
    contact: 'ബന്ധപ്പെടുക',
    settings: 'ക്രമീകരണങ്ങൾ',

    // Dashboard KPIs
    total_income: 'ആകെ വരുമാനം',
    total_expenses: 'ആകെ ചെലവുകൾ',
    monthly_savings: 'പ്രതിമാസ സമ്പാദ്യം',
    net_worth: 'അറ്റമൂല്യം',

    // Actions
    add: 'ചേർക്കുക',
    edit: 'തിരുത്തുക',
    sign_out: 'സൈൻ ഔട്ട്',
    manage_account: 'അക്കൗണ്ട് കൈകാര്യം ചെയ്യുക',
    delete: 'ഇല്ലാതാക്കുക',
    save_changes: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
    cancel: 'റദ്ദാക്കുക',

    // Headers & Sections
    sync_ledger: 'ലെഡ്ജർ സമന്വയിപ്പിക്കുക',
    additional_source: 'അധിക ഉറവിടം',
    additional_income: 'അധിക വരുമാനം',
    additional_expense: 'അധിക ചെലവ്',
    fixed_source: 'സ്ഥിര ഉറവിടം',
    fixed_income: 'സ്ഥിര വരുമാനം',
    fixed_expense: 'സ്ഥിര ചെലവ്',
    name: 'പേര്',
    description: 'വിവരണം',
    date: 'തീയതി',
    time: 'സമയം',
    amount: 'തുക',
    actions: 'നടപടികൾ',
    schedule: 'ഷെഡ്യൂൾ',

    // Settings Page
    settings_title: 'ക്രമീകരണങ്ങളും മുൻഗണനകളും',
    settings_desc: 'നിങ്ങളുടെ പ്രൊഫൈൽ, തീം, മാതൃഭാഷ എന്നിവ ക്രമീകരിക്കുക.',
    profile_info: 'പ്രൊഫൈൽ വിവരങ്ങൾ',
    profile_desc: 'നിങ്ങളുടെ ക്രെഡൻഷ്യലുകളും അക്കൗണ്ടും കാണുക, അപ്ഡേറ്റ് ചെയ്യുക',
    edit_profile: 'പ്രൊഫൈൽ തിരുത്തുക',
    full_name: 'പൂർണ്ണ നാമം',
    age: 'വയസ്സ്',
    email: 'ജിമെയിൽ / ഇമെയിൽ',
    password: 'പാസ്‌വേഡ്',
    theme_preference: 'തീം മുൻഗണന',
    theme_desc: 'ലൈറ്റ് മോഡിനും ഡാർക്ക് മോഡിനും ഇടയിൽ മാറുക',
    light_mode: 'ലൈറ്റ് മോഡ്',
    dark_mode: 'ഡാർക്ക് മോഡ്',
    language_selector: 'ഭാഷാ തിരഞ്ഞെടുക്കൽ (മാതൃഭാഷ പിന്തുണ)',
    language_desc: 'നിങ്ങളുടെ മാതൃഭാഷ തിരഞ്ഞെടുക്കുക',
    localized_greeting: 'പ്രാദേശിക ആശംസകൾ',
    quick_select_lang: 'മാതൃഭാഷ വേഗത്തിൽ തിരഞ്ഞെടുക്കുക',
  },
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: LANGUAGES,
  translations: TRANSLATIONS,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem('sts_language');
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch (e) {
      console.warn(e);
    }
    return 'en';
  });

  const setLanguage = (langCode) => {
    if (!TRANSLATIONS[langCode]) return;
    setLanguageState(langCode);
    try {
      localStorage.setItem('sts_language', langCode);
    } catch (e) {
      console.warn(e);
    }
  };

  const t = (key, fallback = '') => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  const activeLangDetails = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGES,
        translations: TRANSLATIONS,
        activeLangDetails,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback) => fallback || key,
      languages: LANGUAGES,
      translations: TRANSLATIONS,
      activeLangDetails: LANGUAGES[0],
    };
  }
  return context;
}

export default LanguageContext;
