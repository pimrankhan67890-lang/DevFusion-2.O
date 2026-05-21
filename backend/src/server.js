import "dotenv/config";
import http from "node:http";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { projectAssistant, reviewCode } from "./ai.js";
import {
  addActivity,
  addNotification,
  bootstrapPayload,
  createUser,
  db,
  findUserByEmail,
  findUserById,
  publicUser,
  statuses
} from "./store.js";

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 8080);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const jwtSecret = process.env.JWT_SECRET || "devcollab-local-secret";
const projectPresence = new Map();

const io = new Server(server, {
  cors: {
    origin: [clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
  }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

function sign(user) {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or missing token" });
  }
}

function emitProject(projectId, event, payload) {
  io.to(`project:${projectId}`).emit(event, payload);
}

function mentionNotifications({ body, actor, project }) {
  const bodyLower = body.toLowerCase();
  return db.users
    .filter((user) => user.id !== actor.id)
    .filter((user) => bodyLower.includes(`@${user.name.toLowerCase().split(" ")[0]}`) || bodyLower.includes(`@${user.email.split("@")[0].toLowerCase()}`))
    .map((user) =>
      addNotification({
        userId: user.id,
        type: "mention",
        message: `${actor.name} mentioned you in ${project.name}.`
      })
    );
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "devcollab-backend",
    mode: process.env.MONGO_URI ? "mongo-ready" : "demo-memory",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  return res.json({ token: sign(user), user: publicUser(user) });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (findUserByEmail(email)) return res.status(409).json({ error: "Email already registered" });
  const user = createUser({ name, email, password });
  return res.status(201).json({ token: sign(user), user: publicUser(user) });
});

app.get("/api/me", auth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get("/api/bootstrap", auth, (_req, res) => {
  res.json(bootstrapPayload());
});

app.post("/api/tasks", auth, (req, res) => {
  const task = {
    id: uuid(),
    projectId: req.body.projectId || db.projects[0].id,
    title: req.body.title || "Untitled task",
    description: req.body.description || "",
    status: statuses.includes(req.body.status) ? req.body.status : "todo",
    assignee: req.body.assignee || req.user.id,
    priority: req.body.priority || "P2",
    dueDate: req.body.dueDate || "",
    labels: req.body.labels || [],
    attachments: [],
    comments: []
  };
  db.tasks.unshift(task);
  const project = db.projects.find((item) => item.id === task.projectId);
  const activity = addActivity({
    workspaceId: project.workspaceId,
    projectId: task.projectId,
    actorId: req.user.id,
    type: "task.created",
    message: `${req.user.name} created task "${task.title}".`
  });
  emitProject(task.projectId, "task:updated", { task });
  emitProject(task.projectId, "activity:new", { activity });
  res.status(201).json({ task, activity });
});

app.patch("/api/tasks/:id", auth, (req, res) => {
  const task = db.tasks.find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  const before = task.status;
  Object.assign(task, {
    title: req.body.title ?? task.title,
    description: req.body.description ?? task.description,
    status: statuses.includes(req.body.status) ? req.body.status : task.status,
    assignee: req.body.assignee ?? task.assignee,
    priority: req.body.priority ?? task.priority,
    dueDate: req.body.dueDate ?? task.dueDate,
    labels: req.body.labels ?? task.labels
  });
  const project = db.projects.find((item) => item.id === task.projectId);
  const moved = before !== task.status;
  const activity = addActivity({
    workspaceId: project.workspaceId,
    projectId: task.projectId,
    actorId: req.user.id,
    type: moved ? "task.moved" : "task.updated",
    message: moved ? `${req.user.name} moved "${task.title}" to ${task.status}.` : `${req.user.name} updated "${task.title}".`
  });
  emitProject(task.projectId, moved ? "task:moved" : "task:updated", { task, activity });
  emitProject(task.projectId, "activity:new", { activity });
  res.json({ task, activity });
});

app.post("/api/tasks/:id/comments", auth, (req, res) => {
  const task = db.tasks.find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  const comment = {
    id: uuid(),
    userId: req.user.id,
    body: req.body.body || "",
    createdAt: new Date().toISOString()
  };
  task.comments.push(comment);
  const project = db.projects.find((item) => item.id === task.projectId);
  const notifications = mentionNotifications({ body: comment.body, actor: req.user, project });
  const activity = addActivity({
    workspaceId: project.workspaceId,
    projectId: task.projectId,
    actorId: req.user.id,
    type: "comment.created",
    message: `${req.user.name} commented on "${task.title}".`
  });
  emitProject(task.projectId, "comment:created", { task, comment, notifications });
  emitProject(task.projectId, "notification:new", { notifications });
  emitProject(task.projectId, "activity:new", { activity });
  res.status(201).json({ task, comment, notifications, activity });
});

app.post("/api/docs", auth, (req, res) => {
  const doc = {
    id: uuid(),
    projectId: req.body.projectId || db.projects[0].id,
    title: req.body.title || "Untitled page",
    content: req.body.content || "",
    versions: [],
    updatedAt: new Date().toISOString()
  };
  db.docs.unshift(doc);
  const project = db.projects.find((item) => item.id === doc.projectId);
  const activity = addActivity({
    workspaceId: project.workspaceId,
    projectId: doc.projectId,
    actorId: req.user.id,
    type: "doc.created",
    message: `${req.user.name} created wiki page "${doc.title}".`
  });
  emitProject(doc.projectId, "activity:new", { activity });
  res.status(201).json({ doc, activity });
});

app.patch("/api/docs/:id", auth, (req, res) => {
  const doc = db.docs.find((item) => item.id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Doc not found" });
  doc.versions.unshift({ id: uuid(), content: doc.content, createdAt: doc.updatedAt, userId: req.user.id });
  doc.title = req.body.title ?? doc.title;
  doc.content = req.body.content ?? doc.content;
  doc.updatedAt = new Date().toISOString();
  const project = db.projects.find((item) => item.id === doc.projectId);
  const activity = addActivity({
    workspaceId: project.workspaceId,
    projectId: doc.projectId,
    actorId: req.user.id,
    type: "doc.updated",
    message: `${req.user.name} updated wiki page "${doc.title}".`
  });
  emitProject(doc.projectId, "activity:new", { activity });
  res.json({ doc, activity });
});

app.post("/api/snippets", auth, (req, res) => {
  const snippet = {
    id: uuid(),
    projectId: req.body.projectId || db.projects[0].id,
    title: req.body.title || "Untitled snippet",
    language: req.body.language || "javascript",
    code: req.body.code || "",
    tags: req.body.tags || [],
    description: req.body.description || ""
  };
  db.snippets.unshift(snippet);
  const project = db.projects.find((item) => item.id === snippet.projectId);
  const activity = addActivity({
    workspaceId: project.workspaceId,
    projectId: snippet.projectId,
    actorId: req.user.id,
    type: "snippet.created",
    message: `${req.user.name} added snippet "${snippet.title}".`
  });
  emitProject(snippet.projectId, "activity:new", { activity });
  res.status(201).json({ snippet, activity });
});

app.post("/api/ai/project", auth, (req, res) => {
  res.json(projectAssistant(req.body));
});

app.post("/api/ai/review", auth, (req, res) => {
  res.json(reviewCode(req.body));
});

app.post("/api/notifications/:id/read", auth, (req, res) => {
  const notification = db.notifications.find((item) => item.id === req.params.id && item.userId === req.user.id);
  if (!notification) return res.status(404).json({ error: "Notification not found" });
  notification.read = true;
  res.json({ notification });
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = findUserById(payload.sub);
    if (!user) return next(new Error("Unauthorized"));
    socket.user = publicUser(user);
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.on("join-project", ({ projectId }) => {
    socket.join(`project:${projectId}`);
    const current = projectPresence.get(projectId) || new Map();
    current.set(socket.id, socket.user);
    projectPresence.set(projectId, current);
    io.to(`project:${projectId}`).emit("presence:update", {
      projectId,
      users: [...current.values()]
    });

    socket.on("disconnect", () => {
      const updated = projectPresence.get(projectId);
      if (!updated) return;
      updated.delete(socket.id);
      io.to(`project:${projectId}`).emit("presence:update", {
        projectId,
        users: [...updated.values()]
      });
    });
  });
});

server.listen(port, () => {
  console.log(`DevCollab backend running on http://localhost:${port}`);
});
