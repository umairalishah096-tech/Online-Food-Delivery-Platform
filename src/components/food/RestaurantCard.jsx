import { Link } from "react-router-dom";
import { Star, Clock, Bike, ChevronRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

export default function RestaurantCard({ restaurant }) {
  const {
    id, name, imageUrl, cuisine, rating, reviewCount,
    deliveryTime, deliveryFee, minOrder, isOpen, tags = [],
  } = restaurant;

  return (
    <Link to={`/restaurant/${id}`} className="block group outline-none">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-focus:ring-2 group-focus:ring-orange-400">

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {imageUrl || restaurant.image ? (
            <img
              src={imageUrl || restaurant.image}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
              <svg viewBox="0 0 64 64" width="64" height="64" fill="none" className="text-orange-300">
                <path d="M32 8c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8z" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 32h24M32 20v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={isOpen ? "success" : "secondary"} dot>
              {isOpen ? "Open Now" : "Closed"}
            </Badge>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="absolute top-3 right-3 flex gap-1.5">
              {tags.slice(0, 1).map((tag) => (
                <span key={tag} className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Hover CTA */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
              <span className="text-sm font-bold text-slate-800">View Menu</span>
              <ChevronRight size={16} className="text-orange-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-black text-slate-800 text-base leading-tight">{name}</h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg flex-shrink-0">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-slate-700">{rating?.toFixed(1) || "New"}</span>
              {reviewCount > 0 && <span className="text-xs text-slate-400">({reviewCount})</span>}
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-3 font-medium">{cuisine}</p>

          {/* Meta row */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-50 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock size={13} className="text-orange-400" />
              {deliveryTime || "25-35"} min
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Bike size={13} className="text-orange-400" />
              {deliveryFee === 0 ? (
                <span className="text-green-600 font-bold">Free delivery</span>
              ) : (
                `$${deliveryFee} delivery`
              )}
            </span>
            {minOrder > 0 && (
              <span className="ml-auto text-slate-400">Min ${minOrder}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
