import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineMapPin, HiOutlineClipboardDocumentCheck,
  HiOutlinePlus, HiOutlineMinus, HiOutlineTrash, HiOutlineCheckCircle,
  HiOutlineRocketLaunch, HiOutlineTruck, HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar, HiOutlineArrowRight, HiOutlineArrowLeft,
  HiOutlineStar, HiOutlineMagnifyingGlass, HiOutlineBanknotes, HiOutlineMap,
  HiOutlineClock, HiOutlineShieldExclamation
} from 'react-icons/hi2';
import { Palmtree, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getImgUrl } from '../../utils/image';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { customer, refreshCustomer } = useCustomer();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  
  // Kokrobite Oasis Order Details
  const [orderType, setOrderType] = useState('delivery'); // delivery | pickup
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash | momo
  const [note, setNote] = useState('');
  const [momoPhone, setMomoPhone] = useState(customer?.phone || '');
  
  // Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', address: '', area: '', landmark: '', isDefault: false, latitude: null, longitude: null });

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      toast.loading('Detecting location...', { id: 'location-toast' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewAddress(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success('Location detected!', { id: 'location-toast' });
        },
        (error) => {
          toast.error('Failed to get location. Please enable location services.', { id: 'location-toast' });
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, branchRes] = await Promise.all([
          api.get('/menu?available=true'),
          api.get('/branches')
        ]);
        setMenu(menuRes.data);
        setBranches(branchRes.data);
        const fixedCats = ['All', 'Brunch', 'Cocktails', 'Mocktails', 'Platters', 'Pitchers', 'Juices', 'Kissed by Fire', 'Sides', 'Pizza', 'Burgers & Wraps', 'Shots', 'Slushys', 'Beers & Ciders', 'Soft Drinks'];
        setCategories(fixedCats);
      } catch (err) {
        toast.error('Failed to load menu items');
      }
    };
    fetchData();
  }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const itemCat = item.category?.trim() ? item.category.trim().charAt(0).toUpperCase() + item.category.trim().slice(1).toLowerCase() : 'Other';
      const matchCat = activeCategory === 'All' || itemCat === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, search]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const deliveryFee = orderType === 'delivery' ? 30 : 0;
  const total = subtotal + deliveryFee;
  const pointsToEarn = Math.floor(total / 10);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing.quantity === 1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const getItemQuantity = (id) => {
    return cart.find(i => i.id === id)?.quantity || 0;
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'delivery' && !deliveryAddress) return toast.error('Please select a delivery address');
    if (orderType === 'pickup' && !selectedBranch) return toast.error('Please select a branch for pickup');
    if ((paymentMethod === 'momo' || paymentMethod === 'hubtel') && !momoPhone) return toast.error('Please enter your phone number for payment');

    setLoading(true);
    try {
      const payload = {
        type: orderType,
        deliveryAddress: orderType === 'delivery' ? `${deliveryAddress.address}, ${deliveryAddress.area}` : null,
        branch: orderType === 'pickup' ? selectedBranch.name : null,
        items: cart.map(i => ({ 
          menuItemId: i.id, 
          quantity: i.quantity, 
          price: i.price,
          name: i.name 
        })),
        totalAmount: total,
        paymentMethod,
        note,
        latitude: orderType === 'delivery' && deliveryAddress ? deliveryAddress.latitude : null,
        longitude: orderType === 'delivery' && deliveryAddress ? deliveryAddress.longitude : null
      };
      
      const orderRes = await api.post('/customers/orders', payload);
      const order = orderRes.data;
      
      if (paymentMethod === 'momo' || paymentMethod === 'hubtel') {
        try {
          const paymentRes = await api.post('/payments/initiate', {
            orderId: order.id,
            phoneNumber: momoPhone
          });

          if (paymentRes.data?.checkoutUrl) {
            window.location.href = paymentRes.data.checkoutUrl;
            return;
          } else {
            toast.error("Payment initiation failed");
          }
        } catch (hubtelErr) {
          console.error('Hubtel Initiation Error:', hubtelErr);
          toast.error('Order placed, but failed to initiate payment. Please retry from order details.');
        }
      }

      setStep(4); // Success screen (for Cash orders)
      setCart([]);
      refreshCustomer();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const saveNewAddress = async () => {
    if (!newAddress.address || !newAddress.area) return toast.error('Address and area are required');
    try {
      const res = await api.post('/customers/profile/addresses', newAddress);
      setDeliveryAddress(res.data);
      setShowAddressForm(false);
      refreshCustomer();
      toast.success('Address saved!');
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Step Header */}
      {step < 4 && (
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4 sm:px-12">
            {/* Connector Lines */}
            <div className="absolute left-[15%] right-[15%] top-1/2 -translate-y-1/2 h-1 bg-white/5 z-0">
               <div className="h-full bg-[#F97316] transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
            </div>
            
            {[
              { n: 1, label: 'Items', icon: HiOutlineShoppingBag },
              { n: 2, label: 'Delivery', icon: HiOutlineTruck },
              { n: 3, label: 'Review', icon: HiOutlineClipboardDocumentCheck }
            ].map(s => (
              <div key={s.n} className="flex flex-col items-center gap-3 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step === s.n ? 'bg-[#F97316] text-white shadow-xl shadow-[#F97316]/30 scale-110' :
                  step > s.n ? 'bg-[#1C0A00] text-white' : 'bg-white/5 text-white/40 border border-white/10'
                }`} style={step < s.n ? { background: 'rgba(255,255,255,0.20)' } : {}}>
                  {step > s.n ? <HiOutlineCheckCircle size={24} /> : <s.icon size={24} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-white' : 'text-white/20'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Flow Content */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CHOOSE ITEMS */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                   <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {(showAllCategories ? categories : categories.slice(0, 7)).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-5 py-2.5 rounded-xl font-sans transition-all whitespace-nowrap text-sm ${
                            activeCategory === cat ? 'bg-[#F97316] text-white shadow-lg' : 'bg-white/5 text-white/40 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                      {categories.length > 7 && (
                        <button
                          onClick={() => setShowAllCategories(v => !v)}
                          className="px-5 py-2.5 rounded-xl font-sans transition-all whitespace-nowrap text-sm bg-white/5 text-[#F97316] hover:bg-white/10 font-bold"
                        >
                          {showAllCategories ? '− Less' : `+${categories.length - 7} More`}
                        </button>
                      )}
                   </div>
                   <div className="relative w-full sm:w-64">
                      <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search menu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#0C0A09] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#F97316] transition-all font-sans"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                   {filteredMenu.map(item => (
                     <div key={item.id} className={`bg-[#0C0A09] border-2 rounded-[2rem] overflow-hidden transition-all group ${getItemQuantity(item.id) > 0 ? 'border-[#F97316]' : 'border-white/5'}`}>
                         <div className="h-48 relative overflow-hidden bg-white/5">
                            <img 
                              src={item.image ? getImgUrl(item.image) : '/assets/placeholder.jpg'} 
                              alt={item.name} 
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            />
                           <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white font-black px-3 py-1.5 rounded-full text-xs">
                              ₵{item.price}
                           </div>
                        </div>
                        <div className="p-6">
                           <h4 className="font-bold text-white mb-2">{item.name}</h4>
                           <p className="text-white/40 text-xs line-clamp-2 mb-6 min-h-[32px]">{item.description}</p>
                           
                           <div className="flex items-center justify-between">
                              {getItemQuantity(item.id) > 0 ? (
                                <div className="flex items-center gap-4 bg-[#F97316]/10 rounded-2xl p-1 px-2 border border-[#F97316]/20">
                                   <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-[#F97316] rounded-xl flex items-center justify-center text-white"><HiOutlineMinus /></button>
                                   <span className="font-bold text-[#F97316] font-sans">{getItemQuantity(item.id)}</span>
                                   <button onClick={() => addToCart(item)} className="w-8 h-8 bg-[#F97316] rounded-xl flex items-center justify-center text-white"><HiOutlinePlus /></button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addToCart(item)}
                                  className="w-full bg-white/5 hover:bg-[#F97316] py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-sans"
                                >
                                  <HiOutlinePlus size={16} /> ADD TO ORDER
                                </button>
                              )}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: DELIVERY DETAILS */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex bg-[#0C0A09] border border-white/5 p-1.5 rounded-2xl w-full sm:w-max">
                   {[
                     { id: 'delivery', label: 'Delivery', icon: HiOutlineTruck },
                     { id: 'pickup', label: 'Pickup', icon: HiOutlineBuildingStorefront }
                   ].map(t => (
                     <button 
                        key={t.id}
                        onClick={() => setOrderType(t.id)}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all font-sans ${
                          orderType === t.id ? 'bg-[#F97316] text-white shadow-lg' : 'text-white/40 hover:text-white'
                        }`}
                     >
                       <t.icon size={20} /> {t.label}
                     </button>
                   ))}
                </div>

                {orderType === 'delivery' ? (
                  <div className="space-y-6">
                     <h3 className="text-xl font-display font-bold text-white uppercase">Delivery Address</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {customer?.addresses?.map(addr => (
                          <div 
                            key={addr.id} 
                            onClick={() => setDeliveryAddress(addr)}
                            className={`p-6 bg-[#0C0A09] rounded-2xl border-2 transition-all cursor-pointer relative group ${
                              deliveryAddress?.id === addr.id ? 'border-[#F97316] shadow-lg shadow-[#F97316]/10' : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                             <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${deliveryAddress?.id === addr.id ? 'bg-[#F97316] text-white' : 'bg-white/5 text-white/40'}`}>
                                   <HiOutlineMapPin size={18} />
                                </div>
                                <span className="font-bold text-sm font-sans">{addr.label}</span>
                                {deliveryAddress?.id === addr.id && <HiOutlineCheckCircle className="ml-auto text-[#F97316]" size={20} />}
                             </div>
                             <p className="text-xs text-white/40 leading-relaxed">{addr.address}, {addr.area}</p>
                          </div>
                        ))}
                        <button 
                          onClick={() => setShowAddressForm(true)}
                          className="p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/40 hover:text-white hover:border-white/20 transition-all"
                        >
                           <HiOutlinePlus size={32} />
                           <span className="font-sans">Add New Address</span>
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <h3 className="text-xl font-black text-white uppercase">Select Branch</h3>
                     <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'el-1', name: 'East Legon', area: 'East Legon, Accra', landmark: 'Near the Police Station', hours: 'Tuesday–Sunday: 11AM – 11PM', monday: 'Closed' }
                        ].map(branch => {
                          const isMonday = new Date().getDay() === 1;
                          return (
                            <div 
                              key={branch.id} 
                              onClick={() => !isMonday && setSelectedBranch(branch)}
                              className={`p-6 bg-[#0C0A09] rounded-2xl border-2 transition-all relative ${
                                isMonday ? 'opacity-50 cursor-not-allowed border-red-500/50' : 'cursor-pointer group hover:border-white/10'
                              } ${
                                selectedBranch?.id === branch.id ? 'border-[#F97316] shadow-lg shadow-[#F97316]/10' : 'border-white/5'
                              }`}
                            >
                               <div className="flex items-center gap-3 mb-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedBranch?.id === branch.id ? 'bg-[#F97316] text-white' : 'bg-white/5 text-white/40'}`}>
                                     <HiOutlineBuildingStorefront size={20} />
                                  </div>
                                  <div>
                                     <span className="font-display font-bold text-lg block">{branch.name}</span>
                                     <span className="text-xs text-white/40 font-sans">{branch.area}</span>
                                  </div>
                                  {isMonday ? (
                                     <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full uppercase font-bold font-sans">Closed (Monday)</span>
                                  ) : (
                                     <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full uppercase font-bold font-sans">Open Now</span>
                                  )}
                               </div>
                               <div className="space-y-2 text-xs text-white/60 font-sans">
                                  <p className="flex items-center gap-2"><HiOutlineMapPin size={14} className="text-[#F97316]" /> {branch.landmark}</p>
                                  <p className="flex items-center gap-2"><HiOutlineClock size={14} className="text-[#F97316]" /> {branch.hours}</p>
                                </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}

                 <div className="space-y-6">
                   <h3 className="text-xl font-display font-bold text-white uppercase">Payment Method</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'cash', label: 'Cash on Delivery/Pickup', icon: HiOutlineBanknotes, desc: "Pay when you receive your order" },
                        { id: 'momo', label: 'Mobile Money (MoMo)', icon: HiOutlineCurrencyDollar, desc: "Pay securely with MTN, Vodafone, or AirtelTigo" },
                        { id: 'hubtel', label: 'Hubtel Pay', icon: HiOutlineShieldExclamation, desc: "Pay online via Hubtel secure checkout" }
                      ].map(p => (
                        <div key={p.id} className="space-y-4">
                          <div 
                            onClick={() => setPaymentMethod(p.id)}
                            className={`p-6 bg-[#0C0A09] rounded-2xl border-2 transition-all cursor-pointer group flex items-center gap-4 ${
                              paymentMethod === p.id ? 'border-[#F97316]' : 'border-white/5'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === p.id ? 'bg-[#F97316] text-white' : 'bg-white/5 text-white/40'}`}>
                                <p.icon size={22} />
                            </div>
                            <div>
                                <p className="font-bold text-sm font-sans">{p.label}</p>
                                <p className="text-[10px] text-white/40 font-medium font-sans">{p.desc}</p>
                            </div>
                            {paymentMethod === p.id && <HiOutlineCheckCircle className="ml-auto text-[#F97316]" size={20} />}
                          </div>
                          
                          {paymentMethod === 'momo' && p.id === 'momo' && (
                            <div className="pl-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                               <div className="flex gap-2">
                                  {['MTN MoMo', 'Vodafone Cash', 'AirtelTigo'].map(net => (
                                    <span key={net} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40 uppercase tracking-widest">{net}</span>
                                  ))}
                               </div>
                            </div>
                          )}
                        </div>
                      ))}
                   </div>

                   {(paymentMethod === 'momo' || paymentMethod === 'hubtel') && (
                     <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">MoMo Phone Number</label>
                           <input 
                              type="tel" 
                              placeholder="024 XXX XXXX"
                              value={momoPhone}
                              onChange={e => setMomoPhone(e.target.value)}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#F97316] outline-none transition-all font-sans"
                           />
                           <p className="text-[10px] text-white/20 ml-1">Enter the number to debit</p>
                        </div>
                     </div>
                   )}
                    <p className="text-[10px] text-white/40 font-medium italic mt-2 ml-1">
                      "Note: A 10% service charge applies to all dine-in orders"
                    </p>
                 </div>

                <div className="space-y-4">
                   <h3 className="text-xl font-black text-white uppercase">Special Instructions</h3>
                   <textarea 
                     placeholder="Any allergies or special requests? (Optional)"
                     value={note}
                     onChange={e => setNote(e.target.value)}
                     className="w-full bg-[#0C0A09] border border-white/5 rounded-2xl p-6 text-sm text-white focus:border-[#F97316] transition-all min-h-[120px] outline-none font-sans"
                   />
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW & PLACE */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="bg-[#0C0A09] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                   <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <h3 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Order Summary</h3>
                      <button onClick={() => setStep(1)} className="text-[#F97316] text-xs font-bold uppercase hover:underline font-sans">Edit Items</button>
                   </div>

                   <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-[#F97316] font-sans">{item.quantity}x</span>
                              <span className="font-bold text-white/80 font-sans">{item.name}</span>
                           </div>
                           <span className="font-bold text-white font-sans">₵{item.price * item.quantity}</span>
                        </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                      <div className="space-y-4">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Type / Method</span>
                            <span className="font-bold text-white flex items-center gap-2 capitalize">
                               {orderType} • {paymentMethod}
                            </span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Destination</span>
                            <span className="font-bold text-white">
                               {orderType === 'delivery' ? `${deliveryAddress?.address}, ${deliveryAddress?.area}` : selectedBranch?.name}
                            </span>
                         </div>
                      </div>
                      <div className="space-y-4 sm:text-right">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Estimated Time</span>
                            <span className="font-bold text-green-400">{orderType === 'delivery' ? '30-45 mins' : '15-20 mins'}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Loyalty Reward</span>
                            <span className="font-bold text-yellow-400 flex items-center gap-2 sm:justify-end">
                               <HiOutlineStar /> +{pointsToEarn} Points
                            </span>
                         </div>
                      </div>
                   </div>

                   {note && (
                     <div className="p-4 bg-white/5 rounded-xl italic text-xs text-white/40">
                        "{note}"
                     </div>
                   )}
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                      <HiOutlineArrowLeft /> BACK
                   </button>
                   <button 
                     onClick={handlePlaceOrder}
                     disabled={loading}
                     className="flex-[2] bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#F97316]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
                   >
                      {loading ? 'PROCESSING...' : (
                        <>
                          CONFIRM & PLACE ORDER ₵{total}
                          <HiOutlineArrowRight />
                        </>
                      )}
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS SCREEN */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto text-center space-y-8 py-10"
              >
                <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                   <HiOutlineRocketLaunch size={48} />
                </div>
                <div>
                   <h2 className="text-4xl font-black text-white tracking-tight uppercase mb-2 flex items-center justify-center gap-4">
                     Order Placed! <Palmtree className="text-[#F97316]" size={40} />
                   </h2>
                   <p className="text-white/40 font-medium italic">"Your Kokrobite Oasis order is confirmed"</p>
                </div>
                
                <div className="bg-[#0C0A09] border border-white/5 rounded-[2rem] p-8 space-y-4">
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-sans">Estimated Delivery Time</p>
                   <p className="text-3xl font-display font-bold text-[#F97316]">{orderType === 'delivery' ? '45 MINS' : '20 MINS'}</p>
                   <p className="text-xs text-white/20 font-sans">We'll notify you as soon as the kitchen starts preparing!</p>
                </div>

                <div className="flex flex-col gap-4">
                   <button 
                     onClick={() => navigate('/portal/orders')}
                     className="w-full text-white font-black py-4 rounded-2xl shadow-xl transition-all"
                     style={{ background: '#F97316', shadowColor: 'rgba(249,115,22,0.20)' }}
                   >
                     TRACK MY ORDER
                   </button>
                   <button 
                     onClick={() => navigate('/portal/dashboard')}
                     className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all"
                   >
                     BACK TO DASHBOARD
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* Right Column: Order Summary / Cart */}
        {step < 4 && (
          <div className="lg:col-span-4">
            <div 
              className="rounded-[2.5rem] p-8 sticky top-24"
              style={{ background: '#1C0A00', border: '1px solid rgba(249,115,22,0.20)' }}
            >
              <h3 className="text-lg font-display font-bold text-white mb-8 flex items-center gap-3">
                <HiOutlineShoppingBag className="text-[#F97316]" />
                MY ORDER
              </h3>

              <div className="space-y-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                 {cart.length > 0 ? cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white/80">{item.name}</p>
                            <p className="text-[10px] text-white/40 font-black">₵{item.price} x {item.quantity}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-red-400"><HiOutlineMinus size={12} /></button>
                         <button onClick={() => addToCart(item)} className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-green-400"><HiOutlinePlus size={12} /></button>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-10">
                      <HiOutlineShoppingBag size={48} className="mx-auto text-white/5 mb-4" />
                      <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Cart is empty</p>
                   </div>
                 )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white">₵{subtotal}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-white/40">Delivery Fee</span>
                    <span className="text-white">₵{deliveryFee}</span>
                 </div>
                 <div className="flex justify-between text-lg font-black uppercase tracking-tight pt-2">
                    <span className="text-white/60">Total</span>
                    <span className="font-black" style={{ color: '#F97316' }}>₵{total}</span>
                 </div>
              </div>

              {step === 1 && (
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full text-white font-black py-4 rounded-2xl shadow-xl transition-all mt-8 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', shadowColor: 'rgba(249,115,22,0.20)' }}
                >
                  CONTINUE TO DELIVERY
                  <HiOutlineArrowRight />
                </button>
              )}
              {step === 2 && (
                <button 
                  disabled={orderType === 'delivery' ? !deliveryAddress : !selectedBranch}
                  onClick={() => setStep(3)}
                  className="w-full text-white font-black py-4 rounded-2xl shadow-xl transition-all mt-8 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', shadowColor: 'rgba(249,115,22,0.20)' }}
                >
                  REVIEW ORDER
                  <HiOutlineArrowRight />
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddressForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0C0A09] border border-white/10 rounded-[2.5rem] p-8 space-y-6"
            >
               <h3 className="text-xl font-black text-white uppercase">Add New Address</h3>
               
               <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                     {['Home', 'Work', 'Other'].map(l => (
                       <button 
                        key={l}
                        onClick={() => setNewAddress({...newAddress, label: l})}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          newAddress.label === l ? 'bg-[#F97316] border-[#F97316] text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                        }`}
                       >
                         {l}
                       </button>
                     ))}
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Street Address</label>
                     <textarea 
                        value={newAddress.address}
                        onChange={e => setNewAddress({...newAddress, address: e.target.value})}
                        placeholder="House number, street name..."
                        className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm focus:border-[#F97316] outline-none transition-all"
                     />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Area / Neighborhood</label>
                       <input
                          type="text"
                          value={newAddress.area}
                          onChange={e => setNewAddress({...newAddress, area: e.target.value})}
                          placeholder="e.g. East Legon"
                          className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm focus:border-[#F97316] outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Landmark</label>
                       <input
                          type="text"
                          value={newAddress.landmark}
                          onChange={e => setNewAddress({...newAddress, landmark: e.target.value})}
                          placeholder="e.g. Near KFC"
                          className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm focus:border-[#F97316] outline-none transition-all"
                       />
                    </div>
                  </div>

                  <div className="pt-2">
                     <button 
                        onClick={detectLocation}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#F97316] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                     >
                        <HiOutlineMap size={18} />
                        {newAddress.latitude ? "Update Location" : "Detect My Location"}
                     </button>
                  </div>

                  {newAddress.latitude && newAddress.longitude && (
                     <div className="w-full h-32 rounded-xl overflow-hidden border border-[#F97316]/30">
                        <iframe 
                           width="100%" 
                           height="100%" 
                           style={{ border: 0 }} 
                           loading="lazy" 
                           allowFullScreen 
                           src={`https://www.google.com/maps?q=${newAddress.latitude},${newAddress.longitude}&hl=es;z=14&output=embed`}
                        ></iframe>
                     </div>
                  )}
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAddressForm(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/10 rounded-2xl hover:border-white/20 transition-all">Cancel</button>
                  <button onClick={saveNewAddress} className="flex-1 bg-[#F97316] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#F97316]/20">SAVE ADDRESS</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PlaceOrder;
