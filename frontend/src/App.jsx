import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Activity,
  Bell,
  BookOpen,
  Bot,
  Check,
  Clipboard,
  Code2,
  Crown,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from "lucide-react";
import { isStaticToken, staticRequest } from "./staticDemo.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const statusMeta = {
  todo: { label: "To Do", tone: "border-slate-200 bg-slate-50" },
  in_progress: { label: "In Progress", tone: "border-blue-200 bg-blue-50" },
  in_review: { label: "In Review", tone: "border-amber-200 bg-amber-50" },
  done: { label: "Done", tone: "border-emerald-200 bg-emerald-50" }
};
const statuses = Object.keys(statusMeta);
const demoEmail = "imran@devcollab.demo";
const demoPassword = "DevCollab@123";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function priorityClass(priority) {
  if (priority === "P0") return "bg-red-50 text-red-700 border-red-200";
  if (priority === "P1") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function request(path, { token, method = "GET", body } = {}) {
  if (isStaticToken(token)) {
    return staticRequest(path, { method, body });
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? authHeader(token) : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

function mergeById(list, item) {
  const exists = list.some((entry) => entry.id === item.id);
  if (!exists) return [item, ...list];
  return list.map((entry) => (entry.id === item.id ? item : entry));
}

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ email: demoEmail, password: demoPassword });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = await request("/api/auth/login", {
        method: "POST",
        body: form
      });
      onLogin(payload);
    } catch (err) {
      if (form.email === demoEmail && form.password === demoPassword) {
        const payload = await staticRequest("/api/auth/login", {
          method: "POST",
          body: form
        });
        onLogin(payload);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#E7F5EF,transparent_32%),linear-gradient(135deg,#F8FAFC,#EEF2F7)] px-4 py-8 text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-soft">
            <ShieldCheck size={18} />
            DevFusion 2.0 Round 3 MVP
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-ink md:text-6xl">
              DevCollab
            </h1>
            <p className="max-w-2xl text-xl leading-8 text-slate-600">
              A project operating system for student developer teams: tasks, docs, snippets,
              live presence, activity memory, and AI assistance in one workspace.
            </p>
          </div>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              ["Realtime board", "Socket.IO movement sync"],
              ["Project memory", "Wiki, snippets, activity"],
              ["AI demo mode", "Summary and code review"]
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="mt-2 text-sm leading-5 text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-7 shadow-panel">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
                Demo Login
              </p>
              <h2 className="mt-2 text-2xl font-black text-ink">Open workspace</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
              <LayoutDashboard size={24} />
            </div>
          </div>
          <label className="block text-sm font-bold text-slate-700">
            Email
            <input
              className="mt-2 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none ring-teal-600 transition focus:ring-2"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label className="mt-4 block text-sm font-bold text-slate-700">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none ring-teal-600 transition focus:ring-2"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow-soft transition hover:bg-[#173E63]"
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            Launch DevCollab
          </button>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-bold text-slate-800">Judge credentials</p>
            <p className="mt-1">Email: {demoEmail}</p>
            <p>Password: {demoPassword}</p>
          </div>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("devcollab_token") || "");
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("project-campus");
  const [presence, setPresence] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  async function loadBootstrap(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    setError("");
    try {
      const me = await request("/api/me", { token: activeToken });
      const bootstrap = await request("/api/bootstrap", { token: activeToken });
      setUser(me.user);
      setData(bootstrap);
      setSelectedProjectId(bootstrap.projects[0]?.id || "project-campus");
    } catch (err) {
      setError(err.message);
      localStorage.removeItem("devcollab_token");
      setToken("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    if (!token || !selectedProjectId) return undefined;
    if (isStaticToken(token)) {
      const activeProject = data?.projects.find((item) => item.id === selectedProjectId);
      const activeUsers = activeProject?.members
        .map((id) => data.users.find((item) => item.id === id))
        .filter(Boolean);
      setPresence(activeUsers || []);
      return undefined;
    }
    const socket = io(API_URL, { auth: { token } });
    socket.emit("join-project", { projectId: selectedProjectId });

    socket.on("presence:update", (payload) => {
      if (payload.projectId === selectedProjectId) setPresence(payload.users);
    });
    socket.on("task:moved", ({ task, activity }) => {
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((item) => (item.id === task.id ? task : item)),
        activity: activity ? mergeById(current.activity, activity) : current.activity
      }));
    });
    socket.on("task:updated", ({ task }) => {
      setData((current) => ({
        ...current,
        tasks: mergeById(current.tasks, task)
      }));
    });
    socket.on("comment:created", ({ task, notifications }) => {
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((item) => (item.id === task.id ? task : item)),
        notifications: [...(notifications || []), ...current.notifications]
      }));
    });
    socket.on("activity:new", ({ activity }) => {
      if (!activity) return;
      setData((current) => ({ ...current, activity: mergeById(current.activity, activity) }));
    });
    socket.on("notification:new", ({ notifications }) => {
      if (!notifications?.length) return;
      setData((current) => ({
        ...current,
        notifications: [...notifications, ...current.notifications]
      }));
    });

    return () => socket.disconnect();
  }, [token, selectedProjectId]);

  function handleLogin(payload) {
    localStorage.setItem("devcollab_token", payload.token);
    setToken(payload.token);
    setUser(payload.user);
    loadBootstrap(payload.token);
  }

  function logout() {
    localStorage.removeItem("devcollab_token");
    setToken("");
    setUser(null);
    setData(null);
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <Loader2 className="mr-3 animate-spin" />
        Loading DevCollab workspace
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-7 text-center shadow-panel">
          <p className="font-bold text-red-700">{error}</p>
          <button className="mt-5 rounded-2xl bg-brand px-5 py-3 font-bold text-white" onClick={logout}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Workspace
      token={token}
      user={user}
      data={data}
      setData={setData}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={setSelectedProjectId}
      presence={presence}
      logout={logout}
    />
  );
}

