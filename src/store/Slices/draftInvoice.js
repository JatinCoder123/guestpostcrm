import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";

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
  return async (dispatch) => {
    dispatch(DraftInvoiceSlice.actions.getDraftInvoiceRequest());

    try {
      const { data } = await axios.post(
        "https://example.guestpostcrm.com/index.php?entryPoint=get_post_all&action_type=get_data",
      

        {
    "module": "outr_self_test",
   
},


        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CREATE_DEAL_API_KEY,
          },
        }
      );

      console.log(" draftInvoice  data:", data);

     

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
