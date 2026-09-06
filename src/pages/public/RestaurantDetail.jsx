import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star, Clock, Bike, MapPin, Phone, ChevronRight,
  ShoppingCart, Search, ArrowLeft, Info, MessageSquare,
} from "lucide-react";
import {
  getDocument, getCollection, COLLECTIONS, where, orderBy,
} from "../../firebase/firestore";
import FoodCard from "../../components/food/FoodCard";
import ReviewForm from "../../components/food/ReviewForm";
import StarRating from "../../components/ui/StarRating";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Badge from "../../components/ui/Badge";
import { useCart } from "../../contexts/CartContext";

const MENU_CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "burger", label: "Burgers" },
  { id: "pizza", label: "Pizza" },
  { id: "sushi", label: "Sushi" },
  { id: "indian", label: "Indian" },
  { id: "mexican", label: "Mexican" },
  { id: "chinese", label: "Chinese" },
  { id: "sides", label: "Sides" },
  { id: "desserts", label: "Desserts" },
  { id: "drinks", label: "Drinks" },
];

const RestaurantDetail = () => {
  const { id } = useParams();
  const { itemCount, total } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menu");
  const [menuCategory, setMenuCategory] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [rest, items, revs] = await Promise.all([
          getDocument(COLLECTIONS.RESTAURANTS, id),
          getCollection(COLLECTIONS.MENU_ITEMS, [
            where("restaurantId", "==", id),
            where("available", "==", true),
          ]),
          getCollection(COLLECTIONS.REVIEWS, [
            where("restaurantId", "==", id)
          ]),
        ]);
        
        // Sort reviews client-side to avoid Firebase composite index requirement
        const sortedRevs = revs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setRestaurant(rest);
        setMenuItems(items);
        setReviews(sortedRevs);
      } catch (err) {
        console.error("Error loading restaurant:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const filteredMenu = useMemo(() => {
    let items = menuItems;
    if (menuCategory !== "all") {
      items = items.filter((i) => i.category === menuCategory);
    }
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      items = items.filter(
        (i) => i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [menuItems, menuCategory, menuSearch]);

  // Get available categories in this restaurant's menu
  const availableCategories = useMemo(() => {
    const cats = new Set(menuItems.map((i) => i.category));
    return MENU_CATEGORIES.filter((c) => c.id === "all" || cats.has(c.id));
  }, [menuItems]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading restaurant..." />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Restaurant not found</h2>
        <Link to="/restaurants" className="text-orange-500 font-semibold hover:underline">
          Browse all restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 bg-slate-800 overflow-hidden">
        {restaurant.coverImage || restaurant.imageUrl || restaurant.image ? (
          <img
            src={restaurant.coverImage || restaurant.imageUrl || restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-orange-100 to-amber-100">🍴</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <Link
          to="/restaurants"
          className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 bg-white/90 backdrop-blur text-slate-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-white transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">{restaurant.name}</h1>
                <Badge variant={restaurant.isOpen ? "success" : "danger"} dot>
                  {restaurant.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
              <p className="text-slate-500 mb-3">{restaurant.cuisine}</p>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed mb-4">
                {restaurant.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-700">{restaurant.rating?.toFixed(1)}</span>
                  <span>({restaurant.reviewCount || reviews.length} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-orange-400" />
                  {restaurant.deliveryTime} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Bike size={14} className="text-orange-400" />
                  {restaurant.deliveryFee === 0 ? "Free delivery" : `$${restaurant.deliveryFee} delivery`}
                </span>
                {restaurant.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-orange-400" />
                    {restaurant.address}
                  </span>
                )}
              </div>
            </div>

            {/* Min order badge */}
            {restaurant.minOrder && (
              <div className="flex-shrink-0 text-center bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4">
                <p className="text-2xl font-black text-orange-500">${restaurant.minOrder}</p>
                <p className="text-xs text-slate-500 mt-0.5">Min. order</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-slate-100 p-1.5 shadow-sm w-fit">
          {[
            { id: "menu", icon: null, label: "Menu" },
            { id: "info", icon: Info, label: "Info" },
            { id: "reviews", icon: MessageSquare, label: `Reviews (${reviews.length})` },
          ].map(({ id: tabId, icon: Icon, label }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tabId
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {Icon && <Icon size={14} />} {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* ── MENU TAB ── */}
            {activeTab === "menu" && (
              <div>
                {/* Category filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                  {availableCategories.map(({ id: catId, label }) => (
                    <button
                      key={catId}
                      onClick={() => setMenuCategory(catId)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all border ${
                        menuCategory === catId
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative mb-5">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search menu items..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>

                {filteredMenu.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <p className="text-4xl mb-3">🍽️</p>
                    <p className="text-slate-500 text-sm">No items match your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMenu.map((item) => (
                      <FoodCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── INFO TAB ── */}
            {activeTab === "info" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                <h2 className="font-bold text-slate-800 text-lg">Restaurant Information</h2>
                {[
                  { icon: MapPin, label: "Address", value: restaurant.address },
                  { icon: Phone, label: "Phone", value: restaurant.phone },
                  { icon: Clock, label: "Delivery Time", value: `${restaurant.deliveryTime} minutes` },
                  { icon: Bike, label: "Delivery Fee", value: restaurant.deliveryFee === 0 ? "Free" : `$${restaurant.deliveryFee}` },
                ].map(({ icon: Icon, label, value }) =>
                  value ? (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                        <p className="text-sm text-slate-700">{value}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {/* Review form */}
                <ReviewForm
                  restaurantId={id}
                  restaurantName={restaurant.name}
                  onReviewAdded={(rev) => setReviews((prev) => [rev, ...prev])}
                />

                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <p className="text-4xl mb-3">💬</p>
                    <h3 className="font-bold text-slate-700 mb-1">No reviews yet</h3>
                    <p className="text-sm text-slate-500">Be the first to review this restaurant.</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {review.userDisplayName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="font-semibold text-sm text-slate-800">
                            {review.userDisplayName || "Anonymous"}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {review.createdAt?.toDate?.()?.toLocaleDateString?.() ||
                          new Date(review.createdAt?.seconds * 1000 || review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Sticky Cart Summary ── */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              {itemCount > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShoppingCart size={18} className="text-orange-500" />
                    Your Order
                  </h3>
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                      <span className="font-semibold text-orange-500">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link
                    to="/cart"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
                  >
                    View Cart <ChevronRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                  <ShoppingCart size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Add items to your cart</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile cart bar */}
        {itemCount > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-xl z-40">
            <Link
              to="/cart"
              className="flex items-center justify-between w-full bg-orange-500 text-white px-5 py-3.5 rounded-2xl font-bold"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={18} />
                View Cart · {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
              <span>${total.toFixed(2)}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
