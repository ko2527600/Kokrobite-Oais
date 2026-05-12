import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCheckBadge,
  HiOutlineMegaphone, HiOutlineEye, HiOutlineEyeSlash
} from "react-icons/hi2";
import api from "../../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";

const AnnouncementsManager = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnn, setActiveAnn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    text: "", bgColor: "#F97316", textColor: "#ffffff", link: "", active: false
  });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/announcements/all");
      setAnnouncements(response.data);
      const active = response.data.find(a => a.active);
      setActiveAnn(active || null);
    } catch (err) {
      showToast("Failed to fetch announcements", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleToggle = async (ann) => {
    if (!ann.active && activeAnn) {
      // Trying to activate, but another is active
      setDeletingId(ann.id); // repurpose ID
      setShowConfirm(true);
      return;
    }

    try {
      const response = await api.patch(`/announcements/${ann.id}/toggle`);
      fetchAnnouncements();
      showToast(`Announcement ${response.data.active ? 'Activated' : 'Deactivated'}`);
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const confirmActivation = async () => {
    try {
      const response = await api.patch(`/announcements/${deletingId}/toggle`);
      fetchAnnouncements();
      showToast("New announcement activated");
      setShowConfirm(false);
    } catch (err) {
      showToast("Activation failed", "error");
    }
  };

  const openModal = (ann = null) => {
    if (ann) {
      setEditingAnn(ann);
      setFormData({ ...ann });
    } else {
      setEditingAnn(null);
      setFormData({ text: "", bgColor: "#F97316", textColor: "#ffffff", link: "", active: false });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAnn) {
        await api.put(`/announcements/${editingAnn.id}`, formData);
        showToast("Announcement updated");
      } else {
        await api.post("/announcements", formData);
        showToast("Announcement created");
      }
      fetchAnnouncements();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to save announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      if (activeAnn?.id === id) setActiveAnn(null);
      showToast("Announcement deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="space-y-12">
      {/* Live Preview Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
           <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest font-sans">Live Preview</h2>
           {activeAnn && (
             <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981] text-white text-[10px] font-bold uppercase shadow-[0_0_15px_rgba(16,185,129,0.40)]">
               <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE ON WEBSITE
             </span>
           )}
        </div>
        <div 
          className={`w-full p-3 rounded-xl flex items-center justify-center font-bold text-sm text-center min-h-[48px] transition-all duration-500 border-2 ${!activeAnn ? 'border-dashed border-[#F97316]/30 bg-[#1a1a1a] text-white/30' : 'border-[#F97316]/10 shadow-lg font-sans'}`}
          style={activeAnn ? { backgroundColor: activeAnn.bgColor, color: activeAnn.textColor } : {}}
        >
           {activeAnn ? activeAnn.text : "No active announcement — your KO Eats customers see nothing"}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-display font-bold text-white">Announcements</h1>
          <button 
            onClick={() => openModal()}
            className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-[0_8px_20px_rgba(249,115,22,0.30)] font-sans"
          >
            <HiOutlinePlus size={18} /> + Add Announcement
          </button>
        </div>

        {loading ? (
          <Skeleton height="80px" count={3} />
        ) : (
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-[#F97316]/10 rounded-3xl p-20 text-center">
                <div className="text-6xl mb-6">📢</div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">No Announcements Yet</h3>
                <p className="text-white/40 mb-8 max-w-sm mx-auto font-sans">Create an announcement to show a banner on KO Eats portal</p>
                <button 
                  onClick={() => openModal()}
                  className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto font-sans"
                >
                  <HiOutlinePlus /> + Create First Announcement
                </button>
              </div>
            ) : announcements.map((ann) => (
              <motion.div 
                layout
                key={ann.id}
                className={`bg-[#1a1a1a] border border-[#F97316]/08 rounded-2xl p-6 flex items-center gap-6 group transition-all ${ann.active ? 'ring-2 ring-[#F97316]/20' : ''}`}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: ann.bgColor }}>
                   <HiOutlineMegaphone size={24} style={{ color: ann.textColor }} />
                </div>
                
                <div className="flex-1 min-w-0">
                   <p className="text-white font-medium truncate mb-2 font-sans">{ann.text}</p>
                   <div className="flex items-center gap-4">
                      {ann.active ? (
                        <span className="bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Active 🟢</span>
                      ) : (
                        <span className="bg-white/05 text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Inactive ⚫</span>
                      )}
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest font-sans">Created {new Date(ann.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => handleToggle(ann)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${ann.active ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20'}`}
                   >
                     {ann.active ? 'Deactivate' : 'Activate'}
                   </button>
                   <div className="h-8 w-[1px] bg-white/5 mx-1" />
                   <button onClick={() => openModal(ann)} className="p-2.5 rounded-xl hover:bg-white/10 text-white/30 hover:text-white transition-all"><HiOutlinePencilSquare size={18} /></button>
                   <button onClick={() => handleDelete(ann.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-500 transition-all"><HiOutlineTrash size={18} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={<span className="font-display">{editingAnn ? "Edit Announcement" : "New Announcement"}</span>} size="md" className="bg-[#1a1a1a] border border-[#F97316]/10">
         <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Banner Text</label>
               <textarea required rows={2} value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[#F97316] font-bold text-center font-sans" placeholder="e.g. 🔥 Now Delivering Across Accra!" />
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Background Color</label>
                  <div className="flex gap-3">
                     <input type="color" value={formData.bgColor} onChange={e => setFormData({ ...formData, bgColor: e.target.value })} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0 overflow-hidden" />
                     <input type="text" value={formData.bgColor} onChange={e => setFormData({ ...formData, bgColor: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase font-mono" />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Text Color</label>
                  <div className="flex gap-3">
                     <input type="color" value={formData.textColor} onChange={e => setFormData({ ...formData, textColor: e.target.value })} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0 overflow-hidden" />
                     <input type="text" value={formData.textColor} onChange={e => setFormData({ ...formData, textColor: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase font-mono" />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Optional Link</label>
               <input value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316] text-xs font-sans" placeholder="https://..." />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 text-center block font-sans">Live Preview 👁️</label>
               <div 
                 className="w-full p-3 rounded-xl flex items-center justify-center font-bold text-sm text-center border border-[#F97316]/20 font-sans shadow-lg min-h-[48px]"
                 style={{ backgroundColor: formData.bgColor, color: formData.textColor }}
               >
                 {formData.text || "🌴 Your announcement will appear here as you type..."}
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
               <span className="text-[10px] font-bold text-white/40 uppercase">Set as Active</span>
               <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-10 h-5 rounded-full relative transition-all ${formData.active ? 'bg-green-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'}`} />
               </button>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 font-bold py-4 rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
              <button disabled={saving} type="submit" className="flex-1 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(249,115,22,0.30)] active:scale-95 transition-all">
                {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (editingAnn ? "Update Announcement" : "Create Announcement")}
              </button>
            </div>
         </form>
      </Modal>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)} 
        onConfirm={confirmActivation} 
        title="Activate Announcement" 
        message="Activating this banner will automatically deactivate the currently live one. Continue?"
        confirmLabel="Activate New"
      />
    </div>
  );
};

export default AnnouncementsManager;
