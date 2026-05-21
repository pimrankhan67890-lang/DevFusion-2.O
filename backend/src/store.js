import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const now = () => new Date().toISOString();

function personInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const passwordHash = bcrypt.hashSync("DevCollab@123", 10);

export const db = {
  users: [
    {
      id: "user-imran",
      name: "Pathan Imran Khan",
      email: "imran@devcollab.demo",
      passwordHash,
      avatar: "PI",
      skills: ["Full-stack", "AI Integration", "System Design"],
      githubUrl: "https://github.com/p-imrankhan67890"
    },
    {
      id: "user-trivikram",
      name: "Nalikiri Trivikram",
      email: "trivikram@devcollab.demo",
      passwordHash,
      avatar: "NT",
      skills: ["Frontend", "UI/UX", "Realtime Systems"],
      githubUrl: "https://github.com/devcollab-demo"
    },
    {
      id: "user-riya",
      name: "Riya Sharma",
      email: "riya@devcollab.demo",
      passwordHash,
      avatar: "RS",
      skills: ["Backend", "Testing"],
      githubUrl: "https://github.com/riya-demo"
    }
  ],
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
      description: "Demo project used to prove DevCollab's live collaboration loop.",
      members: ["user-imran", "user-trivikram", "user-riya"]
    },
    {
      id: "project-launch",
      workspaceId: "ws-devfusion",
      name: "Launch Readiness",
      description: "Deployment, README, demo script and final QA tracking.",
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
      comments: [
        {
          id: "comment-1",
          userId: "user-imran",
          body: "Demo users are ready for the judging flow.",
          createdAt: now()
        }
      ]
    },
    {
      id: "task-socket",
      projectId: "project-campus",
      title: "Broadcast task movement with Socket.IO",
      description: "Moving a task in one browser should update the second browser.",
      status: "in_progress",
      assignee: "user-trivikram",
      priority: "P0",
      dueDate: "2026-05-24",
      labels: ["realtime", "socket.io"],
      attachments: [],
      comments: []
    },
    {
      id: "task-ai",
      projectId: "project-campus",
      title: "AI standup and blocker report",
      description: "Generate status summary using task state and stale work.",
      status: "in_review",
      assignee: "user-imran",
      priority: "P1",
      dueDate: "2026-05-25",
      labels: ["ai", "assistant"],
      attachments: [],
      comments: []
    },
    {
      id: "task-wiki",
      projectId: "project-campus",
      title: "Project wiki with version history",
      description: "Keep decisions, architecture notes and deployment checklist in one project context.",
      status: "todo",
      assignee: "user-riya",
      priority: "P1",
      dueDate: "2026-05-25",
      labels: ["docs"],
      attachments: [],
      comments: []
    },
    {
      id: "task-snippets",
      projectId: "project-campus",
      title: "Snippet manager search and copy",
      description: "Store reusable code with language and tags.",
      status: "todo",
      assignee: "user-trivikram",
      priority: "P2",
      dueDate: "2026-05-26",
      labels: ["snippets"],
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
        "Frontend: React + Vite. Backend: Express + Socket.IO. Data is project-scoped. Every mutation writes activity. Socket events update connected users immediately.",
      versions: [
        {
          id: "version-1",
          content: "Initial architecture notes created for the DevFusion demo.",
          createdAt: now(),
          userId: "user-imran"
        }
      ],
      updatedAt: now()
    }
  ],
  snippets: [
    {
      id: "snippet-socket",
      projectId: "project-campus",
      title: "Socket event contract",
      language: "javascript",
      code: "socket.emit('task:moved', { taskId, status, projectId });",
      tags: ["socket", "realtime"],
      description: "Canonical event emitted when a task changes status."
    },
    {
      id: "snippet-jwt",
      projectId: "project-campus",
      title: "JWT auth header",
      language: "javascript",
      code: "Authorization: `Bearer ${token}`",
      tags: ["auth", "api"],
      description: "Header format used by protected REST endpoints."
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

export const statuses = ["todo", "in_progress", "in_review", "done"];

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export function findUserByEmail(email) {
  return db.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
}

export function findUserById(id) {
  return db.users.find((user) => user.id === id);
}

export function createUser({ name, email, password }) {
  const user = {
    id: uuid(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    avatar: personInitials(name),
    skills: [],
    githubUrl: ""
  };
  db.users.push(user);
  db.workspaces[0].members.push({ userId: user.id, role: "Member" });
  db.projects[0].members.push(user.id);
  addActivity({
    workspaceId: db.workspaces[0].id,
    projectId: db.projects[0].id,
    actorId: user.id,
    type: "member.joined",
    message: `${user.name} joined the demo workspace.`
  });
  return user;
}

export function addActivity({ workspaceId, projectId, actorId, type, message }) {
  const activity = {
    id: uuid(),
    workspaceId,
    projectId,
    actorId,
    type,
    message,
    createdAt: now()
  };
  db.activity.unshift(activity);
  return activity;
}

export function addNotification({ userId, type, message }) {
  const notification = {
    id: uuid(),
    userId,
    type,
    message,
    read: false,
    createdAt: now()
  };
  db.notifications.unshift(notification);
  return notification;
}

export function bootstrapPayload() {
  return {
    users: db.users.map(publicUser),
    workspaces: db.workspaces,
    projects: db.projects,
    tasks: db.tasks,
    docs: db.docs,
    snippets: db.snippets,
    activity: db.activity,
    notifications: db.notifications
  };
}
