import { useState, useEffect, useMemo } from "react";
import { Search, Shield, User, Mail, Phone, Calendar } from "lucide-react";
import { getCollection, updateDocument, COLLECTIONS, orderBy } from "../../firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    getCollection(COLLECTIONS.USERS, [orderBy("createdAt", "desc")])
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const ms = !search || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const mr = roleFilter === "all" || u.role === roleFilter;
      return ms && mr;
    });
  }, [users, search, roleFilter]);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setUpdatingRole(true);
    try {
      await updateDocument(COLLECTIONS.USERS, user.uid || user.id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === user.id) setSelectedUser((p) => ({ ...p, role: newRole }));
      toast.success(`${user.displayName} is now ${newRole === "admin" ? "an Admin" : "a User"}`);
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdatingRole(false);
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role !== "admin").length;

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Users</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {users.length} total · {adminCount} admin{adminCount !== 1 ? "s" : ""} · {userCount} customer{userCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
        </div>
        <div className="flex gap-2">
          {[["all", "All"], ["user", "Customers"], ["admin", "Admins"]].map(([val, label]) => (
            <button key={val} onClick={() => setRoleFilter(val)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                roleFilter === val ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={User} title="No users found" description="No users match your search." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Phone</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-semibold text-slate-700">{user.displayName || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{user.email}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{user.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={user.role === "admin" ? "purple" : "default"} dot>
                        {user.role === "admin" ? "Admin" : "Customer"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedUser(user)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          View
                        </button>
                        <button onClick={() => toggleRole(user)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            user.role === "admin"
                              ? "bg-red-50 text-red-500 hover:bg-red-100"
                              : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                          }`}>
                          {user.role === "admin" ? "Remove Admin" : "Make Admin"}
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

      {/* User detail modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="sm">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-black mb-3">
                {selectedUser.displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{selectedUser.displayName}</h3>
              <Badge variant={selectedUser.role === "admin" ? "purple" : "default"} dot className="mt-1">
                {selectedUser.role === "admin" ? "Admin" : "Customer"}
              </Badge>
            </div>

            {[
              { icon: Mail, label: "Email", value: selectedUser.email },
              { icon: Phone, label: "Phone", value: selectedUser.phone || "Not provided" },
              { icon: User, label: "Address", value: selectedUser.address || "Not provided" },
              { icon: Calendar, label: "Joined", value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-700">{value}</p>
                </div>
              </div>
            ))}

            <Button
              onClick={() => toggleRole(selectedUser)}
              loading={updatingRole}
              variant={selectedUser.role === "admin" ? "danger" : "primary"}
              icon={Shield}
              fullWidth
            >
              {selectedUser.role === "admin" ? "Remove Admin Role" : "Grant Admin Role"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
