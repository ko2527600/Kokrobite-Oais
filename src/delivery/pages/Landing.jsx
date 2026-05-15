import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Wallet, 
  Clock, 
  Smartphone, 
  Calendar, 
  Bike, 
  Palmtree,
  Plus,
  Minus,
  Edit3
} from "lucide-react";

const DriverLanding = () => {
  const [deliveries, setDeliveries] = useState(5);

  const calculateEarnings = (count) => {
    const day = count * 20;
    const week = day * 6;
    const month = day * 24; // Based on 6 working days per week
    return { day, week, month };
  };

  const earnings = calculateEarnings(deliveries);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    layout: false,
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white selection:bg-[#F97316]/30">
      {/* ── SECTION 1: HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1920" 
            alt="Delivery background"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A09]/70 via-[#0C0A09]/80 to-[#0C0A09]/95" />
        </div>

        {/* Top Nav Bar */}
        <nav className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:px-12">
          <div className="text-2xl font-display italic font-bold text-white flex items-center gap-2">
            <Bike className="text-[#F97316]" size={28} /> KO Rider
          </div>
          <div className="flex gap-4">
            <Link 
              to="/delivery/login"
              className="border border-[#F97316]/40 text-[#F97316] font-bold text-sm px-5 py-2 rounded-lg hover:bg-[#F97316]/10 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/delivery/register"
              className="bg-[#F97316] text-white font-bold text-sm px-5 py-2 rounded-lg hover:bg-[#F97316]/90 transition-all shadow-lg shadow-[#F97316]/20"
            >
              Join Us
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[680px] px-6 text-center pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-6 bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full"
          >
            <Palmtree size={14} /> Kokrobite Oasis Official Delivery
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display leading-[0.88] tracking-tighter"
          >
            <span className="block text-white font-light text-[52px] md:text-[80px] lg:text-[96px]">
              Deliver. Earn.
            </span>
            <span className="block text-[#F97316] italic text-[52px] md:text-[80px] lg:text-[96px] flex items-center justify-center gap-4">
              Your Way. <Bike size={64} className="opacity-20" />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-[#FFFFFF80] text-base md:text-lg leading-relaxed max-w-[480px] mx-auto"
          >
            Join the KO Rider team and earn GHC 20 per delivery. Flexible hours, fast payouts, and the freedom to work on your schedule.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Link 
              to="/delivery/register"
              className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-wider text-sm px-10 py-4 rounded-xl shadow-[0_10px_40px_rgba(249,115,22,0.35)] hover:scale-105 transition-transform flex items-center gap-2"
            >
              Start Earning Today <Bike size={18} />
            </Link>
            <Link 
              to="/delivery/login"
              className="border border-white/15 text-white font-semibold text-sm px-10 py-4 rounded-xl hover:bg-white/5 transition-colors"
            >
              Sign In to Dashboard
            </Link>
          </motion.div>

          {/* Stats Strip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 flex flex-wrap gap-8 md:gap-12 justify-center items-center"
          >
            <div className="text-center">
              <div className="font-display text-[36px] text-[#F97316] leading-none mb-1">GHC 20</div>
              <div className="text-[#FFFFFF66] text-[10px] uppercase tracking-widest font-bold">Per Delivery</div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-white/10" />
            
            <div className="text-center">
              <div className="font-display text-[36px] text-white leading-none mb-1">Flexible</div>
              <div className="text-[#FFFFFF66] text-[10px] uppercase tracking-widest font-bold">Working Hours</div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/10" />

            <div className="text-center">
              <div className="font-display text-[36px] text-white leading-none mb-1">Weekly</div>
              <div className="text-[#FFFFFF66] text-[10px] uppercase tracking-widest font-bold">Payout Schedule</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <section className="bg-[#111111] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">How It Works</h2>
            <p className="text-[#FFFFFF66] text-base">Three simple steps to start earning with KO Rider</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", icon: <Edit3 size={32} />, title: "Apply Online", text: "Fill in your details and submit your driver application in minutes" },
              { num: "02", icon: <CheckCircle2 size={32} />, title: "Get Approved", text: "Our team reviews your application within 24 hours and activates your account" },
              { num: "03", icon: <Smartphone size={32} />, title: "Go Online", text: "Open KO Rider, go online, and start seeing available delivery orders instantly" },
              { num: "04", icon: <Wallet size={32} />, title: "Get Paid", text: "Earn GHC 20 per delivery. Payouts processed every Monday to your MoMo wallet" }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                {...fadeIn}
                className="group bg-[#1a1a1a] border border-[#F97316]/10 rounded-2xl p-8 text-center hover:border-[#F97316]/30 transition-all duration-300"
              >
                <div className="font-display text-5xl text-[#F97316]/20 mb-4 group-hover:text-[#F97316]/40 transition-colors">{step.num}</div>
                <div className="text-[#F97316] flex justify-center mb-4">{step.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[#FFFFFF66] text-sm leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: WHY RIDE WITH US ── */}
      <section className="bg-[#0C0A09] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-20">Why Ride with KO?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Wallet />, title: "GHC 20 Per Delivery", text: "Fixed rate every delivery. No hidden cuts, no surprises." },
              { icon: <Clock />, title: "Work Your Hours", text: "Go online when you want. Take breaks whenever. You're the boss." },
              { icon: <Smartphone />, title: "Simple App", text: "Accept orders, navigate, confirm delivery — all in one tap." },
              { icon: <Calendar />, title: "Weekly Payouts", text: "Earnings sent to your MoMo every Monday without fail." },
              { icon: <Bike />, title: "Any Vehicle", text: "Motorcycle, car, or bicycle — all vehicle types welcome." },
              { icon: <Palmtree />, title: "Kokrobite Brand", text: "Deliver for East Legon's most loved beach restaurant." }
            ].map((feat, idx) => (
              <motion.div 
                key={idx}
                {...fadeIn}
                className="bg-[#F97316]/5 border border-[#F97316]/10 rounded-2xl p-6 text-left hover:bg-[#F97316]/10 transition-colors"
              >
                <div className="w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-[#F97316]/20">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-[#FFFFFF66] text-sm leading-relaxed">{feat.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: REQUIREMENTS & CALCULATOR ── */}
      <section className="bg-[#111111] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Requirements */}
          <div>
            <h2 className="font-serif text-4xl text-white mb-10">Requirements</h2>
            <div className="space-y-4">
              {[
                "Valid Ghana driver's license",
                "Any roadworthy vehicle",
                "Active smartphone",
                "Ghana MoMo account",
                "Must be 18 years or older",
                "Clean delivery record"
              ].map((req, idx) => (
                <div key={idx} className="flex items-center gap-4 py-4 border-b border-white/5">
                  <CheckCircle2 size={20} className="text-[#F97316]" />
                  <span className="text-white/90 font-medium">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings Calculator */}
          <div className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet size={120} />
            </div>
            
            <h2 className="font-serif text-3xl text-white mb-8 relative z-10">Your Potential Earnings</h2>
            
            <div className="mb-10 relative z-10">
              <label className="block text-[#FFFFFF66] text-sm mb-6 uppercase tracking-widest font-bold">
                How many deliveries per day?
              </label>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setDeliveries(Math.max(1, deliveries - 1))}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F97316] hover:border-[#F97316] transition-all"
                >
                  <Minus size={20} />
                </button>
                
                <div className="text-5xl font-display text-white w-20 text-center">
                  {deliveries}
                </div>
                
                <button 
                  onClick={() => setDeliveries(Math.min(20, deliveries + 1))}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F97316] hover:border-[#F97316] transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={deliveries}
                onChange={(e) => setDeliveries(parseInt(e.target.value))}
                className="w-full mt-10 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              <div className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-2xl p-5">
                <div className="text-[#F97316] font-display text-3xl mb-1">GHC {earnings.day}</div>
                <div className="text-[#FFFFFF66] text-[10px] uppercase tracking-widest font-bold">Per Day</div>
              </div>
              <div className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-2xl p-5">
                <div className="text-[#F97316] font-display text-3xl mb-1">GHC {earnings.week}</div>
                <div className="text-[#FFFFFF66] text-[10px] uppercase tracking-widest font-bold">Per Week</div>
              </div>
              <div className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-2xl p-5">
                <div className="text-[#F97316] font-display text-3xl mb-1">GHC {earnings.month}</div>
                <div className="text-[#FFFFFF66] text-[10px] uppercase tracking-widest font-bold">Per Month</div>
              </div>
            </div>

            <p className="mt-8 text-[#FFFFFF33] text-[10px] italic">
              *Based on 6 working days per week
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CTA BANNER ── */}
      <section className="bg-gradient-to-br from-[#1C0A00] to-[#F97316] py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
            Ready to Start Earning?
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-12">
            Join the KO Rider team today. Your first delivery is waiting.
          </p>
          
          <Link 
            to="/delivery/register"
            className="inline-flex items-center gap-3 bg-white text-[#F97316] font-bold uppercase tracking-wider text-sm px-12 py-5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform"
          >
            Apply Now — It's Free <Bike size={20} />
          </Link>
          
          <div className="mt-8">
            <Link 
              to="/delivery/login"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Already a driver? Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0C0A09] border-t border-[#F97316]/10 py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-white/40 text-sm">
            <Bike size={18} />
            <span>KO Rider by Kokrobite Oasis</span>
          </div>
          
          <div className="flex gap-8">
            <Link to="/delivery/terms" className="text-white/30 text-xs hover:text-[#F97316] transition-colors">
              Terms & Conditions
            </Link>
          </div>

          <div className="text-white/20 text-xs tracking-widest">
            © 2026 KOKROBITE OASIS
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DriverLanding;
