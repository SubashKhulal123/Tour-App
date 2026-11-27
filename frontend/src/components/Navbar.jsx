import { Compass, Heart, LayoutDashboard, LogOut, Menu, Shield, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <header className="site-header">
      <nav className="nav container">
        <Link className="brand" to="/" onClick={close}>
          <Compass size={24} aria-hidden="true" />
          <span>Tour Booking</span>
        </Link>
        <button className="icon-button menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/tours" onClick={close}>
            Tours
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to={isAdmin ? "/admin" : "/dashboard"} onClick={close}>
                {isAdmin ? <Shield size={17} aria-hidden="true" /> : <LayoutDashboard size={17} aria-hidden="true" />}
                Dashboard
              </NavLink>
              {!isAdmin ? (
                <NavLink to="/dashboard" onClick={close}>
                  <Heart size={17} aria-hidden="true" />
                  Wishlist
                </NavLink>
              ) : null}
              <span className="nav-user">
                <UserRound size={16} aria-hidden="true" />
                {user?.name}
              </span>
              <button className="text-button" type="button" onClick={handleLogout}>
                <LogOut size={17} aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>
                Login
              </NavLink>
              <Link className="primary-link" to="/register" onClick={close}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

