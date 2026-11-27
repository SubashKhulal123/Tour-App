import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(form);
      const from = location.state?.from;
      const redirectTo = typeof from === "string" ? from : from?.pathname || (user.role === "admin" ? "/admin" : "/dashboard");
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>
        <form onSubmit={submit} className="stack-form">
          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={update} required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={update} required />
          </label>
          {error ? <div className="alert error">{error}</div> : null}
          <button className="primary-button full-width" type="submit" disabled={submitting}>
            <LogIn size={18} aria-hidden="true" />
            {submitting ? "Logging in" : "Login"}
          </button>
        </form>
        <p className="auth-switch">
          <Link to="/forgot-password" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Forgot your password?</Link>
        </p>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
