import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

const translations = {
  // ==========================================
  // ENGLISH
  // ==========================================
  en: {
    navbar: {
      home: "Home",
      bookYourStall: "Book Your Stall",
      about: "About",
      selectLanguage: "Select Language",
    },

    hero: {
      kicker: "WHERE IDEAS MEET OPPORTUNITY",
      tag: "YOUR EVENT. YOUR BUSINESS. YOUR MOMENT.",
      title1: "Find Your",
      title2: "Perfect",
      title3: "Event Space.",
      description:
        "Discover exciting events, connect with your audience and find the perfect space to grow your business.",
      explore: "Explore Events",
      vendor: "Become a Vendor",
      liveIt: "Make it happen.",
      goodTimes: "Good things start here.",
      floatingLabel: "Discover opportunities",
    },

    explore: "Explore Events",
    how: "How It Works",
    organisers: "For Organisers",
    vendors: "For Vendors",
    pricing: "Pricing",

    award: "A marketplace made for experiences.",
    marketplace: "Discover. Connect. Grow.",

    heading1: "Find the perfect",
    heading2: "space for your business.",

    description: "Discover events and book stalls with ease.",

    exploreButton: "Explore Events",
    howButton: "How It Works",

    community: "Join our growing community",
    growing: "Opportunities are waiting for you.",

    organiserTitle: "For Event Organisers",
    vendorTitle: "For Vendors",

    multipleEvents: "Discover Multiple Events",
    availability: "Real-Time Stall Availability",
    payments: "Easy Booking Process",
    business: "Grow Your Business",

    common: {
      learnMore: "Learn More",
      explore: "Explore",
      viewAll: "View All",
      readMore: "Read More",
      getStarted: "Get Started",
      contactUs: "Contact Us",
      loading: "Loading...",
      close: "Close",
      cancel: "Cancel",
      submit: "Submit",
      search: "Search",
      back: "Go Back",
    },

    footer: {
      description:
        "Discover exciting events, find your perfect stall and turn opportunities into experiences with STALLORA.",

      explore: "Explore",
      home: "Home",
      exploreEvents: "Explore Events",
      about: "About Us",
      howItWorks: "How It Works",

      getStarted: "Get Started",
      bookYourStall: "Book Your Stall",
      organisers: "For Organisers",
      vendors: "For Vendors",
      pricing: "Pricing",

      support: "Support",
      contact: "Contact Us",
      faqs: "FAQs",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",

      copyright: "All rights reserved.",
      tagline: "Discover. Connect. Grow.",
      follow: "Follow Us",
    },

    vendorsPage: {
      eyebrow: "YOUR NEXT BIG OPPORTUNITY",
      title1: "Find Your",
      title2: "Next",
      title3: "Big Opportunity.",
      description:
        "Discover exciting events, meet new customers and find the perfect place to showcase your brand.",
      heroNote: "Your next opportunity starts here.",

      sticker1: "Discover",
      sticker2: "Connect",
      sticker3: "Grow",

      imageCaption: "Where businesses meet experiences.",

      mumbai: "Mumbai",
      allCities: "All Cities",

      allDates: "All Dates",
      december: "December",
      january: "January",

      allCategories: "All Categories",

      searchPlaceholder: "Search events, venues or organisers...",
      search: "Search",

      sectionLabel: "THE EVENT LINEUP",
      upcomingEvents: "Explore Upcoming Events",
      sectionDescription:
        "Find events that match your brand and discover spaces where your business can shine.",

      sortBy: "Sort By",
      soonest: "Soonest First",
      latest: "Latest First",
      eventName: "Event Name",

      stallsOpen: "Stalls Open",
      fewStallsLeft: "Few Stalls Left",

      viewMore: "View Details",
      by: "Organised by",

      noEvents: "No events found",
      noEventsDescription:
        "Try changing your search or filters to discover more events.",

      clearFilters: "Clear Filters",

      removeFavorite: "Remove from favourites",
      saveEvent: "Save event",

      pagination: "Page",
    },
  },

  // ==========================================
  // HINDI
  // ==========================================
  hi: {
    navbar: {
      home: "होम",
      bookYourStall: "अपना स्टॉल बुक करें",
      about: "हमारे बारे में",
      selectLanguage: "भाषा चुनें",
    },

    hero: {
      kicker: "जहाँ विचारों को अवसर मिलते हैं",
      tag: "आपका कार्यक्रम। आपका व्यवसाय। आपका अवसर।",
      title1: "अपनी",
      title2: "परफेक्ट",
      title3: "जगह खोजें।",
      description:
        "रोमांचक कार्यक्रम खोजें, अपने ग्राहकों से जुड़ें और अपने व्यवसाय को आगे बढ़ाने के लिए सही जगह चुनें।",
      explore: "कार्यक्रम देखें",
      vendor: "विक्रेता बनें",
      liveIt: "अपने सपनों को साकार करें।",
      goodTimes: "अच्छी शुरुआत यहीं से होती है।",
      floatingLabel: "नए अवसर खोजें",
    },

    explore: "कार्यक्रम देखें",
    how: "यह कैसे काम करता है",
    organisers: "आयोजकों के लिए",
    vendors: "विक्रेताओं के लिए",
    pricing: "कीमतें",

    award: "अनुभवों के लिए बनाया गया मार्केटप्लेस।",
    marketplace: "खोजें। जुड़ें। आगे बढ़ें।",

    heading1: "अपने व्यवसाय के लिए",
    heading2: "सही जगह खोजें।",

    description: "आसानी से कार्यक्रम खोजें और स्टॉल बुक करें।",

    exploreButton: "कार्यक्रम देखें",
    howButton: "यह कैसे काम करता है",

    community: "हमारे बढ़ते समुदाय से जुड़ें",
    growing: "आपके लिए नए अवसर इंतज़ार कर रहे हैं।",

    organiserTitle: "कार्यक्रम आयोजकों के लिए",
    vendorTitle: "विक्रेताओं के लिए",

    multipleEvents: "कई कार्यक्रम खोजें",
    availability: "स्टॉल की उपलब्धता देखें",
    payments: "आसान बुकिंग प्रक्रिया",
    business: "अपने व्यवसाय को बढ़ाएँ",

    common: {
      learnMore: "और जानें",
      explore: "देखें",
      viewAll: "सभी देखें",
      readMore: "और पढ़ें",
      getStarted: "शुरू करें",
      contactUs: "हमसे संपर्क करें",
      loading: "लोड हो रहा है...",
      close: "बंद करें",
      cancel: "रद्द करें",
      submit: "जमा करें",
      search: "खोजें",
      back: "वापस जाएँ",
    },

    footer: {
      description:
        "STALLORA के साथ रोमांचक कार्यक्रम खोजें, अपना सही स्टॉल चुनें और नए अवसरों को अनुभवों में बदलें।",

      explore: "एक्सप्लोर करें",
      home: "होम",
      exploreEvents: "कार्यक्रम देखें",
      about: "हमारे बारे में",
      howItWorks: "यह कैसे काम करता है",

      getStarted: "शुरुआत करें",
      bookYourStall: "अपना स्टॉल बुक करें",
      organisers: "आयोजकों के लिए",
      vendors: "विक्रेताओं के लिए",
      pricing: "कीमतें",

      support: "सहायता",
      contact: "संपर्क करें",
      faqs: "अक्सर पूछे जाने वाले प्रश्न",
      privacy: "गोपनीयता नीति",
      terms: "नियम और शर्तें",

      copyright: "सर्वाधिकार सुरक्षित।",
      tagline: "खोजें। जुड़ें। आगे बढ़ें।",
      follow: "हमें फॉलो करें",
    },

    vendorsPage: {
      eyebrow: "आपका अगला बड़ा अवसर",
      title1: "अपना",
      title2: "अगला",
      title3: "बड़ा अवसर खोजें।",
      description:
        "रोमांचक कार्यक्रम खोजें, नए ग्राहकों से मिलें और अपने ब्रांड को दिखाने के लिए सही जगह चुनें।",
      heroNote: "आपका अगला अवसर यहीं से शुरू होता है।",

      sticker1: "खोजें",
      sticker2: "जुड़ें",
      sticker3: "आगे बढ़ें",

      imageCaption: "जहाँ व्यवसाय और अनुभव मिलते हैं।",

      mumbai: "मुंबई",
      allCities: "सभी शहर",

      allDates: "सभी तारीखें",
      december: "दिसंबर",
      january: "जनवरी",

      allCategories: "सभी श्रेणियाँ",

      searchPlaceholder: "कार्यक्रम, स्थान या आयोजक खोजें...",
      search: "खोजें",

      sectionLabel: "कार्यक्रमों की सूची",
      upcomingEvents: "आगामी कार्यक्रम देखें",
      sectionDescription:
        "अपने ब्रांड के लिए सही कार्यक्रम खोजें और अपने व्यवसाय को आगे बढ़ाने के अवसर पाएँ।",

      sortBy: "क्रमबद्ध करें",
      soonest: "जल्द आने वाले पहले",
      latest: "नवीनतम पहले",
      eventName: "कार्यक्रम का नाम",

      stallsOpen: "स्टॉल उपलब्ध",
      fewStallsLeft: "कुछ स्टॉल बाकी",

      viewMore: "जानकारी देखें",
      by: "आयोजक",

      noEvents: "कोई कार्यक्रम नहीं मिला",
      noEventsDescription:
        "और कार्यक्रम खोजने के लिए अपनी खोज या फ़िल्टर बदलें।",

      clearFilters: "फ़िल्टर हटाएँ",

      removeFavorite: "पसंदीदा से हटाएँ",
      saveEvent: "कार्यक्रम सेव करें",

      pagination: "पेज",
    },
  },

  // ==========================================
  // MARATHI
  // ==========================================
  mr: {
    navbar: {
      home: "मुख्यपृष्ठ",
      bookYourStall: "तुमचा स्टॉल बुक करा",
      about: "आमच्याबद्दल",
      selectLanguage: "भाषा निवडा",
    },

    hero: {
      kicker: "जिथे कल्पनांना संधी मिळते",
      tag: "तुमचा कार्यक्रम. तुमचा व्यवसाय. तुमची संधी.",
      title1: "तुमची",
      title2: "परिपूर्ण",
      title3: "जागा शोधा.",
      description:
        "रोमांचक कार्यक्रम शोधा, नवीन ग्राहकांशी जोडा आणि तुमच्या व्यवसायाच्या वाढीसाठी योग्य जागा निवडा.",
      explore: "कार्यक्रम पाहा",
      vendor: "विक्रेता बना",
      liveIt: "तुमची स्वप्ने साकार करा.",
      goodTimes: "चांगल्या गोष्टींची सुरुवात इथून होते.",
      floatingLabel: "नवीन संधी शोधा",
    },

    explore: "कार्यक्रम पाहा",
    how: "हे कसे कार्य करते",
    organisers: "आयोजकांसाठी",
    vendors: "विक्रेत्यांसाठी",
    pricing: "किंमत",

    award: "अनुभवांसाठी तयार केलेले मार्केटप्लेस.",
    marketplace: "शोधा. जोडा. प्रगती करा.",

    heading1: "तुमच्या व्यवसायासाठी",
    heading2: "योग्य जागा शोधा.",

    description: "सहजपणे कार्यक्रम शोधा आणि स्टॉल बुक करा.",

    exploreButton: "कार्यक्रम पाहा",
    howButton: "हे कसे कार्य करते",

    community: "आमच्या वाढत्या समुदायात सामील व्हा",
    growing: "तुमच्यासाठी नवीन संधी वाट पाहत आहेत.",

    organiserTitle: "कार्यक्रम आयोजकांसाठी",
    vendorTitle: "विक्रेत्यांसाठी",

    multipleEvents: "अनेक कार्यक्रम शोधा",
    availability: "स्टॉलची उपलब्धता पाहा",
    payments: "सोपी बुकिंग प्रक्रिया",
    business: "तुमच्या व्यवसायाची वाढ करा",

    common: {
      learnMore: "अधिक जाणून घ्या",
      explore: "पाहा",
      viewAll: "सर्व पाहा",
      readMore: "अधिक वाचा",
      getStarted: "सुरुवात करा",
      contactUs: "आमच्याशी संपर्क साधा",
      loading: "लोड होत आहे...",
      close: "बंद करा",
      cancel: "रद्द करा",
      submit: "सबमिट करा",
      search: "शोधा",
      back: "मागे जा",
    },

    footer: {
      description:
        "STALLORA सोबत रोमांचक कार्यक्रम शोधा, तुमचा योग्य स्टॉल निवडा आणि नवीन संधींचे अनुभवात रूपांतर करा.",

      explore: "एक्सप्लोर करा",
      home: "मुख्यपृष्ठ",
      exploreEvents: "कार्यक्रम पाहा",
      about: "आमच्याबद्दल",
      howItWorks: "हे कसे कार्य करते",

      getStarted: "सुरुवात करा",
      bookYourStall: "तुमचा स्टॉल बुक करा",
      organisers: "आयोजकांसाठी",
      vendors: "विक्रेत्यांसाठी",
      pricing: "किंमत",

      support: "मदत",
      contact: "संपर्क साधा",
      faqs: "सामान्य प्रश्न",
      privacy: "गोपनीयता धोरण",
      terms: "नियम आणि अटी",

      copyright: "सर्व हक्क राखीव.",
      tagline: "शोधा. जोडा. प्रगती करा.",
      follow: "आम्हाला फॉलो करा",
    },

    vendorsPage: {
      eyebrow: "तुमची पुढील मोठी संधी",
      title1: "तुमची",
      title2: "पुढील",
      title3: "मोठी संधी शोधा.",
      description:
        "रोमांचक कार्यक्रम शोधा, नवीन ग्राहकांना भेटा आणि तुमच्या ब्रँडसाठी योग्य जागा निवडा.",
      heroNote: "तुमची पुढील संधी इथून सुरू होते.",

      sticker1: "शोधा",
      sticker2: "जोडा",
      sticker3: "प्रगती करा",

      imageCaption: "जिथे व्यवसाय आणि अनुभव एकत्र येतात.",

      mumbai: "मुंबई",
      allCities: "सर्व शहरे",

      allDates: "सर्व तारखा",
      december: "डिसेंबर",
      january: "जानेवारी",

      allCategories: "सर्व श्रेणी",

      searchPlaceholder: "कार्यक्रम, ठिकाण किंवा आयोजक शोधा...",
      search: "शोधा",

      sectionLabel: "कार्यक्रमांची यादी",
      upcomingEvents: "आगामी कार्यक्रम पाहा",
      sectionDescription:
        "तुमच्या ब्रँडसाठी योग्य कार्यक्रम शोधा आणि व्यवसाय वाढवण्याच्या संधी मिळवा.",

      sortBy: "क्रमवारी",
      soonest: "लवकर येणारे प्रथम",
      latest: "नवीनतम प्रथम",
      eventName: "कार्यक्रमाचे नाव",

      stallsOpen: "स्टॉल उपलब्ध",
      fewStallsLeft: "काही स्टॉल शिल्लक",

      viewMore: "तपशील पाहा",
      by: "आयोजक",

      noEvents: "कोणतेही कार्यक्रम सापडले नाहीत",
      noEventsDescription:
        "अधिक कार्यक्रम शोधण्यासाठी तुमचा शोध किंवा फिल्टर बदला.",

      clearFilters: "फिल्टर काढा",

      removeFavorite: "आवडत्यांमधून काढा",
      saveEvent: "कार्यक्रम सेव्ह करा",

      pagination: "पृष्ठ",
    },
  },
};

// ==========================================
// LANGUAGE PROVIDER
// ==========================================

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("stallora-language");

    return translations[savedLanguage] ? savedLanguage : "en";
  });

  const changeLanguage = (newLanguage) => {
    if (!translations[newLanguage]) {
      return;
    }

    setLanguage(newLanguage);

    localStorage.setItem("stallora-language", newLanguage);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// ==========================================
// CUSTOM LANGUAGE HOOK
// ==========================================

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}

export default LanguageContext;
