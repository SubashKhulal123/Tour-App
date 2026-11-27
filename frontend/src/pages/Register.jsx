import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Start planning</p>
        <h1>Create account</h1>
        <form onSubmit={submit} className="stack-form">
          <label>
            <span>Name</span>
            <input name="name" value={form.name} onChange={update} required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={update} required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={update} required minLength="8" />
          </label>
          {error ? <div className="alert error">{error}</div> : null}
          <button className="primary-button full-width" type="submit" disabled={submitting}>
            <UserPlus size={18} aria-hidden="true" />
            {submitting ? "Creating account" : "Register"}
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;

