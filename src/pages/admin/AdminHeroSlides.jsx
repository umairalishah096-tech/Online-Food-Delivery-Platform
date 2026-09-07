import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, X, Save, ImageIcon, Loader2, AlertTriangle,
} from "lucide-react";
import {
  getCollection, createDocument, updateDocument,
  deleteDocument, COLLECTIONS, orderBy,
} from "../../firebase/firestore";
import toast from "react-hot-toast";

// ─── BG options ────────────────────────────────────────────────────────────────
const BG_OPTIONS = [
  { label: "Emerald (Green)",  value: "from-emerald-900 via-[#0e1f14] to-slate-900", accent: "#4ade80" },
  { label: "Rose (Red)",       value: "from-rose-900 via-[#1f0e0e] to-slate-900",    accent: "#f87171" },
  { label: "Amber (Yellow)",   value: "from-amber-900 via-[#1f1200] to-slate-900",   accent: "#fbbf24" },
  { label: "Teal (Cyan)",      value: "from-teal-900 via-[#0a1f1e] to-slate-900",    accent: "#2dd4bf" },
  { label: "Violet (Purple)",  value: "from-violet-900 via-[#130e1f] to-slate-900",  accent: "#a78bfa" },
  { label: "Sky (Blue)",       value: "from-sky-900 via-[#0e1520] to-slate-900",     accent: "#38bdf8" },
  { label: "Orange",           value: "from-orange-900 via-[#1f1000] to-slate-900",  accent: "#fb923c" },
];

const EMPTY_FORM = {
  rank: "",
  name: "",
  subtitle: "",
  description: "",
  image: "",
  thumb: "",
  price: "",
  rating: 4.5,
  reviews: 0,
  time: "",
  calories: 0,
  tags: "",
  bg: BG_OPTIONS[0].value,
  accent: BG_OPTIONS[0].accent,
  chefName: "",
  chefAvatar: "",
  chefRating: 4.5,
  chefSpecialty: "",
  chefBio: "",
  ingredientsRaw: "",
  active: true,
};

// ─── parse tags "Vegan, Keto" → ["Vegan","Keto"] ──────────────────────────────
const parseTags = (str) =>
  str.split(",").map((t) => t.trim()).filter(Boolean);

// ─── parse "🥩 Beef, 🌿 Herb" → [{emoji,name}] ─────────────────────────────────
const parseIngredients = (str) =>
  str.split(",").map((part) => {
    const trimmed = part.trim();
    const emojiMatch = trimmed.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
    if (emojiMatch) {
      return { emoji: emojiMatch[0], name: trimmed.slice(emojiMatch[0].length).trim() };
    }
    return { emoji: "🍽️", name: trimmed };
  }).filter((i) => i.name);

// ─── inverse: [{emoji,name}] → display string ─────────────────────────────────
const ingredientsToStr = (arr = []) =>
  arr.map((i) => `${i.emoji} ${i.name}`).join(", ");

// ─── flatten slide → form fields ──────────────────────────────────────────────
const slideToForm = (slide) => ({
  rank:          slide.rank        ?? "",
  name:          slide.name        ?? "",
  subtitle:      slide.subtitle    ?? "",
  description:   slide.description ?? "",
  image:         slide.image       ?? "",
  thumb:         slide.thumb       ?? "",
  price:         slide.price       ?? "",
  rating:        slide.rating      ?? 4.5,
  reviews:       slide.reviews     ?? 0,
  time:          slide.time        ?? "",
  calories:      slide.calories    ?? 0,
  tags:          (slide.tags ?? []).join(", "),
  bg:            slide.bg          ?? BG_OPTIONS[0].value,
  accent:        slide.accent      ?? BG_OPTIONS[0].accent,
  chefName:      slide.chef?.name      ?? "",
  chefAvatar:    slide.chef?.avatar    ?? "",
  chefRating:    slide.chef?.rating    ?? 4.5,
  chefSpecialty: slide.chef?.specialty ?? "",
  chefBio:       slide.chef?.bio       ?? "",
  ingredientsRaw: ingredientsToStr(slide.ingredients),
  active:        slide.active ?? true,
});

// ─── form → Firestore doc ──────────────────────────────────────────────────────
const formToDoc = (f, order) => ({
  rank:        f.rank,
  name:        f.name,
  subtitle:    f.subtitle,
  description: f.description,
  image:       f.image,
  thumb:       f.thumb || f.image,
  price:       f.price,
  rating:      parseFloat(f.rating) || 0,
  reviews:     parseInt(f.reviews)  || 0,
  time:        f.time,
  calories:    parseInt(f.calories) || 0,
  tags:        parseTags(f.tags),
  bg:          f.bg,
  accent:      f.accent,
  chef: {
    name:      f.chefName,
    avatar:    f.chefAvatar,
    rating:    parseFloat(f.chefRating) || 0,
    specialty: f.chefSpecialty,
    bio:       f.chefBio,
  },
  ingredients: parseIngredients(f.ingredientsRaw),
  active:      f.active,
  order,
});

