import {
    CheckCheck,
} from "lucide-react";

export default function ConversationItem({
    conversation,
    selected,
    onClick,
}) {
    const name =
        conversation?.name ||
        conversation?.email ||
        "Unknown User";

    const email =
        conversation?.email || "";

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
            .toUpperCase() || "?";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${selected
                ? "bg-accent"
                : "hover:bg-accent/70"
                }`}
        >
            {/* Avatar */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-search-primary text-sm font-semibold text-white">
                {initials}

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {name}
                    </p>

                    {conversation?.last_message_date && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                            {conversation.last_message_date}
                        </span>
                    )}
                </div>

                <div className="mt-1 flex items-center gap-1">
                    <CheckCheck
                        size={13}
                        className="shrink-0 text-muted-foreground"
                    />

                    <p className="truncate text-xs text-muted-foreground">
                        {conversation?.last_message ||
                            email}
                    </p>
                </div>
            </div>

            {conversation?.message_count >
                0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-search-primary px-1.5 text-[10px] font-semibold text-white">
                        {
                            conversation.message_count
                        }
                    </span>
                )}
        </button>
    );
}