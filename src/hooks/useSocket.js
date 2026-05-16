import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL
  ?.replace("/api", "")

export function useSocket() {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    })

    newSocket.on("connect", () => {
      console.log("✅ Socket connected")
    })

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected")
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return socket
}
