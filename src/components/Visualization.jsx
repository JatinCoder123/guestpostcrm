import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, GitCommitVertical, Workflow } from "lucide-react";

import { fetchGpc } from "../services/api";

/* ─────────────────────────────────────────────────────────────────────────────
   COLOUR
   Hue encodes position in the flow: step 1 sits on the product's blue and the
   ramp walks forward through violet, magenta and red into amber at the final
   step. Lightness and chroma stay fixed so no single step shouts louder than
   its neighbours — only the hue moves, so the gradient itself reads as
   "progress". This replaces the old `index % 3` cycle, which repeated every
   third step and told you nothing.
   ───────────────────────────────────────────────────────────────────────── */
const HUE_START = 252;
const HUE_SWEEP = 138;

function hueAt(index, total) {
    if (total <= 1) return HUE_START;
    return HUE_START + (index / (total - 1)) * HUE_SWEEP;
}

const palette = (h) => ({
    solid: `oklch(0.55 0.19 ${h})`,
    deep: `oklch(0.43 0.17 ${h})`,
    chipText: `oklch(0.42 0.16 ${h})`,
    surface: `oklch(0.985 0.014 ${h})`,
    line: `oklch(0.9 0.045 ${h})`,
});

/* Normalises whatever the gateway returns for `description` into text. */
function toDisplayText(desc) {
    if (!desc) return "";

    try {
        if (typeof desc === "string") return desc.replace(/<[^>]*>/g, "").trim();
        if (typeof desc === "object") return JSON.stringify(desc, null, 2);
        return String(desc);
    } catch {
        return "Invalid description format";
    }
}

/* Splits "Title: the rest" into heading and subtitle. */
function splitName(name = "") {
    const i = name.indexOf(":");
    if (i === -1) return { title: name.trim(), subtitle: "" };
    return { title: name.slice(0, i).trim(), subtitle: name.slice(i + 1).trim() };
}

const COLLAPSE_AFTER = 300;

/**
 * Step detail. Long text collapses behind a toggle instead of living in a
 * fixed-height inner scroll box — nested scrolling is bad on touch, and most
 * steps are only a line or two.
 */
function StepDetail({ text, tone }) {
    const [expanded, setExpanded] = useState(false);

    const isLong = text.length > COLLAPSE_AFTER;
    const shown =
        expanded || !isLong ? text : `${text.slice(0, COLLAPSE_AFTER).trimEnd()}…`;

    return (
        /* No ch cap here. This is preformatted prompt text whose own line
           breaks are meaningful, so it fills the column; on wide screens the
           parent puts it in its own track instead of stretching lines. */
        <div className="mt-2.5 min-w-0 xl:mt-0">
            <pre
                style={{ background: tone.surface, borderColor: tone.line }}
                className="
                    w-full min-w-0 overflow-x-auto
                    whitespace-pre-wrap break-words
                    rounded-xl border
                    px-3 py-2.5 sm:px-3.5 sm:py-3
                    font-mono text-[11.5px] leading-[1.7] sm:text-[12.5px]
                    text-[oklch(0.4_0.02_260)]
                "
            >
                {shown}
            </pre>

            {isLong && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    style={{ color: tone.chipText }}
                    className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-70"
                >
                    {expanded ? "Show less" : "Show more"}
                    <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                </button>
            )}
        </div>
    );
}

