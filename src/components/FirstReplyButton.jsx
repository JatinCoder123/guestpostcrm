import { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import Loading, { LoadingChase } from "./Loading";
import { SocketContext } from "../context/SocketContext";
import { useSelector } from "react-redux";



const FirstReplyButton = () => {
    const { setNotificationCount } = useContext(SocketContext);

    const { crmEndpoint } = useSelector((s) => s.user);
    const { email } = useSelector((s) => s.ladger);

    const [visible, setVisible] = useState(false);
    const [reminderId, setReminderId] = useState(null);
    const [loading, setLoading] = useState(false);

    /* 🔥 Check button visibility */
    useEffect(() => {
        if (!email) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(
                    `${crmEndpoint}&type=fr_button&email=${email}`
                );
                const data = await res.json();

                if (data?.reminder_id) {
                    setReminderId(data.reminder_id);
                    setVisible(true);
                } else {
                    setVisible(false);
                    setReminderId(null);
                }
            } catch {
                setVisible(false);
            }
        };

        fetchStatus();
    }, [email, crmEndpoint]);

    /* 🔥 Send first reply */
    const handleSend = async (e) => {
        e.stopPropagation();
        if (!reminderId) return;

        try {
            setLoading(true);

            await fetch(
                `${crmEndpoint}&type=send_reminder&reminder_id=${reminderId}`
            );

            setNotificationCount((prev) => ({
                ...prev,
                refreshUnreplied: Date.now(),
            }));

            toast.success("First reply sent successfully");
            setVisible(false);
        } catch {
            toast.error("Failed to send first reply");
        } finally {
            setLoading(false);
        }
    };

    /* 🔥 IMPORTANT: Never unmount (layout-safe) */
    return (
        <div
            className={`flex items-center transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <button
                onClick={handleSend}
                disabled={loading}
                className="group flex items-center justify-center
          w-12 h-12
          bg-white rounded-xl shadow-md border border-gray-200
          hover:shadow-lg active:scale-95 hover:-translate-y-1
          transition-all"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    {loading ? (
                        <LoadingChase size="20" />
                    ) : (
                        <img
                            src="https://img.icons8.com/color/48/reply.png"
                            className="w-6 h-6"
                            alt="first-reply"
                        />
                    )}
                </div>

                <span
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2
            bg-black text-white text-xs px-2 py-1 rounded
            opacity-0 group-hover:opacity-100
            transition-all whitespace-nowrap shadow-lg z-20"
                >
                    Send First Reply
                </span>
            </button>


        </div>
    );
};

export default FirstReplyButton;
