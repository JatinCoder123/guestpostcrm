import { createSlice } from "@reduxjs/toolkit";
import { CREATE_DEAL_API_KEY } from "../constants";
import { extractEmail, showConsole } from "../../assets/assets";
import { applyHashtag } from "../../services/utils";
import {
    updateActivity,
    createLedgerEntry,
    buildLedgerItem,
} from "../../services/utils";
import { getLadger } from "./ladger";
import { apiRequest, fetchGpc } from "../../services/api";

const webManagerSlice = createSlice({
    name: "webManager",
    initialState: {
        loading: false,
        websites: [],
        count: 0,
        error: null,
        message: null,
        deleteWebsiteId: null,
    },
    reducers: {
        getWebsitesRequest(state) {
            state.loading = true;
            state.error = null;
        },
        getWebsitesSucess(state, action) {
            const { count, websites } = action.payload;
            state.loading = false;
            state.websites = websites;
            state.summary = summary;
            state.count = count;
        },
        getWebsitesFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        createWebsiteRequest(state) {
            state.loading = true;
            state.message = null;
            state.error = null;
        },
        createWebsiteSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.error = null;
        },
        createWebsiteFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        updateWebsiteRequest(state) {
            state.loading = true;
            state.message = null;
            state.error = null;
        },
        updateWebsiteSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.error = null;
        },
        updateWebsiteFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        deleteWebsiteRequest(state, action) {
            state.deleting = true;
            state.error = null;
            state.deleteWebsiteId = action.payload.id;
        },
        deleteWebsiteSuccess(state, action) {
            state.deleting = false;
            state.deleteWebsiteId = null;
            state.count = action.payload.count;
            state.error = null;
        },
        deleteWebsiteFailed(state, action) {
            state.deleting = false;
            state.error = action.payload;
            state.deleteWebsiteId = null;
        },
        clearAllMessages(state) {
            state.message = null;
        },
        clearAllErrors(state) {
            state.error = null;
        },
    },
});

