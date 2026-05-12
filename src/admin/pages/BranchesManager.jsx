import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlineMapPin, HiOutlineBuildingLibrary, 
  HiOutlinePhone, HiOutlineClock, HiOutlineMap, HiOutlinePencilSquare
} from "react-icons/hi2";
import { BsWhatsapp } from "react-icons/bs";
import api from "../../api/axios";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";

const BranchesManager = () => {
  const { showToast } = useToast();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: "", area: "", landmark: "", address: "", 
    phone: "", whatsapp: "", hours: "", mapUrl: "", isOpen: true, closedDays: "Monday"
  });
  const [saving, setSaving] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/branches");
      setBranches(response.data);
    } catch (err) {
      showToast("Failed to fetch branches", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleToggle = async (id) => {
    try {
      const response = await api.patch(`/branches/${id}/toggle`);
      setBranches(prev => prev.map(b => b.id === id ? response.data : b));
      showToast(`Branch ${response.data.isOpen ? 'Opened' : 'Closed'}`);
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const openModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({ ...branch });
    } else {
      setEditingBranch(null);
      setFormData({ name: "", area: "", landmark: "", address: "", phone: "", whatsapp: "", hours: "", mapUrl: "", isOpen: true, closedDays: "Monday" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, formData);
        showToast("Branch updated");
      } else {
        await api.post("/branches", formData);
        showToast("Branch created");
      }
      fetchBranches();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to save branch", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Branch Locations</h1>
        <button 
          onClick={() => openModal()}
          className="bg-[#F97316] hover:bg-[#F97316]/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
        >
          <HiOutlinePlus size={18} /> Add Branch
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton height="350px" count={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.filter(b => b.name === 'East Legon').map((branch) => (
            <motion.div 
              layout
              key={branch.id}
              className="bg-[#1a1a1a] border border-[#F97316]/10 rounded-2xl p-8 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-[36px] font-display font-light text-white mb-1">{branch.name}</h3>
                    <div className="flex items-center gap-2 text-[#F97316] text-[10px] font-bold uppercase tracking-widest font-sans">
                       <span className={`w-2 h-2 rounded-full ${branch.isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'}`} />
                       {branch.isOpen ? 'Open Now' : 'Closed'}
                    </div>
                 </div>
                 <button 
                   onClick={() => handleToggle(branch.id)}
                   className={`w-12 h-6 rounded-full relative transition-all ${branch.isOpen ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${branch.isOpen ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 mb-8">
                  <div className="flex items-start gap-3">
                    <HiOutlineMapPin className="text-white/20 mt-1" size={20} />
                    <div>
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Area</p>
                       <p className="text-sm font-medium text-white/70">{branch.area}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <HiOutlineBuildingLibrary className="text-white/20 mt-1" size={20} />
                    <div>
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Landmark</p>
                       <p className="text-sm font-medium text-white/70">{branch.landmark}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <HiOutlinePhone className="text-white/20 mt-1" size={20} />
                    <div>
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Contact</p>
                       <div className="flex gap-4 mt-1">
                          <a href={`tel:${branch.phone}`} className="text-sm font-bold text-[#F97316] hover:underline transition-colors font-sans">{branch.phone}</a>
                          <a href={`https://wa.me/${branch.whatsapp}`} className="text-[#25D366] hover:scale-110 transition-transform"><BsWhatsapp size={18} /></a>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <HiOutlineClock className="text-[#F97316] mt-1" size={20} />
                    <div>
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Hours 🌴</p>
                       <div className="text-sm font-medium text-white/60 space-y-0.5">
                         <p>{branch.hours || 'Tuesday–Sunday: 11:00 AM – 11:00 PM'}</p>
                         <p className="text-xs opacity-80">{branch.closedDays || 'Monday'}: Closed 🌴</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/5">
                 <button 
                  onClick={() => openModal(branch)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                 >
                   <HiOutlinePencilSquare size={18} /> Edit Details
                 </button>
                 <a 
                   href={branch.mapUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex-1 border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316]/10 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-sans"
                 >
                   Open in Google Maps 📍
                 </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBranch ? "Edit Branch" : "Add New Branch"} size="md" className="bg-[#1a1a1a] border border-[#F97316]/10">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-sans">Branch Name</label>
               <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316] font-sans" placeholder="e.g. Accra Central" />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Area</label>
                <input required value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Landmark</label>
                <input value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Full Address</label>
              <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none resize-none" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Phone</label>
                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">WhatsApp</label>
                <input value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Opening Hours</label>
                <input value={formData.hours} onChange={e => setFormData({ ...formData, hours: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316]" placeholder="e.g. 11:00 AM - 11:00 PM" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Closed Days</label>
                <input value={formData.closedDays} onChange={e => setFormData({ ...formData, closedDays: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316]" placeholder="e.g. Monday" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Google Maps URL</label>
              <input value={formData.mapUrl} onChange={e => setFormData({ ...formData, mapUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
               <span className="text-[10px] font-bold text-white/40 uppercase">Open for Business</span>
               <button 
                type="button" 
                onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                className={`w-10 h-5 rounded-full relative transition-all ${formData.isOpen ? 'bg-green-500' : 'bg-white/10'}`}
               >
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isOpen ? 'right-1' : 'left-1'}`} />
               </button>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 font-bold py-4 rounded-2xl">Cancel</button>
              <button disabled={saving} type="submit" className="flex-1 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Save Changes"}
              </button>
            </div>
         </form>
      </Modal>
    </div>
  );
};

export default BranchesManager;
