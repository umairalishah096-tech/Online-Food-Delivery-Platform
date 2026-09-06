import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, UtensilsCrossed, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      toast.success("Reset email sent!");
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account found with this email"
          : "Failed to send reset email. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2" />

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

          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Check your inbox</h2>
              <p className="text-slate-500 text-sm mb-1">
                We sent a password reset link to:
              </p>
              <p className="font-bold text-slate-700 text-sm mb-6">{email}</p>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Didn't receive it? Check your spam folder or wait a few minutes.
                You can request another link below.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-orange-500 font-semibold hover:text-orange-600 underline underline-offset-2"
              >
                Resend reset email
              </button>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-orange-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-1">Forgot Password?</h1>
                <p className="text-slate-500 text-sm">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all
                        focus:outline-none focus:ring-2
                        ${error
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                        }`}
                    />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
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
                    <>Send Reset Link <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
