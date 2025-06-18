import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import CanvasBoard from "./components/CanvasBoard";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login using localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("rCanvasUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      
    }
    setLoading(false);
  }, []);

  // Define logout handler
  const logout = () => {
    localStorage.removeItem("rCanvasUser");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="login-page">
        <h2 style={{ fontFamily: "'Rock Salt', cursive", color: "#DC77CD" }}>
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user
            ? <Login onUserChange={setUser} />
            : <CanvasBoard user={{ ...user, isAdmin: user.isAdmin, logout }} />
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="/explore" element={<CanvasBoard user={null} />} />
      <Route path="/canvasboard" element={<CanvasBoard user={user} />} />
      <Route path="*" element={<div className="p-10">404 – Page Not Found</div>} />
    </Routes>
  );
}

export default App;
