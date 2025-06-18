import React, { useState, useEffect, useRef } from "react";
import "../style/style.css"; // Ensure you have the updated style.css for responsiveness
import {
  onSnapshot,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const TILE_SIZE = 20;
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight - 73; // Subtract top bar height

const CanvasBoard = ({ user }) => {
  const isReadOnly = !user || !user.uid;
  const isAdmin = user?.isAdmin;
  const canvasRef = useRef(null);
  const [pixels, setPixels] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [color, setColor] = useState("#000000");
  const [hoverTile, setHoverTile] = useState(null);

  useEffect(() => {
    const unsubPixels = onSnapshot(collection(db, "pixels"), (snap) => {
      const pixelData = {};
      snap.forEach((doc) => {
        const [x, y] = doc.id.split("_").map(Number);
        pixelData[`${x}_${y}`] = doc.data().color;
      });
      setPixels(pixelData);
    });

    const unsubActive = onSnapshot(collection(db, "activeUsers"), (snap) => {
      setActiveUsers(snap.docs.map((doc) => doc.data()));
    });

    const fetchAllUsers = async () => {
      const allSnap = await getDocs(collection(db, "activeUsers"));
      setAllUsers(allSnap.docs.map((doc) => doc.data()));
    };
    fetchAllUsers();

    return () => {
      unsubPixels();
      unsubActive();
    };
  }, []);

  // Draw canvas grid + pixels
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CANVAS_WIDTH; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Pixels
    Object.entries(pixels).forEach(([key, color]) => {
      if (color === "#ffffff") return;
      const [x, y] = key.split("_").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
  }, [pixels]);

  const placePixel = async (x, y, erase = false) => {
    if (isReadOnly) return;
    const tileId = `${x}_${y}`;
    if (erase) {
      await deleteDoc(doc(db, "pixels", tileId));
    } else {
      await setDoc(doc(db, "pixels", tileId), {
        color,
        updatedBy: user.uid,
      });
    }
  };

  const handleCanvasClick = (e) => {
    if (isReadOnly) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    const isRightClick = e.button === 2;
    placePixel(x, y, isRightClick);
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    setHoverTile({ x, y });
  };

  const handleMouseLeave = () => setHoverTile(null);

  const handleEraseAll = async () => {
    if (isReadOnly || !isAdmin) return;

    // Get all pixels and delete them
    const pixelsRef = collection(db, "pixels");
    const snapshot = await getDocs(pixelsRef);

    snapshot.forEach((doc) => {
      deleteDoc(doc.ref);  // Delete each pixel document
    });

    console.log("All pixels erased.");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* 🔝 Top Bar */}
      <div
        style={{
          height: "73px",
          backgroundColor: "#adebeb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 30px",
          fontFamily: "'Rock Salt', cursive",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontFamily: "'Rock Salt', cursive",
            fontWeight: "bold",
            color: "#DC77CD",
          }}
        >
          R/CANVAS
        </div>
        {/* Erase All Button */}
        {isAdmin && !isReadOnly && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <button
              onClick={handleEraseAll}
              style={{
                backgroundColor: "transparent",
                color: "black",
                fontWeight: "bold",
                padding: "12px 24px",
                borderRadius: "10px",
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Erase All
            </button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "20px", fontWeight: "500", color: "#DC77CD" }}>
            {user?.uid || "Guest"}
          </span>

          {isReadOnly ? (
            <a
              href="/"
              style={{
                backgroundColor: "transparent",
                color: "#DC77CD",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "16px",
                textDecoration: "none",
                fontFamily: "'Rock Salt', cursive",
              }}
            >
              Login / Sign Up
            </a>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem("rCanvasUser");
                window.location.href = "/explore"; // Redirect to guest canvas
              }}
              style={{
                backgroundColor: "transparent",
                color: "#DC77CD",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Rock Salt', cursive",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* 🖼 Canvas */}
      <div style={{ flexGrow: 1, width: "100%", position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={CANVAS_HEIGHT}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            backgroundColor: "#ffffff",
            cursor: isReadOnly ? "not-allowed" : "crosshair",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            display: "block",
            width: "100%",
            height: `${CANVAS_HEIGHT}px`,
          }}
        />
        {hoverTile && !isReadOnly && (
          <div
            style={{
              position: "absolute",
              top: hoverTile.y * TILE_SIZE + canvasRef.current.offsetTop,
              left: hoverTile.x * TILE_SIZE + canvasRef.current.offsetLeft,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: color,
              opacity: 0.3,
              border: "1px dashed #000",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        )}
      </div>

      {/* 🎨 Controls and User List */}
      <div className="w-full flex flex-col md:flex-row justify-between gap-6 px-10 pt-6 pb-10">
        <div className="flex items-center gap-10">
          <label className="ml-4 font-semibold">
            <span style={{ fontSize: "30px", fontWeight: "bold" }}>🎨</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="ml-2 border rounded p-1"
              disabled={isReadOnly}
            />
          </label>
          <p className="text-sm text-gray-700 font-mono ml-4 tracking-wide">
            {isReadOnly
              ? "🔒 View only – Login to draw"
              : "Left Click = Draw, Right Click = Erase"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-[#d8edef] p-4 rounded-3xl h-60 overflow-y-auto shadow-inner">
            <h2 className="font-bold mb-2">Active Users</h2>
            <ul className="list-disc pl-6">
              {activeUsers.map((user, idx) => (
                <li key={idx}>{user.nickname}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[#d8edef] p-4 rounded-3xl h-60 overflow-y-auto shadow-inner">
            <h2 className="font-bold mb-2">All Users</h2>
            <ul className="list-disc pl-6">
              {allUsers.map((user, idx) => (
                <li key={idx}>{user.nickname}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasBoard;