function Workspace({ token, user, data, setData, selectedProjectId, setSelectedProjectId, presence, logout }) {
  const [activeTab, setActiveTab] = useState("board");
  const workspace = data.workspaces[0];
  const project = data.projects.find((item) => item.id === selectedProjectId) || data.projects[0];
  const projectTasks = data.tasks.filter((task) => task.projectId === project.id);
  const projectDocs = data.docs.filter((doc) => doc.projectId === project.id);
  const projectSnippets = data.snippets.filter((snippet) => snippet.projectId === project.id);
  const projectActivity = data.activity.filter((item) => item.projectId === project.id);
  const myNotifications = data.notifications.filter((item) => item.userId === user.id);
  const unreadCount = myNotifications.filter((item) => !item.read).length;
  const usersById = useMemo(() => Object.fromEntries(data.users.map((item) => [item.id, item])), [data.users]);
  const doneCount = projectTasks.filter((task) => task.status === "done").length;
  const completion = projectTasks.length ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  const tabs = [
    ["board", LayoutDashboard, "Board"],
    ["wiki", BookOpen, "Wiki"],
    ["snippets", Code2, "Snippets"],
    ["ai", Bot, "AI"],
    ["billing", Crown, "Plan"]
  ];

  return (
    <main className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white px-5 py-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-lg font-black text-white">
            DC
          </div>
          <div>
            <p className="text-xl font-black">DevCollab</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Round 3 MVP</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Projects</p>
          <div className="space-y-2">
            {data.projects.map((item) => (
              <button
                key={item.id}
                className={cx(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  item.id === project.id ? "bg-brand text-white shadow-soft" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setSelectedProjectId(item.id)}
              >
                <p className="font-bold">{item.name}</p>
                <p className={cx("mt-1 text-xs", item.id === project.id ? "text-blue-100" : "text-slate-500")}>
                  {item.members.length} members
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-700">{workspace.name}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Roles, live presence, project memory, and AI assistant are enabled in this demo workspace.
          </p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-4 py-4 backdrop-blur md:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-bold text-teal-700">{workspace.name}</p>
              <h1 className="text-2xl font-black text-ink md:text-3xl">{project.name}</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">{project.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Presence users={presence} fallbackUsers={project.members.map((id) => usersById[id]).filter(Boolean)} />
              <div className="rounded-2xl border border-line bg-slate-50 px-4 py-2 text-sm">
                <span className="font-black text-ink">{completion}%</span>
                <span className="ml-1 text-slate-500">complete</span>
              </div>
              <div className="relative rounded-2xl border border-line bg-white px-4 py-2 text-sm font-bold text-slate-700">
                <Bell className="mr-2 inline" size={16} />
                {unreadCount}
              </div>
              <button
                className="rounded-2xl border border-line bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                onClick={logout}
              >
                <LogOut className="mr-2 inline" size={16} />
                Logout
              </button>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto">
            {tabs.map(([id, Icon, label]) => (
              <button
                key={id}
                className={cx(
                  "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition",
                  activeTab === id ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <section className="grid gap-5 px-4 py-5 md:px-7 xl:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <Stats tasks={projectTasks} docs={projectDocs} snippets={projectSnippets} activity={projectActivity} />
            {activeTab === "board" ? (
              <Kanban
                token={token}
                project={project}
                tasks={projectTasks}
                usersById={usersById}
                setData={setData}
              />
            ) : null}
            {activeTab === "wiki" ? (
              <Wiki token={token} project={project} docs={projectDocs} setData={setData} />
            ) : null}
            {activeTab === "snippets" ? (
              <Snippets token={token} project={project} snippets={projectSnippets} setData={setData} />
            ) : null}
            {activeTab === "ai" ? (
              <AiPanel token={token} project={project} />
            ) : null}
            {activeTab === "billing" ? <Billing /> : null}
          </div>
          <RightRail
            user={user}
            usersById={usersById}
            tasks={projectTasks}
            activity={projectActivity}
            notifications={myNotifications}
            token={token}
            setData={setData}
          />
        </section>
      </div>
    </main>
  );
}

function Presence({ users, fallbackUsers }) {
  const visibleUsers = users.length ? users : fallbackUsers.slice(0, 3);
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3 py-2">
      <Users size={16} className="text-teal-700" />
      <div className="flex -space-x-2">
        {visibleUsers.slice(0, 4).map((user) => (
          <span
            key={user.id}
            title={user.name}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-teal-700 text-xs font-black text-white"
          >
            {user.avatar || initials(user.name)}
          </span>
        ))}
      </div>
      <span className="text-sm font-semibold text-slate-600">{visibleUsers.length} live</span>
    </div>
  );
}

function Stats({ tasks, docs, snippets, activity }) {
  const stats = [
    ["Tasks", tasks.length, LayoutDashboard],
    ["Done", tasks.filter((task) => task.status === "done").length, Check],
    ["Wiki pages", docs.length, BookOpen],
    ["Snippets", snippets.length, Code2],
    ["Events", activity.length, Activity]
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(([label, value, Icon]) => (
        <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <Icon size={18} className="text-teal-700" />
          </div>
          <p className="mt-2 text-3xl font-black text-ink">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Kanban({ token, project, tasks, usersById, setData }) {
  const [draft, setDraft] = useState({ title: "", priority: "P1", status: "todo" });
  const [draggedTaskId, setDraggedTaskId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || "");
  const [comment, setComment] = useState("");
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || tasks[0];

  useEffect(() => {
    if (!tasks.some((task) => task.id === selectedTaskId)) setSelectedTaskId(tasks[0]?.id || "");
  }, [tasks, selectedTaskId]);

  async function createTask(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const payload = await request("/api/tasks", {
      token,
      method: "POST",
      body: {
        projectId: project.id,
        title: draft.title,
        priority: draft.priority,
        status: draft.status,
        labels: ["demo"]
      }
    });
    setData((current) => ({
      ...current,
      tasks: mergeById(current.tasks, payload.task),
      activity: mergeById(current.activity, payload.activity)
    }));
    setSelectedTaskId(payload.task.id);
    setDraft({ title: "", priority: "P1", status: "todo" });
  }

  async function moveTask(taskId, status) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    const payload = await request(`/api/tasks/${taskId}`, {
      token,
      method: "PATCH",
      body: { status }
    });
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === taskId ? payload.task : item)),
      activity: mergeById(current.activity, payload.activity)
    }));
  }

  async function addComment(event) {
    event.preventDefault();
    if (!selectedTask || !comment.trim()) return;
    const payload = await request(`/api/tasks/${selectedTask.id}/comments`, {
      token,
      method: "POST",
      body: { body: comment }
    });
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === selectedTask.id ? payload.task : item)),
      notifications: [...payload.notifications, ...current.notifications],
      activity: mergeById(current.activity, payload.activity)
    }));
    setComment("");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={createTask} className="grid gap-3 rounded-3xl border border-line bg-white p-4 shadow-soft md:grid-cols-[1fr_150px_150px_auto]">
        <input
          className="rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none ring-teal-600 focus:ring-2"
          placeholder="Create a task for this project"
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
        <select
          className="rounded-2xl border border-line bg-slate-50 px-4 py-3"
          value={draft.priority}
          onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
        >
          <option>P0</option>
          <option>P1</option>
          <option>P2</option>
        </select>
        <select
          className="rounded-2xl border border-line bg-slate-50 px-4 py-3"
          value={draft.status}
          onChange={(event) => setDraft({ ...draft, status: event.target.value })}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusMeta[status].label}
            </option>
          ))}
        </select>
        <button className="flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 font-bold text-white">
          <Plus size={18} />
          Add
        </button>
      </form>

      <div className="grid gap-4 xl:grid-cols-4">
        {statuses.map((status) => (
          <section
            key={status}
            className={cx("min-h-[420px] rounded-3xl border p-3", statusMeta[status].tone)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              moveTask(draggedTaskId, status);
              setDraggedTaskId("");
            }}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-black text-ink">{statusMeta[status].label}</h3>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-slate-500">
                {tasks.filter((task) => task.status === status).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <button
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={cx(
                      "task-card w-full rounded-2xl border bg-white p-4 text-left",
                      selectedTask?.id === task.id ? "border-teal-500 ring-2 ring-teal-100" : "border-line"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold leading-5 text-ink">{task.title}</p>
                      <span className={cx("rounded-full border px-2 py-1 text-xs font-black", priorityClass(task.priority))}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">{task.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {usersById[task.assignee]?.avatar || "NA"}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {task.comments.length} comments
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>

      {selectedTask ? (
        <section className="rounded-3xl border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold text-teal-700">Task discussion</p>
              <h3 className="mt-1 text-xl font-black text-ink">{selectedTask.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{selectedTask.description}</p>
            </div>
            <span className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
              @{usersById[selectedTask.assignee]?.name?.split(" ")[0] || "member"}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {selectedTask.comments.map((item) => (
              <div key={item.id} className="rounded-2xl border border-line bg-slate-50 p-3">
                <p className="text-sm text-slate-700">{item.body}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {usersById[item.userId]?.name} · {formatTime(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={addComment} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              className="rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none ring-teal-600 focus:ring-2"
              placeholder="Comment with @trivikram or @riya to trigger notification"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-bold text-white">
              <Send size={18} />
              Comment
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function Wiki({ token, project, docs, setData }) {
  const [selectedId, setSelectedId] = useState(docs[0]?.id || "");
  const selected = docs.find((doc) => doc.id === selectedId) || docs[0];
  const [form, setForm] = useState({ title: selected?.title || "", content: selected?.content || "" });

  useEffect(() => {
    setForm({ title: selected?.title || "", content: selected?.content || "" });
  }, [selected?.id]);

  async function save(event) {
    event.preventDefault();
    const path = selected ? `/api/docs/${selected.id}` : "/api/docs";
    const method = selected ? "PATCH" : "POST";
    const payload = await request(path, {
      token,
      method,
      body: { projectId: project.id, ...form }
    });
    const doc = payload.doc;
    setData((current) => ({
      ...current,
      docs: mergeById(current.docs, doc),
      activity: mergeById(current.activity, payload.activity)
    }));
    setSelectedId(doc.id);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
      <aside className="rounded-3xl border border-line bg-white p-4 shadow-soft">
        <button
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-4 py-3 font-bold text-white"
          onClick={() => {
            setSelectedId("");
            setForm({ title: "New project page", content: "" });
          }}
        >
          <Plus size={18} />
          New page
        </button>
        <div className="space-y-2">
          {docs.map((doc) => (
            <button
              key={doc.id}
              className={cx(
                "w-full rounded-2xl px-3 py-3 text-left text-sm",
                selected?.id === doc.id ? "bg-brand font-bold text-white" : "bg-slate-50 text-slate-600"
              )}
              onClick={() => setSelectedId(doc.id)}
            >
              {doc.title}
            </button>
          ))}
        </div>
      </aside>
      <form onSubmit={save} className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <input
          className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-xl font-black outline-none"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <textarea
          className="mt-4 min-h-[280px] w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 leading-7 outline-none"
          value={form.content}
          onChange={(event) => setForm({ ...form, content: event.target.value })}
          placeholder="Capture decisions, architecture notes, setup steps, and demo evidence."
        />
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button className="rounded-2xl bg-brand px-5 py-3 font-bold text-white">Save wiki page</button>
          <p className="text-sm text-slate-500">
            Version history: <span className="font-bold text-ink">{selected?.versions?.length || 0}</span>
          </p>
        </div>
      </form>
    </div>
  );
}

function Snippets({ token, project, snippets, setData }) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    title: "",
    language: "javascript",
    tags: "api,realtime",
    description: "",
    code: ""
  });
  const filtered = snippets.filter((item) =>
    `${item.title} ${item.language} ${item.tags.join(" ")} ${item.description}`.toLowerCase().includes(query.toLowerCase())
  );

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.code.trim()) return;
    const payload = await request("/api/snippets", {
      token,
      method: "POST",
      body: {
        projectId: project.id,
        ...form,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      }
    });
    setData((current) => ({
      ...current,
      snippets: mergeById(current.snippets, payload.snippet),
      activity: mergeById(current.activity, payload.activity)
    }));
    setForm({ title: "", language: "javascript", tags: "api,realtime", description: "", code: "" });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search snippets by title, language, or tag"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="grid gap-4">
          {filtered.map((snippet) => (
            <article key={snippet.id} className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-black text-ink">{snippet.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{snippet.description}</p>
                </div>
                <button
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600"
                  onClick={() => navigator.clipboard?.writeText(snippet.code)}
                >
                  <Clipboard size={16} />
                  Copy
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-ink p-4 text-sm text-slate-100 scrollbar-thin">
                <code>{snippet.code}</code>
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700">
                  {snippet.language}
                </span>
                {snippet.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <form onSubmit={save} className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <h3 className="text-lg font-black">Add snippet</h3>
        <input
          className="mt-4 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none"
          placeholder="Title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <input
          className="mt-3 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none"
          placeholder="Language"
          value={form.language}
          onChange={(event) => setForm({ ...form, language: event.target.value })}
        />
        <input
          className="mt-3 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none"
          placeholder="Tags comma separated"
          value={form.tags}
          onChange={(event) => setForm({ ...form, tags: event.target.value })}
        />
        <textarea
          className="mt-3 h-20 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <textarea
          className="mt-3 h-44 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 font-mono text-sm outline-none"
          placeholder="Paste code"
          value={form.code}
          onChange={(event) => setForm({ ...form, code: event.target.value })}
        />
        <button className="mt-4 w-full rounded-2xl bg-brand px-5 py-3 font-bold text-white">Save snippet</button>
      </form>
    </div>
  );
}

function AiPanel({ token, project }) {
  const [mode, setMode] = useState("summary");
  const [feature, setFeature] = useState("Build a secure invite link flow");
  const [assistant, setAssistant] = useState(null);
  const [reviewCodeText, setReviewCodeText] = useState("async function loadTasks() {\n  const res = await fetch('/api/tasks');\n  return res.json();\n}");
  const [review, setReview] = useState(null);

  async function runAssistant() {
    const payload = await request("/api/ai/project", {
      token,
      method: "POST",
      body: { projectId: project.id, mode, feature }
    });
    setAssistant(payload);
  }

  async function runReview() {
    const payload = await request("/api/ai/review", {
      token,
      method: "POST",
      body: { language: "javascript", code: reviewCodeText }
    });
    setReview(payload);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black">AI Project Assistant</h3>
            <p className="text-sm text-slate-500">Demo-mode output is deterministic and judge-safe.</p>
          </div>
        </div>
        <select
          className="mt-5 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        >
          <option value="summary">Project summary</option>
          <option value="blockers">Blocker report</option>
          <option value="standup">Standup report</option>
          <option value="breakdown">Task breakdown</option>
        </select>
        {mode === "breakdown" ? (
          <input
            className="mt-3 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3"
            value={feature}
            onChange={(event) => setFeature(event.target.value)}
          />
        ) : null}
        <button className="mt-4 flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 font-bold text-white" onClick={runAssistant}>
          <Sparkles size={18} />
          Generate
        </button>
        {assistant ? (
          <ResultCard title={assistant.title} badge={assistant.provider} items={assistant.bullets} />
        ) : null}
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
            <Code2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black">AI Code Reviewer</h3>
            <p className="text-sm text-slate-500">Returns a score, risks, and concrete suggestions.</p>
          </div>
        </div>
        <textarea
          className="mt-5 h-48 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 font-mono text-sm outline-none"
          value={reviewCodeText}
          onChange={(event) => setReviewCodeText(event.target.value)}
        />
        <button className="mt-4 flex items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 font-bold text-white" onClick={runReview}>
          <ShieldCheck size={18} />
          Review code
        </button>
        {review ? (
          <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">Quality score</p>
            <p className="text-5xl font-black text-teal-700">{review.score}/10</p>
            <ResultCard title="Issues" badge={review.provider} items={review.issues} compact />
            <ResultCard title="Suggestions" items={review.suggestions} compact />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ResultCard({ title, badge, items, compact = false }) {
  return (
    <div className={cx("rounded-2xl border border-line bg-slate-50 p-4", compact ? "mt-3" : "mt-5")}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-black text-ink">{title}</h4>
        {badge ? <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{badge}</span> : null}
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <Check className="mt-1 shrink-0 text-teal-700" size={16} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Billing() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <PlanCard
        title="Free"
        price="Rs. 0"
        items={["1 workspace", "3 projects", "5 members", "Kanban, wiki, snippets", "Community support"]}
      />
      <PlanCard
        highlighted
        title="Pro Sandbox"
        price="Rs. 499/mo"
        items={["Unlimited workspaces", "AI assistant", "AI code reviewer", "Priority demo support", "Analytics-ready exports"]}
      />
    </div>
  );
}

function PlanCard({ title, price, items, highlighted = false }) {
  const [upgraded, setUpgraded] = useState(false);
  return (
    <section className={cx("rounded-3xl border p-6 shadow-soft", highlighted ? "border-teal-300 bg-teal-900 text-white" : "border-line bg-white")}>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">{title}</h3>
        {highlighted ? <Crown className="text-amber-300" /> : null}
      </div>
      <p className={cx("mt-3 text-4xl font-black", highlighted ? "text-white" : "text-ink")}>{price}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className={cx("flex gap-2 text-sm", highlighted ? "text-teal-50" : "text-slate-600")}>
            <Check size={17} className={highlighted ? "text-amber-300" : "text-teal-700"} />
            {item}
          </li>
        ))}
      </ul>
      {highlighted ? (
        <button
          className="mt-6 w-full rounded-2xl bg-white px-5 py-3 font-black text-teal-900"
          onClick={() => setUpgraded(true)}
        >
          {upgraded ? "Sandbox upgrade activated" : "Simulate upgrade"}
        </button>
      ) : null}
    </section>
  );
}

function RightRail({ user, usersById, tasks, activity, notifications, token, setData }) {
  async function markRead(notification) {
    if (notification.read) return;
    const payload = await request(`/api/notifications/${notification.id}/read`, { token, method: "POST" });
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((item) => (item.id === notification.id ? payload.notification : item))
    }));
  }

  return (
    <aside className="space-y-5">
      <section className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-black">Notifications</h3>
          <Bell size={18} className="text-teal-700" />
        </div>
        <div className="mt-4 space-y-3">
          {notifications.slice(0, 5).map((item) => (
            <button
              key={item.id}
              className={cx(
                "w-full rounded-2xl border p-3 text-left text-sm",
                item.read ? "border-line bg-slate-50 text-slate-500" : "border-teal-200 bg-teal-50 text-teal-900"
              )}
              onClick={() => markRead(item)}
            >
              <p className="font-semibold">{item.message}</p>
              <p className="mt-1 text-xs opacity-70">{formatTime(item.createdAt)}</p>
            </button>
          ))}
          {!notifications.length ? <p className="text-sm text-slate-500">No notifications yet.</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-black">Activity Feed</h3>
          <Activity size={18} className="text-teal-700" />
        </div>
        <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
          {activity.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-semibold leading-5 text-slate-700">{item.message}</p>
              <p className="mt-1 text-xs text-slate-400">
                {usersById[item.actorId]?.name || user.name} · {formatTime(item.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-black">Demo Checklist</h3>
          <MessageSquare size={18} className="text-teal-700" />
        </div>
        <div className="mt-4 space-y-3">
          {[
            ["Task movement", tasks.some((task) => task.status === "done")],
            ["Mention notification", notifications.length > 0],
            ["AI assistant", true],
            ["Activity memory", activity.length > 0]
          ].map(([label, ok]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-600">{label}</span>
              <span className={cx("rounded-full px-2 py-1 text-xs font-black", ok ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500")}>
                {ok ? "Ready" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default App;
