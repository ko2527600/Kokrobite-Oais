import React, { useState, useEffect } from "react"
import { useInstallPrompt } from "../hooks/useInstallPrompt"
import { motion, AnimatePresence } from "motion/react"
import AdminLogin from "./Login"
import { 
  HiDevicePhoneMobile, HiCheckCircle, HiLockClosed, 
  HiBolt, HiBell, HiChartBar 
} from "react-icons/hi2"

export default function AdminInstallGate() {
  const { isInstallable, isInstalled, 
          triggerInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [justInstalled, setJustInstalled] = useState(false)

  // Check if admin has previously installed or dismissed
  const hasInstalled = isInstalled || 
    localStorage.getItem("ko_admin_installed") === "true"

  const handleInstall = async () => {
    setInstalling(true)
    const success = await triggerInstall()
    setInstalling(false)
    if (success) {
      localStorage.setItem("ko_admin_installed", "true")
      setJustInstalled(true)
      setTimeout(() => setDismissed(true), 2000)
    }
  }

  // If already installed or dismissed after install
  if (hasInstalled || dismissed) {
    return <AdminLogin />
  }

  // Show install gate
  return (
    <div className="min-h-screen flex items-center 
      justify-center p-6 font-sans"
      style={{ background: "#0C0A09" }}>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <img src="/icons/logo.png" 
            alt="Kokrobite Oasis"
            className="w-24 h-24 rounded-2xl mx-auto mb-6 object-contain p-2 bg-white/5"
            style={{ border: "2px solid rgba(249,115,22,0.3)" }}/>
          <h1 className="font-display text-white text-4xl font-bold tracking-tight">
            Kokrobite
            <span className="text-[#F97316]"> Oasis</span>
          </h1>
          <div className="inline-block bg-[#F97316]/15 px-4 py-1.5 rounded-full mt-3">
            <p className="text-[#F97316] text-[10px] font-bold uppercase tracking-[.25em]">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Install card */}
        <div className="rounded-[2.5rem] p-10 mb-6"
          style={{ 
            background: "#1C0A00",
            border: "1px solid rgba(249,115,22,0.1)"
          }}>
          
          {justInstalled ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4">
              <div className="text-5xl mb-4 text-[#F97316] flex justify-center">
                ✅
              </div>
              <h2 className="text-[#F97316] font-display font-bold text-2xl mb-2">
                KO Admin Installed!
              </h2>
              <p className="text-[#F97316]/60 text-sm font-sans">
                Redirecting to login...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="text-5xl mb-5 text-[#F97316] flex justify-center">
                <HiDevicePhoneMobile size={64} />
              </div>
              
              <h2 className="text-white font-display font-bold text-2xl mb-3 uppercase tracking-tight">
                Install Required
              </h2>
              
              <p className="text-white/50 text-sm font-sans leading-relaxed mb-8">
                For security and the best experience, 
                you must install the 
                <span className="text-[#F97316] font-bold">
                  {" "}KO Admin App{" "}
                </span>
                before accessing the dashboard.
              </p>

               <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: "🔒", text: "Secure restaurant management" },
                  { icon: "⚡", text: "Faster dashboard performance" },
                  { icon: "🔔", text: "Real-time order notifications" },
                  { icon: "🌴", text: "Beach bar inventory control" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center 
                    gap-3 text-sm text-white/60">
                    <span className="text-[#F97316]">{b.icon}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>

               {isInstallable ? (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full py-5 rounded-xl 
                    text-white font-bold text-sm uppercase 
                    tracking-wider transition-all 
                    hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60
                    flex items-center justify-center gap-3 cursor-pointer shadow-2xl"
                  style={{ 
                    background: "linear-gradient(135deg, #F97316, #FB923C)",
                    boxShadow: "0 10px 30px rgba(249,115,22,0.30)"
                  }}>
                  {installing ? (
                    <>
                      <div className="w-4 h-4 border-2 
                        border-white/30 border-t-white 
                        rounded-full animate-spin"/>
                      Installing...
                    </>
                  ) : (
                    <>
                      <span>📲</span>
                      Install KO Admin App
                    </>
                  )}
                </button>
              ) : (
                <div className="rounded-xl p-4 text-sm"
                  style={{ 
                    background: "rgba(249,115,22,0.10)",
                    border: "1px solid rgba(249,115,22,0.20)"
                  }}>
                  <p className="text-[#F97316] font-bold mb-2 font-display uppercase tracking-wider">
                    How to install manually:
                  </p>
                  <p className="text-white/50 text-xs 
                    leading-relaxed">
                    Chrome: Click the install icon (⊕) 
                    in the address bar.<br/>
                    Safari iOS: Tap Share → 
                    "Add to Home Screen".<br/>
                    Edge: Click ··· → Apps → 
                    "Install this site as an app".
                  </p>
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "ko_admin_installed", "true"
                      )
                      setDismissed(true)
                    }}
                    className="mt-4 text-[#F97316] font-bold
                      text-xs underline cursor-pointer uppercase tracking-widest">
                    I've installed it manually → Continue
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
          Kokrobite Oasis Admin Portal · Secured Access
        </p>
      </motion.div>
    </div>
  )
}
