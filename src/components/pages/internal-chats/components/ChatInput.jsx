import {
    Send,
} from "lucide-react";

import {
    useInternalChat,
} from "../context/InternalChatContext";


export default function MessageInput() {

    const {
        message,
        setMessage,
        sendCurrentMessage,
        selectedUser,
        isSendingMessage,
    } = useInternalChat();


    const handleKeyDown =
        async (event) => {

            /*
             * Enter = send
             *
             * Shift + Enter = new line
             */

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                await sendCurrentMessage();
            }
        };


    return (
        <div className="flex items-end gap-3">

            <textarea
                value={message}
                onChange={(event) => {
                    setMessage(
                        event.target.value
                    );
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                    selectedUser
                        ? "Type a message..."
                        : "Select a user first..."
                }
                disabled={
                    !selectedUser ||
                    isSendingMessage
                }
                rows={1}
                className="
                    flex-1
                    resize-none
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    disabled:bg-slate-100
                    disabled:cursor-not-allowed
                "
            />


            <button
                type="button"
                onClick={
                    sendCurrentMessage
                }
                disabled={
                    !selectedUser ||
                    !message.trim() ||
                    isSendingMessage
                }
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    text-white
                    transition
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >
                {isSendingMessage ? (

                    <span
                        className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-white
                            border-t-transparent
                        "
                    />

                ) : (

                    <Send
                        size={18}
                    />

                )}
            </button>

        </div>
    );
}