import React, { useState, useEffect } from "react"
import api from "../../api/axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wallet, TrendingUp, Calendar, Truck, 
  RefreshCcw, DollarSign, ChevronRight, Info, Clock, 
  CreditCard, CircleDollarSign
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function DriverEarnings() {
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async (initial = false) => {
    if (initial) setLoading(true)
    else setIsRefreshing(true)

    try {
      const [sumRes, histRes] = await Promise.all([
        api.get("/drivers/earnings/summary"),
        api.get("/drivers/earnings/history")
      ])
      setSummary(sumRes.data)
      setHistory(histRes.data)
    } catch (err) {
      toast.error("Failed to load earnings data")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData(true)
  }, [])

  if (loading) return <EarningsSkeleton />

  return (
    <div className="space-y-4">
      
      {/* ── HEADER & REFRESH ── */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Financial Overview
        </h2>
        <button 
          onClick={() => fetchData()}
          disabled={isRefreshing}
          className="text-white/30 hover:text-[#F97316] transition-colors"
        >
          <RefreshCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── TOTAL EARNINGS HERO ── */}
      <div className="bg-gradient-to-br from-[#1C0A00] to-[#F97316] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 mb-1">
            Total Earnings
          </p>
          <h1 className="text-5xl font-['Playfair_Display'] text-white font-light tracking-tight">
            GHC {summary?.totalEarnings.toFixed(2)}
          </h1>
          <p className="text-xs text-white/50 mt-2 font-['Plus_Jakarta_Sans']">
            {summary?.totalDeliveries} deliveries completed
          </p>

          <div className="mt-6 flex items-center gap-1">
            <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
              <span className="text-xs font-bold text-white">⭐ {summary?.rating.toFixed(1)} rating</span>
            </div>
            <span className="text-[10px] text-white/50 ml-2">({summary?.totalRatings} ratings)</span>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Today" value={`GHC ${summary?.todayEarnings}`} sub={`+${summary?.todayDeliveries} trips`} />
        <StatItem label="This Week" value={`GHC ${summary?.weekEarnings}`} sub={`+${summary?.weekDeliveries} trips`} />
        <StatItem label="This Month" value={`GHC ${summary?.monthEarnings}`} icon={<Calendar size={12} />} />
        <StatItem label="Per Delivery" value="GHC 20" sub="Fixed rate" icon={<Truck size={12} />} />
      </div>

      {/* ── HOW EARNINGS WORK ── */}
      <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-orange-500" size={16} />
          <h3 className="text-sm font-bold text-white tracking-wide">How Earnings Work</h3>
        </div>

        <div className="space-y-4">
          <InfoRow label="Per Delivery Fee" value="GHC 20.00" highlight />
          <InfoRow label="Payment Method" value="Cash / Weekly Transfer" />
          <InfoRow label="Payout Schedule" value="Every Monday" />
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-white/30 italic">
          Earnings are paid every Monday for the previous week's deliveries.
        </p>
      </div>

      {/* ── RECENT PAYOUTS ── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-sm text-white tracking-wide">Recent Payouts</h3>
          {history?.total > 10 && (
            <button className="text-[11px] font-bold text-[#F97316] uppercase tracking-widest flex items-center gap-1">
              See All <ChevronRight size={14} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {history?.payouts.length === 0 ? (
            <div className="bg-[#1a1a1a]/50 border border-white/5 rounded-xl py-12 flex flex-col items-center justify-center text-center px-6">
              <CircleDollarSign size={48} className="text-white/10 mb-4" />
              <p className="text-white/40 font-semibold mb-1">No payouts yet</p>
              <p className="text-xs text-white/20">Complete deliveries to start earning</p>
            </div>
          ) : (
            history?.payouts.map((payout, idx) => (
              <motion.div 
                key={payout.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <DollarSign className="text-[#F97316]" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                      {payout.description || "Weekly Payout"}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">
                      {formatDate(payout.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-base font-bold text-emerald-500">
                  + GHC {payout.amount.toFixed(2)}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}

function StatItem({ label, value, sub, icon }) {
  return (
    <div className="bg-[#1a1a1a] border border-orange-500/10 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</p>
        <span className="text-white/20">{icon}</span>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-['Playfair_Display'] text-white">{value}</p>
        {sub && <p className="text-[10px] text-white/40 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <p className="text-xs text-white/50">{label}</p>
      <p className={`text-xs font-bold ${highlight ? "text-[#F97316]" : "text-white"}`}>{value}</p>
    </div>
  )
}

function EarningsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-[#1a1a1a] rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[#1a1a1a] rounded-xl" />)}
      </div>
      <div className="h-40 bg-[#1a1a1a] rounded-xl" />
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-[#1a1a1a] rounded-xl" />)}
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const options = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }
  return date.toLocaleDateString('en-US', options).replace(',', ' ·')
}
