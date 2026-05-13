import React, { useState, useEffect } from "react"
import api from "../../api/axios"
import { 
  HiOutlineUserGroup, HiOutlineTruck, HiOutlineClock, 
  HiOutlineCheckBadge, HiOutlineNoSymbol, HiOutlinePencilSquare, 
  HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineFunnel,
  HiOutlineMapPin, HiOutlineStar, HiOutlineBanknotes,
  HiOutlineChevronRight, HiOutlineXMark
} from "react-icons/hi2"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

export default function DriversManager() {
  const [drivers, setDrivers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchDrivers = async () => {
    try {
      const [driversRes, statsRes] = await Promise.all([
        api.get(`/admin/drivers?search=${search}&status=${filterStatus}`),
        api.get("/admin/drivers/stats")
      ])
      setDrivers(driversRes.data)
      setStats(statsRes.data)
    } catch (err) {
      toast.error("Failed to load drivers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [search, filterStatus])

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/drivers/${id}/approve`)
      toast.success("Driver approval status updated")
      fetchDrivers()
    } catch (err) {
      toast.error("Action failed")
    }
  }

  const handleSuspend = async (id) => {
    try {
      await api.patch(`/admin/drivers/${id}/suspend`)
      toast.success("Driver account status updated")
      fetchDrivers()
    } catch (err) {
      toast.error("Action failed")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return
    try {
      await api.delete(`/admin/drivers/${id}`)
      toast.success("Driver deleted")
      fetchDrivers()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete driver")
    }
  }

  const getStatusBadge = (driver) => {
    if (!driver.isApproved) return <Badge color="yellow" label="Pending Approval" />
    if (!driver.isActive) return <Badge color="red" label="Suspended" />
    
    switch (driver.status) {
      case "online": return <Badge color="green" label="Online" />
      case "offline": return <Badge color="gray" label="Offline" />
      case "delivering": return <Badge color="orange" label="On Delivery" />
      default: return <Badge color="gray" label="Unknown" />
    }
  }

  return (
    <div className="space-y-8">
      
      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<HiOutlineUserGroup size={24} />} 
          label="Total Drivers" 
          value={stats?.total || 0} 
          color="blue"
        />
        <StatCard 
          icon={<HiOutlineClock size={24} />} 
          label="Pending Approval" 
          value={stats?.pending || 0} 
          color="yellow"
        />
        <StatCard 
          icon={<HiOutlineCheckBadge size={24} />} 
          label="Available Online" 
          value={stats?.online || 0} 
          color="green"
        />
        <StatCard 
          icon={<HiOutlineTruck size={24} />} 
          label="Active Deliveries" 
          value={stats?.delivering || 0} 
          color="orange"
        />
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#111111] p-4 rounded-2xl border border-white/5 shadow-xl">
        <div className="relative w-full sm:w-96">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0C0A09] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#F97316] outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <HiOutlineFunnel className="text-white/20" size={20} />
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F97316] outline-none appearance-none cursor-pointer pr-10"
          >
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="delivering">Delivering</option>
          </select>
        </div>
      </div>

      {/* ── DRIVERS TABLE ── */}
      <div className="bg-[#111111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Driver Info</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Vehicle</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Performance</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-[#F97316] rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-white/20">No drivers found</td>
                </tr>
              ) : (
                drivers.map(driver => (
                  <tr key={driver.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-[#F97316] font-bold text-sm">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{driver.name}</p>
                          <p className="text-xs text-white/30">{driver.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm text-white/80">{driver.vehicleType}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{driver.vehicleNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(driver)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm font-bold text-white">{driver.rating.toFixed(1)}★</p>
                          <p className="text-[9px] text-white/40 font-medium uppercase tracking-tighter">Avg Rating</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{driver._count.deliveries}</p>
                          <p className="text-[9px] text-white/40 font-medium uppercase tracking-tighter">Trips</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-500">₵{driver.totalEarnings}</p>
                          <p className="text-[9px] text-white/40 font-medium uppercase tracking-tighter">Earned</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton 
                          icon={<HiOutlineCheckBadge size={18} />} 
                          tooltip={driver.isApproved ? "Revoke Approval" : "Approve Driver"}
                          onClick={() => handleApprove(driver.id)}
                          color={driver.isApproved ? "red" : "green"}
                        />
                        <ActionButton 
                          icon={<HiOutlineNoSymbol size={18} />} 
                          tooltip={driver.isActive ? "Suspend" : "Activate"}
                          onClick={() => handleSuspend(driver.id)}
                          color={driver.isActive ? "red" : "blue"}
                        />
                        <ActionButton 
                          icon={<HiOutlineTrash size={18} />} 
                          tooltip="Delete"
                          onClick={() => handleDelete(driver.id)}
                          color="red"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  }

  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} space-y-4 shadow-xl`}>
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-4xl font-display font-bold mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function Badge({ color, label }) {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    gray: "bg-white/5 text-white/40 border-white/10"
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[color]}`}>
      {label}
    </span>
  )
}

function ActionButton({ icon, onClick, color, tooltip }) {
  const colors = {
    green: "hover:bg-emerald-500/20 hover:text-emerald-500",
    red: "hover:bg-red-500/20 hover:text-red-500",
    blue: "hover:bg-blue-500/20 hover:text-blue-500"
  }

  return (
    <button 
      onClick={onClick}
      title={tooltip}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all text-white/20 ${colors[color]}`}
    >
      {icon}
    </button>
  )
}
