import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  getCollection, COLLECTIONS, orderBy,
} from "../../firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import StatCard from "../../components/ui/StatCard";
import {
  TrendingUp, ShoppingBag, DollarSign, Star,
} from "lucide-react";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];

const buildMonthlyData = (orders) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthOrders = orders.filter((o) => {
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt?.seconds * 1000 || o.createdAt);
      return ts.getMonth() === d.getMonth() && ts.getFullYear() === d.getFullYear();
    });
    return {
      month: months[d.getMonth()],
      orders: monthOrders.length,
      revenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0),
      avgOrder: monthOrders.length ? monthOrders.reduce((s, o) => s + (o.total || 0), 0) / monthOrders.length : 0,
    };
  });
};

const buildRestaurantData = (orders, restaurants) => {
  return restaurants.slice(0, 6).map((r) => {
    const rOrders = orders.filter((o) => o.restaurantId === r.id);
    return {
      name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name,
      orders: rOrders.length,
      revenue: rOrders.reduce((s, o) => s + (o.total || 0), 0),
    };
  }).sort((a, b) => b.revenue - a.revenue);
};

const buildStatusData = (orders) => {
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const AdminAnalytics = () => {
  const [data, setData] = useState({ orders: [], restaurants: [], monthlyData: [], restaurantData: [], statusData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCollection(COLLECTIONS.ORDERS, [orderBy("createdAt", "desc")]),
      getCollection(COLLECTIONS.RESTAURANTS),
    ]).then(([orders, restaurants]) => {
      setData({
        orders,
        restaurants,
        monthlyData: buildMonthlyData(orders),
        restaurantData: buildRestaurantData(orders, restaurants),
        statusData: buildStatusData(orders),
      });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading analytics..." /></div>;

  const { orders, restaurants, monthlyData, restaurantData, statusData } = data;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const completionRate = orders.length ? (deliveredCount / orders.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Business performance overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(0)}`} icon={DollarSign} color="green" trend="up" trendValue="+8.5%" />
        <StatCard title="Total Orders" value={orders.length.toLocaleString()} icon={ShoppingBag} color="orange" trend="up" trendValue="+12%" />
        <StatCard title="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} icon={TrendingUp} color="blue" trend="up" trendValue="+2.3%" />
        <StatCard title="Completion Rate" value={`${completionRate.toFixed(0)}%`} icon={Star} color="purple" trend="up" trendValue="+1.5%" />
      </div>

      {/* Monthly revenue + orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-1">Monthly Revenue</h2>
          <p className="text-xs text-slate-400 mb-5">Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [`$${v.toFixed(2)}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-1">Monthly Orders</h2>
          <p className="text-xs text-slate-400 mb-5">Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Restaurant revenue + order status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-1">Revenue by Restaurant</h2>
          <p className="text-xs text-slate-400 mb-5">Top performing restaurants</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={restaurantData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [`$${v.toFixed(2)}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#f97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-1">Order Status Distribution</h2>
          <p className="text-xs text-slate-400 mb-5">All time breakdown</p>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Average order trend */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-1">Average Order Value Trend</h2>
        <p className="text-xs text-slate-400 mb-5">Monthly average over last 6 months</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [`$${v.toFixed(2)}`, "Avg Order"]} />
            <Line type="monotone" dataKey="avgOrder" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminAnalytics;
