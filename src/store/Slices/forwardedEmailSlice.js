import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const forwardedSlice = createSlice({
  name: "forwarded",
  initialState: {
    loading: false,
    emails: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.emails = emails;
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
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

export const getForwardedEmails = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(forwardedSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=forwarded&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=forwarded&filter=${filter}&page=1&page_size=50`
        );
      }

      console.log(`forwarded emails`, response.data);
      const data = response.data;
      dispatch(
        forwardedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(forwardedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        forwardedSlice.actions.getEmailFailed(
          "Fetching Forwarded Emails Failed"
        )
      );
    }
  };
};

export const forwardedAction = forwardedSlice.actions;
export default forwardedSlice.reducer;
