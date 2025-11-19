import React, { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", { name, email, password });

      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #74ABE2, #5563DE)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          padding: "40px 30px",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Budget Tracker</h2>
        <p style={{ color: "#555", marginBottom: 25 }}>Create your account</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              display: "block",
              margin: "10px auto",
              padding: "10px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: "15px",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              margin: "10px auto",
              padding: "10px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: "15px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              margin: "10px auto",
              padding: "10px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: "15px",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 16px",
              width: "100%",
              marginTop: "15px",
              cursor: "pointer",
              background: "#5563DE",
              color: "#fff",
              fontSize: "16px",
              border: "none",
              borderRadius: 6,
              transition: "0.3s",
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
        
        <p style={{ marginTop: "20px", color: "#555" }}>
          Already have an account? <Link to="/login" style={{ color: "#5563DE", textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
