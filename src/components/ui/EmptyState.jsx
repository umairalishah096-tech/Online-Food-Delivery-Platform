import { Button } from "./Button";
import { cn } from "../../lib/utils";

const EmptyState = ({ icon: Icon, title, description, action, actionLabel, className }) => (
  <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center", className)}>
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 shadow-sm">
        <Icon size={30} className="text-orange-300" />
      </div>
    )}
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    {description && <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>}
    {action && actionLabel && <Button onClick={action}>{actionLabel}</Button>}
  </div>
);

export default EmptyState;
