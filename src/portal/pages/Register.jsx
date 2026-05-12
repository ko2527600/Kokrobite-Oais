import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  HiOutlineEnvelope, HiLockClosed, HiOutlineEye, HiOutlineEyeSlash, 
  HiOutlineUser, HiOutlinePhone, HiOutlineArrowRight, HiOutlineShieldCheck
} from 'react-icons/hi2';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { login } = useCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordStrength < 50) {
      return toast.error('Please choose a stronger password');
    }

    setLoading(true);
    try {
      const res = await api.post('/customers/auth/register', formData);
      login(res.data.token, res.data.customer);
      toast.success('Welcome to KO Eats! 🌴 You earned 50 Oasis Points');
      navigate('/portal/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await api.post('/customers/auth/google', { 
        credential: response.credential 
      });
      login(res.data.token, res.data.customer);
      toast.success('Registered with Google! 👋');
      navigate('/portal/dashboard');
    } catch (err) {
      toast.error('Google Sign-Up failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex overflow-hidden">
      
      {/* Right Column (Form) is now on mobile/tablet primarily, Desktop gets split */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto bg-[#FFF7ED]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 blur-[120px] rounded-full lg:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8 relative z-10 py-10"
        >
          <div>
            <h2 className="text-4xl font-display font-bold tracking-tight text-[#1C0A00] mb-2">Create Account</h2>
            <p className="text-[#1C0A00]/50 font-medium text-sm">Join KO Eats today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1C0A00] uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 group-focus-within:text-[#F97316] transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-white border rounded-2xl pl-12 pr-4 py-3.5 text-[#1C0A00] placeholder-[rgba(28,10,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all text-sm font-sans"
                      style={{ borderColor: 'rgba(249,115,22,0.25)' }}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1C0A00] uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                    <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 group-focus-within:text-[#F97316] transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full bg-white border rounded-2xl pl-12 pr-4 py-3.5 text-[#1C0A00] placeholder-[rgba(28,10,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all text-sm font-sans"
                      style={{ borderColor: 'rgba(249,115,22,0.25)' }}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1C0A00] uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 group-focus-within:text-[#F97316] transition-colors" size={20} />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="024 XXX XXXX"
                      className="w-full bg-white border rounded-2xl pl-12 pr-4 py-3.5 text-[#1C0A00] placeholder-[rgba(28,10,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all text-sm font-sans"
                      style={{ borderColor: 'rgba(249,115,22,0.25)' }}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1C0A00] uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 group-focus-within:text-[#F97316] transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="Create password"
                      className="w-full bg-white border rounded-2xl pl-12 pr-12 py-3.5 text-[#1C0A00] placeholder-[rgba(28,10,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all text-sm font-sans"
                      style={{ borderColor: 'rgba(249,115,22,0.25)' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 hover:text-[#1C0A00]"
                    >
                      {showPassword ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                    </button>
                </div>
                {/* Strength Meter */}
                <div className="flex gap-1 px-1 h-1">
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 25 ? 'bg-red-500' : 'bg-[#1C0A00]/10'}`} />
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 50 ? 'bg-orange-500' : 'bg-[#1C0A00]/10'}`} />
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 75 ? 'bg-yellow-500' : 'bg-[#1C0A00]/10'}`} />
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 100 ? 'bg-green-500' : 'bg-[#1C0A00]/10'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1C0A00] uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                    <HiOutlineShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 group-focus-within:text-[#F97316] transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Repeat password"
                      className="w-full bg-white border rounded-2xl pl-12 pr-4 py-3.5 text-[#1C0A00] placeholder-[rgba(28,10,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all text-sm font-sans"
                      style={{ borderColor: 'rgba(249,115,22,0.25)' }}
                    />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50 mt-4 font-sans"
              style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', boxShadow: '0 8px 25px rgba(249,115,22,0.35)' }}
            >
              {loading ? 'CREATING ACCOUNT...' : (
                <>
                  CREATE PORTAL ACCOUNT
                  <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1C0A00]/10"></div></div>
            <span className="relative px-4 bg-[#FFF7ED] text-[10px] font-bold text-[#1C0A00]/30 uppercase tracking-[0.2em]">Or use Google</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => toast.error('Google Register Error')}
              theme="outline"
              shape="rectangular"
              size="large"
              text="signup_with"
              width="320"
            />
          </div>

          <p className="text-center text-sm font-medium text-[rgba(28,10,0,0.50)]">
            Already have an account? {' '}
            <Link to="/portal/login" className="text-[#F97316] font-bold hover:underline">Sign In</Link>
          </p>

          <div className="pt-8 text-center">
             <a href="https://kokrobiteoasis.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#1C0A00]/30 hover:text-[#F97316] uppercase tracking-widest transition-colors">
                ← Visit Kokrobite Oasis Website
             </a>
          </div>
        </motion.div>
      </div>

      {/* Left Column (Branding/Image) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1a1a1a]">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
            src="https://images.unsplash.com/photo-1530062845289-9109b2c9c868?auto=format&fit=crop&q=80&w=1200" 
            alt="Kokrobite Oasis" 
            className="w-full h-full object-cover opacity-40 scale-110"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.75), rgba(28,10,0,0.85))' }} />
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-2xl overflow-hidden">
              <img src="/icons/logo.png" alt="KO" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-display italic font-bold text-white">KO Eats</span>
          </div>

          <div>
             <motion.h1 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-display font-bold tracking-tighter leading-tight text-white mb-6"
            >
              START <br /> <span className="text-[#F97316]">EARNING.</span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-sm"
            >
              <p className="text-white/50 text-xs uppercase tracking-widest font-medium">beach bliss. good food. pure vibes</p>
            </motion.div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl self-start">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center text-white font-black text-xs">🎁</div>
                <span className="text-sm font-black text-white uppercase tracking-tight font-sans">Registration Bonus</span>
             </div>
             <p className="text-xs text-white/60">Your first 50 points are on the house!</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerRegister;
