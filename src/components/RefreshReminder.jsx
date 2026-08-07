import { useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Clock3 } from "lucide-react";
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
                    initial={{ y: -24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -24, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-0 top-0 z-[999999] flex justify-center "
                >
                    <div className="w-full  rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                        <div className="flex items-center justify-between gap-4 px-5 py-2">

                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                    <Clock3 className="h-4.5 w-4.5 text-slate-500" />
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-slate-900">
                                        Refresh recommended
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        You've been running for a while - refresh to keep things fast and in sync.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    onClick={handleLater}
                                    className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                                >
                                    Later
                                </button>

                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
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