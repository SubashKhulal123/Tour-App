import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './common/ToastNotification';
import Button from './common/Button';
import { apiRequest } from '../api/client';

const ReviewSection = ({ tour, reviews = [] }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast("Please login to leave a review", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest(`/reviews`, {
        method: 'POST',
        body: {
          tour: tour._id,
          rating: Number(rating),
          review: reviewText
        }
      });
      setLocalReviews([response.data.review, ...localReviews]);
      setReviewText("");
      setRating(5);
      addToast("Review submitted successfully!", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-section" style={{ marginTop: '40px' }}>
      <h2>Reviews ({localReviews.length})</h2>
      
      {isAuthenticated && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '32px' }}>
          <h3>Leave a Review</h3>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Rating (1-5)</label>
            <input 
              type="number" 
              min="1" max="5" 
              value={rating} 
              onChange={(e) => setRating(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Your Review</label>
            <textarea 
              rows="4" 
              value={reviewText} 
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              required
            />
          </div>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      <div className="reviews-list" style={{ display: 'grid', gap: '20px' }}>
        {localReviews.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No reviews yet. Book this tour to be the first!</p>
        ) : (
          localReviews.map(r => (
            <div key={r._id} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--surface-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {r.user?.photo ? (
                    <img src={r.user.photo} alt={r.user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {r.user?.name?.charAt(0)}
                    </div>
                  )}
                  {r.user?.name}
                </strong>
                <span style={{ background: 'var(--teal-dark)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  ★ {r.rating}
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--ink)' }}>{r.review}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
