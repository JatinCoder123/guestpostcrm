import { AnimatePresence, motion } from "framer-motion";
import { LoadingSpin } from "../../Loading";

export const SendingOverlay = ({ sending, email }) => {
    return (
        <AnimatePresence>
            {sending && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: [-10, 10, -10] }}
                        className="text-5xl mb-4"
                    >
                        📤
                    </motion.div>

                    {/* Heading */}
                    <h2 className="text-xl font-semibold text-gray-800">
                        Sending Email
                    </h2>

                    {/* Email */}
                    <p className="text-sm text-gray-600 mt-1">
                        To: <span className="font-medium">{email}</span>
                    </p>

                    {/* Moving text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-600 my-4"
                    >
                        Moving forward to next email...
                    </motion.p>

                    {/* Progress bar */}
                    <LoadingSpin color="blue" size="25" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};