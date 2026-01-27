import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";

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
    parent_id: null,
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
      state.offers = offers;
      state.summary = summary
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
      state.offers = action.payload.offers;
      state.parent_id = action.payload.parent_id;
      state.count = action.payload.count;
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
      state.parent_id = action.payload.parent_id;
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
      state.deleteOfferId = action.payload;
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
      state.parent_id = null;
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
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_offers&${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=${page}&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_offers&${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50`
        );
      }
      const data = response.data;
      console.log(`offers`, data);
      dispatch(
        offersSlice.actions.getOffersSucess({
          count: data.data_count ?? 0,
          offers: data.data ?? [],
          summary: data.summary ?? null,
          pageCount: data.total_pages ?? 1,
          pageIndex: data.current_page ?? 1,
        })
      );
      dispatch(offersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(offersSlice.actions.getOffersFailed("Fetching Offers  Failed"));
    }
  };
};
export const updateOffer = (offer, send) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.updateOfferRequest());
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
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
        }
      );
      console.log(`Update Offer`, data);
      const updatedOffers = getState().offers.offers.map((o) => {
        if (o.id === offer.id) {
          return offer;
        }
        return o;
      });
      dispatch(
        offersSlice.actions.updateOfferSuccess({ offers: updatedOffers, message: `Offer Updated ${send ? "and Send Successfully" : "Successfully"}` })
      );

      dispatch(offersSlice.actions.clearAllErrors());
    } catch (error) {
      console.log(`Update Offer Error`, error);
      dispatch(
        offersSlice.actions.updateOfferFailed("Updating Offer Failed")
      );
    }
  };
};
export const createOffer = (offers = []) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.createOfferRequest());
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const { data } = await axios.post(
        `${domain}?entryPoint=get_offer`,

        {
          records: offers.map((offer) => ({
            amount: offer.amount,
            client_offer_c: offer.client_offer_c,
            our_offer_c: offer.our_offer_c,
            website: offer.website,
            email_c: offer.email,
            name: offer.email,
          })),
          child_bean: {
            module: "Contacts",
            email1: offers[0].email,

          },
        },
      );
      console.log(`Create Offer`, data);
      const updatedOffers = [...offers, ...getState().offers.offers];
      dispatch(
        offersSlice.actions.createOfferSuccess({
          message: "Offers Created Successfully",
          offers: updatedOffers,
          count: updatedOffers.length,
        })
      );
      dispatch(offersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(offersSlice.actions.createOfferFailed("Offer Creation Failed"));
    }
  };
};
export const deleteOffer = (id) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.deleteOfferRequest(id));
    try {
      const { data } = await axios.post(`${getState().user.crmEndpoint}&type=delete_record&module_name=outr_offer&record_id=${id}`
      );
      console.log(`Delete Offer`, data);
      if (!data.success) {
        throw new Error(data.message);
      }
      const updatedOffers = getState().offers.offers.filter((offer) => offer.id !== id);
      dispatch(
        offersSlice.actions.deleteOfferSuccess({
          offers: updatedOffers,
          count: getState().offers.count - 1,
        })
      );
      dispatch(offersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(offersSlice.actions.deleteOfferFailed(error.message));
    }
  };
};
export const offersAction = offersSlice.actions;
export default offersSlice.reducer;
