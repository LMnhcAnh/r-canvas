// CanvasBoard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { onSnapshot, collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "../style/style.css";

const TILE_SIZE = 20;
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight - 73;

const CanvasBoard = ({ user }) => {
  const [params] = useSearchParams();
  const roomId = params.get("room");
  const isAdmin = user?.isAdmin;
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const [pixels, setPixels] = useState({});
  const [color, setColor] = useState("#000000");
  const [hoverTile, setHoverTile] = useState(null);

  useEffect(() => {
    if (!user || !user.uid || !roomId) {
      navigate("/");
    }
  }, [user, roomId, navigate]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, `pixels-${roomId}`), (snap) => {
      const pixelData = {};
      snap.forEach((doc) => {
        const [x, y] = doc.id.split("_").map(Number);
        pixelData[`${x}_${y}`] = doc.data().color;
      });
      setPixels(pixelData);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

    Object.entries(pixels).forEach(([key, color]) => {
      if (color === "#ffffff") return;
      const [x, y] = key.split("_").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
  }, [pixels]);

  const placePixel = async (x, y, erase = false) => {
    const tileId = `${x}_${y}`;
    const ref = doc(db, `pixels-${roomId}`, tileId);
    if (erase) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        color,
        updatedBy: user.uid,
      });
    }
  };

  const handleCanvasClick = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    const isRightClick = e.button === 2;
    placePixel(x, y, isRightClick);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    setHoverTile({ x, y });
  };

  const handleMouseLeave = () => setHoverTile(null);

  const handleExit = () => {
    localStorage.removeItem("rCanvasUser");
    localStorage.removeItem("roomId");
    navigate("/");
  };

  const handleEraseAll = async () => {
    if (!isAdmin) return;
    const ref = collection(db, `pixels-${roomId}`);
    const snap = await getDocs(ref);
    snap.forEach((doc) => deleteDoc(doc.ref));
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateColumns: "1fr",
        gridTemplateAreas: `
          'header'
          'canvas'
          'tools'
        `,
        height: "100vh",
        width: "100%",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <div style={{ gridArea: "header" }}>
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
          }}
        >
          <div style={{ fontSize: "28px", color: "#DC77CD" }}>R/CANVAS</div>

          {/* Color Picker */}
          <label style={{ fontSize: "40px", display: "flex", alignItems: "center", gap: "10px" }}>
            🎨
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: "40px",
                height: "30px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
          </label>

          <button
            onClick={handleExit}
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
            Exit Room
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ gridArea: "canvas", position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            backgroundColor: "#ffffff",
            cursor: "crosshair",
            display: "block",
            width: "100%",
            height: `${CANVAS_HEIGHT}px`,
          }}
        />
        {hoverTile && (
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

      {/* Tools */}
      <div
        style={{
          gridArea: "tools",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          backgroundColor: "#adebeb",
          padding: "10px",
        }}
      >
        {isAdmin && (
          <button
            onClick={handleEraseAll}
            style={{
              backgroundColor: "#ff6666",
              color: "white",
              fontWeight: "bold",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Erase All
          </button>
        )}
      </div>
    </div>
  );
};

export default CanvasBoard;
