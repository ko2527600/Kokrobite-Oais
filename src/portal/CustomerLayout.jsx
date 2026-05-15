import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineHome, HiOutlineShoppingBag, HiOutlineClipboardDocumentList,
  HiOutlineStar, HiOutlineBell, HiOutlineMapPin, HiOutlineGift,
  HiOutlineUser, HiOutlineArrowRightOnRectangle, HiBars3, HiXMark,
  HiOutlineChatBubbleLeftRight, HiOutlineArrowLeft
} from 'react-icons/hi2';
import { useCustomer } from './CustomerContext';
import LoyaltyBadge from './components/LoyaltyBadge';
import api from '../api/axios';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';

const NavItem = ({ icon: Icon, label, path, active, badge, onClick }) => (
  <Link 
    to={path}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
      active 
        ? 'bg-[#F97316]/10 text-[#F97316] border-l-4 border-[#F97316]' 
        : 'text-white/40 border-l-4 border-transparent hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={22} className={active ? 'text-[#F97316]' : 'group-hover:text-[#F97316] transition-colors'} />
      <span className="font-bold text-sm tracking-wide font-sans">{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
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
      } catch (err) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const navSections = [
    {
      title: "ORDERING",
      items: [
        { label: "Dashboard", path: "/portal/dashboard", icon: HiOutlineHome },
        { label: "Place Order", path: "/portal/order", icon: HiOutlineShoppingBag },
        { label: "My Orders", path: "/portal/orders", icon: HiOutlineClipboardDocumentList },
        { label: "Notifications", path: "/portal/notifications", icon: HiOutlineBell, badge: unreadCount },
        { label: "Addresses", path: "/portal/addresses", icon: HiOutlineMapPin },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "Reviews", path: "/portal/reviews", icon: HiOutlineStar },
        { label: "Loyalty Points", path: "/portal/loyalty", icon: HiOutlineGift },
        { label: "Feedback", path: "/portal/feedback", icon: HiOutlineChatBubbleLeftRight },
        { label: "Profile", path: "/portal/profile", icon: HiOutlineUser },
      ],
    },
  ];
  const navItems = navSections.flatMap(s => s.items);

  const getPageTitle = () => {
    const item = navItems.find(i => location.pathname.startsWith(i.path));
    return item ? item.label : 'Customer Portal';
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white selection:bg-[#F97316]/30 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-72 bg-[#1C0A00] border-r border-white/5 hidden lg:flex flex-col z-50">
        <div className="p-8">
          <Link to="/" className="flex flex-col group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center p-2 shadow-lg group-hover:rotate-6 transition-transform overflow-hidden">
                <img src="/icons/logo.png" alt="KO" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-display italic font-bold tracking-tight text-white">KO Eats</span>
            </div>
            <span className="text-[11px] text-white/50 font-sans mt-1 ml-[52px]">by Kokrobite Oasis</span>
          </Link>
        </div>

        <div className="px-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#F97316] p-0.5 overflow-hidden">
                {customer?.avatar ? (
                  <img src={customer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#F97316]/20 rounded-full flex items-center justify-center font-bold text-[#F97316]">
                    {customer?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate font-sans">{customer?.name}</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest font-sans">Portal Member</p>
              </div>
            </div>
            <LoyaltyBadge points={customer?.loyaltyPoints || 0} />
          </div>
        </div>

        {isInstallable && !isInstalled && (
          <div className="px-6 mb-6">
            <button 
              onClick={triggerInstall}
              className="w-full group relative overflow-hidden p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#F97316]/20"
              style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <HiOutlineArrowDownTray size={20} className="text-white animate-bounce" />
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-xs uppercase tracking-tight font-sans">Install KO Eats</p>
                  <p className="text-white/70 text-[10px] font-bold font-sans">Fast & Offline Access</p>
                </div>
              </div>
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-4">
          {navSections.map(section => (
            <div key={section.title}>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 px-4 mb-1">{section.title}</p>
              <div className="space-y-1">
                {section.items.map(item => (
                  <NavItem key={item.label} {...item} active={location.pathname === item.path} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 space-y-2 mt-auto border-t border-white/5">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors text-sm font-bold">
            <HiOutlineArrowLeft size={18} /> Back to Website
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm font-bold"
          >
            <HiOutlineArrowRightOnRectangle size={22} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-72 min-h-screen flex flex-col pb-24 lg:pb-0">
        
        {/* Top Header */}
        <header className="h-20 bg-[#0C0A09]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-white/60 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <HiBars3 size={24} />
            </button>
            <h2 className="text-xl font-display font-bold tracking-tight uppercase hidden sm:block">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all relative text-white/60 hover:text-white"
              >
                <HiOutlineBell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              
              <AnimatePresence>
                {showNotifDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-[#0C0A09] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 font-sans">
                        <span className="font-bold text-xs uppercase tracking-widest text-white/40">Recent Notifications</span>
                        <Link to="/portal/notifications" className="text-[10px] text-[#F97316] font-bold hover:underline" onClick={() => setShowNotifDropdown(false)}>VIEW ALL</Link>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentNotifs.length > 0 ? recentNotifs.map(n => (
                          <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-[#F97316]/5' : ''}`}>
                            <p className={`text-xs font-bold ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                            <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-white/20 text-xs">No notifications</div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-white/5 mx-2" />

            <Link to="/portal/order" 
              className="hidden md:flex text-white px-5 py-2 rounded-xl font-bold text-sm items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-[#F97316]/20 font-sans"
              style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
            >
              <HiOutlineShoppingBag size={18} />
              Order Now
            </Link>

            <Link to="/portal/profile" className="flex items-center gap-3 p-1 pr-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                 {customer?.avatar ? (
                  <img src={customer.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#F97316] flex items-center justify-center font-bold text-xs text-white">
                    {customer?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-white/80 hidden sm:inline">{customer?.name?.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 p-6 lg:p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#1C0A00] z-[70] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
                    <img src="/icons/logo.png" alt="KO" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-display italic font-bold tracking-tight text-lg">KO Eats</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/40 hover:text-white">
                  <HiXMark size={24} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                {navSections.map(section => (
                  <div key={section.title}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 px-4 mb-1">{section.title}</p>
                    <div className="space-y-1">
                      {section.items.map(item => (
                        <NavItem key={item.label} {...item} active={location.pathname === item.path} onClick={() => setIsMobileMenuOpen(false)} />
                      ))}
                    </div>
                  </div>
                ))}

                {isInstallable && !isInstalled && (
                  <button 
                    onClick={() => {
                      triggerInstall();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-4 text-white rounded-xl font-bold text-sm shadow-xl shadow-[#F97316]/20 animate-pulse font-sans"
                    style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                  >
                    <HiOutlineArrowDownTray size={22} />
                    INSTALL KO EATS APP
                  </button>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-sm"
                >
                  <HiOutlineArrowRightOnRectangle size={22} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#1C0A00]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 lg:hidden z-40 pb-safe">
        {[
          { label: "Home", path: "/portal/dashboard", icon: HiOutlineHome },
          { label: "Order", path: "/portal/order", icon: HiOutlineShoppingBag },
          { label: "Orders", path: "/portal/orders", icon: HiOutlineClipboardDocumentList },
          { label: "Inbox", path: "/portal/notifications", icon: HiOutlineBell, badge: unreadCount },
          { label: "Profile", path: "/portal/profile", icon: HiOutlineUser },
        ].map(item => (
          <Link 
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all relative ${
              location.pathname === item.path ? 'text-[#F97316]' : 'text-white/40'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold">
                {item.badge}
              </span>
            )}
            {location.pathname === item.path && (
              <motion.div layoutId="mobileTab" className="absolute -top-1 w-8 h-1 bg-[#F97316] rounded-full" />
            )}
          </Link>
        ))}
      </nav>

    </div>
  );
};

export default CustomerLayout;
