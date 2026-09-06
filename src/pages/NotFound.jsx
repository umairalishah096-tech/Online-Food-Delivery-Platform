import { Link } from "react-router-dom";
import { Home, UtensilsCrossed } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
    <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
      <UtensilsCrossed size={48} className="text-orange-400" />
    </div>
    <h1 className="text-8xl font-black text-slate-200 mb-2">404</h1>
    <h2 className="text-2xl font-bold text-slate-800 mb-3">Page Not Found</h2>
    <p className="text-slate-500 mb-8 max-w-sm">
      Looks like this page went out for delivery and never came back.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
    >
      <Home size={18} /> Back to Home
    </Link>
  </div>
);

export default NotFound;
