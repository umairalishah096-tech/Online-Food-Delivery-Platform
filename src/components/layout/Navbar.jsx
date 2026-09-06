import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart, LogOut, LayoutDashboard, Menu, X,
  Bell, UtensilsCrossed, Package, Settings, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import NotificationPanel from "./NotificationPanel";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { to: "/",           label: "Home" },
  { to: "/restaurants",label: "Restaurants" },
  { to: "/about",      label: "About" },
  { to: "/contact",    label: "Contact" },
  { to: "/food-showcase", label: "🍽 Showcase" },
];

export default function Navbar() {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications() || { unreadCount: 0 };
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
      navigate("/");
    } catch { toast.error("Logout failed"); }
  };

  return (
    <nav className={cn(
      "sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-300",
      scrolled ? "shadow-md border-b border-slate-100" : "shadow-sm"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* â”€â”€ Logo â”€â”€ */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200/60 group-hover:bg-orange-600 transition-colors">
              <UtensilsCrossed size={19} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              Food<span className="text-orange-500">Rush</span>
            </span>
          </Link>

          {/* â”€â”€ Desktop nav â”€â”€ */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/"}
                className={({ isActive }) => cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                  isActive ? "text-orange-500 bg-orange-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* â”€â”€ Right actions â”€â”€ */}
          <div className="flex items-center gap-1.5">

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-xl text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-all">
              <ShoppingCart size={21} strokeWidth={2} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {currentUser ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2.5 rounded-xl text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
                  >
                    <Bell size={21} strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                </div>

                {/* User dropdown â€” shadcn DropdownMenu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all outline-none">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.photoURL} />
                        <AvatarFallback className="text-xs font-black">
                          {userProfile?.displayName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[90px] truncate">
                        {userProfile?.displayName?.split(" ")[0] || "User"}
                      </span>
                      <ChevronDown size={13} className="text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="pb-1">
                      <p className="font-semibold text-slate-800 truncate normal-case text-sm">{userProfile?.displayName}</p>
                      <p className="text-slate-400 font-normal truncate text-xs">{currentUser.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {isAdmin ? (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <LayoutDashboard size={14} className="text-orange-500" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                          <LayoutDashboard size={14} className="text-orange-500" /> Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/orders")}>
                          <Package size={14} className="text-blue-500" /> My Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/profile")}>
                          <Settings size={14} className="text-slate-500" /> Profile Settings
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                      <LogOut size={14} /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </div>

      {/* â”€â”€ Mobile menu â”€â”€ */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1 shadow-lg">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                isActive ? "text-orange-500 bg-orange-50" : "text-slate-600 hover:bg-slate-50"
              )}>
              {label}
            </NavLink>
          ))}

          {currentUser ? (
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-1">
              {isAdmin ? (
                <button onClick={() => { navigate("/admin"); setMobileOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <LayoutDashboard size={15} className="text-orange-500" /> Admin Dashboard
                </button>
              ) : (
                <>
                  {[
                    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard",       color: "text-orange-500" },
                    { to: "/orders",    icon: Package,          label: "My Orders",       color: "text-blue-500" },
                    { to: "/profile",   icon: Settings,         label: "Profile",         color: "text-slate-400" },
                  ].map(({ to, icon: Icon, label, color }) => (
                    <button key={to} onClick={() => { navigate(to); setMobileOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      <Icon size={15} className={color} /> {label}
                    </button>
                  ))}
                </>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-3 mt-2 border-t border-slate-100">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

