import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiChevronRight, HiOutlineArrowLeft, HiOutlineHome } from "react-icons/hi2";

const LABELS = {
  admin: "Admin",
  dashboard: "Dashboard",
  menu: "Menu",
  gallery: "Gallery",
  branches: "Branches",
  announcements: "Announcements",
  orders: "Orders",
  reviews: "Reviews",
  customers: "Customers",
  drivers: "Riders",
  feedback: "Feedback",
  live: "Live Tracking",
  settings: "Settings"
};

const prettify = (segment) =>
  LABELS[segment] ||
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    return { path, label: prettify(seg) };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-[11px] sm:text-xs text-white/40 px-4 sm:px-6 lg:px-8 py-2.5 border-b border-white/5 bg-[#0C0A09]/80 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-white/50 hover:text-[#F97316] transition-colors -ml-1 pr-2"
        aria-label="Go back"
      >
        <HiOutlineArrowLeft size={14} />
        <span className="hidden sm:inline font-medium uppercase tracking-widest">Back</span>
      </button>

      <span className="text-white/10">|</span>

      <Link
        to="/admin/dashboard"
        className="flex items-center gap-1 hover:text-[#F97316] transition-colors"
      >
        <HiOutlineHome size={13} />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {crumbs.slice(1).map((crumb, idx) => {
        const isLast = idx === crumbs.length - 2;
        return (
          <React.Fragment key={crumb.path}>
            <HiChevronRight size={12} className="text-white/20" />
            {isLast ? (
              <span className="text-white font-semibold truncate max-w-[160px] sm:max-w-none">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-[#F97316] transition-colors truncate max-w-[120px] sm:max-w-none"
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
