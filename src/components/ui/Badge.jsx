import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-orange-100 text-orange-700",
        primary:     "bg-orange-100 text-orange-700",
        secondary:   "bg-slate-100 text-slate-700",
        destructive: "bg-red-100 text-red-700",
        danger:      "bg-red-100 text-red-700",
        success:     "bg-green-100 text-green-700",
        warning:     "bg-amber-100 text-amber-700",
        info:        "bg-blue-100 text-blue-700",
        purple:      "bg-purple-100 text-purple-700",
        outline:     "border border-slate-200 text-slate-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, dot, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
export default Badge;
