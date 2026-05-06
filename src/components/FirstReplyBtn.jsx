import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { viewEmailAction } from '../store/Slices/viewEmail';
import { fetchGpc } from '../services/api';
import { showConsole } from '../assets/assets';
import { LoadingChase } from './Loading';

const FirstReplyBtn = ({ email }) => {
    const dispatch = useDispatch()
    const [showFirstReplyBtn, setShowFirstReplyBtn] = useState(false);
    const [reminderId, setReminderId] = useState(null);
    const [frLoading, setFrLoading] = useState(false);
    const handleSendFirstReply = async () => {
        if (!reminderId) return;

        try {
            setFrLoading(true);
            showConsole && console.log("First rply send button clicked");
            await fetchGpc({ params: { type: 'send_reminder', reminder_id: reminderId } });
            dispatch(
                viewEmailAction.compleConv({
                    message: `First reply sent successfully to ${email}`,
                    sendedEmail: email,
                }),
            );
            setShowFirstReplyBtn(false);
        } catch (err) {
            console.error("Error sending first reply:", err);
            toast.error("Failed to send first reply");
        } finally {
            setFrLoading(false);
        }
    };
    useEffect(() => {
        if (!email) return;

        const fetchFRButtonStatus = async () => {
            try {
                const data = await fetchGpc({ params: { type: 'fr_button', email } });
                if (data?.reminder_id && data.reminder_id !== false) {
                    setReminderId(data.reminder_id);
                    setShowFirstReplyBtn(true);
                } else {
                    setShowFirstReplyBtn(false);
                    setReminderId(null);
                }
            } catch (err) {
                setShowFirstReplyBtn(false);
            }
        };

        fetchFRButtonStatus();
    }, [email]);
    return (
        showFirstReplyBtn && (
            <div
                className={` transition-opacity duration-200 ${showFirstReplyBtn
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                    }`}
            >
                <div className="relative group flex items-center justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSendFirstReply();
                        }}
                        disabled={frLoading}
                        className="
                flex items-center justify-center
                w-12 h-12
                bg-white rounded-xl shadow-md border border-gray-200
                hover:shadow-lg active:scale-95 hover:-translate-y-1
                transition-all
              "
                    >
                        <div className="w-8 h-8 flex items-center justify-center">
                            {frLoading ? (
                                <LoadingChase size="20" />
                            ) : (
                                <img
                                    src="https://img.icons8.com/color/48/reply.png"
                                    className="w-8 h-8"
                                    alt="first-reply"
                                />
                            )}
                        </div>
                    </button>

                    {/* TOOLTIP (layout-safe) */}
                    <span
                        className="
                pointer-events-none
                absolute top-full mt-2 left-1/2 -translate-x-1/2
                bg-black text-white text-xs px-2 py-1 rounded
                opacity-0 scale-95
                group-hover:opacity-100 group-hover:scale-100
                transition-all duration-200
                whitespace-nowrap shadow-lg z-50
              "
                    >
                        Send First Reply
                    </span>
                </div>
            </div>
        )
    )
}

export default FirstReplyBtn