import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  LayoutGrid
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isInstallable, triggerInstall } = useInstallPrompt();

  const categories = [
    'All', 'Brunch', 'Kissed by Fire', 'Cocktails', 'Mocktails', 
    'Sides', 'Pizza', 'Burgers & Wraps', 'Platters', 'Pitchers', 
    'Juices', 'Shots', 'Slushys', 'Beers & Ciders', 'Soft Drinks'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, galleryRes, reviewsRes] = await Promise.all([
          axios.get('/api/menu?available=true'),
          axios.get('/api/gallery?visible=true'),
          axios.get('/api/reviews?approved=true')
        ]);
        setMenuItems(menuRes.data);
        setGalleryItems(galleryRes.data.slice(0, 8));
        setReviews(reviewsRes.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMenu = activeCategory === 'All' 
    ? menuItems.slice(0, 6) 
    : menuItems.filter(item => item.category === activeCategory).slice(0, 6);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#1C0A00] font-body selection:bg-[#F97316]/20">
      
      {/* ── SECTION 1 — NAVBAR ── */}
      <nav className="fixed top-0 left-0 w-full h-[68px] bg-[#FFF7ED]/95 backdrop-blur-[20px] border-b border-[#F97316]/12 z-50 flex items-center justify-between px-4 md:px-8">
        {/* Left: Logo */}
        <Link to="/portal" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🌴</span>
          <h1 className="font-display italic text-[22px] flex items-center">
            <span className="text-[#1C0A00]">Kokrobite</span>
            <span className="text-[#F97316] ml-1">Oasis</span>
          </h1>
        </Link>

        {/* Center: Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {['Menu', 'Gallery', 'Reviews', 'About'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-sm font-semibold text-[#1C0A00]/60 hover:text-[#F97316] transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            to="/portal/login" 
            className="hidden md:block px-5 py-2 border border-[#F97316]/40 text-[#F97316] font-bold text-sm rounded-lg hover:bg-[#F97316]/5 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/portal/login" 
            className="px-5 py-2 bg-[#F97316] text-white font-bold text-sm rounded-lg shadow-lg shadow-[#F97316]/20 hover:scale-105 active:scale-95 transition-all"
          >
            Order Now
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-[#1C0A00]"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[68px] left-0 w-full bg-[#FFF7ED] border-b border-[#F97316]/12 z-40 lg:hidden py-6 px-4 flex flex-col gap-4 shadow-xl"
          >
            {['Menu', 'Gallery', 'Reviews', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-left text-lg font-semibold text-[#1C0A00]/80 hover:text-[#F97316] py-2"
              >
                {item}
              </button>
            ))}
            <Link 
              to="/portal/login"
              className="w-full py-4 bg-[#F97316] text-white font-bold text-center rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            >
              Order Now 🛍️
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION 2 — HERO ── */}
      <section className="min-h-screen flex flex-col lg:flex-row items-center pt-[68px]">
        {/* Left Content */}
        <motion.div 
          initial="initial"
          animate="animate"
          className="w-full lg:w-[60%] px-6 md:px-12 lg:px-20 py-12 lg:py-20"
        >
          <motion.div
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] text-xs font-bold uppercase tracking-widest rounded-full mb-6"
          >
            🌴 East Legon, Accra — Ghana
          </motion.div>

          <motion.h1 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ delay: 0.4 }}
            className="font-display text-[clamp(56px,10vw,100px)] font-light leading-[0.88] tracking-[-0.03em] text-[#1C0A00]"
          >
            Beach Bliss. <br />
            Good Food. <br />
            <span className="italic text-[#F97316]">Pure Vibes.</span>
          </motion.h1>

          <motion.p 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ delay: 0.6 }}
            className="max-w-[480px] mt-6 text-[#1C0A00]/55 text-base leading-relaxed"
          >
            Order authentic beach-inspired cuisine from Kokrobite Oasis. 
            From our famous Surfside Brunch to signature cocktails — 
            delivered to your door or ready for pickup.
          </motion.p>

          <motion.div 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link 
              to="/portal/login"
              className="px-10 py-4 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-wider text-sm rounded-xl shadow-[0_10px_40px_rgba(249,115,22,0.30)] hover:scale-105 transition-transform"
            >
              Order Now 🛍️
            </Link>
            <button 
              onClick={() => scrollToSection('menu')}
              className="px-10 py-4 border border-[#1C0A00]/20 text-[#1C0A00] font-semibold text-sm rounded-xl hover:bg-[#1C0A00]/5 transition-colors"
            >
              Browse Menu
            </button>
          </motion.div>

          {/* Stats Strip */}
          <motion.div 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ delay: 1.0 }}
            className="mt-16 pt-8 border-t border-[#1C0A00]/08 flex flex-wrap gap-x-12 gap-y-6"
          >
            {[
              { val: '29+', label: 'Menu Items', color: '#F97316' },
              { val: '4.8★', label: 'Average Rating' },
              { val: '1', label: 'Location' },
              { val: '30min', label: 'Avg Delivery' }
            ].map((stat, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col">
                  <span className="font-display text-4xl" style={{ color: stat.color || '#1C0A00' }}>{stat.val}</span>
                  <span className="text-[#1C0A00]/40 text-[10px] uppercase tracking-wider mt-1">{stat.label}</span>
                </div>
                {i < 3 && <div className="hidden sm:block w-[1px] h-10 bg-[#1C0A00]/08 self-center" />}
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content: Image */}
        <div className="hidden lg:flex w-[40%] justify-center relative">
          <div className="relative">
            {/* Spinning Circle */}
            <div className="w-[420px] h-[420px] border-[8px] border-[#F97316]/15 rounded-full overflow-hidden animate-[spin-slow_20s_linear_infinite]">
              <img 
                src="https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&q=85&w=800" 
                alt="Featured Dish"
                className="w-full h-full object-cover animate-[spin-slow_20s_linear_infinite_reverse]"
              />
            </div>

            {/* Floating Card */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute -bottom-6 -left-12 bg-white shadow-[0_20px_60px_rgba(28,10,0,0.12)] border border-[#F97316]/15 rounded-2xl p-5 w-56"
            >
              <p className="text-[#F97316] text-[9px] uppercase tracking-[0.2em] font-bold">🔥 Today's Special</p>
              <h4 className="text-[#1C0A00] font-bold text-sm mt-1">Tropical Velvet Dream</h4>
              <p className="text-[#F97316] font-bold text-base mt-1">GHC 255</p>
            </motion.div>

            {/* Floating Badge */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4, type: 'spring' }}
              className="absolute -top-4 -right-4 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl p-4 text-center shadow-lg"
            >
              <p className="text-white font-display text-2xl">⭐ 4.8</p>
              <p className="text-white/70 text-[10px] uppercase">Rating</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — FEATURES ── */}
      <section id="features" className="bg-[#1C0A00] py-24 px-6 md:px-12">
        <motion.div 
          {...sectionVariants}
          className="max-w-6xl mx-auto"
        >
          <h2 className="font-display text-5xl md:text-6xl text-white text-center mb-4">Why Order from KO Eats?</h2>
          <p className="text-white/40 text-center mb-20 max-w-2xl mx-auto">The best of Kokrobite Oasis delivered to your doorstep</p>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: '🍽️', title: 'Fresh Daily Menu', text: 'Our kitchen prepares everything fresh daily using quality local ingredients' },
              { icon: '🚀', title: 'Fast Delivery', text: 'Hot food delivered in 30-45 minutes across East Legon and surrounding areas' },
              { icon: '🌴', title: 'Beach Vibes Food', text: 'From Surfside Brunch to signature cocktails — taste the Kokrobite Oasis experience at home' },
              { icon: '⭐', title: 'Earn Oasis Points', text: 'Every order earns you loyalty points redeemable for discounts and free items' },
              { icon: '📱', title: 'Easy Ordering', text: 'Order in seconds, track in real-time, and rate your experience — all from one app' },
              { icon: '💳', title: 'Pay Your Way', text: 'Cash on delivery, Mobile Money, or Hubtel — choose what works for you' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 }
                }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 hover:border-[#F97316]/30 hover:bg-[#F97316]/05 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F97316]/15 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-white font-bold text-xl mt-6">{feat.title}</h3>
                <p className="text-white/40 text-sm mt-3 leading-relaxed">{feat.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── SECTION 4 — MENU PREVIEW ── */}
      <section id="menu" className="py-24 px-6 md:px-12 bg-[#FFF7ED]">
        <motion.div {...sectionVariants} className="max-w-7xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl text-[#1C0A00] text-center mb-2">Our Menu</h2>
          <p className="text-[#1C0A00]/40 text-center mb-12 uppercase tracking-widest text-xs font-bold">Tap a category to explore</p>

          {/* Category Pills */}
          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all snap-start ${
                  activeCategory === cat 
                  ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20' 
                  : 'bg-white border border-[#1C0A00]/12 text-[#1C0A00]/60 hover:border-[#F97316]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <AnimatePresence mode="popLayout">
              {filteredMenu.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-[#1C0A00]/08 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(28,10,0,0.06)] hover:shadow-[0_10px_40px_rgba(249,115,22,0.15)] hover:-translate-y-2 transition-all group"
                >
                  <div className="h-56 w-full relative overflow-hidden bg-[#F97316]/05">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">🍽️</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-[#1C0A00] font-bold text-lg">{item.name}</h3>
                    <p className="text-[#1C0A00]/50 text-sm mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between mt-6">
                      <span className="font-display text-2xl text-[#F97316] font-bold">GHC {item.price}</span>
                      <Link 
                        to="/portal/login"
                        className="bg-[#F97316]/10 text-[#F97316] font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-[#F97316] hover:text-white transition-all"
                      >
                        Order Now →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Link 
            to="/portal/login"
            className="mt-16 mx-auto block w-fit px-12 py-5 border border-[#F97316]/30 text-[#F97316] font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#F97316] hover:text-white transition-all shadow-lg shadow-transparent hover:shadow-[#F97316]/20"
          >
            View Full Menu →
          </Link>
        </motion.div>
      </section>

      {/* ── SECTION 5 — HOW TO ORDER ── */}
      <section className="bg-[#F97316] py-24 px-6 md:px-12">
        <motion.div {...sectionVariants} className="max-w-6xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl text-white text-center mb-20">Order in 3 Simple Steps</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {[
              { num: '01', icon: '📱', title: 'Create Account', text: 'Sign up in seconds with your email or Google account' },
              { num: '02', icon: '🛍️', title: 'Choose Your Order', text: 'Browse our full menu, pick your favourites, and add to cart' },
              { num: '03', icon: '🌴', title: 'Enjoy Your Food', text: 'Choose delivery or pickup. Pay on delivery or via MoMo. Track your order live.' }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 text-center group">
                  <div className="relative">
                    <span className="font-display text-[100px] text-white/15 leading-none">{step.num}</span>
                    <div className="text-5xl -mt-10 relative group-hover:scale-125 transition-transform">{step.icon}</div>
                  </div>
                  <h3 className="text-white font-bold text-xl mt-6">{step.title}</h3>
                  <p className="text-white/65 text-sm mt-3 leading-relaxed max-w-[240px] mx-auto">{step.text}</p>
                </div>
                {i < 2 && <ArrowRight className="hidden md:block text-white/30 w-10 h-10" />}
              </React.Fragment>
            ))}
          </div>

          <Link 
            to="/portal/login"
            className="mt-20 mx-auto block w-fit px-12 py-5 bg-white text-[#F97316] font-bold uppercase tracking-widest text-sm rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform"
          >
            Start Ordering Now →
          </Link>
        </motion.div>
      </section>

      {/* ── SECTION 6 — GALLERY PREVIEW ── */}
      <section id="gallery" className="bg-[#1C0A00] py-24 px-6 md:px-12">
        <motion.div {...sectionVariants} className="max-w-7xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl text-white text-center mb-4">Food Stories</h2>
          <p className="text-white/40 text-center mb-16">A peek at what's coming to your table</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryItems.map((item, i) => (
              <div 
                key={i}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${i % 5 === 0 ? 'row-span-2' : ''}`}
                style={{ aspectRatio: i % 5 === 0 ? '3/4' : '1/1' }}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C0A00]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <h4 className="text-white font-bold text-sm">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 7 — REVIEWS ── */}
      <section id="reviews" className="py-24 px-6 md:px-12 bg-[#FFF7ED]">
        <motion.div {...sectionVariants} className="max-w-6xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl text-[#1C0A00] text-center mb-4">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-2 text-[#F97316] font-bold mb-16">
            <span className="text-lg">⭐ 4.8</span>
            <span className="text-[#1C0A00]/30 text-sm">•</span>
            <span className="text-sm">Based on 200+ reviews</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev, i) => (
              <div key={i} className="bg-white border border-[#1C0A00]/08 rounded-3xl p-8 shadow-[0_4px_20px_rgba(28,10,0,0.06)] flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#F97316" className="text-[#F97316]" />
                  ))}
                </div>
                <p className="font-display italic text-[#1C0A00]/75 text-xl leading-relaxed relative">
                  <span className="text-[#F97316]/20 text-6xl absolute -top-4 -left-2 pointer-events-none font-serif">"</span>
                  {rev.comment}
                </p>
                <div className="mt-8 pt-6 border-t border-[#1C0A00]/08 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold">
                    {rev.customer?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-[#1C0A00] font-bold text-sm">{rev.customer?.name || 'Happy Customer'}</h4>
                    <p className="text-[#1C0A00]/30 text-xs mt-0.5">{new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 8 — DOWNLOAD APP ── */}
      <section className="py-24 px-6 md:px-12 bg-[#FFF7ED]">
        <motion.div {...sectionVariants} className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <div className="inline-block px-4 py-2 bg-[#F97316]/10 text-[#F97316] text-[10px] font-bold uppercase tracking-widest rounded-full mb-6">
              📱 Available Now
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-[#1C0A00] font-light leading-tight mb-6">Get KO Eats on Your Phone</h2>
            <p className="text-[#1C0A00]/55 text-lg leading-relaxed mb-10">
              Install KO Eats directly on your phone — no app store needed. 
              Order food, earn Oasis Points, and track your delivery in real time.
            </p>
            
            <div className="space-y-4 mb-10">
              {[
                'Works on iPhone and Android',
                'No app store download needed',
                'Works offline too',
                'Free to install and use'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[#1C0A00]/70">
                  <CheckCircle2 size={20} className="text-[#F97316]" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                if (isInstallable) {
                  triggerInstall();
                } else {
                  navigate('/portal/login');
                }
              }}
              className="px-12 py-5 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-widest text-sm rounded-xl shadow-[0_10px_40px_rgba(249,115,22,0.30)] hover:scale-105 transition-transform"
            >
              📲 Install KO Eats Free
            </button>
          </div>

          <div className="hidden lg:block relative flex-shrink-0">
            {/* Phone Mockup */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-[280px] bg-[#1C0A00] border-4 border-[#F97316]/20 rounded-[45px] p-3 shadow-[0_40px_80px_rgba(28,10,0,0.20)] overflow-hidden"
            >
              <div className="bg-[#FFF7ED] h-[540px] rounded-[36px] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-br from-[#F97316] to-[#FB923C] px-6 py-8">
                  <h4 className="text-white font-bold text-base flex items-center gap-2">KO Eats 🌴</h4>
                  <p className="text-white/70 text-[10px] mt-1">Good morning! 👋</p>
                </div>
                
                <div className="px-5 py-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1C0A00]/05">
                      <p className="text-[#1C0A00]/40 text-[9px] uppercase font-bold">Orders</p>
                      <p className="text-[#1C0A00] font-bold text-lg mt-1">5</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1C0A00]/05">
                      <p className="text-[#F97316] text-[9px] uppercase font-bold">Points</p>
                      <p className="text-[#F97316] font-bold text-lg mt-1">⭐ 150</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1C0A00]/05">
                    <p className="text-[#1C0A00]/40 text-[9px] uppercase font-bold mb-3">Recent Order</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[#1C0A00] font-bold text-xs">Ginger Gold Pancakes</p>
                        <p className="text-[#1C0A00]/40 text-[9px] mt-0.5">GHC 155</p>
                      </div>
                      <span className="text-[#10B981] text-[9px] font-bold bg-[#10B981]/10 px-2 py-1 rounded-full">Delivered ✅</span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-[#F97316] to-[#FB923C] rounded-2xl py-4 text-white font-bold text-xs shadow-lg shadow-[#F97316]/20">
                    Order Again 🛍️
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 9 — FINAL CTA ── */}
      <section className="py-32 px-6 md:px-12 bg-gradient-to-br from-[#1C0A00] to-[#F97316] relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        
        <motion.div {...sectionVariants} className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-[clamp(40px,8vw,80px)] font-light text-white leading-none">Ready to Order?</h2>
          <p className="text-white/60 text-lg mt-6 max-w-2xl mx-auto">Join thousands of happy customers enjoying Kokrobite Oasis from the comfort of their homes.</p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link 
              to="/portal/login"
              className="px-12 py-5 bg-white text-[#F97316] font-bold uppercase tracking-widest text-sm rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.20)] hover:scale-105 transition-transform"
            >
              Start Ordering Now 🛍️
            </Link>
            <button 
              onClick={() => scrollToSection('menu')}
              className="px-12 py-5 border border-white/30 text-white font-semibold text-sm rounded-xl hover:bg-white/10 transition-all"
            >
              Browse Menu First
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 10 — FOOTER ── */}
      <footer className="bg-[#0C0A09] pt-20 pb-10 px-6 md:px-12 border-t border-[#F97316]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Col 1 */}
          <div className="col-span-2 md:col-span-1">
            <h1 className="font-display italic text-3xl">
              <span className="text-white">Kokrobite</span>
              <span className="text-[#F97316] ml-1">Oasis</span>
            </h1>
            <p className="text-white/30 text-[10px] mt-3 uppercase tracking-[0.2em] leading-relaxed">
              beach bliss. good food. pure vibes
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {['Menu', 'Gallery', 'Reviews'].map(link => (
                <button key={link} onClick={() => scrollToSection(link.toLowerCase())} className="text-white/40 text-sm hover:text-[#F97316] text-left transition-colors">{link}</button>
              ))}
              {['Order Now', 'Sign In', 'Register'].map(link => (
                <Link key={link} to="/portal/login" className="text-white/40 text-sm hover:text-[#F97316] transition-colors">{link}</Link>
              ))}
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Find Us</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-white/40 text-sm">
                <MapPin size={16} className="text-[#F97316] shrink-0 mt-1" />
                <span>East Legon, Accra Ghana</span>
              </div>
              <div className="flex items-start gap-3 text-white/40 text-sm">
                <Clock size={16} className="text-[#F97316] shrink-0 mt-1" />
                <div>
                  <p>Tue–Sun: 11AM – 11PM</p>
                  <p className="text-white/20 mt-1">Monday: Closed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <Phone size={16} className="text-[#F97316]" />
                <span>+233 24 000 0000</span>
              </div>
              <a href="https://wa.me/233240000000" className="flex items-center gap-3 text-[#F97316] text-sm font-bold">
                <MessageCircle size={16} />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Follow Us</h4>
            <div className="flex gap-3 mb-6">
              {[
                { icon: <Instagram size={18} />, label: 'Instagram' },
                { icon: <Facebook size={18} />, label: 'Facebook' },
                { icon: <Twitter size={18} />, label: 'Twitter' }
              ].map((soc, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/05 flex items-center justify-center text-white/60 hover:bg-[#F97316] hover:text-white transition-all shadow-lg shadow-transparent hover:shadow-[#F97316]/20">
                  {soc.icon}
                </a>
              ))}
            </div>
            <p className="text-white/20 text-[10px] leading-relaxed">
              Tag us in your stories @kokrobite.oasis for a chance to be featured!
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/05 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-[10px]">
            © 2026 Kokrobite Oasis. All rights reserved.
          </p>
          <Link to="/delivery" className="text-[#F97316] text-[10px] font-bold hover:underline tracking-widest uppercase">
            Are you a driver? Join KO Rider →
          </Link>
        </div>
      </footer>

      {/* Global Style for no-scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spinSlow { to { transform: rotate(360deg) } }
      `}} />
    </div>
  );
};

export default LandingPage;
