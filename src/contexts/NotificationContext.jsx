import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToCollection,
  updateDocument,
  COLLECTIONS,
  where,
  orderBy,
} from "../firebase/firestore";

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const unsub = subscribeToCollection(
      COLLECTIONS.NOTIFICATIONS,
      [where("userId", "==", currentUser.uid), orderBy("createdAt", "desc")],
      (data) => setNotifications(data)
    );
    return unsub;
  }, [currentUser]);

  const markAsRead = async (notifId) => {
    await updateDocument(COLLECTIONS.NOTIFICATIONS, notifId, { read: true });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
