import { useContext } from "react";
import { ThreadContext } from "../context/ThreadContext";
import { useNavigate } from "react-router-dom";

export const useThreadContext = () => {
    const navigateTo = useNavigate()
    const context = useContext(ThreadContext);
    const moveToThread = (threadId) => {
        navigateTo(`/thread/${threadId}`)
    }
    const moveToReply = (threadId, initialContent) => {
        navigateTo(`/thread/${threadId}/reply`, { state: { initialContent } })
    }
    if (!context) {
        throw new Error("useThreadContext must be used inside ThreadContextProvider");
    }
    const handleMove = ({ email, threadId, reply = false, addActivity = false }) => {
        context.handleSetCurrent({ email, thread: threadId })
        reply ? moveToReply(threadId, reply) : moveToThread(threadId);
        (addActivity || !reply) && localStorage.setItem("addActivity", true)

    }
    return { context, handleMove };
};