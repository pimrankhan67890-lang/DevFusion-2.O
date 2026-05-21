import { db, findUserById } from "./store.js";

function taskStats(projectId) {
  const tasks = db.tasks.filter((task) => task.projectId === projectId);
  const byStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  const blockers = tasks.filter((task) => task.status === "in_progress" || task.priority === "P0");
  return { tasks, byStatus, blockers };
}

export function projectAssistant({ projectId, mode, feature }) {
  const project = db.projects.find((item) => item.id === projectId) || db.projects[0];
  const { tasks, byStatus, blockers } = taskStats(project.id);
  const owner = (task) => findUserById(task.assignee)?.name || "Unassigned";

  if (mode === "breakdown") {
    const name = feature || "Build a login system";
    return {
      provider: "demo-mode",
      title: `Task breakdown for: ${name}`,
      bullets: [
        "Define user stories and acceptance criteria.",
        "Create database fields and validation rules.",
        "Build API endpoints and protected route middleware.",
        "Implement UI form states and error handling.",
        "Add realtime activity event when the feature changes project state.",
        "Write demo seed data and final QA checklist."
      ]
    };
  }

  if (mode === "blockers") {
    return {
      provider: "demo-mode",
      title: "Current blockers",
      bullets: blockers.slice(0, 4).map((task) => `${task.title} - ${owner(task)} should resolve ${task.priority} risk before final demo.`)
    };
  }

  if (mode === "standup") {
    return {
      provider: "demo-mode",
      title: "Daily standup report",
      bullets: [
        `Done: ${byStatus.done || 0} tasks completed.`,
        `In progress: ${byStatus.in_progress || 0} tasks actively moving.`,
        `In review: ${byStatus.in_review || 0} tasks ready for validation.`,
        "Focus today: prove realtime task movement and AI assistant flow in the live demo."
      ]
    };
  }

  return {
    provider: "demo-mode",
    title: `${project.name} summary`,
    bullets: [
      `${tasks.length} tasks are tracked across Kanban states.`,
      `Critical path: ${blockers[0]?.title || "No P0 blockers currently visible"}.`,
      "Project memory includes tasks, comments, wiki pages, snippets, activity, and notifications.",
      "Recommended judge demo: two-browser realtime board update, mention notification, AI standup, and code review."
    ]
  };
}

export function reviewCode({ language = "javascript", code = "" }) {
  const lower = code.toLowerCase();
  const issues = [];
  if (lower.includes("eval(")) issues.push("Avoid eval(); it creates security and debugging risk.");
  if (!lower.includes("try") && (lower.includes("fetch") || lower.includes("await"))) issues.push("Wrap async calls with error handling.");
  if (code.length < 80) issues.push("Snippet is short; add context, input validation, and expected failure handling.");
  if (!issues.length) issues.push("Structure is readable. Add tests for success and failure paths before merging.");

  return {
    provider: "demo-mode",
    score: Math.max(6, 10 - issues.length),
    language,
    issues,
    suggestions: [
      "Name functions by intent rather than implementation detail.",
      "Validate inputs before mutating project state.",
      "Emit an activity event after important user-visible changes."
    ]
  };
}
