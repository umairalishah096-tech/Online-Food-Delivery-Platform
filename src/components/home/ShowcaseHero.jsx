import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Play,
  Star,
  ShoppingBag,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Leaf,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCollection, COLLECTIONS, orderBy, where } from "../../firebase/firestore";
import LoadingSpinner from "../ui/LoadingSpinner";

const DEFAULT_DISHES = [
  {
    id: 1,
    rank: "#1 Most Loved Dish",
    name: "Lotek Perkedel",
    subtitle: "Indonesian Vegetable Salad",
    description:
      "A traditional Sundanese salad bursting with steamed vegetables, crunchy perkedel, and a rich peanut sauce. Every bite tells a century-old story of Javanese cuisine.",
    image: "https://images.unsplash.com/photo-1546069901-ba6e64257be9?w=900&q=90",
    thumb: "https://images.unsplash.com/photo-1546069901-ba6e64257be9?w=300&q=80",
    price: "$9.99",
    rating: 4.9,
    reviews: 2341,
    time: "20 min",
    calories: 320,
    tags: ["Vegan", "Gluten-Free"],
    bg: "from-emerald-900 via-[#0e1f14] to-slate-900",
    accent: "#4ade80",
    chef: {
      name: "Chef Feny",
      avatar: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=100&q=80",
      rating: 4.9,
      specialty: "Traditional Indonesian Cuisine",
      bio: "With 15 years of experience, Chef Feny brings authentic Sundanese flavors using only locally sourced ingredients.",
    },
    ingredients: [
      { name: "Fresh Bean Sprouts", emoji: "🌱" },
      { name: "Long Beans", emoji: "🫘" },
      { name: "Cabbage", emoji: "🥬" },
      { name: "Perkedel (Potato Cakes)", emoji: "🥔" },
      { name: "Peanut Sauce", emoji: "🥜" },
      { name: "Kencur Spice", emoji: "🌿" },
    ],
  },
  {
    id: 2,
    rank: "#2 Chef Signature",
    name: "Lamb Steak Potato",
    subtitle: "Grilled Premium Lamb Chop",
    description:
      "Prime New Zealand lamb chop slow-marinated in rosemary, garlic, and red wine reduction. Served alongside crispy roasted potatoes and seasonal vegetables.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=90",
    thumb: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=80",
    price: "$24.99",
    rating: 4.8,
    reviews: 1876,
    time: "35 min",
    calories: 680,
    tags: ["Keto", "High Protein"],
    bg: "from-rose-900 via-[#1f0e0e] to-slate-900",
    accent: "#f87171",
    chef: {
      name: "Chef Marcus",
      avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80",
      rating: 4.8,
      specialty: "European Fine Dining",
      bio: "Michelin-starred Chef Marcus trained in Paris and brings classical French techniques to every dish.",
    },
    ingredients: [
      { name: "NZ Lamb Chop", emoji: "🥩" },
      { name: "Rosemary", emoji: "🌿" },
      { name: "Garlic Cloves", emoji: "🧄" },
      { name: "Red Wine", emoji: "🍷" },
      { name: "Roasted Potatoes", emoji: "🥔" },
      { name: "Seasonal Veggies", emoji: "🥦" },
    ],
  },
  {
    id: 3,
    rank: "#3 Fan Favorite",
    name: "Martabak Pak Adin",
    subtitle: "Indonesian Stuffed Pancake",
    description:
      "Legendary Martabak from the streets of Jakarta — thick, fluffy, and loaded with chocolate, condensed milk, and cheese. A late-night indulgence like no other.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=90",
    thumb: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80",
    price: "$7.49",
    rating: 4.7,
    reviews: 3102,
    time: "15 min",
    calories: 540,
    tags: ["Comfort Food", "Sweet"],
    bg: "from-amber-900 via-[#1f1200] to-slate-900",
    accent: "#fbbf24",
    chef: {
      name: "Chef Adin",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80",
      rating: 4.7,
      specialty: "Indonesian Street Food",
      bio: "Chef Adin has been perfecting his Martabak recipe for over 20 years on the streets of Jakarta.",
    },
    ingredients: [
      { name: "Wheat Flour Batter", emoji: "🌾" },
      { name: "Dark Chocolate", emoji: "🍫" },
      { name: "Condensed Milk", emoji: "🥛" },
      { name: "Cheese", emoji: "🧀" },
      { name: "Butter", emoji: "🧈" },
      { name: "Sesame Seeds", emoji: "🌰" },
    ],
  },
  {
    id: 4,
    rank: "#4 Heritage Recipe",
    name: "Urap Asli Wonogiri",
    subtitle: "Traditional Javanese Salad",
    description:
      "Authentic Wonogiri urap featuring a medley of blanched vegetables tossed in freshly grated coconut spiced with kaffir lime leaves, galangal, and chili.",
    image: "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=900&q=90",
    thumb: "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=80",
    price: "$8.49",
    rating: 4.6,
    reviews: 987,
    time: "25 min",
    calories: 280,
    tags: ["Vegan", "Heritage"],
    bg: "from-teal-900 via-[#0a1f1e] to-slate-900",
    accent: "#2dd4bf",
    chef: {
      name: "Chef Sari",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80",
      rating: 4.6,
      specialty: "Javanese Heritage Cooking",
      bio: "Chef Sari preserves century-old recipes from Wonogiri, Central Java, using hand-ground spices daily.",
    },
    ingredients: [
      { name: "Young Jackfruit", emoji: "🌿" },
      { name: "Long Beans", emoji: "🫘" },
      { name: "Spinach", emoji: "🥬" },
      { name: "Grated Coconut", emoji: "🥥" },
      { name: "Kaffir Lime Leaves", emoji: "🍃" },
      { name: "Galangal and Chili", emoji: "🌶️" },
    ],
  },
];

