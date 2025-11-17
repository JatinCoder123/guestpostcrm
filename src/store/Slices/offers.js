import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const offersSlice = createSlice({
  name: "offers",
  initialState: {
    loading: false,
    offers: [],
    count: 0,
    error: null,
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
          `${
            getState().user.crmEndpoint
          }&type=get_offers&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
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

export const offersAction = offersSlice.actions;
export default offersSlice.reducer;
