/**
 * i18n Module for Rodistaa Mobile Apps
 * Provides hooks for internationalization (English default, Telugu & Hindi support)
 */

export type Language = 'en' | 'te' | 'hi';

export const defaultLanguage: Language = 'en';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.continue': 'Continue',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.phoneNumber': 'Mobile Number',
    'auth.enterPhone': 'Enter 10-digit mobile number',
    'auth.requestOTP': 'Request OTP',
    'auth.enterOTP': 'Enter OTP',
    'auth.verifyOTP': 'Verify & Login',
    'auth.otpSent': 'OTP sent to',
    
    // Navigation
    'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    
    // Errors
    'error.network': 'Network error. Please check your connection.',
    'error.unauthorized': 'Please login to continue',
    'error.notFound': 'Not found',
    'error.serverError': 'Server error. Please try again later.',
  },
  te: {
    // Telugu translations (placeholder - same keys)
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'దోషం',
    'common.retry': 'మళ్లీ ప్రయత్నించండి',
    'common.cancel': 'రద్దు చేయి',
    'common.confirm': 'ధృవీకరించండి',
    'common.save': 'సేవ్ చేయి',
    'common.delete': 'తొలగించండి',
    'common.edit': 'సవరించండి',
    'common.back': 'వెనక్కి',
    'common.next': 'తర్వాత',
    'common.submit': 'సమర్పించండి',
    'common.continue': 'కొనసాగించండి',
    'auth.login': 'లాగిన్',
    'auth.logout': 'లాగ్అవుట్',
    'auth.phoneNumber': 'మొబైల్ నంబర్',
    'auth.enterPhone': '10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి',
    'auth.requestOTP': 'OTP అభ్యర్థించండి',
    'auth.enterOTP': 'OTP నమోదు చేయండి',
    'auth.verifyOTP': 'ధృవీకరించి లాగిన్ చేయండి',
    'auth.otpSent': 'OTP పంపబడింది',
  },
  hi: {
    // Hindi translations (placeholder - same keys)
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.retry': 'पुनः प्रयास करें',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.submit': 'जमा करें',
    'common.continue': 'जारी रखें',
    'auth.login': 'लॉगिन',
    'auth.logout': 'लॉगआउट',
    'auth.phoneNumber': 'मोबाइल नंबर',
    'auth.enterPhone': '10 अंकों का मोबाइल नंबर दर्ज करें',
    'auth.requestOTP': 'OTP अनुरोध करें',
    'auth.enterOTP': 'OTP दर्ज करें',
    'auth.verifyOTP': 'सत्यापित करें और लॉगिन करें',
    'auth.otpSent': 'OTP भेजा गया',
  },
};

let currentLanguage: Language = defaultLanguage;

export const i18n = {
  setLanguage: (lang: Language) => {
    currentLanguage = lang;
  },
  
  getLanguage: (): Language => {
    return currentLanguage;
  },
  
  t: (key: string, params?: Record<string, string>): string => {
    const translation = translations[currentLanguage]?.[key] || translations[defaultLanguage]?.[key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{${paramKey}}`, paramValue),
        translation
      );
    }
    
    return translation;
  },
};

// React hook for translations
export const useTranslation = () => {
  return {
    t: i18n.t,
    language: currentLanguage,
    setLanguage: i18n.setLanguage,
  };
};