const heroImgVariants = {
  enter: { opacity: 0, scale: 1.1, filter: "blur(14px)" },
  center: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, scale: 0.92, filter: "blur(8px)", transition: { duration: 0.4,  ease: "easeIn" } },
};
const textVariants = {
  enter:  { opacity: 0, y: 36 },
  center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12 } },
  exit:   { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const panelVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 } },
  exit:   { opacity: 0, x: 40, transition: { duration: 0.28 } },
};

function ChefCard({ chef }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-4">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Prepared by</p>
      <div className="flex items-center gap-3">
        <img src={chef.avatar} alt={chef.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">{chef.name}</p>
          <p className="text-white/50 text-xs truncate">{chef.specialty}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold">{chef.rating}</span>
          </div>
        </div>
      </div>
      <p className="text-white/50 text-xs leading-relaxed mt-3">{chef.bio}</p>
    </div>
  );
}

export default function ShowcaseHero() {
  const [activeIdx, setActiveIdx]   = useState(0);
  const [tab, setTab]               = useState("overview");
  const [liked, setLiked]           = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [dishes, setDishes]         = useState(DEFAULT_DISHES);
  const [loading, setLoading]       = useState(true);
  
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await getCollection(COLLECTIONS.HERO_SLIDES, [
          where("active", "==", true),
          orderBy("order", "asc")
        ]);
        setDishes(data.length > 0 ? data : DEFAULT_DISHES);
      } catch (error) {
        setDishes(DEFAULT_DISHES);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const heroRef     = useRef(null);
  const dish        = dishes[activeIdx] || dishes[0];

  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 55, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 55, damping: 18 });
  const imgX    = useTransform(smoothX, [-1, 1], [-22, 22]);
  const imgY    = useTransform(smoothY, [-1, 1], [-14, 14]);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY   = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - r.left) / r.width) * 2 - 1);
    mouseY.set(((e.clientY - r.top)  / r.height) * 2 - 1);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const go = (idx) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setTab("overview");
    setLiked(null);
    setBookmarked(false);
  };
  const prev = () => go((activeIdx - 1 + dishes.length) % dishes.length);
  const next = () => go((activeIdx + 1) % dishes.length);

  useEffect(() => {
    const timer = setInterval(() => {
      go((activeIdx + 1) % dishes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [activeIdx]);

  function TabPanel() {
    return (
      <AnimatePresence mode="wait">
        {tab === "overview" ? (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="space-y-3">
            <ChefCard chef={dish.chef} />
            <div className="flex items-center gap-2">
              <button onClick={() => setLiked(liked === true ? null : true)}
                className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold border transition-all ${liked === true ? "bg-white text-gray-900 border-transparent shadow" : "bg-white/10 border-white/15 text-white/70 hover:text-white hover:bg-white/18"}`}>
                <ThumbsUp size={14} /> Like
              </button>
              <button onClick={() => setLiked(liked === false ? null : false)}
                className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold border transition-all ${liked === false ? "bg-white text-gray-900 border-transparent shadow" : "bg-white/10 border-white/15 text-white/70 hover:text-white hover:bg-white/18"}`}>
                <ThumbsDown size={14} /> Nope
              </button>
              <button onClick={() => setBookmarked((b) => !b)}
                className={`p-2.5 rounded-xl border transition-all ${bookmarked ? "bg-white text-gray-900 border-transparent shadow" : "bg-white/10 border-white/15 text-white/60 hover:text-white hover:bg-white/18"}`}>
                <Bookmark size={14} className={bookmarked ? "fill-current" : ""} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Rating",  value: `${dish.rating}★` },
                { label: "Reviews", value: dish.reviews > 999 ? `${(dish.reviews / 1000).toFixed(1)}k` : dish.reviews },
                { label: "Time",    value: dish.time },
              ].map((s) => (
                <div key={s.label} className="bg-white/8 border border-white/10 rounded-xl p-2.5 text-center">
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="ingredients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Key Ingredients</p>
            {dish.ingredients.map((ing, i) => (
              <motion.div key={ing.name} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.055 }}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-lg bg-white/10 w-8 h-8 rounded-lg flex items-center justify-center">{ing.emoji}</span>
                <span className="text-white/80 text-sm font-medium">{ing.name}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* â”€â”€ HERO â”€â”€ */}
      <section ref={heroRef} className="relative min-h-[850px] lg:min-h-[90vh] overflow-hidden flex flex-col justify-center pb-20"
        onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

        <AnimatePresence mode="wait">
          <motion.div key={`bg-${activeIdx}`}
            className={`absolute inset-0 bg-gradient-to-br ${dish.bg}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }} />
        </AnimatePresence>

        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        <motion.div style={{ y: parallaxY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col lg:grid lg:grid-cols-[1fr_auto_320px] flex-1 items-center
                     gap-6 lg:gap-0 px-6 lg:px-12 xl:px-20 pt-16">

          {/* LEFT text */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={`text-${activeIdx}`} variants={textVariants}
                initial="enter" animate="center" exit="exit" className="space-y-4 max-w-lg">

                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border"
                  style={{ color: dish.accent, borderColor: `${dish.accent}50`, backgroundColor: `${dish.accent}18` }}>
                  <Flame size={12} /> {dish.rank}
                </span>

                <h1 className="text-5xl lg:text-[5.5rem] font-black text-white leading-[0.95] tracking-tight">
                  {dish.name}
                </h1>
                <p className="text-lg text-white/55 font-medium">{dish.subtitle}</p>

                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="text-white font-bold">{dish.rating}</span>
                    <span className="text-white/40 text-sm">({dish.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/55 text-sm"><Clock size={14} /> {dish.time}</div>
                  <div className="flex items-center gap-1.5 text-white/55 text-sm"><Flame size={14} /> {dish.calories} kcal</div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {dish.tags.map((tag) => (
                    <span key={tag}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${dish.accent}22`, color: dish.accent }}>
                      <Leaf size={10} /> {tag}
                    </span>
                  ))}
                </div>

                <p className="text-white/65 leading-relaxed max-w-md text-sm lg:text-[0.95rem] line-clamp-3">
                  {dish.description}
                </p>

                <div className="flex gap-3 flex-wrap pt-1">
                  <Link to="/restaurants" className="block">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-2.5 px-7 py-3 rounded-2xl font-bold text-sm shadow-xl"
                      style={{ backgroundColor: dish.accent, color: "#fff" }}>
                      <ShoppingBag size={16} /> Order — {dish.price}
                    </motion.button>
                  </Link>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm
                               bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all">
                    <Play size={14} className="fill-white" /> Watch Story
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTER image */}
          <div className="flex items-center justify-center px-4 lg:px-10 xl:px-16">
            <AnimatePresence mode="wait">
              <motion.div key={`img-${activeIdx}`} variants={heroImgVariants}
                initial="enter" animate="center" exit="exit" className="relative">
                <div className="absolute inset-0 rounded-full blur-[80px] opacity-25 scale-[0.85]"
                  style={{ backgroundColor: dish.accent }} />
                <motion.img src={dish.image} alt={dish.name} style={{ x: imgX, y: imgY }}
                  className="relative z-10 w-64 h-64 lg:w-[400px] lg:h-[400px] xl:w-[440px] xl:h-[440px]
                             object-cover rounded-full border-[3px] border-white/12 shadow-2xl" />
                <motion.div initial={{ scale: 0, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.42, type: "spring", stiffness: 220 }}
                  className="absolute top-3 -right-3 lg:top-5 lg:-right-6 bg-white rounded-2xl px-3 py-2 shadow-xl z-20">
                  <p className="text-[10px] text-gray-400 font-medium">Starting from</p>
                  <p className="text-base lg:text-lg font-black text-gray-900">{dish.price}</p>
                </motion.div>
                <motion.div initial={{ scale: 0, rotate: 20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.52, type: "spring", stiffness: 220 }}
                  className="absolute bottom-6 -left-3 lg:-left-5 bg-white rounded-2xl px-3 py-2 shadow-xl z-20 flex items-center gap-1.5">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-gray-900">{dish.rating}</span>
                  <span className="text-xs text-gray-400">/ 5.0</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT panel (desktop) */}
          <div className="hidden lg:flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={`panel-${activeIdx}`} variants={panelVariants}
                initial="enter" animate="center" exit="exit" className="space-y-3 w-[300px]">
                <div className="flex gap-1 bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-1">
                  {["overview", "ingredients"].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${tab === t ? "bg-white text-gray-900 shadow" : "text-white/55 hover:text-white"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <TabPanel />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Prev/Next */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }} onClick={prev}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/22 transition-all shadow-lg">
            <ChevronLeft size={22} />
          </motion.button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }} onClick={next}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/22 transition-all shadow-lg">
            <ChevronRight size={22} />
          </motion.button>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {dishes.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === activeIdx ? 26 : 6, backgroundColor: i === activeIdx ? dish.accent : "rgba(255,255,255,0.28)" }} />
          ))}
        </div>
      </section>

    </div>
  );
}





