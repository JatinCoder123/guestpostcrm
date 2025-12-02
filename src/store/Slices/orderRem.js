import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const orderRemSlice = createSlice({
  name: "orderRem",
  initialState: {
    loading: false,
    orderRem: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },
  reducers: {
    getOrderRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getOrderRemSucess(state, action) {
      const { count, orderRem, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.orderRem = orderRem;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.count = count;
      state.error = null;
    },
    getOrderRemFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getOrderRem = (email,page) => {
  return async (dispatch, getState) => {
    dispatch(orderRemSlice.actions.getOrderRemRequest());

    try {
      const { data } = await axios.get(
        `${
          getState().user.crmEndpoint
        }&type=all_reminders&filter=${getState().ladger.timeline}${email ? `&email=${email}`:""}&page=${page}&page_size=50`
      );
      console.log(`Orders Rem`, data);
      dispatch(
        orderRemSlice.actions.getOrderRemSucess({
          count: data.data_count ?? 0,
          orderRem: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(orderRemSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        orderRemSlice.actions.getOrderRemFailed("Fetching Orders Rem  Failed")
      );
    }
  };
};

export const orderRemAction = orderRemSlice.actions;
export default orderRemSlice.reducer;
