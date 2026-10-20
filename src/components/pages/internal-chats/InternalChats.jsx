import {
    InternalChatProvider,
    useInternalChat,
} from "./context/InternalChatContext";

import ChatSidebar from "./components/ChatSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import StartChatModal from "./components/StartChatModal";

const InternalChatContent = () => {
    const {
        selectedUser,
    } = useInternalChat();

    return (
        <div
            className="
                flex
                h-[calc(100dvh-9.5rem)]
                min-h-[560px]
                w-full
                shrink-0
                overflow-hidden
                rounded-2xl
                border
                border-border
                bg-card
                shadow-sm
            "
        >
            {/* =========================================
                CHAT SIDEBAR
            ========================================== */}

            <div
                className={`
                    h-full
                    min-h-0
                    shrink-0
                    overflow-hidden

                    ${selectedUser
                        ? "hidden md:flex"
                        : "flex w-full md:w-[360px] lg:w-[380px]"
                    }
                `}
            >
                <ChatSidebar />
            </div>

            {/* =========================================
                CHAT PANEL
            ========================================== */}

            <div
                className={`
                    min-h-0
                    min-w-0
                    flex-1
                    flex-col
                    overflow-hidden

                    ${selectedUser
                        ? "flex"
                        : "hidden md:flex"
                    }
                `}
            >
                <div className="shrink-0">
                    <ChatHeader />
                </div>

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-hidden
                    "
                >
                    <ChatMessages />
                </div>

                <div className="shrink-0 border-t border-border bg-card px-3 py-3 sm:px-5 sm:py-4">
                    <ChatInput />
                </div>
            </div>

            <StartChatModal />
        </div>
    );
};

export default function InternalChats() {
    return (
        <InternalChatProvider>
            <InternalChatContent />
        </InternalChatProvider>
    );
}
