export const STATIC_TOKEN = "devcollab-static-demo-token";

const now = () => new Date().toISOString();
const storeKey = "devcollab_static_store";
const userKey = "devcollab_static_user";

const users = [
  {
    id: "user-imran",
    name: "Pathan Imran Khan",
    email: "imran@devcollab.demo",
    avatar: "PI",
    skills: ["Full-stack", "AI Integration", "System Design"],
    githubUrl: "https://github.com/pimrankhan67890-lang"
  },
  {
    id: "user-trivikram",
    name: "Nalikiri Trivikram",
    email: "trivikram@devcollab.demo",
    avatar: "NT",
    skills: ["Frontend", "UI/UX", "Realtime Systems"],
    githubUrl: "https://github.com/devcollab-demo"
  },
  {
    id: "user-riya",
    name: "Riya Sharma",
    email: "riya@devcollab.demo",
    avatar: "RS",
    skills: ["Backend", "Testing"],
    githubUrl: "https://github.com/riya-demo"
  }
];

function id(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function seedStaticStore() {
  return {
    users,
    workspaces: [
      {
        id: "ws-devfusion",
        name: "DevFusion Builders",
        members: [
          { userId: "user-imran", role: "Owner" },
          { userId: "user-trivikram", role: "Admin" },
          { userId: "user-riya", role: "Member" }
        ]
      }
    ],
    projects: [
      {
        id: "project-campus",
        workspaceId: "ws-devfusion",
        name: "Campus Connect Sprint",
        description: "GitHub Pages demo project proving the DevCollab workflow.",
        members: ["user-imran", "user-trivikram", "user-riya"]
      },
      {
        id: "project-launch",
        workspaceId: "ws-devfusion",
        name: "Launch Readiness",
        description: "Deployment, README, demo script, and final QA tracking.",
        members: ["user-imran", "user-trivikram"]
      }
    ],
    tasks: [
      {
        id: "task-auth",
        projectId: "project-campus",
        title: "Build login and seeded demo accounts",
        description: "Create auth flow with public demo credentials.",
        status: "done",
        assignee: "user-imran",
        priority: "P0",
        dueDate: "2026-05-23",
        labels: ["auth", "demo"],
        attachments: [],
        comments: [{ id: "comment-1", userId: "user-imran", body: "Demo users are ready.", createdAt: now() }]
      },
      {
        id: "task-socket",
        projectId: "project-campus",
        title: "Broadcast task movement with Socket.IO",
        description: "Backend version broadcasts live; static Pages demo updates locally.",
        status: "in_progress",
        assignee: "user-trivikram",
        priority: "P0",
        dueDate: "2026-05-24",
        labels: ["realtime"],
        attachments: [],
        comments: []
      },
      {
        id: "task-ai",
        projectId: "project-campus",
        title: "AI standup and blocker report",
        description: "Generate judge-friendly project intelligence from task state.",
        status: "in_review",
        assignee: "user-imran",
        priority: "P1",
        dueDate: "2026-05-25",
        labels: ["ai"],
        attachments: [],
        comments: []
      },
      {
        id: "task-wiki",
        projectId: "project-campus",
        title: "Project wiki with version history",
        description: "Keep architecture and decisions in one project memory.",
        status: "todo",
        assignee: "user-riya",
        priority: "P1",
        dueDate: "2026-05-25",
        labels: ["docs"],
        attachments: [],
        comments: []
      }
    ],
    docs: [
      {
        id: "doc-architecture",
        projectId: "project-campus",
        title: "Architecture Notes",
        content:
          "Frontend: React + Vite. Backend: Express + Socket.IO. GitHub Pages build includes static demo mode; Node backend can be deployed separately for true multi-user realtime.",
        versions: [{ id: "version-1", content: "Initial architecture notes.", createdAt: now(), userId: "user-imran" }],
        updatedAt: now()
      }
    ],
    snippets: [
      {
        id: "snippet-socket",
        projectId: "project-campus",
        title: "Socket event contract",
        language: "javascript",
        code: "socket.emit('join-project', { projectId });",
        tags: ["socket", "realtime"],
        description: "Project room join event used by the backend version."
      }
    ],
    activity: [
      {
        id: "activity-1",
        workspaceId: "ws-devfusion",
        projectId: "project-campus",
        actorId: "user-imran",
        type: "project.seeded",
        message: "Seeded DevFusion demo workspace.",
        createdAt: now()
      }
    ],
    notifications: [
      {
        id: "notification-1",
        userId: "user-trivikram",
        type: "mention",
        message: "Pathan Imran Khan mentioned you in Campus Connect Sprint.",
        read: false,
        createdAt: now()
      }
    ]
  };
}

export function isStaticToken(token) {
  return token === STATIC_TOKEN || localStorage.getItem("devcollab_static_mode") === "1";
}

function getStore() {
  const existing = localStorage.getItem(storeKey);
  if (existing) return JSON.parse(existing);
  const seeded = seedStaticStore();
  localStorage.setItem(storeKey, JSON.stringify(seeded));
  return seeded;
}

function saveStore(store) {
  localStorage.setItem(storeKey, JSON.stringify(store));
}

function currentUser(store) {
  const userId = localStorage.getItem(userKey) || "user-imran";
  return store.users.find((user) => user.id === userId) || store.users[0];
}

function activity(store, projectId, actorId, type, message) {
  const project = store.projects.find((item) => item.id === projectId) || store.projects[0];
  const item = {
    id: id("activity"),
    workspaceId: project.workspaceId,
    projectId,
    actorId,
    type,
    message,
    createdAt: now()
  };
  store.activity.unshift(item);
  return item;
}

function assistantResponse(store, { projectId, mode, feature }) {
  const project = store.projects.find((item) => item.id === projectId) || store.projects[0];
  const tasks = store.tasks.filter((task) => task.projectId === project.id);
  const p0 = tasks.filter((task) => task.priority === "P0" || task.status === "in_progress");
  if (mode === "breakdown") {
    return {
      provider: "github-pages-demo",
      title: `Task breakdown for: ${feature || "Build a feature"}`,
      bullets: [
        "Define user story and acceptance criteria.",
        "Create API/state contract.",
        "Build UI states and validation.",
        "Add activity and notification hooks.",
        "Test locally and record demo evidence."
      ]
    };
  }
  if (mode === "blockers") {
    return {
      provider: "github-pages-demo",
      title: "Current blockers",
      bullets: p0.map((task) => `${task.title} is on the critical path.`)
    };
  }
  if (mode === "standup") {
    return {
      provider: "github-pages-demo",
      title: "Daily standup report",
      bullets: [
        `${tasks.filter((task) => task.status === "done").length} tasks done.`,
        `${tasks.filter((task) => task.status === "in_progress").length} tasks in progress.`,
        "Focus today: demo task movement, mentions, wiki, snippets, and AI review."
      ]
    };
  }
  return {
    provider: "github-pages-demo",
    title: `${project.name} summary`,
    bullets: [
      `${tasks.length} tasks are tracked across the workflow.`,
      "Project memory includes tasks, docs, snippets, activity, and notifications.",
      "Backend source includes Express and Socket.IO for full realtime deployment.",
      "GitHub Pages mode keeps the live submission link functional without a server."
    ]
  };
}

function reviewResponse({ language = "javascript", code = "" }) {
  const issues = [];
  if (code.includes("eval(")) issues.push("Avoid eval because it creates security risk.");
  if ((code.includes("await") || code.includes("fetch")) && !code.includes("try")) {
    issues.push("Async code should include error handling.");
  }
  if (code.length < 80) issues.push("Add more context and validation before production use.");
  if (!issues.length) issues.push("Readable structure. Add tests for success and failure paths.");
  return {
    provider: "github-pages-demo",
    score: Math.max(6, 10 - issues.length),
    language,
    issues,
    suggestions: [
      "Validate inputs before mutating state.",
      "Emit activity for user-visible changes.",
      "Keep API and socket event contracts documented."
    ]
  };
}

export async function staticRequest(path, { method = "GET", body } = {}) {
  const store = getStore();
  const user = currentUser(store);

  if (path === "/api/auth/login" && method === "POST") {
    const found = store.users.find((item) => item.email.toLowerCase() === String(body.email).toLowerCase());
    if (!found || body.password !== "DevCollab@123") throw new Error("Invalid demo credentials");
    localStorage.setItem("devcollab_static_mode", "1");
    localStorage.setItem(userKey, found.id);
    return { token: STATIC_TOKEN, user: found };
  }
  if (path === "/api/me") return { user };
  if (path === "/api/bootstrap") return store;

  if (path === "/api/tasks" && method === "POST") {
    const task = {
      id: id("task"),
      projectId: body.projectId || store.projects[0].id,
      title: body.title || "Untitled task",
      description: body.description || "",
      status: body.status || "todo",
      assignee: body.assignee || user.id,
      priority: body.priority || "P2",
      dueDate: body.dueDate || "",
      labels: body.labels || [],
      attachments: [],
      comments: []
    };
    store.tasks.unshift(task);
    const event = activity(store, task.projectId, user.id, "task.created", `${user.name} created task "${task.title}".`);
    saveStore(store);
    return { task, activity: event };
  }

  const taskPatch = path.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskPatch && method === "PATCH") {
    const task = store.tasks.find((item) => item.id === taskPatch[1]);
    if (!task) throw new Error("Task not found");
    const before = task.status;
    Object.assign(task, body);
    const moved = before !== task.status;
    const event = activity(
      store,
      task.projectId,
      user.id,
      moved ? "task.moved" : "task.updated",
      moved ? `${user.name} moved "${task.title}" to ${task.status}.` : `${user.name} updated "${task.title}".`
    );
    saveStore(store);
    return { task, activity: event };
  }

  const commentPost = path.match(/^\/api\/tasks\/([^/]+)\/comments$/);
  if (commentPost && method === "POST") {
    const task = store.tasks.find((item) => item.id === commentPost[1]);
    if (!task) throw new Error("Task not found");
    const comment = { id: id("comment"), userId: user.id, body: body.body || "", createdAt: now() };
    task.comments.push(comment);
    const lower = comment.body.toLowerCase();
    const notifications = store.users
      .filter((item) => item.id !== user.id)
      .filter((item) => lower.includes(`@${item.name.toLowerCase().split(" ")[0]}`))
      .map((item) => ({
        id: id("notification"),
        userId: item.id,
        type: "mention",
        message: `${user.name} mentioned you in ${store.projects[0].name}.`,
        read: false,
        createdAt: now()
      }));
    store.notifications.unshift(...notifications);
    const event = activity(store, task.projectId, user.id, "comment.created", `${user.name} commented on "${task.title}".`);
    saveStore(store);
    return { task, comment, notifications, activity: event };
  }

  if (path === "/api/docs" && method === "POST") {
    const doc = {
      id: id("doc"),
      projectId: body.projectId,
      title: body.title || "Untitled page",
      content: body.content || "",
      versions: [],
      updatedAt: now()
    };
    store.docs.unshift(doc);
    const event = activity(store, doc.projectId, user.id, "doc.created", `${user.name} created wiki page "${doc.title}".`);
    saveStore(store);
    return { doc, activity: event };
  }

  const docPatch = path.match(/^\/api\/docs\/([^/]+)$/);
  if (docPatch && method === "PATCH") {
    const doc = store.docs.find((item) => item.id === docPatch[1]);
    if (!doc) throw new Error("Doc not found");
    doc.versions.unshift({ id: id("version"), content: doc.content, createdAt: doc.updatedAt, userId: user.id });
    doc.title = body.title ?? doc.title;
    doc.content = body.content ?? doc.content;
    doc.updatedAt = now();
    const event = activity(store, doc.projectId, user.id, "doc.updated", `${user.name} updated wiki page "${doc.title}".`);
    saveStore(store);
    return { doc, activity: event };
  }

  if (path === "/api/snippets" && method === "POST") {
    const snippet = { id: id("snippet"), projectId: body.projectId, ...body };
    store.snippets.unshift(snippet);
    const event = activity(store, snippet.projectId, user.id, "snippet.created", `${user.name} added snippet "${snippet.title}".`);
    saveStore(store);
    return { snippet, activity: event };
  }

  if (path === "/api/ai/project" && method === "POST") return assistantResponse(store, body);
  if (path === "/api/ai/review" && method === "POST") return reviewResponse(body);

  const readPost = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (readPost && method === "POST") {
    const notification = store.notifications.find((item) => item.id === readPost[1]);
    if (!notification) throw new Error("Notification not found");
    notification.read = true;
    saveStore(store);
    return { notification };
  }

  throw new Error(`Static demo route not implemented: ${method} ${path}`);
}
