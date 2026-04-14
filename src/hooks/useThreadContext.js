import { useContext } from "react";
import { ThreadContext } from "../context/ThreadContext";
import { useNavigate } from "react-router-dom";

export const useThreadContext = () => {
    const navigateTo = useNavigate()
    const context = useContext(ThreadContext);
    const moveToThread = (viewEmails, loadAiReply) => {
        navigateTo(`/thread/view`, {
            state: {
                viewEmails: loadAiReply ? false : viewEmails,
                loadAiReply
            }
        })
    }
    const moveToReply = (initialContent) => {
        navigateTo(`/thread/reply`, { state: { initialContent } })
    }
    if (!context) {
        throw new Error("useThreadContext must be used inside ThreadContextProvider");
    }
    const handleMove = ({ email, threadId, viewEmail = null, reply = false, addActivity = false, loadAiReply = false }) => {
        context.handleSetCurrent({ email, thread: threadId })
        reply !== false ? moveToReply(reply) : moveToThread(viewEmail, loadAiReply);
        (addActivity || !reply) && localStorage.setItem("addActivity", true)

    }
    return { context, handleMove };
};