import { useContext, useEffect, useState } from "react";
import { getdefaulterEmails } from "../store/Slices/defaulterEmails";
import { getmovedEmails } from "../store/Slices/movedEmails";
import { SocketContext } from "../context/SocketContext";
import { fetchGpcController } from "../store/Slices/gpcControllerSlice";
import { hotAction } from "../store/Slices/hotSlice";
import { checkForDuplicates } from "../store/Slices/duplicateEmailSlice";
import { getOrders } from "../store/Slices/orders";
import { getInvoices } from "../store/Slices/invoices";
import { getOffers } from "../store/Slices/offers";
import { PageContext } from "../context/pageContext";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../store/Slices/crmUser.js";
import { useMarketPlace } from "../queries/marketplace.queries.js";

function useRefresh() {
    const { notificationCount, setNotificationCount, currentEventThreadId } = useContext(SocketContext);
    const { enteredEmail } = useContext(PageContext);
    const dispatch = useDispatch();
    const { timeline } = useSelector((state) => state.ladger);
    useMarketPlace()
    useEffect(() => {
        dispatch(getAllUsers())
        dispatch(fetchGpcController());
    }, [])
    useEffect(() => {
        dispatch(getmovedEmails(enteredEmail));
    }, [enteredEmail, timeline, dispatch]); // ✅ Added dependencies
    useEffect(() => {
        if (notificationCount.unreplied_email) {
            // refreshLadger();
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
            dispatch(hotAction.updateCount(1));
            setNotificationCount((prev) => ({
                ...prev,
                outr_deal_fetch: null,
            }));
        }
        if (notificationCount.outr_order_gp_li) {
            dispatch(getOrders({ loading: false }));
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
            dispatch(getOffers({ loading: false }));
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