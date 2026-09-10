import { useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Clock3 } from "lucide-react";
import { PageContext } from "../context/pageContext";

const REMINDER_TIME = 15 * 60 * 1000;
// const REMINDER_TIME = 0.1 * 60 * 1000;

export default function RefreshReminder() {
    const {
        showRefreshReminder: open,
        setShowRefreshReminder: setOpen,
    } = useContext(PageContext);

    const timerRef = useRef();

    const startTimer = () => {
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            setOpen(true);
        }, REMINDER_TIME);
    };

    useEffect(() => {
        startTimer();

        return () => clearTimeout(timerRef.current);
    }, []);

    const handleLater = () => {
        setOpen(false);
        startTimer();
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="fixed inset-x-0 top-0 z-[999999] flex justify-center px-2 pt-2 sm:px-4 sm:pt-3"
                >
                    <div
                        className="
                            relative w-full max-w-3xl overflow-hidden
                            rounded-xl border border-border
                            bg-card/90 shadow-xl shadow-foreground/10
                            backdrop-blur-xl
                            sm:rounded-2xl
                        "
                    >
                        {/* Theme-based top accent */}
                        <div
                            className="
                                absolute inset-x-0 top-0 h-[2px]
                                bg-gradient-to-r
                                from-primary
                                via-accent-foreground
                                to-primary
                            "
                        />

                        <div
                            className="
                                flex flex-col gap-2.5
                                px-3.5 py-3
                                sm:flex-row sm:items-center
                                sm:justify-between sm:gap-4
                                sm:px-5 sm:py-3.5
                            "
                        >
                            <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                                {/* Icon */}
                                <div
                                    className="
                                        relative flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-lg
                                        bg-primary
                                        shadow-md shadow-primary/25
                                        sm:h-10 sm:w-10 sm:rounded-xl
                                    "
                                >
                                    <Clock3
                                        className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5"
                                        strokeWidth={2}
                                    />

                                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                                        <span
                                            className="
                                                absolute inline-flex h-full w-full
                                                animate-ping rounded-full
                                                bg-primary
                                                opacity-75
                                            "
                                        />

                                        <span
                                            className="
                                                relative inline-flex h-3 w-3
                                                rounded-full bg-primary
                                            "
                                        />
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="min-w-0">
                                    <div
                                        className="
                                            text-[13px] font-semibold
                                            text-card-foreground
                                            sm:text-sm
                                        "
                                    >
                                        Refresh recommended
                                    </div>

                                    <p
                                        className="
                                            text-xs
                                            text-muted-foreground
                                            sm:text-sm
                                        "
                                    >
                                        You've been running for a while —
                                        refresh to keep things fast and in sync.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 items-center justify-end gap-2">
                                <button
                                    onClick={handleLater}
                                    className="
                                        rounded-lg px-3 py-1.5
                                        text-[13px] font-medium
                                        text-muted-foreground
                                        transition
                                        hover:bg-accent
                                        hover:text-accent-foreground
                                        sm:px-3.5 sm:py-2 sm:text-sm
                                    "
                                >
                                    Later
                                </button>

                                <button
                                    onClick={handleRefresh}
                                    className="
                                        flex items-center gap-1.5
                                        rounded-lg
                                        bg-primary
                                        px-3.5 py-1.5
                                        text-[13px] font-medium
                                        text-primary-foreground
                                        shadow-sm
                                        transition
                                        hover:brightness-110
                                        hover:shadow-md
                                        active:scale-[0.98]
                                        sm:px-4 sm:py-2 sm:text-sm
                                    "
                                >
                                    <RefreshCw size={14} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}