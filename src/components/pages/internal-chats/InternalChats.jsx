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
        <div className="flex h-full min-h-0 w-full overflow-hidden rounded-xl border border-border bg-card">            {/* 
                MOBILE:
                Show sidebar only when no user is selected.

                DESKTOP:
                Always show sidebar.
            */}
            <div
                className={`
                    h-full min-h-0 shrink-0
                    ${selectedUser
                        ? "hidden md:flex"
                        : "flex w-full md:w-[340px]"
                    }
                `}
            >
                <ChatSidebar />
            </div>

            {/* 
                MOBILE:
                Show chat only when a user is selected.

                DESKTOP:
                Always show chat panel.
            */}
            <div
                className={`
                    min-h-0 min-w-0 flex-1 flex-col
                    ${selectedUser
                        ? "flex"
                        : "hidden md:flex"
                    }
                `}
            >
                <ChatHeader />

                <ChatMessages />

                <ChatInput />
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