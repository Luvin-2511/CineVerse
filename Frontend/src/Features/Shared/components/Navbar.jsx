import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../styles/Navbar.scss";
import { useNavigate } from "react-router-dom";
import useAuth from "../../Auth/hooks/useAuth";

const Navbar = () => {
  const [isBigNavVisible, setIsBigVisible] = useState(false);
  const bigNavRef = useRef(null);
  const navRef = useRef(null);
  const linksRef = useRef([]);
  const navigate = useNavigate();
  const { handleLogout, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await handleLogout();
    if (success) {
      navigate("/");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 100) {
        navRef.current.style.transform = "translateY(-100%)";
      } else {
        navRef.current.style.transform = "translateY(0%)";
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const menuItems = [
    { label: "Browse", to: "/browse" },
    { label: "Favorites", to: "/favorites" },
    { label: "History", to: "/history" },
    { label: "Watchlist", to: "/watchlist" },
  ];

  const openNav = () => {
    setIsBigVisible(true);
    gsap.fromTo(
      bigNavRef.current,
      { yPercent: 100 },
      { yPercent: -10.3, duration: 0.65, ease: "power3.inOut" },
    );
    gsap.fromTo(
      linksRef.current.filter(Boolean),
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.3,
      },
    );
  };

  const closeNav = () => {
    gsap.to(bigNavRef.current, {
      yPercent: -100,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => setIsBigVisible(false),
    });
  };

  return (
    <nav>
      {/* Small Nav */}
      <div ref={navRef} className="small-nav">
        {/* Logo — absolutely positioned, does not affect flex layout */}
        <span className="small-nav__logo" onClick={() => navigate("/browse")}>
          CINEVERSE
        </span>

        <div className="nav-container-small nav-cont">
          <h4>{user.name}</h4>
        </div>
        <div
          onClick={() => {
            navigate("/browse");
          }}
          className="nav-container-medium nav-cont"
        >
          <h4>Browse</h4>
        </div>
        <div onClick={openNav} className="nav-container-large nav-cont">
          <h4>Menu</h4>
        </div>
      </div>

      {/* Big Nav Overlay */}
      <div
        ref={bigNavRef}
        style={{
          top: isBigNavVisible ? "0" : "100%",
        }}
        className="big-nav"
      >
        <a className="big-nav__logo" onClick={() => navigate("/browse")}>CINEVERSE</a>
        <button className="big-nav__close" onClick={closeNav}>
          <span />
          <span />
        </button>

        <nav className="big-nav__links">
          {menuItems.map((item, i) => (
            <div
              key={item.to}
              className="big-nav__item"
              ref={(el) => (linksRef.current[i] = el)}
            >
              <button
                className="big-nav__link"
                onClick={() => {
                  navigate(item.to);
                }}
              >
                <span className="big-nav__link-num">0{i + 1}</span>
                <h1>{item.label}</h1>
                <span className="big-nav__link-arrow">→</span>
              </button>
            </div>
          ))}
          <div onClick={handleSubmit} className="logout-button">
            <h4> Logout</h4>
          </div>
        </nav>

        <div className="big-nav__footer">
          <span>© {new Date().getFullYear()} CINEVERSE</span>
          <span>ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
