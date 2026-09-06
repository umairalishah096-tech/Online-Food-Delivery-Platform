import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Search, Filter } from "lucide-react";
import { getCollection, COLLECTIONS, where, orderBy } from "../../firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusBadge from "../../components/food/OrderStatusBadge";
import SearchBar from "../../components/ui/SearchBar";

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!currentUser) return;
    getCollection(COLLECTIONS.ORDERS, [
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    ])
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.restaurantName?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const STATUS_FILTERS = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "on_the_way", label: "On the Way" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">My Orders</h1>
        <p className="text-slate-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Search by restaurant or order ID..."
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 border transition-all ${
                statusFilter === value
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={
            orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders match your filters."
          }
          action={() => (window.location.href = "/restaurants")}
          actionLabel="Order Food"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{order.restaurantName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    #{order.id.slice(-10).toUpperCase()}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide">
                {order.items?.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                    )}
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-500 font-bold">+{order.items.length - 4}</span>
                  </div>
                )}
                <span className="text-xs text-slate-500 ml-1">
                  {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">${order.total?.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">
                    {order.createdAt?.toDate?.()?.toLocaleDateString?.() ||
                      new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {(order.status === "pending" || order.status === "confirmed" || order.status === "preparing" || order.status === "on_the_way") && (
                    <Link
                      to={`/order/${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      Track <ChevronRight size={12} />
                    </Link>
                  )}
                  <Link
                    to={`/order/${order.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
