import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Textarea = forwardRef(({ label, error, rows = 4, className, containerClass, required, ...props }, ref) => (
  <div className={cn("flex flex-col gap-1.5", containerClass)}>
    {label && (
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all resize-none",
        "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-red-400" : "border-slate-200",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";

export default Textarea;
