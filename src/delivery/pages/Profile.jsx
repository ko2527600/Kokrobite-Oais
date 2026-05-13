import React, { useState, useEffect } from "react"
import { useDelivery } from "../DeliveryContext"
import { 
  Phone, Truck, ShieldCheck, LogOut, Lock, 
  ChevronRight, Circle, BadgeCheck, Loader2, 
  Eye, EyeOff, User, MessageSquare, ExternalLink
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import api from "../../api/axios"

export default function DriverProfile() {
  const { driver, logout, refreshDriver } = useDelivery()
  const [loading, setLoading] = useState(false)
  const [showConfirmLogout, setShowConfirmLogout] = useState(false)
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: driver?.name || "",
    vehicleType: driver?.vehicleType || "Motorcycle",
    vehicleNumber: driver?.vehicleNumber || "",
    avatar: driver?.avatar || "",
    vehicleImage: driver?.vehicleImage || ""
  })

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    if (driver) {
      setProfileForm({
        name: driver.name,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        avatar: driver.avatar || "",
        vehicleImage: driver.vehicleImage || ""
      })
    }
  }, [driver])

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Max 1MB check
    if (file.size > 1024 * 1024) {
      return toast.error("Image too large! Please use a smaller file (max 1MB).")
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, [field]: reader.result }))
      toast.success(`${field === 'avatar' ? 'Profile' : 'Vehicle'} photo updated locally. Save to apply.`)
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put("/drivers/auth/profile", profileForm)
      toast.success("Profile updated! ✅")
      refreshDriver()
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match")
    }
    setLoading(true)
    try {
      await api.post("/drivers/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      toast.success("Password updated! 🔐")
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (pass) => {
    if (!pass) return 0
    let strength = 0
    if (pass.length > 6) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[^A-Za-z0-9]/.test(pass)) strength++
    return strength
  }

  const strength = getPasswordStrength(passwords.newPassword)
  const strengthColor = strength < 2 ? "#EF4444" : strength < 4 ? "#F59E0B" : "#10B981"

  return (
    <div className="space-y-4 pb-20">
      
      {/* ── TOP PROFILE CARD ── */}
      <div className="bg-[#1a1a1a] border border-[#F97316]/10 rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="relative inline-block group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1C0A00] to-[#F97316] border-[3px] border-[#F97316]/30 flex items-center justify-center mx-auto shadow-xl overflow-hidden">
            {profileForm.avatar ? (
              <img src={profileForm.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[36px] font-['Playfair_Display'] text-white">
                {driver?.name?.charAt(0)}
              </span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-[#F97316] p-2 rounded-full border-2 border-[#1a1a1a] cursor-pointer shadow-lg active:scale-90 transition-transform">
            <User size={14} className="text-white" />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </label>
        </div>

        <h2 className="text-2xl font-['Playfair_Display'] text-white mt-3 leading-tight">{driver?.name}</h2>
        <p className="text-sm text-white/40 mt-1">{driver?.phone}</p>

        <div className="mt-2 flex justify-center">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            driver?.type === 'inhouse' 
            ? 'bg-blue-500/15 text-blue-400' 
            : 'bg-[#F97316]/15 text-[#F97316]'
          }`}>
            {driver?.type === 'inhouse' ? 'In-House Driver' : 'Freelance Driver'}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-2xl font-['Playfair_Display'] text-white">{driver?.totalDeliveries || 0}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Deliveries</p>
          </div>
          <div className="border-x border-white/5 text-center">
            <p className="text-2xl font-['Playfair_Display'] text-white">⭐ {driver?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-['Playfair_Display'] text-white">GHC {driver?.totalEarnings?.toFixed(0) || 0}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Earned</p>
          </div>
        </div>
      </div>

      {/* ── APPROVAL STATUS ── */}
      {driver?.isApproved ? (
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <BadgeCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#10B981]">Account Approved</p>
            <p className="text-[10px] text-white/40 mt-0.5">You are cleared to deliver for Kokrobite Oasis</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
            <Circle size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-500">Pending Approval</p>
            <p className="text-[10px] text-white/40 mt-0.5">Contact Kokrobite Oasis management to get approved</p>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE FORM ── */}
      <div className="bg-[#1a1a1a] border border-[#F97316]/5 rounded-2xl p-5">
        <h3 className="text-lg font-['Playfair_Display'] text-white mb-4">Personal Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              value={profileForm.name}
              onChange={e => setProfileForm({...profileForm, name: e.target.value})}
              className="w-full bg-[#111111] border border-white/10 focus:border-[#F97316] outline-none rounded-xl px-4 py-3 text-white text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative">
              <input 
                type="text" 
                disabled 
                value={driver?.phone || ""}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-white/30 text-sm cursor-not-allowed"
              />
              <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Vehicle Type</label>
              <select 
                value={profileForm.vehicleType}
                onChange={e => setProfileForm({...profileForm, vehicleType: e.target.value})}
                className="w-full bg-[#111111] border border-white/10 focus:border-[#F97316] outline-none rounded-xl px-4 py-3 text-white text-sm"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Car">Car</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Vehicle No.</label>
              <input 
                type="text" 
                placeholder="GR-1234-22"
                value={profileForm.vehicleNumber}
                onChange={e => setProfileForm({...profileForm, vehicleNumber: e.target.value})}
                className="w-full bg-[#111111] border border-white/10 focus:border-[#F97316] outline-none rounded-xl px-4 py-3 text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Vehicle Photo</label>
            <div 
              className="w-full h-32 bg-[#111111] border border-white/10 rounded-xl overflow-hidden relative cursor-pointer hover:border-[#F97316]/40 transition-colors"
              onClick={() => document.getElementById('vehicleUpload').click()}
            >
              {profileForm.vehicleImage ? (
                <img src={profileForm.vehicleImage} alt="Vehicle" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <Truck size={24} className="text-white/10" />
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Upload Vehicle Photo</p>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-[#F97316] p-2 rounded-full shadow-lg">
                <ExternalLink size={12} className="text-white" />
              </div>
              <input 
                id="vehicleUpload" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, 'vehicleImage')} 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase text-xs tracking-widest py-4 rounded-xl mt-2 flex items-center justify-center"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>

      {/* ── CHANGE PASSWORD ── */}
      <div className="bg-[#1a1a1a] border border-[#F97316]/5 rounded-2xl p-5">
        <h3 className="text-lg font-['Playfair_Display'] text-white mb-4">Change Password</h3>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrent ? "text" : "password"}
                required
                value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                className="w-full bg-[#111111] border border-white/10 focus:border-[#F97316] outline-none rounded-xl px-4 py-3 text-white text-sm"
              />
              <button 
                type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"}
                required
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                className="w-full bg-[#111111] border border-white/10 focus:border-[#F97316] outline-none rounded-xl px-4 py-3 text-white text-sm"
              />
              <button 
                type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength Bar */}
            {passwords.newPassword && (
              <div className="px-1 pt-1">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strengthColor }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Confirm Password</label>
            <input 
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
              className="w-full bg-[#111111] border border-white/10 focus:border-[#F97316] outline-none rounded-xl px-4 py-3 text-white text-sm"
            />
            {passwords.newPassword && passwords.newPassword === passwords.confirmPassword && (
              <p className="text-[10px] text-[#10B981] font-bold mt-1 ml-1 uppercase tracking-widest">✓ Passwords match</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1C0A00] border border-[#F97316]/30 text-[#F97316] font-bold uppercase text-xs tracking-widest py-4 rounded-xl mt-2 flex items-center justify-center"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* ── SUPPORT ── */}
      <div className="bg-[#1a1a1a] border border-[#F97316]/5 rounded-2xl p-5">
        <h3 className="text-lg font-['Playfair_Display'] text-white mb-4">Support</h3>
        <div className="space-y-1">
          <SupportRow icon={<Phone size={16}/>} label="Call Kokrobite Oasis" href="tel:+233240000000" />
          <SupportRow icon={<MessageSquare size={16}/>} label="WhatsApp Support" href="https://wa.me/233240000000" target="_blank" />
          <SupportRow icon={<ShieldCheck size={16}/>} label="Delivery Guidelines" isLink={false} />
        </div>
      </div>

      {/* ── LOGOUT ── */}
      <button 
        onClick={() => setShowConfirmLogout(true)}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase text-xs tracking-widest py-5 rounded-xl flex items-center justify-center gap-3 active:bg-red-500/20"
      >
        <LogOut size={20} /> Sign Out
      </button>

      {/* ── LOGOUT MODAL ── */}
      <AnimatePresence>
        {showConfirmLogout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirmLogout(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xs bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <LogOut size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Sign Out?</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  You will need to log back in to continue delivering orders.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmLogout(false)}
                  className="flex-1 py-4 text-xs font-bold text-white/30 uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={logout}
                  className="flex-1 bg-red-500 text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function SupportRow({ icon, label, href, target, isLink = true }) {
  const Content = (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0 group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="text-white/20 group-hover:text-[#F97316] transition-colors">{icon}</div>
        <span className="text-sm text-white group-hover:translate-x-1 transition-transform">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/10" />
    </div>
  )

  if (!isLink) return Content
  return <a href={href} target={target} rel="noreferrer" className="block no-underline">{Content}</a>
}
