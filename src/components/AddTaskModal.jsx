import { useState } from "react";

const PHASES = [
  { id: "p0", label: "Phase 0 — Setup" },
  { id: "p1", label: "Phase 1 — Auth" },
  { id: "p2", label: "Phase 2 — Content" },
  { id: "p3", label: "Phase 3 — Exam Engine" },
  { id: "p4", label: "Phase 4 — Result & Report" },
  { id: "p5", label: "Phase 5 — Polish & Beta" },
];

const PHASE_MODULES = {
  p0: ["Project Scaffold"],
  p1: ["Auth Module"],
  p2: ["Content Module"],
  p3: ["Exam Config", "Exam Session"],
  p4: ["Result Module", "Report / Feedback Sheet"],
  p5: ["Beta Prep"],
};

export default function AddTaskModal({ tags, onAdd, onClose }) {
  const [form, setForm] = useState({
    title: "", dev: "Akid", type: "BE", phaseId: "p0", module: "Project Scaffold", tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === "phaseId") next.module = PHASE_MODULES[val][0];
      return next;
    });
  };

  const toggleTag = (id) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter(t => t !== id) : [...f.tags, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setErr("Title is required.");
    setLoading(true);
    setErr("");
    try {
      await onAdd(form);
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#dde0f0" }}>New Task</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Title">
            <input style={input} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title" autoFocus />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Dev">
              <select style={input} value={form.dev} onChange={e => set("dev", e.target.value)}>
                <option value="Akid">Akid</option>
                <option value="Emon">Emon</option>
              </select>
            </Field>
            <Field label="Type">
              <select style={input} value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="BE">BE</option>
                <option value="FE">FE</option>
                <option value="BOTH">BOTH</option>
              </select>
            </Field>
          </div>

          <Field label="Phase">
            <select style={input} value={form.phaseId} onChange={e => set("phaseId", e.target.value)}>
              {PHASES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>

          <Field label="Module">
            <select style={input} value={form.module} onChange={e => set("module", e.target.value)}>
              {PHASE_MODULES[form.phaseId].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>

          {tags.length > 0 && (
            <Field label="Tags">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.map(tag => {
                  const active = form.tags.includes(tag._id);
                  return (
                    <button key={tag._id} type="button" onClick={() => toggleTag(tag._id)}
                      style={{
                        padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                        background: active ? `${tag.color}25` : "transparent",
                        border: `1px solid ${active ? tag.color : "#222235"}`,
                        color: active ? tag.color : "#444",
                        transition: "all .15s",
                      }}>
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          {err && <div style={errBox}>{err}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#333355", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 100, padding: 16,
};
const modal = {
  background: "#0e0e1a", border: "1px solid #1e1e2e", borderRadius: 12,
  padding: "24px 24px", width: "100%", maxWidth: 460,
  fontFamily: "'DM Mono',monospace",
};
const input = {
  width: "100%", background: "#09090f", border: "1px solid #1e1e2e",
  borderRadius: 6, padding: "8px 10px", color: "#dde0f0",
  fontFamily: "inherit", fontSize: 12.5, outline: "none",
};
const closeBtn = {
  background: "none", border: "none", color: "#333355",
  cursor: "pointer", fontSize: 14, padding: 4,
};
const errBox = {
  fontSize: 11, color: "#ef4444", background: "#ef444412",
  border: "1px solid #ef444430", borderRadius: 5, padding: "7px 10px",
};
const cancelBtn = {
  flex: 1, padding: "9px", background: "transparent", border: "1px solid #1e1e2e",
  color: "#555", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 12,
};
const submitBtn = {
  flex: 2, padding: "9px", background: "#6366f1", border: "none",
  color: "#fff", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
  fontSize: 12, fontWeight: 500,
};
