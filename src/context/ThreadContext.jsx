import { createContext, useState } from "react";
export const ThreadContext = createContext();

export const ThreadContextProvider = (props) => {
    const [currentEmail, setCurrentEmail] = useState(localStorage.getItem("currentEmail") || null)

    const handleSetCurrent = ({ email = null }) => {
        setCurrentEmail(email)
        localStorage.setItem("currentEmail", email)
    }
    const value = {
        currentEmail, setCurrentEmail, handleSetCurrent
    };

    return (
        <ThreadContext.Provider value={value}>{props.children}</ThreadContext.Provider>
    );
};
