import { cn } from "../../lib/utils";

const StarRating = ({ rating = 0, maxStars = 5, size = 16, interactive = false, onRate, className }) => (
  <div className={cn("flex items-center gap-0.5", className)}>
    {Array.from({ length: maxStars }, (_, i) => {
      const filled = i < Math.floor(rating);
      const half   = !filled && i < rating;
      return (
        <button key={i} type="button" disabled={!interactive}
          onClick={() => interactive && onRate?.(i + 1)}
          className={cn(interactive && "cursor-pointer hover:scale-110 transition-transform", "outline-none")}>
          <svg viewBox="0 0 24 24" width={size} height={size}
            fill={filled ? "#fbbf24" : half ? "#fde68a" : "#f1f5f9"}
            stroke={filled || half ? "#fbbf24" : "#e2e8f0"}
            strokeWidth="1.2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </button>
      );
    })}
  </div>
);

export default StarRating;
