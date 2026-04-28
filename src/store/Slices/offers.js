import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { extractEmail, showConsole } from "../../assets/assets";
import { applyHashtag } from "../../services/utils";
import { useDispatch, useSelector } from "react-redux";
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
    setOffers(state, action) {
      const offer = action.payload;
      state.count = offer?.data_count ?? 0
      state.offers = offer?.data ?? []
      state.summary = offer?.summary ?? []
    }
  },
});

export const getOffers = ({ email = null, page = 1, loading = true, brand = false }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(offersSlice.actions.getOffersRequest());
    }

    try {
      let res;
      if (brand) {
        res = await axios.get(
          `${getState().user.crmEndpoint
          }&type=brandTimeline${getState().ladger.timeline !== null && getState().ladger.timeline !== "null" ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50${email ? `&email=${email}` : ""}&case=offer`,
        );
      } else {
        res = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_offers${getState().ladger.timeline !== null && getState().ladger.timeline !== "null" ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50${email ? `&email=${email}` : ""}`,
        );
      }
      const data = brand ? res.data.data.offer : res.data
      showConsole && console.log(`${brand ? "BRAND" : ""} offers`, data);
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

export const updateOffer = ({ offers = [] }) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.updateOfferRequest());
    const email = extractEmail(offers[0]?.real_name ?? offers[0]?.email_c)
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
      offers.forEach(async (offer) => {
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
        showConsole && console.log(`Update Offer`, data);
      });

      const remRes = await axios.post(
        `${getState().user.crmEndpoint}&type=set_reminder`,
        {
          websites: offers.map((deal) => deal.website),
          email: email,
          reminder_type: "offer",
        },
      );
      showConsole && console.log(`Reminder Response`, remRes);

      const updatedOffers = getState().offers.offers.map((o) => {
        const updated = offers.find((uo) => uo.id === o.id);
        return updated ? updated : o;
      });
      dispatch(
        offersSlice.actions.updateOfferSuccess({
          offers: updatedOffers,
          message: `Offer Updated Successfully`,
        }),
      );
      // ✅ Trigger hashtag for Offer Update (memo_no = 12)
      triggerHashtag(13, "GET");

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
      dispatch(offersSlice.actions.updateOfferFailed("Updating Offer Failed"));
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
