import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle, Clock, ChefHat, Bike, Home,
  Phone, MapPin, ArrowLeft, RefreshCw,
} from "lucide-react";
import { useRealtimeDocument } from "../../hooks/useFirestore";
import { updateDocument, COLLECTIONS } from "../../firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import OrderStatusBadge from "../../components/food/OrderStatusBadge";

const ORDER_STEPS = [
  { status: "pending",    icon: Clock,        label: "Order Placed",    desc: "We received your order" },
  { status: "confirmed",  icon: CheckCircle,  label: "Confirmed",       desc: "Restaurant confirmed your order" },
  { status: "preparing",  icon: ChefHat,      label: "Preparing",       desc: "Your food is being prepared" },
  { status: "on_the_way", icon: Bike,         label: "On the Way",      desc: "Your rider is heading to you" },
  { status: "delivered",  icon: Home,         label: "Delivered",       desc: "Enjoy your meal!" },
];

const statusIndex = (status) =>
  ORDER_STEPS.findIndex((s) => s.status === status);

// Simulate status progression for demo purposes
const useAutoProgress = (orderId, currentStatus) => {
  useEffect(() => {
    if (!orderId || currentStatus === "delivered" || currentStatus === "cancelled") return;

    const idx = statusIndex(currentStatus);
    if (idx < ORDER_STEPS.length - 1) {
      const delay = currentStatus === "pending" ? 8000 : 12000;
      const timer = setTimeout(async () => {
        const nextStatus = ORDER_STEPS[idx + 1].status;
        await updateDocument(COLLECTIONS.ORDERS, orderId, {
          status: nextStatus,
          [`statusHistory`]: [
            { status: nextStatus, timestamp: new Date().toISOString() },
          ],
        });
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [orderId, currentStatus]);
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const { data: order, loading } = useRealtimeDocument(COLLECTIONS.ORDERS, orderId);

  useAutoProgress(orderId, order?.status);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading order..." />
      </div>
    );
  }

  if (!order || order.userId !== currentUser?.uid) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Order not found</h2>
        <Link to="/orders" className="text-orange-500 font-semibold hover:underline">
          View all orders
        </Link>
      </div>
    );
  }

  const currentIdx = statusIndex(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/orders" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-800">Track Order</h1>
          <p className="text-xs text-slate-400 font-mono">
            #{orderId.slice(-10).toUpperCase()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Live indicator */}
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <p className="text-sm text-green-700 font-semibold">Live tracking active</p>
          <RefreshCw size={12} className="text-green-500 ml-auto animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      )}

      {/* Progress stepper */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <h2 className="font-bold text-slate-800 mb-6">Order Progress</h2>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100" />
          <div
            className="absolute left-5 top-5 w-0.5 bg-orange-400 transition-all duration-700"
            style={{ height: `${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
          />

          <div className="space-y-6">
            {ORDER_STEPS.map(({ status, icon: Icon, label, desc }, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={status} className="relative flex items-start gap-4 pl-12">
                  <div
                    className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                      active
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110"
                        : done
                        ? "bg-green-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="pt-1.5">
                    <p className={`font-bold text-sm ${done ? "text-slate-800" : "text-slate-400"}`}>
                      {label}
                      {active && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                          Current
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 ${done ? "text-slate-500" : "text-slate-300"}`}>{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
        <h2 className="font-bold text-slate-800 mb-4">Delivery Details</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Delivering to</p>
              <p className="text-sm font-semibold text-slate-700">
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
              </p>
              {order.deliveryAddress?.notes && (
                <p className="text-xs text-slate-500 mt-0.5">{order.deliveryAddress.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Estimated delivery</p>
              <p className="text-sm font-semibold text-slate-700">30–45 minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-800 mb-4">
          Items from {order.restaurantName}
        </h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">× {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-slate-700">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between font-bold text-slate-800">
          <span>Total Paid</span>
          <span className="text-orange-500">${order.total?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
