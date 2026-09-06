import { cn } from "../../lib/utils";

// Clean SVG icon components — no emoji
const PizzaIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/>
    <path d="M12 2a10 10 0 0 1 10 10L12 12z"/>
    <path d="M12 12 2.4 19.2"/>
    <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="14" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const BurgerIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11h18"/>
    <path d="M3 15h18"/>
    <path d="M5 7h14a2 2 0 0 1 2 2H3a2 2 0 0 1 2-2z"/>
    <path d="M3 15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2"/>
  </svg>
);

const SushiIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="10" ry="6"/>
    <ellipse cx="12" cy="12" rx="6" ry="3"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);

const CurryIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19h16"/>
    <path d="M4 15c0-4 2-7 8-7s8 3 8 7"/>
    <path d="M9 8c0-1.5 1.5-3 3-3s3 1.5 3 3"/>
    <path d="M12 5V3"/>
  </svg>
);

const TacoIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17c0-5 4-10 9-10s9 5 9 10H3z"/>
    <path d="M7 17c1-3 3-5 5-5s4 2 5 5"/>
    <path d="M9 12c0-1.1.9-2 2-2s2 .9 2 2"/>
  </svg>
);

const PastaIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15a8 8 0 0 1 16 0"/>
    <path d="M4 15h16"/>
    <path d="M4 15v4h16v-4"/>
    <path d="M9 10c0-2 1-3 3-5"/>
    <path d="M12 5c0 2 1 3 3 5"/>
  </svg>
);

const NoodleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12c0 4 2 7 8 7s8-3 8-7"/>
    <path d="M4 9h16"/>
    <path d="M8 5c0 2 8 2 8 0"/>
    <path d="M6 9c0-2 1-4 2-4s2 2 2 4"/>
    <path d="M14 9c0-2 1-4 2-4s2 2 2 4"/>
  </svg>
);

const CakeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/>
    <path d="M2 21h20"/>
    <path d="M7 8v2"/>
    <path d="M12 8v2"/>
    <path d="M17 8v2"/>
    <path d="M7 4l.5 4"/>
    <path d="M12 4v4"/>
    <path d="M17 4l-.5 4"/>
  </svg>
);

const DrinkIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2h8l-1 7H9z"/>
    <path d="M9 9c0 5 6 5 6 10v1H9v-1c0-5 6-5 6-10"/>
    <path d="M7 21h10"/>
  </svg>
);

const AllIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const CATEGORIES = [
  { id: "all",      label: "All",      Icon: AllIcon,    color: "text-slate-600" },
  { id: "pizza",    label: "Pizza",    Icon: PizzaIcon,  color: "text-red-500" },
  { id: "burger",   label: "Burgers",  Icon: BurgerIcon, color: "text-amber-600" },
  { id: "sushi",    label: "Sushi",    Icon: SushiIcon,  color: "text-pink-500" },
  { id: "indian",   label: "Indian",   Icon: CurryIcon,  color: "text-orange-500" },
  { id: "mexican",  label: "Mexican",  Icon: TacoIcon,   color: "text-green-600" },
  { id: "italian",  label: "Italian",  Icon: PastaIcon,  color: "text-yellow-600" },
  { id: "chinese",  label: "Chinese",  Icon: NoodleIcon, color: "text-red-600" },
  { id: "desserts", label: "Desserts", Icon: CakeIcon,   color: "text-purple-500" },
  { id: "drinks",   label: "Drinks",   Icon: DrinkIcon,  color: "text-blue-500" },
];

const CategoryFilter = ({ active = "all", onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
    {CATEGORIES.map(({ id, label, Icon, color }) => {
      const isActive = active === id;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all duration-200 border",
            isActive
              ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200/50"
              : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50"
          )}
        >
          <span className={cn("transition-colors", isActive ? "text-white" : color)}>
            <Icon />
          </span>
          {label}
        </button>
      );
    })}
  </div>
);

export default CategoryFilter;
