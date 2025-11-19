import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const dealRemSlice = createSlice({
  name: "dealRem",
  initialState: {
    loading: false,
    dealRem: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },
  reducers: {
    getDealRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDealRemSucess(state, action) {
      const { count, dealRem, pageIndex, pageCount } = action.payload;
      state.loading = false;
      state.dealRem = dealRem;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
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
        }&type=deal_reminder&filter=${filter}&email=${email}&page=1&page_size=50`
      );
      console.log(`deal Rem`, data);
      dispatch(
        dealRemSlice.actions.getDealRemSucess({
          count: data.data_count ?? 0,
          dealRem: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(dealRemSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        dealRemSlice.actions.getDealRemFailed("Fetching deal Rem  Failed")
      );
    }
  };
};

export const dealRemAction = dealRemSlice.actions;
export default dealRemSlice.reducer;
