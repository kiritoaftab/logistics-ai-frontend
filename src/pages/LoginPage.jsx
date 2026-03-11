import React, { useState } from "react";
import { Eye, EyeOff, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AUTH_BASE_URL } from "../constant";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post(`${AUTH_BASE_URL}/auth/login`, credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { success, message, data } = res.data;

      if (success) {
        sessionStorage.setItem("auth_token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        toast.success(message || "Access granted");
        navigate("/flow");
      } else {
        toast.error(message || "Authentication failed");
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Authentication failed";
      console.error("Login error:", error);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {" "}
      {/* <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" /> */}
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/6 rounded-full blur-2xl pointer-events-none" />
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative"
            style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
          >
            <Zap size={28} className="text-white" />
            <div
              className="absolute inset-0 rounded-2xl blur-lg opacity-60"
              style={{
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              }}
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4 ml-4">
            <Sparkles size={12} className="text-blue-400" />
            <span className="text-blue-400 text-xs font-medium tracking-wider uppercase">
              AI-Powered Platform
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {" "}
            Logistics Intelligence
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {" "}
            Powered by advanced AI to automate your supply chain
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-gray-200 p-8 relative shadow-lg"
          style={{
            background: "#ffffff",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-8 right-8 h-px rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(37,99,235,0.6), transparent)",
            }}
          />

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {" "}
              Authenticate to continue
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access the AI workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm placeholder-gray-400"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(37,99,235,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm placeholder-gray-600 outline-none transition-all duration-200 pr-12"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(37,99,235,0.5)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isLoading
                  ? "rgba(37,99,235,0.5)"
                  : "linear-gradient(135deg, #2563eb, #3b82f6)",
                boxShadow: isLoading ? "none" : "0 0 24px rgba(37,99,235,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  e.currentTarget.style.boxShadow =
                    "0 0 36px rgba(37,99,235,0.55)";
              }}
              onMouseLeave={(e) => {
                if (!isLoading)
                  e.currentTarget.style.boxShadow =
                    "0 0 24px rgba(37,99,235,0.35)";
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Access AI Workspace
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Secured with end-to-end encryption &nbsp;&middot;&nbsp; AI-monitored
            access
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-gray-700 text-xs mt-6">
          Intelligent logistics, reimagined with AI
        </p>
      </div>
    </div>
  );
};

export default Login;
