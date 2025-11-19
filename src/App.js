import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions"
          element={token ? <Transactions /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
