import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
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
function StarField() {
  const ref = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const positions = new Float32Array(2500 * 3);
  for (let i = 0; i < 2500; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.018;
    ref.current.rotation.x = mouse.current.y * 0.3;
    ref.current.rotation.z = mouse.current.x * 0.2;
    state.camera.position.x +=
      (mouse.current.x - state.camera.position.x) * 0.04;
    state.camera.position.y +=
      (-mouse.current.y - state.camera.position.y) * 0.04;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#e8ff00"
        size={0.012}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

function Rings() {
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame((_, delta) => {
    ring1.current.rotation.z += delta * 0.06;
    ring2.current.rotation.z -= delta * 0.04;
  });

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.2, 0.004, 16, 120]} />
        <meshBasicMaterial color="#e8ff00" transparent opacity={0.08} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.5, 0.002, 16, 120]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>
    </>
  );
}

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
      },
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
      },
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
      },
    );

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-page">
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      <GlobalCursor />
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
            <Canvas
              className="home-page__hero-canvas"
              camera={{ position: [0, 0, 4], fov: 60 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <StarField />
              <Rings />
            </Canvas>
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
