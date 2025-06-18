import React, { useState, useEffect } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import bcrypt from "bcryptjs";
import { auth, db } from "../firebase";
import "../style/Login.css";

const Login = ({ onUserChange }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Handle Google auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          nickname: user.displayName || "Anonymous",
          email: user.email,
          photoURL: user.photoURL,
        };
        await setDoc(doc(db, "activeUsers", user.uid), {
          ...userData,
          active: true,
          timestamp: serverTimestamp(),
        });
        setCurrentUser(userData);
        onUserChange?.({
          ...userData,
          logout: async () => {
            await deleteDoc(doc(db, "activeUsers", user.uid));
            await signOut(auth);
            setCurrentUser(null);
            onUserChange(null);
          },
        });
        navigate("/canvasboard");
      }
    });

    return () => unsub();
  }, [onUserChange, navigate]);

  // Google login handler
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const user = auth.currentUser;

      // Show toast notification on successful login
      const toast = document.createElement("div");
      toast.innerText = "✅ Login Successful!";
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #c0f0d9;
        color: #DC77CD;
        padding: 12px 24px;
        border-radius: 999px;
        font-family: 'Rock Salt', cursive;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        z-index: 9999;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Store user data
      const userData = {
        uid: user.uid,
        nickname: user.displayName || "Anonymous",
        email: user.email,
      };

      onUserChange(userData);  // Pass data to parent (App.jsx)
      navigate("/canvasboard"); // Redirect after login
    } catch (err) {
      console.error("Google login failed", err);
      setError("Google login failed.");
    }
  };

  // Manual login handler
  const handleManualLogin = async () => {
    setError("");
    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setError("User not found.");
        return;
      }

      const userData = userSnap.data();
      const match = await bcrypt.compare(password, userData.password);
      if (!match) {
        setError("Incorrect password.");
        return;
      }

      const loginUser = {
        uid: userData.username,
        nickname: userData.fullName || userData.username,
        email: userData.email || "",
        isAdmin: userData.isAdmin,
      };

      await setDoc(doc(db, "activeUsers", userData.username), {
        ...loginUser,
        active: true,
        timestamp: serverTimestamp(),
      });

      setCurrentUser(loginUser);
      onUserChange?.({
        ...loginUser,
        logout: async () => {
          await deleteDoc(doc(db, "activeUsers", userData.username));
          setCurrentUser(null);
          onUserChange(null);
        },
      });

      // Show success toast
      const toast = document.createElement("div");
      toast.innerText = "✅ Login Successful!";
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

      navigate("/canvasboard"); // Redirect after login
    } catch (err) {
      setError("Login failed.");
    }
  };

  if (currentUser) return null;

  return (
    <div className="login-page">
      <header className="login-header">
        <span className="navbar-title" style={{ fontSize: "60px", fontFamily: "'Rock Salt', cursive", fontWeight: "bold", color: "#ffccff" }}>
          Welcome to R/Canvas
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
          type="password"
          placeholder="Password"
          className="login-input"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="login-buttons">
          <button onClick={handleManualLogin} className="login-btn">
            Login
          </button>
          <Link to="/signup" className="login-btn">
            Sign up
          </Link>
        </div>

        <div className="divider">
          <hr /> <span>or</span> <hr />
        </div>

        <button onClick={handleGoogleLogin} className="social-btn">
          <FaGoogle className="social-icon" style={{ fontSize: "30px" }} />
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
