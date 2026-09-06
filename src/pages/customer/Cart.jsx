import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight,
  Tag, ChevronRight, ArrowLeft,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const PROMO_CODES = { WELCOME10: 10, RUSH20: 20, NEWUSER: 15 };

const Cart = () => {
  const { items, restaurantName, subtotal, deliveryFee, tax, total,
    removeFromCart, updateQuantity, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState("");

  const applyPromo = () => {
    const upper = promoCode.trim().toUpperCase();
    if (PROMO_CODES[upper]) {
      const pct = PROMO_CODES[upper];
      setDiscount((subtotal * pct) / 100);
      setPromoApplied(upper);
      setPromoError("");
      toast.success(`${pct}% discount applied!`);
    } else {
      setPromoError("Invalid promo code");
      setDiscount(0);
      setPromoApplied("");
    }
  };

  const finalTotal = total - discount;

  const handleCheckout = () => {
    if (!currentUser) {
      toast.error("Please login to checkout");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add items from a restaurant to get started."
          action={() => navigate("/restaurants")}
          actionLabel="Browse Restaurants"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/restaurants"
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Your Cart</h1>
          {restaurantName && (
            <p className="text-sm text-slate-500">From {restaurantName}</p>
          )}
        </div>
        <button
          onClick={() => { clearCart(); toast.success("Cart cleared"); }}
          className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
        >
          <Trash2 size={13} /> Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
            >
              {/* Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                {item.imageUrl || item.image ? (
                  <img src={item.imageUrl || item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                <p className="text-orange-500 font-bold text-sm mt-1">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-orange-100 hover:text-orange-500 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm font-bold text-slate-800 w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => { removeFromCart(item.id); toast.success("Item removed"); }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {/* Add more items */}
          <Link
            to={`/restaurant/${items[0]?.restaurantId}`}
            className="flex items-center gap-2 text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors px-1"
          >
            <Plus size={14} /> Add more items
          </Link>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Promo Code */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Tag size={15} className="text-orange-500" /> Promo Code
            </h3>
            {promoApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <span className="text-xs text-green-700 font-semibold">{promoApplied} applied!</span>
                <button
                  onClick={() => { setPromoApplied(""); setDiscount(0); setPromoCode(""); }}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 uppercase"
                />
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
            <p className="text-xs text-slate-400 mt-2">
              Try: WELCOME10, RUSH20, NEWUSER
            </p>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount ({promoApplied})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-800 text-base">
                <span>Total</span>
                <span className="text-orange-500">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl
                transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Proceed to Checkout <ChevronRight size={16} />
            </button>

            <p className="text-xs text-slate-400 text-center mt-3">
              🔒 Secure checkout · Free cancellation before preparation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
