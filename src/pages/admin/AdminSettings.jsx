import { useState } from "react";
import { Database, Trash2, RefreshCw, CheckCircle, AlertTriangle, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { seedAll } from "../../hooks/useSeedData";
import { getCollection, deleteDocument, COLLECTIONS } from "../../firebase/firestore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [adminForm, setAdminForm] = useState({
    displayName: userProfile?.displayName || "",
    email: userProfile?.email || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await seedAll();
      if (result.skipped) {
        setSeedResult({ type: "info", msg: "Data already seeded. Delete existing data first to re-seed." });
        toast("Data already exists", { icon: "ℹ️" });
      } else {
        setSeedResult({ type: "success", msg: `✅ Seeded ${result.seeded} restaurants and ${result.menuItems} menu items.` });
        toast.success(`Seeded ${result.seeded} restaurants!`);
      }
    } catch (err) {
      setSeedResult({ type: "error", msg: `Error: ${err.message}` });
      toast.error("Seeding failed");
    } finally {
      setSeeding(false);
    }
  };

  const handleClearOrders = async () => {
    if (!window.confirm("Delete ALL orders? This cannot be undone.")) return;
    setClearing(true);
    try {
      const orders = await getCollection(COLLECTIONS.ORDERS);
      await Promise.all(orders.map((o) => deleteDocument(COLLECTIONS.ORDERS, o.id)));
      toast.success(`Deleted ${orders.length} orders`);
    } catch {
      toast.error("Failed to clear orders");
    } finally {
      setClearing(false);
    }
  };

  const handleSaveAdmin = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ displayName: adminForm.displayName });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your admin account and application data</p>
      </div>

      {/* Admin Profile */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Settings size={18} className="text-orange-500" /> Admin Profile
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
              {userProfile?.displayName?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-bold text-slate-800">{userProfile?.displayName}</p>
              <p className="text-sm text-slate-500">{userProfile?.email}</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>
            </div>
          </div>
          <Input
            label="Display Name"
            value={adminForm.displayName}
            onChange={(e) => setAdminForm((p) => ({ ...p, displayName: e.target.value }))}
            placeholder="Admin Name"
          />
          <Input label="Email" value={adminForm.email} disabled hint="Email cannot be changed here" />
          <Button onClick={handleSaveAdmin} loading={saving} fullWidth>Save Profile</Button>
        </div>
      </div>

      {/* Seed Data */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Database size={18} className="text-blue-500" /> Sample Data
        </h2>
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          Populate Firestore with 6 sample restaurants and 28+ menu items to see the platform in action.
          Only runs once — skips if data already exists.
        </p>

        {seedResult && (
          <div className={`flex items-start gap-3 rounded-xl p-4 mb-4 text-sm ${
            seedResult.type === "success" ? "bg-green-50 border border-green-200 text-green-700" :
            seedResult.type === "info" ? "bg-blue-50 border border-blue-200 text-blue-700" :
            "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {seedResult.type === "success" ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />}
            {seedResult.msg}
          </div>
        )}

        <Button
          icon={Database}
          onClick={handleSeed}
          loading={seeding}
          variant="secondary"
          fullWidth
        >
          {seeding ? "Seeding data..." : "Seed Sample Restaurants & Menu"}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h2 className="font-bold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle size={18} /> Danger Zone
        </h2>
        <p className="text-sm text-slate-500 mb-5">These actions are permanent and cannot be undone.</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
            <div>
              <p className="text-sm font-semibold text-slate-700">Clear All Orders</p>
              <p className="text-xs text-slate-500">Permanently delete all orders from Firestore</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleClearOrders}
              loading={clearing}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Firebase info */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-600 mb-2">🔥 Firebase Configuration</p>
        <p>Project: <span className="font-mono text-slate-700">project-29c01</span></p>
        <p>Auth: <span className="text-green-600 font-semibold">✓ Connected</span></p>
        <p>Firestore: <span className="text-green-600 font-semibold">✓ Connected</span></p>
        <p>Storage: <span className="text-green-600 font-semibold">✓ Connected</span></p>
      </div>
    </div>
  );
};

export default AdminSettings;
