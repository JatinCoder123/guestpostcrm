import {
    Send,
    Smile,
} from "lucide-react";

import {
    useInternalChat,
} from "../context/InternalChatContext";


export default function ChatInput() {
    const {
        selectedUser,
        message,
        setMessage,
        sendCurrentMessage,
        isSendingMessage,
    } = useInternalChat();


    /* ==========================================
       NO SELECTED USER
    ========================================== */

    if (!selectedUser) {
        return null;
    }


    /* ==========================================
       SEND MESSAGE
    ========================================== */

    const handleSend = async () => {
        if (
            !message.trim() ||
            isSendingMessage
        ) {
            return;
        }

        await sendCurrentMessage();
    };


    /* ==========================================
       KEYBOARD HANDLER
    ========================================== */

    const handleKeyDown = (event) => {
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

            handleSend();
        }
    };


    return (
        <div className="shrink-0 border-t border-border bg-card p-3">
            <div className="mx-auto flex w-full max-w-4xl items-end gap-2">

                {/* ==================================
                    MESSAGE INPUT
                ================================== */}

                <div className="flex min-h-[42px] flex-1 items-end rounded-xl bg-input-background px-3 transition focus-within:ring-2 focus-within:ring-search-primary/20">

                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        rows={1}
                        placeholder={`Message ${selectedUser.name || "user"}...`}
                        disabled={
                            isSendingMessage
                        }
                        className="
                            max-h-32
                            min-h-[42px]
                            flex-1
                            resize-none
                            bg-transparent
                            py-2.5
                            text-sm
                            text-foreground
                            outline-none
                            placeholder:text-muted-foreground
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    />


                    {/* ==================================
                        EMOJI BUTTON
                    ================================== */}

                    <button
                        type="button"
                        disabled={
                            isSendingMessage
                        }
                        className="
                            mb-1
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-muted-foreground
                            transition
                            hover:bg-accent
                            hover:text-foreground
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <Smile
                            size={18}
                        />
                    </button>

                </div>


                {/* ==================================
                    SEND BUTTON
                ================================== */}

                <button
                    type="button"
                    onClick={
                        handleSend
                    }
                    disabled={
                        !message.trim() ||
                        isSendingMessage
                    }
                    aria-label="Send message"
                    className="
                        mb-1
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-search-primary
                        text-white
                        shadow-sm
                        transition
                        hover:opacity-90
                        active:scale-95
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
                                border-white/40
                                border-t-white
                            "
                        />
                    ) : (
                        <Send
                            size={17}
                        />
                    )}
                </button>

            </div>
        </div>
    );
}