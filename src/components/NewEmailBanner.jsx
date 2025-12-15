import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";

export default function NewEmailBanner({ show }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
                >
                    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl 
            bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
            text-white shadow-2xl backdrop-blur-xl border border-white/20
            animate-pulse"
                    >
                        <Mail className="w-6 h-6" />
                        <div>
                            <p className="font-semibold text-lg">
                                New Email Received 📩
                            </p>
                            <p className="text-sm opacity-90">
                                Redirecting to latest email...
                            </p>
                        </div>

                        <span className="ml-4 text-sm font-mono bg-white/20 px-3 py-1 rounded-full">
                            5s
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
