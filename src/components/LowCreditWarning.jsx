import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
export default function LowCreditWarning({ score }) {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 flex items-start gap-3"
        >
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />

            <div className="flex-1">
                <h4 className="font-semibold text-yellow-700">
                    Low AI Credits Warning
                </h4>

                <p className="text-sm text-yellow-600 mt-1">
                    Your current credit score is <b>{score}</b>.
                    You have very low credits. Please recharge to continue using AI features
                    without interruption.
                </p>

                <button
                    onClick={() => alert("Work in progress")}
                    className="inline-block mt-3 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg"
                >
                    Recharge Now
                </button>
            </div>
        </motion.div>
    );
}
