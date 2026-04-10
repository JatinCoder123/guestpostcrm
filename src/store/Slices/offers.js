import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { extractEmail, showConsole } from "../../assets/assets";
import {
  updateActivity,
  createLedgerEntry,
  buildLedgerItem,
} from "../../services/utils";
import { getLadger } from "./ladger";

const offersSlice = createSlice({
  name: "offers",
  initialState: {
    loading: false,
    offers: [],
    count: 0,
    error: null,
    updating: false,
    summary: null,
    message: null,
    pageCount: 1,
    pageIndex: 1,
    creating: false,
    deleting: false,
    deleteOfferId: null,
  },
  reducers: {
    getOffersRequest(state) {
      state.loading = true;

      state.error = null;
    },
    getOffersSucess(state, action) {
      const { count, offers, summary, pageCount, pageIndex } = action.payload;
      state.loading = false;
      if (pageIndex === 1) {
        state.offers = offers;
      } else {
        state.offers = [...state.offers, ...offers];
      }
      state.summary = summary;
      state.count = count;
      state.error = null;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
    },
    getOffersFailed(state, action) {
      state.loading = false;

      state.error = action.payload;
    },
    createOfferRequest(state) {
      state.creating = true;
      state.message = null;
      state.error = null;
    },
    createOfferSuccess(state, action) {
      state.creating = false;
      state.message = action.payload.message;
      state.error = null;
    },
    createOfferFailed(state, action) {
      state.creating = false;
      state.error = action.payload;
      state.message = null;
    },
    updateOfferRequest(state) {
      state.updating = true;
      state.message = null;
      state.error = null;
    },
    updateOfferSuccess(state, action) {
      state.updating = false;
      state.message = action.payload.message;
      state.offers = action.payload.offers;
      state.error = null;
    },
    updateOfferFailed(state, action) {
      state.updating = false;
      state.error = action.payload;
      state.message = null;
    },
    deleteOfferRequest(state, action) {
      state.deleting = true;
      state.error = null;
      state.deleteOfferId = action.payload.id;
    },
    deleteOfferSuccess(state, action) {
      state.deleting = false;
      state.deleteOfferId = null;
      state.offers = action.payload.offers;
      state.count = action.payload.count;
      state.error = null;
    },
    deleteOfferFailed(state, action) {
      state.deleting = false;
      state.error = action.payload;
      state.deleteOfferId = null;
    },
    clearAllMessages(state) {
      state.message = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getOffers = ({ email = null, page = 1, loading = true }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(offersSlice.actions.getOffersRequest());
    }

    try {
      const { data } = await axios.get(
        `${
          getState().user.crmEndpoint
        }&type=get_offers${getState().ladger.timeline !== null && getState().ladger.timeline !== "null" ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50${email ? `&email=${email}` : ""}`,
      );

      showConsole && console.log(`offers`, data);
      dispatch(
        offersSlice.actions.getOffersSucess({
          count: data.data_count ?? 0,
          offers: data.data ?? [],
          summary: data.summary ?? null,
          pageCount: data.total_pages ?? 1,
          pageIndex: data.current_page ?? 1,
        }),
      );
      dispatch(offersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(offersSlice.actions.getOffersFailed("Fetching Offers  Failed"));
    }
  };
};
export const updateOffer = ({ email, offer }) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.updateOfferRequest());
    try {
      const state = getState();
      const domain = getState().user.crmEndpoint.split("?")[0];
      const getDomain = (url) => {
        try {
          return new URL(url).hostname.replace(/^www\./, "");
        } catch (e) {
          return url;
        }
      };
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        {
          parent_bean: {
            module: "outr_offer",
            ...offer,
          },
        },
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "aplication/json",
          },
        },
      );
      const remRes = await axios.post(
        `${getState().user.crmEndpoint}&type=set_reminder&website=${offer.website}&email=${email}&reminder_type=offer`,
      );
      showConsole && console.log(`Update Offer`, data);
      showConsole && console.log(`Reminder Response`, remRes);

      const updatedOffers = getState().offers.offers.map((o) => {
        if (o.id === offer.id) {
          return offer;
        }
        return o;
      });
      dispatch(
        offersSlice.actions.updateOfferSuccess({
          offers: updatedOffers,
          message: `Offer Updated Successfully`,
        }),
      );

      dispatch(offersSlice.actions.clearAllErrors());
      updateActivity(
        getState().user.crmEndpoint,
        email,
        getState().user.user.name,
        getState().user.user.email,
        "Offer Updated ",
      );

      await createLedgerEntry({
        domain,
        email: email,
        thread_id: offer.thread_id,
        message_id: offer.thread_id,
        group: "Offer",
        okHandler: () => dispatch(getLadger({ email })),
        items: [
          buildLedgerItem({
            status: "Our-Offer-Updated",
            detail: `website: {${getDomain(offer.website)}} amount: {${offer.our_offer_c}}`,
            ladgerState: state.ladger,
            user: state.crmUser.currentUser,
            parent_name: "outr_offer",
          }),
        ],
      });
    } catch (error) {
      showConsole && console.log(`Update Offer Error`, error);
      dispatch(offersSlice.actions.updateOfferFailed("Updating Offer Failed"));
    }
  };
};
export const createOffer = ({
  threadId,
  email,
  offers = [],
  isSend = false,
}) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.createOfferRequest());
    try {
      const state = getState();
      const domain = getState().user.crmEndpoint.split("?")[0];
      const getDomain = (url) => {
        try {
          return new URL(url).hostname.replace(/^www\./, "");
        } catch (e) {
          return url;
        }
      };
      const { data } = await axios.post(
        `${domain}?entryPoint=get_offer`,

        {
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
      );
      showConsole && console.log(`Create Offer`, data);
      dispatch(
        offersSlice.actions.createOfferSuccess({
          message: "Offers Created Successfully",
        }),
      );
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
        okHandler: () => dispatch(getLadger({ email })),
        items: offers.map((offer) =>
          buildLedgerItem({
            status: "Our-Offer-Created",
            detail: `website: {${getDomain(offer.website)}} amount: {${offer.our_offer_c}}`,
            ladgerState: state.ladger,
            user: state.crmUser.currentUser,
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
export const deleteOffer = (email, id, offer) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.deleteOfferRequest({ id }));
    const state = getState();
    const getDomain = (url) => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (e) {
        return url;
      }
    };

    try {
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=delete_record&module_name=outr_offer&record_id=${id}`,
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
        okHandler: () => dispatch(getLadger({ email })),
        items: [
          buildLedgerItem({
            status: "offer_deleted",
            detail: `website: {${getDomain(offer?.website)}}`,
            ladgerState: state.ladger,
            user: state.crmUser.currentUser,
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
