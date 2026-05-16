import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlineSquares2X2, HiOutlineRectangleGroup, HiOutlinePhoto, 
  HiOutlineMapPin, HiOutlineMegaphone, HiOutlineShoppingBag, 
  HiOutlineStar, HiOutlineCog6Tooth, HiBars3, HiXMark, HiBell,
  HiOutlineArrowRightOnRectangle, HiOutlineUsers, HiOutlineChatBubbleLeftRight,
  HiOutlineTruck, HiOutlineChevronRight, HiOutlineSignal
} from "react-icons/hi2";
import { useAuth } from "./AuthContext";
import api from "../api/axios";
import Breadcrumbs from "./components/Breadcrumbs";

const SidebarItem = ({ icon: Icon, label, path, active, badge, badgeColor, onClick, isCollapsed }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center gap-2.5 px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors relative group ${
      active
        ? 'text-[#F97316] bg-[#F97316]/10'
        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
    } ${isCollapsed ? 'justify-center px-0 mx-3' : ''}`}
  >
    {active && !isCollapsed && (
      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#F97316]" />
    )}
    <Icon size={isCollapsed ? 20 : 16} className="shrink-0" />
    {!isCollapsed && (
      <span className="text-[13px] font-medium whitespace-nowrap">
        {label}
      </span>
    )}

    {!isCollapsed && badge > 0 && (
      <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none ${
        badgeColor === 'yellow' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
        badgeColor === 'orange' ? 'bg-[#F97316]/20 text-[#F97316]' :
        'bg-[#EF4444]/20 text-[#EF4444]'
      }`}>
        {badge}
      </span>
    )}

    {isCollapsed && badge > 0 && (
      <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
        badgeColor === 'yellow' ? 'bg-[#F59E0B]' :
        badgeColor === 'orange' ? 'bg-[#F97316]' :
        'bg-[#EF4444]'
      }`} />
    )}

    {isCollapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1A1A1A] border border-white/10 rounded-lg text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[110] whitespace-nowrap shadow-2xl">
        {label}
      </div>
    )}
  </Link>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close drawer whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll while the drawer is open on mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Stats placeholders
  const [pendingOrders, setPendingOrders] = useState(0);
  const [unapprovedReviews, setUnapprovedReviews] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newFeedback, setNewFeedback] = useState(0);
  const [pendingDrivers, setPendingDrivers] = useState(0);
  const [deliveringDrivers, setDeliveringDrivers] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/analytics/summary");
      setPendingOrders(res.data.pendingOrders || 0);
      setUnapprovedReviews(res.data.unapprovedReviews || 0);
      setTotalCustomers(res.data.totalCustomers || 0);
      setNewFeedback(res.data.newFeedback || 0);
      setPendingDrivers(res.data.pendingDrivers || 0);
      setDeliveringDrivers(res.data.deliveringDrivers || 0);
    } catch (err) {
      console.error("Failed to fetch sidebar stats");
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} · ${date.toLocaleTimeString([], { hour12: false })}`;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('menu')) return 'Menu Manager';
    if (path.includes('gallery')) return 'Gallery Assets';
    if (path.includes('branches')) return 'Branch Locations';
    if (path.includes('orders')) return 'Order Management';
    if (path.includes('reviews')) return 'Customer Reviews';
    if (path.includes('announcements')) return 'Global Announcements';
    if (path.includes('customers')) return 'Customer Directory';
    if (path.includes('drivers')) return 'Rider Management';
    if (path.includes('feedback')) return 'App Feedback';
    if (path.includes('settings')) return 'System Settings';
    return 'Admin Panel';
  };

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", path: "/admin/dashboard", icon: HiOutlineSquares2X2 }
      ]
    },
    {
      title: "CONTENT",
      items: [
        { label: "Menu Manager", path: "/admin/menu", icon: HiOutlineRectangleGroup },
        { label: "Gallery", path: "/admin/gallery", icon: HiOutlinePhoto },
        { label: "Branches", path: "/admin/branches", icon: HiOutlineMapPin },
        { label: "Announcements", path: "/admin/announcements", icon: HiOutlineMegaphone }
      ]
    },
    {
      title: "BUSINESS",
      items: [
        { label: "Live Tracking", path: "/admin/live", icon: HiOutlineSignal, badge: deliveringDrivers, badgeColor: 'orange' },
        { label: "Orders", path: "/admin/orders", icon: HiOutlineShoppingBag, badge: pendingOrders, badgeColor: 'yellow' },
        { label: "Reviews", path: "/admin/reviews", icon: HiOutlineStar, badge: unapprovedReviews, badgeColor: 'red' },
        { label: "Customers", path: "/admin/customers", icon: HiOutlineUsers, badge: totalCustomers, badgeColor: 'yellow' },
        { label: "Drivers", path: "/admin/drivers", icon: HiOutlineTruck, badge: pendingDrivers, badgeColor: 'yellow' },
        { label: "Feedback", path: "/admin/feedback", icon: HiOutlineChatBubbleLeftRight, badge: newFeedback, badgeColor: 'red' }
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { label: "Settings", path: "/admin/settings", icon: HiOutlineCog6Tooth }
      ]
    }
  ];

  const sidebarWidth = isDesktop ? (isCollapsed ? 80 : 280) : 280;
  const mainOffset = isDesktop ? sidebarWidth : 0;

  return (
    <div className="min-h-screen bg-[#0C0A09] font-sans selection:bg-[#F97316]/20">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : (isMobileMenuOpen ? 0 : -sidebarWidth),
          width: sidebarWidth
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full bg-[#111111] border-r border-[#F97316]/10 z-[101] flex flex-col overflow-hidden"
      >
        <div className={`px-5 py-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5">
             <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 flex items-center justify-center p-1.5 shadow-lg shadow-[#F97316]/5 overflow-hidden">
                <img src="/icons/logo.png" alt="KO" className="w-full h-full object-contain" />
             </div>
             {!isCollapsed && (
               <h1 className="font-display text-base font-bold text-white tracking-tight leading-tight">
                 Kokrobite <span className="text-[#F97316]">Oasis</span>
               </h1>
             )}
          </div>
          {!isDesktop && !isCollapsed && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/30 hover:text-white p-1"
              aria-label="Close navigation"
            >
              <HiXMark size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-3">
          {navSections.map((section, idx) => (
            <div key={section.title} className="mb-3">
              {!isCollapsed ? (
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/25 px-6 mt-4 mb-1.5">{section.title}</p>
              ) : (
                <div className="h-px bg-white/5 mx-5 mt-4 mb-2" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item, i) => (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    isCollapsed={isCollapsed}
                    active={location.pathname === item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* COLLAPSE TOGGLE */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center h-9 border-t border-white/5 hover:bg-white/5 text-white/25 hover:text-[#F97316] transition-all"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
            <HiOutlineChevronRight size={16} />
          </motion.div>
        </button>

        <div className={`px-4 py-4 border-t border-white/5 mt-auto bg-[#0C0A09]/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
               style={{ background: 'linear-gradient(135deg, #F97316, #1C0A00)' }}>
               {user?.name?.charAt(0) || 'A'}
             </div>
             {!isCollapsed && (
               <div className="flex-1 min-w-0">
                 <p className="text-[12px] font-semibold text-white truncate leading-tight">{user?.name || 'Admin'}</p>
                 <p className="text-[10px] text-white/40 truncate leading-tight">{user?.email || 'admin@kokrobiteoasis.com'}</p>
               </div>
             )}
             {!isCollapsed && (
               <button
                 onClick={logout}
                 className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all"
                 title="Logout"
               >
                 <HiOutlineArrowRightOnRectangle size={16} />
               </button>
             )}
          </div>
        </div>
      </motion.aside>

      <motion.div
        animate={{ marginLeft: mainOffset }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <header
          className="fixed top-0 right-0 h-16 bg-[#0C0A09]/95 backdrop-blur-xl border-b border-[#F97316]/10 z-50 px-4 sm:px-6 lg:px-8 flex items-center justify-between"
          style={{ left: mainOffset }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-white/60 hover:text-white -ml-1 p-2"
              aria-label="Open navigation"
            >
              <HiBars3 size={24} />
            </button>
            <h2 className="font-display font-bold text-white text-base sm:text-lg uppercase tracking-tight truncate">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden md:block text-white/30 text-[10px] tracking-widest uppercase">
              {formatTime(time)}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-white/40 hover:text-white transition-colors p-1"
              >
                <HiBell size={20} />
                {pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F97316] rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 right-0 w-80 bg-[#0C0A09] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Recent Orders</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-8 text-center text-white/20 text-xs">No notifications yet</div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/5 hover:ring-[#F97316]/50 transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F97316, #1C0A00)' }}
              >
                {user?.name?.charAt(0) || 'A'}
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowUserDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 right-0 w-48 bg-[#0C0A09] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden"
                    >
                      <button 
                        onClick={() => { navigate('/admin/settings'); setShowUserDropdown(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <HiOutlineCog6Tooth size={18} /> Settings
                      </button>
                      <button 
                        onClick={() => { logout(); setShowUserDropdown(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2 transition-colors border-t border-white/5 font-sans"
                      >
                        <HiOutlineArrowRightOnRectangle size={18} /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="sticky top-16 z-40 mt-16">
          <Breadcrumbs />
        </div>
        <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;
