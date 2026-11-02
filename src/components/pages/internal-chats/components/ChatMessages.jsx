import {
    Loader2,
    MessageCircle,
} from "lucide-react";

import { useEffect, useRef } from "react";

import {
    useInternalChat,
} from "../context/InternalChatContext";
import { getCurrentUser } from "../../../../services/utils";

export default function ChatMessages() {
    const scrollContainerRef = useRef(null);
    const {
        selectedUser,
        messages,
        isMessagesLoading,
    } = useInternalChat();

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, [messages, selectedUser]);

    /*
     * ==========================================
     * NO USER SELECTED
     * ==========================================
     *
     * h-full + flex-1 makes the empty state
     * consume the COMPLETE available area.
     */
    if (!selectedUser) {
        return (
            <div
                className="
        flex
        h-full
        min-h-0
                flex-1
        items-center
        justify-center
        overflow-y-auto
        custom-scrollbar
        bg-muted/20
    "
            >                 <div className="flex flex-col items-center justify-center px-6 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                        <MessageCircle
                            size={25}
                            className="text-search-primary"
                        />
                    </div>

                    <h3 className="text-sm font-semibold text-foreground">
                        Choose a conversation
                    </h3>

                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                        Select a teammate from the list to view your messages.
                    </p>
                </div>
            </div>
        );
    }

    /*
     * ==========================================
     * LOADING
     * ==========================================
     */

    if (isMessagesLoading) {
        return (
            <div
                className="
        flex
        h-full
        min-h-0
                flex-1
        items-center
        justify-center
        overflow-y-auto
        custom-scrollbar
        bg-muted/20
    "
            >                  <Loader2
                    size={22}
                    className="animate-spin text-search-primary"
                />
            </div>
        );
    }

    /*
     * ==========================================
     * MESSAGES
     * ==========================================
     */

    return (
        <div
            ref={scrollContainerRef}
            className="
        flex
        h-full
        min-h-0
        flex-1
        flex-col
        overflow-y-auto
        custom-scrollbar
        bg-muted/20
        px-4
        py-6
        sm:px-6
        lg:px-8
    "
        >           {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                        <MessageCircle
                            size={21}
                            className="text-muted-foreground"
                        />
                    </div>

                    <p className="text-sm font-medium text-foreground">
                        No messages yet
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Send a message to start
                        the conversation.
                    </p>
                </div>
            </div>
        ) : (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-2.5">
                {messages.map(
                    (message, index) => (
                        <MessageBubble
                            key={
                                message?.id ??
                                message?.message_id ??
                                index
                            }
                            message={
                                message
                            }
                        />
                    )
                )}
            </div>
        )}
        </div>
    );
}


/* ==========================================
   MESSAGE BUBBLE
========================================== */

function MessageBubble({
    message,
}) {
    const isMine =

        message?.from ===
        getCurrentUser()?.description;

    const text =
        message?.message ??
        message?.body ??
        message?.content ??
        "";

    const formattedTime = formatMessageTime(
        message?.created_at ??
        message?.sent_at ??
        message?.time_sent ??
        message?.date_entered ??
        message?.date_created ??
        message?.created ??
        message?.message_date ??
        message?.datetime ??
        message?.date_time ??
        message?.timestamp ??
        message?.date ??
        message?.time,
    );

    return (
        <div
            className={`flex ${isMine
                ? "justify-end"
                : "justify-start"
                }`}
        >
            <div
                className={`
                    max-w-[85%]
                    rounded-2xl
                    px-3.5
                    py-2.5
                    sm:max-w-[72%]

                    ${isMine
                        ? "rounded-br-md bg-search-primary text-white shadow-sm"
                        : "rounded-bl-md border border-border bg-card text-foreground shadow-sm"
                    }
                `}
            >
                <div className="flex items-end gap-2">
                    <p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {text}
                    </p>

                    {formattedTime && (
                    <time
                        dateTime={String(
                            message?.created_at ??
                            message?.sent_at ??
                            message?.time_sent ??
                            message?.date_entered ??
                            message?.date_created ??
                            message?.created ??
                            message?.message_date ??
                            message?.datetime ??
                            message?.date_time ??
                            message?.timestamp ??
                            message?.date ??
                            message?.time,
                        )}
                        className={`
                            mb-0.5 shrink-0 whitespace-nowrap text-[10px] leading-none

                            ${isMine
                                ? "text-white/70"
                                : "text-muted-foreground"
                            }
                        `}
                    >
                        {formattedTime}
                    </time>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatMessageTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}
