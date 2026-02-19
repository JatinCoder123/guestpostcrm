import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import useRefresh from "./useRefresh";


function useIdle({ idle }) {
    const { setUserIdle, eventQueue } = useContext(SocketContext);
    const [flushQueue] = useRefresh();
    useEffect(() => {
        setUserIdle(idle)
        return () => {
            setUserIdle(true)
            flushQueue()
        }
    }, [])
    return [];
}

export default useIdle;
