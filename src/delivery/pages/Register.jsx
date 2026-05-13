import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Phone, Lock, User, Truck, Hash, CreditCard, ArrowLeft, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../api/axios"
import { toast } from "react-hot-toast"

export default function DriverRegister() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    vehicleType: "Motorcycle",
    vehicleNumber: "",
    licenseNumber: "",
    type: "freelance"
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/drivers/auth/register", formData)
      toast.success("Registration successful! Awaiting admin approval.")
      navigate("/delivery/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-[440px] space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <Link to="/delivery/login" className="inline-flex items-center gap-2 text-white/20 hover:text-[#F97316] transition-colors text-xs uppercase tracking-widest font-bold mb-4">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <h1 className="text-4xl font-['Playfair_Display'] text-white">Join the Fleet</h1>
          <p className="text-[13px] text-white/40 font-['Plus_Jakarta_Sans']">Register as a KO Rider and start earning</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-[2rem] p-8 space-y-5 shadow-2xl">
            
            {/* Personal Info */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest border-b border-white/5 pb-2">Personal Details</p>
              
              <InputGroup label="Full Name" icon={<User size={18}/>}>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="input-field" />
              </InputGroup>

              <InputGroup label="Phone Number" icon={<Phone size={18}/>}>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+233 XX XXX XXXX" required className="input-field" />
              </InputGroup>

              <InputGroup label="Password" icon={<Lock size={18}/>}>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="input-field" />
              </InputGroup>
            </div>

            {/* Vehicle Info */}
            <div className="space-y-4 pt-4">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest border-b border-white/5 pb-2">Vehicle & License</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Vehicle Type</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none appearance-none">
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Work Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none appearance-none">
                    <option value="freelance">Freelance</option>
                    <option value="inhouse">In-house</option>
                  </select>
                </div>
              </div>

              <InputGroup label="Vehicle Number" icon={<Hash size={18}/>}>
                <input name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="GW-1234-24" required className="input-field" />
              </InputGroup>

              <InputGroup label="License Number" icon={<CreditCard size={18}/>}>
                <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="LICENSE-XXXXX" required className="input-field" />
              </InputGroup>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Submit Application 🚀"}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 leading-relaxed">
          By registering, you agree to Kokrobite Oasis driver terms. Your application will be reviewed by management within 24-48 hours.
        </p>

      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          font-size: 0.875rem;
          color: white;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: #F97316;
          background: rgba(0,0,0,0.3);
          box-shadow: 0 0 0 4px rgba(249,115,22,0.1);
        }
      `}</style>
    </div>
  )
}

function InputGroup({ label, icon, children }) {
  return (
    <div className="space-y-1.5 relative">
      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
          {icon}
        </div>
        {children}
      </div>
    </div>
  )
}
