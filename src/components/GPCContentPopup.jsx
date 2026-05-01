import { useState, useCallback } from "react";
import { updateSeoLink } from "../store/Slices/orders";
import { useDispatch } from "react-redux";

export default function GPCContentPopup({
  data,
  onClose,
  website,
  orderId,
  linkId,
  link,
}) {
  const sections = data?.data?.humanizer_response?.sections || [];
  const aiScore = data?.data?.ai_score ?? 34;
  const humanizedScore = data?.data?.human_score.toFixed(2) ?? 66;

  const [selected, setSelected] = useState({});
  const [prevSelected, setPrevSelected] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [humanizingAll, setHumanizingAll] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  // Dynamic publishing domain based on passed website
  const publishDomain = website
    ? website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "www.mailsextract.com";

  const setValue = useCallback((key, val, currentSelected) => {
    const current = currentSelected ?? null;
    setPrevSelected((p) => ({ ...p, [key]: current }));
    setSelected((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
  }, []);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const undoKey = (key) => {
    if (!(key in prevSelected)) return;
    setSelected((prev) => ({ ...prev, [key]: prevSelected[key] }));
    setPrevSelected((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const canUndo = (key) => key in prevSelected;

  const getVal = (key, fallback) =>
    key in selected ? selected[key] : fallback;

  const humanizeAll = () => {
    setHumanizingAll(true);
    setTimeout(() => {
      setSelected((prev) => {
        const next = { ...prev };
        const nextPrev = { ...prevSelected };
        sections.forEach((sec, si) => {
          const hKey = `heading-${si}`;
          nextPrev[hKey] = hKey in prev ? prev[hKey] : sec.Original_heading;
          next[hKey] = sec.humanized_heading;
          sec.items.forEach((item, ii) => {
            const key = `${si}-${ii}`;
            nextPrev[key] = key in prev ? prev[key] : item.original_text;
            next[key] = item.humanized_text;
          });
        });
        setPrevSelected(nextPrev);
        return next;
      });
      setIsDirty(true);
      setHumanizingAll(false);
    }, 400);
  };

  const buildFinalContent = () => {
    let html = "";
    let title = "";
    sections.forEach((sec, si) => {
      const headingText = getVal(`heading-${si}`, sec.Original_heading);
      if (si === 0 && sec.tag_name === "h1") title = headingText;
      const tag = sec.tag_name || "h2";
      html += `<${tag}>${headingText}</${tag}>`;
      sec.items.forEach((item, ii) => {
        const text = getVal(`${si}-${ii}`, item.original_text);
        const t = item.tag_name || "p";
        html +=
          t === "li" ? `<ul><li>${text}</li></ul>` : `<${t}>${text}</${t}>`;
      });
    });
    return { title: title || "My Blog Post", content: html };
  };

  const handleLiveNow = async () => {
    setPublishing(true);
    setPublishedUrl(null);
    setPublishError(null);
    try {
      const { title, content } = buildFinalContent();
      const response = await fetch(
        `https://${publishDomain}/wp-json/my-api/v1/create-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": "YOUR_SECRET_EXTRACT_HERE",
          },
          body: JSON.stringify({ title, content, status: "publish" }),
        },
      );
      const result = await response.json();
      if (result.success) {
        setPublishedUrl(result.url);
        setIsDirty(false);

        dispatch(
          updateSeoLink(orderId, { ...link, assigned_user_link: result.url }),
        );
      } else setPublishError("Publishing failed. Please try again.");
    } catch (err) {
      setPublishError("Network error: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const renderContent = (tag, text) => {
    if (tag === "h1")
      return <p className="text-sm font-bold leading-snug">{text}</p>;
    if (tag === "h2")
      return <p className="text-sm font-semibold leading-snug">{text}</p>;
    if (tag === "li")
      return (
        <p className="text-sm leading-relaxed pl-3 border-l-2 border-current opacity-70">
          {text}
        </p>
      );
    return <p className="text-sm leading-relaxed">{text}</p>;
  };

  const UndoBtn = ({ keyName }) => (
    <button
      onClick={() => undoKey(keyName)}
      title="Undo"
      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 text-xs
        ${
          canUndo(keyName)
            ? "bg-amber-100 text-amber-600 hover:bg-amber-200 cursor-pointer shadow-sm"
            : "opacity-0 pointer-events-none"
        }`}
    >
      ↩
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full  flex flex-col rounded-2xl overflow-hidden"
        style={{
          height: "88vh",
          background: "#0f0f13",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-sm tracking-wide">
              Content Selector
            </span>
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                background:
                  aiScore > 50
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(34,197,94,0.15)",
                color: aiScore > 50 ? "#f87171" : "#4ade80",
                border: `1px solid ${aiScore > 50 ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
              }}
            >
              AI {aiScore}%
            </span>
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                background:
                  aiScore > 50
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(34,197,94,0.15)",
                color: aiScore > 50 ? "#f87171" : "#4ade80",
                border: `1px solid ${aiScore > 50 ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
              }}
            >
              Humanized {humanizedScore}%
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {publishedUrl && (
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-xl animate-fadeIn"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))",
                  border: "1px solid rgba(16,185,129,0.35)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                {/* Success Icon */}
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500/20">
                  <span className="text-emerald-400 text-sm">✓</span>
                </div>

                {/* Text */}
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] text-emerald-300 font-medium">
                    Blog Drafted Successfully
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                    {publishedUrl}
                  </span>
                </div>

                {/* CTA Button */}
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
                  style={{
                    background: "rgba(59,130,246,0.2)",
                    color: "#93c5fd",
                    border: "1px solid rgba(59,130,246,0.35)",
                  }}
                >
                  View ↗
                </a>
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
                  style={{
                    background: copied
                      ? "rgba(16,185,129,0.2)"
                      : "rgba(255,255,255,0.06)",
                    color: copied ? "#34d399" : "#cbd5f5",
                    border: copied
                      ? "1px solid rgba(16,185,129,0.4)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            )}
            {publishError && (
              <span className="text-xs text-red-400">{publishError}</span>
            )}

            {/* Humanize All */}
            <button
              onClick={humanizeAll}
              disabled={humanizingAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                background: humanizingAll
                  ? "rgba(139,92,246,0.3)"
                  : "rgba(139,92,246,0.18)",
                color: "#c4b5fd",
                border: "1px solid rgba(139,92,246,0.4)",
              }}
            >
              {humanizingAll ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                  Humanizing…
                </>
              ) : (
                <>✦ Humanize all</>
              )}
            </button>

            {/* Live Now */}
            <button
              onClick={handleLiveNow}
              disabled={publishing || (publishedUrl && !isDirty)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                background:
                  publishing || (publishedUrl && !isDirty)
                    ? "rgba(100,100,100,0.2)"
                    : "rgba(16,185,129,0.15)",
                color:
                  publishing || (publishedUrl && !isDirty)
                    ? "#6b7280"
                    : "#34d399",
                border: "1px solid rgba(16,185,129,0.35)",
                cursor:
                  publishing || (publishedUrl && !isDirty)
                    ? "not-allowed"
                    : "pointer",
                opacity: publishing || (publishedUrl && !isDirty) ? 0.6 : 1,
              }}
            >
              {publishing ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  Publishing…
                </>
              ) : publishedUrl && !isDirty ? (
                <>✓ Up to date</>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live now
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── COLUMN HEADERS ── */}
        <div
          className="grid grid-cols-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {[
            { label: "Original", color: "#60a5fa", dot: "#3b82f6" },
            { label: "Final Output", color: "#a3e635", dot: "#84cc16" },
            { label: "Humanized", color: "#c084fc", dot: "#a855f7" },
          ].map(({ label, color, dot }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase"
              style={{
                color,
                borderRight:
                  i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
                background: i === 1 ? "rgba(255,255,255,0.02)" : "transparent",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: dot }}
              />
              {label}
            </div>
          ))}
        </div>

        {/* ── 3-COLUMN BODY ── */}
        <div className="grid grid-cols-3 flex-1 overflow-hidden">
          {/* ORIGINAL */}
          <div
            className="overflow-y-auto px-4 py-4 space-y-4"
            style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
          >
            {sections.map((sec, si) => (
              <div key={si}>
                <div
                  className="flex items-start gap-2 mb-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(96,165,250,0.07)",
                    border: "1px solid rgba(96,165,250,0.12)",
                  }}
                >
                  <div className="flex-1 text-blue-200">
                    {renderContent(sec.tag_name, sec.Original_heading)}
                  </div>
                </div>
                {sec.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="flex items-start gap-2 mb-2 px-3 py-2.5 rounded-lg group"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex-1 text-slate-300">
                      {renderContent(item.tag_name, item.original_text)}
                    </div>
                    <button
                      onClick={() =>
                        setValue(
                          `${si}-${ii}`,
                          item.original_text,
                          getVal(`${si}-${ii}`, item.original_text),
                        )
                      }
                      className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                      style={{
                        background: "rgba(96,165,250,0.15)",
                        color: "#93c5fd",
                        border: "1px solid rgba(96,165,250,0.25)",
                      }}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* FINAL OUTPUT */}
          <div
            className="overflow-y-auto px-4 py-4 space-y-4"
            style={{
              borderRight: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.015)",
            }}
          >
            {sections.map((sec, si) => {
              const hKey = `heading-${si}`;
              const hVal = getVal(hKey, sec.Original_heading);
              return (
                <div key={si}>
                  <div
                    className="flex items-start gap-2 mb-2 px-3 py-2 rounded-lg"
                    style={{
                      background: "rgba(163,230,53,0.07)",
                      border: "1px solid rgba(163,230,53,0.15)",
                    }}
                  >
                    <div className="flex-1 text-lime-200">
                      {renderContent(sec.tag_name, hVal)}
                    </div>
                    <UndoBtn keyName={hKey} />
                  </div>
                  {sec.items.map((item, ii) => {
                    const key = `${si}-${ii}`;
                    const val = getVal(key, item.original_text);
                    return (
                      <div
                        key={ii}
                        className="flex items-start gap-2 mb-2 px-3 py-2.5 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(163,230,53,0.1)",
                        }}
                      >
                        <div className="flex-1 text-slate-200">
                          {renderContent(item.tag_name, val)}
                        </div>
                        <UndoBtn keyName={key} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* HUMANIZED */}
          <div className="overflow-y-auto px-4 py-4 space-y-4">
            {sections.map((sec, si) => (
              <div key={si}>
                <div
                  className="flex items-start gap-2 mb-2 px-3 py-2 rounded-lg group"
                  style={{
                    background: "rgba(192,132,252,0.07)",
                    border: "1px solid rgba(192,132,252,0.12)",
                  }}
                >
                  <div className="flex-1 text-purple-200">
                    {renderContent(sec.tag_name, sec.humanized_heading)}
                  </div>
                  <button
                    onClick={() =>
                      setValue(
                        `heading-${si}`,
                        sec.humanized_heading,
                        getVal(`heading-${si}`, sec.Original_heading),
                      )
                    }
                    className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                    style={{
                      background: "rgba(192,132,252,0.15)",
                      color: "#d8b4fe",
                      border: "1px solid rgba(192,132,252,0.3)",
                    }}
                  >
                    Use
                  </button>
                </div>
                {sec.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="flex items-start gap-2 mb-2 px-3 py-2.5 rounded-lg group"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex-1 text-slate-300">
                      {renderContent(item.tag_name, item.humanized_text)}
                    </div>
                    <button
                      onClick={() =>
                        setValue(
                          `${si}-${ii}`,
                          item.humanized_text,
                          getVal(`${si}-${ii}`, item.original_text),
                        )
                      }
                      className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                      style={{
                        background: "rgba(192,132,252,0.15)",
                        color: "#d8b4fe",
                        border: "1px solid rgba(192,132,252,0.3)",
                      }}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
