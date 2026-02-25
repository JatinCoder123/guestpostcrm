import { Outlet } from 'react-router-dom';

const ThreadMeta = () => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="bg-white rounded-3xl shadow-2xl w-full h-screen flex flex-col overflow-hidden"
        >
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBackClick}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <div className="flex items-center gap-3">
                        {/* OPEN GMAIL */}
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
                            onClick={() =>
                                window.open(
                                    `https://mail.google.com/mail/u/0/#inbox/${view ? viewThreadId : threadId}`,
                                    "_blank",
                                )
                            }
                        >
                            <Send className="w-5 h-5" />
                            <h2 className="text-xl font-bold tracking-tight">
                                {showEditorScreen ? "Compose Email" : "Email Thread"}
                            </h2>
                        </div>

                        {/* COPY LINK */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // ⛔ prevent opening gmail
                                const link = `https://mail.google.com/mail/u/0/#inbox/${view ? viewThreadId : threadId}`;
                                navigator.clipboard.writeText(link);
                                toast.success("Email thread link copied!");
                            }}
                            title="Copy Gmail link"
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition shadow-sm"
                        >
                            <Globe className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {importBtn && importBtn()}
            </div>
            <Outlet />


        </motion.div>)
}

export default ThreadMeta