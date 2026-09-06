import { Search, X } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
        focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

export default SearchBar;
