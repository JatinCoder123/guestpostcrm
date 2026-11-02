import {
    ArrowLeft,
    MessageCircle,
} from "lucide-react";

import {
    useInternalChat,
} from "../context/InternalChatContext";

export default function ChatHeader() {
    const {
        selectedUser,
        clearSelectedUser,
    } = useInternalChat();

    if (!selectedUser) {
        return (
            <div className="flex h-[76px] shrink-0 items-center border-b border-border bg-card px-5">
                <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                        <MessageCircle size={18} />
                    </div>
                    <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Team chat
                    </h2>

                    <p className="text-xs text-muted-foreground">
                        Select a conversation to start chatting
                    </p>
                    </div>
                </div>
            </div>
        );
    }

    const name =
        selectedUser.name ||
        selectedUser.email ||
        "User";

    const initials =
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (item) =>
                    item[0]
            )
            .join("")
            .toUpperCase();

    return (
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={
                        clearSelectedUser
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
                    aria-label="Back to conversations"
                >
                    <ArrowLeft
                        size={18}
                    />
                </button>

                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-search-primary text-sm font-semibold text-white shadow-sm">
                    {initials}

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
                </div>

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                        {name}
                    </h3>

                    <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {selectedUser.email || "Available"}
                    </p>
                </div>
            </div>

        </header>
    );
}
