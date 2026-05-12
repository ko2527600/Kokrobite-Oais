import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiChartBar, HiBolt } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password, rememberMe });
      login(response.data.user, response.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#0C0A09] overflow-hidden">
      {/* Left Column - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
         <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover scale-110"
          alt="Admin Background"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.75), rgba(28,10,0,0.85))' }} />
        
        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          <div className="flex flex-col gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center p-3 shadow-2xl overflow-hidden backdrop-blur-md border border-white/10">
              <img src="/icons/logo.png" alt="KO" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-6xl font-display font-bold text-white mb-2">Kokrobite Oasis</h1>
              <p className="text-white/80 text-2xl font-display font-bold uppercase tracking-tight mb-4">Admin Portal</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            {[
              { icon: <HiLockClosed size={14} />, text: "Secure Admin Portal" },
              { icon: <HiChartBar size={14} />, text: "Full Analytics" },
              { icon: <HiBolt size={14} />, text: "Real-time Updates" }
            ].map((pill) => (
              <span key={pill.text} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white border border-white/10 font-bold whitespace-nowrap">
                <span className="text-[#F97316]">{pill.icon}</span>
                {pill.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 bg-[#0C0A09] flex items-center justify-center p-8 md:p-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 blur-[120px] rounded-full lg:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-12">
            <h2 className="text-5xl font-display font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-[#F97316] font-bold tracking-widest uppercase text-xs font-sans">KO Admin Portal</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl text-sm font-medium border mb-6"
                style={{ 
                  color: '#DC2626', 
                  backgroundColor: '#FEF2F2', 
                  borderColor: '#FECACA' 
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white/50 text-xs font-bold uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group">
                <HiEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#F97316] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all font-sans"
                  placeholder="admin@kokrobiteoasis.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs font-bold uppercase tracking-widest ml-4">Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#F97316] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all font-sans"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-[#F97316] cursor-pointer rounded-lg"
              />
              <label htmlFor="rememberMe" className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors">
                Keep me logged in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-5 rounded-2xl font-bold text-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-[#F97316]/20 font-sans"
              style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', boxShadow: '0 8px 25px rgba(249,115,22,0.35)' }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Default Credentials</p>
              <p className="text-xs text-white/60 font-sans">Email: admin@kokrobiteoasis.com</p>
              <p className="text-xs text-white/60 font-sans">Pass: KokrobiteAdmin2026!</p>
            </div>
          </form>

          <div className="mt-12 text-center space-y-4">
            <p className="text-[#1C0A00]/20 text-[10px] font-bold uppercase tracking-widest">
              Admin Support: help@kokrobiteoasis.com
            </p>
            <div className="pt-4">
               <a href="https://kokrobiteoasis.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[rgba(28,10,0,0.30)] hover:text-[#F97316] uppercase tracking-widest transition-colors">
                  ← Visit Kokrobite Oasis Website
               </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
