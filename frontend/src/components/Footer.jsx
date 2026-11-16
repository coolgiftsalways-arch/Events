import { useLanguage } from "../context/LanguageContext";
import "../css/Footer.css";

export default function Footer() {
  const { t } = useLanguage();
  const footer = t.footer;

  return (
    <footer className="stallora-footer">
      <div className="footer-container">
        {/* TOP FOOTER */}

        <div className="footer-main">
          {/* BRAND */}

          <div className="footer-brand">
            <a href="/" className="footer-logo">
              STALLORA<span>✦</span>
            </a>

            <p className="footer-description">{footer.description}</p>

            <a href="mailto:hello@stallora.com" className="footer-email">
              hello@stallora.com
            </a>
          </div>

          {/* QUICK LINKS */}

          <div className="footer-column">
            <h3>{footer.explore}</h3>

            <a href="/">{footer.home}</a>
            <a href="/events">{footer.exploreEvents}</a>
            <a href="/about">{footer.about}</a>
            <a href="#how-it-works">{footer.howItWorks}</a>
          </div>

          {/* FOR USERS */}

          <div className="footer-column">
            <h3>{footer.getStarted}</h3>

            <a href="/vendors">{footer.bookYourStall}</a>
            <a href="/organisers">{footer.organisers}</a>
            <a href="/vendors">{footer.vendors}</a>
            <a href="/pricing">{footer.pricing}</a>
          </div>

          {/* SUPPORT */}

          <div className="footer-column">
            <h3>{footer.support}</h3>

            <a href="/contact">{footer.contact}</a>
            <a href="#faq">{footer.faqs}</a>
            <a href="/privacy-policy">{footer.privacy}</a>
            <a href="/terms">{footer.terms}</a>
          </div>
        </div>

        {/* FOOTER DIVIDER */}

        <div className="footer-divider"></div>

        {/* BOTTOM FOOTER */}

        <div className="footer-bottom">
          <p>{footer.copyright}</p>

          <p className="footer-tagline">
            {footer.tagline} <span>✳</span>
          </p>

          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            {footer.follow} ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
