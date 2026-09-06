import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Package, CheckCheck, X } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead } = useNotifications() || {
    notifications: [], unreadCount: 0, markAsRead: () => {},
  };
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (ts) => {
    try {
      const date = ts?.toDate ? ts.toDate() : new Date(ts?.seconds * 1000 || ts);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch { return ""; }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-orange-500" />
          <span className="font-bold text-slate-800 text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
          <X size={14} />
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 15).map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${
                !n.read ? "bg-orange-50/50" : ""
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.type === "order" ? "bg-orange-100" : "bg-blue-100"
              }`}>
                <Package size={14} className={n.type === "order" ? "text-orange-500" : "text-blue-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${!n.read ? "text-slate-800" : "text-slate-600"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{formatTime(n.createdAt)}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 text-center">
          {unreadCount > 0 ? (
            <button
              onClick={() => notifications.filter((n) => !n.read).forEach((n) => markAsRead(n.id))}
              className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold hover:text-orange-600 mx-auto"
            >
              <CheckCheck size={13} /> Mark all as read
            </button>
          ) : (
            <p className="text-xs text-slate-400">All caught up!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
