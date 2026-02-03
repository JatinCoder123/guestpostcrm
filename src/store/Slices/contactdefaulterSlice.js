import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { showConsole } from "../../assets/assets";

const contactdefaulterSlice = createSlice({
  name: "contactdefaulter",
  initialState: {
    loading: false,
    detection: [],
    count: 0,
    error: null,
  },

  reducers: {
    getContactDefaulterRequest(state) {
      state.loading = true;
      state.error = null;
    },

    getContactDefaulterSuccess(state, action) {
      state.detection = action.payload.contacts;
      state.count = action.payload.contacts.length;
      state.loading = false;
    },

    getContactDefaulterFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const getContactDefaulters = () => {
  return async (dispatch, getState) => {
    dispatch(contactdefaulterSlice.actions.getContactDefaulterRequest());

    const { crmEndpoint } = getState().user;

    try {
      const { data } = await axios.post(
        `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,


        {
          "module": "Contacts",
          "where": {
            "stage": "defaulter"
          },
        },


        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CREATE_DEAL_API_KEY,
          },
        }
      );

      showConsole && console.log(" defaulter Contact data:", data);

      dispatch(
        contactdefaulterSlice.actions.getContactDefaulterSuccess({
          contacts: data,
        })
      );

    } catch (error) {
      dispatch(
        contactdefaulterSlice.actions.getContactDefaulterFailed(
          error.response?.data?.message || "Fetching Defaulters Failed"
        )
      );
    }
  };
};

export default contactdefaulterSlice.reducer;
