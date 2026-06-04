import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowBigDownDash,
    ArrowBigUpDash,
    Link2,
    ListRestart,
    ListStart,
} from "lucide-react";

import { ThreadContext } from "../../../context/ThreadContext";
import IconButton from "../../ui/Buttons/IconButton";

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

    const [showThreads, setShowThreads] = useState(false);

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
                                <IconButton
                                    icon={ListStart}
                                    onClick={() =>
                                        setMessageLimit((p) => p + 3)
                                    }
                                    className="
                    px-5 py-2
                    rounded-xl
                    bg-gradient-to-r from-purple-500 to-indigo-600
                    text-white text-sm font-semibold
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                    flex items-center gap-2
                  "
                                    label={'Show All'}
                                />


                                {/* SHOW ALL */}
                                <IconButton
                                    icon={ListRestart}
                                    onClick={() =>
                                        setMessageLimit(emails.length)
                                    }
                                    className="
                    px-5 py-2
                    rounded-xl
                    bg-gradient-to-r from-purple-500 to-indigo-500
                    text-white text-sm font-semibold
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "
                                    label={"Load More"}
                                />

                            </>
                        )}

                        <IconButton onClick={() => {
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
                            icon={ArrowBigUpDash}
                            label={'First Email'}
                            className="
                   px-5 py-2
                    rounded-xl
                    bg-gradient-to-r from-purple-500 to-indigo-500
                    text-white text-sm font-semibold
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "/>
                        <IconButton onClick={() => {
                            scrollRef.current?.scrollTo({
                                top: scrollRef.current.scrollHeight,
                                behavior: "smooth",
                            });
                        }}
                            className="
                   px-5 py-2
                    rounded-xl
                    bg-gradient-to-r from-purple-500 to-indigo-500
                    text-white text-sm font-semibold
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "
                            icon={ArrowBigDownDash}
                            label={"Last Email"} />
                    </div>


                    <IconButton
                        onClick={() => {
                            // Don't open sidebar while loading
                            if (!loading) {
                                setShowThreads(true);
                            }
                        }}
                        className="
        px-5 py-2
        rounded-xl
        bg-gradient-to-r from-purple-500 to-indigo-500
        text-white text-sm font-semibold
        shadow-md hover:shadow-lg
        transition-all duration-300
        relative
    "
                        text={`(${duplicateEmail?.length || 0})`}
                        icon={Link2}
                        loading={loading}
                        label={
                            loading
                                ? "Loading Threads..."
                                : `Threads (${duplicateEmail?.length || 0})`
                        }
                    />
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
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5].map((item) => (
                                            <div
                                                key={item}
                                                className="
                    w-full rounded-2xl border border-gray-200
                    p-4 animate-pulse
                "
                                            >
                                                <div className="h-4 bg-gray-200 rounded w-3/4" />

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="h-3 bg-gray-200 rounded w-20" />

                                                    <div className="h-6 w-10 bg-gray-200 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
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