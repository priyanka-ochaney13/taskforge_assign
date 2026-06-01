import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUsers, updateUser } from "../services/api";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getUsers().then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  }, []);

  const toggle = async (u) => {
    const { data } = await updateUser(u.id, { is_active: !u.is_active });
    setUsers(us => us.map(x => x.id === data.id ? data : x));
    setMsg(`${data.username} ${data.is_active ? "activated" : "deactivated"}`);
    setTimeout(() => setMsg(""), 2500);
  };

  const promoteAdmin = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    const { data } = await updateUser(u.id, { role: newRole });
    setUsers(us => us.map(x => x.id === data.id ? data : x));
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">task<span>forge</span></div>
        <nav className="sidebar-nav">
          <Link to="/dashboard">My Tasks</Link>
          <a href="#" className="active">Users (Admin)</a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip"><strong>{user?.username}</strong><span style={{color:"var(--accent)",fontSize:".75rem"}}>admin</span></div>
          <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={logout}>Sign Out</button>
        </div>
      </aside>

      <main className="main">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Admin-only view of all registered users</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {loading ? (
          <div className="loader-full" style={{minHeight:"200px"}}><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{color:"var(--muted)",fontFamily:"var(--font-mono)",fontSize:".8rem"}}>#{u.id}</td>
                    <td><strong>{u.username}</strong>{u.full_name && <div style={{color:"var(--muted)",fontSize:".8rem"}}>{u.full_name}</div>}</td>
                    <td style={{color:"var(--muted)"}}>{u.email}</td>
                    <td><span className={"badge " + (u.role === "admin" ? "badge-high" : "badge-todo")}>{u.role}</span></td>
                    <td><span className={"badge " + (u.is_active ? "badge-done" : "badge-high")}>{u.is_active ? "active" : "inactive"}</span></td>
                    <td style={{color:"var(--muted)",fontSize:".82rem"}}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        {u.id !== user.id && (
                          <>
                            <button className={"btn btn-sm " + (u.is_active ? "btn-danger" : "btn-success")} onClick={() => toggle(u)}>
                              {u.is_active ? "Deactivate" : "Activate"}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => promoteAdmin(u)}>
                              {u.role === "admin" ? "Demote" : "Make Admin"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}