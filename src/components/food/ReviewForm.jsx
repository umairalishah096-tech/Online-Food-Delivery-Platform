import { useState } from "react";
import { Send } from "lucide-react";
import { createDocument, updateDocument, COLLECTIONS, where, getDocs, collection, query } from "../../firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import StarRating from "../ui/StarRating";
import toast from "react-hot-toast";

const ReviewForm = ({ restaurantId, restaurantName, onReviewAdded }) => {
  const { currentUser, userProfile } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Please login to leave a review"); return; }
    if (rating === 0) { toast.error("Please select a star rating"); return; }

    setSubmitting(true);
    try {
      // Check if user already reviewed this restaurant
      const existing = await getDocs(
        query(
          collection(db, COLLECTIONS.REVIEWS),
          where("restaurantId", "==", restaurantId),
          where("userId", "==", currentUser.uid)
        )
      );
      if (!existing.empty) {
        toast.error("You've already reviewed this restaurant");
        setSubmitting(false);
        return;
      }

      const reviewData = {
        restaurantId,
        restaurantName,
        userId: currentUser.uid,
        userDisplayName: userProfile?.displayName || currentUser.email,
        rating,
        comment: comment.trim(),
      };

      const id = await createDocument(COLLECTIONS.REVIEWS, reviewData);
      toast.success("Review submitted! Thank you.");
      onReviewAdded?.({ id, ...reviewData, createdAt: new Date().toISOString() });
      setRating(0);
      setComment("");
    } catch (err) {
      toast.error("Failed to submit review");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center">
        <p className="text-sm text-slate-600 mb-3">Sign in to leave a review</p>
        <a href="/login" className="text-orange-500 font-bold text-sm hover:underline">Login →</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-bold text-slate-800 mb-4">Write a Review</h3>

      {/* Star picker */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-100 text-slate-200"
                }`}
                stroke="currentColor"
                strokeWidth="1"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </button>
          ))}
        </div>
        {(hoverRating || rating) > 0 && (
          <span className="text-sm text-slate-500 font-medium">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || rating]}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        rows={3}
        maxLength={500}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all mb-3"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{comment.length}/500</span>
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
          Submit Review
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
