import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../../api/axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone, MapPin, ExternalLink, Package, Box,
  CheckCircle2, Clock, Loader2, XCircle, ChevronRight
} from "lucide-react"
import { toast } from "react-hot-toast"
import ChatWindow from "../../components/Chat/ChatWindow"
import { useDelivery } from "../DeliveryContext"

export default function ActiveDelivery() {
  const { driver } = useDelivery()
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const navigate = useNavigate()

  const fetchActive = async () => {
    try {
      const res = await api.get("/drivers/orders/active")
      setDelivery(res.data)
    } catch (err) {
      console.error("Failed to fetch active delivery", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActive()
  }, [])

  // Geolocation Tracking
  useEffect(() => {
    if (!delivery || delivery.deliveredAt) return

    let watchId = null
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            await api.post("/drivers/update-location", { latitude, longitude })
          } catch (err) {
            console.error("Failed to update location", err)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [delivery?.id, delivery?.deliveredAt])

  const handlePickup = async () => {
    setUpdating(true)
    try {
      await api.post(`/drivers/orders/${delivery.orderId}/pickup`)
      toast.success("Pickup confirmed! Head to customer now")
      await fetchActive()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm pickup")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeliver = async () => {
    setUpdating(true)
    try {
      await api.post(`/drivers/orders/${delivery.orderId}/deliver`)
      // Fetch summary for today's earnings
      const sumRes = await api.get("/drivers/earnings/summary")
      setTodayEarnings(sumRes.data.todayEarnings)
      setShowSuccess(true)
      
      // Auto-navigate after 5 seconds
      setTimeout(() => {
        navigate("/delivery/dashboard")
      }, 5000)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm delivery")
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm("Cancel this delivery? The order will be returned to the available pool.")) return
    
    setUpdating(true)
    try {
      await api.post(`/drivers/orders/${delivery.orderId}/cancel`, {
        cancelReason: "Driver cancelled before pickup"
      })
      toast.success("Delivery cancelled")
      navigate("/delivery/dashboard")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel delivery")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
        <Box size={64} className="text-white/5 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-3xl font-['Playfair_Display'] text-white">No Active Delivery</h2>
          <p className="text-sm text-white/40 max-w-[240px]">
            Accept an order from the dashboard to start delivering
          </p>
        </div>
        <Link 
          to="/delivery/dashboard"
          className="bg-[#F97316] text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
        >
          Go to Dashboard <ChevronRight size={18} />
        </Link>
      </div>
    )
  }

  const { order } = delivery
  const currentStep = delivery.deliveredAt ? 4 : delivery.pickedUpAt ? 3 : 2

  return (
    <div className="relative pb-32">
      
      {/* ── TOP STATUS TRACKER ── */}
      <div className="bg-[#1a1a1a] border-b border-orange-500/10 p-6 -mx-4 -mt-4 mb-4">
        <div className="flex items-center justify-between relative px-2">
          {/* Progress Lines */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/10 -z-0">
            <div 
              className="h-full bg-[#F97316] transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>

          <Step dot={1} active={currentStep >= 1} done={currentStep > 1} label="Accepted" />
          <Step dot={2} active={currentStep === 2} done={currentStep > 2} label="Heading" />
          <Step dot={3} active={currentStep === 3} done={currentStep > 3} label="Picked Up" />
          <Step dot={4} active={currentStep === 4} done={currentStep > 4} label="Delivered" />
        </div>
      </div>

      {/* ── ORDER INFO CARD ── */}
      <div className="bg-[#1a1a1a] border border-orange-500/10 rounded-2xl p-5 shadow-xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[#F97316] text-[10px] font-bold uppercase tracking-widest">
              ORDER #{order.orderNumber}
            </p>
          </div>
          <p className="text-[10px] text-white/30 font-medium bg-white/5 px-2 py-1 rounded">
            Accepted {getTimeAgo(delivery.acceptedAt)}
          </p>
        </div>

        {/* CUSTOMER SECTION */}
        <section className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Customer</p>
          <div className="flex justify-between items-center gap-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{order.customer?.name}</h3>
              <p className="text-sm text-white/50 flex items-center gap-1.5 mt-0.5">
                <Phone size={14} className="text-emerald-500" />
                {order.customer?.phone}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowChat(true)}
                className="bg-orange-500/10 border border-orange-500/20 text-[#F97316] font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 active:bg-orange-500/20"
              >
                Chat
              </button>
              <a 
                href={`tel:${order.customer?.phone}`}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 active:bg-emerald-500/20"
              >
                <Phone size={14} /> Call
              </a>
            </div>
          </div>
        </section>

        <div className="h-px bg-white/5" />

        {/* ADDRESS SECTION */}
        <section className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Deliver To</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <MapPin className="text-orange-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white leading-tight">{order.deliveryAddress}</h3>
                <p className="text-sm text-white/40 mt-1">{order.deliveryArea} • {order.deliveryLandmark}</p>
              </div>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-orange-500/10 border border-orange-500/20 text-[#F97316] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 active:bg-orange-500/20"
            >
              <ExternalLink size={16} /> Open in Google Maps
            </a>
          </div>
        </section>

        <div className="h-px bg-white/5" />

        {/* ITEMS SECTION */}
        <section className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Order Items</p>
          <div className="divide-y divide-white/5">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <p className="text-sm text-white font-medium">
                  <span className="text-orange-500 mr-2">{item.quantity}x</span>
                  {item.name}
                </p>
                <p className="text-sm text-[#F97316] font-bold">GHC {item.subtotal}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TOTALS */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Amount</p>
            <p className="text-xl font-bold text-white">GHC {order.totalAmount}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Your Earning</p>
            <p className="text-base font-bold text-emerald-500">GHC 20.00</p>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTON ── */}
      <div className="fixed bottom-20 inset-x-0 bg-[#0C0A09]/80 backdrop-blur-md border-t border-white/5 p-4 z-40">
        <div className="max-w-[400px] mx-auto space-y-4">
          
          {currentStep === 2 ? (
            <div className="space-y-3">
              <button 
                onClick={handlePickup}
                disabled={updating}
                className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-widest py-4 rounded-xl shadow-[0_8px_25px_rgba(249,115,22,0.3)] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {updating ? <Loader2 className="animate-spin" /> : <>Confirm Pickup</>}
              </button>
              <p className="text-[11px] text-white/40 text-center font-medium">
                Tap when you have collected the order from Kokrobite Oasis
              </p>
              <button 
                onClick={handleCancel}
                className="w-full text-xs text-white/20 hover:text-red-400 py-1 transition-colors"
              >
                Cancel Delivery
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={handleDeliver}
                disabled={updating}
                className="w-full bg-gradient-to-br from-[#10B981] to-[#059669] text-white font-bold uppercase tracking-widest py-4 rounded-xl shadow-[0_8px_25px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {updating ? <Loader2 className="animate-spin" /> : <>Confirm Delivery</>}
              </button>
              <p className="text-[11px] text-white/40 text-center font-medium">
                Tap when you have delivered the order to the customer
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── SUCCESS MODAL ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#0C0A09]/98 z-[100] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <CheckCircle2 className="w-24 h-24 text-emerald-500 mb-6" />
            </motion.div>
            
            <h2 className="text-4xl font-['Playfair_Display'] text-white mb-2">Delivery Complete!</h2>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 mt-8 w-full max-w-[320px]">
              <p className="text-sm text-white/50 mb-1">You earned</p>
              <h3 className="text-6xl font-['Playfair_Display'] text-emerald-500 mb-2 font-bold">GHC 20</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">for this delivery</p>
              
              <div className="h-px bg-white/5 my-6" />
              
              <p className="text-white text-sm">
                Today's total: <span className="font-bold text-white">GHC {todayEarnings}</span>
              </p>
            </div>

            <button 
              onClick={() => navigate("/delivery/dashboard")}
              className="bg-[#F97316] text-white font-bold uppercase tracking-widest text-sm py-4 px-12 rounded-xl mt-12 w-full max-w-[320px] shadow-xl shadow-orange-500/20"
            >
              Back to Dashboard
            </button>
            <p className="text-white/20 text-[10px] uppercase tracking-widest mt-6">
              Returning automatically in a few seconds...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHAT OVERLAY ── */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <ChatWindow 
              orderId={delivery.orderId} 
              currentUser={driver} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function Step({ dot, active, done, label }) {
  return (
    <div className="flex flex-col items-center gap-2 z-10 relative">
      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
        done ? "bg-[#F97316] border-[#F97316]" : 
        active ? "bg-[#F97316] border-[#F97316] ring-4 ring-orange-500/20 scale-125" : 
        "bg-[#1a1a1a] border-white/20"
      }`}>
        {done && <CheckCircle2 size={10} className="text-white" />}
        {active && <div className="w-1 h-1 bg-white rounded-full animate-pulse" />}
      </div>
      <span className={`text-[8px] uppercase font-bold tracking-widest whitespace-nowrap transition-colors ${
        active ? "text-[#F97316]" : 
        done ? "text-white/60" : 
        "text-white/20"
      }`}>
        {label}
      </span>
    </div>
  )
}

function getTimeAgo(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 60000)
  if (diff < 1) return "just now"
  return `${diff}m ago`
}
