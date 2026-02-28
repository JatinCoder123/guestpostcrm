import { useContext } from "react";
import { ThreadContext } from "../context/ThreadContext";

export const useThreadContext = () => {
    const context = useContext(ThreadContext);
    if (!context) {
        throw new Error("useThreadContext must be used inside ThreadContextProvider");
    }
    return context;
};