import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, ArrowRight, Star, Clock, Shield,
  Truck, ChevronRight, Zap, MapPin, TrendingUp,
} from "lucide-react";
import { getCollection, COLLECTIONS, where, orderBy, limit } from "../../firebase/firestore";
import RestaurantCard from "../../components/food/RestaurantCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../lib/utils";
import ShowcaseHero from "../../components/home/ShowcaseHero";

// Real high-quality food images from Unsplash
const HERO_FOOD_IMAGES = [
  { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80", label: "Smash Burger", price: "$12.99" },
  { url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80", label: "Wood-Fired Pizza", price: "$14.99" },
  { url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80", label: "Fresh Sushi", price: "$16.99" },
  { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80", label: "Tikka Masala", price: "$13.99" },
];

// Category quick-links with real images
const QUICK_CATEGORIES = [
  { label: "Pizza",   img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80", id: "pizza",   bg: "from-red-500 to-orange-500" },
  { label: "Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80", id: "burger",  bg: "from-amber-500 to-yellow-500" },
  { label: "Sushi",   img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80", id: "sushi",   bg: "from-pink-500 to-rose-500" },
  { label: "Indian",  img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80", id: "indian",  bg: "from-orange-500 to-red-500" },
  { label: "Mexican", img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&q=80", id: "mexican", bg: "from-green-500 to-teal-500" },
  { label: "Chinese", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&q=80", id: "chinese", bg: "from-red-600 to-rose-500" },
];

const WHY_US = [
  { icon: Zap,    title: "30-Min Delivery", desc: "Lightning-fast delivery with live GPS tracking on every order.", color: "bg-orange-50 text-orange-500" },
  { icon: Shield, title: "Safe & Fresh",    desc: "Hygienically packed, contactless delivery by vetted riders.",  color: "bg-blue-50 text-blue-500" },
  { icon: Star,   title: "Top Quality",     desc: "Only restaurants that pass our 50-point quality checklist.",   color: "bg-amber-50 text-amber-500" },
  { icon: Truck,  title: "Live Tracking",   desc: "Watch your rider move on the map in real time.",              color: "bg-green-50 text-green-500" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImg, setHeroImg] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setHeroImg((p) => (p + 1) % HERO_FOOD_IMAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [featured, rated] = await Promise.all([
          getCollection(COLLECTIONS.RESTAURANTS, [limit(6)]),
          getCollection(COLLECTIONS.RESTAURANTS, [orderBy("rating", "desc"), limit(3)]),
        ]);
        setFeaturedRestaurants(featured);
        setTopRated(rated);
      } catch { /* seeding not done yet */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/restaurants?q=${encodeURIComponent(searchQuery.trim())}` : "/restaurants");
  };

  return (
    <div className="min-h-screen bg-white">

      <ShowcaseHero />

      {/* â”€â”€ CATEGORY CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">What are you craving?</h2>
            <p className="text-slate-500 text-sm mt-1">Tap a cuisine to browse instantly</p>
          </div>
          <Link to="/restaurants" className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:text-orange-600">
            View all <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_CATEGORIES.map(({ label, img, id, bg }) => (
            <Link key={id} to={`/restaurants?category=${id}`}
              className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className={cn("absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent")} />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <p className="text-white font-black text-sm drop-shadow">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* â”€â”€ FEATURED RESTAURANTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Featured Restaurants</h2>
              <p className="text-slate-500 text-sm mt-1">Open now Â· Delivering to your area</p>
            </div>
            <Link to="/restaurants" className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:text-orange-600">
              View all <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading restaurants..." /></div>
          ) : featuredRestaurants.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="text-6xl mb-5">ðŸ½ï¸</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No restaurants yet</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Go to <strong>Admin â†’ Settings â†’ Seed Data</strong> to populate sample restaurants and menu items.
              </p>
              <Link to="/restaurants">
                <Button>Browse Restaurants</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* â”€â”€ HOW IT WORKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge variant="default" className="mb-3 text-xs px-3 py-1">Simple Process</Badge>
          <h2 className="text-3xl font-black text-slate-800 mb-3">Order in 3 Easy Steps</h2>
          <p className="text-slate-500 max-w-md mx-auto">From hungry to full in under 30 minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />

          {[
            { step: "01", img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&q=80", title: "Choose a Restaurant", desc: "Browse 500+ restaurants, filter by cuisine, read reviews and pick your favourite." },
            { step: "02", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&q=80", title: "Build Your Order",     desc: "Pick items, customise, apply promo codes and checkout securely in seconds." },
            { step: "03", img: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&q=80", title: "Fast Delivery",        desc: "Live-track your rider on the map. Expect hot food at your door in ~30 min." },
          ].map(({ step, img, title, desc }) => (
            <div key={step} className="text-center relative">
              <div className="relative w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-5 shadow-lg ring-4 ring-white">
                <img src={img} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-orange-500/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-2xl drop-shadow">{step}</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ TOP RATED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {topRated.length > 0 && (
        <section className="bg-gradient-to-b from-orange-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Top Rated</h2>
                <p className="text-slate-500 text-sm mt-1">Loved by our community</p>
              </div>
              <Link to="/restaurants?sort=rating" className="flex items-center gap-1 text-orange-500 font-semibold text-sm">
                See all <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRated.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </div>
        </section>
      )}

      {/* â”€â”€ WHY FOODRUSH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white mb-3">
              Why <span className="text-orange-400">FoodRush</span>?
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">We're not just fast, we're obsessed with every detail.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_US.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/30 transition-colors group">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", color, "bg-opacity-15")}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ APP PROMO / CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-10 md:p-16 text-white">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full" />

          {/* Real food background collage */}
          <div className="absolute right-0 top-0 bottom-0 w-80 hidden lg:grid grid-cols-2 gap-1 p-1 opacity-30">
            {[
              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=60",
              "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=60",
              "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=60",
              "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&q=60",
            ].map((src, i) => (
              <img key={i} src={src} alt="" className="w-full h-full object-cover rounded-lg" />
            ))}
          </div>

          <div className="relative lg:max-w-lg">
            <Badge className="bg-white/20 text-white border-0 mb-4 text-xs">ðŸŽ‰ Limited Time Offer</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Get 20% off your first order
            </h2>
            <p className="text-orange-100 mb-8 leading-relaxed">
              Join 50,000+ food lovers. Use code <strong className="bg-white/20 px-2 py-0.5 rounded-lg text-white">NEWUSER</strong> at checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-orange-500 hover:bg-orange-50 font-black shadow-xl">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/restaurants">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Browse Restaurants
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

