import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

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
      state.count = 0;
      state.invoices = [];
      state.error = null;
    },
    getInvoicesSucess(state, action) {
      const { count, invoices } = action.payload;
      state.loading = true;
      state.invoices = invoices;
      state.count = count;
      state.error = null;
    },
    getInvoicesFailed(state, action) {
      state.loading = false;
      state.invoices = [];
      state.count = 0;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getInvoices = (filter, email) => {
  return async (dispatch) => {
    dispatch(invoicesSlice.actions.getInvoicesRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=get_invoices&filter=${filter}&email=${email}`
      );
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
