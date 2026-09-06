import { useState } from "react";
import { Plus, Minus, Star, Clock, Leaf, Flame } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "../ui/dialog";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";

export default function FoodCard({ item }) {
  const { addToCart, replaceCart, cart, getItemQuantity, updateQuantity } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const qty = getItemQuantity(item.id);

  const handleAdd = () => {
    if (cart.restaurantId && cart.restaurantId !== item.restaurantId && cart.items.length > 0) {
      setConfirmOpen(true);
      return;
    }
    addToCart(item);
    toast.success(`${item.name} added!`, { duration: 1500 });
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">

        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-slate-100 flex-shrink-0">
          {item.imageUrl || item.image ? (
            <img
              src={item.imageUrl || item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
              <svg viewBox="0 0 64 64" width="48" height="48" fill="none" className="text-orange-200">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 32c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {item.isPopular && (
              <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-orange-500 text-white border-0 shadow-sm">
                <Flame size={9} className="mr-0.5" /> Hot
              </Badge>
            )}
            {item.isVeg && (
              <Badge variant="success" className="text-[10px] px-2 py-0.5 shadow-sm">
                <Leaf size={9} className="mr-0.5" /> Veg
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-800 text-sm leading-tight flex-1">{item.name}</h3>
            <span className="text-orange-500 font-black text-sm flex-shrink-0">
              ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">{item.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
            {/* Rating + time */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {item.rating && (
                <span className="flex items-center gap-1 font-medium">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {item.rating}
                </span>
              )}
              {item.prepTime && (
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-slate-300" />
                  {item.prepTime}m
                </span>
              )}
            </div>

            {/* Qty controls */}
            {qty > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, qty - 1)}
                  className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors"
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="text-sm font-black text-slate-800 w-5 text-center tabular-nums">{qty}</span>
                <button
                  onClick={handleAdd}
                  className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm shadow-orange-200"
              >
                <Plus size={12} strokeWidth={2.5} /> Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replace cart dialog â€” shadcn Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start a new cart?</DialogTitle>
            <DialogDescription>
              Your cart has items from <strong className="text-slate-700">{cart.restaurantName}</strong>.
              Adding this item will clear your current cart.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              replaceCart(item);
              setConfirmOpen(false);
              toast.success(`Cart cleared. ${item.name} added!`);
            }}>
              Yes, Replace Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
