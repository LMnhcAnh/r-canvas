// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

const Login = () => {
  const [step, setStep] = useState("choice");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (mode) => {
    if (roomId.trim()) {
      const guestUser = {
        uid: "guest_" + Math.random().toString(36).substring(2, 10),
        nickname: "Guest_" + roomId,
        isAdmin: false,
      };
      localStorage.setItem("rCanvasUser", JSON.stringify(guestUser));
      localStorage.setItem("roomId", roomId);
      navigate(`/canvasboard?room=${roomId}&mode=${mode}`);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <span
          className="navbar-title"
          style={{
            fontSize: "60px",
            fontFamily: "'Rock Salt', cursive",
            fontWeight: "bold",
            color: "#ffccff",
          }}
        >
          Welcome to R/Canvas
        </span>
      </header>

      <div className="login-box">
        {step === "choice" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <button className="login-btn" onClick={() => setStep("pick")}>Pick a Room</button>
            <button className="login-btn" onClick={() => setStep("create")}>Create a Room</button>
          </div>
        )}

        {(step === "pick" || step === "create") && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <h2>{step === "pick" ? "Enter Room ID to Join" : "Enter New Room ID"}</h2>
            <input
              className="login-input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID"
            />
            <button className="login-btn" onClick={() => handleSubmit(step)}>
              {step === "pick" ? "Join Room" : "Create Room"}
            </button>
            <button className="login-btn" onClick={() => setStep("choice")}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
