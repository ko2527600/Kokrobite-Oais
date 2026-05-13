import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

const DeliveryContext = createContext(null)

export function DeliveryProvider({ children }) {
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // AUTO LOGIN on app load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await api.get("/drivers/auth/me")
        setDriver(res.data)
      } catch (err) {
        setDriver(null)
        localStorage.removeItem("ko_driver_token")
        localStorage.removeItem("ko_driver_user")
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (phone, password) => {
    const res = await api.post("/drivers/auth/login", { phone, password })
    const { token, driver: d } = res.data
    localStorage.setItem("ko_driver_token", token)
    localStorage.setItem("ko_driver_user", JSON.stringify(d))
    setDriver(d)
    return d
  }

  const logout = async () => {
    try {
      await api.post("/drivers/auth/logout")
    } catch (e) {}
    localStorage.removeItem("ko_driver_token")
    localStorage.removeItem("ko_driver_user")
    setDriver(null)
    navigate("/delivery/login")
  }

  const refreshDriver = async () => {
    try {
      const res = await api.get("/drivers/auth/me")
      setDriver(res.data)
    } catch (e) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0C0A09" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[#F97316] rounded-full animate-spin"/>
          <p className="text-white/30 text-sm">Loading KO Rider...</p>
        </div>
      </div>
    )
  }

  return (
    <DeliveryContext.Provider value={{
      driver, loading, login, logout, refreshDriver
    }}>
      {children}
    </DeliveryContext.Provider>
  )
}

export const useDelivery = () => useContext(DeliveryContext)
