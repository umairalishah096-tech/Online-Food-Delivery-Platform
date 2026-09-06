import { cn } from "../../lib/utils";

const LoadingSpinner = ({ fullScreen = false, size = "md", text = "" }) => {
  const sizes = { sm: "h-5 w-5 border-2", md: "h-8 w-8 border-[3px]", lg: "h-12 w-12 border-4" };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={cn(sizes[size], "animate-spin rounded-full border-orange-100 border-t-orange-500")} />
      {text && <p className="text-slate-500 text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default LoadingSpinner;
