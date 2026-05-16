import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineArrowLeft, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTruck,
  HiOutlineBuildingStorefront, HiOutlineStar, HiOutlineReceiptPercent,
  HiOutlineShieldExclamation, HiOutlineExclamationTriangle, HiOutlineChatBubbleLeftRight,
  HiOutlinePhone, HiOutlineDevicePhoneMobile
} from 'react-icons/hi2';
import { MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from "socket.io-client";
import api from '../../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';
import ChatWindow from '../../components/Chat/ChatWindow';
import { useCustomer } from '../CustomerContext';

const OrderDetail = () => {
  const { customer } = useCustomer();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: '', comment: '' });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [driver, setDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "");

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/customers/orders/${id}`);
      setOrder(res.data);
      if (res.data.delivery?.driver) {
        setDriver(res.data.delivery.driver);
      }
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/portal/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Socket connection
    if (!id) return;
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.emit("join_order", id);

    socket.on("order_update", (data) => {
      setOrder(prev => prev ? ({ ...prev, status: data.status }) : null);
      if (data.driver) {
        setDriver(data.driver);
      }
      toast.success(`Order Status: ${data.status}`);
    });

    socket.on("driver_location_update", (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This will also reverse any loyalty points earned.")) return;
    setCancelling(true);
    try {
      await api.patch(`/customers/orders/${id}/cancel`);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReportIssue = async () => {
    if (!reportForm.reason) return toast.error("Please select a reason");
    setSubmittingReport(true);
    try {
      await api.post("/customers/orders/reports", {
        driverId: order.delivery.driver.id,
        orderId: order.id,
        customerId: customer.id,
        ...reportForm
      });
      toast.success("Issue reported. Management will investigate.");
      setShowReportModal(false);
      setReportForm({ reason: '', comment: '' });
    } catch (err) {
      toast.error("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-3xl" />
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  const steps = ['pending', 'confirmed', 'preparing', 'delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/portal/orders')}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white"
        >
          <HiOutlineArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Order Details</h2>
      </div>

      {/* Tracker Section */}
      <section className="bg-[#0C0A09] border border-white/5 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
         {/* Success Background Effect */}
         {order.status === 'delivered' && (
           <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
         )}

         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 relative z-10">
            <div>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Order Number</p>
               <h3 className="text-3xl font-display font-bold text-white tracking-tight">{order.orderNumber}</h3>
               <p className="text-xs text-white/40 mt-1">{new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <OrderStatusBadge status={order.status} />
               {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                 <div className="flex items-center gap-2 text-green-400 text-xs font-bold animate-pulse">
                    <HiOutlineClock /> Est. Arrival in 25-30 mins
                 </div>
               )}
            </div>
         </div>

         {!isCancelled ? (
            <div className="relative pt-4 pb-12 px-4 sm:px-12 z-10">
               <div className="absolute top-[26px] left-[10%] right-[10%] h-1 bg-white/[0.10]">
                  <div 
                    className="h-full bg-[#F97316] transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} 
                  />
               </div>
               <div className="flex justify-between items-center relative">
                  {steps.map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-4">
                       <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                         i <= currentStepIndex ? 'bg-[#F97316] border-[#F97316] text-white scale-110 shadow-lg shadow-[#F97316]/40' : 'bg-[#0C0A09] border-white/10 text-white/20'
                       }`} style={i > currentStepIndex ? { background: 'rgba(255,255,255,0.15)' } : {}}>
                         {i < currentStepIndex ? <HiOutlineCheckCircle size={18} /> : <div className={`w-2 h-2 rounded-full ${i === currentStepIndex ? 'bg-white animate-ping' : 'bg-current'}`} />}
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${i <= currentStepIndex ? 'text-white' : 'text-white/20'}`}>
                          {s}
                       </span>
                    </div>
                  ))}
               </div>
            </div>
         ) : (
           <div className="py-12 flex flex-col items-center gap-4 text-red-500">
              <HiOutlineXCircle size={48} className="animate-bounce" />
              <p className="font-black text-xl tracking-tighter uppercase">This order was cancelled</p>
              <p className="text-white/40 text-xs text-center max-w-xs leading-relaxed">If you have any questions about this cancellation, please contact our support team.</p>
           </div>
         )}
      </section>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Items & Bill */}
         <section className="bg-[#0C0A09] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <h4 className="text-lg font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
               <HiOutlineShoppingBag className="text-[#F97316]" />
               Items Ordered
            </h4>
            
            <div className="space-y-4">
               {order.items.map(item => (
                 <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shrink-0">
                          <img src={item.menuItem?.image} alt={item.menuItem?.name || ''} loading="lazy" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="font-bold text-white/80 text-sm font-sans">{item.menuItem?.name || item.name}</p>
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Qty: {item.quantity} x ₵{item.price}</p>
                       </div>
                    </div>
                    <span className="font-bold text-white font-sans">₵{item.price * item.quantity}</span>
                 </div>
               ))}
            </div>

            <div className="pt-8 border-t border-white/5 space-y-3">
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 font-sans">
                  <span>Subtotal</span>
                  <span>₵{order.totalAmount - (order.type === 'delivery' ? 30 : 0)}</span>
               </div>
               {order.type === 'delivery' && (
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 font-sans">
                    <span>Delivery Fee</span>
                    <span>₵30</span>
                 </div>
               )}
               <div className="flex justify-between text-2xl font-display font-bold uppercase tracking-tight text-[#F97316] pt-2">
                  <span>Total</span>
                  <span>₵{order.totalAmount}</span>
               </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <HiOutlineStar className="text-yellow-400" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Loyalty Earned</span>
               </div>
               <span className="font-black text-yellow-400 text-sm">+{Math.floor(order.totalAmount / 10)} Points</span>
            </div>
         </section>

         {/* Logistics & Support */}
         <div className="space-y-8">
            <section className="bg-[#0C0A09] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
               <h4 className="text-lg font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
                  {order.type === 'delivery' ? <HiOutlineTruck className="text-[#F97316]" /> : <HiOutlineBuildingStorefront className="text-[#F97316]" />}
                  {order.type === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
               </h4>
               
               <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                     <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                        {order.type === 'delivery' ? 'Shipping Address' : 'Branch Location'}
                     </p>
                     <p className="font-bold text-white text-sm font-sans">{order.deliveryAddress || order.branch}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                     <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Payment Info</p>
                     <div className="flex items-center gap-3">
                        <p className="font-bold text-white text-sm capitalize font-sans">{order.paymentMethod}</p>
                        {(() => {
                           const s = order.paymentStatus;
                           if (s === 'paid') return <span className="px-3 py-1 bg-green-500/10 text-[#10B981] text-[10px] font-bold rounded-full uppercase tracking-widest">Paid</span>;
                           if (s === 'pending') return <span className="px-3 py-1 bg-blue-500/10 text-[#3B82F6] text-[10px] font-bold rounded-full uppercase tracking-widest">Processing...</span>;
                           if (s === 'failed') return <span className="px-3 py-1 bg-red-500/10 text-[#EF4444] text-[10px] font-bold rounded-full uppercase tracking-widest">Failed</span>;
                           return <span className="px-3 py-1 bg-amber-500/10 text-[#F59E0B] text-[10px] font-bold rounded-full uppercase tracking-widest">Awaiting Payment</span>;
                        })()}
                     </div>
                  </div>
                  {order.note && (
                    <div className="flex flex-col gap-1">
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Special Note</p>
                       <p className="text-xs text-white/40 italic leading-relaxed font-sans">"{order.note}"</p>
                    </div>
                  )}
               </div>
            </section>

            {/* Driver Info Card */}
            {order.delivery?.driver && (
              <section className="bg-gradient-to-br from-[#1C0A00] to-[#111111] border border-[#F97316]/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <HiOutlineTruck size={80} />
                </div>
                <h4 className="text-lg font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
                   <HiOutlineShieldExclamation className="text-[#F97316]" />
                   Your Rider
                </h4>
                
                {driverLocation && (
                   <div className="absolute top-8 right-8 flex items-center gap-2 bg-[#F97316]/10 border border-[#F97316]/20 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-[#F97316] rounded-full animate-ping" />
                      <span className="text-[9px] font-bold text-[#F97316] uppercase tracking-widest">Live Location On</span>
                   </div>
                )}
                
                <div className="flex items-center gap-6 relative z-10">
                   <div className="w-16 h-16 rounded-3xl bg-white/5 overflow-hidden border border-white/10">
                      {order.delivery.driver.avatar ? (
                        <img src={order.delivery.driver.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#F97316]">
                           {order.delivery.driver.name.charAt(0)}
                        </div>
                      )}
                   </div>
                   <div className="flex-1">
                      <p className="text-xl font-display font-bold text-white leading-tight">{driver?.name || order.delivery.driver.name}</p>
                      <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">
                         {driver?.vehicleType || order.delivery.driver.vehicleType} • {driver?.vehicleNumber || order.delivery.driver.vehicleNumber}
                      </p>
                      {driverLocation && (
                        <p className="text-[10px] text-[#F97316] font-bold mt-2 animate-pulse flex items-center gap-1">
                          <MapPin size={10} /> Driver location updating live...
                        </p>
                      )}
                   </div>
                   <a 
                     href={`tel:${order.delivery.driver.phone}`}
                     className="p-4 bg-[#F97316] text-white rounded-2xl shadow-lg shadow-[#F97316]/20 hover:scale-110 transition-all"
                   >
                      <HiOutlinePhone size={20} />
                   </a>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                     onClick={() => {
                      if (!customer) return toast.error('Session loading, please wait...');
                      setShowChat(true);
                    }}
                     className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                   >
                      <HiOutlineChatBubbleLeftRight size={14} /> Chat
                   </button>
                   <button 
                     onClick={() => setShowReportModal(true)}
                     className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                      <HiOutlineExclamationTriangle size={14} /> Report Issue
                   </button>
                </div>
              </section>
            )}

            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-4">
               <h4 className="text-sm font-black text-white uppercase tracking-widest">Actions</h4>
               {order.status === 'pending' && (
                  <div className="space-y-3">
                    {order.paymentStatus === 'unpaid' && (order.paymentMethod === 'momo' || order.paymentMethod === 'hubtel') && (
                      <button 
                        onClick={async () => {
                          try {
                            const res = await api.post('/payments/initiate', {
                              orderId: order.id,
                              phoneNumber: customer.phone || ''
                            });
                            if (res.data?.checkoutUrl) window.location.href = res.data.checkoutUrl;
                          } catch (err) {
                            toast.error("Failed to initiate payment");
                          }
                        }}
                        className="w-full bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                         <HiOutlineDevicePhoneMobile size={18} /> Pay Now with MoMo
                      </button>
                    )}
                    <button 
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-2xl transition-all border border-red-500/20 text-xs uppercase tracking-widest"
                    >
                       {cancelling ? 'CANCELLING...' : 'CANCEL ORDER'}
                    </button>
                  </div>
                )}

               {order.status === 'delivered' && (
                 <button 
                    className="w-full bg-[#F97316] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#F97316]/20 hover:scale-105 transition-all text-xs uppercase tracking-widest"
                 >
                    RATE THIS MEAL
                 </button>
               )}

               {order.status !== 'cancelled' && (
                 <button 
                   onClick={() => { if (!customer) return toast.error('Session loading, please wait...'); setShowChat(true); }}
                   className="w-full bg-[#F97316]/10 hover:bg-[#F97316] text-[#F97316] hover:text-white font-black py-4 rounded-2xl transition-all border border-[#F97316]/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                   CHAT WITH RIDER / SUPPORT
                 </button>
               )}

               <a 
                 href={`https://wa.me/UPDATE_WITH_REAL_KO_WHATSAPP?text=Hello Kokrobite Oasis! I need help with my order ${order.orderNumber}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
               >
                  <HiOutlineReceiptPercent size={18} className="text-[#F97316]" />
                  NEED HELP? CONTACT SUPPORT
               </a>
            </section>
         </div>

      </div>

      {/* ── CHAT OVERLAY ── */}
      <AnimatePresence>
        {showChat && customer && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <ChatWindow 
              orderId={id} 
              currentUser={customer} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── REPORT MODAL ── */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2">Report Delivery Issue</h2>
              <p className="text-white/40 text-sm mb-6">We take your safety and satisfaction seriously. Please describe what happened.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Reason</label>
                  <select 
                    value={reportForm.reason}
                    onChange={e => setReportForm({ ...reportForm, reason: e.target.value })}
                    className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none appearance-none"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Rude behavior">Rude behavior</option>
                    <option value="Late delivery">Late delivery</option>
                    <option value="Damaged food">Damaged food</option>
                    <option value="Incomplete order">Incomplete order</option>
                    <option value="Unsafe driving">Unsafe driving</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Comments</label>
                  <textarea 
                    value={reportForm.comment}
                    onChange={e => setReportForm({ ...reportForm, comment: e.target.value })}
                    rows="4"
                    placeholder="Provide more details..."
                    className="w-full bg-[#0C0A09] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316] outline-none resize-none font-sans"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={handleReportIssue}
                    disabled={submittingReport}
                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    {submittingReport ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OrderDetail;
