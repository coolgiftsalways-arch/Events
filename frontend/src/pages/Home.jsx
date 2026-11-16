import React, { useState } from "react";

import Hero from "../components/Hero";

import { useLanguage } from "../context/LanguageContext";

import "../css/Home.css";

export default function Home() {
  const { language } = useLanguage();

  const [activeFaq, setActiveFaq] = useState(0);

  const translations = {
    en: {
      eventsTitle: "Discover what's",

      eventsHighlight: "happening.",

      eventsDesc:
        "Explore festivals, exhibitions, markets and experiences happening around you.",

      categories: ["All Events", "Music", "Markets", "Exhibitions"],

      eventButton: "Explore Events",

      howTitle: "Three steps.",

      howHighlight: "Endless possibilities.",

      steps: [
        [
          "01",

          "Discover",

          "Find exciting events and opportunities around you.",
        ],

        [
          "02",

          "Connect",

          "Connect with organisers, vendors and creative people.",
        ],

        [
          "03",

          "Experience",

          "Book your place and create unforgettable memories.",
        ],
      ],

      organiserTag: "FOR EVENT ORGANISERS",

      organiserTitle: "Your event deserves",

      organiserHighlight: "the spotlight.",

      organiserDesc:
        "Promote your events, reach the right audience and manage your event presence with Stallora.",

      organiserPoints: [
        "Publish your events",

        "Reach more people",

        "Manage registrations",

        "Grow your audience",
      ],

      organiserButton: "Start Organising",

      vendorTag: "FOR VENDORS & BRANDS",

      vendorTitle: "Find your space.",

      vendorHighlight: "Grow your brand.",

      vendorDesc:
        "Discover exhibitions, flea markets and pop-up opportunities. Find the perfect space for your brand.",

      vendorPoints: [
        "Discover stall opportunities",

        "Connect with organisers",

        "Explore market events",

        "Grow your business",
      ],

      vendorButton: "Find Opportunities",

      pricingTag: "SIMPLE & TRANSPARENT",

      pricingTitle: "Plans that move",

      pricingHighlight: "you forward.",

      plans: [
        ["Explorer", "Discover events and experiences.", "FREE"],

        ["Organiser", "Bring your events to life.", "CONTACT US"],

        ["Vendor", "Find opportunities for your brand.", "CONTACT US"],
      ],

      faqTitle: "Got questions?",

      faqHighlight: "We've got answers.",

      faqs: [
        [
          "What is Stallora?",

          "Stallora helps people discover events, connect with organisers and find vendor opportunities.",
        ],

        [
          "How can I discover events?",

          "Explore the events section to find festivals, exhibitions, markets and experiences.",
        ],

        [
          "Can I publish my own event?",

          "Yes! Organisers can use Stallora to promote their events.",
        ],

        [
          "How can vendors find stalls?",

          "Vendors can explore available market and exhibition opportunities.",
        ],

        [
          "Which languages does Stallora support?",

          "Stallora supports English, Hindi and Marathi.",
        ],
      ],

      footerDesc:
        "Discover experiences. Connect with people. Make every moment count.",

      quickLinks: "QUICK LINKS",

      support: "SUPPORT",

      copyright: "© 2026 STALLORA. ALL RIGHTS RESERVED.",
    },

    hi: {
      eventsTitle: "खोजें क्या",

      eventsHighlight: "हो रहा है।",

      eventsDesc: "अपने आसपास त्योहार, प्रदर्शनियाँ, बाज़ार और नए अनुभव खोजें।",

      categories: ["सभी कार्यक्रम", "संगीत", "बाज़ार", "प्रदर्शनियाँ"],

      eventButton: "कार्यक्रम देखें",

      howTitle: "तीन कदम।",

      howHighlight: "अनगिनत संभावनाएँ।",

      steps: [
        ["01", "खोजें", "अपने आसपास रोमांचक कार्यक्रम और अवसर खोजें।"],

        ["02", "जुड़ें", "आयोजकों, विक्रेताओं और रचनात्मक लोगों से जुड़ें।"],

        ["03", "अनुभव करें", "अपनी जगह बुक करें और यादगार पल बनाएँ।"],
      ],

      organiserTag: "कार्यक्रम आयोजकों के लिए",

      organiserTitle: "आपका कार्यक्रम",

      organiserHighlight: "चमकने का हकदार है।",

      organiserDesc:
        "अपने कार्यक्रमों का प्रचार करें और सही दर्शकों तक पहुँचें।",

      organiserPoints: [
        "कार्यक्रम प्रकाशित करें",

        "अधिक लोगों तक पहुँचें",

        "रजिस्ट्रेशन प्रबंधित करें",

        "दर्शकों की संख्या बढ़ाएँ",
      ],

      organiserButton: "आयोजन शुरू करें",

      vendorTag: "विक्रेताओं और ब्रांड्स के लिए",

      vendorTitle: "अपनी जगह खोजें।",

      vendorHighlight: "अपना ब्रांड बढ़ाएँ।",

      vendorDesc: "प्रदर्शनियाँ, फ्ली मार्केट और स्टॉल के अवसर खोजें।",

      vendorPoints: [
        "स्टॉल के अवसर खोजें",

        "आयोजकों से जुड़ें",

        "मार्केट कार्यक्रम खोजें",

        "व्यवसाय बढ़ाएँ",
      ],

      vendorButton: "अवसर खोजें",

      pricingTag: "सरल और पारदर्शी",

      pricingTitle: "आपके लिए सही",

      pricingHighlight: "प्लान चुनें।",

      plans: [
        ["एक्सप्लोरर", "कार्यक्रम और अनुभव खोजें।", "मुफ्त"],

        ["आयोजक", "अपने कार्यक्रम शुरू करें।", "संपर्क करें"],

        ["विक्रेता", "अपने ब्रांड के अवसर खोजें।", "संपर्क करें"],
      ],

      faqTitle: "आपके सवाल?",

      faqHighlight: "हमारे पास जवाब हैं।",

      faqs: [
        [
          "Stallora क्या है?",

          "Stallora कार्यक्रमों, आयोजकों और स्टॉल के अवसरों को खोजने का प्लेटफॉर्म है।",
        ],

        [
          "कार्यक्रम कैसे खोजें?",

          "कार्यक्रम सेक्शन में त्योहार, प्रदर्शनियाँ और बाज़ार खोजें।",
        ],

        [
          "क्या मैं अपना कार्यक्रम प्रकाशित कर सकता हूँ?",

          "हाँ, आयोजक अपने कार्यक्रमों का प्रचार कर सकते हैं।",
        ],

        [
          "विक्रेता स्टॉल कैसे खोजें?",

          "विक्रेता उपलब्ध बाज़ार और प्रदर्शनियों के अवसर खोज सकते हैं।",
        ],

        [
          "Stallora किन भाषाओं में उपलब्ध है?",

          "Stallora अंग्रेज़ी, हिंदी और मराठी में उपलब्ध है।",
        ],
      ],

      footerDesc: "नए अनुभव खोजें। लोगों से जुड़ें। हर पल को खास बनाएँ।",

      quickLinks: "महत्वपूर्ण लिंक",

      support: "सहायता",

      copyright: "© 2026 STALLORA. सर्वाधिकार सुरक्षित।",
    },

    mr: {
      eventsTitle: "शोधा काय",

      eventsHighlight: "सुरू आहे.",

      eventsDesc:
        "तुमच्या आजूबाजूचे उत्सव, प्रदर्शने, बाजारपेठा आणि अनुभव शोधा.",

      categories: ["सर्व कार्यक्रम", "संगीत", "बाजार", "प्रदर्शने"],

      eventButton: "कार्यक्रम शोधा",

      howTitle: "तीन पायऱ्या.",

      howHighlight: "असंख्य संधी.",

      steps: [
        ["01", "शोधा", "तुमच्या आजूबाजूचे कार्यक्रम आणि संधी शोधा."],

        ["02", "जोडले जा", "आयोजक आणि विक्रेत्यांशी संपर्क साधा."],

        ["03", "अनुभव घ्या", "तुमची जागा बुक करा आणि आठवणी तयार करा."],
      ],

      organiserTag: "कार्यक्रम आयोजकांसाठी",

      organiserTitle: "तुमचा कार्यक्रम",

      organiserHighlight: "सर्वांसमोर आणा.",

      organiserDesc:
        "तुमच्या कार्यक्रमांचा प्रचार करा आणि अधिक लोकांपर्यंत पोहोचा.",

      organiserPoints: [
        "कार्यक्रम प्रकाशित करा",

        "अधिक लोकांपर्यंत पोहोचा",

        "नोंदणी व्यवस्थापित करा",

        "प्रसिद्धी वाढवा",
      ],

      organiserButton: "आयोजन सुरू करा",

      vendorTag: "विक्रेते आणि ब्रँड्ससाठी",

      vendorTitle: "तुमची जागा शोधा.",

      vendorHighlight: "तुमचा ब्रँड वाढवा.",

      vendorDesc: "प्रदर्शने, फ्ली मार्केट आणि स्टॉलच्या संधी शोधा.",

      vendorPoints: [
        "स्टॉलच्या संधी शोधा",

        "आयोजकांशी संपर्क साधा",

        "मार्केट कार्यक्रम शोधा",

        "व्यवसाय वाढवा",
      ],

      vendorButton: "संधी शोधा",

      pricingTag: "सोपे आणि पारदर्शक",

      pricingTitle: "तुमच्यासाठी योग्य",

      pricingHighlight: "योजना निवडा.",

      plans: [
        ["एक्सप्लोरर", "कार्यक्रम आणि अनुभव शोधा.", "मोफत"],

        ["आयोजक", "तुमचे कार्यक्रम सुरू करा.", "संपर्क करा"],

        ["विक्रेता", "तुमच्या ब्रँडसाठी संधी शोधा.", "संपर्क करा"],
      ],

      faqTitle: "तुमचे प्रश्न?",

      faqHighlight: "आमच्याकडे उत्तरे आहेत.",

      faqs: [
        [
          "Stallora म्हणजे काय?",

          "Stallora हे कार्यक्रम, आयोजक आणि स्टॉलच्या संधी शोधण्याचे व्यासपीठ आहे.",
        ],

        [
          "कार्यक्रम कसे शोधायचे?",

          "कार्यक्रम विभागात उत्सव, प्रदर्शने आणि बाजारपेठा शोधा.",
        ],

        [
          "मी माझा कार्यक्रम प्रकाशित करू शकतो का?",

          "होय, आयोजक त्यांच्या कार्यक्रमांचा प्रचार करू शकतात.",
        ],

        [
          "विक्रेते स्टॉल कसे शोधू शकतात?",

          "विक्रेते बाजारपेठा आणि प्रदर्शनांच्या संधी शोधू शकतात.",
        ],

        [
          "Stallora कोणत्या भाषांमध्ये उपलब्ध आहे?",

          "Stallora इंग्रजी, हिंदी आणि मराठीमध्ये उपलब्ध आहे.",
        ],
      ],

      footerDesc: "नवीन अनुभव शोधा. लोकांशी जोडा. प्रत्येक क्षण खास बनवा.",

      quickLinks: "महत्त्वाच्या लिंक्स",

      support: "मदत",

      copyright: "© 2026 STALLORA. सर्व हक्क राखीव.",
    },
  };

  const t = translations[language] || translations.en;

  const eventCards = [
    {
      image:
        "https\://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=85",

      category: "MUSIC",

      title: "Live Music Festival",

      location: "Mumbai",

      date: "December 2026",
    },

    {
      image:
        "https\://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",

      category: "MARKET",

      title: "Sunday Flea Market",

      location: "Mumbai",

      date: "December 2026",
    },

    {
      image:
        "https\://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",

      category: "EXHIBITION",

      title: "Creative Art Expo",

      location: "Pune",

      date: "December 2026",
    },
  ];

  return (
    <>
      {/** YOUR EXISTING HERO **/}

      <Hero />

      <div className="stallora-home">
        {/** EXPLORE EVENTS **/}

        <section className="home-events" id="events">
          <div className="home-container">
            <div className="home-heading">
              <div>
                <span className="home-eyebrow">
                  {" "}
                  DISCOVER YOUR NEXT EXPERIENCE
                </span>

                <h2>
                  {t.eventsTitle}

                  <br />

                  <span>{t.eventsHighlight}</span>
                </h2>

                <p>{t.eventsDesc}</p>
              </div>

              <a href="/events" className="home-outline-btn">
                {t.eventButton}
              </a>
            </div>

            <div className="home-categories">
              {t.categories.map((category, index) => (
                <button className={index === 0 ? "active" : ""} key={category}>
                  {category}
                </button>
              ))}
            </div>

            <div className="home-events-grid">
              {eventCards.map((event, index) => (
                <article className="home-event-card" key={event.title}>
                  <div className="home-event-image">
                    <img src={event.image} alt={event.title} />

                    <span className="home-event-category">
                      {event.category}
                    </span>

                    <button
                      className="home-heart"
                      aria-label="Save event"
                    ></button>
                  </div>

                  <div className="home-event-content">
                    <span className="home-event-date"> {event.date}</span>

                    <h3>{event.title}</h3>

                    <p> {event.location}</p>

                    <a href="/events">{t.eventButton}</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/** HOW IT WORKS **/}

        <section className="home-how" id="how-it-works">
          <div className="home-container">
            <div className="home-centered-heading">
              <span className="home-eyebrow">THE STALLORA EXPERIENCE</span>

              <h2>
                {t.howTitle}

                <br />

                <span>{t.howHighlight}</span>
              </h2>
            </div>

            <div className="home-steps">
              {t.steps.map((step, index) => (
                <div className="home-step" key={step[0]}>
                  <span className="home-step-number">{step[0]}</span>

                  <h3>{step[1]}</h3>

                  <p>{step[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/** ORGANISERS **/}

        <section className="home-organisers" id="organisers">
          <div className="home-container home-feature-grid">
            <div className="home-feature-image">
              <img
                src="https\://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=85"
                alt="Event organiser managing a festival"
              />

              <div className="home-image-sticker">
                <span>MAKE IT HAPPEN</span>
              </div>
            </div>

            <div className="home-feature-content">
              <span className="home-eyebrow"> {t.organiserTag}</span>

              <h2>
                {t.organiserTitle}

                <br />

                <span>{t.organiserHighlight}</span>
              </h2>

              <p>{t.organiserDesc}</p>

              <ul>
                {t.organiserPoints.map((point) => (
                  <li key={point}> {point}</li>
                ))}
              </ul>

              <a href="/organisers" className="home-primary-btn">
                {t.organiserButton}
              </a>
            </div>
          </div>
        </section>

        {/** VENDORS **/}

        <section className="home-vendors" id="vendors">
          <div className="home-container home-feature-grid reverse">
            <div className="home-feature-content">
              <span className="home-eyebrow"> {t.vendorTag}</span>

              <h2>
                {t.vendorTitle}

                <br />

                <span>{t.vendorHighlight}</span>
              </h2>

              <p>{t.vendorDesc}</p>

              <ul>
                {t.vendorPoints.map((point) => (
                  <li key={point}> {point}</li>
                ))}
              </ul>

              <a href="/vendors" className="home-primary-btn">
                {t.vendorButton}
              </a>
            </div>

            <div className="home-feature-image vendor-image">
              <img
                src="https\://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=85"
                alt="Creative vendor market"
              />

              <div className="home-image-sticker">
                <span>GROW YOUR BRAND</span>
              </div>
            </div>
          </div>
        </section>

        {/** PRICING **/}

        <section className="home-pricing" id="pricing">
          <div className="home-container">
            <div className="home-centered-heading">
              <span className="home-eyebrow">{t.pricingTag}</span>

              <h2>
                {t.pricingTitle}

                <br />

                <span>{t.pricingHighlight}</span>
              </h2>
            </div>

            <div className="home-pricing-grid">
              {t.plans.map((plan, index) => (
                <article
                  className={`home-plan ${index === 1 ? "featured-plan" : ""}`}
                  key={plan[0]}
                >
                  {index === 1 && (
                    <span className="home-plan-badge"> POPULAR</span>
                  )}

                  <span className="home-plan-number">0{index + 1}</span>

                  <h3>{plan[0]}</h3>

                  <p>{plan[1]}</p>

                  <div className="home-plan-price">{plan[2]}</div>

                  <a href="/contact" className="home-plan-btn">
                    {plan[2] === "FREE" ||
                    plan[2] === "मुफ्त" ||
                    plan[2] === "मोफत"
                      ? "Get Started"
                      : "Contact Us"}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/** FAQ **/}

        <section className="home-faq" id="faq">
          <div className="home-container home-faq-grid">
            <div className="home-faq-heading">
              <span className="home-eyebrow">NEED A LITTLE HELP?</span>

              <h2>
                {t.faqTitle}

                <br />

                <span>{t.faqHighlight}</span>
              </h2>

              <p>Everything you need to know about Stallora.</p>
            </div>

            <div className="home-faq-list">
              {t.faqs.map((faq, index) => (
                <div
                  className={`home-faq-item ${
                    activeFaq === index ? "open" : ""
                  }`}
                  key={faq[0]}
                >
                  <button
                    onClick={() =>
                      setActiveFaq(activeFaq === index ? -1 : index)
                    }
                  >
                    <span>{faq[0]}</span>
                  </button>

                  {activeFaq === index && <p>{faq[1]}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/** FOOTER **/}

       
      </div>
    </>
  );
}
