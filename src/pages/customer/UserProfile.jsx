import { useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { uploadImage } from "../../firebase/storage";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../../firebase/config";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();

  const [profile, setProfile] = useState({
    displayName: userProfile?.displayName || "",
    phone: userProfile?.phone || "",
    address: userProfile?.address || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false });
  const [passErrors, setPassErrors] = useState({});
  const [savingPass, setSavingPass] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateProfile = () => {
    const e = {};
    if (!profile.displayName.trim() || profile.displayName.trim().length < 2)
      e.displayName = "Name must be at least 2 characters";
    if (profile.phone && !/^[+\d\s\-()]{7,15}$/.test(profile.phone))
      e.phone = "Enter a valid phone number";
    return e;
  };

  const handleSaveProfile = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    setSavingProfile(true);
    try {
      await updateUserProfile(profile);
      await updateProfile(currentUser, { displayName: profile.displayName });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePasswords = () => {
    const e = {};
    if (!passwords.current) e.current = "Current password is required";
    if (!passwords.newPass || passwords.newPass.length < 8) e.newPass = "New password must be at least 8 characters";
    if (passwords.newPass !== passwords.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleChangePassword = async () => {
    const errs = validatePasswords();
    if (Object.keys(errs).length) { setPassErrors(errs); return; }

    setSavingPass(true);
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, passwords.current);
      await reauthenticateWithCredential(currentUser, cred);
      await updatePassword(currentUser, passwords.newPass);
      toast.success("Password changed successfully!");
      setPasswords({ current: "", newPass: "", confirm: "" });
      setPassErrors({});
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setPassErrors({ current: "Current password is incorrect" });
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setSavingPass(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }

    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadImage(
        file,
        `avatars/${currentUser.uid}`,
        (p) => setUploadProgress(p)
      );
      await updateUserProfile({ photoURL: url });
      await updateProfile(currentUser, { photoURL: url });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const toggleShow = (field) => setShowPasswords((p) => ({ ...p, [field]: !p[field] }));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black text-slate-800 mb-8">Profile Settings</h1>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <User size={18} className="text-orange-500" /> Profile Photo
        </h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-black">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                userProfile?.displayName?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors border-2 border-white">
              <Camera size={12} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="font-bold text-slate-800">{userProfile?.displayName}</p>
            <p className="text-sm text-slate-500">{currentUser?.email}</p>
            {uploading && (
              <div className="mt-2">
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Uploading {uploadProgress}%...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <h2 className="font-bold text-slate-800 mb-5">Personal Information</h2>
        <div className="space-y-4">
          <Input
            label="Full Name"
            required
            icon={User}
            value={profile.displayName}
            onChange={(e) => { setProfile((p) => ({ ...p, displayName: e.target.value })); setProfileErrors((p) => ({ ...p, displayName: "" })); }}
            error={profileErrors.displayName}
            placeholder="John Doe"
          />
          <Input
            label="Email Address"
            icon={Mail}
            value={currentUser?.email || ""}
            disabled
            hint="Email cannot be changed"
          />
          <Input
            label="Phone Number"
            icon={Phone}
            type="tel"
            value={profile.phone}
            onChange={(e) => { setProfile((p) => ({ ...p, phone: e.target.value })); setProfileErrors((p) => ({ ...p, phone: "" })); }}
            error={profileErrors.phone}
            placeholder="+92 300 123 4567"
          />
          <Input
            label="Default Delivery Address"
            icon={MapPin}
            value={profile.address}
            onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
            placeholder="123 Main Street, City"
          />
          <Button onClick={handleSaveProfile} loading={savingProfile} icon={Save} fullWidth>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Change Password */}
      {currentUser?.providerData?.[0]?.providerId === "password" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Lock size={18} className="text-orange-500" /> Change Password
          </h2>
          <div className="space-y-4">
            {[
              { field: "current", label: "Current Password", placeholder: "Enter current password" },
              { field: "newPass", label: "New Password", placeholder: "At least 8 characters" },
              { field: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
            ].map(({ field, label, placeholder }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPasswords[field] ? "text" : "password"}
                    value={passwords[field]}
                    onChange={(e) => { setPasswords((p) => ({ ...p, [field]: e.target.value })); setPassErrors((p) => ({ ...p, [field]: "" })); }}
                    placeholder={placeholder}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      passErrors[field] ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  <button type="button" onClick={() => toggleShow(field)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPasswords[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passErrors[field] && <p className="text-xs text-red-500">{passErrors[field]}</p>}
              </div>
            ))}
            <Button onClick={handleChangePassword} loading={savingPass} icon={Lock} variant="secondary" fullWidth>
              Change Password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
