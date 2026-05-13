import { Navigate, Outlet } from "react-router-dom"
import { useDelivery } from "./DeliveryContext"

export default function DeliveryProtectedRoute() {
  const { driver, loading } = useDelivery()
  if (loading) return null
  if (!driver) {
    return <Navigate to="/delivery/login" replace />
  }
  return <Outlet />
}
