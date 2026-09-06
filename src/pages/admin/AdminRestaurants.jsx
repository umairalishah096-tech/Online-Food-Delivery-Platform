import { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, Edit2, Trash2, Store,
  Star, Clock, Bike, ToggleLeft, ToggleRight,
} from "lucide-react";
import {
  getCollection, createDocument, updateDocument,
  deleteDocument, COLLECTIONS, setDocument,
} from "../../firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Badge from "../../components/ui/Badge";
import { uploadImage } from "../../firebase/storage";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "", cuisine: "", description: "", address: "", phone: "",
  deliveryTime: "25-35", deliveryFee: 0, minOrder: 10,
  isOpen: true, imageUrl: "", tags: "",
};

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getCollection(COLLECTIONS.RESTAURANTS);
      setRestaurants(data);
    } catch { toast.error("Failed to load restaurants"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = useMemo(() =>
    restaurants.filter((r) =>
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(search.toLowerCase())
    ), [restaurants, search]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setImageFile(null); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ ...EMPTY_FORM, ...r, tags: r.tags?.join(", ") || "" });
    setErrors({});
    setImageFile(null);
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.cuisine.trim()) e.cuisine = "Cuisine is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (isNaN(form.deliveryFee) || form.deliveryFee < 0) e.deliveryFee = "Must be 0 or more";
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `restaurants/${Date.now()}_${imageFile.name}`, setUploadProgress);
      }
      const data = {
        ...form,
        imageUrl,
        deliveryFee: parseFloat(form.deliveryFee) || 0,
        minOrder: parseFloat(form.minOrder) || 0,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        rating: editing?.rating || 0,
        reviewCount: editing?.reviewCount || 0,
      };

      if (editing) {
        await updateDocument(COLLECTIONS.RESTAURANTS, editing.id, data);
        setRestaurants((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...data } : r));
        toast.success("Restaurant updated!");
      } else {
        const id = await createDocument(COLLECTIONS.RESTAURANTS, data);
        setRestaurants((prev) => [...prev, { id, ...data }]);
        toast.success("Restaurant added!");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to save restaurant");
    } finally { setSaving(false); setUploadProgress(0); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.RESTAURANTS, deleteModal.id);
      setRestaurants((prev) => prev.filter((r) => r.id !== deleteModal.id));
      toast.success("Restaurant deleted");
      setDeleteModal(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const toggleOpen = async (r) => {
    await updateDocument(COLLECTIONS.RESTAURANTS, r.id, { isOpen: !r.isOpen });
    setRestaurants((prev) => prev.map((x) => x.id === r.id ? { ...x, isOpen: !x.isOpen } : x));
    toast.success(`${r.name} is now ${!r.isOpen ? "open" : "closed"}`);
  };

  const f = (field) => (e) => { setForm((p) => ({ ...p, [field]: e.target.value })); setErrors((p) => ({ ...p, [field]: "" })); };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Restaurants</h1>
          <p className="text-slate-500 text-sm mt-0.5">{restaurants.length} restaurants</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Add Restaurant</Button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search restaurants..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Store} title="No restaurants found" action={openAdd} actionLabel="Add First Restaurant" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="relative h-36 bg-slate-100">
                {r.imageUrl
                  ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">🍴</div>}
                <button
                  onClick={() => toggleOpen(r)}
                  className={`absolute top-2 right-2 p-1.5 rounded-xl ${r.isOpen ? "bg-green-500" : "bg-slate-400"} text-white transition-colors`}
                  title={r.isOpen ? "Click to close" : "Click to open"}
                >
                  {r.isOpen ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 text-sm">{r.name}</h3>
                  <Badge variant={r.isOpen ? "success" : "danger"} dot>{r.isOpen ? "Open" : "Closed"}</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-2">{r.cuisine}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" />{r.rating?.toFixed(1) || "New"}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{r.deliveryTime} min</span>
                  <span className="flex items-center gap-1"><Bike size={11} />${r.deliveryFee}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(r)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteModal(r)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-red-100 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Restaurant" : "Add Restaurant"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? "Save Changes" : "Add Restaurant"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Restaurant Name" required value={form.name} onChange={f("name")} error={errors.name} placeholder="e.g. Burger Palace" />
            <Input label="Cuisine Type" required value={form.cuisine} onChange={f("cuisine")} error={errors.cuisine} placeholder="e.g. American • Burgers" />
          </div>
          <Textarea label="Description" value={form.description} onChange={f("description")} rows={2} placeholder="Describe the restaurant..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Address" required value={form.address} onChange={f("address")} error={errors.address} placeholder="123 Street, City" />
            <Input label="Phone" value={form.phone} onChange={f("phone")} placeholder="+1 555-0000" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Delivery Time" value={form.deliveryTime} onChange={f("deliveryTime")} placeholder="25-35" />
            <Input label="Delivery Fee ($)" type="number" value={form.deliveryFee} onChange={f("deliveryFee")} error={errors.deliveryFee} min="0" step="0.5" />
            <Input label="Min Order ($)" type="number" value={form.minOrder} onChange={f("minOrder")} min="0" />
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={f("tags")} placeholder="Popular, Free Delivery, New" />

          {/* Image upload */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">🖼️ Restaurant Cover Image</label>

            {/* Live preview */}
            {(form.imageUrl || imageFile) && (
              <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200">
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

            {/* URL Input — Primary option */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">📋 Paste Image URL (Recommended)</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => { setForm(p => ({ ...p, imageUrl: e.target.value })); setImageFile(null); }}
                placeholder="https://images.unsplash.com/photo-... or any image URL"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
              />
              <p className="text-xs text-slate-400 mt-1">Unsplash, Imgur, or any public image link works perfectly</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">OR upload file</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* File Upload */}
            <div>
              <input
                type="file" accept="image/*"
                onChange={(e) => { setImageFile(e.target.files?.[0] || null); setForm(p => ({ ...p, imageUrl: "" })); }}
                className="text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isOpen} onChange={(e) => setForm((p) => ({ ...p, isOpen: e.target.checked }))} className="accent-orange-500 w-4 h-4" />
            <span className="text-sm font-medium text-slate-700">Restaurant is Open</span>
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Restaurant"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminRestaurants;
