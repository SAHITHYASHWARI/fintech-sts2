import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Globe,
  Camera,
  Trash2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  Calendar,
  Check,
} from 'lucide-react';

// Self-contained supported languages for mother tongue localization
const LANGUAGES = [
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

// Self-contained translations dictionary (completely decoupled from any external context provider)
const TRANSLATIONS = {
  en: {
    profile_info: 'Profile Information',
    profile_desc: 'View and update your personal credentials and ledger account',
    edit_profile: 'Edit Profile',
    full_name: 'Full Name',
    age: 'Age',
    email: 'Gmail / Email',
    password: 'Password',
    cancel: 'Cancel',
    save_changes: 'Save Changes',
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
    profile_info: 'சுயவிவர தகவல்',
    profile_desc: 'உங்கள் தனிப்பட்ட சான்றுகள் மற்றும் கணக்கு தகவல்களைப் பார்க்கவும் திருத்தவும்',
    edit_profile: 'சுயவிவரத்தை திருத்து',
    full_name: 'முழு பெயர்',
    age: 'வயது',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    cancel: 'ரத்து செய்',
    save_changes: 'மாற்றங்களைச் சேமி',
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
    profile_info: 'प्रोफ़ाइल जानकारी',
    profile_desc: 'अपने व्यक्तिगत क्रेडेंशियल्स और लेज़र खाते को देखें और अपडेट करें',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    full_name: 'पूरा नाम',
    age: 'उम्र',
    email: 'जीमेल / ईमेल',
    password: 'पासवर्ड',
    cancel: 'रद्द करें',
    save_changes: 'परिवर्तन सहेजें',
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
    profile_info: 'ప్రొఫైల్ సమాచారం',
    profile_desc: 'మీ వ్యక్తిగత ఆధారాలు మరియు ఖాతాను వీక్షించండి మరియు నవీకరించండి',
    edit_profile: 'ప్రొఫైల్‌ను సవరించండి',
    full_name: 'పూర్తి పేరు',
    age: 'వయస్సు',
    email: 'జీమెయిల్ / ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    cancel: 'రద్దు చేయి',
    save_changes: 'మార్పులను సేవ్ చేయండి',
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
    profile_info: 'ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ',
    profile_desc: 'ನಿಮ್ಮ ವಿವರಗಳು ಮತ್ತು ಖಾತೆಯನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನವೀಕರಿಸಿ',
    edit_profile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
    full_name: 'ಪೂರ್ಣ ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    email: 'ಜಿಮೇಲ್ / ಇಮೇಲ್',
    password: 'ಪಾಸ್ವರ್ಡ್',
    cancel: 'ರದ್ದುಮಾಡಿ',
    save_changes: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
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
    profile_info: 'പ്രൊഫൈൽ വിവരങ്ങൾ',
    profile_desc: 'നിങ്ങളുടെ ക്രെഡൻഷ്യലുകളും അക്കൗണ്ടും കാണുക, അപ്ഡേറ്റ് ചെയ്യുക',
    edit_profile: 'പ്രൊഫൈൽ തിരുത്തുക',
    full_name: 'പൂർണ്ണ നാമം',
    age: 'വയസ്സ്',
    email: 'ജിമെയിൽ / ഇമെയിൽ',
    password: 'പാസ്‌വേഡ്',
    cancel: 'റദ്ദാക്കുക',
    save_changes: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
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

export default function Settings({ currentUser, setCurrentUser }) {
  // ---------------------------------------------------------------------------
  // 1. Language State: Clean LocalStorage Reader (Default 'en')
  // ---------------------------------------------------------------------------
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const stored = localStorage.getItem('sts_language');
      if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
    } catch (err) {
      console.warn('LocalStorage language read error:', err);
    }
    return 'en';
  });
  const [languageSuccessMsg, setLanguageSuccessMsg] = useState(null);

  // Sync language with external events if changed outside this component
  useEffect(() => {
    const syncLanguage = () => {
      try {
        const stored = localStorage.getItem('sts_language');
        if (stored && LANGUAGES.some((l) => l.code === stored)) {
          setCurrentLanguage(stored);
        }
      } catch (err) {
        console.warn(err);
      }
    };
    window.addEventListener('sts_language_changed', syncLanguage);
    window.addEventListener('storage', syncLanguage);
    return () => {
      window.removeEventListener('sts_language_changed', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    try {
      localStorage.setItem('sts_language', langCode);
    } catch (err) {
      console.warn('LocalStorage language save error:', err);
    }
    window.dispatchEvent(new Event('sts_language_changed'));

    const selected = LANGUAGES.find((l) => l.code === langCode);
    const label = selected ? `${selected.native} (${selected.label})` : langCode;
    setLanguageSuccessMsg(`Language preference set to ${label}. Application localized.`);
    setTimeout(() => setLanguageSuccessMsg(null), 3500);
  };

  const t = (key, fallback = '') => {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    if (dict && dict[key]) return dict[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  };

  const activeLangObj =
    LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  // ---------------------------------------------------------------------------
  // 2. Theme State: Clean LocalStorage Reader (Default 'dark')
  // ---------------------------------------------------------------------------
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme') || localStorage.getItem('sts_theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });
  const [themeSuccessMsg, setThemeSuccessMsg] = useState(null);

  const applyTheme = (newTheme) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
      localStorage.setItem('sts_theme', newTheme);
    } catch (err) {
      console.warn('LocalStorage theme error:', err);
    }

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    setThemeSuccessMsg(
      `Theme switched to ${newTheme === 'dark' ? 'Dark Mode (🌙)' : 'Light Mode (☀️)'}`
    );
    setTimeout(() => setThemeSuccessMsg(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // 3. Profile Information State (CRUD / Editable Form)
  // ---------------------------------------------------------------------------
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileErrorMsg, setProfileErrorMsg] = useState(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);

  const [profileFormData, setProfileFormData] = useState(() => {
    try {
      const stored = localStorage.getItem('sts_user');
      const parsed = stored ? JSON.parse(stored) : null;
      return {
        name: currentUser?.name || parsed?.name || 'Santhosh Kumar',
        age: currentUser?.age || parsed?.age || 28,
        email: currentUser?.email || parsed?.email || 'santhosh.stsfintech@gmail.com',
        password: currentUser?.password || parsed?.password || 'StsSecure#2026',
      };
    } catch {
      return {
        name: currentUser?.name || 'Santhosh Kumar',
        age: currentUser?.age || 28,
        email: currentUser?.email || 'santhosh.stsfintech@gmail.com',
        password: currentUser?.password || 'StsSecure#2026',
      };
    }
  });

  // Avatar state with localStorage & cross-component sync
  const [userAvatar, setUserAvatar] = useState(() => {
    try {
      return localStorage.getItem('sts_user_avatar') || currentUser?.avatar || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAvatarSync = () => {
      try {
        const stored = localStorage.getItem('sts_user_avatar') || currentUser?.avatar || null;
        setUserAvatar(stored);
      } catch (err) {
        console.warn(err);
      }
    };
    handleAvatarSync();
    window.addEventListener('sts_avatar_changed', handleAvatarSync);
    window.addEventListener('storage', handleAvatarSync);
    return () => {
      window.removeEventListener('sts_avatar_changed', handleAvatarSync);
      window.removeEventListener('storage', handleAvatarSync);
    };
  }, [currentUser]);

  // Sync form data if currentUser prop updates
  useEffect(() => {
    if (currentUser) {
      setProfileFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        age: currentUser.age !== undefined ? currentUser.age : prev.age,
        password: currentUser.password || prev.password,
      }));
    }
  }, [currentUser]);

  // Dynamic initials calculation fallback (e.g., "SA")
  const userInitials = useMemo(() => {
    const name = profileFormData?.name || currentUser?.name;
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return 'SA';
  }, [profileFormData?.name, currentUser?.name]);

  // Avatar Upload Handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setUserAvatar(dataUrl);
      try {
        localStorage.setItem('sts_user_avatar', dataUrl);
        const storedUser = localStorage.getItem('sts_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.avatar = dataUrl;
          localStorage.setItem('sts_user', JSON.stringify(parsed));
        }
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      if (setCurrentUser) {
        setCurrentUser((prev) => ({ ...(prev || {}), avatar: dataUrl }));
      }

      window.dispatchEvent(new Event('sts_avatar_changed'));
      setProfileSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  // Avatar Remove Handler
  const handleRemoveAvatar = () => {
    setUserAvatar(null);
    try {
      localStorage.removeItem('sts_user_avatar');
      const storedUser = localStorage.getItem('sts_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        delete parsed.avatar;
        localStorage.setItem('sts_user', JSON.stringify(parsed));
      }
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    if (setCurrentUser) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const copy = { ...prev };
        delete copy.avatar;
        return copy;
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    window.dispatchEvent(new Event('sts_avatar_changed'));
    setProfileSuccessMsg('Profile picture removed. Reverted to initials (SA).');
    setTimeout(() => setProfileSuccessMsg(null), 3500);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    const cleanName = profileFormData.name.trim();
    const cleanEmail = profileFormData.email.trim();
    const cleanAge = parseInt(profileFormData.age, 10);
    const cleanPassword = profileFormData.password;

    if (!cleanName) {
      setProfileErrorMsg('Full name cannot be blank.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setProfileErrorMsg('Please provide a valid email address.');
      return;
    }
    if (isNaN(cleanAge) || cleanAge < 1 || cleanAge > 120) {
      setProfileErrorMsg('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      setProfileErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    const updatedUser = {
      ...(currentUser || {}),
      name: cleanName,
      email: cleanEmail,
      age: cleanAge,
      password: cleanPassword,
      avatar: userAvatar || undefined,
    };

    try {
      localStorage.setItem('sts_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }

    if (setCurrentUser) {
      setCurrentUser(updatedUser);
    }

    setIsEditingProfile(false);
    setProfileSuccessMsg('Profile updated successfully! All credentials saved.');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  const handleCancelProfile = () => {
    setProfileFormData({
      name: currentUser?.name || 'Santhosh Kumar',
      age: currentUser?.age || 28,
      email: currentUser?.email || 'santhosh.stsfintech@gmail.com',
      password: currentUser?.password || 'StsSecure#2026',
    });
    setProfileErrorMsg(null);
    setIsEditingProfile(false);
  };

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-50 dark:bg-[#070b14] space-y-8 animate-fadeIn pb-12">
      {/* Page Header: Logo Icon + SETTING */}
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6 text-slate-800 dark:text-white" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          SETTING
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: PROFILE INFORMATION (CRUD / EDITABLE FORM)                    */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('profile_info', 'Profile Information')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('profile_desc', 'View and update your personal credentials and ledger account')}
              </p>
            </div>
          </div>

          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('edit_profile', 'Edit Profile')}</span>
            </button>
          )}
        </div>

        {/* Success Alert */}
        {profileSuccessMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {profileErrorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{profileErrorMsg}</span>
          </div>
        )}

        {/* Profile Picture Management (Avatar CRUD Section) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-xl bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-800/80 mb-6 transition">
          <div className="flex items-center space-x-4">
            {/* Display: Uploaded Avatar or Default Initials Circle (SA) */}
            <div className="relative flex-shrink-0">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={profileFormData.name || 'User Avatar'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-md flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-[#090d16] flex items-center justify-center font-black text-lg text-emerald-400">
                    {userInitials}
                  </div>
                </div>
              )}
              {userAvatar && (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1322]" />
              )}
            </div>

            {/* Identity Info */}
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {profileFormData.name}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Account Owner
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {profileFormData.email}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                PNG, JPG or WEBP • Crisp circular avatar
              </p>
            </div>
          </div>

          {/* Avatar Actions (CRUD) */}
          <div className="flex items-center space-x-2.5 self-start sm:self-center">
            {/* Hidden File Picker */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {/* Upload / Change Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
              title="Upload or change profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{userAvatar ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {/* Remove Photo Button */}
            {userAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 font-semibold text-xs transition active:scale-95 cursor-pointer"
                title="Remove photo and revert to initials"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        {/* Editable Form vs View Mode */}
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t('full_name', 'Full Name')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={profileFormData.name}
                    onChange={handleProfileChange}
                    placeholder="e.g. Santhosh Kumar"
                    className="w-full bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white dark:focus:bg-[#080d18] transition"
                  />
                </div>
              </div>

              {/* Age Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t('age', 'Age')} (Years)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    required
                    value={profileFormData.age}
                    onChange={handleProfileChange}
                    placeholder="e.g. 28"
                    className="w-full bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white dark:focus:bg-[#080d18] transition"
                  />
                </div>
              </div>

              {/* Email / Gmail Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t('email', 'Gmail / Work Email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={profileFormData.email}
                    onChange={handleProfileChange}
                    placeholder="e.g. santhosh.stsfintech@gmail.com"
                    className="w-full bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white dark:focus:bg-[#080d18] transition"
                  />
                </div>
              </div>

              {/* Password Input with show/hide toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t('password', 'Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={profileFormData.password}
                    onChange={handleProfileChange}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white dark:focus:bg-[#080d18] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCancelProfile}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('save_changes', 'Save Changes')}</span>
              </button>
            </div>
          </form>
        ) : (
          /* View Mode Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Name */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('full_name', 'Full Name')}</span>
              </p>
              <div className="flex items-center space-x-2.5 mt-1">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={profileFormData.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {userInitials}
                  </div>
                )}
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {profileFormData.name}
                </p>
              </div>
              <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                Account Owner
              </span>
            </div>

            {/* 2. Age */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{t('age', 'Age')}</span>
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profileFormData.age} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">years</span>
              </p>
              <span className="inline-block mt-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                Verified Identity
              </span>
            </div>

            {/* 3. Email */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t('email', 'Gmail / Email')}</span>
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={profileFormData.email}>
                {profileFormData.email}
              </p>
              <span className="inline-block mt-2 text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
                Primary Auth
              </span>
            </div>

            {/* 4. Password */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t('password', 'Password')}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition flex items-center gap-1 font-medium cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                {showPassword ? profileFormData.password : '••••••••••••'}
              </p>
              <span className="inline-block mt-2 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                256-Bit Encrypted
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION B: THEME PREFERENCE (FUNCTIONAL DARK / LIGHT MODE)                */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {currentTheme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('theme_preference', 'Theme Preference')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('theme_desc', 'Toggle dynamically between clean light canvas and dark obsidian mode')}
              </p>
            </div>
          </div>

          {/* Segmented Pill Toggle */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-[#080d18] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => applyTheme('light')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentTheme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('light_mode', 'Light Mode')}</span>
            </button>
            <button
              type="button"
              onClick={() => applyTheme('dark')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentTheme === 'dark'
                  ? 'bg-[#0f172a] text-white shadow-sm border border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('dark_mode', 'Dark Mode')}</span>
            </button>
          </div>
        </div>

        {/* Theme Status Alert */}
        {themeSuccessMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{themeSuccessMsg}</span>
          </div>
        )}

        {/* Radio Cards for Themes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Light Mode Card */}
          <div
            onClick={() => applyTheme('light')}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              currentTheme === 'light'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/10 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#080d18] hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    ☀️ {t('light_mode', 'Light Mode')}
                    {currentTheme === 'light' && (
                      <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Daylight high-contrast canvas</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  currentTheme === 'light'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {currentTheme === 'light' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
              Crisp white cards, sharp contrast typography, and vibrant emerald accents. Recommended for daytime audits and clean printing.
            </p>
          </div>

          {/* Dark Mode Card */}
          <div
            onClick={() => applyTheme('dark')}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              currentTheme === 'dark'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/10 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#080d18] hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center shadow-inner">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    🌙 {t('dark_mode', 'Dark Mode')}
                    {currentTheme === 'dark' && (
                      <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Obsidian OLED & slate surfaces</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  currentTheme === 'dark'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {currentTheme === 'dark' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
              Deep slate backgrounds, reduced eye fatigue, glowing financial numbers, and optimized power consumption for OLED displays.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION C: LANGUAGE SELECTOR (MOTHER TONGUE SUPPORT)                      */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('language_selector', 'Language Selector (Mother Tongue Support)')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('language_desc', 'Choose your mother tongue language for native script recognition and localization')}
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 flex items-center space-x-1.5">
            <span>Current:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {activeLangObj.native} ({activeLangObj.label})
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {languageSuccessMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <span>{languageSuccessMsg}</span>
          </div>
        )}

        {/* Native Greeting Display Card */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-50/70 dark:from-cyan-950/30 via-emerald-50/50 dark:via-emerald-950/20 to-slate-50 dark:to-slate-900 border border-cyan-200/60 dark:border-cyan-800/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              {t('localized_greeting', 'Localized Greeting')}
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {activeLangObj.greeting}
            </p>
          </div>
          <span className="text-2xl" role="img" aria-label="region flag">
            {activeLangObj.flag}
          </span>
        </div>

        {/* Dropdown Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
            Select Language Dropdown
          </label>
          <div className="relative max-w-md">
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080d18] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white dark:focus:bg-[#080d18] transition cursor-pointer appearance-none pr-10"
            >
              {LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-white dark:bg-[#0d1322] text-slate-900 dark:text-slate-100"
                >
                  {lang.native} — {lang.label} ({lang.subtitle})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Interactive Language Badges / Quick Cards */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2.5">
            {t('quick_select_lang', 'Quick Select Mother Tongue')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d18] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{lang.flag}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{lang.native}</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{lang.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
