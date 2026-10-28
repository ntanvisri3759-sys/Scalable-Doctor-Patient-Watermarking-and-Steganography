import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Upload, FolderOpen, Stamp, EyeOff, ShieldCheck, Share2,
  Bell, ScrollText, Settings, HelpCircle, Menu, Search, LogOut, X, ShieldPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { notifications } from "../data/demo.js";
import { cx } from "./ui.jsx";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["doctor", "patient", "admin"], end: true },
  { to: "/app/upload", label: "Upload Record", icon: Upload, roles: ["doctor"] },
  { to: "/app/records", label: "Medical Records", icon: FolderOpen, roles: ["doctor", "patient"] },
  { to: "/app/watermark", label: "Watermarking", icon: Stamp, roles: ["doctor"] },
  { to: "/app/stego", label: "Steganography", icon: EyeOff, roles: ["doctor"] },
  { to: "/app/verify", label: "Verify File", icon: ShieldCheck, roles: ["doctor", "patient"] },
  { to: "/app/sharing", label: "Sharing & Permissions", icon: Share2, roles: ["doctor", "patient"] },
  { to: "/app/notifications", label: "Notifications", icon: Bell, roles: ["doctor", "patient", "admin"] },
  { to: "/app/audit", label: "Audit History", icon: ScrollText, roles: ["doctor", "admin"] },
  { to: "/app/settings", label: "Profile & Settings", icon: Settings, roles: ["doctor", "patient", "admin"] },
  { to: "/app/help", label: "Help", icon: HelpCircle, roles: ["doctor", "patient", "admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const unread = notifications.filter((n) => !n.read).length;
  const items = NAV.filter((n) => n.roles.includes(user.role));
  const canSearch = user.role !== "admin";

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/app/records?q=${encodeURIComponent(q.trim())}`);
  };

  const sidebar = (
    <nav className="flex h-full w-64 flex-col bg-navy-900 text-slate-200">
      <div className="flex items-center gap-2 px-5 py-5 text-white">
        <ShieldPlus className="h-7 w-7 text-teal-400" />
        <span className="text-lg font-bold">SecureMedShare</span>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cx("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive ? "bg-teal-600 text-white" : "hover:bg-navy-800")
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <p className="px-5 py-4 text-xs text-slate-400">Phase 1 - UI demo with synthetic data</p>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64">
            {sidebar}
            <button className="absolute right-2 top-4 text-white" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6 text-navy-900" /></button>
          {canSearch ? (
            <form onSubmit={onSearch} className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records, press Enter"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none" />
            </form>
          ) : <div className="flex-1" />}
          <button onClick={() => navigate("/app/notifications")} className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Notifications">
            <Bell className="h-5 w-5 text-slate-600" />
            {unread > 0 && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">{unread}</span>}
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-navy-900">{user.name}</p>
            <p className="text-xs capitalize text-slate-500">{user.role}</p>
          </div>
          <button onClick={() => { logout(); navigate("/"); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Log out" title="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
