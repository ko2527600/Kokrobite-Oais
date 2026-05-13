import React, { useState, useEffect, useRef } from "react"
import { Send, User, Truck, Building2, X, Phone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../api/axios"
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2"
import { toast } from "react-hot-toast"

// Note: Ensure your socket instance is accessible. 
// If not, we might need a custom hook or use the global one.
import { io } from "socket.io-client"

export default function ChatWindow({ orderId, currentUser, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    // 1. Fetch History
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${orderId}`)
        setMessages(res.data)
      } catch (err) {
        toast.error("Failed to load chat history")
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()

    // 2. Setup Socket
    const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "")
    socketRef.current = io(SOCKET_URL)
    
    socketRef.current.emit("join_order", orderId)
    
    socketRef.current.on("new_chat_message", (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [orderId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const res = await api.post(`/chat/${orderId}`, { message: newMessage })
      // Message will come back via socket, but we can optimistically update or just wait
      setNewMessage("")
    } catch (err) {
      toast.error("Failed to send message")
    }
  }

  const getSenderIcon = (role) => {
    if (role === "admin") return <Building2 size={12} />
    if (role === "driver") return <Truck size={12} />
    return <User size={12} />
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-[500px] w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* HEADER */}
      <div className="bg-[#1a1a1a] p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <HiOutlineChatBubbleLeftRight size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Order Chat</h3>
            <p className="text-[10px] text-white/40 font-medium">Order #{orderId.slice(-6)}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/10 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2">
            <HiOutlineChatBubbleLeftRight size={32} />
            <p className="text-xs uppercase tracking-widest font-bold">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] space-y-1`}>
                  <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && getSenderIcon(msg.senderRole)}
                    <span>{msg.senderRole}</span>
                    {isMe && getSenderIcon(msg.senderRole)}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? "bg-orange-500 text-white rounded-tr-none shadow-lg shadow-orange-500/20" 
                      : "bg-white/5 text-white border border-white/5 rounded-tl-none"
                  }`}>
                    {msg.message}
                  </div>
                  <p className={`text-[8px] text-white/20 ${isMe ? "text-right" : "text-left"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="p-4 bg-[#1a1a1a] border-t border-white/5 flex items-center gap-3">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
        />
        <button 
          type="submit"
          className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
        >
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  )
}
