import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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

export const getUnansweredEmails = (filter, email) => {
  return async (dispatch ,getState) => {
    dispatch(unansweredSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint}&type=unanswered&filter=${filter}&email=${email}`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint}&type=unanswered&filter=${filter}`
        );
      }

      console.log(`Unanswered emails`, response.data);
      const data = response.data;
      dispatch(
        unansweredSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
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
