import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const dealsSlice = createSlice({
  name: "deals",
  initialState: {
    loading: false,
    deals: [],
    count: 0,
    error: null,
  },
  reducers: {
    getDealsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDealsSucess(state, action) {
      const { count, deals } = action.payload;
      state.loading = false;
      state.deals = deals;
      state.count = count;
      state.error = null;
    },
    getDealsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getDeals = (filter, email) => {
  return async (dispatch) => {
    dispatch(dealsSlice.actions.getDealsRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=get_deals&filter=${filter}&email=${email}`
      );
      console.log(`Deals`, data);
      dispatch(
        dealsSlice.actions.getDealsSucess({
          count: data.data_count ?? 0,
          deals: data.data,
        })
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.getDealsFailed("Fetching Deal  Failed"));
    }
  };
};

export const dealsAction = dealsSlice.actions;
export default dealsSlice.reducer;
