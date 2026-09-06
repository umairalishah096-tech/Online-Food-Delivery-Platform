import { useState, useEffect, useMemo } from "react";
import {
  Search, Filter, Eye, ChevronDown,
  RefreshCw, Download,
} from "lucide-react";
import {
  getCollection, updateDocument, COLLECTIONS, orderBy,
} from "../../firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusBadge from "../../components/food/OrderStatusBadge";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending",    label: "Pending" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "preparing",  label: "Preparing" },
  { value: "on_the_way", label: "On the Way" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getCollection(COLLECTIONS.ORDERS, [orderBy("createdAt", "desc")]);
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        o.id?.toLowerCase().includes(q) ||
        o.userDisplayName?.toLowerCase().includes(q) ||
        o.restaurantName?.toLowerCase().includes(q) ||
        o.userEmail?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateDocument(COLLECTIONS.ORDERS, orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Order status updated to "${newStatus}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading orders..." /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
        <Button
          variant="ghost"
          icon={RefreshCw}
          onClick={() => fetchOrders(true)}
          loading={refreshing}
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {/* Status summary chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex-shrink-0 transition-all ${
            statusFilter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex-shrink-0 transition-all ${
              statusFilter === value ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {label} ({statusCounts[value] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer, or restaurant..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {/* Orders table */}
      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders found" description="No orders match your current filters." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-5 py-3">Order ID</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Restaurant</th>
                  <th className="text-left px-5 py-3">Items</th>
                  <th className="text-left px-5 py-3">Total</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-700 text-sm truncate max-w-[130px]">
                          {order.userDisplayName || "—"}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[130px]">{order.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{order.restaurantName}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{order.items?.length} item(s)</td>
                    <td className="px-5 py-4 font-bold text-slate-800">${order.total?.toFixed(2)}</td>
                    <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString()
                        : new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id.slice(-8).toUpperCase()}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Status + update */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Current Status</p>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-slate-400">Update Status</p>
                <div className="relative">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-orange-400 disabled:opacity-50 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Customer + delivery */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Customer</p>
                <p className="text-sm font-bold text-slate-700">{selectedOrder.userDisplayName}</p>
                <p className="text-xs text-slate-500">{selectedOrder.userEmail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Delivery Address</p>
                <p className="text-sm text-slate-700">{selectedOrder.deliveryAddress?.street}</p>
                <p className="text-xs text-slate-500">{selectedOrder.deliveryAddress?.city}</p>
                {selectedOrder.deliveryAddress?.notes && (
                  <p className="text-xs text-slate-400 mt-0.5 italic">{selectedOrder.deliveryAddress.notes}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Order Items</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">× {item.quantity} @ ${item.price?.toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>${selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span><span>${selectedOrder.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span><span>${selectedOrder.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-slate-100">
                <span>Total</span>
                <span className="text-orange-500">${selectedOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Payment: <span className="font-semibold text-slate-600 capitalize">{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}</span></span>
              <span>Restaurant: <span className="font-semibold text-slate-600">{selectedOrder.restaurantName}</span></span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
