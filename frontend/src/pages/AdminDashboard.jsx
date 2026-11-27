import {
  CheckCircle2,
  ClipboardList,
  Map,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UsersRound,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getBookings, updateBookingStatus } from "../api/bookings";
import { createTour, deleteTour, getTours, updateTour } from "../api/tours";
import { deleteUser, getUsers, updateUserRole } from "../api/users";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";
import RevenueChart from "../components/admin/RevenueChart";

const emptyTourForm = {
  title: "",
  location: "",
  price: "",
  duration: "",
  description: "",
  images: "",
  itinerary: "",
  maxGroupSize: ""
};

const formFromTour = (tour) => ({
  title: tour.title || "",
  location: tour.location || "",
  price: tour.price || "",
  duration: tour.duration || "",
  description: tour.description || "",
  images: (tour.images || []).join("\n"),
  itinerary: (tour.itinerary || []).map((day) => `${day.title} | ${day.description}`).join("\n"),
  maxGroupSize: tour.maxGroupSize || ""
});

const payloadFromForm = (form) => ({
  title: form.title.trim(),
  location: form.location.trim(),
  price: Number(form.price),
  duration: Number(form.duration),
  description: form.description.trim(),
  images: form.images
    .split("\n")
    .map((image) => image.trim())
    .filter(Boolean),
  itinerary: form.itinerary
    .split("\n")
    .map((line, index) => {
      const [title, ...descriptionParts] = line.split("|");
      const description = descriptionParts.join("|").trim();

      return {
        day: index + 1,
        title: title.trim(),
        description: description || title.trim()
      };
    })
    .filter((day) => day.title),
  maxGroupSize: Number(form.maxGroupSize)
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("tours");
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [tourForm, setTourForm] = useState(emptyTourForm);
  const [editingTourId, setEditingTourId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed").length,
    [bookings]
  );

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tourResponse, bookingResponse, userResponse] = await Promise.all([
        getTours({ limit: 50, sort: "-createdAt" }),
        getBookings(),
        getUsers()
      ]);
      setTours(tourResponse.data.tours);
      setBookings(bookingResponse.data.bookings);
      setUsers(userResponse.data.users);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setTourForm((current) => ({ ...current, [name]: value }));
  };

  const resetTourForm = () => {
    setTourForm(emptyTourForm);
    setEditingTourId(null);
  };

  const submitTour = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const payload = payloadFromForm(tourForm);
      const response = editingTourId ? await updateTour(editingTourId, payload) : await createTour(payload);
      const savedTour = response.data.tour;

      setTours((current) =>
        editingTourId ? current.map((tour) => (tour._id === savedTour._id ? savedTour : tour)) : [savedTour, ...current]
      );
      setMessage(editingTourId ? "Tour updated." : "Tour created.");
      resetTourForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const editTour = (tour) => {
    setEditingTourId(tour._id);
    setTourForm(formFromTour(tour));
    setActiveTab("tours");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeTour = async (tourId) => {
    if (!window.confirm("Delete this tour?")) return;
    await deleteTour(tourId);
    setTours((current) => current.filter((tour) => tour._id !== tourId));
  };

  const changeBookingStatus = async (bookingId, status) => {
    const response = await updateBookingStatus(bookingId, status);
    setBookings((current) => current.map((booking) => (booking._id === bookingId ? response.data.booking : booking)));
  };

  const changeUserRole = async (userId, role) => {
    const response = await updateUserRole(userId, role);
    setUsers((current) => current.map((user) => (user._id === userId ? response.data.user : user)));
  };

  const removeUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(userId);
    setUsers((current) => current.filter((user) => user._id !== userId));
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="page">
      <section className="container dashboard admin-dashboard">
        <div className="page-heading admin-heading">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1>Manage tours, bookings, and users</h1>
          </div>
          <button className="secondary-button" type="button" onClick={loadAdminData}>
            <RefreshCw size={18} aria-hidden="true" />
            Refresh
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <Map size={22} aria-hidden="true" />
            <span>{tours.length}</span>
            <p>Tours</p>
          </div>
          <div className="stat">
            <ClipboardList size={22} aria-hidden="true" />
            <span>{bookings.length}</span>
            <p>Bookings</p>
          </div>
          <div className="stat">
            <CheckCircle2 size={22} aria-hidden="true" />
            <span>{confirmedBookings}</span>
            <p>Confirmed</p>
          </div>
          <div className="stat">
            <UsersRound size={22} aria-hidden="true" />
            <span>{users.length}</span>
            <p>Users</p>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Admin sections">
          <button className={activeTab === "tours" ? "active" : ""} type="button" onClick={() => setActiveTab("tours")}>
            Tours
          </button>
          <button className={activeTab === "bookings" ? "active" : ""} type="button" onClick={() => setActiveTab("bookings")}>
            Bookings
          </button>
          <button className={activeTab === "users" ? "active" : ""} type="button" onClick={() => setActiveTab("users")}>
            Users
          </button>
          <button className={activeTab === "analytics" ? "active" : ""} type="button" onClick={() => setActiveTab("analytics")}>
            Analytics
          </button>
        </div>

        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}

        {activeTab === "tours" ? (
          <section className="admin-grid">
            <form className="admin-form" onSubmit={submitTour}>
              <div className="form-heading">
                <h2>{editingTourId ? "Edit tour" : "Add new tour"}</h2>
                <button className="secondary-button" type="button" onClick={resetTourForm}>
                  <Plus size={17} aria-hidden="true" />
                  New
                </button>
              </div>
              <label>
                <span>Title</span>
                <input name="title" value={tourForm.title} onChange={updateForm} required />
              </label>
              <label>
                <span>Location</span>
                <input name="location" value={tourForm.location} onChange={updateForm} required />
              </label>
              <div className="form-row">
                <label>
                  <span>Price</span>
                  <input name="price" type="number" min="0" value={tourForm.price} onChange={updateForm} required />
                </label>
                <label>
                  <span>Duration</span>
                  <input name="duration" type="number" min="1" value={tourForm.duration} onChange={updateForm} required />
                </label>
                <label>
                  <span>Max group</span>
                  <input name="maxGroupSize" type="number" min="1" value={tourForm.maxGroupSize} onChange={updateForm} required />
                </label>
              </div>
              <label>
                <span>Description</span>
                <textarea name="description" rows="4" value={tourForm.description} onChange={updateForm} required />
              </label>
              <label>
                <span>Images</span>
                <textarea name="images" rows="3" value={tourForm.images} onChange={updateForm} placeholder="One image URL per line" required />
              </label>
              <label>
                <span>Itinerary</span>
                <textarea
                  name="itinerary"
                  rows="5"
                  value={tourForm.itinerary}
                  onChange={updateForm}
                  placeholder="Morning walk | Guided city route"
                  required
                />
              </label>
              <button className="primary-button full-width" type="submit" disabled={submitting}>
                <Save size={18} aria-hidden="true" />
                {submitting ? "Saving" : "Save tour"}
              </button>
            </form>

            <div className="admin-list">
              <h2>Existing tours</h2>
              {tours.length ? (
                tours.map((tour) => (
                  <article key={tour._id} className="admin-tour-row">
                    <img src={tour.images?.[0]} alt={tour.title} />
                    <div>
                      <h3>{tour.title}</h3>
                      <p>{tour.location}</p>
                      <span>
                        ${tour.price} / {tour.duration} days
                      </span>
                    </div>
                    <div className="row-actions">
                      <button className="icon-button" type="button" onClick={() => editTour(tour)} aria-label="Edit tour">
                        <Pencil size={18} />
                      </button>
                      <button className="icon-button danger" type="button" onClick={() => removeTour(tour._id)} aria-label="Delete tour">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="No tours" message="Create the first tour package." />
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "bookings" ? (
          <section className="dashboard-section">
            <h2>All bookings</h2>
            {bookings.length ? (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Traveler</th>
                      <th>Tour</th>
                      <th>People</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.userId?.name}</td>
                        <td>{booking.tourId?.title || "Deleted tour"}</td>
                        <td>{booking.numberOfPeople}</td>
                        <td>${booking.totalPrice}</td>
                        <td>
                          <StatusBadge status={booking.status} />
                        </td>
                        <td>
                          <select value={booking.status} onChange={(event) => changeBookingStatus(booking._id, event.target.value)}>
                            <option value="pending">pending</option>
                            <option value="confirmed">confirmed</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No bookings" message="Bookings will appear after travelers submit requests." />
            )}
          </section>
        ) : null}

        {activeTab === "users" ? (
          <section className="dashboard-section">
            <h2>Users</h2>
            {users.length ? (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select value={user.role} onChange={(event) => changeUserRole(user._id, event.target.value)}>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="icon-button danger" type="button" onClick={() => removeUser(user._id)} aria-label="Delete user">
                            <XCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No users" message="Registered accounts will appear here." />
            )}
          </section>
        ) : null}
        {activeTab === "analytics" ? (
          <section className="dashboard-section">
            <RevenueChart />
          </section>
        ) : null}
      </section>
    </main>
  );
};

export default AdminDashboard;

