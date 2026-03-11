const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const getTasks = () => req("/api/tasks");
export const createTask = (data) => req("/api/tasks", { method: "POST", body: JSON.stringify(data) });
export const updateTask = (id, data) => req(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteTask = (id) => req(`/api/tasks/${id}`, { method: "DELETE" });

export const getTags = () => req("/api/tags");
export const createTag = (data) => req("/api/tags", { method: "POST", body: JSON.stringify(data) });
export const deleteTag = (id) => req(`/api/tags/${id}`, { method: "DELETE" });
