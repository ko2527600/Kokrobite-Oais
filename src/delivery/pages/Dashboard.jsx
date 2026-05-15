import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDelivery } from "../DeliveryContext"
import api from "../../api/axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wallet, Truck, TrendingUp, CheckCircle, MapPin, Circle, 
  ChevronRight, Box, Loader2, RefreshCcw 
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function DriverDashboard() {
  const { driver, refreshDriver } = useDelivery()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [activeOrder, setActiveOrder] = useState(null)
  const [availableOrders, setAvailableOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [acceptingId, setAcceptingId] = useState(null)

  const fetchData = async (initial = false) => {
    if (initial) setLoading(true)
    else setIsRefreshing(true)

    try {
      const [sumRes, activeRes, availRes] = await Promise.all([
        api.get("/drivers/earnings/summary"),
        api.get("/drivers/orders/active"),
        api.get("/drivers/orders/available")
      ])
      setSummary(sumRes.data)
      setActiveOrder(activeRes.data)
      setAvailableOrders(availRes.data)
    } catch (err) {
      console.error("Dashboard fetch error", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData(true)

    const availInterval = setInterval(async () => {
      try {
        const res = await api.get("/drivers/orders/available")
        setAvailableOrders(prev => {
          if (JSON.stringify(prev) === JSON.stringify(res.data)) return prev
          return res.data
        })
      } catch (e) {}
    }, 20000)

    const activeInterval = setInterval(async () => {
      try {
        const res = await api.get("/drivers/orders/active")
        setActiveOrder(prev => {
          if (JSON.stringify(prev) === JSON.stringify(res.data)) return prev
          return res.data
        })
      } catch (e) {}
    }, 15000)

    const sumInterval = setInterval(async () => {
      try {
        const res = await api.get("/drivers/earnings/summary")
        setSummary(prev => {
          if (JSON.stringify(prev) === JSON.stringify(res.data)) return prev
          return res.data
        })
      } catch (e) {}
    }, 60000)

    return () => {
      clearInterval(availInterval)
      clearInterval(activeInterval)
      clearInterval(sumInterval)
    }
  }, [])

  const handleAccept = async (orderId) => {
    setAcceptingId(orderId)
    try {
      await api.post(`/drivers/orders/${orderId}/accept`)
      toast.success("Order accepted!")
      navigate("/delivery/active")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept order")
    } finally {
      setAcceptingId(null)
    }
  }

  const goOnline = async () => {
    try {
      await api.patch("/drivers/earnings/status", { status: "online" })
      await refreshDriver()
      fetchData()
    } catch (err) {
      toast.error("Failed to go online")
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-4">
      
      {/* ── DRIVER GREETING CARD ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1C0A00] to-[#F97316] rounded-2xl p-5 shadow-xl">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">
              {getGreeting()}
            </p>
            <h2 className="text-2xl font-['Playfair_Display'] text-white mb-2">
              {driver?.name}
            </h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                driver?.status === 'online' ? 'bg-emerald-400' : 
                driver?.status === 'delivering' ? 'bg-orange-400' : 'bg-white/40'
              }`} />
              <span className="text-[11px] font-medium text-white/80">
                {driver?.status === 'online' ? 'You are online' : 
                 driver?.status === 'delivering' ? 'On delivery' : 'You are offline'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-['Playfair_Display'] text-white">
              {driver?.rating.toFixed(1)}<span className="text-2xl">★</span>
            </p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Rating</p>
          </div>
        </div>
        {/* Background Accent */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          label="Today's Earnings" 
          value={`GHS ${summary?.todayEarnings || 0}`} 
          icon={<Wallet className="text-orange-500 w-4 h-4" />} 
          type="primary"
        />
        <StatCard 
          label="Delivered Today" 
          value={summary?.todayDeliveries || 0} 
          icon={<Truck className="text-orange-500 w-4 h-4" />} 
          type="primary"
        />
        <StatCard 
          label="All Time Earnings" 
          value={`GHS ${summary?.totalEarnings || 0}`} 
          icon={<TrendingUp className="text-emerald-500 w-4 h-4" />} 
          type="secondary"
        />
        <StatCard 
          label="All Time Trips" 
          value={summary?.totalDeliveries || 0} 
          icon={<CheckCircle className="text-emerald-500 w-4 h-4" />} 
          type="secondary"
        />
      </div>

      {/* ── ACTIVE DELIVERY BANNER ── */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout={false}
            className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-[#F97316] font-bold text-xs uppercase tracking-wider">Active Delivery</span>
              </div>
              <span className="text-white/30 text-[10px] font-mono">#{activeOrder.order?.orderNumber}</span>
            </div>

            <div className="space-y-1 mb-4">
              <p className="font-bold text-white text-base">{activeOrder.order?.customer?.name}</p>
              <div className="flex items-start gap-1.5 text-white/60 text-sm">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span className="line-clamp-1">{activeOrder.order?.deliveryAddress}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-orange-500/10">
              <p className="text-xs text-white/40">
                {activeOrder.order?.items?.length} items • <span className="text-white font-medium">GHS {activeOrder.order?.totalAmount}</span>
              </p>
              <button 
                onClick={() => navigate("/delivery/active")}
                className="bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-orange-600 transition-colors"
              >
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AVAILABLE ORDERS / OFFLINE STATE ── */}
      {driver?.status === 'offline' ? (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-8 text-center space-y-4">
          <Circle size={48} className="text-white/10 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xl font-['Playfair_Display'] text-white">You are Offline</h3>
            <p className="text-sm text-white/40">Go online to start receiving delivery orders</p>
          </div>
          <button 
            onClick={goOnline}
            className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-lg shadow-lg"
          >
            Go Online
          </button>
        </div>
      ) : !activeOrder ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              Available Orders <Box size={14} />
            </h3>
            {isRefreshing && <RefreshCcw size={12} className="text-orange-500 animate-spin" />}
          </div>

          <div className="space-y-3">
            {availableOrders.length === 0 ? (
              <div className="bg-[#1a1a1a]/50 rounded-xl p-10 text-center border border-dashed border-white/5">
                <Box size={40} className="text-[#F97316]/20 mx-auto mb-3" />
                <p className="text-sm text-white/30">No orders available right now</p>
                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">
                  Stay online — new orders will appear here automatically
                </p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <motion.div
                  layout={false}
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#F97316] text-[10px] font-mono font-bold tracking-widest">
                      #{order.orderNumber}
                    </span>
                    <span className="text-white/20 text-[10px]">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="font-bold text-white text-base mb-1">{order.customer?.name}</p>
                    <div className="flex items-start gap-1.5 text-white/50 text-sm">
                      <MapPin size={14} className="shrink-0 mt-0.5 text-orange-500" />
                      <span className="line-clamp-2">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2.5 mb-4 space-y-1">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-[11px] text-white/40">• {item.name} x{item.quantity}</p>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-[10px] text-orange-500/60 font-medium">+ {order.items.length - 2} more items</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <div>
                      <p className="text-base font-bold text-white">GHS {order.totalAmount}</p>
                      <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest">Earn: GHS 20</p>
                    </div>
                    <button 
                      onClick={() => handleAccept(order.id)}
                      disabled={!!acceptingId}
                      className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {acceptingId === order.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Accept Order"
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ) : null}

    </div>
  )
}

function StatCard({ label, value, icon, type }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
        type === 'primary' ? 'bg-orange-500/10' : 'bg-emerald-500/10'
      }`}>
        {icon}
      </div>
      <p className={`font-['Playfair_Display'] text-white ${label.length > 15 ? 'text-xl' : 'text-2xl'}`}>
        {value}
      </p>
      <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1 whitespace-nowrap">
        {label}
      </p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-[#1a1a1a] rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[#1a1a1a] rounded-xl" />)}
      </div>
      <div className="h-40 bg-[#1a1a1a] rounded-xl" />
    </div>
  )
}
