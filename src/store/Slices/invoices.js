import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const invoicesSlice = createSlice({
  name: "invoices",
  initialState: {
    loading: false,
    creating: false, // ✅ Add creating state
    invoices: [],
    count: 0,
    error: null,
    message: null, // ✅ Add success message state
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
    // ✅ Add create invoice reducers
    createInvoiceRequest(state) {
      state.creating = true;
      state.error = null;
      state.message = null;
    },
    createInvoiceSuccess(state, action) {
      state.creating = false;
      state.message = action.payload;
      state.error = null;
    },
    createInvoiceFailed(state, action) {
      state.creating = false;
      state.error = action.payload;
      state.message = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    // ✅ Add clear messages reducer
    clearAllMessages(state) {
      state.message = null;
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

// ✅ ADD THIS CREATE INVOICE ACTION
export const createInvoice = (formData) => {
  return async (dispatch, getState) => {
    dispatch(invoicesSlice.actions.createInvoiceRequest());

    try {
      const response = await axios.post(
        `${getState().user.crmEndpoint}&type=create_invoice`,
        formData
      );
      
      const data = response.data;
      
      if (data.success) {
        dispatch(invoicesSlice.actions.createInvoiceSuccess("Invoice created successfully!"));
        // Optional: Refresh invoices list after creation
        // dispatch(getInvoices("all"));
      } else {
        dispatch(invoicesSlice.actions.createInvoiceFailed(data.message || "Failed to create invoice"));
      }
    } catch (error) {
      dispatch(invoicesSlice.actions.createInvoiceFailed("Network error: Failed to create invoice"));
    }
  };
};

export const invoicesAction = invoicesSlice.actions;
export default invoicesSlice.reducer;