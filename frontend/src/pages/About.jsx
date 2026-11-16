import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Store,
  CalendarDays,
  Users,
  Sparkles,
  Target,
  Heart,
  Lightbulb,
  MoveRight,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import "../css/About.css";

const content = {
  en: {
    eyebrow: "GET TO KNOW US",
    title: "We bring",
    titleHighlight: "opportunities",
    titleEnd: "to life.",
    description:
      "STALLORA is where events meet entrepreneurship. We make it easier for businesses to discover events, find the right space and turn their ideas into real-world experiences.",
    explore: "Explore Events",
    contact: "Get in Touch",

    introLabel: "OUR STORY",
    introTitle: "Every great business deserves a place to shine.",
    introDescription:
      "We believe that every small business, independent creator and growing brand deserves the opportunity to be seen. But finding the right events and booking the right stall shouldn't be complicated.",
    introDescription2:
      "That's why we created STALLORA — a platform designed to connect event organisers with vendors and make discovering and booking event spaces simpler.",

    missionLabel: "OUR MISSION",
    missionTitle: "Making opportunities accessible to everyone.",
    missionDescription:
      "Our mission is to simplify the event discovery and stall booking experience. We want to help vendors reach new customers while helping organisers bring amazing events to life.",

    visionLabel: "OUR VISION",
    visionTitle: "A world where every idea gets its opportunity.",
    visionDescription:
      "We envision a connected event ecosystem where creativity, businesses and communities come together to create meaningful experiences.",

    valuesLabel: "WHAT DRIVES US",
    valuesTitle: "Built around what matters.",
    values: [
      {
        title: "Opportunity for Everyone",
        description:
          "We believe businesses of every size deserve access to meaningful opportunities.",
      },
      {
        title: "Simple Experiences",
        description:
          "Discovering events and finding a stall should feel easy, clear and effortless.",
      },
      {
        title: "Stronger Connections",
        description:
          "We bring organisers, vendors and communities together in one place.",
      },
      {
        title: "Growth Together",
        description:
          "We want every connection to create possibilities for businesses and events.",
      },
    ],

    howLabel: "HOW STALLORA WORKS",
    howTitle: "From discovery to opportunity.",
    steps: [
      {
        number: "01",
        title: "Discover Events",
        description:
          "Explore upcoming events and find opportunities that match your business.",
      },
      {
        number: "02",
        title: "Choose Your Space",
        description:
          "View event details, explore stall options and find the right space.",
      },
      {
        number: "03",
        title: "Connect & Grow",
        description:
          "Connect with event organisers and take your business to new audiences.",
      },
    ],

    audienceLabel: "WHO WE SERVE",
    audienceTitle: "One platform. Multiple possibilities.",
    vendorsTitle: "For Vendors",
    vendorsDescription:
      "Discover events, showcase your products, connect with customers and grow your brand.",
    organisersTitle: "For Organisers",
    organisersDescription:
      "Connect with vendors, showcase your events and make stall discovery easier.",

    ctaLabel: "YOUR NEXT CHAPTER STARTS HERE",
    ctaTitle: "Ready to turn opportunities into experiences?",
    ctaDescription:
      "Discover your next event, find your perfect space and make something happen with STALLORA.",
    ctaButton: "Explore Opportunities",
  },

  hi: {
    eyebrow: "हमारे बारे में जानें",
    title: "हम",
    titleHighlight: "अवसरों",
    titleEnd: "को साकार करते हैं।",
    description:
      "STALLORA एक ऐसा प्लेटफॉर्म है जहाँ कार्यक्रम और व्यवसाय एक साथ आते हैं। हम व्यवसायों को कार्यक्रम खोजने और सही स्टॉल चुनने में मदद करते हैं।",
    explore: "कार्यक्रम देखें",
    contact: "संपर्क करें",

    introLabel: "हमारी कहानी",
    introTitle: "हर अच्छे व्यवसाय को चमकने का अवसर मिलना चाहिए।",
    introDescription:
      "हम मानते हैं कि हर छोटे व्यवसाय, स्वतंत्र निर्माता और उभरते ब्रांड को आगे बढ़ने का अवसर मिलना चाहिए। लेकिन सही कार्यक्रम और स्टॉल खोजना मुश्किल नहीं होना चाहिए।",
    introDescription2:
      "इसीलिए हमने STALLORA बनाया — एक ऐसा प्लेटफॉर्म जो कार्यक्रम आयोजकों और विक्रेताओं को जोड़ता है।",

    missionLabel: "हमारा मिशन",
    missionTitle: "सभी के लिए अवसर आसान बनाना।",
    missionDescription:
      "हमारा उद्देश्य कार्यक्रम खोजने और स्टॉल बुक करने की प्रक्रिया को आसान बनाना है। हम विक्रेताओं को नए ग्राहकों तक पहुँचने और आयोजकों को बेहतरीन कार्यक्रम बनाने में मदद करना चाहते हैं।",

    visionLabel: "हमारा विज़न",
    visionTitle: "एक ऐसी दुनिया जहाँ हर विचार को अवसर मिले।",
    visionDescription:
      "हम एक ऐसे जुड़े हुए इवेंट इकोसिस्टम की कल्पना करते हैं जहाँ रचनात्मकता, व्यवसाय और समुदाय मिलकर नए अनुभव बनाते हैं।",

    valuesLabel: "हमारे सिद्धांत",
    valuesTitle: "हमारी सोच की नींव।",
    values: [
      {
        title: "सभी के लिए अवसर",
        description:
          "हम मानते हैं कि हर आकार के व्यवसाय को आगे बढ़ने के अवसर मिलने चाहिए।",
      },
      {
        title: "आसान अनुभव",
        description:
          "कार्यक्रम खोजना और स्टॉल चुनना आसान और सुविधाजनक होना चाहिए।",
      },
      {
        title: "मजबूत संबंध",
        description:
          "हम आयोजकों, विक्रेताओं और समुदायों को एक मंच पर जोड़ते हैं।",
      },
      {
        title: "साथ मिलकर विकास",
        description:
          "हम चाहते हैं कि हर नया संबंध व्यवसायों और कार्यक्रमों के लिए नए अवसर बनाए।",
      },
    ],

    howLabel: "STALLORA कैसे काम करता है",
    howTitle: "खोज से अवसर तक।",
    steps: [
      {
        number: "01",
        title: "कार्यक्रम खोजें",
        description: "अपने व्यवसाय के लिए सही आगामी कार्यक्रम खोजें।",
      },
      {
        number: "02",
        title: "अपनी जगह चुनें",
        description: "कार्यक्रम की जानकारी देखें और उपलब्ध स्टॉल चुनें।",
      },
      {
        number: "03",
        title: "जुड़ें और आगे बढ़ें",
        description:
          "आयोजकों से जुड़ें और अपने व्यवसाय को नए ग्राहकों तक पहुँचाएँ।",
      },
    ],

    audienceLabel: "हम किसके लिए हैं",
    audienceTitle: "एक प्लेटफॉर्म। कई अवसर।",
    vendorsTitle: "विक्रेताओं के लिए",
    vendorsDescription:
      "कार्यक्रम खोजें, अपने उत्पाद दिखाएँ, ग्राहकों से जुड़ें और अपने ब्रांड को बढ़ाएँ।",
    organisersTitle: "आयोजकों के लिए",
    organisersDescription:
      "विक्रेताओं से जुड़ें, अपने कार्यक्रम दिखाएँ और स्टॉल की खोज आसान बनाएँ।",

    ctaLabel: "आपकी अगली शुरुआत यहाँ से",
    ctaTitle: "क्या आप अवसरों को अनुभवों में बदलने के लिए तैयार हैं?",
    ctaDescription:
      "STALLORA के साथ अपना अगला कार्यक्रम खोजें और अपने व्यवसाय को आगे बढ़ाएँ।",
    ctaButton: "अवसर खोजें",
  },

  mr: {
    eyebrow: "आमच्याबद्दल जाणून घ्या",
    title: "आम्ही",
    titleHighlight: "संधींना",
    titleEnd: "प्रत्यक्षात आणतो.",
    description:
      "STALLORA हे असे व्यासपीठ आहे जिथे कार्यक्रम आणि व्यवसाय एकत्र येतात. व्यवसायांना योग्य कार्यक्रम आणि स्टॉल शोधणे सोपे करण्यासाठी आम्ही मदत करतो.",
    explore: "कार्यक्रम पाहा",
    contact: "संपर्क साधा",

    introLabel: "आमची कहाणी",
    introTitle: "प्रत्येक चांगल्या व्यवसायाला चमकण्याची संधी मिळाली पाहिजे.",
    introDescription:
      "आमचा विश्वास आहे की प्रत्येक छोट्या व्यवसायाला, स्वतंत्र निर्मात्याला आणि नवीन ब्रँडला पुढे जाण्याची संधी मिळाली पाहिजे. योग्य कार्यक्रम आणि स्टॉल शोधणे कठीण नसावे.",
    introDescription2:
      "म्हणूनच आम्ही STALLORA तयार केले — आयोजक आणि विक्रेत्यांना जोडणारे एक व्यासपीठ.",

    missionLabel: "आमचे ध्येय",
    missionTitle: "प्रत्येकासाठी संधी उपलब्ध करून देणे.",
    missionDescription:
      "कार्यक्रम शोधणे आणि स्टॉल बुक करणे सोपे करणे हे आमचे ध्येय आहे. विक्रेत्यांना नवीन ग्राहकांपर्यंत पोहोचण्यास आणि आयोजकांना उत्तम कार्यक्रम आयोजित करण्यास मदत करणे हे आमचे उद्दिष्ट आहे.",

    visionLabel: "आमची दृष्टी",
    visionTitle: "जिथे प्रत्येक कल्पनेला संधी मिळते असे जग.",
    visionDescription:
      "सर्जनशीलता, व्यवसाय आणि समुदाय एकत्र येऊन अर्थपूर्ण अनुभव निर्माण करतात अशा जोडलेल्या इव्हेंट इकोसिस्टमची आम्ही कल्पना करतो.",

    valuesLabel: "आमची मूल्ये",
    valuesTitle: "आमच्या कामामागील विचार.",
    values: [
      {
        title: "सर्वांसाठी संधी",
        description:
          "प्रत्येक आकाराच्या व्यवसायाला प्रगतीच्या संधी मिळाल्या पाहिजेत.",
      },
      {
        title: "सोपे अनुभव",
        description: "कार्यक्रम शोधणे आणि स्टॉल निवडणे सोपे आणि सहज असावे.",
      },
      {
        title: "मजबूत संबंध",
        description: "आयोजक, विक्रेते आणि समुदायांना आम्ही एकत्र आणतो.",
      },
      {
        title: "एकत्रित प्रगती",
        description:
          "प्रत्येक नवीन संबंधातून व्यवसाय आणि कार्यक्रमांसाठी नवीन संधी निर्माण व्हाव्यात.",
      },
    ],

    howLabel: "STALLORA कसे कार्य करते",
    howTitle: "शोधापासून संधीपर्यंत.",
    steps: [
      {
        number: "01",
        title: "कार्यक्रम शोधा",
        description: "तुमच्या व्यवसायासाठी योग्य आगामी कार्यक्रम शोधा.",
      },
      {
        number: "02",
        title: "तुमची जागा निवडा",
        description: "कार्यक्रमाची माहिती पाहा आणि उपलब्ध स्टॉल निवडा.",
      },
      {
        number: "03",
        title: "जोडा आणि प्रगती करा",
        description:
          "आयोजकांशी संपर्क साधा आणि तुमचा व्यवसाय नवीन ग्राहकांपर्यंत पोहोचवा.",
      },
    ],

    audienceLabel: "आम्ही कोणासाठी आहोत",
    audienceTitle: "एक व्यासपीठ. अनेक संधी.",
    vendorsTitle: "विक्रेत्यांसाठी",
    vendorsDescription:
      "कार्यक्रम शोधा, तुमची उत्पादने प्रदर्शित करा, ग्राहकांशी जोडा आणि ब्रँड वाढवा.",
    organisersTitle: "आयोजकांसाठी",
    organisersDescription:
      "विक्रेत्यांशी जोडा, तुमचे कार्यक्रम प्रदर्शित करा आणि स्टॉल शोधणे सोपे करा.",

    ctaLabel: "तुमची पुढील सुरुवात इथून",
    ctaTitle: "संधींचे अनुभवांमध्ये रूपांतर करण्यास तयार आहात?",
    ctaDescription:
      "STALLORA सोबत तुमचा पुढील कार्यक्रम शोधा आणि व्यवसायाला पुढे न्या.",
    ctaButton: "संधी शोधा",
  },
};

