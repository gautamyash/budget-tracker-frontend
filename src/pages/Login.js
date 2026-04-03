import React, { useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { Wallet, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(username, password);

      if (!data.access) {
        setError("Invalid response from server");
        return;
      }

      localStorage.setItem("token", data.access);
      // Use replace to prevent going back to login
      window.location.replace("/");
    } catch (err) {
      console.error("Login error:", err);

      if (err.message.includes("Timeout")) {
        setError("Connection timeout. Server may be starting up.");
      } else if (err.message.includes("HTTP 401")) {
        setError("Invalid username or password.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#0f172a",
        backgroundImage:
          "radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)",
        backgroundSize: "40px 40px",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: "440px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{
              display: "inline-flex",
              backgroundColor: "#6366f1",
              padding: "16px",
              borderRadius: "20px",
              marginBottom: "20px",
              boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.5)",
            }}
          >
            <Wallet size={32} color="white" />
          </motion.div>
          <h1
            style={{
              color: "white",
              fontSize: "2.25rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
            }}
          >
            StashDash
          </h1>
          <p style={{ color: "#94a3b8", marginTop: "8px", fontSize: "1.1rem" }}>
            Your personal finance, reimagined.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "40px",
            borderRadius: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              >
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  padding: "14px 14px 14px 48px",
                  backgroundColor: "rgba(15, 23, 42, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "1rem",
                  borderRadius: "16px",
                  outline: "none",
                  width: "100%",
                  transition: "all 0.2s",
                }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              >
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: "14px 14px 14px 48px",
                  backgroundColor: "rgba(15, 23, 42, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "1rem",
                  borderRadius: "16px",
                  outline: "none",
                  width: "100%",
                  transition: "all 0.2s",
                }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  color: "#f87171",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: "14px",
                borderRadius: "16px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                fontSize: "1rem",
                width: "100%",
                marginTop: "10px",
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Demo access:{" "}
              <span style={{ color: "#94a3b8" }}>admin / admin123</span>
            </p>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#475569",
            marginTop: "32px",
            fontSize: "0.875rem",
          }}
        >
          &copy; 2026 StashDash Inc. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
