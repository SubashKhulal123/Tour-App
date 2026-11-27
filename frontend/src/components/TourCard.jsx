import { CalendarDays, Heart, MapPin, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

const TourCard = ({ tour, onWishlistToggle, wishlisted = false }) => (
  <article className="tour-card">
    <Link to={`/tours/${tour._id}`} className="tour-image-link" aria-label={`View ${tour.title}`}>
      <img src={tour.images?.[0]} alt={tour.title} className="tour-image" />
    </Link>
    <div className="tour-card-body">
      <div className="tour-meta-line">
        <span>
          <MapPin size={16} aria-hidden="true" />
          {tour.location}
        </span>
        {onWishlistToggle ? (
          <button
            className={`icon-button heart-button ${wishlisted ? "active" : ""}`}
            type="button"
            onClick={() => onWishlistToggle(tour)}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={18} />
          </button>
        ) : null}
      </div>
      <h3>{tour.title}</h3>
      <p>{tour.description}</p>
      <div className="tour-facts">
        <span>
          <CalendarDays size={16} aria-hidden="true" />
          {tour.duration} days
        </span>
        <span>
          <UsersRound size={16} aria-hidden="true" />
          Max {tour.maxGroupSize}
        </span>
      </div>
      <div className="tour-card-footer">
        <strong>${tour.price}</strong>
        <Link className="secondary-button" to={`/tours/${tour._id}`}>
          Details
        </Link>
      </div>
    </div>
  </article>
);

export default TourCard;

