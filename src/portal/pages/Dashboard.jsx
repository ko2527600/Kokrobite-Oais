import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShoppingBag, HiOutlineArrowRight, HiOutlineClock,
  HiOutlineStar, HiOutlineBanknotes, HiOutlineBell, HiOutlineArrowPath
} from 'react-icons/hi2';
import { useCustomer } from '../CustomerContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import api from '../../api/axios';

const StatCard = ({ title, value, icon: Icon, trend, trendColor }) => (
  <div className="p-6 rounded-2xl relative overflow-hidden bg-surface border border-border-subtle">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-brand-primary/15 text-brand-primary">
      <Icon size={24} aria-hidden="true" />
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 text-text-muted">{title}</p>
    <h3 className="text-3xl font-black text-text-primary tracking-tight">{value}</h3>
    {trend && (
      <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${trendColor}`}>
        {trend}
      </p>
    )}
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

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;

      setStats({
        totalOrders: orders.length,
        totalSpent,
        pendingCount
      });
      setRecentOrders(orders.slice(0, 3));
      
      const notifsData = notifsRes.data;
      const notifsList = Array.isArray(notifsData) ? notifsData : (Array.isArray(notifsData?.notifications) ? notifsData.notifications : []);
      setRecentNotifs(notifsList.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse" aria-busy="true" aria-live="polite">
        <div className="h-48 bg-text-primary/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={`stat-skeleton-${i}`} className="h-32 bg-text-primary/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-96 bg-text-primary/5 rounded-2xl" />
           <div className="h-96 bg-text-primary/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  const firstName = customer?.name?.split(' ')[0] || 'there';
  const points = customer?.loyaltyPoints || 0;
  const pointsToNext = 100 - (points % 100);

  return (
    <div className="space-y-10 pb-10">

      {/* Welcome */}
      <section className="rounded-3xl p-8 lg:p-10 bg-brand-primary border border-brand-primary/20">
        <p className="text-text-primary/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">{getTimeGreeting()}</p>
        <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-text-primary mb-3 leading-tight">
          Hello, {firstName}.
        </h1>
        <p className="text-text-primary/80 font-medium mb-6 text-base md:text-lg">What are you craving today?</p>
        <Link
          to="/portal/order"
          className="inline-flex items-center justify-center gap-3 bg-white text-brand-dark px-8 py-4 rounded-2xl font-bold text-sm tracking-widest min-h-12 hover:bg-brand-cream transition-colors"
        >
          BROWSE MENU
          <HiOutlineArrowRight aria-hidden="true" />
        </Link>
      </section>

      {/* Stats Grid */}
      <section aria-label="Account summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={HiOutlineShoppingBag}
          trend="lifetime"
          trendColor="text-text-muted"
        />
        <StatCard
          title="Total Spent"
          value={`₵${stats.totalSpent}`}
          icon={HiOutlineBanknotes}
          trend="lifetime"
          trendColor="text-text-muted"
        />
        <StatCard
          title="Loyalty Points"
          value={points}
          icon={HiOutlineStar}
          trend="available to redeem"
          trendColor="text-text-muted"
        />
        <StatCard
          title="Active Orders"
          value={stats.pendingCount}
          icon={HiOutlineClock}
          trend={stats.pendingCount > 0 ? 'tracking live' : 'no active orders'}
          trendColor={stats.pendingCount > 0 ? 'text-brand-primary' : 'text-text-muted'}
        />
      </section>

      {/* Loyalty Progress */}
      <section
        className="bg-surface border border-border-subtle rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
        aria-label="Loyalty progress"
      >
        <div className="flex flex-col gap-3 max-w-md">
          <div className="flex items-center gap-3 text-text-primary">
            <HiOutlineStar size={24} className="text-brand-primary" aria-hidden="true" />
            <span className="font-display font-bold text-2xl tracking-tight">
              {points} Oasis Points
            </span>
          </div>
          <p className="text-text-muted font-medium text-sm">Earn 1 point for every GHC 10 spent.</p>

          <div className="mt-4 w-full bg-text-primary/5 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={points % 100} aria-label={`${pointsToNext} points until next reward`}>
            <div
              className="bg-brand-primary h-full rounded-full transition-[width]"
              style={{ width: `${Math.min((points % 100), 100)}%` }}
            />
          </div>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
            {pointsToNext} points until your next reward
          </p>
        </div>

        <Link
          to="/portal/loyalty"
          className="bg-brand-primary text-text-primary px-8 py-4 rounded-2xl font-bold text-sm tracking-widest hover:bg-brand-primary/90 transition-colors whitespace-nowrap min-h-12 inline-flex items-center"
        >
          VIEW HISTORY
        </Link>
      </section>

      {/* Order Again */}
      {recentOrders.length > 0 && (
        <section aria-label="Order again" className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-display font-bold tracking-tight text-text-primary">
              Order again
            </h2>
            <Link to="/portal/order" className="text-brand-primary text-xs font-bold hover:underline tracking-widest uppercase font-sans min-h-10 inline-flex items-center">Browse menu</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.slice(0, 3).map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-border-subtle bg-surface hover:border-brand-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-primary/15 text-brand-primary">
                    <HiOutlineArrowPath size={20} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary text-sm truncate">Order {order.orderNumber}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Link
                  to="/portal/order"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-text-primary transition-colors min-h-10"
                >
                  Reorder <HiOutlineArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <section aria-label="Recent orders" className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-display font-bold tracking-tight text-text-primary">
              Recent orders
            </h2>
            <Link to="/portal/orders" className="text-brand-primary text-xs font-bold hover:underline tracking-widest uppercase font-sans min-h-10 inline-flex items-center">View all</Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <article key={order.id} className="bg-brand-bg border border-border-subtle p-6 rounded-2xl hover:bg-text-primary/[0.03] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-text-primary/5 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                    <HiOutlineShoppingBag size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary mb-1">Order {order.orderNumber}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="font-black text-text-primary">₵{order.totalAmount}</p>
                    <div className="mt-1"><OrderStatusBadge status={order.status} /></div>
                  </div>
                  <Link
                    to={`/portal/orders/${order.id}`}
                    aria-label={`Open order ${order.orderNumber}`}
                    className="w-12 h-12 inline-flex items-center justify-center bg-text-primary/5 hover:bg-brand-primary rounded-xl text-text-muted hover:text-text-primary transition-colors"
                  >
                    <HiOutlineArrowRight size={20} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            )) : (
              <div className="bg-brand-bg border border-border-subtle p-12 rounded-2xl text-center">
                 <HiOutlineShoppingBag size={48} className="mx-auto text-text-muted/40 mb-4" aria-hidden="true" />
                 <p className="text-text-muted font-bold mb-6 font-sans">No orders yet.</p>
                 <Link to="/portal/order" className="text-brand-primary font-bold text-sm hover:underline uppercase tracking-widest font-sans min-h-12 inline-flex items-center">Place your first order</Link>
              </div>
            )}
          </div>
        </section>

        <section aria-label="Notifications" className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-display font-bold tracking-tight text-text-primary">
              Notifications
            </h2>
            <Link to="/portal/notifications" className="text-brand-primary text-xs font-bold hover:underline tracking-widest uppercase font-sans min-h-10 inline-flex items-center">View all</Link>
          </div>

          <div className="bg-brand-bg border border-border-subtle rounded-3xl overflow-hidden divide-y divide-border-subtle">
             {recentNotifs.length > 0 ? recentNotifs.map(n => (
               <div key={n.id} className="p-6 hover:bg-text-primary/[0.02] transition-colors relative">
                  {!n.read && <div className="absolute left-0 top-6 bottom-6 w-1 bg-brand-primary rounded-r-full" aria-hidden="true" />}
                  <div className="flex gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-brand-primary/20 text-brand-primary' : 'bg-text-primary/5 text-text-muted'}`}>
                        <HiOutlineBell size={18} aria-hidden="true" />
                     </div>
                     <div>
                        <p className={`text-sm font-bold mb-1 font-sans ${!n.read ? 'text-text-primary' : 'text-text-muted'}`}>{n.title}</p>
                        <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed font-sans">{n.message}</p>
                     </div>
                  </div>
               </div>
             )) : (
               <div className="p-12 text-center text-text-muted/40">
                  <HiOutlineBell size={32} className="mx-auto mb-2" aria-hidden="true" />
                  <p className="text-xs font-bold uppercase tracking-widest font-sans">No activity</p>
               </div>
             )}
          </div>

          <div className="bg-brand-primary/5 border border-brand-primary/15 p-6 rounded-3xl">
             <div className="flex items-center gap-3 mb-3">
                <HiOutlineStar className="text-brand-primary" size={20} aria-hidden="true" />
                <span className="text-xs font-black text-text-primary uppercase tracking-tight font-sans">Need help?</span>
             </div>
             <p className="text-[11px] text-text-muted leading-relaxed mb-4 font-sans">Our support team is available via WhatsApp for any order inquiries or complaints.</p>
             <a href="https://wa.me/UPDATE_WITH_KO_WHATSAPP" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:underline inline-flex items-center gap-1 font-sans min-h-10">
                Contact support <HiOutlineArrowRight size={10} aria-hidden="true" />
             </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CustomerDashboard;
