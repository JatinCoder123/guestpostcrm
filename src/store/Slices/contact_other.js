import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";

const contactOtherSlice = createSlice({
  name: "contact_other",
  initialState: {
    loading: false,
    detection: [],   // <-- keep the same name as your page uses
    count: 0,
    error: null,
  },

  reducers: {
    getContactsRequest(state) {
      state.loading = true;
      state.error = null;
    },

    getContactsSuccess(state, action) {
      state.detection = action.payload.contacts; // <-- SAME VARIABLE NAME
      state.count = action.payload.contacts.length;
      state.loading = false;
    },

    getContactsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const getContacts = () => {
  return async (dispatch, getState) => {
    dispatch(contactOtherSlice.actions.getContactsRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=get_data`,
        {
          module: "Contacts",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CREATE_DEAL_API_KEY,   // <-- FIXED HERE
          },
        }
      );

      console.log("Contact_other data:", data);

      console.log("Contact_other data:");
      console.log("Contact_other data:", data);

      dispatch(
        contactOtherSlice.actions.getContactsSuccess({
          contacts: data,
        })
      );

    } catch (error) {
      dispatch(
        contactOtherSlice.actions.getContactsFailed(
          error.response?.data?.message || "Fetching Contacts Failed"
        )
      );
    }
  };
};

export default contactOtherSlice.reducer;
