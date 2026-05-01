import { createSlice } from "@reduxjs/toolkit";
import { CREATE_DEAL_API_KEY } from "../constants";
import { getDomain, showConsole } from "../../assets/assets";
import { apiRequest } from "../../services/api";

const DraftInvoiceSlice = createSlice({
  name: "DraftInvoice",
  initialState: {
    loading: false,
    detection: [],
    count: 0,
    error: null,
  },

  reducers: {
    getDraftInvoiceRequest(state) {
      state.loading = true;
      state.error = null;
    },

    getDraftInvoiceSuccess(state, action) {
      state.detection = action.payload;
      state.count = action.payload.length;
      state.loading = false;
    },


    getDraftInvoiceFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const getDraftInvoice = () => {
  return async (dispatch, getState) => {
    dispatch(DraftInvoiceSlice.actions.getDraftInvoiceRequest());

    try {
      const { data } = await apiRequest({
        endpoint: `${getState().user.crmEndpoint.split('?')[0]}?entryPoint=get_post_all`,
        method: "POST",
        body:
        {
          "module": "outr_self_test",

        },
        params: { action_type: 'get_data' },
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CREATE_DEAL_API_KEY,
        },
      }

      );

      showConsole && console.log(" draftInvoice  data:", data);



      dispatch(
        DraftInvoiceSlice.actions.getDraftInvoiceSuccess(data)
      );


    } catch (error) {
      dispatch(
        DraftInvoiceSlice.actions.getDraftInvoiceFailed(
          error.response?.data?.message || "Fetching DraftInvoice Failed"
        )
      );
    }
  };
};

export default DraftInvoiceSlice.reducer;
