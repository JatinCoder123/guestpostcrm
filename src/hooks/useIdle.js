import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";


function useIdle({ idle }) {
    const { setUserIdle, eventQueue } = useContext(SocketContext);
    useEffect(() => {
        setUserIdle(idle)
        return () => {
            setUserIdle(true)
            console.log("EVENTS", eventQueue)
        }
    }, [])
    return [];
}

export default useIdle;
