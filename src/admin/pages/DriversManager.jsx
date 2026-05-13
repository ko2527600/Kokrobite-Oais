import React, { useState, useEffect } from "react"
import api from "../../api/axios"
import { 
  HiOutlineUserGroup, HiOutlineTruck, HiOutlineClock, 
  HiOutlineCheckBadge, HiOutlineNoSymbol, HiOutlinePencilSquare, 
  HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineFunnel,
  HiOutlineMapPin, HiOutlineStar, HiOutlineBanknotes,
  HiOutlineChevronRight, HiOutlineXMark, HiOutlineShieldExclamation,
  HiOutlineEye, HiOutlineNoSymbol as HiOutlineStop, HiOutlineFlag
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
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [reportForm, setReportForm] = useState({ reason: "", comment: "" })

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

  const handleAddStrike = async (id) => {
    if (!window.confirm("Are you sure you want to add a strike to this rider? 3 strikes lead to automatic suspension.")) return
    try {
      await api.patch(`/admin/drivers/${id}/add-strike`)
      toast.success("Strike added")
      fetchDrivers()
    } catch (err) {
      toast.error("Failed to add strike")
    }
  }

  const handleResetStrikes = async (id) => {
    if (!window.confirm("Reset all strikes for this rider?")) return
    try {
      await api.patch(`/admin/drivers/${id}/reset-strikes`)
      toast.success("Strikes reset")
      fetchDrivers()
    } catch (err) {
      toast.error("Failed to reset strikes")
    }
  }

  const handleLogReport = async (driverId) => {
    if (!reportForm.reason) return toast.error("Please provide a reason")
    try {
      await api.post("/admin/drivers/reports", {
        driverId,
        orderId: selectedDriver.deliveries[0]?.orderId || "MANUAL", // Fallback if no recent order
        customerId: "SYSTEM",
        ...reportForm
      })
      toast.success("Incident reported")
      setReportForm({ reason: "", comment: "" })
      setShowReportsModal(false)
      fetchDrivers()
    } catch (err) {
      toast.error("Failed to log report")
    }
  }

  const openDriverDetails = async (driver) => {
    try {
      const res = await api.get(`/admin/drivers/${driver.id}`)
      setSelectedDriver(res.data)
      setShowModal(true)
    } catch (err) {
      toast.error("Failed to load details")
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
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Discipline</th>
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
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${driver.strikes > 0 ? 'bg-red-500 animate-pulse' : 'bg-white/10'}`} />
                        <span className={`text-sm font-bold ${driver.strikes > 0 ? 'text-red-500' : 'text-white/40'}`}>
                          {driver.strikes} Strikes
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton 
                          icon={<HiOutlineEye size={18} />} 
                          tooltip="View Details & Reports"
                          onClick={() => openDriverDetails(driver)}
                          color="blue"
                        />
                        <ActionButton 
                          icon={<HiOutlineShieldExclamation size={18} />} 
                          tooltip="Add Strike"
                          onClick={() => handleAddStrike(driver.id)}
                          color="orange"
                        />
                        <ActionButton 
                          icon={<HiOutlineFlag size={18} />} 
                          tooltip="Log Incident"
                          onClick={() => {
                            setSelectedDriver(driver)
                            setShowReportsModal(true)
                          }}
                          color="yellow"
                        />
                        <ActionButton 
                          icon={<HiOutlineCheckBadge size={18} />} 
                          tooltip={driver.isApproved ? "Revoke Approval" : "Approve Driver"}
                          onClick={() => handleApprove(driver.id)}
                          color={driver.isApproved ? "red" : "green"}
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

      {/* ── DRIVER DETAILS MODAL ── */}
      <AnimatePresence>
        {showModal && selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-[#111111] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#F97316] to-[#1C0A00] flex items-center justify-center text-white text-2xl font-bold">
                    {selectedDriver.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white">{selectedDriver.name}</h2>
                    <p className="text-white/40">{selectedDriver.phone} • {selectedDriver.type} rider</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white">
                  <HiOutlineXMark size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailStat label="Rating" value={`${selectedDriver.rating.toFixed(1)}★`} />
                  <DetailStat label="Total Trips" value={selectedDriver._count?.deliveries || 0} />
                  <DetailStat label="Total Earned" value={`₵${selectedDriver.totalEarnings}`} />
                  <DetailStat 
                    label="Strikes" 
                    value={selectedDriver.strikes} 
                    color={selectedDriver.strikes > 0 ? "red" : "gray"} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Recent Reports */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HiOutlineShieldExclamation className="text-red-500" />
                      Disciplinary History
                    </h3>
                    <div className="space-y-3">
                      {selectedDriver.reports?.length === 0 ? (
                        <p className="text-white/20 text-sm">No reports on file.</p>
                      ) : (
                        selectedDriver.reports?.map(report => (
                          <div key={report.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-sm text-red-400">{report.reason}</p>
                              <p className="text-[10px] text-white/20">{new Date(report.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xs text-white/60">{report.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Management Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleAddStrike(selectedDriver.id)}
                        className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 font-bold text-sm hover:bg-orange-500/20 transition-all"
                      >
                        Add Strike
                      </button>
                      <button 
                        onClick={() => handleResetStrikes(selectedDriver.id)}
                        className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 font-bold text-sm hover:bg-emerald-500/20 transition-all"
                      >
                        Reset Strikes
                      </button>
                      <button 
                        onClick={() => handleSuspend(selectedDriver.id)}
                        className={`p-4 ${selectedDriver.isActive ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'} border rounded-2xl font-bold text-sm transition-all`}
                      >
                        {selectedDriver.isActive ? 'Suspend Account' : 'Reactivate Account'}
                      </button>
                      <button 
                        onClick={() => api.patch(`/admin/drivers/${selectedDriver.id}/reset-earnings`).then(() => toast.success("Reset")).catch(() => toast.error("Error"))}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        Reset Daily Pay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── INCIDENT REPORT MODAL ── */}
      <AnimatePresence>
        {showReportsModal && selectedDriver && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReportsModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2">Log Incident Report</h2>
              <p className="text-white/40 text-sm mb-6">Report behavior or performance issues for {selectedDriver.name}.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Reason</label>
                  <select 
                    value={reportForm.reason}
                    onChange={e => setReportForm({ ...reportForm, reason: e.target.value })}
                    className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Rude behavior">Rude behavior</option>
                    <option value="Late delivery">Late delivery</option>
                    <option value="Damaged food">Damaged food</option>
                    <option value="Unsafe driving">Unsafe driving</option>
                    <option value="Incorrect delivery">Incorrect delivery</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Comments</label>
                  <textarea 
                    value={reportForm.comment}
                    onChange={e => setReportForm({ ...reportForm, comment: e.target.value })}
                    rows="4"
                    placeholder="Describe what happened..."
                    className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none resize-none"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowReportsModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleLogReport(selectedDriver.id)}
                    className="flex-1 py-4 rounded-2xl bg-[#F97316] text-white font-bold hover:bg-[#FB923C] transition-all shadow-lg shadow-[#F97316]/20"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
function DetailStat({ label, value, color = "gray" }) {
  const colors = {
    red: "text-red-500",
    gray: "text-white"
  }
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">{label}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}
