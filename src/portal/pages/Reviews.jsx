import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineStar, HiOutlinePlus, HiOutlineTrash, 
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineChatBubbleLeftEllipsis,
  HiOutlineArrowRight, HiStar
} from 'react-icons/hi2';
import { Palmtree, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [formErrors, setFormErrors] = useState({ menuItemId: '', comment: '' });
  const [menuSearch, setMenuSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const selectedMenuItem = menuItems.find(item => item.id === formData.menuItemId);

  const [formData, setFormData] = useState({
    menuItemId: '',
    branchId: '',
    rating: 5,
    comment: ''
  });

  const fetchData = async () => {
    try {
      const [revRes, menuRes, branchRes] = await Promise.all([
        api.get('/customers/reviews'),
        api.get('/menu'),
        api.get('/branches')
      ]);
      setReviews(revRes.data);
      setMenuItems(menuRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = { menuItemId: '', comment: '' };
    if (!formData.menuItemId) errors.menuItemId = 'Please select a menu item.';
    if (formData.comment.length < 20) errors.comment = 'Review must be at least 20 characters.';
    if (errors.menuItemId || errors.comment) { setFormErrors(errors); return; }
    setFormErrors({ menuItemId: '', comment: '' });

    setSubmitting(true);
    try {
      await api.post('/customers/reviews', formData);
      toast.success('Review submitted! You earned 10 Oasis Points');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ open: false, id: null });
    try {
      await api.delete(`/customers/reviews/${id}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">My Reviews</h2>
          <p className="text-white/40 text-sm font-sans font-medium mt-1">Share your experience and earn loyalty points.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-[#F97316]/20"
          style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
        >
           <HiOutlinePlus size={20} /> Write a Review
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.length > 0 ? reviews.map((review) => (
          <motion.div 
            key={review.id}
            layout
            className="bg-[#0C0A09] border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative group hover:bg-white/[0.02] transition-all"
          >
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-1">
                   {[...Array(5)].map((_, i) => (
                      <HiStar key={i} size={18} className={i < review.rating ? 'text-[#F97316]' : 'text-white/10'} />
                   ))}
                </div>
                {review.status === 'approved' ? (
                   <span className="flex items-center gap-1.5 text-[8px] bg-[#F97316]/20 text-[#F97316] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] shadow-sm">
                      <HiOutlineCheckCircle /> Published
                   </span>
                ) : (
                   <span className="flex items-center gap-1.5 text-[8px] bg-white/5 text-white/40 px-3 py-1 rounded-full font-black uppercase tracking-[0.2em]">
                      <HiOutlineClock /> Pending Approval
                   </span>
                )}
             </div>

             <div className="space-y-4">
                <div>
                   <p className="text-xs font-bold text-[#F97316] uppercase tracking-widest mb-1">{review.menuItem?.name || 'General Experience'}</p>
                   <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{review.branch?.name || 'Any Branch'}</p>
                </div>
                <p className="text-sm text-white/60 leading-relaxed italic">"{review.comment}"</p>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest pt-4">Submitted {new Date(review.createdAt).toLocaleDateString()}</p>
             </div>

             <div className="pt-6 border-t border-white/5 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setDeleteConfirm({ open: true, id: review.id })} className="p-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                   <HiOutlineTrash size={18} />
                </button>
             </div>
          </motion.div>
        )) : (
          <div className="col-span-full bg-[#0C0A09] border border-white/5 p-24 rounded-[3rem] text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F97316]">
                 <Star size={40} />
              </div>
             <div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No Reviews Yet</h3>
                <p className="text-white/40 text-sm max-w-xs mx-auto font-sans">Share your Kokrobite Oasis experience with others</p>
             </div>
             <button onClick={() => setShowModal(true)} className="inline-flex bg-[#F97316] text-white font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#F97316]/20">
                + Write Your First Review
             </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-[#0C0A09] border border-white/10 rounded-[3rem] p-10 overflow-hidden"
             >
                <h3 className="text-2xl font-display font-bold text-white uppercase mb-8">Share Your Experience</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-2 relative">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Menu Item</label>
                         <button
                           type="button"
                           onClick={() => { setMenuOpen(v => !v); setMenuSearch(''); }}
                           className={`w-full bg-black/30 border rounded-2xl p-4 text-sm outline-none text-left font-sans flex justify-between items-center transition-all ${formErrors.menuItemId ? 'border-red-500/50' : 'border-white/10 focus:border-[#F97316]'}`}
                         >
                           <span className={selectedMenuItem ? 'text-white' : 'text-white/30'}>
                             {selectedMenuItem ? selectedMenuItem.name : 'Search for a menu item...'}
                           </span>
                           <span className="text-white/20 text-xs">▾</span>
                         </button>
                         {menuOpen && (
                           <div className="absolute z-20 top-full mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                             <div className="p-2 border-b border-white/5">
                               <input
                                 autoFocus
                                 type="text"
                                 value={menuSearch}
                                 onChange={e => setMenuSearch(e.target.value)}
                                 placeholder="Type to search..."
                                 className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none font-sans"
                               />
                             </div>
                             <div className="max-h-48 overflow-y-auto">
                               {filteredMenuItems.length === 0 ? (
                                 <p className="text-center text-white/30 text-xs py-4 font-sans">No items found</p>
                               ) : filteredMenuItems.map(item => (
                                 <button
                                   key={item.id}
                                   type="button"
                                   onClick={() => { setFormData({...formData, menuItemId: item.id}); setMenuOpen(false); if (formErrors.menuItemId) setFormErrors(e => ({...e, menuItemId: ''})); }}
                                   className={`w-full text-left px-4 py-3 text-sm font-sans hover:bg-white/5 transition-all ${formData.menuItemId === item.id ? 'text-[#F97316] font-bold' : 'text-white/60'}`}
                                 >
                                   {item.name}
                                 </button>
                               ))}
                             </div>
                           </div>
                         )}
                         {formErrors.menuItemId && <p className="text-[10px] text-red-400 font-bold ml-1">{formErrors.menuItemId}</p>}
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Branch (Optional)</label>
                          <select
                           value={formData.branchId}
                           onChange={e => setFormData({...formData, branchId: e.target.value})}
                           className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#F97316] outline-none text-white appearance-none font-sans"
                         >
                            <option value="">Any Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 text-center block mb-2">Rating</label>
                      <div className="flex justify-center gap-3">
                         {[1, 2, 3, 4, 5].map(star => (
                            <button 
                             key={star}
                             type="button"
                             onClick={() => setFormData({...formData, rating: star})}
                             className={`p-2 transition-all hover:scale-125 ${formData.rating >= star ? 'text-[#F97316]' : 'text-[#F97316]/20'}`}
                           >
                             <HiStar size={36} />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Comment</label>
                      <textarea
                         value={formData.comment}
                         onChange={e => { setFormData({...formData, comment: e.target.value}); if (formErrors.comment) setFormErrors(err => ({...err, comment: ''})); }}
                         className={`w-full bg-black/30 border rounded-2xl p-6 text-sm focus:border-[#F97316] outline-none h-40 font-sans transition-all ${formErrors.comment ? 'border-red-500/50' : 'border-white/10'}`}
                        placeholder="Tell us what you liked about the meal! (Min 20 characters)"
                      />
                      <div className="flex justify-between items-center">
                        {formErrors.comment
                          ? <p className="text-[10px] text-red-400 font-bold ml-1">{formErrors.comment}</p>
                          : <span />
                        }
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest text-right">
                          {formData.comment.length} / 20 chars
                        </p>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-xs text-white/40 uppercase tracking-widest border border-white/10 rounded-2xl hover:border-white/20 transition-all">Cancel</button>
                       <button 
                         type="submit" 
                         disabled={submitting} 
                         className="flex-[2] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#F97316]/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                         style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                       >
                         {submitting ? 'SUBMITTING...' : (
                           <>
                             POST REVIEW <HiOutlineArrowRight />
                           </>
                         )}
                       </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm({ open: false, id: null })}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0C0A09] border border-white/10 rounded-[2.5rem] p-8 space-y-6 text-center"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <HiOutlineTrash size={26} />
              </div>
              <div>
                <h4 className="text-lg font-display font-bold text-white uppercase mb-2">Delete Review?</h4>
                <p className="text-sm text-white/40 font-sans">This review will be permanently removed.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ open: false, id: null })}
                  className="flex-1 py-3.5 font-black text-xs text-white/40 uppercase tracking-widest border border-white/10 rounded-2xl hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-[2] py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  Delete Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MyReviews;
