import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const dealRemSlice = createSlice({
  name: "dealRem",
  initialState: {
    loading: false,
    dealRem: [],
    count: 0,
    error: null,
  },
  reducers: {
    getDealRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDealRemSucess(state, action) {
      const { count, dealRem } = action.payload;
      state.loading = false;
      state.dealRem = dealRem;
      state.count = count;
      state.error = null;
    },
    getDealRemFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getDealRem = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(dealRemSlice.actions.getDealRemRequest());

    try {
      const { data } = await axios.get(
        `${
          getState().user.crmEndpoint
        }&type=deal_reminder&filter=${filter}&email=${email}`
      );
      console.log(`deal Rem`, data);
      dispatch(
        dealRemSlice.actions.getDealRemSucess({
          count: data.data_count ?? 0,
          dealRem: data.data,
        })
      );
      dispatch(dealRemSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        dealRemSlice.actions.getDealRemFailed("Fetching Orders Rem  Failed")
      );
    }
  };
};

export const dealRemAction = dealRemSlice.actions;
export default dealRemSlice.reducer;
