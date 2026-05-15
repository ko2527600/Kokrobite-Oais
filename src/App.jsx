import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { Toaster } from "react-hot-toast"

// Auth & Protection
import { AuthProvider } from "./admin/AuthContext"
import { CustomerProvider } from "./portal/CustomerContext"
import ProtectedRoute from "./admin/ProtectedRoute"
import CustomerProtectedRoute from "./portal/CustomerProtectedRoute"
import AdminInstallGate from "./admin/AdminInstallGate"
import PWAUpdateBanner from "./components/PWAUpdateBanner"
import InstallBanner from "./components/InstallBanner"

// Delivery Pages
import { DeliveryProvider } from "./delivery/DeliveryContext"
import DeliveryProtectedRoute from "./delivery/DeliveryProtectedRoute"
import DeliveryLayout from "./delivery/DeliveryLayout"
import DriverLogin from "./delivery/pages/Login"
import DriverRegister from "./delivery/pages/Register"
import DriverDashboard from "./delivery/pages/Dashboard"
import ActiveDelivery from "./delivery/pages/ActiveDelivery"
import DriverEarnings from "./delivery/pages/Earnings"
import DriverProfile from "./delivery/pages/Profile"
import DriverLanding from "./delivery/pages/Landing"
import DriverTerms from "./delivery/pages/Terms"



// Admin Pages
import AdminLayout from "./admin/Layout"
import Dashboard from "./admin/pages/Dashboard"
import MenuManager from "./admin/pages/MenuManager"
import OrdersManager from "./admin/pages/OrdersManager"
import GalleryManager from "./admin/pages/GalleryManager"
import BranchesManager from "./admin/pages/BranchesManager"
import ReviewsManager from "./admin/pages/ReviewsManager"
import AnnouncementsManager from "./admin/pages/AnnouncementsManager"
import CustomersManager from "./admin/pages/CustomersManager"
import DriversManager from "./admin/pages/DriversManager"
import FeedbackManager from "./admin/pages/FeedbackManager"
import Settings from "./admin/pages/Settings"
import LiveTracking from "./admin/pages/LiveTracking"

// Portal Pages
import CustomerLayout from "./portal/CustomerLayout"
import CustomerLogin from "./portal/pages/Login"
import CustomerRegister from "./portal/pages/Register"
import CustomerDashboard from "./portal/pages/Dashboard"
import PlaceOrder from "./portal/pages/PlaceOrder"
import OrderHistory from "./portal/pages/OrderHistory"
import OrderDetail from "./portal/pages/OrderDetail"
import CustomerProfile from "./portal/pages/Profile"
import SavedAddresses from "./portal/pages/Addresses"
import MyReviews from "./portal/pages/Reviews"
import Notifications from "./portal/pages/Notifications"
import LoyaltyPoints from "./portal/pages/Loyalty"
import FeedbackPage from "./portal/pages/FeedbackPage"
import PortalLanding from "./portal/pages/LandingPage"


export default function App() {
  return (
    <GoogleOAuthProvider 
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <PWAUpdateBanner />
        <InstallBanner />
        <Toaster position="bottom-left" />
        <Routes>

          {/* ── ROOT → redirect to portal landing ── */}
          <Route path="/" element={
            <Navigate to="/portal" replace />
          } />


          {/* ── ADMIN ROUTES ── */}
          <Route path="/admin/*" element={
            <AuthProvider>
              <Routes>
                <Route path="login" element={<AdminInstallGate />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="menu" element={<MenuManager />} />
                    <Route path="orders" element={<OrdersManager />} />
                    <Route path="gallery" element={<GalleryManager />} />
                    <Route path="branches" element={<BranchesManager />} />
                    <Route path="reviews" element={<ReviewsManager />} />
                    <Route path="announcements" element={<AnnouncementsManager />} />
                    <Route path="customers" element={<CustomersManager />} />
                    <Route path="drivers" element={<DriversManager />} />
                    <Route path="live" element={<LiveTracking />} />
                    <Route path="feedback" element={<FeedbackManager />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          } />

          {/* ── CUSTOMER PORTAL ROUTES ── */}
          <Route path="/portal" element={<PortalLanding />} />

          <Route path="/portal/*" element={

            <CustomerProvider>
              <Routes>
                <Route path="login" element={<CustomerLogin />} />
                <Route path="register" element={<CustomerRegister />} />
                <Route element={<CustomerProtectedRoute />}>
                  <Route element={<CustomerLayout />}>
                    <Route index element={<Navigate to="/portal/dashboard" replace />} />
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="order" element={<PlaceOrder />} />
                    <Route path="orders" element={<OrderHistory />} />
                    <Route path="orders/:id" element={<OrderDetail />} />
                    <Route path="profile" element={<CustomerProfile />} />
                    <Route path="addresses" element={<SavedAddresses />} />
                    <Route path="reviews" element={<MyReviews />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="loyalty" element={<LoyaltyPoints />} />
                    <Route path="feedback" element={<FeedbackPage />} />
                  </Route>
                </Route>
              </Routes>
            </CustomerProvider>
          } />

          {/* ── DELIVERY DRIVER ROUTES ── */}
          <Route path="/delivery" element={<DriverLanding />} />
          <Route path="/delivery/register" element={<DriverRegister />} />

          <Route path="/delivery/terms" element={<DriverTerms />} />
          <Route path="/delivery/*" element={
            <DeliveryProvider>
              <Routes>
                <Route path="login" element={<DriverLogin />} />
                <Route element={<DeliveryProtectedRoute />}>
                  <Route element={<DeliveryLayout />}>
                    <Route index element={<Navigate to="/delivery/dashboard" replace />} />
                    <Route path="dashboard" element={<DriverDashboard />} />
                    <Route path="active" element={<ActiveDelivery />} />
                    <Route path="earnings" element={<DriverEarnings />} />
                    <Route path="profile" element={<DriverProfile />} />
                  </Route>
                </Route>
              </Routes>
            </DeliveryProvider>
          } />

          {/* ── CATCH ALL ── */}
          <Route path="*" element={
            <Navigate to="/portal" replace />
          } />


        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
