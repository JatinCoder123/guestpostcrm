import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const paymentRemSlice = createSlice({
  name: "paymentRem",
  initialState: {
    loading: false,
    paymentRem: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },
  reducers: {
    getPaymentRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getPaymentRemSucess(state, action) {
      const { count, paymentRem, pageIndex, pageCount } = action.payload;
      state.loading = false;
      state.paymentRem = paymentRem;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.count = count;
      state.error = null;
    },
    getPaymentRemFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getPaymentRem = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(paymentRemSlice.actions.getPaymentRemRequest());

    try {
      const { data } = await axios.get(
        `${
          getState().user.crmEndpoint
        }&type=payment_reminder&filter=${filter}&email=${email}&page=1&page_size=50`
      );
      console.log(`Payments Rem`, data);
      dispatch(
        paymentRemSlice.actions.getPaymentRemSucess({
          count: data.data_count ?? 0,
          paymentRem: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(paymentRemSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        paymentRemSlice.actions.getPaymentRemFailed(
          "Fetching Orders Rem  Failed"
        )
      );
    }
  };
};

export const paymentRemAction = paymentRemSlice.actions;
export default paymentRemSlice.reducer;
