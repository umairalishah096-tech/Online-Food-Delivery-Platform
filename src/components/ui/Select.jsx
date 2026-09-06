import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const Select = forwardRef(({ label, error, options = [], className, containerClass, required, ...props }, ref) => (
  <div className={cn("flex flex-col gap-1.5", containerClass)}>
    {label && (
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full appearance-none rounded-xl border bg-white px-4 pr-10 py-2 text-sm text-slate-800 shadow-sm transition-all",
          "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-400" : "border-slate-200",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Select.displayName = "Select";

export default Select;
