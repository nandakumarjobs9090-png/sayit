import { useState } from "react";

const ACCENT = "#2D6A4F";
const SOFT = "#B7DFC7";
const BG = "#F0F4F0";
const TEXT = "#1A2E22";

const EMOTION_LIST = [
  "Nervous", "Scared", "Resentful", "Dismissed",
  "Unheard", "Hurt", "Conflicted", "Overwhelmed", "Angry", "Sad",
];

export default function App() {
  const [step, setStep] = useState(0);
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  const [emotions, setEmotions] = useState([]);
  const [need, setNeed] = useState("");
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const toggleEmotion = (e) =>
    setEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );

  const steps = [
    {
      q: "Who do you need to talk to?",
      hint: "e.g. My manager, my partner, my friend Alex…",
      valid: who.trim().length > 0,
      input: (
        <input
          autoFocus
          value={who}
          onChange={(e) => setWho(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && who.trim() && setStep(1)}
          placeholder="Type their name or role…"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = ACCENT)}
          onBlur={(e) => (e.target.style.borderColor = SOFT)}
        />
      ),
    },
    {
      q: `What do you need to tell ${who || "them"}?`,
      hint: "Be honest — no one else will read this.",
      valid: what.trim().length > 0,
      input: (
        <textarea
          autoFocus
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="Describe the situation in your own words…"
          rows={4}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "'Georgia', serif" }}
          onFocus={(e) => (e.target.style.borderColor = ACCENT)}
          onBlur={(e) => (e.target.style.borderColor = SOFT)}
        />
      ),
    },
    {
      q: "How does this make you feel?",
      hint: "Pick all that apply.",
      valid: emotions.length > 0,
      input: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "0.5rem" }}>
          {EMOTION_LIST.map((e) => {
            const sel = emotions.includes(e);
            return (
              <button
                key={e}
                onClick={() => toggleEmotion(e)}
                style={{
                  padding: "0.5rem 1.1rem",
                  borderRadius: "100px",
                  border: `1.5px solid ${sel ? ACCENT : SOFT}`,
                  background: sel ? ACCENT : "rgba(255,255,255,0.6)",
                  color: sel ? "#fff" : TEXT,
                  fontSize: "0.95rem",
                  fontFamily: "sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {e}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      q: "What do you need from this conversation?",
      hint: "The outcome that would make it worth having.",
      valid: need.trim().length > 0,
      input: (
        <textarea
          autoFocus
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          placeholder="e.g. I just want to be heard. / I need a concrete plan…"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "'Georgia', serif" }}
          onFocus={(e) => (e.target.style.borderColor = ACCENT)}
          onBlur={(e) => (e.target.style.borderColor = SOFT)}
        />
      ),
    },
  ];

  const current = steps[step];

  const buildScript = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a compassionate communication coach. Generate a personalized conversation blueprint. Be specific — use their words, reference their person and situation. Never be generic.

WHO: ${who}
SITUATION: ${what}
FEELINGS: ${emotions.join(", ")}
WHAT THEY NEED: ${need}

Respond in this EXACT format (labels in ALL CAPS):

OPENING LINE
One natural sentence they can say out loud to start. Warm, non-blaming, specific to their situation.

CORE MESSAGE
2-3 sentences using "I" statements. Reference their actual situation with ${who}.

BEST QUESTION TO ASK
One open question that invites ${who} to respond honestly.

IF IT GETS HARD
Two likely reactions and a short specific response for each. Format:
If [reaction]: "[what to say]"
If [reaction]: "[what to say]"

REMEMBER THIS
One short, powerful sentence of encouragement tied to their specific fear or hesitation.`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((i) => i.text || "").join("\n") || "";
      if (!text) throw new Error();
      setScript(text);
      setStep(4);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseScript = (raw) => {
    const labels = ["OPENING LINE", "CORE MESSAGE", "BEST QUESTION TO ASK", "IF IT GETS HARD", "REMEMBER THIS"];
    const icons = {
      "OPENING LINE": "🗣️",
      "CORE MESSAGE": "💬",
      "BEST QUESTION TO ASK": "❓",
      "IF IT GETS HARD": "🛡️",
      "REMEMBER THIS": "✦",
    };
    return labels
      .map((label, i) => {
        const start = raw.indexOf(label);
        if (start === -1) return null;
        const after = start + label.length;
        const next = labels.slice(i + 1).reduce((min, t) => {
          const idx = raw.indexOf(t, after);
          return idx !== -1 && idx < min ? idx : min;
        }, raw.length);
        return { label, icon: icons[label], content: raw.slice(after, next).trim().replace(/^[:\-\s]+/, "") };
      })
      .filter(Boolean);
  };

  const copyAll = () => {
    navigator.clipboard?.writeText(script || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const restart = () => {
    setStep(0); setWho(""); setWhat(""); setEmotions([]); setNeed(""); setScript(null); setError(null);
  };

  // Result screen
  if (step === 4 && script) {
    const sections = parseScript(script);
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={labelStyle}>SayIt · Your Blueprint</div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "normal", fontStyle: "italic" }}>
              Conversation with {who}
            </h2>
          </div>
          {sections.map(({ label, icon, content }) => (
            <div key={label} style={sectionBox}>
              <div style={sectionLabel}>{icon} {label}</div>
              <div style={{ fontSize: "1rem", lineHeight: "1.8", whiteSpace: "pre-wrap", fontStyle: label === "REMEMBER THIS" ? "italic" : "normal" }}>
                {content}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <button onClick={copyAll} style={outlineBtn}>{copied ? "✓ Copied!" : "📋 Copy"}</button>
            <button onClick={buildScript} disabled={loading} style={outlineBtn}>↻ Regenerate</button>
            <button onClick={restart} style={{ ...primaryBtn, marginLeft: "auto" }}>Start Over</button>
          </div>
        </div>
        <footer style={footerStyle}>SAYIT · PRIVATE · NO DATA STORED</footer>
      </div>
    );
  }

  // Steps
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "2rem" }}>
          {steps.map((_, i) => (
            <div key={i} style={{ height: "4px", flex: 1, borderRadius: "2px", background: i <= step ? ACCENT : SOFT, transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={labelStyle}>SayIt · Step {step + 1} of {steps.length}</div>
        <h2 style={{ margin: "0.25rem 0 1.5rem", fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: "normal", fontStyle: "italic", lineHeight: 1.3 }}>
          {current.q}
        </h2>
        <div style={{ fontSize: "0.85rem", opacity: 0.5, fontFamily: "sans-serif", marginBottom: "1.2rem", marginTop: "-0.8rem" }}>
          {current.hint}
        </div>
        {current.input}
        {error && <div style={{ color: "#c0392b", fontFamily: "sans-serif", fontSize: "0.85rem", marginTop: "1rem" }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
          {step > 0 ? <button onClick={() => setStep((s) => s - 1)} style={ghostBtn}>← Back</button> : <span />}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!current.valid} style={current.valid ? primaryBtn : disabledBtn}>
              Continue →
            </button>
          ) : (
            <button onClick={buildScript} disabled={!current.valid || loading} style={current.valid && !loading ? primaryBtn : disabledBtn}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={spinnerStyle} /> Building your script…
                </span>
              ) : "✦ Build My Script"}
            </button>
          )}
        </div>
      </div>
      <footer style={footerStyle}>SAYIT · PRIVATE · NO DATA STORED</footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "'Georgia', serif", color: TEXT };
const cardStyle = { width: "100%", maxWidth: "560px", background: "rgba(255,255,255,0.75)", border: `1.5px solid ${SOFT}`, borderRadius: "16px", padding: "2.5rem", boxShadow: "0 4px 32px rgba(45,106,79,0.07)" };
const inputStyle = { width: "100%", padding: "0.9rem 1rem", border: `1.5px solid ${SOFT}`, borderRadius: "8px", background: "rgba(255,255,255,0.7)", color: TEXT, fontSize: "1rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" };
const primaryBtn = { padding: "0.75rem 2rem", border: "none", borderRadius: "8px", background: ACCENT, color: "#fff", fontSize: "1rem", fontFamily: "sans-serif", fontWeight: "600", cursor: "pointer", letterSpacing: "0.02em" };
const disabledBtn = { ...primaryBtn, background: SOFT, color: TEXT, cursor: "not-allowed", opacity: 0.6 };
const ghostBtn = { padding: "0.75rem 1.2rem", border: `1.5px solid ${SOFT}`, borderRadius: "8px", background: "transparent", color: TEXT, fontSize: "0.9rem", fontFamily: "sans-serif", cursor: "pointer" };
const outlineBtn = { padding: "0.65rem 1.4rem", border: `1.5px solid ${ACCENT}`, borderRadius: "8px", background: "transparent", color: ACCENT, fontSize: "0.9rem", fontFamily: "sans-serif", cursor: "pointer" };
const sectionBox = { marginBottom: "1.2rem", padding: "1rem 1.2rem", background: "rgba(240,244,240,0.8)", border: `1px solid ${SOFT}`, borderRadius: "8px" };
const sectionLabel = { fontSize: "0.68rem", fontFamily: "sans-serif", letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT, marginBottom: "0.5rem", fontWeight: "700" };
const labelStyle = { fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.45, fontFamily: "sans-serif", marginBottom: "0.3rem" };
const footerStyle = { marginTop: "1.5rem", fontSize: "0.65rem", letterSpacing: "0.15em", opacity: 0.3, fontFamily: "sans-serif" };
const spinnerStyle = { width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" };
