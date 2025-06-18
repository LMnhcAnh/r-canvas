import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import bcrypt from "bcryptjs";
import "../style/Login.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setError("Username already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = username === "adminUsername"; // For example, hardcode admin as "adminUsername"

    await setDoc(userRef, {
      username,
      fullName,
      email,
      password: hashedPassword,
      isAdmin,
    });

    const loginUser = {
      uid: username,
      nickname: fullName || username,
      email,
      isAdmin,
    };

    // localStorage.setItem("rCanvasUser", JSON.stringify(loginUser));
    navigate("/");

    // after localStorage.setItem(...), before navigate("/")
    const toast = document.createElement("div");
    toast.innerText = "✅ Sign up Successful!";
    toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #adebeb;
    color: #DC77CD;
    padding: 12px 24px;
    border-radius: 999px;
    font-family: 'Rock Salt', cursive;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    z-index: 9999;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <span className="navbar-title" style={{
          fontSize: "60px",
          fontFamily: "'Rock Salt', cursive",
          fontWeight: "bold",
          color: "#ffccff"
        }}>
          Sign up to R/Canvas
        </span>
      </header>

      <div className="login-box">
        {error && <div className="login-error">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          className="login-input"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="login-input"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="login-buttons">
          <button onClick={handleSignup} className="login-btn">
            Create
          </button>
          <Link to="/" className="login-btn">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
