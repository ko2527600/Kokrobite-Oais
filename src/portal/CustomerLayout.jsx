import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiOutlineHome, HiOutlineShoppingBag, HiOutlineClipboardDocumentList,
  HiOutlineStar, HiOutlineBell, HiOutlineGift,
  HiOutlineUser, HiOutlineArrowRightOnRectangle, HiBars3, HiXMark,
  HiOutlineArrowLeft, HiOutlineArrowDownTray
} from 'react-icons/hi2';
import { useCustomer } from './CustomerContext';
import LoyaltyBadge from './components/LoyaltyBadge';
import api from '../api/axios';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const NavItem = ({ icon: Icon, label, path, active, badge, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`flex items-center justify-between px-4 py-3 min-h-12 rounded-xl transition-colors border-l-4 ${
      active
        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary'
        : 'text-text-muted border-transparent hover:bg-text-primary/5 hover:text-text-primary'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={22} className={active ? 'text-brand-primary' : ''} aria-hidden="true" />
      <span className="font-bold text-sm tracking-wide font-sans">{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-brand-primary text-text-primary text-[10px] font-bold px-2 py-0.5 rounded-full" aria-label={`${badge} unread`}>
        {badge}
      </span>
    )}
  </Link>
);

const CustomerLayout = () => {
  const { customer, logout } = useCustomer();
  const { isInstallable, isInstalled, triggerInstall } = useInstallPrompt();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/customers/notifications');
        setRecentNotifs(res.data.slice(0, 5));
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifs();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchNotifs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/portal/dashboard', icon: HiOutlineHome },
    { label: 'Place Order', path: '/portal/order', icon: HiOutlineShoppingBag },
    { label: 'My Orders', path: '/portal/orders', icon: HiOutlineClipboardDocumentList },
    { label: 'Reviews & Feedback', path: '/portal/reviews', icon: HiOutlineStar },
    { label: 'Loyalty Points', path: '/portal/loyalty', icon: HiOutlineGift },
    { label: 'Profile & Addresses', path: '/portal/profile', icon: HiOutlineUser },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => location.pathname.startsWith(i.path));
    return item ? item.label : 'Customer Portal';
  };

  return (
    <div className="min-h-screen bg-brand-bg text-text-primary selection:bg-brand-primary/30 font-sans">

      {/* Desktop Sidebar */}
      <aside
        className="fixed top-0 left-0 bottom-0 w-72 bg-brand-dark border-r border-border-subtle hidden lg:flex flex-col z-50"
        aria-label="Primary navigation"
      >
        <div className="p-8">
          <Link to="/" className="flex flex-col" aria-label="Home">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-text-primary/5 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                <img src="/icons/logo.png" alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-display italic font-bold tracking-tight text-text-primary">KO Eats</span>
            </div>
            <span className="text-[11px] text-text-muted font-sans mt-1 ml-[52px]">by Kokrobite Oasis</span>
          </Link>
        </div>

        <div className="px-6 mb-8">
          <div className="bg-text-primary/5 border border-border-subtle rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-brand-primary p-0.5 overflow-hidden">
                {customer?.avatar ? (
                  <img src={customer.avatar} alt={`${customer.name} avatar`} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-primary/20 rounded-full flex items-center justify-center font-bold text-brand-primary" aria-hidden="true">
                    {customer?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate font-sans">{customer?.name}</p>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest font-sans">Portal Member</p>
              </div>
            </div>
            <LoyaltyBadge points={customer?.loyaltyPoints || 0} />
          </div>
        </div>

        {isInstallable && !isInstalled && (
          <div className="px-6 mb-6">
            <button
              onClick={triggerInstall}
              className="w-full p-4 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 transition-colors min-h-12"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-text-primary/15 rounded-xl flex items-center justify-center">
                  <HiOutlineArrowDownTray size={20} className="text-text-primary" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-text-primary font-black text-xs uppercase tracking-tight font-sans">Install KO Eats</p>
                  <p className="text-text-primary/70 text-[10px] font-bold font-sans">Fast & offline access</p>
                </div>
              </div>
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto" aria-label="Customer menu">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={location.pathname.startsWith(item.path)}
            />
          ))}
        </nav>

        <div className="p-4 space-y-2 mt-auto border-t border-border-subtle">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 min-h-12 text-text-muted hover:text-text-primary transition-colors text-sm font-bold">
            <HiOutlineArrowLeft size={18} aria-hidden="true" /> Back to website
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 min-h-12 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors text-sm font-bold"
          >
            <HiOutlineArrowRightOnRectangle size={22} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen flex flex-col pb-24 lg:pb-0">

        <header className="h-20 bg-brand-bg border-b border-border-subtle sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden w-12 h-12 inline-flex items-center justify-center text-text-muted hover:text-text-primary"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={isMobileMenuOpen}
            >
              <HiBars3 size={24} aria-hidden="true" />
            </button>
            <h1 className="text-xl font-display font-bold tracking-tight uppercase hidden sm:block">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="w-12 h-12 inline-flex items-center justify-center bg-text-primary/5 hover:bg-text-primary/10 rounded-xl transition-colors relative text-text-muted hover:text-text-primary"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-haspopup="menu"
                aria-expanded={showNotifDropdown}
              >
                <HiOutlineBell size={22} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full" aria-hidden="true" />
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} aria-hidden="true" />
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-4 w-80 bg-brand-bg border border-border-subtle rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-text-primary/5 font-sans">
                        <span className="font-bold text-xs uppercase tracking-widest text-text-muted">Recent notifications</span>
                        <Link to="/portal/notifications" className="text-[10px] text-brand-primary font-bold hover:underline min-h-10 inline-flex items-center" onClick={() => setShowNotifDropdown(false)}>View all</Link>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentNotifs.length > 0 ? recentNotifs.map(n => (
                          <div key={n.id} className={`p-4 border-b border-border-subtle hover:bg-text-primary/5 transition-colors ${!n.read ? 'bg-brand-primary/5' : ''}`}>
                            <p className={`text-xs font-bold ${!n.read ? 'text-text-primary' : 'text-text-muted'}`}>{n.title}</p>
                            <p className="text-[10px] text-text-muted mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-text-muted/50 text-xs">No notifications</div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-border-subtle mx-2" aria-hidden="true" />

            <Link
              to="/portal/order"
              className="hidden md:inline-flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 text-text-primary px-5 py-2 min-h-12 rounded-xl font-bold text-sm gap-2 transition-colors font-sans"
            >
              <HiOutlineShoppingBag size={18} aria-hidden="true" />
              Order now
            </Link>

            <Link to="/portal/profile" className="flex items-center gap-3 p-1 pr-3 bg-text-primary/5 hover:bg-text-primary/10 rounded-xl transition-colors border border-border-subtle">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                 {customer?.avatar ? (
                  <img src={customer.avatar} alt={`${customer.name} avatar`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-primary flex items-center justify-center font-bold text-xs text-text-primary" aria-hidden="true">
                    {customer?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-text-primary/80 hidden sm:inline">{customer?.name?.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-brand-dark z-[70] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-text-primary/5 rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
                    <img src="/icons/logo.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-display italic font-bold tracking-tight text-lg">KO Eats</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-12 h-12 inline-flex items-center justify-center text-text-muted hover:text-text-primary"
                  aria-label="Close navigation"
                >
                  <HiXMark size={24} aria-hidden="true" />
                </button>
              </div>

              <nav className="space-y-2 flex-1" aria-label="Customer menu mobile">
                {navItems.map((item) => (
                  <NavItem
                    key={item.label}
                    {...item}
                    active={location.pathname.startsWith(item.path)}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}

                {isInstallable && !isInstalled && (
                  <button
                    onClick={() => {
                      triggerInstall();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-4 min-h-12 text-text-primary rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 transition-colors font-sans"
                  >
                    <HiOutlineArrowDownTray size={22} aria-hidden="true" />
                    Install KO Eats app
                  </button>
                )}
              </nav>

              <div className="pt-6 border-t border-border-subtle space-y-4">
                 <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-12 text-red-400 font-bold text-sm"
                >
                  <HiOutlineArrowRightOnRectangle size={22} aria-hidden="true" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-brand-dark border-t border-border-subtle flex items-center justify-around px-4 lg:hidden z-40 pb-safe" aria-label="Bottom navigation">
        {[
          { label: 'Home', path: '/portal/dashboard', icon: HiOutlineHome },
          { label: 'Order', path: '/portal/order', icon: HiOutlineShoppingBag },
          { label: 'Orders', path: '/portal/orders', icon: HiOutlineClipboardDocumentList },
          { label: 'Inbox', path: '/portal/notifications', icon: HiOutlineBell, badge: unreadCount },
          { label: 'Profile', path: '/portal/profile', icon: HiOutlineUser },
        ].map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              aria-label={item.badge > 0 ? `${item.label}, ${item.badge} unread` : item.label}
              className={`flex flex-col items-center gap-1.5 w-14 min-h-12 justify-center transition-colors relative ${
                active ? 'text-brand-primary' : 'text-text-muted'
              }`}
            >
              <item.icon size={22} aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-brand-primary text-text-primary text-[8px] flex items-center justify-center rounded-full font-bold" aria-hidden="true">
                  {item.badge}
                </span>
              )}
              {active && (
                <motion.div layoutId="mobileTab" className="absolute -top-1 w-8 h-1 bg-brand-primary rounded-full" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

    </div>
  );
};

export default CustomerLayout;
