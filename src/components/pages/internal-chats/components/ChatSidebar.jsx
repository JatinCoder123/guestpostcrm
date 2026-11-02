import {
    MessageSquarePlus,
    Search,
    X,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
    useInternalChat,
} from "../context/InternalChatContext";

import ConversationItem from "./ConversationItem";

export default function ChatSidebar() {
    const [searchTerm, setSearchTerm] = useState("");
    const {
        conversations,
        selectedUser,
        selectUser,
        openStartChat,
        isConversationsLoading,
    } = useInternalChat();

    const filteredConversations = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) return conversations;

        return conversations.filter((conversation) =>
            [
                conversation?.name,
                conversation?.email,
                conversation?.latest_message?.message,
            ].some((value) => String(value ?? "").toLowerCase().includes(query)),
        );
    }, [conversations, searchTerm]);

    return (
        <aside className="flex h-full min-h-0 w-full flex-col border-r border-border bg-card">
            {/* Header */}
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-border px-5">
                <div>
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                        Messages
                    </h2>

                    <p className="text-xs text-muted-foreground">
                        Chat with your team
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openStartChat}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-search-primary text-white shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Start new chat"
                >
                    <MessageSquarePlus
                        size={18}
                    />
                </button>
            </div>

            {/* Search */}
            <div className="shrink-0 border-b border-border px-3 py-3">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-transparent bg-muted/60 px-3 transition focus-within:border-ring focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20">
                    <Search
                        size={16}
                        className="shrink-0 text-muted-foreground"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search conversations"
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Clear conversation search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Conversations */}
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5">
                {isConversationsLoading ? (
                    <div className="space-y-2 p-2">
                        {Array.from({
                            length: 6,
                        }).map(
                            (_, index) => (
                                <div
                                    key={
                                        index
                                    }
                                    className="h-16 animate-pulse rounded-lg bg-muted"
                                />
                            )
                        )}
                    </div>
                ) : filteredConversations.length ===
                    0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <MessageSquarePlus
                                size={22}
                                className="text-muted-foreground"
                            />
                        </div>

                        <p className="text-sm font-medium text-foreground">
                            {searchTerm ? "No conversations found" : "No conversations yet"}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {searchTerm ? "Try a different name or message." : "Start a new chat with a CRM user."}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map(
                        (
                            conversation
                        ) => (
                            <ConversationItem
                                key={
                                    conversation.user_id ??
                                    conversation.email
                                }
                                conversation={
                                    conversation
                                }
                                selected={
                                    selectedUser?.email ===
                                    conversation.email
                                }
                                onClick={() =>
                                    selectUser(
                                        conversation
                                    )
                                }
                            />
                        )
                    )
                )}
            </div>
        </aside>
    );
}
