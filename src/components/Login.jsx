import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

const Login = () => {
  const [step, setStep] = useState("choice"); // Keeps track of current step in the login process
  const [roomId, setRoomId] = useState(""); // Stores the Room ID input by the user
  const navigate = useNavigate(); // Used for navigation after login

  // Handle form submission for either creating or joining a room
  const handleSubmit = (mode) => {
    if (roomId.trim()) { // Ensure roomId is not empty
      const guestUser = {
        uid: "guest_" + Math.random().toString(36).substring(2, 10), // Random UID for guest user
        nickname: "Guest_" + roomId, // Assign a nickname based on the room ID
        isAdmin: false, // Default admin status as false for guests
      };
      localStorage.setItem("rCanvasUser", JSON.stringify(guestUser)); // Store user data in localStorage
      localStorage.setItem("roomId", roomId); // Store room ID in localStorage
      navigate(`/canvasboard?room=${roomId}&mode=${mode}`); // Navigate to the canvas board with room and mode parameters
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
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
        {/* Step 1: Choose between creating or joining a room */}
        {step === "choice" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <button className="login-btn" onClick={() => setStep("pick")}>Pick a Room</button>
            <button className="login-btn" onClick={() => setStep("create")}>Create a Room</button>
          </div>
        )}

        {/* Step 2: Either pick a room or create a room */}
        {(step === "pick" || step === "create") && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <h2>{step === "pick" ? "Enter Room ID to Join" : "Enter New Room ID"}</h2>
            <input
              className="login-input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)} // Update roomId as user types
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
