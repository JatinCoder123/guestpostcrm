import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const invoicesSlice = createSlice({
  name: "invoices",
  initialState: {
    loading: false,
    invoices: [],
    count: 0,
    error: null,
  },
  reducers: {
    getInvoicesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getInvoicesSucess(state, action) {
      const { count, invoices } = action.payload;
      state.loading = false;
      state.invoices = invoices;
      state.count = count;
      state.error = null;
    },
    getInvoicesFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getInvoices = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(invoicesSlice.actions.getInvoicesRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=get_invoices&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=get_invoices&filter=${filter}&page=1&page_size=50`
        );
      }
      const data = response.data;
      console.log(`invoices`, data);
      dispatch(
        invoicesSlice.actions.getInvoicesSucess({
          count: data.data_count ?? 0,
          invoices: data.data,
        })
      );
      dispatch(invoicesSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        invoicesSlice.actions.getInvoicesFailed("Fetching Invoices  Failed")
      );
    }
  };
};

export const invoicesAction = invoicesSlice.actions;
export default invoicesSlice.reducer;
