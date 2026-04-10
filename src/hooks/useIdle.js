import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { PageContext } from "../context/pageContext";
import { getLadger } from "../store/Slices/ladger";
import { getEmailsCount, getUnrepliedEmail } from "../store/Slices/unrepliedEmails";
import { getContact, getViewEmail, viewEmailAction } from "../store/Slices/viewEmail";
import { getOrders } from "../store/Slices/orders";
import { getInvoices } from "../store/Slices/invoices";
import { getOffers } from "../store/Slices/offers";
import { getDeals } from "../store/Slices/deals";


function useIdle({ idle }) {
    const { setUserIdle, eventQueueRef, setEventQueue, } = useContext(SocketContext);
    const {
        enteredEmail,
        currentIndex,
    } = useContext(PageContext);
    const dispatch = useDispatch();
    const { emails, loading } = useSelector((state) => state.unreplied);
    const [firstEmail, setFirstEmail] = useState(null);

    const refreshLadger = () => {
        if (enteredEmail) {
            dispatch(getLadger({ email: enteredEmail, search: enteredEmail }));
            dispatch(getViewEmail(enteredEmail));
            dispatch(getContact(enteredEmail));
        } else if (firstEmail) {
            dispatch(getLadger({ email: firstEmail, search: enteredEmail }));
            dispatch(getViewEmail(firstEmail));
            dispatch(getContact(firstEmail));
        }
        dispatch(getEmailsCount({}))
        dispatch(getUnrepliedEmail({ email: enteredEmail, loading: false }));
    };
    useEffect(() => {
        if (emails?.length > 0) {
            setFirstEmail(
                emails[currentIndex].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0],
            );
        }
    }, [emails?.length, currentIndex]);
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
            // flushQueue()
        }
    }, [])
    return [refreshLadger
    ];
}

export default useIdle;
