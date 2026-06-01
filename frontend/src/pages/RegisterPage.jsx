import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", full_name: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await register(form);
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(Array.isArray(d) ? d.join(", ") : d || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>task<span style={{color:"var(--accent)"}}>forge</span></h1>
        <p className="subtitle">Create your account</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handle}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Username</label>
            <input required value={form.username} onChange={set("username")} placeholder="cooldev_42" />
          </div>
          <div className="field">
            <label>Full Name</label>
            <input value={form.full_name} onChange={set("full_name")} placeholder="Optional" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={form.password} onChange={set("password")} placeholder="Min 8 chars, 1 uppercase, 1 digit" />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{marginTop:20, textAlign:"center", color:"var(--muted)", fontSize:".9rem"}}>
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}