// ─── Reusable input ────────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
  </div>
);
const Input = (props) => (
  <input {...props}
    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
);
const Textarea = (props) => (
  <textarea {...props} rows={3}
    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white resize-none" />
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminHeroSlides() {
  const [slides,  setSlides]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);  // null | "add" | slide-obj
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [delId,   setDelId]   = useState(null);

  // ── load ────────────────────────────────────────────────────────────────────
  const loadSlides = async () => {
    try {
      const data = await getCollection(COLLECTIONS.HERO_SLIDES, [orderBy("order", "asc")]);
      setSlides(data);
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadSlides(); }, []);

  // ── open modal ───────────────────────────────────────────────────────────────
  const openAdd  = () => { setForm(EMPTY_FORM);          setModal("add"); };
  const openEdit = (s) => { setForm(slideToForm(s));     setModal(s); };

  // ── form change ──────────────────────────────────────────────────────────────
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ── bg select syncs accent ───────────────────────────────────────────────────
  const handleBgChange = (val) => {
    const opt = BG_OPTIONS.find((o) => o.value === val);
    setForm((f) => ({ ...f, bg: val, accent: opt?.accent ?? f.accent }));
  };

  // ── save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.image.trim()) {
      toast.error("Dish name aur image URL zaroori hain");
      return;
    }
    setSaving(true);
    try {
      if (modal === "add") {
        const doc = formToDoc(form, slides.length);
        await createDocument(COLLECTIONS.HERO_SLIDES, doc);
        toast.success("Slide add ho gayi ✅");
      } else {
        const doc = formToDoc(form, modal.order ?? 0);
        await updateDocument(COLLECTIONS.HERO_SLIDES, modal.id, doc);
        toast.success("Slide update ho gayi ✅");
      }
      setModal(null);
      await loadSlides();
    } catch (e) {
      toast.error("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── toggle active ─────────────────────────────────────────────────────────────
  const toggleActive = async (slide) => {
    try {
      await updateDocument(COLLECTIONS.HERO_SLIDES, slide.id, { active: !slide.active });
      setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, active: !s.active } : s));
    } catch { toast.error("Update failed"); }
  };

  // ── delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteDocument(COLLECTIONS.HERO_SLIDES, id);
      toast.success("Slide delete ho gayi");
      setDelId(null);
      await loadSlides();
    } catch (e) { toast.error(e.message); }
  };

  // ── reorder ───────────────────────────────────────────────────────────────────
  const moveSlide = async (idx, dir) => {
    const newSlides = [...slides];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newSlides.length) return;
    [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];
    setSlides(newSlides);
    try {
      await Promise.all([
        updateDocument(COLLECTIONS.HERO_SLIDES, newSlides[idx].id,     { order: idx }),
        updateDocument(COLLECTIONS.HERO_SLIDES, newSlides[swapIdx].id, { order: swapIdx }),
      ]);
    } catch { toast.error("Order update failed"); loadSlides(); }
  };

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Hero Slides</h1>
          <p className="text-slate-500 text-sm mt-0.5">Home page hero section manage karo</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {/* Slides list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-400" />
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
          <ImageIcon size={40} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Koi slide nahi hai</p>
          <p className="text-slate-400 text-sm mt-1">Add Slide button se pehli slide banao</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={slide.id}
              className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${slide.active ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
              {/* Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                {slide.image
                  ? <img src={slide.thumb || slide.image} alt={slide.name} className="w-full h-full object-cover" />
                  : <ImageIcon size={24} className="m-auto mt-5 text-slate-300" />}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-800 text-sm">{slide.name}</p>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{slide.price}</span>
                  {!slide.active && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Hidden</span>}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{slide.subtitle}</p>
                <p className="text-xs text-slate-400 mt-0.5">⭐ {slide.rating} · {slide.time} · {slide.rank}</p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors" title="Move Up">
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors" title="Move Down">
                  <ChevronDown size={16} />
                </button>
                <button onClick={() => toggleActive(slide)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Show/Hide">
                  {slide.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(slide)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDelId(slide.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-800">{modal === "add" ? "Naya Slide Add Karo" : "Slide Edit Karo"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* Image preview */}
              {form.image && (
                <div className="rounded-2xl overflow-hidden h-40 bg-slate-100">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Section: Dish Info */}
              <p className="text-xs font-black uppercase tracking-wider text-orange-500">Dish Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Dish Name *">
                  <Input placeholder="e.g. Smash Burger" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label="Rank Badge" hint='e.g. "#1 Most Loved Dish"'>
                  <Input placeholder="#1 Most Loved Dish" value={form.rank} onChange={(e) => set("rank", e.target.value)} />
                </Field>
                <Field label="Subtitle">
                  <Input placeholder="e.g. Grilled Beef Patty" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
                </Field>
                <Field label="Price" hint='e.g. "$12.99"'>
                  <Input placeholder="$12.99" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field label="Rating (0–5)">
                  <Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
                </Field>
                <Field label="Reviews Count">
                  <Input type="number" min="0" value={form.reviews} onChange={(e) => set("reviews", e.target.value)} />
                </Field>
                <Field label="Delivery Time" hint='e.g. "25 min"'>
                  <Input placeholder="25 min" value={form.time} onChange={(e) => set("time", e.target.value)} />
                </Field>
                <Field label="Calories">
                  <Input type="number" min="0" value={form.calories} onChange={(e) => set("calories", e.target.value)} />
                </Field>
              </div>
              <Field label="Description">
                <Textarea placeholder="Dish ki detailed description..." value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label="Tags" hint='Comma separated, e.g. "Vegan, Gluten-Free, Keto"'>
                <Input placeholder="Vegan, Keto, Spicy" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
              </Field>

              {/* Section: Images */}
              <p className="text-xs font-black uppercase tracking-wider text-orange-500 pt-2">Images</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Main Image URL *" hint="Hero mein dikhne wali badi image">
                  <Input placeholder="https://images.unsplash.com/..." value={form.image} onChange={(e) => set("image", e.target.value)} />
                </Field>
                <Field label="Thumbnail URL" hint="Bottom strip mein chhoti image (khali chhordo to main use hogi)">
                  <Input placeholder="https://..." value={form.thumb} onChange={(e) => set("thumb", e.target.value)} />
                </Field>
              </div>

              {/* Section: Style */}
              <p className="text-xs font-black uppercase tracking-wider text-orange-500 pt-2">Style / Theme</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Background Color">
                  <select value={form.bg} onChange={(e) => handleBgChange(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                    {BG_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Accent Color" hint="Hex color, auto-set from background">
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.accent} onChange={(e) => set("accent", e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                    <Input value={form.accent} onChange={(e) => set("accent", e.target.value)} placeholder="#4ade80" />
                  </div>
                </Field>
              </div>

              {/* Section: Chef */}
              <p className="text-xs font-black uppercase tracking-wider text-orange-500 pt-2">Chef Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Chef Name">
                  <Input placeholder="Chef Ali" value={form.chefName} onChange={(e) => set("chefName", e.target.value)} />
                </Field>
                <Field label="Chef Specialty">
                  <Input placeholder="BBQ Master" value={form.chefSpecialty} onChange={(e) => set("chefSpecialty", e.target.value)} />
                </Field>
                <Field label="Chef Rating">
                  <Input type="number" min="0" max="5" step="0.1" value={form.chefRating} onChange={(e) => set("chefRating", e.target.value)} />
                </Field>
                <Field label="Chef Avatar URL">
                  <Input placeholder="https://..." value={form.chefAvatar} onChange={(e) => set("chefAvatar", e.target.value)} />
                </Field>
              </div>
              <Field label="Chef Bio">
                <Textarea placeholder="Chef ke baare mein..." value={form.chefBio} onChange={(e) => set("chefBio", e.target.value)} />
              </Field>

              {/* Section: Ingredients */}
              <p className="text-xs font-black uppercase tracking-wider text-orange-500 pt-2">Ingredients</p>
              <Field label="Ingredients" hint='Comma separated with emoji, e.g. "🥩 Beef, 🌿 Herbs, 🧄 Garlic"'>
                <Textarea placeholder="🥩 Beef Patty, 🧀 Cheese, 🥬 Lettuce, 🍅 Tomato" value={form.ingredientsRaw} onChange={(e) => set("ingredientsRaw", e.target.value)} />
              </Field>

              {/* Active toggle */}
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => set("active", !form.active)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? "bg-orange-500" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-medium text-slate-700">{form.active ? "Active (visible on site)" : "Hidden"}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving..." : "Save Slide"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Slide delete karo?</p>
                <p className="text-slate-500 text-sm">Home page se hath jayegi. Yeh action undo nahi ho sakta.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(delId)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors">
                Haan, Delete Karo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
