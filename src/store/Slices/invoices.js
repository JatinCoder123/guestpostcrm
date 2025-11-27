import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const invoicesSlice = createSlice({
  name: "invoices",
  initialState: {
    loading: false,
    creating: false,
    invoices: [],
    count: 0,
    error: null,
    pageCount: 1,
    pageIndex: 1,
    message: null,
  },
  reducers: {
    getInvoicesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getInvoicesSucess(state, action) {
      const { count, invoices, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.invoices = invoices;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.count = count;
      state.error = null;
    },
    getInvoicesFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
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
          count: data.data.length ?? 0,
          invoices: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
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

// ✅ UPDATED CREATE INVOICE ACTION
export const createInvoice = (formData) => {
  console.log("📝 Form Data:", formData);

  return async (dispatch, getState) => {
    dispatch(invoicesSlice.actions.createInvoiceRequest());

    try {
      const params = new URLSearchParams();

      // Basic fields
      params.append("email", formData.email || "");
      params.append("name", formData.name || "");
      params.append("quantity", formData.quantity || "1");
      params.append("value", formData.value || "0");

      // Handle array fields
      if (formData.from_url) {
        const fromUrls = formData.from_url
          .split(/[\n,]/)
          .filter((url) => url.trim());
        fromUrls.forEach((url) => {
          params.append("from[]", url.trim());
        });
      }

      if (formData.to_url) {
        const toUrls = formData.to_url
          .split(/[\n,]/)
          .filter((url) => url.trim());
        toUrls.forEach((url) => {
          params.append("to[]", url.trim());
        });
      }

      if (formData.anchor_url) {
        const anchorUrls = formData.anchor_url
          .split(/[\n,]/)
          .filter((url) => url.trim());
        anchorUrls.forEach((url) => {
          params.append("anchor[]", url.trim());
        });
      }

      // ✅ USE PROXY URL
      const apiUrl = `/api/index.php?entryPoint=get_invoice&${params.toString()}`;

      const response = await axios.get(apiUrl);

      const data = response.data;

      if (typeof data === "string" && data.includes("window.open")) {
        const urlMatch = data.match(/window\.open\('([^']+)'/);
        if (urlMatch && urlMatch[1]) {
          const invoiceUrl = urlMatch[1];

          
          window.open(invoiceUrl, '_blank');
          
        }
      }

      dispatch(
        invoicesSlice.actions.createInvoiceSuccess(
          "Invoice created successfully!"
        )
      );
    } catch (error) {
      console.error("❌ Error:", error);
      dispatch(
        invoicesSlice.actions.createInvoiceFailed(
          "Network error: Failed to create invoice"
        )
      );
    }
  };
};

export const invoicesAction = invoicesSlice.actions;
export default invoicesSlice.reducer;
