// src/App.jsx
import React from "react";
import "reactflow/dist/style.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./sidebar/Sidebar";
import FlowPage from "./pages/FlowPage";

function FlowLayout() {
  const [collapsed, setCollapsed] = React.useState(false);

  const user = {
    name: "John Smith",
  };

  return (
    <div className="flex w-screen h-screen bg-gray-50 text-gray-800 overflow-hidden">
      <Sidebar
        user={user}
        onLogout={() => {}}
        onToggleSidebar={() => setCollapsed((prev) => !prev)}
        collapsed={collapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <FlowPage />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FlowLayout />} />
        <Route path="/flow" element={<FlowLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
