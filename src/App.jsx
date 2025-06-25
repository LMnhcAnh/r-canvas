import React from "react";
import { Routes, Route } from "react-router-dom";
import CanvasBoard from "./components/CanvasBoard";
import Login from "./components/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/canvasboard" element={
        <CanvasBoard user={JSON.parse(localStorage.getItem("rCanvasUser"))} />
      } />
      <Route path="*" element={<div className="p-10">404 – Page Not Found</div>} />
    </Routes>
  );
}

export default App;
