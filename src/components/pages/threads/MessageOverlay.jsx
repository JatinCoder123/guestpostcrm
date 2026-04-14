import { AnimatePresence, motion } from 'framer-motion'

const MessageOverlay = ({ showSuccessAnim }) => {
    return <AnimatePresence>
        {showSuccessAnim && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] flex flex-col items-center justify-center backdrop-blur-sm overflow-hidden"
            >

                {/* ✉️ Flying Mail */}
                <motion.div
                    initial={{ x: -200, rotate: -20, opacity: 0 }}
                    animate={{
                        x: [-200, 0, 200],
                        rotate: [-20, 0, 10],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 1.2,
                        ease: "easeInOut"
                    }}
                    className="text-6xl mb-4"
                >
                    ✉️
                </motion.div>

                {/* 🚀 Rocket moving forward */}
                <motion.div
                    initial={{ x: -50 }}
                    animate={{ x: 50 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="text-4xl mb-2"
                >
                    🚀
                </motion.div>

                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl font-semibold text-gray-700"
                >
                    Message Sent
                </motion.h2>

                {/* Animated text typing effect */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-md text-gray-700 mt-2" >
                    Moving forward to next email...
                </motion.p>

                {/* Progress line (feels like loading next email) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mt-4 rounded-full"
                />

            </motion.div>
        )}
    </AnimatePresence>
}

export default MessageOverlay