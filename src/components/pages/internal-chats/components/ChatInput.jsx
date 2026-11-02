import { Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { useEffect, useRef, useState } from "react";

import {
    useInternalChat,
} from "../context/InternalChatContext";


export default function MessageInput() {
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const composerRef = useRef(null);
    const textareaRef = useRef(null);

    const {
        message,
        setMessage,
        sendCurrentMessage,
        selectedUser,
        isSendingMessage,
    } = useInternalChat();

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (composerRef.current && !composerRef.current.contains(event.target)) {
                setIsEmojiPickerOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (!selectedUser) setIsEmojiPickerOpen(false);
    }, [selectedUser]);

    const handleEmojiClick = (emojiData) => {
        const emoji = emojiData?.emoji ?? "";
        if (!emoji) return;

        const textarea = textareaRef.current;
        const start = textarea?.selectionStart ?? message.length;
        const end = textarea?.selectionEnd ?? message.length;
        const nextMessage = `${message.slice(0, start)}${emoji}${message.slice(end)}`;

        setMessage(nextMessage);

        requestAnimationFrame(() => {
            const cursorPosition = start + emoji.length;
            textarea?.focus();
            textarea?.setSelectionRange(cursorPosition, cursorPosition);
        });
    };


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
        <div ref={composerRef} className="relative mx-auto flex w-full max-w-4xl items-end gap-1 rounded-2xl border border-border bg-background p-2 shadow-sm transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">

            {isEmojiPickerOpen && (
                <div className="absolute bottom-[calc(100%+0.75rem)] left-0 z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width="min(320px, calc(100vw - 2rem))"
                        height={390}
                        lazyLoadEmojis
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsEmojiPickerOpen((open) => !open)}
                disabled={!selectedUser || isSendingMessage}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Choose an emoji"
                aria-expanded={isEmojiPickerOpen}
            >
                <Smile size={20} />
            </button>

            <textarea
                ref={textareaRef}
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
                aria-label="Message"
                className="
                    max-h-32
                    min-h-10
                    flex-1
                    resize-none
                    border-0
                    bg-transparent
                    px-2
                    py-2.5
                    text-sm
                    outline-none
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    placeholder:text-muted-foreground
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
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-ring
                    focus-visible:ring-offset-2
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
