import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencilSquare, 
  HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash, HiOutlineCloudArrowUp,
  HiOutlineArrowsUpDown
} from "react-icons/hi2";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import api from "../../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { getImgUrl } from "../../utils/image";

const CATEGORIES = ['Brunch', 'Cocktails', 'Atmosphere', 'Platters', 'Events', 'Food', 'Drinks'];

const SortableItem = ({ id, item, onEdit, onDelete, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-square rounded-2xl overflow-hidden bg-[#0C0A09] border transition-all ${!item.visible ? 'opacity-35 border-red-500/20' : 'border-[#F97316]/05'} ${isDragging ? 'border-[#F97316] shadow-[0_20_40_rgba(249,115,22,0.20)]' : ''}`}
    >
      <img src={getImgUrl(item.url)} loading="lazy" className="w-full h-full object-cover" alt={item.title} />
      
      {!item.visible && (
        <div className="absolute top-3 left-3 bg-[#EF4444]/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-[#EF4444] uppercase tracking-widest border border-[#EF4444]/20">
          Hidden
        </div>
      )}

      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-[#F97316]/50 hover:text-[#F97316] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all"
      >
        <HiOutlineArrowsUpDown size={16} />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C0A00]/90 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-6">
        <div className="space-y-1 mb-4">
           <h4 className="text-white font-display font-bold truncate">{item.title}</h4>
           <span className="inline-block bg-[#F97316]/20 text-[#F97316] text-[10px] font-bold uppercase px-2 py-0.5 rounded font-sans">
             {item.category}
           </span>
        </div>
        <div className="flex gap-2">
           <button onClick={() => onEdit(item)} className="flex-1 h-10 bg-white/10 hover:bg-[#F97316]/20 rounded-xl flex items-center justify-center text-white hover:text-[#F97316] transition-all"><HiOutlinePencilSquare size={18} /></button>
           <button onClick={() => onToggle(item.id)} className="flex-1 h-10 bg-white/10 hover:bg-[#F59E0B]/20 rounded-xl flex items-center justify-center text-white hover:text-[#F59E0B] transition-all">{item.visible ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}</button>
           <button onClick={() => onDelete(item.id)} className="flex-1 h-10 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center text-white hover:text-[#EF4444] transition-all"><HiOutlineTrash size={18} /></button>
        </div>
      </div>
    </div>
  );
};

const GalleryManager = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: "",
    category: "Food",
    type: "url",
    image: "",
    files: []
  });
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/gallery");
      setItems(response.data);
    } catch (err) {
      showToast("Failed to fetch gallery", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Save order to server (optimistic UI used above)
      try {
        await Promise.all(newItems.map((item, idx) => 
          api.put(`/gallery/${item.id}`, { order: idx })
        ));
      } catch (err) {
        showToast("Failed to save reorder", "error");
        fetchGallery(); // rollback
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await api.patch(`/gallery/${id}/toggle`);
      setItems(prev => prev.map(i => i.id === id ? response.data : i));
      showToast("Visibility updated");
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (uploadData.type === 'upload' && uploadData.files.length > 0) {
        for (const file of uploadData.files) {
          const fd = new FormData();
          fd.append('title', uploadData.title || file.name);
          fd.append('category', uploadData.category);
          fd.append('image', file);
          await api.post("/gallery", fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      } else if (uploadData.image) {
        await api.post("/gallery", {
          title: uploadData.title,
          category: uploadData.category,
          image: uploadData.image
        });
      }
      showToast("Uploaded successfully");
      fetchGallery();
      setShowUploadModal(false);
      setUploadData({ title: "", category: "Food", type: "url", image: "", files: [] });
    } catch (err) {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/gallery/${editingItem.id}`, editingItem);
      setItems(prev => prev.map(i => i.id === editingItem.id ? response.data : i));
      showToast("Updated successfully");
      setShowEditModal(false);
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gallery/${deletingId}`);
      setItems(prev => prev.filter(i => i.id !== deletingId));
      showToast("Deleted successfully");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const filteredItems = items.filter(i => {
    const matchCat = categoryFilter === "All" || i.category === categoryFilter;
    const matchVis = visibilityFilter === "All" || (visibilityFilter === "Visible" ? i.visible : !i.visible);
    return matchCat && matchVis;
  });

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Gallery Manager</h1>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:border-[#F97316] outline-none font-sans"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:border-[#F97316] outline-none font-sans"
          >
            <option value="All">All Visibility</option>
            <option value="Visible">Visible</option>
            <option value="Hidden">Hidden</option>
          </select>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-[0_8px_20px_rgba(249,115,22,0.30)]"
          >
            <HiOutlinePlus size={18} /> Upload Image
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Skeleton height="300px" count={8} />
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {filteredItems.length === 0 ? (
            <div className="bg-[#0C0A09] border border-[#F97316]/10 rounded-3xl p-20 text-center">
              <div className="text-6xl mb-6">🏖️</div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">No Gallery Images Yet</h3>
              <p className="text-white/40 mb-8 max-w-sm mx-auto font-sans">Upload Kokrobite Oasis photos to showcase your beach vibes</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto font-sans"
              >
                <HiOutlinePlus /> Upload First Image
              </button>
            </div>
          ) : (
            <SortableContext 
              items={filteredItems.map(i => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredItems.map((item, idx) => (
                  <SortableItem 
                    key={item.id || `gall-${idx}`} 
                    id={item.id || `gall-${idx}`} 
                    item={item}
                    onEdit={(it) => { setEditingItem(it); setShowEditModal(true); }}
                    onDelete={(id) => { setDeletingId(id); setShowConfirm(true); }}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </DndContext>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Media" size="lg">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="flex bg-white/5 p-1 rounded-xl w-fit mb-6">
             {['url', 'upload'].map(t => (
               <button 
                key={t}
                type="button" 
                onClick={() => setUploadData({ ...uploadData, type: t })}
                className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${uploadData.type === t ? 'bg-white/10 text-white' : 'text-white/20'}`}
               >
                 {t}
               </button>
             ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Title</label>
                <input value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316] font-sans" placeholder="e.g. Interior View" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Category</label>
                <select value={uploadData.category} onChange={e => setUploadData({ ...uploadData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316] font-sans">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          {uploadData.type === 'url' ? (
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Image URL</label>
               <input value={uploadData.image} onChange={e => setUploadData({ ...uploadData, image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316] font-sans" placeholder="https://..." />
            </div>
          ) : (
            <div 
               onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-[#F97316]', 'bg-[#F97316]/05'); }}
               onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('border-[#F97316]', 'bg-[#F97316]/05'); }}
               onDrop={e => { e.preventDefault(); setUploadData({ ...uploadData, files: Array.from(e.dataTransfer.files) }); }}
               onClick={() => document.getElementById('gallUpload').click()}
               className="w-full h-48 border-2 border-dashed border-[#F97316]/40 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F97316]/05 transition-all"
             >
               <HiOutlineCloudArrowUp size={32} className="text-[#F97316]" />
               <p className="text-sm font-medium text-white/40 font-sans">Drop beach vibes images here or <span className="text-[#F97316]">click to browse</span></p>
               <input id="gallUpload" type="file" hidden multiple accept="image/*" onChange={e => setUploadData({ ...uploadData, files: Array.from(e.target.files) })} />
               {uploadData.files.length > 0 && <p className="text-[10px] font-bold text-[#F97316] font-sans">{uploadData.files.length} files selected</p>}
            </div>
          )}

          {(uploadData.image || uploadData.files.length > 0) && (
            <div className="grid grid-cols-4 gap-4">
              {uploadData.type === 'url' ? (
                <img src={uploadData.image} className="aspect-square rounded-xl object-cover border border-white/10" />
              ) : (
                uploadData.files.map((f, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative">
                    <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 bg-white/5 font-bold py-4 rounded-2xl">Cancel</button>
            <button disabled={uploading} type="submit" className="flex-1 bg-[#F97316] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
              {uploading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Upload Media"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Media" size="sm">
        {editingItem && (
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Title</label>
               <input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Category</label>
               <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none">
                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
               <span className="text-[10px] font-bold text-white/40 uppercase">Visible</span>
               <button 
                type="button" 
                onClick={() => setEditingItem({ ...editingItem, visible: !editingItem.visible })}
                className={`w-10 h-5 rounded-full relative transition-all ${editingItem.visible ? 'bg-green-500' : 'bg-white/10'}`}
               >
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editingItem.visible ? 'right-1' : 'left-1'}`} />
               </button>
            </div>
            <button type="submit" className="w-full bg-[#F97316] text-white font-bold py-4 rounded-2xl">Save Changes</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)} 
        onConfirm={handleDelete} 
        title="Delete Media" 
        message="Are you sure you want to delete this image? It will be removed from the gallery permanently."
        danger={true}
      />
    </div>
  );
};

export default GalleryManager;
