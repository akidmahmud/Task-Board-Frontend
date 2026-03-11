import { useState, useEffect, useRef } from "react";
import Login from "./Login";
import AddTaskModal from "./components/AddTaskModal";
import TagsManager from "./components/TagsManager";
import * as api from "./api";

const PHASES = [
  { id: "p0", label: "Phase 0 — Setup",          duration: "Day 1–2",   color: "#6366f1" },
  { id: "p1", label: "Phase 1 — Auth",            duration: "Day 3–5",   color: "#f59e0b" },
  { id: "p2", label: "Phase 2 — Content",         duration: "Day 6–9",   color: "#10b981" },
  { id: "p3", label: "Phase 3 — Exam Engine",     duration: "Day 10–15", color: "#ef4444" },
  { id: "p4", label: "Phase 4 — Result & Report", duration: "Day 16–19", color: "#8b5cf6" },
  { id: "p5", label: "Phase 5 — Polish & Beta",   duration: "Day 20–21", color: "#0ea5e9" },
];

const TYPE_COLORS = { BE: "#f97316", FE: "#06b6d4", BOTH: "#a855f7" };
const DEV_COLORS  = { Akid: "#6366f1", Emon: "#10b981" };

export default function App() {
  const [user, setUser] = useState(() => sessionStorage.getItem("auth_user"));

  const [tasks,    setTasks]    = useState([]);
  const [tags,     setTags]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [devFilter,  setDevFilter]  = useState("ALL");
  const [expanded,   setExpanded]   = useState({ p0:true,p1:true,p2:true,p3:true,p4:true,p5:true });

  const [showAddTask,    setShowAddTask]    = useState(false);
  const [showTagsManager, setShowTagsManager] = useState(false);
  const [tagPickerTask,  setTagPickerTask]  = useState(null); // task _id with picker open

  const tagPickerRef = useRef(null);

  // Close tag picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (tagPickerRef.current && !tagPickerRef.current.contains(e.target)) {
        setTagPickerTask(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.getTasks(), api.getTags()])
      .then(([t, tg]) => { setTasks(t); setTags(tg); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [user]);

  if (!user) return <Login onLogin={setUser} />;

  const handleLogout = () => { sessionStorage.removeItem("auth_user"); setUser(null); };

  const handleToggleDone = async (task) => {
    const updated = await api.updateTask(task._id, { done: !task.done });
    setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
  };

  const handleDeleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const handleCreateTask = async (data) => {
    const task = await api.createTask(data);
    setTasks(prev => [...prev, task]);
    setShowAddTask(false);
  };

  const handleToggleTagOnTask = async (task, tagId) => {
    const currentIds = task.tags.map(tg => tg._id || tg);
    const newIds = currentIds.includes(tagId)
      ? currentIds.filter(id => id !== tagId)
      : [...currentIds, tagId];
    const updated = await api.updateTask(task._id, { tags: newIds });
    setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
  };

  const handleCreateTag = async (data) => {
    const tag = await api.createTag(data);
    setTags(prev => [...prev, tag]);
  };

  const handleDeleteTag = async (id) => {
    await api.deleteTag(id);
    setTags(prev => prev.filter(t => t._id !== id));
    setTasks(prev => prev.map(t => ({
      ...t,
      tags: t.tags.filter(tg => (tg._id || tg) !== id),
    })));
  };

  const passFilter = (t) =>
    (typeFilter === "ALL" || t.type === typeFilter) &&
    (devFilter  === "ALL" || t.dev  === devFilter);

  const allTasks  = tasks;
  const totalDone = allTasks.filter(t => t.done).length;
  const progress  = allTasks.length ? Math.round((totalDone / allTasks.length) * 100) : 0;

  // Group tasks by phase → module
  const groupedPhases = PHASES.map(phase => {
    const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
    const moduleMap = {};
    phaseTasks.forEach(t => {
      if (!moduleMap[t.module]) moduleMap[t.module] = [];
      moduleMap[t.module].push(t);
    });
    const modules = Object.entries(moduleMap).map(([name, tasks]) => ({ name, tasks }));
    return { ...phase, modules };
  });

  return (
    <div style={{ minHeight:"100vh", background:"#09090f", color:"#dde0f0", fontFamily:"'DM Mono',monospace", padding:"28px 16px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .fbtn{border:1px solid #222235;background:transparent;color:#555;padding:3px 11px;border-radius:4px;cursor:pointer;font-family:inherit;font-size:11px;transition:all .15s}
        .fbtn:hover{border-color:#333355;color:#aaa}
        .frow{transition:background .1s;position:relative}
        .frow:hover{background:#0f0f1a!important}
        .frow:hover .del-btn{opacity:1!important}
        .chk{width:17px;height:17px;min-width:17px;border-radius:4px;border:1.5px solid #2a2a45;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;margin-top:2px;flex-shrink:0}
        .chk.on{background:#22c55e;border-color:#22c55e}
        .phdr{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#0e0e1a;cursor:pointer;transition:background .1s}
        .phdr:hover{background:#12121f}
        .del-btn{opacity:0;transition:opacity .15s;background:none;border:none;color:#333355;cursor:pointer;font-size:13px;padding:2px 5px;flex-shrink:0}
        .del-btn:hover{color:#ef4444!important}
        .tag-badge{font-size:10px;padding:1px 7px;border-radius:3px;white-space:nowrap}
        .tag-pick-btn{background:none;border:1px solid #1e1e2e;color:#333355;border-radius:3px;cursor:pointer;font-size:10px;padding:1px 6px;font-family:inherit;transition:all .15s;flex-shrink:0}
        .tag-pick-btn:hover{border-color:#333355;color:#888}
        .action-btn{background:transparent;border:1px solid #1e1e2e;color:#555;padding:4px 12px;border-radius:5px;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;transition:all .15s;white-space:nowrap}
        .action-btn:hover{border-color:#6366f1;color:#6366f1}
        .logout-btn{background:transparent;border:1px solid #1e1e2e;color:#333355;padding:4px 12px;border-radius:4px;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;transition:all .15s}
        .logout-btn:hover{border-color:#ef444440;color:#ef4444}
      `}</style>

      <div style={{ maxWidth:860, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, letterSpacing:"-0.5px", marginBottom:4 }}>
              Implementation Board
            </div>
            <div style={{ color:"#3a3a5a", fontSize:12 }}>
              Exam App MVP · April 21 deadline · Akid + Emon · Node.js + React Native
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:4 }}>
            <span style={{ fontSize:11, color:"#333355" }}>{user}</span>
            <button className="logout-btn" onClick={handleLogout}>sign out</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", color:"#333355", padding:"60px 0", fontSize:12 }}>Loading...</div>
        ) : error ? (
          <div style={{ textAlign:"center", color:"#ef4444", padding:"60px 0", fontSize:12 }}>
            Failed to connect to backend.<br />
            <span style={{ color:"#333355", fontSize:11 }}>{error}</span>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:11, color:"#444" }}>
                <span>PROGRESS</span>
                <span style={{ color:"#888" }}>{totalDone}/{allTasks.length} tasks · {progress}%</span>
              </div>
              <div style={{ height:3, background:"#16161f", borderRadius:2 }}>
                <div style={{ height:3, background:"linear-gradient(90deg,#6366f1,#10b981)", borderRadius:2, width:`${progress}%`, transition:"width .4s" }} />
              </div>
            </div>

            {/* Dev cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
              {["Akid","Emon"].map(dev => {
                const devTasks = allTasks.filter(t => t.dev === dev);
                const dc  = devTasks.filter(t => t.done).length;
                const pct = devTasks.length ? Math.round((dc/devTasks.length)*100) : 0;
                return (
                  <div key={dev} style={{ background:"#0e0e1a", border:`1px solid ${DEV_COLORS[dev]}22`, borderRadius:8, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:DEV_COLORS[dev], fontSize:15 }}>{dev}</span>
                      <span style={{ fontSize:11, color:"#444" }}>{dc}/{devTasks.length} · {pct}%</span>
                    </div>
                    <div style={{ height:2, background:"#16161f", borderRadius:2, marginBottom:8 }}>
                      <div style={{ height:2, background:DEV_COLORS[dev], borderRadius:2, width:`${pct}%`, transition:"width .4s" }} />
                    </div>
                    <div style={{ fontSize:11, color:"#444", fontStyle:"italic" }}>
                      {dev==="Akid" ? "APIs · DB · Deploy · PDF gen" : "RN Screens · Navigation · UX"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toolbar */}
            <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#333" }}>TYPE</span>
                  {["ALL","BE","FE","BOTH"].map(f => (
                    <button key={f} className="fbtn" onClick={() => setTypeFilter(f)}
                      style={ typeFilter===f ? { borderColor:f==="ALL"?"#333355":TYPE_COLORS[f], color:f==="ALL"?"#ccc":TYPE_COLORS[f], background:"#13131e" } : {} }>
                      {f}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#333" }}>DEV</span>
                  {["ALL","Akid","Emon"].map(f => (
                    <button key={f} className="fbtn" onClick={() => setDevFilter(f)}
                      style={ devFilter===f ? { borderColor:f==="ALL"?"#333355":DEV_COLORS[f], color:f==="ALL"?"#ccc":DEV_COLORS[f], background:"#13131e" } : {} }>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="action-btn" onClick={() => setShowTagsManager(true)}>
                  Tags {tags.length > 0 && <span style={{ color:"#333355" }}>({tags.length})</span>}
                </button>
                <button className="action-btn" onClick={() => setShowAddTask(true)}
                  style={{ borderColor:"#6366f130", color:"#6366f1", background:"#6366f108" }}>
                  + New Task
                </button>
              </div>
            </div>

            {/* Phases */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {groupedPhases.map(phase => {
                const visible = phase.modules.flatMap(m => m.tasks).filter(passFilter);
                if (!visible.length) return null;
                const pdone = visible.filter(t => t.done).length;
                return (
                  <div key={phase.id} style={{ border:"1px solid #16161f", borderRadius:10, overflow:"hidden" }}>
                    <div className="phdr" onClick={() => setExpanded(p => ({ ...p, [phase.id]: !p[phase.id] }))}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:phase.color, flexShrink:0 }} />
                        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{phase.label}</span>
                        <span style={{ fontSize:10, color:"#333", background:"#13131e", padding:"2px 8px", borderRadius:3, border:"1px solid #1e1e2e" }}>{phase.duration}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:11, color:"#444" }}>{pdone}/{visible.length}</span>
                        <span style={{ color:"#333", fontSize:11 }}>{expanded[phase.id]?"▲":"▼"}</span>
                      </div>
                    </div>

                    {expanded[phase.id] && phase.modules.map(mod => {
                      const mtasks = mod.tasks.filter(passFilter);
                      if (!mtasks.length) return null;
                      return (
                        <div key={mod.name}>
                          <div style={{ padding:"5px 16px", fontSize:10, color:"#333", background:"#0b0b15", letterSpacing:"0.1em", textTransform:"uppercase", borderTop:"1px solid #13131e" }}>
                            {mod.name}
                          </div>
                          {mtasks.map((task, i) => {
                            const taskTags = task.tags || [];
                            const isPickerOpen = tagPickerTask === task._id;
                            return (
                              <div key={task._id} className="frow"
                                style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 16px", background:i%2===0?"#09090f":"#0b0b14", borderTop:"1px solid #111120" }}>

                                {/* Checkbox */}
                                <div className={`chk${task.done?" on":""}`} onClick={() => handleToggleDone(task)}>
                                  {task.done && <span style={{ color:"#fff", fontSize:10, fontWeight:"bold" }}>✓</span>}
                                </div>

                                {/* Title + tags row */}
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:12.5, color:task.done?"#2a2a45":"#c0c4de", textDecoration:task.done?"line-through":"none", lineHeight:1.55, marginBottom: taskTags.length ? 6 : 0 }}>
                                    {task.title}
                                  </div>
                                  {taskTags.length > 0 && (
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                                      {taskTags.map(tg => (
                                        <span key={tg._id || tg} className="tag-badge"
                                          style={{ background:`${tg.color}18`, color:tg.color, border:`1px solid ${tg.color}30` }}>
                                          {tg.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Right side: tag picker + type/dev badges + delete */}
                                <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0, position:"relative" }}>

                                  {/* Tag picker toggle */}
                                  {tags.length > 0 && (
                                    <div ref={isPickerOpen ? tagPickerRef : null} style={{ position:"relative" }}>
                                      <button className="tag-pick-btn" onClick={() => setTagPickerTask(isPickerOpen ? null : task._id)}>
                                        {isPickerOpen ? "×" : "tag"}
                                      </button>
                                      {isPickerOpen && (
                                        <div style={{
                                          position:"absolute", right:0, top:"calc(100% + 6px)",
                                          background:"#0e0e1a", border:"1px solid #1e1e2e",
                                          borderRadius:8, padding:"8px", zIndex:50,
                                          minWidth:140, display:"flex", flexDirection:"column", gap:4,
                                        }}>
                                          {tags.map(tg => {
                                            const active = taskTags.some(t => (t._id||t) === tg._id);
                                            return (
                                              <button key={tg._id} onClick={() => handleToggleTagOnTask(task, tg._id)}
                                                style={{
                                                  display:"flex", alignItems:"center", gap:6,
                                                  background: active?`${tg.color}15`:"transparent",
                                                  border:`1px solid ${active?tg.color:"#1e1e2e"}`,
                                                  borderRadius:4, padding:"4px 8px", cursor:"pointer",
                                                  fontFamily:"inherit", fontSize:11, color:active?tg.color:"#555",
                                                  transition:"all .1s", textAlign:"left",
                                                }}>
                                                <div style={{ width:7, height:7, borderRadius:"50%", background:tg.color, flexShrink:0 }} />
                                                {tg.name}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:3, background:`${TYPE_COLORS[task.type]}15`, color:TYPE_COLORS[task.type], border:`1px solid ${TYPE_COLORS[task.type]}30` }}>
                                    {task.type}
                                  </span>
                                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:3, background:`${DEV_COLORS[task.dev]}15`, color:DEV_COLORS[task.dev], border:`1px solid ${DEV_COLORS[task.dev]}30`, fontWeight:600 }}>
                                    {task.dev}
                                  </span>
                                  <button className="del-btn" onClick={() => handleDeleteTask(task._id)} title="Delete task">✕</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:24, textAlign:"center", fontSize:11, color:"#1e1e2e" }}>
              {allTasks.length} tasks · 21 days · Akid + Emon
            </div>
          </>
        )}
      </div>

      {showAddTask && (
        <AddTaskModal
          tags={tags}
          onAdd={handleCreateTask}
          onClose={() => setShowAddTask(false)}
        />
      )}
      {showTagsManager && (
        <TagsManager
          tags={tags}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
          onClose={() => setShowTagsManager(false)}
        />
      )}
    </div>
  );
}
