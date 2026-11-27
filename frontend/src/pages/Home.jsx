import { ArrowRight, CalendarCheck, MapPinned, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTours } from "../api/tours";
import SearchFilters from "../components/SearchFilters";
import TourCard from "../components/TourCard";
import SkeletonLoader from "../components/common/SkeletonLoader";

const Home = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await getTours({ limit: 3, sort: "price" });
        setTours(response.data.tours);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  const handleSearch = (values) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">Curated group trips</p>
          <h1>Tour Booking</h1>
          <p className="hero-copy">Find memorable trips, compare clear itineraries, and reserve your seat with a few clicks.</p>
          <div className="hero-actions animate-fade-in">
            <Link className="btn btn-primary btn-lg" to="/tours">
              Explore tours
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="btn btn-secondary btn-lg glass" style={{ color: 'white' }} to="/register">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="container search-band">
        <SearchFilters onSubmit={handleSearch} />
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Available now</p>
            <h2>Featured tours</h2>
          </div>
          <Link className="text-link" to="/tours">
            View all
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <div className="tour-grid">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : (
          <div className="tour-grid">
            {tours.map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      <section className="value-band">
        <div className="container value-grid">
          <div>
            <MapPinned size={24} aria-hidden="true" />
            <h3>Local routes</h3>
            <p>Trips are organized around real places, daily pacing, and group capacity.</p>
          </div>
          <div>
            <CalendarCheck size={24} aria-hidden="true" />
            <h3>Clear bookings</h3>
            <p>Every booking tracks guest count, price, and approval status.</p>
          </div>
          <div>
            <ShieldCheck size={24} aria-hidden="true" />
            <h3>Admin control</h3>
            <p>Admins can manage tours, travelers, and booking decisions from one dashboard.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;

