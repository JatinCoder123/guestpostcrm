import { createContext, useState } from "react";

export const ThreadContext = createContext();

export const ThreadContextProvider = (props) => {
    const [currentThread, setCurrentThread] = useState(localStorage.getItem("currentThread") || null)
    const [currentEmail, setCurrentEmail] = useState(localStorage.getItem("currentEmail") || null)

    const handleSetCurrent = ({ email = null, thread = null }) => {
        setCurrentEmail(email)
        setCurrentThread(thread)
        localStorage.setItem("currentEmail", email)
        localStorage.setItem("currentThread", thread)
    }



    const value = {
        currentThread, setCurrentThread, currentEmail, setCurrentEmail, handleSetCurrent
    };

    return (
        <ThreadContext.Provider value={value}>{props.children}</ThreadContext.Provider>
    );
};
