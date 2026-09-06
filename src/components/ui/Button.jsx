import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer",
  {
    variants: {
      variant: {
        default:     "bg-orange-500 text-white shadow-sm shadow-orange-200/60 hover:bg-orange-600",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        danger:      "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline:     "border-2 border-orange-500 text-orange-500 bg-transparent hover:bg-orange-50",
        secondary:   "bg-slate-800 text-white hover:bg-slate-900",
        ghost:       "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link:        "text-orange-500 underline-offset-4 hover:underline",
        success:     "bg-green-500 text-white hover:bg-green-600 shadow-sm",
        muted:       "bg-slate-100 text-slate-700 hover:bg-slate-200",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm:      "h-8 px-3 py-1.5 text-xs rounded-lg",
        lg:      "h-12 px-7 py-3 text-base rounded-2xl",
        xl:      "h-14 px-9 text-lg rounded-2xl",
        icon:    "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, icon: Icon, iconPosition = "left", children, fullWidth, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), fullWidth && "w-full", className)}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon size={15} />}
            {children}
            {Icon && iconPosition === "right" && <Icon size={15} />}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
