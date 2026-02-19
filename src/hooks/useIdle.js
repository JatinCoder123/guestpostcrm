import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import useRefresh from "./useRefresh";


function useIdle({ idle }) {
    const { setUserIdle, eventQueueRef, setEventQueue, } = useContext(SocketContext);
    const flushQueue = () => {
        const queue = eventQueueRef.current; // ✅ THIS IS THE REAL QUEUE
        console.log("FLUSHING QUEUE", queue);
        if (!queue || Object.keys(queue).length === 0) return;
        refreshLadger();

        for (let event in queue) {
            if (event === "outr_deal_fetch") {
                dispatch(getDeals({}));
            }
            if (event === "outr_order_gp_li") {
                dispatch(getOrders({}));
                dispatch(getInvoices({ loading: false }));
            }
            if (event === "outr_offer") {
                dispatch(getOffers({}));
            }
            if (event === "outr_self_test") {
                dispatch(getInvoices({ loading: false }));
            }
        }

        setEventQueue({});
        eventQueueRef.current = {}; // ✅ keep ref in sync
    }; useEffect(() => {
        setUserIdle(idle)
        return () => {
            setUserIdle(true)
            flushQueue()
        }
    }, [])
    return [];
}

export default useIdle;
