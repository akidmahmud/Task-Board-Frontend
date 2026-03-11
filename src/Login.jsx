import { useState } from "react";

const USERS = [
  { username: "akid", password: "akid1717" },
  { username: "emon", password: "emon123" },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const match = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (match) {
      sessionStorage.setItem("auth_user", match.username);
      onLogin(match.username);
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Mono', monospace",
      padding: "16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .login-input {
          width: 100%;
          background: #0e0e1a;
          border: 1px solid #1e1e2e;
          border-radius: 6px;
          padding: 10px 12px;
          color: #dde0f0;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color .15s;
        }
        .login-input:focus { border-color: #6366f1; }
        .login-input::placeholder { color: #2a2a45; }
        .login-btn {
          width: 100%;
          padding: 10px;
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background .15s;
          letter-spacing: 0.04em;
        }
        .login-btn:hover { background: #4f52d4; }
        .pass-wrap { position: relative; }
        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #333355;
          cursor: pointer;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          padding: 0;
          transition: color .15s;
        }
        .pass-toggle:hover { color: #6366f1; }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 360,
        background: "#0e0e1a",
        border: "1px solid #16161f",
        borderRadius: 12,
        padding: "32px 28px",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.5px",
            color: "#dde0f0",
            marginBottom: 6,
          }}>
            Implementation Board
          </div>
          <div style={{ fontSize: 11, color: "#2a2a45" }}>
            sign in to continue
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "#333355", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
              Username
            </div>
            <input
              className="login-input"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#333355", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
              Password
            </div>
            <div className="pass-wrap">
              <input
                className="login-input"
                type={showPass ? "text" : "password"}
                placeholder="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                autoComplete="current-password"
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? "hide" : "show"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: 11,
              color: "#ef4444",
              background: "#ef444412",
              border: "1px solid #ef444430",
              borderRadius: 5,
              padding: "7px 10px",
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" style={{ marginTop: 4 }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
