// ThreadSkeleton.jsx
import { motion } from "framer-motion";

function EmailBubbleSkeleton({ align = "left" }) {
    const isRight = align === "right";

    return (
        <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
            <motion.div
                className={`w-[70%] p-5 rounded-2xl ${isRight ? "bg-blue-100" : "bg-gray-200"}`}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity }}
            >
                <div className="flex justify-between mb-4">
                    <div className="h-3 w-24 bg-gray-300 rounded" />
                    <div className="h-3 w-16 bg-gray-300 rounded" />
                </div>

                <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-300 rounded" />
                    <div className="h-3 w-5/6 bg-gray-300 rounded" />
                    <div className="h-3 w-2/3 bg-gray-300 rounded" />
                </div>
            </motion.div>
        </div>
    );
}

export function ThreadSkeleton() {
    return (
        <>
            {/* CONTROLS SKELETON */}
            <div className="px-6 py-4 bg-gray-100 border-b flex gap-3">
                <div className="h-10 w-28 bg-gray-300 rounded-xl" />
                <div className="h-10 w-28 bg-gray-300 rounded-xl" />
            </div>

            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                <EmailBubbleSkeleton align="left" />
                <EmailBubbleSkeleton align="right" />
                <EmailBubbleSkeleton align="left" />
            </div>

            {/* REPLY BAR */}
            <div className="p-6 border-t bg-white">
                <motion.div
                    className="h-12 w-full rounded-2xl bg-gray-200"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                />
            </div>
        </>
    );
}