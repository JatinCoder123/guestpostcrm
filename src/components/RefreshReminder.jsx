import { useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Clock3, X } from "lucide-react";
import { PageContext } from "../context/pageContext";

const REMINDER_TIME = 15 * 60 * 1000;
// const REMINDER_TIME = 0.1 * 60 * 1000;

export default function RefreshReminder() {
    const { showRefreshReminder: open, setShowRefreshReminder: setOpen } = useContext(PageContext);
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
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-0 top-0 z-[999999] flex justify-center "
                >
                    <div className="relative w-full  overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
                        {/* subtle top accent line */}
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400" />

                        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                            <div className="flex items-center gap-3.5">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25">
                                    <Clock3 className="h-5 w-5 text-white" strokeWidth={2} />
                                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
                                    </span>
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        Refresh recommended
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        You've been running for a while — refresh to keep things fast and in sync.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    onClick={handleLater}
                                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    Later
                                </button>

                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md hover:brightness-110 active:scale-[0.98]"
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