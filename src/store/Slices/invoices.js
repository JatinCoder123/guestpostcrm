import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";

const invoicesSlice = createSlice({
  name: "invoices",
  initialState: {
    loading: false,
    creating: false,
    invoices: [],
    count: 0,
    summary: null,
    error: null,
    pageCount: 1,
    pageIndex: 1,
    message: null,
  },
  reducers: {
    getInvoicesRequest(state) {
      state.loading = true;
      // state.invoices = [];
      state.error = null;
    },
    getInvoicesSucess(state, action) {
      const { count, invoices, pageCount, pageIndex, summary } = action.payload;
      state.loading = false;
      state.invoices = invoices;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.count = count;
      state.summary = summary;
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
    updateInvoiceRequest(state) {
      state.updating = true;
      state.message = null;
      state.error = null;
    },
    updateInvoiceSuccess(state, action) {
      state.updating = false;
      state.message = action.payload.message;
      state.invoices = action.payload.invoices;
      state.error = null;
    },
    updateInvoiceFailed(state, action) {
      state.updating = false;
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

export const getInvoices = ({ email = null, page = 1, loading = true }) => {
  return async (dispatch, getState) => {
    if (loading) dispatch(invoicesSlice.actions.getInvoicesRequest());
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_invoices${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&email=${email ?? getState().ladger.email}&page=${page}&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_invoices${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50`
        );
      }
      const data = response.data;
      console.log(`invoices`, data);
      dispatch(
        invoicesSlice.actions.getInvoicesSucess({
          count: data.data_count ?? 0,
          invoices: data.data ?? [],
          summary: data.summary ?? null,
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

export const updateInvoice = (invoice) => {
  return async (dispatch, getState) => {
    dispatch(invoicesSlice.actions.updateInvoiceRequest());

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        {
          parent_bean: {
            module: "outr_paypal_invoice_links",
            ...invoice,
          },
        },
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "aplication/json",
          },
        }
      );
      console.log(`Update Invoice`, data);
      const updatedInvoices = getState().invoices.invoices.map((i) => {
        if (i.id === invoice.id) {
          return invoice;
        }
        return i;
      });
      dispatch(
        invoicesSlice.actions.updateInvoiceSuccess({ invoices: updatedInvoices, message: "Invoice Updated Successfully" })
      );

      dispatch(invoicesSlice.actions.clearAllErrors());
    } catch (error) {
      console.error("❌ Error:", error);
      dispatch(
        invoicesSlice.actions.updateInvoiceFailed("Updating Invoice Failed")
      );
    }
  };
};

export const invoicesAction = invoicesSlice.actions;
export default invoicesSlice.reducer;
