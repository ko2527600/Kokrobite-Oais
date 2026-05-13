import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  HiOutlineArrowLeft, HiOutlineEye, HiOutlineEyeSlash, 
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineBellAlert
} from "react-icons/hi2"
import api from "../../api/axios"
import { toast } from "react-hot-toast"

export default function DriverRegister() {
  const [step, setStep] = useState(1) // 1: Form, 2: Success
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    type: "freelance",
    vehicleType: "Motorcycle",
    vehicleNumber: "",
    licenseNumber: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const passwordStrength = (pwd) => {
    if (!pwd) return 0
    if (pwd.length < 5) return 1
    if (pwd.length < 8) return 2
    return 3
  }

  const strength = passwordStrength(formData.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions")
      return
    }

    setLoading(true)
    try {
      await api.post("/drivers/auth/register", {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        type: formData.type,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        licenseNumber: formData.licenseNumber
      })
      setStep(2)
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes("already registered")) {
        setError("Phone number already registered. Try logging in instead.")
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[440px]"
        >
          <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineCheckCircle className="text-[#10B981]" size={48} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-6">Application Submitted!</h2>
          
          <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl p-6 mb-8 text-left">
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Your driver application has been received. The Kokrobite Oasis management team will review your details and approve your account within 24 hours.
            </p>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">What happens next:</p>
            <div className="space-y-3">
              <StepItem icon={<HiOutlineCheckCircle className="text-[#10B981]" />} text="Application received" />
              <StepItem icon={<HiOutlineClock className="text-[#F59E0B]" />} text="Management review (24hrs)" />
              <StepItem icon={<HiOutlineBellAlert className="text-white/20" />} text="You receive approval notification" />
            </div>
          </div>

          <button 
            onClick={() => navigate("/delivery/login")}
            className="w-full bg-[#F97316] text-white font-bold py-4 rounded-xl hover:bg-[#F97316]/90 transition-all shadow-xl shadow-[#F97316]/20"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center p-6 py-10">
      <div className="w-full max-w-[440px]">
        {/* TOP SECTION */}
        <Link to="/delivery/login" className="inline-flex items-center gap-2 text-white/30 hover:text-[#F97316] transition-all text-[10px] uppercase font-bold tracking-widest mb-10">
          <HiOutlineArrowLeft size={14} /> Back to Login
        </Link>

        <div className="text-center mb-10">
          <span className="text-5xl block mb-4">🛵</span>
          <h1 className="text-4xl font-display italic font-bold text-white mb-1">KO Rider</h1>
          <p className="text-white/30 text-xs">by Kokrobite Oasis</p>
          <p className="text-[#F97316] text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Join our delivery team</p>
        </div>

        <div className="h-px bg-[#F97316]/15 w-full mb-10" />

        <h2 className="text-3xl font-display font-bold text-white mb-2">Create Driver Account</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-10">
          Fill in your details below. Your account will be reviewed before you can start delivering.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          {/* SECTION 1: PERSONAL INFO */}
          <div className="space-y-6">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Personal Information</p>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                required type="text" placeholder="John Mensah"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                required type="tel" placeholder="+233 XX XXX XXXX"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all"
              />
              <p className="text-[10px] text-white/20 ml-1">This will be your login ID</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  required type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all"
                >
                  {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${
                    i <= strength ? (strength === 1 ? 'bg-[#EF4444]' : strength === 2 ? 'bg-[#F59E0B]' : 'bg-[#10B981]') : 'bg-white/5'
                  }`} />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <input 
                  required type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                  value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all"
                />
                <button 
                  type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all"
                >
                  {showConfirmPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-[10px] text-[#10B981] font-bold mt-1.5 flex items-center gap-1">
                   <HiOutlineCheckCircle /> Passwords match
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-white/5 w-full" />

          {/* SECTION 2: VEHICLE INFO */}
          <div className="space-y-6">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Vehicle Information</p>
            
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <SelectionCard 
                  title="In-House" icon="🏢" sub="Employed by KO" 
                  selected={formData.type === 'inhouse'} 
                  onClick={() => setFormData({...formData, type: 'inhouse'})} 
                />
                <SelectionCard 
                  title="Freelance" icon="🚀" sub="Contractor" 
                  selected={formData.type === 'freelance'} 
                  onClick={() => setFormData({...formData, type: 'freelance'})} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Vehicle Type</label>
              <select 
                value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all appearance-none"
              >
                <option value="Motorcycle">🏍️ Motorcycle</option>
                <option value="Car">🚗 Car</option>
                <option value="Bicycle">🚲 Bicycle</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                Vehicle Registration Number <span className="text-white/20">(Optional)</span>
              </label>
              <input 
                type="text" placeholder="GR-1234-22"
                value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                Driver's License Number <span className="text-white/20">(Optional)</span>
              </label>
              <input 
                type="text" placeholder="DL-XXXXXXXX"
                value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-white/5 w-full" />

          {/* SECTION 3: TERMS */}
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" required
              checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 accent-[#F97316]"
            />
            <p className="text-white/50 text-xs leading-relaxed">
              I agree to the Kokrobite Oasis Driver Terms and Conditions
            </p>
          </div>

          {/* ERROR DISPLAY */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4"
              >
                <p className="text-[#EF4444] text-sm text-center font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl shadow-2xl shadow-[#F97316]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : "Submit Application 🛵"}
          </button>
        </form>
      </div>
    </div>
  )
}

function SelectionCard({ title, icon, sub, selected, onClick }) {
  return (
    <button 
      type="button" onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all ${
        selected 
          ? 'bg-[#F97316]/10 border-[#F97316]' 
          : 'bg-[#1a1a1a] border-white/5 hover:border-white/10'
      }`}
    >
      <p className="text-white text-sm font-semibold mb-0.5">{icon} {title}</p>
      <p className="text-[10px] text-white/40">{sub}</p>
    </button>
  )
}

function StepItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</div>
      <p className="text-white/60 text-xs font-medium">{text}</p>
    </div>
  )
}
