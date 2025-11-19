import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const forwardedSlice = createSlice({
  name: "forwarded",
  initialState: {
    loading: false,
    emails: [],
    count: 0,
    error: null,
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails } = action.payload;
      state.loading = false;
      state.emails = emails;
      state.count = count;
      state.error = null;
    },
    getEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getforwardedEmails = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(forwardedSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=unanswered&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=unanswered&filter=${filter}&page=1&page_size=50`
        );
      }

      console.log(`forwarded emails`, response.data);
      const data = response.data;
      dispatch(
        forwardedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
        })
      );
      dispatch(forwardedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        forwardedSlice.actions.getEmailFailed(
          "Fetching Unreplied Emails Failed"
        )
      );
    }
  };
};

export const forwardedAction = forwardedSlice.actions;
export default forwardedSlice.reducer;
