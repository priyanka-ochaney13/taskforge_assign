import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTasks, createTask, updateTask, deleteTask } from "../services/api";

const STATUSES = ["todo", "in_progress", "done"];
const PRIORITIES = ["low", "medium", "high"];

function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError(""); setLoading(true);
    try {
      if (isEdit) {
        const { data } = await updateTask(task.id, form);
        onSave(data, "update");
      } else {
        const { data } = await createTask(form);
        onSave(data, "create");
      }
      onClose();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(Array.isArray(d) ? d.join(", ") : d || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{isEdit ? "Edit Task" : "New Task"}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={set("title")} placeholder="What needs to be done?" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={set("description")} placeholder="Optional details..." />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={set("status")}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={set("priority")}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-sm" style={{background:"var(--accent)",color:"#fff"}} onClick={save} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, total_pages: 1 });
  const [filters, setFilters] = useState({ status: "", priority: "", page: 1 });
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, page_size: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const { data } = await getTasks(params);
      setTasks(data.items);
      setMeta({ total: data.total, page: data.page, total_pages: data.total_pages });
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleSave = (task, type) => {
    if (type === "create") load();
    else setTasks(ts => ts.map(t => t.id === task.id ? task : t));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    load();
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">task<span>forge</span></div>
        <nav className="sidebar-nav">
          <a href="#" className="active">My Tasks</a>
          {user?.role === "admin" && <Link to="/admin">Users (Admin)</Link>}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.full_name || user?.username}</strong>
            {user?.role === "admin" && <span style={{color:"var(--accent)",fontSize:".75rem"}}>admin</span>}
          </div>
          <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={() => { logout(); navigate("/login"); }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="page-header" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div>
            <h1>My Tasks</h1>
            <p>Track and manage your work</p>
          </div>
          <button className="btn btn-sm" style={{background:"var(--accent)",color:"#fff"}} onClick={() => setModal("new")}>
            + New Task
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card"><div className="label">Total</div><div className="value">{meta.total}</div></div>
          <div className="stat-card"><div className="label">Done</div><div className="value" style={{color:"var(--green)"}}>{tasks.filter(t=>t.status==="done").length}</div></div>
          <div className="stat-card"><div className="label">High Priority</div><div className="value" style={{color:"var(--accent2)"}}>{tasks.filter(t=>t.priority==="high").length}</div></div>
        </div>

        <div className="task-toolbar">
          <select value={filters.status} onChange={e => setFilters({...filters,status:e.target.value,page:1})}
            style={{background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",padding:"7px 12px",borderRadius:"var(--radius)",fontSize:".88rem"}}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilters({...filters,priority:e.target.value,page:1})}
            style={{background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",padding:"7px 12px",borderRadius:"var(--radius)",fontSize:".88rem"}}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}} /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state"><h3>No tasks yet</h3><p>Create your first task to get started</p></div>
        ) : (
          <div className="task-grid">
            {tasks.map(task => (
              <div key={task.id} className={"task-card " + (task.status === "done" ? "done" : "")}>
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                  <div className="task-meta">
                    <span className={"badge badge-" + task.status}>{task.status.replace("_"," ")}</span>
                    <span className={"badge badge-" + task.priority}>{task.priority}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(task)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta.total_pages > 1 && (
          <div className="pagination">
            <button disabled={filters.page<=1} onClick={() => setFilters(f=>({...f,page:f.page-1}))}>Prev</button>
            <span>Page {meta.page} of {meta.total_pages}</span>
            <button disabled={filters.page>=meta.total_pages} onClick={() => setFilters(f=>({...f,page:f.page+1}))}>Next</button>
          </div>
        )}
      </main>

      {modal && (
        <TaskModal task={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}