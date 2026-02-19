import React, { useContext, useEffect, useState } from "react";
import { getForwardedEmails } from "../store/Slices/forwardedEmailSlice";
import { getFavEmails } from "../store/Slices/favEmailSlice";
import { getLinkExchange } from "../store/Slices/linkExchange";
import { getAllAvatar } from "../store/Slices/avatarSlice";
import { getdefaulterEmails } from "../store/Slices/defaulterEmails";
import { getmovedEmails } from "../store/Slices/movedEmails";
import { SocketContext } from "../context/SocketContext";
import { getAllWebsites } from "../store/Slices/webSlice";
import { fetchGpcController } from "../store/Slices/gpcControllerSlice";
import { getMarketplace } from "../store/Slices/Marketplace";
import { getQuickActionBtn } from "../store/Slices/quickActionBtn";
import { hotAction } from "../store/Slices/hotSlice";
import { eventActions } from "../store/Slices/eventSlice";
import { getAiCredits } from "../store/Slices/aiCredits";
import { getLadger } from "../store/Slices/ladger";
import {
    checkForDuplicates,
    getDuplicateCount,
} from "../store/Slices/duplicateEmailSlice";
import { getUnansweredEmails } from "../store/Slices/unansweredEmails";
import { getUnrepliedEmail } from "../store/Slices/unrepliedEmails";
import { getOrders } from "../store/Slices/orders";
import { getDeals } from "../store/Slices/deals";
import { getInvoices } from "../store/Slices/invoices";
import { getOffers } from "../store/Slices/offers";
import { getDetection } from "../store/Slices/detection";
import {
    getContact,
    getViewEmail,
    viewEmailAction,
} from "../store/Slices/viewEmail";
import { PageContext } from "../context/pageContext";
import { useDispatch, useSelector } from "react-redux";

function useRefresh() {
    const { eventQueueRef, setEventQueue, notificationCount, setNotificationCount } = useContext(SocketContext);
    const {
        enteredEmail,
        currentIndex,
        setCurrentIndex,
        search,
        setWelcomeHeaderContent,
    } = useContext(PageContext);
    const dispatch = useDispatch();

    const { emails, loading } = useSelector((state) => state.unreplied);
    const { timeline, email } = useSelector((state) => state.ladger);
    const [firstEmail, setFirstEmail] = useState(null);
    useEffect(() => {
        dispatch(getAiCredits());
        dispatch(getUnansweredEmails({ email: enteredEmail }));
        dispatch(getUnrepliedEmail({ email: enteredEmail }));
        dispatch(getForwardedEmails({}));
        dispatch(getFavEmails({ email: enteredEmail }));
        dispatch(getAllWebsites());
        dispatch(getLinkExchange(enteredEmail));
        dispatch(getMarketplace())
        dispatch(getOrders({ email: enteredEmail }));
        dispatch(getDeals({ email: enteredEmail }));
        dispatch(getInvoices({ email: enteredEmail }));
        dispatch(getOffers({ email: enteredEmail }));
        dispatch(getDetection(enteredEmail));
        dispatch(fetchGpcController());
        dispatch(getdefaulterEmails(enteredEmail));
        dispatch(getmovedEmails(enteredEmail));
        dispatch(getAllAvatar());
        dispatch(getQuickActionBtn());
        dispatch(getDuplicateCount());
        setCurrentIndex(0);
    }, [enteredEmail, timeline, dispatch]); // ✅ Added dependencies
    const refreshLadger = () => {
        if (enteredEmail) {
            dispatch(getLadger({ email: enteredEmail, search }));
        } else if (firstEmail) {
            dispatch(getLadger({ email: firstEmail, search }));
        } else if (!loading) {
            dispatch(getLadger({ search, isEmail: false }));
        }
        dispatch(getUnrepliedEmail({ email: enteredEmail, loading: false }));
        dispatch(getUnansweredEmails({ email: enteredEmail, loading: false }));
        dispatch(viewEmailAction.resetViewEmail());
    };
    useEffect(() => {
        if (emails?.length > 0) {
            setWelcomeHeaderContent("Unreplied");
            setFirstEmail(
                emails[currentIndex].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0],
            );
        }
    }, [emails?.length, currentIndex]);



    // Fetch ladger when email changes
    useEffect(() => {
        if (enteredEmail) {
            dispatch(getLadger({ email: enteredEmail, search }));
        } else if (firstEmail) {
            dispatch(getLadger({ email: firstEmail, search }));
        } else if (!loading) {
            dispatch(getLadger({ search, isEmail: false }));
        }
        dispatch(viewEmailAction.resetViewEmail());
    }, [enteredEmail, firstEmail, timeline, dispatch]);

    // Fetch view email and contact when ladger email is set
    useEffect(() => {
        if (email) {
            dispatch(getViewEmail());
            dispatch(getContact());
        }
    }, [email, dispatch]);

    // Handle socket notifications
    useEffect(() => {
        if (notificationCount.unreplied_email) {
            refreshLadger();
            dispatch(checkForDuplicates());
            setNotificationCount((prev) => ({
                ...prev,
                unreplied_email: null,
            }));
        }
        if (notificationCount.refreshUnreplied) {
            refreshLadger();
            setNotificationCount((prev) => ({
                ...prev,
                refreshUnreplied: null,
            }));
        }
        if (notificationCount.outr_el_process_audit) {
            refreshLadger();
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_el_process_audit: null,
            }));
        }
        if (notificationCount.outr_deal_fetch) {
            refreshLadger();
            dispatch(getDeals({}));
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_deal_fetch: null,
            }));
        }
        if (notificationCount.outr_order_gp_li) {
            dispatch(getOrders({}));
            dispatch(getInvoices({ loading: false }));
            refreshLadger();
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_order_gp_li: null,
            }));
        }
        if (notificationCount.outr_self_test) {
            refreshLadger();
            dispatch(getInvoices({ loading: false }));
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_self_test: null,
            }));
        }
        if (notificationCount.outr_offer) {
            refreshLadger();
            dispatch(getOffers({}));
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_offer: null,
            }));
        }
        if (notificationCount.outr_paypal_invoice_links) {
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_paypal_invoice_links: null,
            }));
        }
    }, [notificationCount, dispatch, setNotificationCount]);
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
    };

    return [flushQueue];
}

export default useRefresh;
