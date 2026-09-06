import { Link } from "react-router-dom";
import { Users, Award, MapPin, TrendingUp } from "lucide-react";

const TEAM = [
  { name: "Aria Khan", role: "CEO & Co-Founder", emoji: "👩‍💼" },
  { name: "James Carter", role: "CTO", emoji: "👨‍💻" },
  { name: "Priya Sharma", role: "Head of Operations", emoji: "👩‍🔧" },
  { name: "Omar Al-Haddad", role: "Head of Design", emoji: "🎨" },
];

const STATS = [
  { icon: Users, value: "50,000+", label: "Happy Customers", color: "orange" },
  { icon: MapPin, value: "30+", label: "Cities Covered", color: "blue" },
  { icon: Award, value: "500+", label: "Partner Restaurants", color: "green" },
  { icon: TrendingUp, value: "1M+", label: "Orders Delivered", color: "purple" },
];

const About = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-5">
          About <span className="text-orange-400">FoodRush</span>
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          We started with a simple mission: connect great food with hungry people, quickly and reliably.
          Today we're the fastest-growing food delivery platform in the region.
        </p>
      </div>
    </section>

    {/* Stats */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-${color}-50`}>
              <Icon size={22} className={`text-${color}-500`} />
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Story */}
    <section className="bg-orange-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-black text-slate-800 mb-5 text-center">Our Story</h2>
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>
            FoodRush was founded in 2021 when our founders, frustrated with unreliable delivery experiences,
            decided to build something better. Starting with just 10 restaurants in one city, we focused
            obsessively on speed, quality and customer happiness.
          </p>
          <p>
            Today, FoodRush serves over 50,000 customers across 30+ cities, partnering with 500+ restaurants
            ranging from neighbourhood gems to major chains. Our average delivery time is 28 minutes —
            and we're always pushing it lower.
          </p>
          <p>
            We believe everyone deserves access to great food, delivered with care. That's why we invest
            heavily in our delivery partners, ensuring fair pay and excellent working conditions.
          </p>
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-black text-slate-800 mb-8 text-center">Meet the Team</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {TEAM.map(({ name, role, emoji }) => (
          <div key={name} className="text-center bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="text-5xl mb-3">{emoji}</div>
            <h3 className="font-bold text-slate-800 text-sm">{name}</h3>
            <p className="text-xs text-slate-500 mt-1">{role}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="bg-orange-500 py-14 px-4 text-white text-center">
      <h2 className="text-2xl font-black mb-3">Join the FoodRush Family</h2>
      <p className="text-orange-100 mb-6 text-sm max-w-md mx-auto">
        Whether you're a hungry customer, a restaurant owner, or a delivery partner — there's a place for you.
      </p>
      <Link
        to="/register"
        className="inline-block px-8 py-3 bg-white text-orange-500 font-bold rounded-2xl hover:bg-orange-50 transition-colors"
      >
        Get Started Free
      </Link>
    </section>
  </div>
);

export default About;
