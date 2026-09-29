import {
    Search,
    X,
} from "lucide-react";

import {
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";
import { createPortal } from "react-dom";

import {
    useInternalChat,
} from "../context/InternalChatContext";


export default function StartChatModal() {
    const {
        isStartChatOpen,
        closeStartChat,
        users,
        isUsersLoading,
        startChatWithUser,
    } = useInternalChat();


    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef(null);


    /*
     * Filter users based on search text.
     *
     * Searches through:
     * - name
     * - email
     * - description
     */
    const filteredUsers = useMemo(() => {
        const term = searchTerm
            .trim()
            .toLowerCase();

        if (!term) {
            return users ?? [];
        }

        return (users ?? []).filter((user) => {
            const name =
                String(user?.name ?? "")
                    .toLowerCase();

            const email =
                String(user?.email ?? "")
                    .toLowerCase();

            const description =
                String(user?.description ?? "")
                    .toLowerCase();

            return (
                name.includes(term) ||
                email.includes(term) ||
                description.includes(term)
            );
        });
    }, [users, searchTerm]);


    /*
     * Reset search when modal closes/opens.
     */
    const handleClose = () => {
        setSearchTerm("");
        closeStartChat();
    };

    useEffect(() => {
        if (!isStartChatOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        searchInputRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") handleClose();
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isStartChatOpen]);


    if (!isStartChatOpen) {
        return null;
    }


    return createPortal(
        <div
            className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px] sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) handleClose();
            }}
            role="presentation"
        >
            <div
                className="flex max-h-[min(760px,88dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="start-chat-title"
            >

                {/* Header */}

                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">

                    <div>
                        <h2 id="start-chat-title" className="text-base font-semibold tracking-tight text-foreground">
                            Start New Chat
                        </h2>

                        <p className="text-xs text-muted-foreground">
                            Select a CRM user to start chatting
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Close"
                    >
                        <X size={17} />
                    </button>

                </div>


                {/* Search */}

                <div className="shrink-0 border-b border-border p-4">

                    <div className="flex h-11 items-center gap-2 rounded-xl border border-transparent bg-muted/60 px-3 transition focus-within:border-ring focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20">

                        <Search
                            size={16}
                            className="shrink-0 text-muted-foreground"
                        />


                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search by name or email"
                            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        />


                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X size={13} />
                            </button>
                        )}

                    </div>

                </div>


                {/* Users */}

                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">

                    {isUsersLoading ? (

                        <div className="flex items-center justify-center py-10">
                            <span className="text-xs text-muted-foreground">
                                Loading users...
                            </span>
                        </div>

                    ) : filteredUsers.length === 0 ? (

                        <div className="flex flex-col items-center justify-center py-10 px-4">

                            <Search
                                size={24}
                                className="mb-2 text-muted-foreground"
                            />

                            <span className="text-xs text-muted-foreground">
                                {searchTerm
                                    ? "No users match your search"
                                    : "No users found"}
                            </span>

                        </div>

                    ) : (

                        filteredUsers.map((user) => (

                            <button
                                key={
                                    user.user_id ??
                                    user.id ??
                                    user.email
                                }
                                type="button"
                                onClick={() =>
                                    startChatWithUser(user)
                                }
                                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >

                                {/* Avatar */}

                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-search-primary text-sm font-semibold text-white shadow-sm">

                                    {(
                                        user.name ??
                                        user.email ??
                                        "U"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}

                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />

                                </div>


                                {/* User information */}

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium text-foreground">
                                        {user.name ??
                                            "Unknown User"}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                        {user.description ||
                                            user.email ||
                                            "No description available"}
                                    </p>

                                </div>

                            </button>

                        ))

                    )}

                </div>

            </div>
        </div>,
        document.body,
    );
}
