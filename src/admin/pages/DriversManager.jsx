import React, { useState, useEffect } from "react"
import api from "../../api/axios"
import { 
  HiOutlineUsers, HiOutlineCheckBadge, HiOutlineTruck, 
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineMagnifyingGlass, 
  HiOutlineFunnel, HiOutlineEye, HiOutlineNoSymbol, 
  HiOutlineChevronRight, HiOutlineXMark, HiOutlineShieldExclamation,
  HiOutlineStar, HiOutlineBanknotes, HiOutlineCalendarDays,
  HiOutlineHashtag, HiOutlineIdentification, HiOutlinePlus,
  HiOutlineLockClosed, HiOutlineLockOpen
} from "react-icons/hi2"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

export default function DriversManager() {
  const [drivers, setDrivers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterApproval, setFilterApproval] = useState("")
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Add Driver Form State
  const [addForm, setAddForm] = useState({
    name: "", phone: "", password: "", type: "INHOUSE",
    vehicleType: "Motorcycle", vehicleNumber: "", licenseNumber: "",
    autoApprove: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, driversRes] = await Promise.all([
        api.get("/admin/drivers/stats"),
        api.get(`/admin/drivers?search=${search}&status=${filterStatus}&type=${filterType}&approval=${filterApproval}`)
      ])
      setStats(statsRes.data)
      setDrivers(driversRes.data)
    } catch (err) {
      toast.error("Failed to fetch driver data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search, filterStatus, filterType, filterApproval])

  const handleApproveToggle = async (id) => {
    try {
      await api.patch(`/admin/drivers/${id}/approve`)
      toast.success("Approval status updated")
      fetchData()
      if (selectedDriver?.id === id) {
        // Refresh detail modal if open
        const res = await api.get(`/admin/drivers/${id}`)
        setSelectedDriver(res.data)
      }
    } catch (err) {
      toast.error("Action failed")
    }
  }

  const handleSuspendToggle = async (id) => {
    try {
      await api.patch(`/admin/drivers/${id}/suspend`)
      toast.success("Account status updated")
      fetchData()
      if (selectedDriver?.id === id) {
        const res = await api.get(`/admin/drivers/${id}`)
        setSelectedDriver(res.data)
      }
    } catch (err) {
      toast.error("Action failed")
    }
  }

  const handleResetEarnings = async (id) => {
    if (!window.confirm("Reset today's earnings for this rider?")) return
    try {
      await api.patch(`/admin/drivers/${id}/reset-earnings`)
      toast.success("Earnings reset")
      fetchData()
      if (selectedDriver?.id === id) {
        const res = await api.get(`/admin/drivers/${id}`)
        setSelectedDriver(res.data)
      }
    } catch (err) {
      toast.error("Failed to reset earnings")
    }
  }

  const handleAddDriver = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post("/drivers/auth/register", {
        name: addForm.name,
        phone: addForm.phone,
        password: addForm.password,
        type: addForm.type,
        vehicleType: addForm.vehicleType,
        vehicleNumber: addForm.vehicleNumber,
        licenseNumber: addForm.licenseNumber
      })

      if (addForm.autoApprove) {
        await api.patch(`/admin/drivers/${res.data.driver.id}/approve`)
      }
 
      toast.success("Driver added successfully!")
      setShowAddModal(false)
      setAddForm({
        name: "", phone: "", password: "", type: "INHOUSE",
        vehicleType: "Motorcycle", vehicleNumber: "", licenseNumber: "",
        autoApprove: false
      })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add driver")
    }
  }
 
  const openDetails = async (driver) => {
    try {
      const res = await api.get(`/admin/drivers/${driver.id}`)
      setSelectedDriver(res.data)
      setActiveTab("overview")
      setShowDetailModal(true)
    } catch (err) {
      toast.error("Failed to load driver details")
    }
  }
 
  return (
    <div className="space-y-8 pb-10">
      
      {/* ── TOP STATS ROW ── */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        <StatCard 
          label="Total Drivers" 
          value={stats?.total || 0} 
          icon={<HiOutlineUsers size={20} />} 
          color="white"
          circleColor="bg-[#F97316]/20 text-[#F97316]"
        />
        <StatCard 
          label="Online Now" 
          value={stats?.online || 0} 
          icon={<div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />} 
          color="#10B981"
          circleColor="bg-[#10B981]/10 text-[#10B981]"
        />
        <StatCard 
          label="Delivering" 
          value={stats?.delivering || 0} 
          icon={<HiOutlineTruck size={20} className="relative z-10" />} 
          color="#F97316"
          circleColor="bg-[#F97316]/10 text-[#F97316]"
          pulse
        />
        <StatCard 
          label="Pending Approval" 
          value={stats?.pending || 0} 
          icon={<HiOutlineClock size={20} />} 
          color="#F59E0B"
          circleColor="bg-[#F59E0B]/10 text-[#F59E0B]"
          badge={stats?.pending > 0}
        />
        <StatCard 
          label="Total Approved" 
          value={stats?.approved || 0} 
          icon={<HiOutlineCheckCircle size={20} />} 
          color="#10B981"
          circleColor="bg-[#10B981]/10 text-[#10B981]"
        />
      </div>
 
      {/* ── FILTER BAR ── */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full lg:w-auto flex-1">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#F97316] outline-none transition-all"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F97316] outline-none appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="delivering">Delivering</option>
          </select>
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F97316] outline-none appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="INHOUSE">In-House</option>
            <option value="FREELANCE">Freelance</option>
          </select>
          <select 
            value={filterApproval}
            onChange={e => setFilterApproval(e.target.value)}
            className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F97316] outline-none appearance-none cursor-pointer"
          >
            <option value="">All Approval</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full lg:w-auto bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg shadow-[#F97316]/20 hover:scale-[1.02] transition-all"
        >
          + Add Driver
        </button>
      </div>
 
      {/* ── DRIVERS TABLE ── */}
      <div className="bg-[#111111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Driver</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Phone</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Type</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Deliveries</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Rating</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Earnings</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">Approved</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-[#F97316] rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-white/20">
                      <HiOutlineTruck size={48} />
                      <div>
                        <p className="text-white font-bold text-lg">No Drivers Yet</p>
                        <p className="text-sm">Add your first KO Rider to start managing deliveries</p>
                      </div>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="mt-2 text-[#F97316] font-bold text-sm"
                      >
                        + Add First Driver
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((driver, idx) => (
                  <tr 
                    key={driver.id} 
                    className={`hover:bg-[#F97316]/[0.04] transition-colors group ${idx % 2 !== 0 ? 'bg-white/[0.01]' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white font-bold shadow-lg">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{driver.name}</p>
                          <p className="text-[10px] text-white/40">{driver.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-white/60 text-sm font-sans">
                      {driver.phone}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                        driver.type === 'INHOUSE' 
                          ? 'bg-blue-500/15 text-blue-500' 
                          : 'bg-[#F97316]/15 text-[#F97316]'
                      }`}>
                        {driver.type === 'INHOUSE' ? 'In-House' : 'Freelance'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          driver.status === 'online' ? 'bg-[#10B981]' : 
                          driver.status === 'delivering' ? 'bg-[#F97316] animate-pulse' : 
                          'bg-white/20'
                        }`} />
                        <span className={`text-sm ${
                          driver.status === 'online' ? 'text-[#10B981]' : 
                          driver.status === 'delivering' ? 'text-[#F97316]' : 
                          'text-white/30'
                        }`}>
                          {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-white">{driver._count.deliveries} trips</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-white font-bold flex items-center gap-1">
                          <HiOutlineStar className="text-orange-400" /> {driver.rating.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-white/30 font-sans">({driver._count.ratings})</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[#10B981] font-semibold text-sm">GHC {driver.totalEarnings}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                        driver.isApproved 
                          ? 'bg-[#10B981]/15 text-[#10B981]' 
                          : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                      }`}>
                        {driver.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openDetails(driver)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                          title="View Details"
                        >
                          <HiOutlineEye size={18} />
                        </button>
                        <button 
                          onClick={() => handleApproveToggle(driver.id)}
                          className={`p-2.5 rounded-xl transition-all ${
                            driver.isApproved 
                              ? 'bg-red-500/10 text-red-500/40 hover:text-red-500' 
                              : 'bg-[#10B981]/10 text-[#10B981]/40 hover:text-[#10B981]'
                          }`}
                          title={driver.isApproved ? "Unapprove" : "Approve"}
                        >
                          <HiOutlineCheckBadge size={18} />
                        </button>
                        <button 
                          onClick={() => handleSuspendToggle(driver.id)}
                          className={`p-2.5 rounded-xl transition-all ${
                            driver.isActive 
                              ? 'bg-red-500/10 text-red-500/40 hover:text-red-500' 
                              : 'bg-blue-500/10 text-blue-500/40 hover:text-blue-500'
                          }`}
                          title={driver.isActive ? "Suspend" : "Activate"}
                        >
                          <HiOutlineNoSymbol size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* ── DRIVER DETAIL MODAL ── */}
      <AnimatePresence>
        {showDetailModal && selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] bg-[#111111] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                    {selectedDriver.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white mb-1">{selectedDriver.name}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                        selectedDriver.type === 'INHOUSE' ? 'bg-blue-500/15 text-blue-500' : 'bg-[#F97316]/15 text-[#F97316]'
                      }`}>
                        {selectedDriver.type === 'INHOUSE' ? 'In-House' : 'Freelance'}
                      </span>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                        selectedDriver.status === 'online' ? 'bg-[#10B981]/15 text-[#10B981]' : 
                        selectedDriver.status === 'delivering' ? 'bg-[#F97316]/15 text-[#F97316]' : 
                        'bg-white/5 text-white/40'
                      }`}>
                        {selectedDriver.status}
                      </span>
                      <p className="text-xs text-white/40 ml-2 font-sans">{selectedDriver.phone} · {selectedDriver.email}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/20 hover:text-white self-start md:self-center transition-all">
                  <HiOutlineXMark size={24} />
                </button>
              </div>
 
              {/* Modal Tabs */}
              <div className="flex px-8 border-b border-white/5 bg-white/[0.01]">
                {["overview", "deliveries", "ratings", "earnings"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                      activeTab === tab ? 'text-[#F97316]' : 'text-white/30 hover:text-white'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316]" />
                    )}
                  </button>
                ))}
              </div>
 
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                
                {activeTab === "overview" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoBox label="Total Deliveries" value={selectedDriver._count.deliveries} icon={<HiOutlineTruck />} />
                      <InfoBox label="Total Earnings" value={`GHC ${selectedDriver.totalEarnings}`} icon={<HiOutlineBanknotes />} color="text-[#10B981]" />
                      <InfoBox label="Today Earnings" value={`GHC ${selectedDriver.todayEarnings || 0}`} icon={<HiOutlineClock />} color="text-[#10B981]" />
                      <InfoBox label="Average Rating" value={`⭐ ${selectedDriver.rating.toFixed(1)}`} icon={<HiOutlineStar />} />
                      <InfoBox label="Member Since" value={new Date(selectedDriver.createdAt).toLocaleDateString()} icon={<HiOutlineCalendarDays />} />
                      <InfoBox label="Last Login" value={selectedDriver.lastLoginAt ? new Date(selectedDriver.lastLoginAt).toLocaleDateString() : 'N/A'} icon={<HiOutlineClock />} />
                      <InfoBox label="Vehicle" value={`${selectedDriver.vehicleType} — ${selectedDriver.vehicleNumber}`} icon={<HiOutlineHashtag />} />
                      <InfoBox label="License" value={selectedDriver.licenseNumber || 'N/A'} icon={<HiOutlineIdentification />} />
                    </div>
 
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Management Actions</h3>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => handleApproveToggle(selectedDriver.id)}
                          className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                            selectedDriver.isApproved 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25'
                          }`}
                        >
                          {selectedDriver.isApproved ? <><HiOutlineNoSymbol /> Unapprove Driver</> : <><HiOutlineCheckBadge /> Approve Driver</>}
                        </button>
                        <button 
                          onClick={() => handleSuspendToggle(selectedDriver.id)}
                          className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                            selectedDriver.isActive 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25'
                          }`}
                        >
                          {selectedDriver.isActive ? <><HiOutlineNoSymbol /> Suspend Account</> : <><HiOutlineCheckCircle /> Reactivate Account</>}
                        </button>
                        <button 
                          onClick={() => handleResetEarnings(selectedDriver.id)}
                          className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          Reset Today Earnings
                        </button>
                      </div>
                    </div>
                  </div>
                )}
 
                {activeTab === "deliveries" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    {selectedDriver.deliveries?.length === 0 ? (
                      <div className="py-20 text-center text-white/20">No deliveries yet</div>
                    ) : (
                      <div className="rounded-3xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Order</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Customer</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Address</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Amount</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {selectedDriver.deliveries?.map(del => (
                              <tr key={del.id} className="hover:bg-white/[0.02]">
                                <td className="px-6 py-4 text-sm text-white font-bold">{del.order.orderNumber}</td>
                                <td className="px-6 py-4 text-sm text-white/80">{del.order.customer?.name}</td>
                                <td className="px-6 py-4 text-sm text-white/40 truncate max-w-xs">{del.order.deliveryAddress}</td>
                                <td className="px-6 py-4 text-sm text-[#10B981] font-bold">GHC {del.order.totalAmount}</td>
                                <td className="px-6 py-4 text-xs text-white/30">{new Date(del.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
 
                {activeTab === "ratings" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                      <p className="text-white font-bold uppercase tracking-widest text-xs">Rider Performance</p>
                      <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <HiOutlineStar className="text-orange-400" /> {selectedDriver.rating.toFixed(1)} <span className="text-xs text-white/20 ml-2">avg rating</span>
                      </div>
                    </div>
                    {selectedDriver.ratings?.length === 0 ? (
                      <div className="py-20 text-center text-white/20">No ratings yet</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedDriver.ratings?.map(r => (
                          <div key={r.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center">
                              <p className="text-[#F97316] font-bold flex items-center gap-1">
                                {[...Array(r.rating)].map((_, i) => <HiOutlineStar key={i} />)}
                              </p>
                              <p className="text-[10px] text-white/20">{new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm text-white/70 italic">"{r.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
 
                {activeTab === "earnings" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-3xl p-6 flex items-center justify-between">
                      <p className="text-[#10B981] font-bold uppercase tracking-widest text-xs">Total Earnings Summary</p>
                      <div className="text-2xl font-bold text-[#10B981]">GHC {selectedDriver.totalEarnings} <span className="text-xs opacity-60 ml-2">earned</span></div>
                    </div>
                    {selectedDriver.payouts?.length === 0 ? (
                      <div className="py-20 text-center text-white/20">No payouts yet</div>
                    ) : (
                      <div className="rounded-3xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Description</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Amount</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {selectedDriver.payouts?.map(p => (
                              <tr key={p.id} className="hover:bg-white/[0.02]">
                                <td className="px-6 py-4 text-sm text-white/80">{p.description}</td>
                                <td className="px-6 py-4 text-sm text-[#10B981] font-bold">GHC {p.amount}</td>
                                <td className="px-6 py-4 text-xs text-white/30 text-right">{new Date(p.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
 
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* ── ADD DRIVER MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-md bg-[#111111] rounded-[2.5rem] border border-white/10 p-10 shadow-2xl"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-2">Add New Driver</h2>
              <p className="text-white/40 text-sm mb-8">Register a new rider to the KO delivery fleet.</p>
              
              <form onSubmit={handleAddDriver} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Full Name</label>
                  <input 
                    required type="text" placeholder="Driver's full name"
                    value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})}
                    className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none"
                  />
                </div>
 
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Phone Number</label>
                    <input 
                      required type="tel" placeholder="024XXXXXXX"
                      value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})}
                      className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        required type={showPassword ? "text" : "password"} placeholder="••••••••"
                        value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})}
                        className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none"
                      />
                      <button 
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                      >
                        {showPassword ? <HiOutlineLockOpen size={18} /> : <HiOutlineLockClosed size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
 
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Driver Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["INHOUSE", "FREELANCE"].map(type => (
                      <button
                        key={type} type="button"
                        onClick={() => setAddForm({...addForm, type})}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                          addForm.type === type 
                            ? 'bg-[#F97316]/10 border-[#F97316] text-[#F97316]' 
                            : 'bg-[#0C0A09] border-white/5 text-white/40'
                        }`}
                      >
                        {type === "INHOUSE" ? "In-House" : "Freelance"}
                      </button>
                    ))}
                  </div>
                </div>
 
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Vehicle Type</label>
                    <select 
                      value={addForm.vehicleType} onChange={e => setAddForm({...addForm, vehicleType: e.target.value})}
                      className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none appearance-none"
                    >
                      <option>Motorcycle</option>
                      <option>Car</option>
                      <option>Bicycle</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Plate Number</label>
                    <input 
                      type="text" placeholder="GW-XXXX-XX"
                      value={addForm.vehicleNumber} onChange={e => setAddForm({...addForm, vehicleNumber: e.target.value})}
                      className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none"
                    />
                  </div>
                </div>
 
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-white">Approve immediately</p>
                    <p className="text-[10px] text-white/20">Driver can login right away</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAddForm({...addForm, autoApprove: !addForm.autoApprove})}
                    className="w-12 h-6 rounded-full relative transition-all"
                    style={{ backgroundColor: addForm.autoApprove ? '#10B981' : 'rgba(255,255,255,0.1)' }}
                  >
                    <motion.div 
                      animate={{ x: addForm.autoApprove ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
 
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#F97316]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Add Driver
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function StatCard({ label, value, icon, color, circleColor, pulse, badge }) {
  return (
    <div className="min-w-[240px] flex-1 bg-[#1a1a1a] border border-[#F97316]/[0.08] rounded-2xl p-6 space-y-4 shadow-xl">
      <div className={`w-10 h-10 rounded-xl ${circleColor} flex items-center justify-center relative`}>
        {pulse && <div className="absolute inset-0 bg-[#F97316] rounded-xl animate-ping opacity-20" />}
        {icon}
        {badge && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F97316] rounded-full ring-2 ring-[#1a1a1a]" />
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{label}</p>
        <p className="text-3xl font-display font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  )
}

function InfoBox({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-white/30">
        {icon}
        <p className="text-[9px] font-bold uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}
