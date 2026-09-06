import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(
  ({ className, label, error, hint, icon: Icon, iconRight: IconRight, containerClass, required, type = "text", ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5", containerClass)}>
        {label && (
          <label className="text-sm font-medium text-slate-700">
            {label}{required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon size={15} />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-0 focus:border-orange-400",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
              Icon && "pl-10",
              IconRight && "pr-10",
              error ? "border-red-400 focus:ring-red-300" : "border-slate-200",
              className
            )}
            {...props}
          />
          {IconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <IconRight size={15} />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
export default Input;
