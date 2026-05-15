import React, { useState, useEffect } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
import { useDelivery } from "./DeliveryContext"
import { LayoutGrid, Navigation, Wallet, User, Loader2, Truck } from "lucide-react"
import api from "../api/axios"
import { motion, AnimatePresence } from "framer-motion"

export default function DeliveryLayout() {
  const { driver, refreshDriver } = useDelivery()
  const [updating, setUpdating] = useState(false)
  const [hasActive, setHasActive] = useState(false)
  const location = useLocation()

  // Manifest Switcher
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]')
    if (link) link.href = "/rider-manifest.json"
    return () => {
      if (link) link.href = "/manifest.json"
    }
  }, [])

  // Active Delivery Check
  useEffect(() => {
    const checkActive = async () => {
      try {
        const res = await api.get("/drivers/orders/active")
        setHasActive(!!res.data)
      } catch (err) {}
    }
    checkActive()
    const interval = setInterval(checkActive, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleStatus = async () => {
    if (driver.status === "delivering" || updating) return
    setUpdating(true)
    try {
      const newStatus = driver.status === "online" ? "offline" : "online"
      await api.patch("/drivers/earnings/status", { status: newStatus })
      await refreshDriver()
    } catch (err) {
      console.error("Status update failed", err)
    } finally {
      setUpdating(false)
    }
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes("dashboard")) return "Dashboard"
    if (path.includes("active")) return "Active Order"
    if (path.includes("earnings")) return "Earnings"
    if (path.includes("profile")) return "Profile"
    return "KO Rider"
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white">
      {/* ── TOP HEADER ── */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#0C0A09]/95 backdrop-blur-xl border-b border-orange-500/10 flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-['Playfair_Display'] italic text-white shrink-0">
          KO Rider
        </h1>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-['Plus_Jakarta_Sans'] text-white/50 uppercase tracking-[0.2em]">
            {getPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {driver.status === "delivering" ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
              <Truck size={14} className="animate-bounce" />
              <span className="text-[11px] font-bold">Delivering</span>
            </div>
          ) : (
            <button
              onClick={toggleStatus}
              disabled={updating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
                driver.status === "online"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-white/5 border-white/10 text-white/40"
              }`}
            >
              {updating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <div className={`w-1.5 h-1.5 rounded-full ${driver.status === "online" ? "bg-emerald-500" : "bg-white/30"}`} />
              )}
              <span className="text-[11px] font-bold">
                {driver.status === "online" ? "Online" : "Offline"}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="pt-16 pb-20 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── BOTTOM NAVIGATION ── */}
      <nav className="fixed bottom-0 inset-x-0 h-20 bg-[#111111] border-t border-orange-500/10 flex items-center justify-around px-2 z-50">
        <NavLink 
          to="/delivery/dashboard" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-[#F97316]" : "text-white/30"}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#F97316] rounded-full mb-0.5" />}
              <LayoutGrid size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/delivery/active" 
          className={({ isActive }) => `relative flex flex-col items-center gap-1 transition-colors ${isActive ? "text-[#F97316]" : "text-white/30"}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#F97316] rounded-full mb-0.5" />}
              <div className="relative">
                <Navigation size={22} />
                {hasActive && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F97316] rounded-full border-2 border-[#111111] animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/delivery/earnings" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-[#F97316]" : "text-white/30"}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#F97316] rounded-full mb-0.5" />}
              <Wallet size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Earnings</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/delivery/profile" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-[#F97316]" : "text-white/30"}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#F97316] rounded-full mb-0.5" />}
              <User size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  )
}
