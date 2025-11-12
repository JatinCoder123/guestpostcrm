import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

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
  return async (dispatch) => {
    dispatch(offersSlice.actions.getOffersRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=get_offers&filter=${filter}&email=${email}`
      );
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
