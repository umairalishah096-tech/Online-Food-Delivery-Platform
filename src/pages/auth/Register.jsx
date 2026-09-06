import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Lock, User, UtensilsCrossed,
  ArrowRight, CheckCircle, ArrowLeft
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains a number", test: (p) => /\d/.test(p) },
  { label: "Contains a letter", test: (p) => /[a-zA-Z]/.test(p) },
];

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.displayName.trim() || form.displayName.trim().length < 2)
      e.displayName = "Full name must be at least 2 characters";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password || form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!agreed)
      e.agreed = "You must agree to the terms";
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "", general: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form.email.trim(), form.password, form.displayName.trim());
      toast.success("Account created! Welcome to FoodRush 🎉");
      navigate("/");
    } catch (err) {
      const msg =
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists"
          : err.code === "auth/weak-password"
          ? "Password is too weak"
          : "Registration failed. Please try again.";
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome to FoodRush!");
      navigate("/");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][passwordStrength] || "";
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][passwordStrength] || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium z-10"
      >
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
              <UtensilsCrossed size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-800">
              Food<span className="text-orange-500">Rush</span>
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-800 text-center mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm text-center mb-8">
            Join 50,000+ food lovers on FoodRush
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 rounded-2xl
              text-sm font-semibold text-slate-700 hover:border-orange-300 hover:bg-orange-50
              transition-all duration-200 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {errors.general}
              </div>
            )}

            {/* Full Name */}
            <FieldGroup label="Full Name" required error={errors.displayName}>
              <InputWithIcon
                icon={User}
                type="text"
                value={form.displayName}
                onChange={handleChange("displayName")}
                placeholder="John Doe"
                autoComplete="name"
                hasError={!!errors.displayName}
              />
            </FieldGroup>

            {/* Email */}
            <FieldGroup label="Email Address" required error={errors.email}>
              <InputWithIcon
                icon={Mail}
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                autoComplete="email"
                hasError={!!errors.email}
              />
            </FieldGroup>

            {/* Password */}
            <FieldGroup label="Password" required error={errors.password}>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-all
                    focus:outline-none focus:ring-2
                    ${errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          n <= passwordStrength ? strengthColor : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {PASSWORD_RULES.map(({ label, test }) => (
                      <span
                        key={label}
                        className={`flex items-center gap-1 text-xs ${
                          test(form.password) ? "text-green-600" : "text-slate-400"
                        }`}
                      >
                        <CheckCircle size={10} className={test(form.password) ? "text-green-500" : "text-slate-300"} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </FieldGroup>

            {/* Confirm Password */}
            <FieldGroup label="Confirm Password" required error={errors.confirmPassword}>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-all
                    focus:outline-none focus:ring-2
                    ${errors.confirmPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : form.confirmPassword && form.password === form.confirmPassword
                      ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FieldGroup>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }}
                  className="mt-0.5 accent-orange-500 w-4 h-4 flex-shrink-0"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-orange-500 font-semibold hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-orange-500 font-semibold hover:underline">Privacy Policy</a>
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl
                transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldGroup = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const InputWithIcon = ({ icon: Icon, hasError, ...props }) => (
  <div className="relative">
    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all
        focus:outline-none focus:ring-2
        ${hasError
          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
        }`}
      {...props}
    />
  </div>
);

export default Register;
