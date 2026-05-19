import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowBigDown,
    ArrowBigUp,
    Link2,
    Loader2,
    Sparkles,
} from "lucide-react";

import { ThreadContext } from "../../../context/ThreadContext";

function NavigationBar({
    messageLimit,
    setMessageLimit,
    emails,
    scrollRef,
}) {
    const { duplicateEmail, loading } = useSelector(
        (state) => state.duplicateEmails
    );

    const { currentThread, setCurrentThread } =
        useContext(ThreadContext);

    const [showThreads, setShowThreads] = useState(true);

    const topThreads = duplicateEmail?.slice(0, 5) || [];

    return (
        <>
            <div
                className="
          sticky top-0 z-20
          border-b border-gray-200
          bg-white/80 backdrop-blur-xl
          shadow-sm
        "
            >
                <div className="flex flex-wrap items-center  gap-3 px-4 py-3">
                    {/* LEFT ACTIONS */}
                    <div className="flex flex-wrap items-center gap-3">
                        {messageLimit < emails?.length && (
                            <>
                                {/* LOAD MORE */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        setMessageLimit((p) => p + 3)
                                    }
                                    className="
                    px-5 py-2
                    rounded-xl
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    text-white text-sm font-semibold
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                    flex items-center gap-2
                  "
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Load More
                                </motion.button>

                                {/* SHOW ALL */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        setMessageLimit(emails.length)
                                    }
                                    className="
                    px-5 py-2
                    rounded-xl
                    bg-gradient-to-r from-purple-500 to-pink-500
                    text-white text-sm font-semibold
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "
                                >
                                    Show All
                                </motion.button>
                            </>
                        )}

                        {/* TOP */}
                        {emails?.length > 0 && (
                            <>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (messageLimit < emails.length) {
                                            setMessageLimit(emails.length);
                                        }

                                        setTimeout(() => {
                                            scrollRef.current?.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            });
                                        }, 50);
                                    }}
                                    className="
                    p-2 rounded-full
                    bg-gradient-to-r from-gray-500 to-gray-700
                    text-white
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "
                                >
                                    <ArrowBigUp className="w-5 h-5" />
                                </motion.button>

                                {/* BOTTOM */}
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        scrollRef.current?.scrollTo({
                                            top: scrollRef.current.scrollHeight,
                                            behavior: "smooth",
                                        });
                                    }}
                                    className="
                    p-2 rounded-full
                    bg-gradient-to-r from-green-500 to-emerald-600
                    text-white
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "
                                >
                                    <ArrowBigDown className="w-5 h-5" />
                                </motion.button>
                            </>
                        )}
                    </div>

                    {/* THREAD BUTTON */}
                    {duplicateEmail.length > 0 && <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ y: -1 }}
                        onClick={() => setShowThreads(true)}
                        className="
              px-4 py-2
              rounded-xl
              bg-gradient-to-r from-slate-800 to-slate-700
              text-white
              text-sm font-medium
              shadow-md
              flex items-center gap-2
            "
                    >
                        <Link2 className="w-4 h-4" />
                        Threads
                    </motion.button>}

                </div>
            </div>

            {/* THREAD SIDEBAR */}
            <AnimatePresence>
                {showThreads && (
                    <>
                        {/* OVERLAY */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowThreads(false)}
                            className="fixed inset-0 bg-black/20 z-40"
                        />

                        {/* SIDEBAR */}
                        <motion.div
                            initial={{ x: -350 }}
                            animate={{ x: 0 }}
                            exit={{ x: -350 }}
                            transition={{
                                type: "spring",
                                damping: 24,
                            }}
                            className="
                fixed left-0 top-0
                h-screen w-[320px]
                bg-white
                border-l
                shadow-2xl
                z-50
                flex flex-col rounded-r-3xl
              "
                        >
                            {/* HEADER */}
                            <div className="p-4 border-b flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        Duplicate Threads
                                    </h2>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Recent conversations
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowThreads(false)}
                                    className="
                    w-8 h-8 rounded-lg
                    hover:bg-gray-100 cursor-pointer
                    text-gray-500
                  "
                                >
                                    ✕
                                </button>
                            </div>

                            {/* THREADS */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading threads...
                                    </div>
                                ) : topThreads.length > 0 ? (
                                    topThreads.map((thread) => {
                                        const isActive =
                                            currentThread ===
                                            thread.thread_id;

                                        return (
                                            <motion.button
                                                key={thread.thread_id}
                                                whileHover={{ y: -1 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setCurrentThread(
                                                        thread.thread_id
                                                    );

                                                    setShowThreads(false);
                                                }}
                                                className={`
                          w-full
                          rounded-2xl
                          border
                          p-4
                          text-left
                          transition-all duration-200 cursor-pointer

                          ${isActive
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                                                    }
                        `}
                                            >
                                                {/* SUBJECT */}
                                                <h3 className="text-sm font-semibold truncate">
                                                    {thread?.subject ||
                                                        "No Subject"}
                                                </h3>

                                                {/* META */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <p
                                                        className={`text-xs ${isActive
                                                            ? "text-blue-100"
                                                            : "text-gray-500"
                                                            }`}
                                                    >
                                                        {thread?.date_created
                                                        }
                                                    </p>

                                                    {/* DUMMY COUNT */}
                                                    <div
                                                        className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${isActive
                                                                ? "bg-white/20 text-white"
                                                                : "bg-gray-100 text-gray-700"
                                                            }
                            `}
                                                    >
                                                        {thread?.thread_count}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })
                                ) : (
                                    <div className="text-sm text-gray-400 p-2">
                                        No duplicate threads found
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default NavigationBar;