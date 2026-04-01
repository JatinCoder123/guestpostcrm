import { createContext, useState } from "react";
export const ThreadContext = createContext();

export const ThreadContextProvider = (props) => {
    const [currentEmail, setCurrentEmail] = useState(localStorage.getItem("currentEmail") || null)
    const [currentThread, setCurrentThread] = useState(null)

    const handleSetCurrent = ({ email = null, thread }) => {
        setCurrentEmail(email)
        setCurrentThread(thread)
        localStorage.setItem("currentEmail", email)
    }
    const value = {
        currentEmail, setCurrentEmail, handleSetCurrent, currentThread, setCurrentThread
    };

    return (
        <ThreadContext.Provider value={value}>{props.children}</ThreadContext.Provider>
    );
};
