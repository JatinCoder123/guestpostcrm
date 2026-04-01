import { useContext } from "react";
import { ThreadContext } from "../context/ThreadContext";
import { useNavigate } from "react-router-dom";

export const useThreadContext = () => {
    const navigateTo = useNavigate()
    const context = useContext(ThreadContext);
    const moveToThread = (viewEmails) => {
        navigateTo(`/thread/view`, {
            state: {
                viewEmails,
            }
        })
    }
    const moveToReply = (initialContent) => {
        navigateTo(`/thread/reply`, { state: { initialContent } })
    }
    if (!context) {
        throw new Error("useThreadContext must be used inside ThreadContextProvider");
    }
    const handleMove = ({ email, threadId, viewEmail = null, reply = false, addActivity = false }) => {
        context.handleSetCurrent({ email, thread: threadId })
        reply ? moveToReply(reply) : moveToThread(viewEmail);
        (addActivity || !reply) && localStorage.setItem("addActivity", true)

    }
    return { context, handleMove };
};