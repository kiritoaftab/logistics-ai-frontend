// src/App.jsx
import React, { use, useEffect } from "react";
import "reactflow/dist/style.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./sidebar/Sidebar";
import FlowPage from "./pages/FlowPage";
import Login from "./pages/LoginPage";

function FlowLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="flex w-screen h-screen bg-gray-50 text-gray-800 overflow-hidden">
      <Sidebar
        onToggleSidebar={() => setCollapsed((prev) => !prev)}
        collapsed={collapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <FlowPage />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const authToken = sessionStorage.getItem("auth_token");

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/flow"
          element={
            <ProtectedRoute>
              <FlowLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/flow" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
