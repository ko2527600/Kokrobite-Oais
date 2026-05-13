import React, { useState, useEffect, useCallback } from "react"
import api from "../../api/axios"
import { useSocket } from "../../hooks/useSocket"
import { 
  HiOutlineTruck, HiOutlineUser, HiOutlineMapPin, 
  HiOutlineClock, HiOutlineSignal, HiOutlineCheckCircle,
  HiOutlinePhone, HiOutlineChatBubbleLeftRight,
  HiOutlineChevronDown
} from "react-icons/hi2"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"

export default function LiveTracking() {
  const [drivers, setDrivers] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [stats, setStats] = useState({ delivering: 0, online: 0, pending: 0, deliveredToday: 0 })
  const [filter, setFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const socket = useSocket()

  const fetchData = useCallback(async () => {
    try {
      const [driversRes, ordersRes, statsRes] = await Promise.all([
        api.get("/admin/drivers"),
        api.get("/admin/customer-orders?status=preparing"),
        api.get("/admin/drivers/stats") // Assuming this exists or returns these metrics
      ])
      setDrivers(driversRes.data)
      setActiveOrders(ordersRes.data)
      
      // Calculate local stats if needed or use statsRes
      const delivering = driversRes.data.filter(d => d.status === 'delivering').length
      const online = driversRes.data.filter(d => d.status === 'online').length
      setStats({
        delivering,
        online,
        pending: ordersRes.data.length,
        deliveredToday: statsRes.data?.deliveredToday || 0
      })
    } catch (err) {
      console.error("Failed to fetch live data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!socket) return

    socket.on("connect", () => setIsSocketConnected(true))
    socket.on("disconnect", () => setIsSocketConnected(false))

    socket.on("driver_status_update", (data) => {
      setDrivers(prev => prev.map(d => d.id === data.driverId ? { ...d, status: data.status } : d))
      if (data.status === 'online') toast.success(`${data.name} is now Online`)
      if (data.status === 'offline') toast.error(`${data.name} went Offline`)
      fetchData()
    })

    socket.on("driver_location", (data) => {
      setDrivers(prev => prev.map(d => 
        d.id === data.driverId ? { ...d, currentLat: data.lat, currentLng: data.lng, lastLocationAt: new Date() } : d
      ))
    })

    socket.on("order_update", (data) => {
      fetchData()
    })

    return () => {
      socket.off("driver_status_update")
      socket.off("driver_location")
      socket.off("order_update")
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [socket, fetchData])

  // Fallback polling
  useEffect(() => {
    let interval = null
    if (!isSocketConnected) {
      interval = setInterval(fetchData, 30000)
    }
    return () => clearInterval(interval)
  }, [isSocketConnected, fetchData])

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/customer-orders/${orderId}/status`, { status })
      toast.success("Order status updated")
      fetchData()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const filteredDrivers = drivers.filter(d => {
    if (filter === "All") return true
    return d.status.toLowerCase() === filter.toLowerCase()
  })

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── HEADER & SOCKET INDICATOR ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Fleet Tracker</h1>
          <p className="text-white/40 text-sm">Monitor live deliveries and rider locations in real-time.</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
          isSocketConnected ? 'bg-[#10B981]/10 border-[#10B981]/20' : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-[#10B981] animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isSocketConnected ? 'text-[#10B981]' : 'text-red-500'}`}>
            {isSocketConnected ? 'Live Connection' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* ── TOP STATS STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="In Progress" value={stats.delivering} dotColor="bg-[#F97316]" pulse />
        <MiniStat label="Online" value={stats.online} dotColor="bg-[#10B981]" />
        <MiniStat label="Awaiting Driver" value={stats.pending} dotColor="bg-[#F59E0B]" />
        <MiniStat label="Completed Today" value={stats.deliveredToday} dotColor="bg-[#10B981]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        
        {/* ── LEFT PANEL: ACTIVE DELIVERIES ── */}
        <div className="w-full lg:w-[40%] space-y-4 flex flex-col">
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
            <h2 className="font-bold text-sm text-white uppercase tracking-widest">Live Deliveries 🛵</h2>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-[#111111] rounded-[2rem] border border-white/5 space-y-4">
                <HiOutlineTruck size={48} className="text-white/10" />
                <div className="text-center">
                  <p className="font-display text-xl text-white">No Active Deliveries</p>
                  <p className="text-sm text-white/30">All drivers are currently free</p>
                </div>
              </div>
            ) : (
              activeOrders.map(order => (
                <div 
                  key={order.id}
                  className="bg-[#1a1a1a] border border-[#F97316]/15 rounded-2xl p-5 hover:border-[#F97316]/35 transition-all cursor-pointer group shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[#F97316] text-xs font-bold uppercase tracking-widest">#{order.orderNumber}</p>
                    <p className="text-white/30 text-[10px] font-medium">{formatDistanceToNow(new Date(order.createdAt))} ago</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <HiOutlineTruck className="text-[#F97316]" size={16} />
                      <div>
                        <p className="text-white text-sm font-semibold">{order.delivery?.driver?.name || 'Unassigned'}</p>
                        <p className="text-[#F97316] text-[10px] font-bold uppercase">
                          {order.status === 'preparing' ? 'Heading to restaurant' : 'On the way to customer'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <HiOutlineUser className="text-white/40" size={16} />
                      <p className="text-white/60 text-sm font-medium">{order.customer?.name}</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <HiOutlineMapPin className="text-white/40 shrink-0 mt-0.5" size={16} />
                      <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2">{order.deliveryAddress}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <div>
                        <p className="text-white font-bold text-sm">GHC {order.totalAmount}</p>
                        <p className="text-white/30 text-[10px]">Driver earns: GHC 20</p>
                      </div>
                      
                      <div className="relative">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest appearance-none outline-none focus:border-[#F97316]"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <HiOutlineChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: DRIVER FLEET ── */}
        <div className="w-full lg:w-[60%] space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-sm text-white uppercase tracking-widest">Driver Fleet Status</h2>
            <div className="flex bg-white/5 p-1 rounded-xl">
              {["All", "Online", "Delivering", "Offline"].map(t => (
                <button 
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === t ? 'bg-[#F97316] text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.map(driver => (
              <div 
                key={driver.id}
                className="bg-[#1a1a1a] border border-white/[0.06] rounded-2xl p-5 space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{driver.name}</h3>
                    <p className="text-white/40 text-[10px]">{driver.phone}</p>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      driver.status === 'online' ? 'bg-[#10B981] animate-pulse' : 
                      driver.status === 'delivering' ? 'bg-[#F97316] animate-pulse' : 
                      'bg-white/20'
                    }`} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg inline-flex items-center gap-2 ${
                    driver.status === 'online' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                    driver.status === 'delivering' ? 'bg-[#F97316]/10 text-[#F97316]' : 
                    'bg-white/5 text-white/40'
                  }`}>
                    {driver.status === 'online' && "🟢 Online"}
                    {driver.status === 'delivering' && "🛵 Delivering"}
                    {driver.status === 'offline' && "⚫ Offline"}
                  </div>

                  {driver.status === 'delivering' && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                      <p className="text-[#F97316] text-[10px] font-bold">ACTIVE ORDER</p>
                      <p className="text-white/60 text-[10px] truncate">→ {driver.deliveries?.[0]?.order?.deliveryAddress || 'Heading to Customer'}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
                    <DriverMiniStat label="TODAY" value={`₵${driver.todayEarnings || 0}`} />
                    <DriverMiniStat label="TRIPS" value={driver.totalDeliveries || 0} />
                    <DriverMiniStat label="RATING" value={`⭐ ${driver.rating?.toFixed(1) || '0.0'}`} />
                  </div>

                  {driver.currentLat && (
                    <p className="text-white/20 text-[9px] uppercase tracking-tighter flex items-center gap-1.5">
                      <HiOutlineMapPin size={10} />
                      Last seen {formatDistanceToNow(new Date(driver.lastLocationAt))} ago
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a 
                      href={`tel:${driver.phone}`}
                      className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      <HiOutlinePhone size={14} /> Call
                    </a>
                    <a 
                      href={`https://wa.me/${driver.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl text-[#25D366] text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      <HiOutlineChatBubbleLeftRight size={14} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

function MiniStat({ label, value, dotColor, pulse }) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-xl">
      <div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`w-3 h-3 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`} />
    </div>
  )
}

function DriverMiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className="text-xs font-bold text-white">{value}</p>
    </div>
  )
}