const valueIcons = [Target, Lightbulb, Heart, Sparkles];

export default function About() {
  const { language } = useLanguage();

  const t = content[language] || content.en;

  return (
    <main className="about-page">
      {/* HERO */}

      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">
            <Sparkles size={15} />
            {t.eyebrow}
          </span>

          <h1>
            {t.title} <span>{t.titleHighlight}</span>
            <br />
            {t.titleEnd}
          </h1>

          <p>{t.description}</p>

          <div className="about-hero-actions">
            <Link to="/vendors" className="about-primary-btn">
              {t.explore}
              <ArrowUpRight size={19} />
            </Link>

            <a href="#our-story" className="about-secondary-btn">
              {t.contact}
            </a>
          </div>

          <div className="about-hero-bottom">
            <span>STALLORA</span>
            <span>DISCOVER. CONNECT. GROW.</span>
          </div>
        </div>

        <div className="about-hero-art">
          <div className="about-art-circle">
            <span className="about-art-star">✳</span>
            <span className="about-art-text">MAKE SPACE FOR OPPORTUNITY</span>
          </div>

          <div className="about-art-card about-art-card-one">
            <Store size={26} />
            <span>FOR VENDORS</span>
          </div>

          <div className="about-art-card about-art-card-two">
            <CalendarDays size={26} />
            <span>FOR EVENTS</span>
          </div>

          <div className="about-art-decoration">✦</div>
        </div>
      </section>

      {/* STORY */}

      <section className="about-story" id="our-story">
        <div className="about-section-label">{t.introLabel}</div>

        <div className="about-story-grid">
          <h2>{t.introTitle}</h2>

          <div>
            <p>{t.introDescription}</p>
            <p>{t.introDescription2}</p>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}

      <section className="about-purpose">
        <article className="about-purpose-card mission-card">
          <span>{t.missionLabel}</span>
          <Target size={36} />
          <h2>{t.missionTitle}</h2>
          <p>{t.missionDescription}</p>
        </article>

        <article className="about-purpose-card vision-card">
          <span>{t.visionLabel}</span>
          <Sparkles size={36} />
          <h2>{t.visionTitle}</h2>
          <p>{t.visionDescription}</p>
        </article>
      </section>

      {/* VALUES */}

      <section className="about-values">
        <div className="about-section-heading">
          <span>{t.valuesLabel}</span>
          <h2>{t.valuesTitle}</h2>
        </div>

        <div className="about-values-grid">
          {t.values.map((item, index) => {
            const Icon = valueIcons[index];

            return (
              <article className="about-value-card" key={item.title}>
                <div className="about-value-icon">
                  <Icon size={25} />
                </div>

                <span>0{index + 1}</span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="about-how">
        <div className="about-section-heading">
          <span>{t.howLabel}</span>
          <h2>{t.howTitle}</h2>
        </div>

        <div className="about-steps">
          {t.steps.map((step) => (
            <article className="about-step" key={step.number}>
              <span className="about-step-number">{step.number}</span>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              <MoveRight size={23} />
            </article>
          ))}
        </div>
      </section>

      {/* WHO WE SERVE */}

      <section className="about-audience">
        <div className="about-section-heading">
          <span>{t.audienceLabel}</span>
          <h2>{t.audienceTitle}</h2>
        </div>

        <div className="about-audience-grid">
          <article className="about-audience-card vendor-audience">
            <Store size={38} />

            <h3>{t.vendorsTitle}</h3>

            <p>{t.vendorsDescription}</p>

            <Link to="/vendors">
              {t.explore}
              <ArrowUpRight size={19} />
            </Link>
          </article>

          <article className="about-audience-card organiser-audience">
            <Users size={38} />

            <h3>{t.organisersTitle}</h3>

            <p>{t.organisersDescription}</p>

            <Link to="/vendors">
              {t.explore}
              <ArrowUpRight size={19} />
            </Link>
          </article>
        </div>
      </section>

      {/* CTA */}

      <section className="about-cta">
        <span>{t.ctaLabel}</span>

        <h2>{t.ctaTitle}</h2>

        <p>{t.ctaDescription}</p>

        <Link to="/vendors">
          {t.ctaButton}
          <ArrowUpRight size={20} />
        </Link>

        <div className="about-cta-star">✳</div>
      </section>
    </main>
  );
}
