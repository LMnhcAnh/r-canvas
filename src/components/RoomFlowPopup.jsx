// components/RoomFlowPopup.jsx
import React, { useState } from "react";
import "../style/style.css";

const RoomFlowPopup = ({ onRoomJoin }) => {
  const [step, setStep] = useState("choice");
  const [roomId, setRoomId] = useState("");

  const handleChoice = (option) => setStep(option);

  const handleSubmit = () => {
    if (roomId.trim()) {
      onRoomJoin(step, roomId.trim());
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        {step === "choice" && (
          <>
            <h2>Choose an option</h2>
            <button onClick={() => handleChoice("pick")}>Pick a Room</button>
            <button onClick={() => handleChoice("create")}>Create a Room</button>
          </>
        )}
        {step === "pick" && (
          <>
            <h2>Enter Room ID to Join</h2>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter existing Room ID"
            />
            <button onClick={handleSubmit}>Join Room</button>
            <button onClick={() => setStep("choice")}>Back</button>
          </>
        )}
        {step === "create" && (
          <>
            <h2>Create New Room</h2>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter new Room ID"
            />
            <button onClick={handleSubmit}>Create Room</button>
            <button onClick={() => setStep("choice")}>Back</button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomFlowPopup;
