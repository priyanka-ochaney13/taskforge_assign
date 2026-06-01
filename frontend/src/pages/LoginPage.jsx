import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>task<span style={{color:"var(--accent)"}}>forge</span></h1>
        <p className="subtitle">Sign in to manage your tasks</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handle}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{marginTop: 20, textAlign: "center", color: "var(--muted)", fontSize: ".9rem"}}>
          No account? <Link to="/register" className="link">Register</Link>
        </p>
      </div>
    </div>
  );
}