const Visualization = ({
    activeVisualizationId,
    setActiveVisualizationId,
    isModal = true,
}) => {
    const [activeVisualization, setActiveVisualization] = useState(null);
    const [visualLoading, setVisualLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const modalRef = useRef(null);
    const scrollRef = useRef(null);
    const stepRefs = useRef([]);

    useEffect(() => {
        if (!activeVisualizationId) return;

        const getVisualData = async () => {
            try {
                setVisualLoading(true);

                const visualData = await fetchGpc({
                    params: { type: "visualization" },
                    method: "POST",
                    body: { id: activeVisualizationId },
                });

                if (visualData?.success) {
                    setActiveVisualization(visualData?.visualization || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setVisualLoading(false);
            }
        };

        getVisualData();
    }, [activeVisualizationId]);

    // OUTSIDE CLICK
    useEffect(() => {
        if (!isModal) return;

        const handleOutsideClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) handleClose();
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isModal]);

    // ESCAPE
    useEffect(() => {
        if (!isModal) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") handleClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isModal]);

    const handleClose = () => {
        setActiveVisualization(null);
        if (setActiveVisualizationId) setActiveVisualizationId(null);
    };

    const steps = useMemo(
        () =>
            [...(activeVisualization || [])].sort(
                (a, b) => Number(a.process_no) - Number(b.process_no),
            ),
        [activeVisualization],
    );

    /* Highlights whichever step is nearest the top of the viewport, which keeps
       the overview bar in sync as you scroll. */
    const handleScroll = () => {
        const box = scrollRef.current;
        if (!box) return;

        let nearest = 0;
        let best = Infinity;

        stepRefs.current.forEach((el, i) => {
            if (!el) return;
            const d = Math.abs(el.offsetTop - box.scrollTop - 12);
            if (d < best) {
                best = d;
                nearest = i;
            }
        });

        setActiveStep(nearest);
    };

    if (!activeVisualization && !visualLoading) return null;

    const content = (
        <div
            ref={modalRef}
            className={`
                flex min-w-0 flex-col overflow-hidden
                rounded-2xl border border-[oklch(0.92_0.012_260)]
                bg-white
                ${isModal
                    ? "h-[92vh] w-full max-w-4xl shadow-2xl sm:h-[85vh]"
                    : "h-full w-full shadow-sm"
                }
            `}
        >
            {/* ── HEADER ───────────────────────────────────────────────────
                The subtitle tracks scroll position, so it stays useful as the
                place that tells you where you are in a long flow. */}
            <div className="flex shrink-0 items-center gap-3 border-b border-[oklch(0.92_0.012_260)] px-4 py-3 sm:px-5 sm:py-3.5">
                <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-sm"
                    style={{
                        background: `linear-gradient(135deg, ${palette(HUE_START).solid}, ${palette(HUE_START + HUE_SWEEP).solid})`,
                    }}
                >
                    <Workflow size={17} strokeWidth={2.2} />
                </span>

                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[oklch(0.24_0.02_260)] sm:text-base">
                        Process flow
                    </h2>

                    <p className="mt-0.5 truncate text-[11.5px] text-[oklch(0.55_0.02_260)]">
                        {visualLoading
                            ? "Loading steps"
                            : steps.length === 0
                                ? "No steps recorded"
                                : `Step ${activeStep + 1} of ${steps.length} · ${steps[activeStep] ? splitName(steps[activeStep].name).title : ""}`}
                    </p>
                </div>

                {isModal && (
                    <button
                        onClick={handleClose}
                        aria-label="Close process flow"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[oklch(0.55_0.02_260)] transition-colors hover:bg-[oklch(0.95_0.008_260)] hover:text-[oklch(0.24_0.02_260)]"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* ── RAIL ─────────────────────────────────────────────────── */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
            >
                {visualLoading ? (
                    <div className="space-y-5">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="flex animate-pulse gap-3 sm:gap-4">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-[oklch(0.93_0.01_260)]" />
                                <div className="min-w-0 flex-1 space-y-2 pt-1">
                                    <div className="h-3 w-1/3 rounded bg-[oklch(0.93_0.01_260)]" />
                                    <div className="h-14 w-full rounded-xl bg-[oklch(0.96_0.006_260)]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : steps.length === 0 ? (
                    <div className="grid place-items-center gap-2 py-14 text-center">
                        <GitCommitVertical size={26} className="text-[oklch(0.78_0.02_260)]" />
                        <p className="text-sm font-medium text-[oklch(0.4_0.02_260)]">
                            Nothing recorded for this run
                        </p>
                        <p className="max-w-[38ch] text-[12.5px] text-[oklch(0.6_0.02_260)]">
                            Steps appear here once the process has executed at least once.
                        </p>
                    </div>
                ) : (
                    /* One continuous rail carries the sequence, so the old arrow
                       glyphs between cards are gone — along with the bug where
                       their colour cycle was offset from the cards'. */
                    <ol className="min-w-0">
                        {steps.map((step, index) => {
                            const isLast = index === steps.length - 1;
                            const tone = palette(hueAt(index, steps.length));
                            const nextTone = palette(hueAt(index + 1, steps.length));
                            const { title, subtitle } = splitName(step?.name);
                            const detail = toDisplayText(step?.description);

                            return (
                                <motion.li
                                    key={step.id ?? index}
                                    ref={(el) => (stepRefs.current[index] = el)}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.34,
                                        delay: Math.min(index * 0.05, 0.4),
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="relative grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[2.25rem_minmax(0,1fr)] sm:gap-x-4"
                                >
                                    {/* rail: blends this step's hue into the next */}
                                    {!isLast && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute left-4 top-9 bottom-0 w-[2px] rounded-full sm:left-[1.125rem]"
                                            style={{
                                                background: `linear-gradient(to bottom, ${tone.solid}, ${nextTone.solid})`,
                                                opacity: 0.4,
                                            }}
                                        />
                                    )}

                                    {/* marker
                                        The white ring is structural, not a
                                        state: it masks the rail passing behind
                                        the circle. */}
                                    <span
                                        className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-bold tabular-nums text-white sm:h-9 sm:w-9 sm:text-[13px]"
                                        style={{
                                            background: tone.solid,
                                            boxShadow: "0 0 0 4px white",
                                        }}
                                    >
                                        {step.process_no}
                                    </span>

                                    {/* body
                                        From `xl` the label and the detail sit
                                        in two tracks rather than stacking, so
                                        the extra desktop width goes into layout
                                        instead of over-long monospace lines —
                                        and titles line up as a scannable
                                        column down the left. */}
                                    <div
                                        className={`
                                            min-w-0 ${isLast ? "pb-1" : "pb-7"}
                                            xl:grid xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:items-start xl:gap-6
                                        `}
                                    >
                                        <div className="min-w-0 xl:pt-0.5">
                                            <h3
                                                className="text-sm font-semibold leading-6 sm:text-[15px]"
                                                style={{ color: tone.deep }}
                                            >
                                                {title}
                                            </h3>

                                            {subtitle && (
                                                <p className="mt-1 max-w-[70ch] text-[12.5px] leading-5 text-[oklch(0.5_0.02_260)]">
                                                    {subtitle}
                                                </p>
                                            )}
                                        </div>

                                        {detail && <StepDetail text={detail} tone={tone} />}
                                    </div>
                                </motion.li>
                            );
                        })}
                    </ol>
                )}
            </div>
        </div>
    );

    if (!isModal) return content;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[oklch(0.2_0.02_260_/_0.55)] p-2 sm:p-4">
            {content}
        </div>
    );
};

export default Visualization;
