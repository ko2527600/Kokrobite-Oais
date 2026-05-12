import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiOutlineEnvelope, HiLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login } = useCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      const res = await api.post('/customers/auth/login', { ...formData, rememberMe });
      login(res.data.token, res.data.customer);
      toast.success('Welcome back! 👋');
      navigate('/portal/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      // Typically you'd send the credential to your backend
      const res = await api.post('/customers/auth/google', { 
        credential: response.credential 
      });
      login(res.data.token, res.data.customer);
      toast.success('Welcome back with Google! 👋');
      navigate('/portal/dashboard');
    } catch (err) {
      toast.error('Google Sign-In failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex overflow-hidden">
      
      {/* Left Column: Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1a1a1a]">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
            src="https://images.unsplash.com/photo-1530062845289-9109b2c9c868?auto=format&fit=crop&q=80&w=1200"
            alt="Delicious food" 
            className="w-full h-full object-cover opacity-40 scale-110 blur-[2px]"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.75), rgba(28,10,0,0.85))' }} />
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <Link to="/" className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center p-2 shadow-2xl overflow-hidden backdrop-blur-md">
              <img src="/icons/logo.png" alt="KO" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tighter uppercase text-white">Kokrobite <span className="text-[#F97316]">Oasis</span></span>
          </Link>

          <div>
             <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-display font-bold tracking-tighter leading-tight text-white mb-6"
            >
              WELCOME <br /> <span className="text-[#F97316]">BACK.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 max-w-md font-medium"
            >
              Order your favourite meals, track your deliveries, and earn loyalty points with every bite.
            </motion.p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
               <p className="text-2xl font-display font-bold text-white">50+</p>
               <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest font-sans">Menu Items</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
               <p className="text-2xl font-display font-bold text-[#F97316]">2k+</p>
               <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest font-sans">Happy Foodies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-[#FFF7ED]">
        {/* Subtle background glow for mobile */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 blur-[120px] rounded-full lg:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          <div>
            <h2 className="text-4xl font-display font-bold tracking-tight text-[#1C0A00] mb-2">Welcome Back</h2>
            <p className="text-[#1C0A00]/50 font-medium">Sign in to KO Eats</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl text-sm font-medium border"
              style={{ 
                color: '#DC2626', 
                backgroundColor: '#FEF2F2', 
                borderColor: '#FECACA' 
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-[#1C0A00] uppercase tracking-widest ml-1">Email Address</label>
               <div className="relative group">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 group-focus-within:text-[#F97316] transition-colors" size={20} />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@email.com"
                    className="w-full bg-white border rounded-2xl pl-12 pr-4 py-4 text-[#1C0A00] placeholder-[rgba(28,10,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all font-sans"
                    style={{ borderColor: 'rgba(249,115,22,0.25)' }}
                  />
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-[#1C0A00] uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[10px] font-bold text-[#F97316] hover:underline uppercase tracking-wider">Forgot Password?</button>
               </div>
               <div className="relative group">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 group-focus-within:text-[#F97316] transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-white border rounded-2xl pl-12 pr-12 py-4 text-[#1C0A00] placeholder-[rgba(28,10,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all font-sans"
                    style={{ borderColor: 'rgba(249,115,22,0.25)' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1C0A00]/30 hover:text-[#1C0A00] transition-colors"
                  >
                    {showPassword ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-[#F97316] cursor-pointer rounded-lg"
              />
              <label htmlFor="rememberMe" className="text-[rgba(28,10,0,0.50)] text-sm cursor-pointer hover:text-[#1C0A00]/70 transition-colors">
                Keep me logged in for 30 days
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50 font-sans"
              style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', boxShadow: '0 8px 25px rgba(249,115,22,0.35)' }}
            >
              {loading ? 'AUTHENTICATING...' : (
                <>
                  SIGN IN TO PORTAL
                  <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1C0A00]/10"></div></div>
            <span className="relative px-4 bg-[#FFF7ED] text-[10px] font-bold text-[rgba(28,10,0,0.35)] uppercase tracking-[0.2em]">Or continue with</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => toast.error('Google Login Error')}
              theme="outline"
              shape="rectangular"
              size="large"
              text="continue_with"
              width="320"
            />
          </div>

          <p className="text-center text-sm font-medium text-[rgba(28,10,0,0.50)]">
            Don't have an account? {' '}
            <Link to="/portal/register" className="text-[#F97316] font-bold hover:underline">Create Account</Link>
          </p>

          <div className="pt-8 text-center">
             <a href="https://kokrobiteoasis.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#1C0A00]/30 hover:text-[#F97316] uppercase tracking-widest transition-colors">
                ← Visit Kokrobite Oasis Website
             </a>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default CustomerLogin;
