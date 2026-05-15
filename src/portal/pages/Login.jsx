import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiOutlineEnvelope, HiLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';
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
      toast.success('Welcome back!');
      navigate('/portal/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
      if (msg.toLowerCase().includes('google sign-in')) {
        toast.error("This account uses Google sign-in — use the button below!", { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      setError('');
      const credential = response.credential;
      if (!credential) {
        throw new Error('Google authentication was cancelled or failed.');
      }
      const res = await api.post('/customers/auth/google', { credential });
      const { token, customer } = res.data;
      login(token, customer);
      toast.success(`Welcome back, ${customer.name.split(' ')[0]}!`);
      navigate('/portal/dashboard');
    } catch (err) {
      console.error('Google login error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || 'Google login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      toast.error('Enter your email above first, then tap Forgot password again.');
      return;
    }
    toast('A password reset link will be sent to ' + formData.email, { icon: '✉️' });
    api.post('/customers/auth/forgot-password', { email: formData.email })
      .then(() => toast.success('Check your email for reset instructions.'))
      .catch(() => toast.error('We could not send the email. Try again in a moment.'));
  };

  return (
    <div className="min-h-screen bg-brand-cream flex overflow-hidden">

      <div className="hidden lg:flex w-1/2 relative bg-brand-dark">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img
            src="https://images.unsplash.com/photo-1530062845289-9109b2c9c868?auto=format&fit=crop&q=80&w=1200"
            alt=""
            loading="eager"
            className="w-full h-full object-cover opacity-40 scale-110"
          />
          <div className="absolute inset-0 bg-brand-dark/60" aria-hidden="true" />
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <Link to="/" className="inline-flex items-center gap-3 px-4 py-3 min-h-12 text-text-primary/60 hover:text-text-primary transition-colors text-sm font-bold">
            <HiOutlineArrowLeft size={18} aria-hidden="true" /> Back to website
          </Link>

          <div>
             <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-display font-bold tracking-tighter leading-tight text-text-primary mb-6"
            >
              Welcome <br /> <span className="text-brand-primary">back.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-text-primary/70 max-w-md font-medium"
            >
              Order your favourite meals, track your deliveries, and earn loyalty points with every bite.
            </motion.p>
          </div>

          <div />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-brand-cream">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-brand-cream/80 backdrop-blur-sm rounded-3xl"
              >
                <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
                <p className="text-brand-dark font-bold text-sm tracking-widest uppercase">Authenticating...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <h2 className="text-4xl font-display font-bold tracking-tight text-brand-dark mb-2">Welcome back</h2>
            <p className="text-brand-dark/60 font-medium">Sign in to KO Eats</p>
          </div>

          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl text-sm font-medium border text-red-700 bg-red-50 border-red-200"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Sign in">
            <div className="space-y-2">
               <label htmlFor="email" className="text-xs font-bold text-brand-dark uppercase tracking-widest ml-1 block">Email address</label>
               <div className="relative group">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30 group-focus-within:text-brand-primary transition-colors" size={20} aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@email.com"
                    className="w-full bg-white border border-brand-primary/25 rounded-2xl pl-12 pr-4 py-4 text-brand-dark placeholder-brand-dark/35 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all font-sans"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="text-xs font-bold text-brand-dark uppercase tracking-widest">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider min-h-10 px-2"
                  >
                    Forgot password?
                  </button>
               </div>
               <div className="relative group">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30 group-focus-within:text-brand-primary transition-colors" size={20} aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="Your password"
                    className="w-full bg-white border border-brand-primary/25 rounded-2xl pl-12 pr-14 py-4 text-brand-dark placeholder-brand-dark/35 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center text-brand-dark/40 hover:text-brand-dark transition-colors rounded-lg"
                  >
                    {showPassword ? <HiOutlineEyeSlash size={20} aria-hidden="true" /> : <HiOutlineEye size={20} aria-hidden="true" />}
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-brand-primary cursor-pointer rounded-lg"
              />
              <label htmlFor="rememberMe" className="text-brand-dark/55 text-sm cursor-pointer hover:text-brand-dark/80 transition-colors">
                Keep me logged in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-text-primary font-bold py-4 min-h-12 rounded-2xl flex items-center justify-center gap-2 group transition-colors active:scale-[0.98] disabled:opacity-50 bg-brand-primary hover:bg-brand-primary/90 font-sans"
            >
              {loading ? 'Authenticating…' : (
                <>
                  Sign in to portal
                  <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center py-2" aria-hidden="true">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-dark/15"></div></div>
            <span className="relative px-4 bg-brand-cream text-[10px] font-bold text-brand-dark/40 uppercase tracking-[0.2em]">Or continue with</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google login failed. Please try again.')}
              useOneTap={false}
              theme="filled_black"
              shape="rectangular"
              text="signin_with"
              width="320"
            />
          </div>

          <p className="text-center text-sm font-medium text-brand-dark/55">
            Don't have an account?{' '}
            <Link to="/portal/register" className="text-brand-primary font-bold hover:underline">Create account</Link>
          </p>

          <div className="pt-8 text-center">
             <a href="https://kokrobiteoasis.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-brand-dark/35 hover:text-brand-primary uppercase tracking-widest transition-colors">
                ← Visit Kokrobite Oasis website
             </a>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default CustomerLogin;