export const getManageWeb = (loading = true) => {
    return async (dispatch, getState) => {
        if (loading) { dispatch(webManagerSlice.actions.getWebsitesRequest()); }
        try {
            const data = await fetchGpc({ params: { type: 'get_website' } })
            showConsole && console.log(`WEBSITE MANAGER SITEs`, data);
            if (!data.success) {
                throw new Error()
            }
            dispatch(webManagerSlice.actions.getWebsitesSucess({ count: data.data.length ?? 0, websites: data.data }),);
            dispatch(webManagerSlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(webManagerSlice.actions.getWebsitesFailed("Fetching Manger Website Failed"));
        }
    };
};

export const updateOffer = (website) => {
    return async (dispatch, getState) => {
        dispatch(webManagerSlice.actions.updateOfferRequest());
        try {



            dispatch(

            );
            // ✅ Trigger hashtag for Offer Update (memo_no = 12)
            triggerHashtag(13, "GET");

            dispatch(webManagerSlice.actions.clearAllErrors());
            await createLedgerEntry({
                domain,
                email: email,
                thread_id: offers[0].thread_id,
                message_id: offers[0].thread_id,
                group: "Offer",
                okHandler: () => dispatch(getLadger({ email, loading: false })),
                items: offers.map((offer) =>
                    buildLedgerItem({
                        status: "Our-Offer-Updated",
                        detail: `website: {${getDomain(offer.website)}} amount: {${offer.our_offer_c}}`,
                        ladgerState: state.ladger,
                        user: state.user.user,
                        parent_name: "outr_offer",
                    }),
                ),
            });
        } catch (error) {
            showConsole && console.log(`Update Offer Error`, error);
            dispatch(webManagerSlice.actions.updateOfferFailed("Updating Offer Failed"));
        }
    };
};
export const createOffer = ({
    threadId,
    email,
    offers = [],
}) => {
    return async (dispatch, getState) => {
        dispatch(offersSlice.actions.createOfferRequest());
        try {
            const state = getState();
            const domain = getState().user.crmEndpoint.split("?")[0];
            const crmEndpoint = getState().user.crmEndpoint;

            const triggerHashtag = (memo_no, method = "GET") => {
                applyHashtag({
                    domain: crmEndpoint,
                    email,
                    memo_no,
                    method,
                });
            };
            const getDomain = (url) => {
                try {
                    return new URL(url).hostname.replace(/^www\./, "");
                } catch (e) {
                    return url;
                }
            };
            const data = await apiRequest({
                endpoint: `${domain}?entryPoint=get_offer`, method: "POST", body: {
                    records: offers.map((offer) => ({
                        amount: offer.amount,
                        client_offer_c: offer.client_offer_c,
                        our_offer_c: offer.our_offer_c,
                        website: offer.website,
                        email_c: email,
                        thread_id: threadId,
                        name: email,
                    })),
                    child_bean: {
                        module: "Contacts",
                        email1: offers[0].email,
                    },
                },
            });

            showConsole && console.log(`Create Offer`, data);
            dispatch(
                offersSlice.actions.createOfferSuccess({
                    message: "Offers Created Successfully",
                }),
            );
            // ✅ Trigger hashtag for Offer Creation (memo_no = 8)
            triggerHashtag(8, "GET");

            dispatch(offersSlice.actions.clearAllErrors());
            updateActivity(
                getState().user.crmEndpoint,
                getState().ladger.email,
                getState().user.user.name,
                getState().user.user.email,
                "Offer Created ",
            );

            // 🔥 Ledger API Call
            await createLedgerEntry({
                domain,
                email: email,
                thread_id: threadId,
                message_id: threadId,
                group: "Offer",
                okHandler: () => dispatch(getLadger({ email, loading: false })),
                items: offers.map((offer) =>
                    buildLedgerItem({
                        status: "Our-Offer-Created",
                        detail: `website: {${getDomain(offer.website)}} amount: {${offer.our_offer_c}}`,
                        ladgerState: state.ladger,
                        user: state.user.user,
                        parent_name: "outr_offer",
                    }),
                ),
            });
            updateActivity(
                getState().user.crmEndpoint,
                email,
                getState().user.user.name,
                getState().user.user.email,
                "Offer Created ",
            );
        } catch (error) {
            dispatch(offersSlice.actions.createOfferFailed("Offer Creation Failed"));
        }
    };
};
export const deleteOffer = (id, offer) => {
    return async (dispatch, getState) => {
        dispatch(offersSlice.actions.deleteOfferRequest({ id }));
        const email = extractEmail(offer?.real_name ?? offer.email_c)
        const state = getState();
        const crmEndpoint = getState().user.crmEndpoint;

        const triggerHashtag = (memo_no, method = "GET") => {
            applyHashtag({
                domain: crmEndpoint,
                email,
                memo_no,
                method,
            });
        };
        const getDomain = (url) => {
            try {
                return new URL(url).hostname.replace(/^www\./, "");
            } catch (e) {
                return url;
            }
        };

        try {
            const data = await fetchGpc({ params: { type: 'delete_record', module_name: 'outr_offer', record_id: id } }
            );
            showConsole && console.log(`Delete Offer`, data);
            if (!data.success) {
                throw new Error(data.message);
            }
            const updatedOffers = getState().offers.offers.filter(
                (offer) => offer.id !== id,
            );
            dispatch(
                offersSlice.actions.deleteOfferSuccess({
                    offers: updatedOffers,
                    count: getState().offers.count - 1,
                }),
            );
            // ✅ Trigger hashtag for Offer Creation (memo_no = 8)
            triggerHashtag(12, "GET");
            dispatch(offersSlice.actions.clearAllErrors());
            updateActivity(
                getState().user.crmEndpoint,
                email,
                getState().user.user.name,
                getState().user.user.email,
                "Offer Deleted",
            );
            await createLedgerEntry({
                domain: state.user.crmEndpoint.split("?")[0],
                email: email,
                group: "Offer",
                okHandler: () => dispatch(getLadger({ email, loading: false })),
                items: [
                    buildLedgerItem({
                        status: "offer_deleted",
                        detail: `website: {${getDomain(offer?.website)}}`,
                        ladgerState: state.ladger,
                        user: state.user.user,
                        parent_name: "outr_offer",
                    }),
                ],
            });
        } catch (error) {
            dispatch(offersSlice.actions.deleteOfferFailed(error.message));
        }
    };
};
export const offersAction = offersSlice.actions;
export default offersSlice.reducer;
