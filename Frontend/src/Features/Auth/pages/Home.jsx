import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HeroCanvas = lazy(() => import("../components/HeroCanvas"));
import ShowcaseSection from "../components/ShowcaseSession";
import "../styles/Home.scss";
import Loader from "../../Shared/components/Loader";

gsap.registerPlugin(ScrollTrigger);

// ── Global Cursor ──────────────────────────────────────────────────────────
const GlobalCursor = () => {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    let cx = 0,
      cy = 0,
      tx = 0,
      ty = 0,
      raf;

    const lerp = (a, b, n) => a + (b - a) * n;

    const animate = () => {
      cx = lerp(cx, tx, 0.22);
      cy = lerp(cy, ty, 0.12);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    const onEnter = () => {
      cursorRef.current?.classList.add("visible");
      dotRef.current?.classList.add("visible");
      raf = requestAnimationFrame(animate);
    };

    const onLeave = () => {
      cursorRef.current?.classList.remove("visible");
      dotRef.current?.classList.remove("visible");
      cancelAnimationFrame(raf);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="showcase-cursor" />
      <div ref={dotRef} className="showcase-cursor__dot" />
    </>
  );
};

// ── R3F Scene ──────────────────────────────────────────────────────────────
// Extracted to HeroCanvas component for code splitting

// ── Constants ──────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "TRENDING NOW",
  "OPPENHEIMER",
  "DUNE PART TWO",
  "THE BATMAN",
  "PAST LIVES",
  "POOR THINGS",
  "KILLERS OF THE FLOWER MOON",
  "PRISCILLA",
  "MAESTRO",
  "ANATOMY OF A FALL",
];

const FEATURES = [
  {
    icon: "🔥",
    title: "TRENDING",
    desc: "Real-time trending movies and shows fetched live from TMDB. Always fresh, always now.",
  },
  {
    icon: "🎬",
    title: "TRAILERS",
    desc: "Watch trailers without leaving the app. YouTube-powered previews in an immersive modal.",
  },
  {
    icon: "♾️",
    title: "INFINITE SCROLL",
    desc: "Never hit a wall. Content loads seamlessly as you explore, no pagination needed.",
  },
  {
    icon: "❤️",
    title: "FAVORITES",
    desc: "Bookmark your must-watch movies. Your list syncs to the cloud across all devices.",
  },
  {
    icon: "🕐",
    title: "WATCH HISTORY",
    desc: "Every title you open or preview is logged. Pick up exactly where you left off.",
  },
  {
    icon: "🛡️",
    title: "ADMIN PANEL",
    desc: "Full control dashboard. Manage movies, moderate users, and keep the platform clean.",
  },
];

// ── Page ───────────────────────────────────────────────────────────────────
const Home = () => {
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      navRef.current?.classList.toggle("scrolled", window.scrollY > 3);
    };
    window.addEventListener("scroll", handleScroll);

    setTimeout(() => {
      heroRef.current
        ?.querySelectorAll("[data-gsap]")
        .forEach((el) => el.classList.add("visible"));
    }, 50);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      gsap.fromTo(
        ".home-page__features-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".home-page__features-grid",
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".home-page__stats-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".home-page__stats", start: "top 85%" },
        }
      );

      gsap.fromTo(
        ".home-page__footer-cta h2",
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: { trigger: ".home-page__footer-cta", start: "top 75%" },
        }
      );
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      mm.revert();
    };
  }, []);

  return (
    <div className="home-page">
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      {!isMobile && <GlobalCursor />}
      {loaded && (
        <>
          {/* Nav */}
          <nav className="home-page__nav" ref={navRef}>
            <Link to="/" className="home-page__nav-logo">
              CINEVERSE
            </Link>
            <ul className="home-page__nav-links">
              {["Trending", "Movies", "TV Shows", "People"].map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
            <div className="home-page__nav-actions">
              <Link to="/login" className="nav-login">
                Sign In
              </Link>
              <Link to="/register" className="nav-cta">
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero */}
          <section className="home-page__hero" ref={heroRef}>
            {!isMobile && (
              <Suspense fallback={null}>
                <HeroCanvas />
              </Suspense>
            )}
            <div className="home-page__hero-overlay" />

            <div className="home-page__hero-content">
              <p className="home-page__hero-eyebrow" data-gsap>
                ◈ The Ultimate Cinema Platform
              </p>
              <h1 className="home-page__hero-title" data-gsap>
                DISCOVER
                <br />
                YOUR NEXT
                <br />
                <span className="line-accent">OBSESSION.</span>
              </h1>

              <div className="home-page__hero-meta" data-gsap>
                {["4K TRAILERS", "50K+ TITLES", "LIVE TRENDING"].map((t) => (
                  <span key={t} className="home-page__hero-meta-tag">
                    {t}
                  </span>
                ))}
              </div>

              <div className="home-page__hero-cta" data-gsap>
                <Link to="/register" className="btn-primary">
                  <p>START EXPLORING ›</p>
                </Link>
                <Link to="/login" className="btn-ghost">
                  SIGN IN
                </Link>
              </div>
            </div>

            <div className="home-page__hero-scroll">
              <span>Scroll</span>
              <div className="scroll-line" />
            </div>
          </section>

          {/* Marquee */}
          <div className="home-page__marquee">
            <div className="home-page__marquee-inner">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <div key={i} className="home-page__marquee-item">
                  {item} <span className="dot" />
                </div>
              ))}
            </div>
          </div>

          {/* Showcase */}
          <ShowcaseSection />

          {/* Features */}
          <section className="home-page__features">
            <div className="home-page__features-header">
              <p className="section-label">◈ Platform Features</p>
              <h2>
                EVERYTHING
                <br />
                YOU NEED.
              </h2>
            </div>
            <div className="home-page__features-grid">
              {FEATURES.map((f, i) => (
                <div key={i} className="home-page__features-card">
                  <span className="feature-icon">{f.icon}</span>
                  <p className="feature-num">0{i + 1}</p>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="home-page__stats">
            {[
              { num: "50K+", label: "Movies & Shows" },
              { num: "4K", label: "Stream Quality" },
              { num: "100M+", label: "Data Points" },
              { num: "∞", label: "Your Watchlist" },
            ].map((s) => (
              <div key={s.label} className="home-page__stats-item">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </section>

          {/* Footer CTA */}
          <section className="home-page__footer-cta">
            <h2>
              READY TO
              <br />
              <span>WATCH?</span>
            </h2>
            <p>Join millions discovering great cinema every day.</p>
            <div className="cta-group">
              <Link to="/register" className="btn-primary">
                CREATE FREE ACCOUNT
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
