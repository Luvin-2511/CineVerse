import { Link, useNavigate } from "react-router-dom";
import MagneticButton from "../../Shared/components/Magneticbutton";
import "../styles/Register.scss";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const {handleRegister,authLoading} = useAuth()
  const navigate =  useNavigate()

  const handleRegisterSubmit =async (e) => {
    e.preventDefault()
    const success = await handleRegister(name,email,password)
    if(success){
      navigate('/browse')
    }
  }

  if(authLoading){
    return <h1>Loading Register</h1>
  }

  return (
    <div className="register-page">
      {/* Form Panel */}
      <div className="register-page__form-panel">
        <div className="register-page__form-wrap">
          <div className="register-page__logo">CINEVERSE</div>

          <h2 className="register-page__heading">
            JOIN THE
            <br />
            UNIVERSE.
          </h2>
          <p className="register-page__sub">
            Create your free account and start exploring.
          </p>

          <form onSubmit={handleRegisterSubmit}>
            <div className="register-page__field">
              <label htmlFor="name">Full Name</label>
              <input
              onChange={(e)=>{
                setName(e.target.value)
              }}
              value={name}
              id="name"
              name="name"
              type="text"
              placeholder="Your Name"
              required
              />
            </div>

            <div className="register-page__field">
              <label htmlFor="email">Email Address</label>
              <input
                onChange={(e)=>{
                  setEmail(e.target.value)
                }}
                value={email}
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                />
            </div>

            <div className="register-page__field">
              <label htmlFor="password">Password</label>
              <input
                onChange={(e)=>{
                  setPassword(e.target.value)
                }}
                value={password}
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <p className="register-page__terms">
              By creating an account you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>

            <MagneticButton disabled={authLoading} type="submit">{authLoading?"AUTHENTICATING":"CREATE MY ACCOUNT"}</MagneticButton>
          </form>

          <div className="register-page__footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Visual Panel */}
      <div className="register-page__visual">
        <div className="register-page__visual-bg" />
        <div className="register-page__visual-lines">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="vline" />
          ))}
        </div>

        <div className="register-page__visual-orb">
          <span className="register-page__visual-icon">🎬</span>
        </div>

        <div className="register-page__visual-content">
          <h2>UNLOCK EVERYTHING</h2>
          <ul className="register-page__visual-perks">
            <li>Unlimited favorites & watchlist</li>
            <li>Full watch history tracking</li>
            <li>Trailer previews with one click</li>
            <li>Personalized recommendations</li>
            <li>Cross-device sync</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
