import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { getCollection, COLLECTIONS } from "../../firebase/firestore";
import RestaurantCard from "../../components/food/RestaurantCard";
import SearchBar from "../../components/ui/SearchBar";
import CategoryFilter from "../../components/food/CategoryFilter";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import { UtensilsCrossed } from "lucide-react";

const SORT_OPTIONS = [
  { value: "default", label: "Recommended" },
  { value: "rating", label: "Highest Rated" },
  { value: "deliveryTime", label: "Fastest Delivery" },
  { value: "deliveryFee", label: "Lowest Delivery Fee" },
];

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showFreeDelivery, setShowFreeDelivery] = useState(false);

  useEffect(() => {
    getCollection(COLLECTIONS.RESTAURANTS)
      .then(setRestaurants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sync URL params
  useEffect(() => {
    const params = {};
    if (search) params.q = search;
    if (category !== "all") params.category = category;
    if (sort !== "default") params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [search, category, sort]);

  const filtered = useMemo(() => {
    let result = [...restaurants];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category !== "all") {
      result = result.filter(
        (r) =>
          r.cuisine?.toLowerCase().includes(category) ||
          r.tags?.some((t) => t.toLowerCase().includes(category))
      );
    }

    // Toggle filters
    if (showOpenOnly) result = result.filter((r) => r.isOpen);
    if (showFreeDelivery) result = result.filter((r) => r.deliveryFee === 0);

    // Sort
    switch (sort) {
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "deliveryTime":
        result.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime?.split("-")[0] || "99");
          const bTime = parseInt(b.deliveryTime?.split("-")[0] || "99");
          return aTime - bTime;
        });
        break;
      case "deliveryFee":
        result.sort((a, b) => (a.deliveryFee || 0) - (b.deliveryFee || 0));
        break;
    }

    return result;
  }, [restaurants, search, category, sort, showOpenOnly, showFreeDelivery]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("default");
    setShowOpenOnly(false);
    setShowFreeDelivery(false);
  };

  const hasFilters = search || category !== "all" || sort !== "default" || showOpenOnly || showFreeDelivery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 mb-1">
          {search ? `Results for "${search}"` : "All Restaurants"}
        </h1>
        <p className="text-slate-500 text-sm">
          {loading ? "Loading..." : `${filtered.length} restaurant${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Search restaurants, cuisines..."
          className="flex-1"
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={SORT_OPTIONS}
          className="sm:w-52"
        />
      </div>

      {/* Category filter */}
      <div className="mb-5">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      {/* Toggle chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setShowOpenOnly(!showOpenOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
            showOpenOnly ? "bg-green-500 text-white border-green-500" : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
          }`}
        >
          🟢 Open Now
        </button>
        <button
          onClick={() => setShowFreeDelivery(!showFreeDelivery)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
            showFreeDelivery ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
          }`}
        >
          🚚 Free Delivery
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Loading restaurants..." />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No restaurants found"
          description={
            hasFilters
              ? "Try adjusting your search or filters."
              : "No restaurants available yet. Please check back later."
          }
          action={hasFilters ? clearFilters : null}
          actionLabel={hasFilters ? "Clear Filters" : null}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants;
