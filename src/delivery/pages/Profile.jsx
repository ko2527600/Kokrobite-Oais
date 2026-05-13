import React, { useState } from "react"
import { useDelivery } from "../DeliveryContext"
import { 
  User, Phone, Truck, ShieldCheck, LogOut, 
  Lock, ChevronRight, Circle, BadgeCheck, Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import api from "../../api/axios"

export default function DriverProfile() {
  const { driver, logout, refreshDriver } = useDelivery()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" })
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/drivers/auth/change-password", passwords)
      toast.success("Password updated successfully!")
      setShowPasswordModal(false)
      setPasswords({ currentPassword: "", newPassword: "" })
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* ── PROFILE HEADER ── */}
      <div className="text-center pt-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1C0A00] to-[#F97316] flex items-center justify-center border-4 border-white/5 shadow-2xl mx-auto">
            <span className="text-4xl font-['Playfair_Display'] text-white">
              {driver?.name?.charAt(0)}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-[#0C0A09] w-7 h-7 rounded-full flex items-center justify-center">
            <BadgeCheck size={14} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-['Playfair_Display'] text-white mt-4">{driver?.name}</h2>
        <p className="text-xs text-white/40 uppercase tracking-[0.2em] mt-1">{driver?.type} Rider</p>
      </div>

      {/* ── ACCOUNT STATUS ── */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Account Status</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Approved & Verified</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Circle size={8} className="fill-emerald-500 text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      {/* ── INFO LIST ── */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Personal Details</h3>
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          <ProfileItem icon={<Phone size={18}/>} label="Phone Number" value={driver?.phone} />
          <ProfileItem icon={<Truck size={18}/>} label="Vehicle Type" value={driver?.vehicleType} />
          <ProfileItem icon={<ShieldCheck size={18}/>} label="Vehicle Number" value={driver?.vehicleNumber} />
        </div>
      </div>

      {/* ── SETTINGS ── */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Security & App</h3>
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-white/30"><Lock size={18}/></div>
              <span className="text-sm font-medium text-white">Change Password</span>
            </div>
            <ChevronRight size={18} className="text-white/10" />
          </button>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 group transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-red-400/40 group-hover:text-red-400 transition-colors"><LogOut size={18}/></div>
              <span className="text-sm font-medium text-red-400">Logout Session</span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">KO Rider App v1.0.0</p>
      </div>

      {/* ── PASSWORD MODAL ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.form 
              onSubmit={handleChangePassword}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
            >
              <h3 className="text-xl font-['Playfair_Display'] text-white">Security Check</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Current Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwords.currentPassword}
                    onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwords.newPassword}
                    onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-white/30"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#F97316] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 flex items-center justify-center"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Update"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function ProfileItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="text-white/20">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-white mt-0.5">{value || 'Not provided'}</p>
      </div>
    </div>
  )
}
