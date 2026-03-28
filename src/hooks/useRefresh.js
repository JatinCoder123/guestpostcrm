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
import { getEmailsCount, getUnrepliedEmail } from "../store/Slices/unrepliedEmails";
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
import { getOrderRem } from "../store/Slices/reminder.js";
import { extractEmail } from "../assets/assets";
import { getBacklinks } from "../store/Slices/backlinks.js";
import { getAllContacts } from "../store/Slices/contacts.js";

function useRefresh() {
    const { notificationCount, setNotificationCount, currentEventThreadId } = useContext(SocketContext);
    const {
        enteredEmail,
        currentIndex,
        setCurrentIndex,
        search,
        setWelcomeHeaderContent,
    } = useContext(PageContext);
    const dispatch = useDispatch();

    const { emails } = useSelector((state) => state.unreplied);
    const { timeline } = useSelector((state) => state.ladger);
    const { threadId } = useSelector((state) => state.viewEmail);
    const [firstEmail, setFirstEmail] = useState(null);
    useEffect(() => {
        dispatch(getAiCredits());
        dispatch(getAllWebsites());
        dispatch(getOrderRem(null, 1));
        dispatch(getMarketplace())
        dispatch(getBacklinks({}));
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
    }, [enteredEmail, timeline, dispatch]); // ✅ Added dependencies
    useEffect(() => {
        dispatch(getEmailsCount({}))
        dispatch(getUnrepliedEmail({}));
        dispatch(getLinkExchange());
        dispatch(getFavEmails({}));
        dispatch(getAllContacts({}))
        dispatch(getForwardedEmails({}));
    }, [timeline, dispatch]); // ✅ Added dependencies
    const refreshLadger = () => {
        if (currentEventThreadId.current == threadId) {
            console.log("REFRESH LADGER")
            if (enteredEmail) {
                dispatch(getLadger({ email: enteredEmail, search }));
                dispatch(getViewEmail(enteredEmail));
                dispatch(getContact(enteredEmail));
            } else if (firstEmail) {
                dispatch(getLadger({ email: firstEmail, search }));
                dispatch(getViewEmail(firstEmail));
                dispatch(getContact(firstEmail));
            }
            dispatch(getEmailsCount({}))
            dispatch(getUnrepliedEmail({ loading: false }));
            dispatch(getUnansweredEmails({ loading: false }));
        }
    };
    useEffect(() => {
        if (emails?.length > 0) {
            setFirstEmail(
                emails[currentIndex].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0],
            );
            if (enteredEmail) {
                const index = emails.findIndex((email) => extractEmail(email?.from) === enteredEmail)
                if (index > -1 && index !== currentIndex) {
                    setCurrentIndex(index);
                }
            }
        }
    }, [emails?.length, currentIndex]);

    useEffect(() => {
        if (!enteredEmail && !firstEmail) return;

        const emailToUse = enteredEmail || firstEmail;

        dispatch(getLadger({ email: emailToUse, search }));
        dispatch(getViewEmail(emailToUse));
        dispatch(getContact(emailToUse));
    }, [enteredEmail, firstEmail, dispatch]);

    useEffect(() => {
        if (notificationCount.unreplied_email) {
            refreshLadger();
            dispatch(checkForDuplicates());
            setNotificationCount((prev) => ({
                ...prev,
                unreplied_email: null,
            }));
        }
        if (notificationCount.outr_el_process_audit) {
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_el_process_audit: null,
            }));
        }
        if (notificationCount.outr_deal_fetch) {
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
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_order_gp_li: null,
            }));
        }
        if (notificationCount.outr_self_test) {
            dispatch(getInvoices({ loading: false }));
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_self_test: null,
            }));
        }
        if (notificationCount.outr_offer) {
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


    return [];
}

export default useRefresh;