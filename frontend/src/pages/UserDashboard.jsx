import { CalendarDays, Heart, MapPin, ReceiptText, User, Camera, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../api/bookings";
import { getWishlist, removeFromWishlist, updateMe } from "../api/users";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/ToastNotification";
import Button from "../components/common/Button";

const UserDashboard = () => {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileRef = useRef(null);

  const loadDashboard = async () => {
    setLoading(true);
    const [bookingResponse, wishlistResponse] = await Promise.all([getMyBookings(), getWishlist()]);
    setBookings(bookingResponse.data.bookings);
    setWishlist(wishlistResponse.data.tours);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard().catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) setEditName(user.name || "");
  }, [user]);

  const removeWishlistItem = async (tourId) => {
    const response = await removeFromWishlist(tourId);
    setWishlist(response.data.tours);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewPhoto(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      if (fileRef.current?.files[0]) formData.append("photo", fileRef.current.files[0]);
      const response = await updateMe(formData);
      login(response.data.user, null);
      addToast("Profile updated!", "success");
      setPreviewPhoto(null);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const downloadTicket = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${bookingId}/ticket`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not generate ticket");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${bookingId}.pdf`;
      a.click();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="page">
      <section className="container dashboard">
        <div className="page-heading">
          <p className="eyebrow">Traveler dashboard</p>
          <h1>{user?.name}</h1>
        </div>

        {/* Profile Card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "28px", marginBottom: "32px" }}>
          <h2 style={{ marginBottom: "20px" }}>My Profile</h2>
          <form onSubmit={handleProfileSave} style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }} onClick={() => fileRef.current?.click()} role="button" tabIndex={0} aria-label="Change profile photo">
              {(previewPhoto || user?.photo) ? (
                <img src={previewPhoto || user.photo} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", cursor: "pointer", border: "3px solid var(--teal)" }} />
              ) : (
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--teal-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", color: "white", cursor: "pointer" }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div style={{ position: "absolute", bottom: "4px", right: "4px", background: "var(--teal)", borderRadius: "50%", padding: "4px", display: "flex" }}>
                <Camera size={14} color="white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>
                <span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted)" }}>Full Name</span>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
              </label>
              <label>
                <span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted)" }}>Email</span>
                <input type="email" value={user?.email || ""} disabled style={{ opacity: 0.6 }} />
              </label>
              <Button type="submit" variant="primary" disabled={savingProfile} style={{ alignSelf: "flex-start" }}>
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <ReceiptText size={22} aria-hidden="true" />
            <span>{bookings.length}</span>
            <p>Bookings</p>
          </div>
          <div className="stat">
            <Heart size={22} aria-hidden="true" />
            <span>{wishlist.length}</span>
            <p>Wishlist</p>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Booking history</h2>
          {bookings.length ? (
            <div className="booking-list">
              {bookings.map((booking) => (
                <article key={booking._id} className="booking-row">
                  <img src={booking.tourId?.images?.[0]} alt={booking.tourId?.title} />
                  <div>
                    <h3>{booking.tourId?.title}</h3>
                    <p>
                      <MapPin size={15} aria-hidden="true" />
                      {booking.tourId?.location}
                    </p>
                    <p>
                      <CalendarDays size={15} aria-hidden="true" />
                      {booking.numberOfPeople} people
                    </p>
                  </div>
                  <strong>${booking.totalPrice}</strong>
                  <StatusBadge status={booking.status} />
                  {booking.status === "confirmed" && (
                    <button className="icon-button" type="button" onClick={() => downloadTicket(booking._id)} title="Download PDF Ticket">
                      <Download size={18} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No bookings yet" message="Reserve a tour to see it here." />
          )}
        </section>

        <section className="dashboard-section">
          <h2>Wishlist</h2>
          {wishlist.length ? (
            <div className="wishlist-grid">
              {wishlist.map((tour) => (
                <article key={tour._id} className="wishlist-item">
                  <img src={tour.images?.[0]} alt={tour.title} />
                  <div>
                    <h3>{tour.title}</h3>
                    <p>{tour.location}</p>
                  </div>
                  <div className="row-actions">
                    <Link className="secondary-button" to={`/tours/${tour._id}`}>
                      Details
                    </Link>
                    <button className="icon-button" type="button" onClick={() => removeWishlistItem(tour._id)} aria-label="Remove from wishlist">
                      <Heart size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No saved tours" message="Add tours to compare them later." />
          )}
        </section>
      </section>
    </main>
  );
};

export default UserDashboard;

