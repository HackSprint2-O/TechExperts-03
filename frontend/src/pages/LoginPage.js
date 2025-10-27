import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Breakpoint constant
const MOBILE_BREAKPOINT = 900;

// Component that handles both Login and Register views on a single screen
const LoginPage = () => {
  // State to toggle between 'login' and 'register' view
  const [isLoginView, setIsLoginView] = useState(true);
  
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  const navigate = useNavigate();

  // --- Effect for Responsive Styling ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Form Submission Handlers ---

  const handleLogin = async (e) => {
    e.preventDefault();
    // Simulate successful login for now
    navigate('/chat');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', {
        username,
        email,
        password
      });
      alert('Registration successful! Please login.');
      setIsLoginView(true);
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error || error.message);
      alert('Registration failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  // --- Dynamic Style Definitions ---
  
  // Base styles (Desktop default)
  const baseStyles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "'Poppins', sans-serif",
      flexDirection: 'row', 
    },
    left: {
      flex: 1,
      background: "linear-gradient(to bottom right, #9be7e3, rgb(72, 92, 241))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    right: {
      flex: 1,
      background: "linear-gradient(to bottom right, rgb(77, 164, 235), rgb(128, 157, 254))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 40px",
    },
    card: {
      background: "rgba(255, 255, 255, 0.97)",
      padding: "50px 40px",
      borderRadius: "24px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
      maxWidth: "480px",
      width: "100%",
      textAlign: "center",
    },
    title: {
      fontSize: "45px",
      fontWeight: "700",
      color: "#2a4d3c",
      marginBottom: "20px",
    },
    tagline: {
      fontSize: "18px",
      color: "#4b4b4b",
      marginBottom: "6px",
      fontStyle: "italic",
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '30px',
    },
    formTitle: {
      fontSize: "28px",
      fontWeight: "600",
      color: "#4285F4",
      marginBottom: "20px",
    },
    input: {
      padding: "12px",
      fontSize: "16px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      outline: "none",
      boxSizing: 'border-box',
    },
    mainBtn: {
      marginTop: "10px",
      padding: "14px 28px",
      fontSize: "19px",
      backgroundColor: "#4285F4",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "0.3s",
    },
    switchText: {
      marginTop: "20px",
      fontSize: "16px",
      color: "#666",
    },
    switchLink: {
      color: "#4285F4",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "underline",
    }
  };

  // Mobile overrides applied when isMobile is true
  const mobileOverrides = {
    container: {
      flexDirection: 'column',
      height: 'auto',
    },
    left: {
      display: 'none',
    },
    right: {
      minHeight: '100vh',
      width: '100%',
      padding: '30px 20px',
    },
    card: {
      padding: '30px 20px',
      maxWidth: '90vw', 
    }
  };

  // Merge base styles with mobile overrides if necessary
  const currentStyles = {
    container: isMobile ? { ...baseStyles.container, ...mobileOverrides.container } : baseStyles.container,
    left: isMobile ? { ...baseStyles.left, ...mobileOverrides.left } : baseStyles.left,
    right: isMobile ? { ...baseStyles.right, ...mobileOverrides.right } : baseStyles.right,
    card: isMobile ? { ...baseStyles.card, ...mobileOverrides.card } : baseStyles.card,
    // Other styles remain unchanged
    ...Object.fromEntries(Object.entries(baseStyles).filter(([key]) => !['container', 'left', 'right', 'card'].includes(key)))
  };


  // --- Render Function ---

  return (
    <div style={currentStyles.container}>
      {/* Left Visual Section */}
      <div style={currentStyles.left}>
        <img
          src="https://r2.erweima.ai/imgcompressed/img/compressed_6442881cc7b4b80d292436962878c47c.webp"
          alt="VoiceCare"
          style={currentStyles.image}
        />
      </div>

      {/* Right Login/Register Panel */}
      <div style={currentStyles.right}>
        <div style={currentStyles.card}>
          <h1 style={currentStyles.title}>Edubot</h1>
          <p style={currentStyles.tagline}>Welcome to EduBot, your smart AI-powered study companion.</p>
          <p style={currentStyles.tagline}>Ask questions, get instant answers, and make learning easier and faster!!.</p>
          
          {/* Dynamically Render Login or Register Form */}
          {isLoginView ? (
            <form onSubmit={handleLogin} style={currentStyles.form}>
              <h2 style={currentStyles.formTitle}>User Login</h2>
              
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={currentStyles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={currentStyles.input}
              />

              <button type="submit" style={currentStyles.mainBtn}>
                Login
              </button>

              <p style={currentStyles.switchText}>
                Don't have an account?{" "}
                <span
                  style={currentStyles.switchLink}
                  onClick={() => setIsLoginView(false)}
                >
                  Register
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={currentStyles.form}>
              <h2 style={currentStyles.formTitle}>User Register</h2>

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={currentStyles.input}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={currentStyles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={currentStyles.input}
              />

              <button type="submit" style={currentStyles.mainBtn}>
                Register
              </button>
              
              <p style={currentStyles.switchText}>
                Already have an account?{" "}
                <span
                  style={currentStyles.switchLink}
                  onClick={() => setIsLoginView(true)}
                >
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
