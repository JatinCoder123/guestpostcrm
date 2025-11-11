import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const unansweredSlice = createSlice({
  name: "unanswered",
  initialState: {
    loading: false,
    emails: [],
    count: 0,
    error: null,
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.count = 0;
      state.emails = [];
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails } = action.payload;
      state.loading = true;
      state.emails = emails;
      state.count = count;
      state.error = null;
    },
    getEmailFailed(state, action) {
      state.loading = false;
      state.emails = [];
      state.count = 0;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getUnansweredEmails = (filter, email) => {
  return async (dispatch) => {
    dispatch(unansweredSlice.actions.getEmailRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=unanswered&filter=${filter}&email=${email}`
      );
      console.log("Unanswered Emails", data);
      dispatch(
        unansweredSlice.actions.getEmailSucess({
          count: data.data_count,
          emails: data.data,
        })
      );
      dispatch(unansweredSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        unansweredSlice.actions.getEmailFailed(
          "Fetching Unreplied Emails Failed"
        )
      );
    }
  };
};

export const unansweredAction = unansweredSlice.actions;
export default unansweredSlice.reducer;
