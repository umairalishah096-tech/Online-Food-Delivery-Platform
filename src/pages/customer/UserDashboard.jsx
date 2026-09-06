import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package, Clock, Star, Heart, ChevronRight,
  TrendingUp, Wallet, ShoppingBag,
} from "lucide-react";
import { getCollection, COLLECTIONS, where, orderBy, limit } from "../../firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import OrderStatusBadge from "../../components/food/OrderStatusBadge";

const UserDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getCollection(COLLECTIONS.ORDERS, [where("userId", "==", currentUser.uid), orderBy("createdAt", "desc")]),
      getCollection(COLLECTIONS.ORDERS, [where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(3)]),
    ])
      .then(([all, recent]) => { setOrders(all); setRecentOrders(recent); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const totalSpent = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const activeOrders = orders.filter((o) => ["pending", "confirmed", "preparing", "on_the_way"].includes(o.status));

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "orange" },
    { label: "Delivered", value: deliveredOrders.length, icon: Package, color: "green" },
    { label: "Active", value: activeOrders.length, icon: Clock, color: "blue" },
    { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: Wallet, color: "purple" },
  ];

  const colorMap = {
    orange: { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-100" },
    green: { bg: "bg-green-50", text: "text-green-500", border: "border-green-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-500", border: "border-blue-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-500", border: "border-purple-100" },
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading your dashboard..." /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 md:p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-orange-100 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-2xl font-black">
            {userProfile?.displayName?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-orange-100 text-sm mt-2">
            You've placed {orders.length} orders so far. Keep enjoying great food!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => {
          const c = colorMap[color];
          return (
            <div key={label} className={`bg-white rounded-2xl border ${c.border} p-5 shadow-sm`}>
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={c.text} />
              </div>
              <p className="text-xl font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              Active Orders
            </h2>
            <Link to="/orders" className="text-xs text-orange-500 font-semibold">View all</Link>
          </div>
          <div className="space-y-2">
            {activeOrders.map((order) => (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-orange-100 p-3 hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{order.restaurantName}</p>
                  <p className="text-xs text-slate-400">#{order.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Recent Orders</h2>
            <Link to="/orders" className="text-xs text-orange-500 font-semibold flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No orders yet</p>
              <Link to="/restaurants" className="text-xs text-orange-500 font-semibold mt-1 block">
                Order now →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/order/${order.id}`}
                  className="flex items-center justify-between hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 truncate max-w-[140px]">
                        {order.restaurantName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.items?.length} items · ${order.total?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: "/restaurants", icon: ShoppingBag, label: "Order Food", desc: "Browse restaurants near you", color: "text-orange-500 bg-orange-50" },
              { to: "/orders", icon: Package, label: "My Orders", desc: "Track and view order history", color: "text-blue-500 bg-blue-50" },
              { to: "/profile", icon: Star, label: "Profile Settings", desc: "Update your account details", color: "text-purple-500 bg-purple-50" },
            ].map(({ to, icon: Icon, label, desc, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
