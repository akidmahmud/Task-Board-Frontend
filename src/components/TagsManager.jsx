import { useState } from "react";

const PRESET_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#0ea5e9", "#f97316", "#06b6d4",
  "#ec4899", "#84cc16",
];

export default function TagsManager({ tags, onCreateTag, onDeleteTag, onClose }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setErr("Tag name is required.");
    setLoading(true);
    setErr("");
    try {
      await onCreateTag({ name: name.trim(), color });
      setName("");
      setColor(PRESET_COLORS[0]);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#dde0f0" }}>Manage Tags</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Existing tags */}
        {tags.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#333355", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Existing Tags
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tags.map(tag => (
                <div key={tag._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "#09090f", borderRadius: 6, border: "1px solid #13131e" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#c0c4de" }}>{tag.name}</span>
                  </div>
                  <button onClick={() => onDeleteTag(tag._id)} style={deleteBtnStyle} title="Delete tag">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create tag form */}
        <div style={{ fontSize: 10, color: "#333355", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          New Tag
        </div>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={inputStyle}
            value={name}
            onChange={e => { setName(e.target.value); setErr(""); }}
            placeholder="Tag name"
            maxLength={24}
          />
          <div>
            <div style={{ fontSize: 10, color: "#333355", marginBottom: 8 }}>Color</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  style={{
                    width: 22, height: 22, borderRadius: "50%", background: c,
                    border: color === c ? `2px solid #fff` : "2px solid transparent",
                    cursor: "pointer", padding: 0, flexShrink: 0,
                  }} />
              ))}
            </div>
          </div>

          {err && <div style={errBox}>{err}</div>}

          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? "Creating..." : "Create Tag"}
          </button>
        </form>
      </div>
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
  padding: "24px 24px", width: "100%", maxWidth: 380,
  fontFamily: "'DM Mono',monospace", maxHeight: "80vh", overflowY: "auto",
};
const closeBtn = {
  background: "none", border: "none", color: "#333355",
  cursor: "pointer", fontSize: 14, padding: 4,
};
const deleteBtnStyle = {
  background: "none", border: "none", color: "#333355",
  cursor: "pointer", fontSize: 11, padding: "2px 4px",
  transition: "color .15s", lineHeight: 1,
};
const inputStyle = {
  width: "100%", background: "#09090f", border: "1px solid #1e1e2e",
  borderRadius: 6, padding: "8px 10px", color: "#dde0f0",
  fontFamily: "inherit", fontSize: 12.5, outline: "none",
};
const errBox = {
  fontSize: 11, color: "#ef4444", background: "#ef444412",
  border: "1px solid #ef444430", borderRadius: 5, padding: "7px 10px",
};
const submitBtn = {
  width: "100%", padding: "9px", background: "#6366f1", border: "none",
  color: "#fff", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
  fontSize: 12, fontWeight: 500,
};
