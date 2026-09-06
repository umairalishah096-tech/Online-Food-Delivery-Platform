import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        restaurantId: action.payload.restaurantId,
        restaurantName: action.payload.restaurantName,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    }

    case "CLEAR_CART":
      return { items: [], restaurantId: null, restaurantName: null };

    case "LOAD_CART":
      return action.payload;

    default:
      return state;
  }
};

const initialState = { items: [], restaurantId: null, restaurantName: null };

// ─── Provider ─────────────────────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const saved = localStorage.getItem("foodDeliveryCart");
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("foodDeliveryCart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    // Warn if adding from different restaurant
    if (cart.restaurantId && cart.restaurantId !== item.restaurantId && cart.items.length > 0) {
      return false; // caller handles confirm dialog
    }
    dispatch({ type: "ADD_ITEM", payload: item });
    return true;
  };

  const removeFromCart = (itemId) =>
    dispatch({ type: "REMOVE_ITEM", payload: itemId });

  const updateQuantity = (id, quantity) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const replaceCart = (item) => {
    dispatch({ type: "CLEAR_CART" });
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  // Computed
  const itemCount = cart.items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const deliveryFee = cart.items.length > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const getItemQuantity = (id) =>
    cart.items.find((i) => i.id === id)?.quantity || 0;

  const value = {
    cart,
    items: cart.items,
    restaurantId: cart.restaurantId,
    restaurantName: cart.restaurantName,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    replaceCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
