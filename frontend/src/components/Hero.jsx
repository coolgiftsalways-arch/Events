import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  MoveDown,
  CalendarDays,
  Store,
} from "lucide-react";

import { gsap } from "gsap";
import { useLanguage } from "../context/LanguageContext";

import "../css/Hero.css";

const Hero = () => {
  const heroRef = useRef(null);

  const { t, language } = useLanguage();

  const h = t.hero || {};

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      tl.from(".stallora-kicker", {
        y: 20,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          ".stallora-title-line",
          {
            y: 70,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
          },
          "-=0.3",
        )
        .from(
          ".stallora-intro, .stallora-buttons",
          {
            y: 20,
            opacity: 0,
            stagger: 0.12,
            duration: 0.6,
          },
          "-=0.4",
        )
        .from(
          ".stallora-photo",
          {
            scale: 0.85,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8,
          },
          "-=0.5",
        )
        .from(
          ".stallora-floating-label",
          {
            scale: 0,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.3",
        );

      gsap.to(".stallora-orbit", {
        rotation: 360,
        duration: 18,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".stallora-photo-one", {
        y: -7,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".stallora-photo-two", {
        y: 8,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".stallora-photo-three", {
        y: -7,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={`stallora-hero language-${language}`} ref={heroRef}>
      <div className="stallora-bg-circle" />
      <div className="stallora-grid-pattern" />

      <div className="stallora-hero-inner">
        {/* TOPLINE */}

        <div className="stallora-topline">
          <div className="stallora-kicker">
            <span className="stallora-live-dot" />
            <span>{h.kicker || "THE EVENT MARKETPLACE"}</span>
          </div>

          <div className="stallora-edition">
            <span>INDIA</span>
            <span>/</span>
            <span>2026</span>
          </div>
        </div>

        {/* MAIN HERO */}

        <div className="stallora-main">
          {/* LEFT CONTENT */}

          <div className="stallora-copy">
            <div className="stallora-small-tag">
              <Sparkles size={14} />
              <span>{h.tag || "FOR ORGANISERS. FOR VENDORS."}</span>
            </div>

            <h1 className="stallora-heading">
              <span className="stallora-title-line">
                {h.title1 || "WHERE EVENTS"}
              </span>

              <span className="stallora-title-line stallora-title-highlight">
                {h.title2 || "MEET"}
              </span>

              <span className="stallora-title-line">
                <span className="stallora-title-italic">
                  {h.title3 || "opportunities"}
                </span>
                <span className="stallora-title-period">.</span>
              </span>
            </h1>

            <div className="stallora-description-row">
              <div className="stallora-description-line" />

              <p className="stallora-intro">
                {h.description ||
                  "Create unforgettable events, discover exciting opportunities and give your brand a place to shine. Everything starts with STALLORA."}
              </p>
            </div>

            {/* TWO USER JOURNEYS */}

            <div className="stallora-buttons">
              <Link
                to="/organiser/login"
                className="stallora-cta stallora-primary"
              >
                <CalendarDays size={17} />

                <span>{h.organiser || "Organise an Event"}</span>

                <span className="stallora-button-icon">
                  <ArrowUpRight size={19} />
                </span>
              </Link>

              <Link
                to="/vendor/login"
                className="stallora-cta stallora-secondary"
              >
                <Store size={17} />

                <span>{h.vendor || "Book a Stall"}</span>

                <ArrowRight size={17} />
              </Link>
            </div>

            {/* USER JOURNEY STEPS */}

            <div className="stallora-copy-bottom">
              <span>01 — {h.discover || "DISCOVER"}</span>
              <span>02 — {h.connect || "CONNECT"}</span>
              <span>03 — {h.experience || "GROW"}</span>
            </div>
          </div>

          {/* RIGHT IMAGE COLLAGE */}

          <div className="stallora-visual">
            <div className="stallora-visual-glow" />

            <div className="stallora-photo stallora-photo-one">
              <img
                src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1000&q=90"
                alt="Outdoor music festival"
              />

              <div className="stallora-photo-label">
                <span>{h.liveIt || "LIVE THE MOMENT"}</span>
                <span>↗</span>
              </div>
            </div>

            <div className="stallora-photo stallora-photo-two">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=90"
                alt="Live event experience"
              />

              <div className="stallora-mini-caption">
                {h.goodTimes || "GOOD TIMES. GREAT PEOPLE."}
              </div>
            </div>

            <div className="stallora-photo stallora-photo-three">
              <img
                src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=700&q=90"
                alt="Shopping and retail experience"
              />
            </div>

            {/* ROTATING STICKER */}

            <div className="stallora-floating-label">
              <div className="stallora-orbit">
                <svg viewBox="0 0 120 120">
                  <defs>
                    <path
                      id="stallora-circle-path"
                      d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"
                    />
                  </defs>

                  <text>
                    <textPath href="#stallora-circle-path">
                      {`${h.discover || "DISCOVER"} • ${h.connect || "CONNECT"} • ${h.experience || "GROW"} •`}
                    </textPath>
                  </text>
                </svg>
              </div>

              <div className="stallora-sticker-center">
                <Sparkles size={25} />
              </div>
            </div>

            {/* FLOATING PILL */}

            <div className="stallora-floating-pill">
              <span className="stallora-pill-star">✳</span>
              <span>{h.floatingLabel || "YOUR EVENT. YOUR OPPORTUNITY."}</span>
            </div>

            <div className="stallora-visual-number">S.</div>
          </div>
        </div>

        {/* BOTTOM LINE */}

        <div className="stallora-footer-line">
          <div className="stallora-footer-left">
            <span className="stallora-footer-star">✳</span>
            <span>{h.footer || "BRING YOUR IDEAS TO LIFE"}</span>
          </div>

          <a href="#events" className="stallora-scroll">
            {h.scroll || "SCROLL TO EXPLORE"}
            <MoveDown size={14} />
          </a>

          <span className="stallora-footer-right">STALLORA © 2026</span>
        </div>
      </div>

      {/* TICKER */}

      <div className="stallora-ticker">
        <div className="stallora-ticker-track">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="stallora-ticker-group" key={index}>
              <span>{h.discover || "DISCOVER EVENTS"}</span>
              <span className="ticker-star">✳</span>

              <span>{h.experience || "CREATE EXPERIENCES"}</span>
              <span className="ticker-star">✳</span>

              <span>{h.connect || "CONNECT BRANDS"}</span>
              <span className="ticker-star">✳</span>

              <span>{h.footer || "GROW TOGETHER"}</span>
              <span className="ticker-star">✳</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
