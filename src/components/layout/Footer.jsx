import { Link } from "react-router-dom";
import { UtensilsCrossed, Mail, Phone, MapPin } from "lucide-react";

const SocialIcon = ({ href, label, children }) => (
  <a
    href={href}
    aria-label={label}
    className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-400 hover:bg-slate-700 transition-colors"
  >
    {children}
  </a>
);

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-white">
              Food<span className="text-orange-400">Rush</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 mb-5">
            Delivering the best food from the finest restaurants to your doorstep, fast and fresh.
          </p>
          <div className="flex gap-3">
            <SocialIcon href="#" label="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </SocialIcon>
            <SocialIcon href="#" label="Twitter">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </SocialIcon>
            <SocialIcon href="#" label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </SocialIcon>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { to: "/", label: "Home" },
              { to: "/restaurants", label: "Restaurants" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-slate-400 hover:text-orange-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Account</h4>
          <ul className="space-y-2.5">
            {[
              { to: "/register", label: "Sign Up" },
              { to: "/login", label: "Login" },
              { to: "/orders", label: "Order History" },
              { to: "/profile", label: "Profile" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-slate-400 hover:text-orange-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-3">
            {[
              { Icon: MapPin, text: "123 Food Street, Karachi, Pakistan" },
              { Icon: Phone, text: "+92 300 123 4567" },
              { Icon: Mail, text: "hello@foodrush.pk" },
            ].map(({ Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <Icon size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">© 2026 FoodRush. All rights reserved.</p>
        <div className="flex gap-5">
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
            <a key={t} href="#" className="text-xs text-slate-500 hover:text-orange-400 transition-colors">
              {t}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
