import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, UtensilsCrossed, Star, Clock } from "lucide-react";
import {
  getCollection, createDocument, updateDocument,
  deleteDocument, COLLECTIONS, where,
} from "../../firebase/firestore";
import { uploadImage } from "../../firebase/storage";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import toast from "react-hot-toast";

const CATEGORY_OPTIONS = [
  { value: "burger", label: "Burgers" },
  { value: "pizza", label: "Pizza" },
  { value: "sushi", label: "Sushi" },
  { value: "indian", label: "Indian" },
  { value: "mexican", label: "Mexican" },
  { value: "chinese", label: "Chinese" },
  { value: "sides", label: "Sides" },
  { value: "desserts", label: "Desserts" },
  { value: "drinks", label: "Drinks" },
];

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "burger",
  restaurantId: "", imageUrl: "", isPopular: false,
  isVeg: false, available: true, prepTime: 15,
};

const AdminMenuItems = () => {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    Promise.all([
      getCollection(COLLECTIONS.MENU_ITEMS),
      getCollection(COLLECTIONS.RESTAURANTS),
    ]).then(([itemData, restData]) => {
      setItems(itemData);
      setRestaurants(restData);
    }).catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = search.toLowerCase();
      const ms = !search || i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q);
      const mc = categoryFilter === "all" || i.category === categoryFilter;
      const mr = restaurantFilter === "all" || i.restaurantId === restaurantFilter;
      return ms && mc && mr;
    });
  }, [items, search, categoryFilter, restaurantFilter]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setImageFile(null); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...EMPTY_FORM, ...item, price: item.price?.toString() || "" });
    setErrors({});
    setImageFile(null);
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) e.price = "Valid price required";
    if (!form.restaurantId) e.restaurantId = "Select a restaurant";
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `menu/${Date.now()}_${imageFile.name}`, setUploadProgress);
      }
      const restaurant = restaurants.find((r) => r.id === form.restaurantId);
      const data = {
        ...form,
        imageUrl,
        price: parseFloat(form.price),
        prepTime: parseInt(form.prepTime) || 15,
        restaurantName: restaurant?.name || "",
      };

      if (editing) {
        await updateDocument(COLLECTIONS.MENU_ITEMS, editing.id, data);
        setItems((prev) => prev.map((i) => i.id === editing.id ? { ...i, ...data } : i));
        toast.success("Menu item updated!");
      } else {
        const id = await createDocument(COLLECTIONS.MENU_ITEMS, data);
        setItems((prev) => [...prev, { id, ...data }]);
        toast.success("Menu item added!");
      }
      setModalOpen(false);
    } catch { toast.error("Failed to save item"); }
    finally { setSaving(false); setUploadProgress(0); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.MENU_ITEMS, deleteModal.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteModal.id));
      toast.success("Item deleted");
      setDeleteModal(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const toggleAvailable = async (item) => {
    await updateDocument(COLLECTIONS.MENU_ITEMS, item.id, { available: !item.available });
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, available: !i.available } : i));
    toast.success(`${item.name} ${!item.available ? "enabled" : "disabled"}`);
  };

  const f = (field) => (e) => { setForm((p) => ({ ...p, [field]: e.target.value })); setErrors((p) => ({ ...p, [field]: "" })); };

  const restOptions = [{ value: "", label: "Select restaurant..." }, ...restaurants.map((r) => ({ value: r.id, label: r.name }))];
  const restFilterOptions = [{ value: "all", label: "All Restaurants" }, ...restaurants.map((r) => ({ value: r.id, label: r.name }))];
  const catFilterOptions = [{ value: "all", label: "All Categories" }, ...CATEGORY_OPTIONS];

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Menu Items</h1>
          <p className="text-slate-500 text-sm mt-0.5">{items.length} total items</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Add Item</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
        </div>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={catFilterOptions} className="sm:w-44" />
        <Select value={restaurantFilter} onChange={(e) => setRestaurantFilter(e.target.value)} options={restFilterOptions} className="sm:w-52" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No menu items found" action={openAdd} actionLabel="Add First Item" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-5 py-3">Item</th>
                  <th className="text-left px-5 py-3">Restaurant</th>
                  <th className="text-left px-5 py-3">Category</th>
                  <th className="text-left px-5 py-3">Price</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-700 text-sm">{item.name}</p>
                            {item.isPopular && <Badge variant="primary" className="text-[10px] px-1.5 py-0">Hot</Badge>}
                            {item.isVeg && <Badge variant="success" className="text-[10px] px-1.5 py-0">Veg</Badge>}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{item.restaurantName || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="capitalize text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800">${item.price?.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleAvailable(item)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          item.available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}>
                        {item.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteModal(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Menu Item" : "Add Menu Item"} size="lg"
        footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editing ? "Save" : "Add Item"}</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Item Name" required value={form.name} onChange={f("name")} error={errors.name} placeholder="e.g. Classic Burger" />
            <Input label="Price ($)" required type="number" value={form.price} onChange={f("price")} error={errors.price} placeholder="0.00" min="0" step="0.01" />
          </div>
          <Textarea label="Description" value={form.description} onChange={f("description")} rows={2} placeholder="Describe this item..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Restaurant" required options={restOptions} value={form.restaurantId} onChange={f("restaurantId")} error={errors.restaurantId} />
            <Select label="Category" options={CATEGORY_OPTIONS} value={form.category} onChange={f("category")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prep Time (minutes)" type="number" value={form.prepTime} onChange={f("prepTime")} min="1" />
            <div />
          </div>

          {/* Image */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">🖼️ Food Item Image</label>

            {/* Live Preview */}
            {(form.imageUrl || imageFile) && (
              <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                  <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-lg">Preview</span>
                </div>
              </div>
            )}

            {/* URL Input — Primary */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">📋 Paste Image URL (Recommended)</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => { setForm(p => ({ ...p, imageUrl: e.target.value })); setImageFile(null); setErrors(p => ({ ...p, imageUrl: "" })); }}
                placeholder="https://images.unsplash.com/photo-... or any image URL"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
              />
              <p className="text-xs text-slate-400 mt-1">Any public image URL (Unsplash, Imgur, etc.) will show on the food card</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">OR upload file</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* File Upload */}
            <input
              type="file" accept="image/*"
              onChange={(e) => { setImageFile(e.target.files?.[0] || null); setForm(p => ({ ...p, imageUrl: "" })); }}
              className="text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
            />
          </div>

          <div className="flex gap-6">
            {[["isPopular", "🔥 Mark as Popular"], ["isVeg", "🌿 Vegetarian"], ["available", "✅ Available"]].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.checked }))} className="accent-orange-500 w-4 h-4" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Item" size="sm"
        footer={<><Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button></>}>
        <p className="text-sm text-slate-600">Delete <strong>{deleteModal?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AdminMenuItems;
