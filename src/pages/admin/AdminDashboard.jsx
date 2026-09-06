import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Store, Users, DollarSign,
  TrendingUp, Clock, ChevronRight, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { getCollection, COLLECTIONS, orderBy, limit, where } from "../../firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import OrderStatusBadge from "../../components/food/OrderStatusBadge";
import StatCard from "../../components/ui/StatCard";

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const buildWeekData = (orders) => {
  const now = new Date();
  return WEEK_LABELS.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayOrders = orders.filter((o) => {
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt?.seconds * 1000 || o.createdAt);
      return ts.toDateString() === d.toDateString();
    });
    return {
      day,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
    };
  });
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, restaurants: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [orders, restaurants, users] = await Promise.all([
          getCollection(COLLECTIONS.ORDERS, [orderBy("createdAt", "desc")]),
          getCollection(COLLECTIONS.RESTAURANTS),
          getCollection(COLLECTIONS.USERS),
        ]);
        const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        setStats({ orders: orders.length, revenue, restaurants: restaurants.length, users: users.length });
        setRecentOrders(orders.slice(0, 6));
        setWeekData(buildWeekData(orders));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>;
  }

  const pendingOrders = recentOrders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Alert: pending orders */}
      {pendingOrders > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-bold">{pendingOrders} order{pendingOrders !== 1 ? "s" : ""}</span>{" "}
            waiting for confirmation.{" "}
            <Link to="/admin/orders" className="font-bold underline">Review now →</Link>
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.orders.toLocaleString()}
          icon={ShoppingBag}
          color="orange"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toFixed(0)}`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="+8.5%"
        />
        <StatCard
          title="Restaurants"
          value={stats.restaurants.toLocaleString()}
          icon={Store}
          color="blue"
          trend="up"
          trendValue="+3"
        />
        <StatCard
          title="Users"
          value={stats.users.toLocaleString()}
          icon={Users}
          color="purple"
          trend="up"
          trendValue="+24%"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800">Revenue (7 days)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily revenue this week</p>
            </div>
            <TrendingUp size={18} className="text-orange-500" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v) => [`$${v.toFixed(2)}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: "#f97316", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800">Orders (7 days)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily order count this week</p>
            </div>
            <ShoppingBag size={18} className="text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v) => [v, "Orders"]}
              />
              <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <h2 className="font-bold text-slate-800">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:text-orange-600"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Order</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Restaurant</th>
                  <th className="text-left px-6 py-3">Total</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {order.userDisplayName || order.userEmail?.split("@")[0] || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order.restaurantName}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">${order.total?.toFixed(2)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString()
                        : new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
