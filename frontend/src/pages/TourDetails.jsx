import { CalendarDays, Heart, MapPin, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createBooking, createCheckoutSession } from "../api/bookings";
import { getTour } from "../api/tours";
import { addToWishlist, getWishlist, removeFromWishlist } from "../api/users";
import SkeletonLoader from "../components/common/SkeletonLoader";
import Button from "../components/common/Button";
import { useToast } from "../components/common/ToastNotification";
import ReviewSection from "../components/ReviewSection";
import { useAuth } from "../context/AuthContext";

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [tour, setTour] = useState(null);
  const [people, setPeople] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTour = async () => {
      setLoading(true);
      try {
        const response = await getTour(id);
        setTour(response.data.tour);
        setPeople(1);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadWishlist = async () => {
      const response = await getWishlist();
      setWishlisted(response.data.tours.some((item) => item._id === id));
    };

    loadWishlist().catch(() => setWishlisted(false));
  }, [id, isAuthenticated]);

  const totalPrice = useMemo(() => (tour ? Number(people) * tour.price : 0), [people, tour]);

  const handleBooking = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/tours/${id}` } });
      return;
    }

    try {
      const response = await createBooking({ tourId: id, numberOfPeople: Number(people) });
      addToast("Booking submitted! Redirecting to eSewa payment...", "success");
      
      const esewaData = response?.data?.esewa;
      if (esewaData) {
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
        for (const key in esewaData) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", esewaData[key]);
          form.appendChild(hiddenField);
        }
        document.body.appendChild(form);
        form.submit();
      } else {
        addToast("Payment data missing. Please contact support.", "error");
      }
    } catch (requestError) {
      addToast(requestError.message, "error");
    }
  };

  const handleStripeCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/tours/${id}` } });
      return;
    }
    try {
      addToast("Redirecting to Stripe checkout...", "info");
      const response = await createCheckoutSession(id, Number(people));
      window.location.href = response.data.sessionUrl;
    } catch (requestError) {
      addToast(requestError.message, "error");
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/tours/${id}` } });
      return;
    }

    const response = wishlisted ? await removeFromWishlist(id) : await addToWishlist(id);
    setWishlisted(response.data.tours.some((item) => item._id === id));
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container">
           <SkeletonLoader type="card" count={1} />
        </div>
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="page">
        <div className="container">
          <div className="alert error">{error || "Tour not found"}</div>
          <Link className="secondary-button" to="/tours">
            Back to tours
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="container details-layout">
        <div className="details-main">
          <div className="details-gallery">
            <img src={tour.images[0]} alt={tour.title} className="details-hero-image" />
            <div className="thumbnail-row">
              {tour.images.slice(1, 4).map((image) => (
                <img key={image} src={image} alt={tour.title} />
              ))}
            </div>
          </div>
          <div className="details-copy">
            <p className="eyebrow">{tour.location}</p>
            <h1>{tour.title}</h1>
            <div className="details-facts">
              <span>
                <MapPin size={17} aria-hidden="true" />
                {tour.location}
              </span>
              <span>
                <CalendarDays size={17} aria-hidden="true" />
                {tour.duration} days
              </span>
              <span>
                <UsersRound size={17} aria-hidden="true" />
                Max {tour.maxGroupSize}
              </span>
            </div>
            <p>{tour.description}</p>
          </div>
          <div className="itinerary">
            <h2>Itinerary</h2>
            {tour.itinerary.map((day) => (
              <article key={`${day.day}-${day.title}`} className="itinerary-item">
                <span>Day {day.day}</span>
                <div>
                  <h3>{day.title}</h3>
                  <p>{day.description}</p>
                </div>
              </article>
            ))}
          </div>
          <ReviewSection tour={tour} reviews={tour.reviews} />
        </div>

        <aside className="booking-panel">
          <div>
            <span className="price-label">From</span>
            <strong>${tour.price}</strong>
            <span className="price-label">per person</span>
          </div>
          <form onSubmit={handleBooking}>
            <label>
              <span>People</span>
              <input
                type="number"
                min="1"
                max={tour.maxGroupSize}
                value={people}
                onChange={(event) => setPeople(event.target.value)}
              />
            </label>
            <div className="total-row">
              <span>Total</span>
              <strong>${totalPrice}</strong>
            </div>
            <Button className="full-width" type="submit" variant="primary">
              Pay with eSewa
            </Button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0', color: 'var(--muted)', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          </div>
          <Button className="full-width" type="button" variant="secondary" onClick={handleStripeCheckout}
            style={{ background: '#635bff', color: 'white', border: 'none' }}>
            💳 Pay with Stripe
          </Button>
          <Button className={`full-width ${wishlisted ? "active" : ""}`} type="button" variant="secondary" onClick={toggleWishlist}>
            <Heart size={18} aria-hidden="true" />
            {wishlisted ? "Saved" : "Add to wishlist"}
          </Button>
        </aside>
      </section>
    </main>
  );
};

export default TourDetails;

