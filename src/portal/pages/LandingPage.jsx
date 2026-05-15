import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronRight,
  Star,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Utensils,
  Truck,
  Smartphone,
  CreditCard,
  Sparkles,
  Palmtree
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
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark font-body selection:bg-brand-primary/20">

      {/* NAVBAR */}
      <nav
        className="fixed top-0 left-0 w-full h-16 bg-brand-cream/95 border-b border-brand-primary/15 z-50 flex items-center justify-between px-4 md:px-8"
        aria-label="Primary"
      >
        <Link to="/portal" className="flex items-center gap-2" aria-label="Kokrobite Oasis home">
          <Palmtree className="w-6 h-6 text-brand-primary" aria-hidden="true" />
          <h1 className="font-display italic text-[22px] flex items-center">
            <span className="text-brand-dark">Kokrobite</span>
            <span className="text-brand-primary ml-1">Oasis</span>
          </h1>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {['Menu', 'Gallery', 'Reviews', 'About'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-sm font-semibold text-brand-dark/70 hover:text-brand-primary transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/portal/login"
            className="hidden md:inline-flex items-center justify-center min-h-12 px-5 border border-brand-primary/40 text-brand-primary font-bold text-sm rounded-lg hover:bg-brand-primary/5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/portal/login"
            className="inline-flex items-center justify-center min-h-12 px-5 bg-brand-primary text-text-primary font-bold text-sm rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Order Now
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center w-12 h-12 text-brand-dark"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-16 left-0 w-full bg-brand-cream border-b border-brand-primary/15 z-40 lg:hidden py-6 px-4 flex flex-col gap-4 shadow-xl"
          >
            {['Menu', 'Gallery', 'Reviews', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-left text-lg font-semibold text-brand-dark/80 hover:text-brand-primary py-3 min-h-12"
              >
                {item}
              </button>
            ))}
            <Link
              to="/portal/login"
              className="w-full py-4 bg-brand-primary text-text-primary font-bold text-center rounded-xl min-h-12 inline-flex items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Order Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="min-h-screen flex flex-col lg:flex-row items-center pt-16">
        <motion.div
          initial="initial"
          animate="animate"
          className="w-full lg:w-3/5 px-6 md:px-12 lg:px-20 py-12 lg:py-20"
        >
          <motion.div
            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest rounded-full mb-6"
          >
            <MapPin size={14} aria-hidden="true" />
            East Legon, Accra — Ghana
          </motion.div>

          <motion.h1
            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
            transition={{ delay: 0.3 }}
            className="font-display text-[clamp(48px,8vw,84px)] font-light leading-[0.95] tracking-[-0.02em] text-brand-dark"
          >
            Beach Bliss. <br />
            Good Food. <br />
            <span className="italic text-brand-primary">Pure Vibes.</span>
          </motion.h1>

          <motion.p
            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
            transition={{ delay: 0.4 }}
            className="max-w-[520px] mt-6 text-brand-dark/65 text-base md:text-lg leading-relaxed"
          >
            Order authentic beach-inspired cuisine from Kokrobite Oasis.
            From our famous Surfside Brunch to signature cocktails — delivered to your door or ready for pickup.
          </motion.p>

          <motion.div
            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/portal/login"
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 bg-brand-primary text-text-primary font-bold text-sm rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              Order Now
            </Link>
            <button
              onClick={() => scrollToSection('menu')}
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 border border-brand-dark/20 text-brand-dark font-semibold text-sm rounded-xl hover:bg-brand-dark/5 transition-colors"
            >
              Browse Menu
            </button>
          </motion.div>
        </motion.div>

        <div className="hidden lg:flex w-2/5 justify-center relative px-12">
          <div className="relative w-full max-w-[440px] aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(28,10,0,0.18)]">
            <img
              src="https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&q=85&w=800"
              alt="A vibrant plate of beach-inspired cuisine"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-brand-dark py-24 px-6 md:px-12">
        <motion.div {...sectionVariants} className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-text-primary text-center mb-3">Why order from KO Eats?</h2>
          <p className="text-text-muted text-center mb-16 max-w-2xl mx-auto">The best of Kokrobite Oasis, delivered.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { Icon: Utensils, title: 'Fresh daily menu', text: 'Our kitchen prepares everything fresh daily using quality local ingredients.' },
              { Icon: Truck, title: 'Fast delivery', text: 'Hot food delivered in 30–45 minutes across East Legon and surrounding areas.' },
              { Icon: Palmtree, title: 'Beach vibes food', text: 'From Surfside Brunch to signature cocktails — taste the Oasis experience at home.' },
              { Icon: Sparkles, title: 'Earn Oasis Points', text: 'Every order earns you loyalty points redeemable for discounts and free items.' },
              { Icon: Smartphone, title: 'Easy ordering', text: 'Order in seconds, track in real-time, and rate your experience — all from one app.' },
              { Icon: CreditCard, title: 'Pay your way', text: 'Cash on delivery, Mobile Money, or Hubtel — choose what works for you.' }
            ].map(({ Icon, title, text }) => (
              <div
                key={title}
                className="bg-surface border border-border-subtle rounded-2xl p-8 transition-colors hover:border-brand-primary/40"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/15 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-brand-primary" aria-hidden="true" />
                </div>
                <h3 className="text-text-primary font-bold text-xl mt-6">{title}</h3>
                <p className="text-text-muted text-sm mt-3 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* MENU */}
      <section id="menu" className="py-24 px-6 md:px-12 bg-brand-cream">
        <motion.div {...sectionVariants} className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-brand-dark text-center mb-2">Our menu</h2>
          <p className="text-brand-dark/45 text-center mb-12 uppercase tracking-widest text-xs font-bold">Tap a category to explore</p>

          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory" role="tablist" aria-label="Menu categories">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`min-h-12 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors snap-start ${
                  activeCategory === cat
                    ? 'bg-brand-primary text-text-primary'
                    : 'bg-white border border-brand-dark/15 text-brand-dark/70 hover:border-brand-primary/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <AnimatePresence mode="popLayout">
              {filteredMenu.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="bg-white border border-brand-dark/10 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(28,10,0,0.06)] transition-shadow hover:shadow-[0_12px_36px_rgba(28,10,0,0.12)]"
                >
                  <div className="h-56 w-full relative overflow-hidden bg-brand-primary/5">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Utensils className="w-10 h-10 text-brand-primary/40" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-brand-dark font-bold text-lg">{item.name}</h3>
                    <p className="text-brand-dark/55 text-sm mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between mt-6">
                      <span className="font-display text-2xl text-brand-primary font-bold">GHC {item.price}</span>
                      <Link
                        to="/portal/login"
                        className="bg-brand-primary/10 text-brand-primary font-bold text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-brand-primary hover:text-text-primary transition-colors min-h-10 inline-flex items-center"
                      >
                        Order
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Link
            to="/portal/login"
            className="mt-16 mx-auto inline-flex items-center justify-center w-fit min-h-12 px-10 py-4 border border-brand-primary/30 text-brand-primary font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-brand-primary hover:text-text-primary transition-colors"
          >
            View full menu
            <ChevronRight className="ml-2 w-4 h-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </section>

      {/* HOW TO ORDER */}
      <section className="bg-brand-primary py-24 px-6 md:px-12">
        <motion.div {...sectionVariants} className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-text-primary text-center mb-16">Order in 3 simple steps</h2>

          <div className="flex flex-col md:flex-row items-stretch justify-between gap-8">
            {[
              { num: '01', Icon: Smartphone, title: 'Create account', text: 'Sign up in seconds with your email or Google account.' },
              { num: '02', Icon: Utensils, title: 'Choose your order', text: 'Browse our full menu, pick your favourites, and add to cart.' },
              { num: '03', Icon: Truck, title: 'Enjoy your food', text: 'Choose delivery or pickup. Pay on delivery or via MoMo. Track your order live.' }
            ].map((step, i) => (
              <React.Fragment key={step.num}>
                <div className="flex-1 text-center">
                  <span className="font-display text-6xl md:text-7xl text-text-primary/20 leading-none block">{step.num}</span>
                  <step.Icon className="w-10 h-10 text-text-primary mx-auto mt-4" aria-hidden="true" />
                  <h3 className="text-text-primary font-bold text-xl mt-5">{step.title}</h3>
                  <p className="text-text-primary/70 text-sm mt-3 leading-relaxed max-w-[260px] mx-auto">{step.text}</p>
                </div>
                {i < 2 && <ArrowRight className="hidden md:block self-center text-text-primary/40 w-8 h-8 shrink-0" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>

          <Link
            to="/portal/login"
            className="mt-16 mx-auto inline-flex items-center justify-center w-fit min-h-12 px-10 py-4 bg-white text-brand-primary font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-brand-dark hover:text-text-primary transition-colors"
          >
            Start ordering now
            <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="bg-brand-dark py-24 px-6 md:px-12">
        <motion.div {...sectionVariants} className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-text-primary text-center mb-3">Food stories</h2>
          <p className="text-text-muted text-center mb-16">A peek at what's coming to your table</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryItems.map((item, i) => (
              <figure
                key={i}
                className={`relative overflow-hidden rounded-2xl ${i % 5 === 0 ? 'row-span-2' : ''}`}
                style={{ aspectRatio: i % 5 === 0 ? '3/4' : '1/1' }}
              >
                <img
                  src={item.image}
                  alt={item.title || 'Dish from the Kokrobite Oasis menu'}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {item.title && (
                  <figcaption className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                    <h4 className="text-text-primary font-bold text-sm">{item.title}</h4>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </motion.div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24 px-6 md:px-12 bg-brand-cream">
        <motion.div {...sectionVariants} className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-brand-dark text-center mb-4">What our customers say</h2>
          <div
            className="flex items-center justify-center gap-2 text-brand-primary font-bold mb-16"
            aria-label="Average rating 4.8 out of 5, based on more than 200 reviews"
          >
            <Star size={16} fill="currentColor" aria-hidden="true" />
            <span className="text-lg">4.8</span>
            <span className="text-brand-dark/30 text-sm">•</span>
            <span className="text-sm text-brand-dark/60">Based on 200+ reviews</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev, i) => (
              <article key={i} className="bg-white border border-brand-dark/10 rounded-3xl p-8 shadow-[0_4px_20px_rgba(28,10,0,0.06)] flex flex-col">
                <div className="flex gap-1 mb-4" aria-label="5 stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" className="text-brand-primary" aria-hidden="true" />
                  ))}
                </div>
                <p className="font-display italic text-brand-dark/80 text-xl leading-relaxed relative">
                  <span className="text-brand-primary/20 text-6xl absolute -top-4 -left-2 pointer-events-none font-serif" aria-hidden="true">"</span>
                  {rev.comment}
                </p>
                <div className="mt-8 pt-6 border-t border-brand-dark/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-text-primary font-bold" aria-hidden="true">
                    {rev.customer?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-brand-dark font-bold text-sm">{rev.customer?.name || 'Happy Customer'}</h4>
                    <p className="text-brand-dark/40 text-xs mt-0.5">{new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* INSTALL */}
      <section className="py-24 px-6 md:px-12 bg-brand-cream">
        <motion.div {...sectionVariants} className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-6">
              <Smartphone size={12} aria-hidden="true" />
              Available now
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-brand-dark font-light leading-tight mb-6">Get KO Eats on your phone</h2>
            <p className="text-brand-dark/65 text-base md:text-lg leading-relaxed mb-10">
              Install KO Eats directly on your phone — no app store needed.
              Order food, earn Oasis Points, and track your delivery in real time.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                'Works on iPhone and Android',
                'No app store download needed',
                'Works offline too',
                'Free to install and use'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-brand-dark/75">
                  <CheckCircle2 size={20} className="text-brand-primary shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                if (isInstallable) {
                  triggerInstall();
                } else {
                  navigate('/portal/login');
                }
              }}
              className="inline-flex items-center justify-center min-h-12 px-10 py-4 bg-brand-primary text-text-primary font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              Install KO Eats free
            </button>
          </div>

          <div className="hidden lg:block flex-shrink-0">
            <div className="w-[280px] bg-brand-dark border-4 border-brand-primary/20 rounded-[40px] p-3 shadow-[0_32px_64px_rgba(28,10,0,0.18)] overflow-hidden">
              <div className="bg-brand-cream h-[520px] rounded-[32px] overflow-hidden flex flex-col">
                <div className="bg-brand-primary px-6 py-7">
                  <h4 className="text-text-primary font-bold text-base">KO Eats</h4>
                  <p className="text-text-primary/80 text-[11px] mt-1">Good morning</p>
                </div>
                <div className="px-5 py-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-dark/8">
                      <p className="text-brand-dark/45 text-[10px] uppercase font-bold">Orders</p>
                      <p className="text-brand-dark font-bold text-lg mt-1">5</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-dark/8">
                      <p className="text-brand-primary text-[10px] uppercase font-bold">Points</p>
                      <p className="text-brand-primary font-bold text-lg mt-1">150</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-dark/8">
                    <p className="text-brand-dark/45 text-[10px] uppercase font-bold mb-3">Recent order</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-brand-dark font-bold text-xs">Ginger Gold Pancakes</p>
                        <p className="text-brand-dark/45 text-[10px] mt-0.5">GHC 155</p>
                      </div>
                      <span className="text-brand-green text-[10px] font-bold bg-brand-green/10 px-2 py-1 rounded-full">Delivered</span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-primary rounded-2xl py-4 text-text-primary font-bold text-xs text-center">
                    Order Again
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 md:px-12 bg-brand-dark relative overflow-hidden text-center">
        <motion.div {...sectionVariants} className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-[clamp(36px,7vw,72px)] font-light text-text-primary leading-none">Ready to order?</h2>
          <p className="text-text-muted text-base md:text-lg mt-6 max-w-2xl mx-auto">Join thousands of customers enjoying Kokrobite Oasis from home.</p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/portal/login"
              className="inline-flex items-center justify-center min-h-12 px-10 py-4 bg-brand-primary text-text-primary font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              Start ordering now
            </Link>
            <button
              onClick={() => scrollToSection('menu')}
              className="inline-flex items-center justify-center min-h-12 px-10 py-4 border border-text-primary/30 text-text-primary font-semibold text-sm rounded-xl hover:bg-text-primary/10 transition-colors"
            >
              Browse menu first
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-bg pt-20 pb-10 px-6 md:px-12 border-t border-brand-primary/15">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-display italic text-3xl">
              <span className="text-text-primary">Kokrobite</span>
              <span className="text-brand-primary ml-1">Oasis</span>
            </h2>
            <p className="text-text-muted text-[10px] mt-3 uppercase tracking-[0.2em] leading-relaxed">
              Beach bliss. Good food. Pure vibes.
            </p>
          </div>

          <div>
            <h3 className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Quick links</h3>
            <ul className="flex flex-col gap-3">
              {['Menu', 'Gallery', 'Reviews'].map(link => (
                <li key={link}>
                  <button onClick={() => scrollToSection(link.toLowerCase())} className="text-text-muted text-sm hover:text-brand-primary text-left transition-colors min-h-10">{link}</button>
                </li>
              ))}
              {['Order Now', 'Sign In', 'Register'].map(link => (
                <li key={link}>
                  <Link to="/portal/login" className="text-text-muted text-sm hover:text-brand-primary transition-colors block min-h-10 leading-10">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Find us</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-text-muted text-sm">
                <MapPin size={16} className="text-brand-primary shrink-0 mt-1" aria-hidden="true" />
                <span>East Legon, Accra Ghana</span>
              </li>
              <li className="flex items-start gap-3 text-text-muted text-sm">
                <Clock size={16} className="text-brand-primary shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p>Tue–Sun: 11AM – 11PM</p>
                  <p className="text-text-muted/70 mt-1">Monday: Closed</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-text-muted text-sm">
                <Phone size={16} className="text-brand-primary" aria-hidden="true" />
                <a href="tel:+233240000000" className="hover:text-brand-primary transition-colors">+233 24 000 0000</a>
              </li>
              <li>
                <a href="https://wa.me/233240000000" className="inline-flex items-center gap-3 text-brand-primary text-sm font-bold hover:underline">
                  <MessageCircle size={16} aria-hidden="true" />
                  <span>WhatsApp order</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Follow us</h3>
            <div className="flex gap-3 mb-6">
              {[
                { Icon: Instagram, label: 'Instagram', href: '#' },
                { Icon: Facebook, label: 'Facebook', href: '#' },
                { Icon: Twitter, label: 'Twitter', href: '#' }
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Kokrobite Oasis on ${label}`}
                  className="w-12 h-12 rounded-full bg-text-primary/5 flex items-center justify-center text-text-muted hover:bg-brand-primary hover:text-text-primary transition-colors"
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-text-muted/70 text-[10px] leading-relaxed">
              Tag us in your stories @kokrobite.oasis for a chance to be featured.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-text-primary/10 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted/70 text-[10px]">
            © 2026 Kokrobite Oasis. All rights reserved.
          </p>
          <Link to="/delivery" className="text-brand-primary text-[10px] font-bold hover:underline tracking-widest uppercase">
            Are you a driver? Join KO Rider →
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
