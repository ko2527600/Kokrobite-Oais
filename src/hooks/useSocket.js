import { useEffect, useRef } from "react"
import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL
  ?.replace("/api", "")

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"]
      })

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected")
      })

      socketRef.current.on("disconnect", () => {
        console.log("❌ Socket disconnected")
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  return socketRef.current
}
