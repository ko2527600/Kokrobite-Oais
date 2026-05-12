import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, 
  HiOutlineShieldCheck, HiOutlineTrash, HiOutlineArrowRight,
  HiOutlineCalendar, HiOutlineShoppingBag, HiOutlineBanknotes, HiOutlineStar,
  HiLockClosed
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const ProfileCard = ({ title, icon: Icon, children }) => (
  <div className="bg-[#0C0A09] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
    <div className="flex items-center gap-3">
       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#F97316]">
          <Icon size={22} />
       </div>
       <h4 className="text-lg font-display font-bold text-white uppercase tracking-tight">{title}</h4>
    </div>
    {children}
  </div>
);

const CustomerProfile = () => {
  const { customer, refreshCustomer } = useCustomer();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/customers/auth/profile', profileData);
      toast.success('Profile updated successfully');
      refreshCustomer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.patch('/customers/auth/change-password', passwordData);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      
      {/* Profile Header Card */}
      <section className="bg-gradient-to-br from-[#1C0A00] to-[#0C0A09] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform" />
         
         <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
            <div className="relative">
               <div className="w-32 h-32 rounded-full p-1 shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', border: '2px solid rgba(249,115,22,0.30)' }}>
                  {customer?.avatar ? (
                    <img src={customer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-display font-bold text-white">
                      {customer?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
               </div>
               <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-[#1C0A00] rounded-full" />
            </div>

            <div className="flex-1 space-y-4">
               <div>
                  <h2 className="text-4xl font-display font-bold text-white tracking-tighter">{customer?.name}</h2>
                  <p className="text-white/40 font-sans font-medium">{customer?.email}</p>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-white/60 font-sans">
                     <HiOutlineCalendar className="text-[#F97316]" /> Joined {new Date(customer?.createdAt).toLocaleDateString()}
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-white/60 font-sans">
                     <HiOutlineShieldCheck className="text-green-400" /> Account Verified
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[120px]">
                  <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Member Since</p>
                  <p className="text-sm text-white font-bold font-sans">{new Date(customer?.createdAt).getFullYear()}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[120px]">
                  <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Total Orders</p>
                  <p className="text-sm text-white font-bold font-sans">0</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[120px]">
                  <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Total Spent</p>
                  <p className="text-sm text-white font-bold font-sans">₵0.00</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[120px]">
                  <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Loyalty Points</p>
                  <p className="text-sm font-bold font-sans text-[#F97316]">{customer?.loyaltyPoints || 0}</p>
               </div>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Personal Info Form */}
         <ProfileCard title="Personal Information" icon={HiOutlineUser}>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                     <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F97316] transition-colors" size={20} />
                     <input 
                        type="text" 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-[#F97316] outline-none transition-all font-sans"
                     />
                  </div>
               </div>
               <div className="space-y-2 opacity-50">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email (Immutable)</label>
                  <div className="relative">
                     <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                     <input type="email" value={customer?.email} disabled className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white/40 cursor-not-allowed font-sans" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                     <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F97316] transition-colors" size={20} />
                     <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-[#F97316] outline-none transition-all font-sans"
                     />
                  </div>
               </div>
               <button 
                 disabled={loading}
                 className="w-full text-white font-black py-4 rounded-2xl shadow-xl shadow-[#F97316]/20 hover:scale-105 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                 style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
               >
                 {loading ? 'SAVING...' : 'SAVE CHANGES'}
               </button>
            </form>
         </ProfileCard>

         <div className="space-y-10">
            {/* Password Form (Only for non-Google users) */}
            {!customer?.googleId && (
              <ProfileCard title="Update Password" icon={HiLockClosed}>
                 <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Current Password</label>
                       <input 
                          type="password" 
                          required
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:border-[#F97316] outline-none transition-all font-sans"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">New Password</label>
                       <input 
                          type="password" 
                          required
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:border-[#F97316] outline-none transition-all font-sans"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Confirm New Password</label>
                       <input 
                          type="password" 
                          required
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:border-[#F97316] outline-none transition-all font-sans"
                       />
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full bg-white text-[#0C0A09] font-black py-4 rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                      UPDATE PASSWORD
                    </button>
                 </form>
              </ProfileCard>
            )}

            {/* Account Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                     <HiOutlineTrash size={22} />
                  </div>
                  <h4 className="text-lg font-display font-bold text-red-500 uppercase tracking-tight">Danger Zone</h4>
               </div>
               <p className="text-xs text-white/40 leading-relaxed font-medium font-sans">Permanently delete your account and all associated data, including order history and loyalty points. This action cannot be undone.</p>
               <button className="w-full border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest">
                  DELETE MY ACCOUNT
               </button>
            </div>
         </div>

      </div>

    </div>
  );
};

export default CustomerProfile;
