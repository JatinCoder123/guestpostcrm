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
    message: null,
    creating: false,
  },
  reducers: {
    getOffersRequest(state) {
      state.loading = true;

      state.error = null;
    },
    getOffersSucess(state, action) {
      const { count, offers } = action.payload;
      state.loading = false;
      state.offers = offers;
      state.count = count;
      state.error = null;
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
    clearAllMessages(state) {
      state.message = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getOffers = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.getOffersRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_offers&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_offers&filter=${filter}&page=1&page_size=50`
        );
      }
      const data = response.data;
      console.log(`offers`, data);
      dispatch(
        offersSlice.actions.getOffersSucess({
          count: data.data_count ?? 0,
          offers: data.data,
        })
      );
      dispatch(offersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(offersSlice.actions.getOffersFailed("Fetching Offers  Failed"));
    }
  };
};
export const updateOffer = (offer) => {
  return async (dispatch, getState) => {
    dispatch(offersSlice.actions.updateOfferRequest());
    console.log(`Update Offer`, offer);

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
        offersSlice.actions.updateOfferSuccess({ offers: updatedOffers, message: "Offer Updated Successfully" })
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
      offers.map(async (offer) => {
        console.log(offer);
        const domain = getState().user.crmEndpoint.split("?")[0];
        const { data } = await axios.post(
          `${domain}?entryPoint=get_post_all&action_type=post_data`,

          {
            parent_bean: {
              module: "outr_offer",
              amount: offer.amount,
              client_offer_c: offer.client_offer_c,
              our_offer_c: offer.our_offer_c,
              website: offer.website,
              name: offer.email,
            },
          },
          {
            headers: {
              "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
              "Content-Type": "aplication/json",
            },
          }
        );
        console.log(`Create Offer`, data);

      });
      const updatedOffers = [...offers, ...getState().offers.offers];
      dispatch(
        offersSlice.actions.createOfferSuccess({
          message: "Offers Created Successfully",
          offers: updatedOffers,
        })
      );
      dispatch(offersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(offersSlice.actions.createOfferFailed("Offer Creation Failed"));
    }
  };
};
export const offersAction = offersSlice.actions;
export default offersSlice.reducer;
