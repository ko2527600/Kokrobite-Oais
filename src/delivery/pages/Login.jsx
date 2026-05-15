import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDelivery } from "../DeliveryContext"
import { Phone, Lock, Eye, EyeOff, ArrowLeft, Loader2, Clock, Bike } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DriverLogin() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  
  const { login } = useDelivery()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setIsPending(false)

    try {
      await login(phone, password)
      navigate("/delivery/dashboard")
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed"
      setError(msg)
      
      // Check for pending approval status (403)
      if (err.response?.status === 403 && msg.toLowerCase().includes("pending")) {
        setIsPending(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        
        {/* TOP SECTION */}
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-2 text-[#F97316]"
          >
            <Bike size={64} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-5xl font-['Playfair_Display'] italic text-white mb-1">
            KO Rider
          </h1>
          <p className="text-[12px] font-['Plus_Jakarta_Sans'] text-white/40 uppercase tracking-widest">
            by Kokrobite Oasis
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-[0.2em]">
              Deliver. Earn. Repeat.
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px w-full bg-orange-500/15 my-8" />

        {/* FORM SECTION */}
        <div>
          <h2 className="text-3xl font-['Playfair_Display'] text-white mb-1">
            Welcome Back
          </h2>
          <p className="text-[13px] font-['Plus_Jakarta_Sans'] text-white/40 mb-7">
            Sign in to start delivering
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${
                  isPending 
                    ? "bg-orange-500/10 border-orange-500/20 text-[#F97316]" 
                    : "bg-red-500/10 border-red-500/20 text-[#EF4444]"
                }`}
              >
                {isPending ? <Clock className="w-5 h-5 shrink-0" /> : null}
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-11 py-3.5 text-white text-sm focus:border-[#F97316] focus:ring-4 focus:ring-orange-500/10 transition-all outline-none placeholder:text-white/20"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-11 py-3.5 text-white text-sm focus:border-[#F97316] focus:ring-4 focus:ring-orange-500/10 transition-all outline-none placeholder:text-white/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl shadow-[0_8px_25px_rgba(249,115,22,0.35)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transition-shadow hover:shadow-[0_12px_35px_rgba(249,115,22,0.45)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Start Delivering 🛵</>
              )}
            </motion.button>
          </form>

          {/* BOTTOM LINKS */}
          <div className="mt-10 text-center space-y-6">
            <p className="text-sm text-white/30">
              New driver?{" "}
              <Link to="/delivery/register" className="text-[#F97316] font-semibold hover:underline">
                Register here
              </Link>
            </p>
            
            <Link 
              to="/portal/login" 
              className="inline-flex items-center gap-2 text-xs text-white/20 hover:text-[#F97316] transition-colors"
            >
              <ArrowLeft size={12} />
              Back to KO Eats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
