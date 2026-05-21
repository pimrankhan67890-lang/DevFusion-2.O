const baseUrl = process.env.API_URL || "http://localhost:8080";

async function call(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path} failed: ${body.error || response.statusText}`);
  return body;
}

const health = await call("/health");
const login = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email: "imran@devcollab.demo",
    password: "DevCollab@123"
  })
});
const token = login.token;
const headers = { Authorization: `Bearer ${token}` };
const boot = await call("/api/bootstrap", { headers });
const projectId = boot.projects[0].id;
const task = await call("/api/tasks", {
  method: "POST",
  headers,
  body: JSON.stringify({ projectId, title: "Smoke test task", priority: "P2", status: "todo" })
});
await call(`/api/tasks/${task.task.id}`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ status: "in_progress" })
});
await call("/api/ai/project", {
  method: "POST",
  headers,
  body: JSON.stringify({ projectId, mode: "summary" })
});

console.log(
  JSON.stringify(
    {
      ok: true,
      health: health.ok,
      user: login.user.email,
      projectId,
      taskCreated: task.task.title
    },
    null,
    2
  )
);
