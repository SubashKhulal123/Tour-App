import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTours } from "../api/tours";
import { addToWishlist, getWishlist, removeFromWishlist } from "../api/users";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import SearchFilters from "../components/SearchFilters";
import TourCard from "../components/TourCard";
import { useAuth } from "../context/AuthContext";

const paramsToObject = (searchParams) => Object.fromEntries(searchParams.entries());

const Tours = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  const filters = useMemo(() => paramsToObject(searchParams), [searchParams]);

  useEffect(() => {
    const loadTours = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getTours(filters);
        setTours(response.data.tours);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [filters]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }

    const loadWishlist = async () => {
      const response = await getWishlist();
      setWishlistIds(response.data.tours.map((tour) => tour._id));
    };

    loadWishlist().catch(() => setWishlistIds([]));
  }, [isAuthenticated]);

  const applyFilters = (values) => {
    const next = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value) next[key] = value;
    });
    setSearchParams(next);
  };

  const toggleWishlist = async (tour) => {
    if (!isAuthenticated) return;
    const exists = wishlistIds.includes(tour._id);
    const response = exists ? await removeFromWishlist(tour._id) : await addToWishlist(tour._id);
    setWishlistIds(response.data.tours.map((item) => item._id));
  };

  return (
    <main className="page">
      <section className="container">
        <div className="page-heading">
          <p className="eyebrow">Tours</p>
          <h1>Browse tour packages</h1>
        </div>
        <SearchFilters initialValues={filters} onSubmit={applyFilters} />
        {error ? <div className="alert error">{error}</div> : null}
        {loading ? (
          <LoadingState />
        ) : tours.length ? (
          <div className="tour-grid">
            {tours.map((tour) => (
              <TourCard
                key={tour._id}
                tour={tour}
                wishlisted={wishlistIds.includes(tour._id)}
                onWishlistToggle={isAuthenticated ? toggleWishlist : null}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No tours found" message="Try a different search, location, price, or duration." />
        )}
      </section>
    </main>
  );
};

export default Tours;

