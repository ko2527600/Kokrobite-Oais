import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineArrowRight, HiOutlineClock, 
  HiOutlineStar, HiOutlineBanknotes, HiOutlineBell, HiOutlineArrowPath
} from 'react-icons/hi2';
import { Palmtree, Bell } from 'lucide-react';
import { useCustomer } from '../CustomerContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import api from '../../api/axios';

const StatCard = ({ title, value, icon: Icon, trend, trendColor }) => (
  <div
    className="p-6 rounded-2xl relative overflow-hidden group"
    style={{ background: '#1a1a1a', border: '1px solid rgba(249,115,22,0.10)' }}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(255,255,255,0.40)' }}>{title}</p>
      <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
      {trend && (
        <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${trendColor}`}>
           {trend}
        </div>
      )}
    </div>
  </div>
);

const CustomerDashboard = () => {
  const { customer } = useCustomer();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [ordersRes, notifsRes] = await Promise.all([
        api.get('/customers/orders'),
        api.get('/customers/notifications')
      ]);
      
      const orders = ordersRes.data;
      const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const pendingCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
      
      const newData = {
        stats: {
          totalOrders: orders.length,
          totalSpent: totalSpent,
          pendingCount: pendingCount
        },
        recentOrders: orders.slice(0, 3),
        recentNotifs: (notifsRes.data.notifications || []).slice(0, 3)
      };

      if (isSilent) {
        setStats(prev => JSON.stringify(prev) === JSON.stringify(newData.stats) ? prev : newData.stats);
        setRecentOrders(prev => JSON.stringify(prev) === JSON.stringify(newData.recentOrders) ? prev : newData.recentOrders);
        setRecentNotifs(prev => JSON.stringify(prev) === JSON.stringify(newData.recentNotifs) ? prev : newData.recentNotifs);
      } else {
        setStats(newData.stats);
        setRecentOrders(newData.recentOrders);
        setRecentNotifs(newData.recentNotifs);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [customer?.loyaltyPoints]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={`stat-skeleton-${i}`} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl" />
           <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      
      {/* Welcome Banner */}
      <section 
        className="relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden border border-white/5"
        style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
            src="https://images.unsplash.com/photo-1530062845289-9109b2c9c868?auto=format&fit=crop&q=80&w=1200" 
            alt="" 
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl">
           <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-white mb-4 leading-tight flex items-center gap-4">
             {getTimeGreeting()}, <span className="text-white">{customer?.name?.split(' ')[0]}!</span>
             <Palmtree className="text-white/40" size={40} />
           </h1>
           <p className="text-white/80 font-medium mb-8 text-lg">What are you craving today?</p>
           <Link to="/portal/order" className="inline-flex items-center gap-3 bg-white text-[#1C0A00] px-8 py-4 rounded-2xl font-bold text-sm tracking-widest transition-all hover:scale-105 shadow-2xl shadow-black/20 group">
              BROWSE MENU
              <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={HiOutlineShoppingBag}
          trend={`${stats.totalOrders} lifetime orders`}
          trendColor="text-white/40"
        />
        <StatCard 
          title="Total Spent" 
          value={`₵${stats.totalSpent}`} 
          icon={HiOutlineBanknotes}
          trend="Lifetime spending"
          trendColor="text-white/40"
        />
        <StatCard 
          title="Loyalty Points" 
          value={customer?.loyaltyPoints || 0} 
          icon={HiOutlineStar}
          trend="Available to redeem"
          trendColor="text-yellow-400"
        />
        <StatCard 
          title="Active Orders" 
          value={stats.pendingCount} 
          icon={HiOutlineClock}
          trend={stats.pendingCount > 0 ? "Tracking live" : "No active orders"}
          trendColor={stats.pendingCount > 0 ? "text-[#F97316]" : "text-white/40"}
        />
      </section>

      {/* Loyalty Progress Section */}
      <section className="bg-gradient-to-br from-[#1C0A00] to-[#F97316] rounded-3xl p-8 lg:p-10 shadow-2xl shadow-[#F97316]/10 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
        
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-3 text-white mb-2">
            <HiOutlineStar size={28} className="text-yellow-400" />
            <span className="font-display font-bold text-3xl tracking-tight flex items-center gap-3">
              <Palmtree size={32} className="text-yellow-400" />
              {customer?.loyaltyPoints} Oasis Points
            </span>
          </div>
          <p className="text-white/80 font-medium max-w-sm">Earn 1 point for every GHC 10 spent</p>
          
          <div className="mt-6 w-full max-w-md bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
             <div 
               className="bg-white h-full rounded-full shadow-lg" 
               style={{ width: `${Math.min((customer?.loyaltyPoints % 100), 100)}%` }} 
             />
          </div>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">
            {100 - (customer?.loyaltyPoints % 100)} points until your next reward milestone
          </p>
        </div>

        <Link to="/portal/loyalty" className="bg-white text-[#F97316] px-8 py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-[#F97316] hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap relative z-10 font-sans">
          VIEW HISTORY
        </Link>
      </section>

      {/* Order Again */}
      {recentOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
              Order Again <Palmtree size={20} className="text-[#F97316]" />
            </h3>
            <Link to="/portal/order" className="text-[#F97316] text-xs font-bold hover:underline tracking-widest uppercase font-sans">Browse Menu</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.slice(0, 3).map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-white/5 hover:border-[#F97316] transition-all group cursor-pointer"
                style={{ background: '#1a1a1a' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>
                    <HiOutlineArrowPath size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">Order {order.orderNumber}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Link
                  to="/portal/order"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  style={{ color: '#F97316', border: '1px solid rgba(249,115,22,0.25)' }}
                >
                  Reorder <HiOutlineArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid: Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Recent Orders List */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
              Recent Orders <HiOutlineShoppingBag size={20} className="text-[#F97316]" />
            </h3>
            <Link to="/portal/orders" className="text-[#F97316] text-xs font-bold hover:underline tracking-widest uppercase font-sans">View All Orders</Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <div key={order.id} className="bg-[#0C0A09] border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-[#F97316] shrink-0">
                    <HiOutlineShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-1">Order {order.orderNumber}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="font-black text-white">₵{order.totalAmount}</p>
                    <div className="mt-1"><OrderStatusBadge status={order.status} /></div>
                  </div>
                  <Link to={`/portal/orders/${order.id}`} className="p-3 bg-white/5 hover:bg-[#F97316] rounded-xl text-white/60 hover:text-white transition-all">
                    <HiOutlineArrowRight size={20} />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="bg-[#0C0A09] border border-white/5 p-12 rounded-2xl text-center">
                 <HiOutlineShoppingBag size={48} className="mx-auto text-white/10 mb-4" />
                 <p className="text-white/40 font-bold mb-6 font-sans">No orders found.</p>
                 <Link to="/portal/order" className="text-[#F97316] font-bold text-sm hover:underline uppercase tracking-widest font-sans">Place your first order</Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent Notifications */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
              Notifications <HiOutlineBell size={20} className="text-[#F97316]" />
            </h3>
            <Link to="/portal/notifications" className="text-[#F97316] text-xs font-bold hover:underline tracking-widest uppercase font-sans">View All</Link>
          </div>

          <div className="bg-[#0C0A09] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
             {recentNotifs.length > 0 ? recentNotifs.map(n => (
               <div key={n.id} className="p-6 hover:bg-white/[0.02] transition-all relative group">
                  {!n.read && <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#F97316] rounded-r-full" />}
                  <div className="flex gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-[#F97316]/20 text-[#F97316]' : 'bg-white/5 text-white/20'}`}>
                        <HiOutlineBell size={18} />
                     </div>
                     <div>
                        <p className={`text-sm font-bold mb-1 font-sans ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                        <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed font-sans">{n.message}</p>
                     </div>
                  </div>
               </div>
             )) : (
               <div className="p-12 text-center text-white/10">
                  <HiOutlineBell size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest font-sans">No Activity</p>
               </div>
             )}
          </div>
          
          <div className="bg-[#F97316]/5 border border-[#F97316]/10 p-6 rounded-3xl mt-6">
             <div className="flex items-center gap-3 mb-3">
                <HiOutlineStar className="text-yellow-400" size={20} />
                <span className="text-xs font-black text-white uppercase tracking-tight font-sans">Need Help?</span>
             </div>
             <p className="text-[10px] text-white/60 leading-relaxed mb-4 font-sans">Our support team is available via WhatsApp for any order inquiries or complaints.</p>
             <a href="https://wa.me/UPDATE_WITH_KO_WHATSAPP" className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.2em] hover:underline flex items-center gap-1 font-sans">
                CONTACT SUPPORT <HiOutlineArrowRight size={10} />
             </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CustomerDashboard;
