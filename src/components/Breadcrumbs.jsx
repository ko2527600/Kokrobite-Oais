import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiChevronRight, HiOutlineArrowLeft, HiOutlineHome } from "react-icons/hi2";

const DEFAULT_LABELS = {
  admin: "Admin",
  portal: "My Account",
  delivery: "Rider",
  dashboard: "Dashboard",
  menu: "Menu",
  gallery: "Gallery",
  branches: "Branches",
  announcements: "Announcements",
  orders: "Orders",
  order: "Place Order",
  reviews: "Reviews",
  customers: "Customers",
  drivers: "Riders",
  feedback: "Feedback",
  live: "Live Tracking",
  settings: "Settings",
  notifications: "Notifications",
  loyalty: "Loyalty Points",
  addresses: "Addresses",
  profile: "Profile",
  cart: "Cart",
  checkout: "Checkout",
  active: "Active Delivery",
  earnings: "Earnings",
  login: "Sign In",
  register: "Sign Up",
  terms: "Terms"
};

const prettify = (segment, labels) =>
  labels[segment] ||
  DEFAULT_LABELS[segment] ||
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const looksLikeId = (segment) =>
  /^[a-f0-9]{8}-/i.test(segment) || // UUID/CUID prefix
  /^c[a-z0-9]{20,}$/.test(segment) || // cuid
  /^\d+$/.test(segment); // numeric id

export default function Breadcrumbs({
  homePath = "/",
  homeLabel = "Home",
  labels = {},
  className = "",
  variant = "dark"
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    const isId = looksLikeId(seg);
    return {
      path,
      label: isId
        ? `#${seg.slice(-6).toUpperCase()}`
        : prettify(seg, labels)
    };
  });

  const tone = variant === "light"
    ? {
        wrap: "text-[11px] sm:text-xs text-black/50 border-b border-black/5 bg-white/80 backdrop-blur-md",
        back: "text-black/60 hover:text-[#F97316]",
        sep: "text-black/10",
        home: "hover:text-[#F97316]",
        chev: "text-black/20",
        active: "text-black font-semibold",
        crumb: "hover:text-[#F97316]"
      }
    : {
        wrap: "text-[11px] sm:text-xs text-white/40 border-b border-white/5 bg-[#0C0A09]/80 backdrop-blur-md",
        back: "text-white/50 hover:text-[#F97316]",
        sep: "text-white/10",
        home: "hover:text-[#F97316]",
        chev: "text-white/20",
        active: "text-white font-semibold",
        crumb: "hover:text-[#F97316]"
      };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2.5 ${tone.wrap} ${className}`}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={`flex items-center gap-1 transition-colors -ml-1 pr-2 ${tone.back}`}
        aria-label="Go back"
      >
        <HiOutlineArrowLeft size={14} />
        <span className="hidden sm:inline font-medium uppercase tracking-widest">Back</span>
      </button>

      <span className={tone.sep}>|</span>

      <Link
        to={homePath}
        className={`flex items-center gap-1 transition-colors ${tone.home}`}
      >
        <HiOutlineHome size={13} />
        <span className="hidden sm:inline">{homeLabel}</span>
      </Link>

      {crumbs.map((crumb, idx) => {
        // Skip the first segment if it matches the home path prefix (e.g. /admin)
        if (idx === 0 && homePath.startsWith(crumb.path)) return null;
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.path}>
            <HiChevronRight size={12} className={tone.chev} />
            {isLast ? (
              <span className={`truncate max-w-[160px] sm:max-w-none ${tone.active}`}>
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={`truncate max-w-[120px] sm:max-w-none transition-colors ${tone.crumb}`}
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
